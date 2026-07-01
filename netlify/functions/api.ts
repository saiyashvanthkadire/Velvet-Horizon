import express from 'express';
import serverless from 'serverless-http';
import { db } from '../../src/db/index.js';
import { users, purchasedTickets, lessonBookings, blogComments, blogLikes, cartItems, favoritedTracks, blogPosts, tourDates } from '../../src/db/schema.js';
import { getOrCreateUser } from '../../src/db/users.js';
import { requireAuth, AuthRequest } from '../../src/middleware/auth.js';
import { eq, and, desc } from 'drizzle-orm';

const app = express();
app.use(express.json());

// Helper to ensure user exists in the local PostgreSQL database
async function resolveLocalUser(req: AuthRequest) {
  if (!req.user) throw new Error('Unauthorized');
  const { uid, email, name, picture } = req.user;
  return getOrCreateUser(uid, email || '', name, picture);
}

// Auth sync
app.post('/api/auth/sync', requireAuth, async (req: AuthRequest, res) => {
  try {
    const localUser = await resolveLocalUser(req);
    res.json({ success: true, user: localUser });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Synchronization failed' });
  }
});

// Blog posts
app.get('/api/blog/posts', async (req, res) => {
  try {
    const posts = await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
    res.json(posts);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve blog posts' });
  }
});

app.post('/api/blog/posts', requireAuth, async (req: AuthRequest, res) => {
  const { title, content, summary, category, imageUrl } = req.body;
  if (!title || !content || !summary || !category || !imageUrl)
    return res.status(400).json({ error: 'Missing required blog details' });
  try {
    const localUser = await resolveLocalUser(req);
    const formattedDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const readTimeVal = `${Math.max(1, Math.ceil(content.split(/\s+/).length / 200))} min read`;
    const [newPost] = await db.insert(blogPosts)
      .values({ title, content, summary, category, imageUrl, readTime: readTimeVal, author: localUser.displayName || localUser.email.split('@')[0], date: formattedDate, userId: localUser.id } as any)
      .returning();
    res.json(newPost);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to save blog post' });
  }
});

app.delete('/api/blog/posts/:id', async (req, res) => {
  try {
    let dbPostIdStr = req.params.id.replace('dbpost-', '');
    const postIdNum = parseInt(dbPostIdStr);
    if (isNaN(postIdNum)) return res.status(400).json({ error: 'Invalid post ID' });
    const [existingPost] = await db.select().from(blogPosts).where(eq(blogPosts.id, postIdNum));
    if (!existingPost) return res.status(404).json({ error: 'Blog post not found' });
    await db.delete(blogComments).where(eq(blogComments.postId, `dbpost-${postIdNum}`));
    await db.delete(blogLikes).where(eq(blogLikes.postId, `dbpost-${postIdNum}`));
    await db.delete(blogPosts).where(eq(blogPosts.id, postIdNum));
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete blog post' });
  }
});

app.get('/api/blog/posts/stats', async (req, res) => {
  try {
    const comments = await db.select().from(blogComments);
    const likes = await db.select().from(blogLikes);
    res.json({ comments, likes });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve blog metrics' });
  }
});

app.post('/api/blog/posts/:id/comments', requireAuth, async (req: AuthRequest, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Content is required' });
  try {
    const localUser = await resolveLocalUser(req);
    const formattedDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const [newComment] = await db.insert(blogComments)
      .values({ postId: req.params.id, userId: localUser.id, author: localUser.displayName || localUser.email.split('@')[0], content, date: formattedDate } as any)
      .returning();
    res.json(newComment);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to submit comment' });
  }
});

app.post('/api/blog/posts/:id/like', requireAuth, async (req: AuthRequest, res) => {
  const postId = req.params.id;
  try {
    const localUser = await resolveLocalUser(req);
    const existing = await db.select().from(blogLikes).where(and(eq(blogLikes.postId, postId), eq(blogLikes.userId, localUser.id)));
    if (existing.length > 0) {
      await db.delete(blogLikes).where(and(eq(blogLikes.postId, postId), eq(blogLikes.userId, localUser.id)));
      res.json({ liked: false });
    } else {
      await db.insert(blogLikes).values({ postId, userId: localUser.id });
      res.json({ liked: true });
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// Tickets
app.get('/api/tickets', requireAuth, async (req: AuthRequest, res) => {
  try {
    const localUser = await resolveLocalUser(req);
    const userTickets = await db.select().from(purchasedTickets).where(eq(purchasedTickets.userId, localUser.id)).orderBy(desc(purchasedTickets.purchasedAt));
    res.json(userTickets);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to load purchased tickets' });
  }
});

app.post('/api/tickets', requireAuth, async (req: AuthRequest, res) => {
  const { showId, venue, city, country, date, quantity, ticketType, totalPrice } = req.body;
  if (!showId || !venue || !quantity || !totalPrice) return res.status(400).json({ error: 'Missing purchase details' });
  try {
    const localUser = await resolveLocalUser(req);
    const [ticket] = await db.insert(purchasedTickets).values({ userId: localUser.id, showId, venue, city, country, date, quantity, ticketType, totalPrice }).returning();
    res.json(ticket);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to record purchase' });
  }
});

// Lessons
app.get('/api/lessons', requireAuth, async (req: AuthRequest, res) => {
  try {
    const localUser = await resolveLocalUser(req);
    const bookings = await db.select().from(lessonBookings).where(eq(lessonBookings.userId, localUser.id)).orderBy(desc(lessonBookings.createdAt));
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to load bookings' });
  }
});

app.post('/api/lessons', requireAuth, async (req: AuthRequest, res) => {
  const { studentName, studentEmail, instrument, tutorName, date, timeSlot, totalPrice } = req.body;
  if (!studentName || !studentEmail || !instrument || !tutorName || !date || !timeSlot || !totalPrice)
    return res.status(400).json({ error: 'Missing booking details' });
  try {
    const localUser = await resolveLocalUser(req);
    const [booking] = await db.insert(lessonBookings)
      .values({ userId: localUser.id, studentName, studentEmail, instrument, tutorName, date, timeSlot, totalPrice, bookingDate: new Date().toLocaleDateString('en-US') })
      .returning();
    res.json(booking);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to record booking' });
  }
});

// Cart
app.get('/api/cart', requireAuth, async (req: AuthRequest, res) => {
  try {
    const localUser = await resolveLocalUser(req);
    const items = await db.select().from(cartItems).where(eq(cartItems.userId, localUser.id));
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to load cart items' });
  }
});

app.post('/api/cart/sync', requireAuth, async (req: AuthRequest, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) return res.status(400).json({ error: 'Items array is required' });
  try {
    const localUser = await resolveLocalUser(req);
    await db.delete(cartItems).where(eq(cartItems.userId, localUser.id));
    if (items.length > 0) {
      await db.insert(cartItems).values(items.map(item => ({ id: item.id, userId: localUser.id, merchId: item.merchItem.id, quantity: item.quantity, selectedSize: item.selectedSize || null })));
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to sync cart' });
  }
});

// Favorites
app.get('/api/favorites', requireAuth, async (req: AuthRequest, res) => {
  try {
    const localUser = await resolveLocalUser(req);
    const favs = await db.select().from(favoritedTracks).where(eq(favoritedTracks.userId, localUser.id));
    res.json(favs);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to load favorites' });
  }
});

app.post('/api/favorites/toggle', requireAuth, async (req: AuthRequest, res) => {
  const { trackId, albumId } = req.body;
  if (!trackId || !albumId) return res.status(400).json({ error: 'Track and album IDs are required' });
  try {
    const localUser = await resolveLocalUser(req);
    const existing = await db.select().from(favoritedTracks).where(and(eq(favoritedTracks.userId, localUser.id), eq(favoritedTracks.trackId, trackId)));
    if (existing.length > 0) {
      await db.delete(favoritedTracks).where(and(eq(favoritedTracks.userId, localUser.id), eq(favoritedTracks.trackId, trackId)));
      res.json({ favorited: false });
    } else {
      await db.insert(favoritedTracks).values({ userId: localUser.id, trackId, albumId });
      res.json({ favorited: true });
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to toggle favorite' });
  }
});

// Tour Events
app.get('/api/events', async (req, res) => {
  try {
    const dates = await db.select().from(tourDates).orderBy(desc(tourDates.createdAt));
    res.json(dates);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch tour dates' });
  }
});

app.post('/api/events', async (req, res) => {
  const { date, month, day, year, dayOfWeek, venue, city, country, ticketStatus, price } = req.body;
  if (!date || !month || !day || !year || !dayOfWeek || !venue || !city || !country || !ticketStatus || price === undefined)
    return res.status(400).json({ error: 'Missing required tour date details' });
  try {
    const [newDate] = await db.insert(tourDates).values({ date, month, day, year, dayOfWeek, venue, city, country, ticketStatus, price: parseFloat(price.toString()) }).returning();
    res.json(newDate);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to save tour date' });
  }
});

app.delete('/api/events/:id', async (req, res) => {
  const idNum = parseInt(req.params.id);
  if (isNaN(idNum)) return res.status(400).json({ error: 'Invalid ID' });
  try {
    await db.delete(tourDates).where(eq(tourDates.id, idNum));
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete tour date' });
  }
});

// Admin Lessons
app.get('/api/admin/lessons', async (req, res) => {
  try {
    const bookings = await db.select().from(lessonBookings).orderBy(desc(lessonBookings.createdAt));
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to load all lesson bookings' });
  }
});

app.delete('/api/admin/lessons/:id', async (req, res) => {
  const idNum = parseInt(req.params.id);
  if (isNaN(idNum)) return res.status(400).json({ error: 'Invalid ID' });
  try {
    await db.delete(lessonBookings).where(eq(lessonBookings.id, idNum));
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete lesson booking' });
  }
});

export const handler = serverless(app);
