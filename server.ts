import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/db/index.ts';
import { users, purchasedTickets, lessonBookings, blogComments, blogLikes, cartItems, favoritedTracks, blogPosts, tourDates } from './src/db/schema.ts';
import { getOrCreateUser } from './src/db/users.ts';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { eq, and, desc } from 'drizzle-orm';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // 1. Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', database: 'connected' });
  });

  // Helper to ensure user exists in the local PostgreSQL database using DecodedIdToken
  async function resolveLocalUser(req: AuthRequest) {
    if (!req.user) {
      throw new Error('Unauthorized');
    }
    const { uid, email, name, picture } = req.user;
    const localUser = await getOrCreateUser(uid, email || '', name, picture);
    return localUser;
  }

  // 2. Auth synchronization endpoint
  app.post('/api/auth/sync', requireAuth, async (req: AuthRequest, res) => {
    try {
      const localUser = await resolveLocalUser(req);
      res.json({ success: true, user: localUser });
    } catch (error: any) {
      console.error('Error synchronizing auth:', error);
      res.status(500).json({ error: error.message || 'Synchronization failed' });
    }
  });

  // 3. Blog endpoints
  // Fetch custom user-submitted blog posts from PostgreSQL
  app.get('/api/blog/posts', async (req, res) => {
    try {
      const posts = await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
      res.json(posts);
    } catch (error: any) {
      console.error('Error fetching blog posts:', error);
      res.status(500).json({ error: 'Failed to retrieve blog posts' });
    }
  });

  // Share/Save a new blog post
  app.post('/api/blog/posts', requireAuth, async (req: AuthRequest, res) => {
    const { title, content, summary, category, imageUrl } = req.body;
    if (!title || !content || !summary || !category || !imageUrl) {
      return res.status(400).json({ error: 'Missing required blog details' });
    }

    try {
      const localUser = await resolveLocalUser(req);
      const formattedDate = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });

      const readTimeVal = `${Math.max(1, Math.ceil(content.split(/\s+/).length / 200))} min read`;

      const [newPost] = await db.insert(blogPosts)
        .values({
          title,
          content,
          summary,
          category,
          imageUrl,
          readTime: readTimeVal,
          author: localUser.displayName || localUser.email.split('@')[0],
          date: formattedDate,
          userId: localUser.id,
        } as any)
        .returning();

      res.json(newPost);
    } catch (error: any) {
      console.error('Error sharing blog post:', error);
      res.status(500).json({ error: 'Failed to save blog post' });
    }
  });

  // Delete a blog post
  app.delete('/api/blog/posts/:id', async (req, res) => {
    try {
      const rawId = req.params.id;
      
      let dbPostIdStr = rawId;
      if (rawId.startsWith('dbpost-')) {
        dbPostIdStr = rawId.replace('dbpost-', '');
      }

      const postIdNum = parseInt(dbPostIdStr);
      if (isNaN(postIdNum)) {
        return res.status(400).json({ error: 'Invalid post ID' });
      }

      // Check if the post exists
      const [existingPost] = await db.select()
        .from(blogPosts)
        .where(eq(blogPosts.id, postIdNum));

      if (!existingPost) {
        return res.status(404).json({ error: 'Blog post not found' });
      }

      // Delete comments and likes where postId is the string identifier
      await db.delete(blogComments).where(eq(blogComments.postId, `dbpost-${postIdNum}`));
      await db.delete(blogLikes).where(eq(blogLikes.postId, `dbpost-${postIdNum}`));

      // Delete the post itself
      await db.delete(blogPosts).where(eq(blogPosts.id, postIdNum));

      res.json({ success: true, message: 'Blog post deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting blog post:', error);
      res.status(500).json({ error: 'Failed to delete blog post' });
    }
  });

  // Fetch real blog comments & likes for each post ID from PostgreSQL
  app.get('/api/blog/posts/stats', async (req, res) => {
    try {
      const comments = await db.select().from(blogComments);
      const likes = await db.select().from(blogLikes);
      res.json({ comments, likes });
    } catch (error: any) {
      console.error('Error getting blog stats:', error);
      res.status(500).json({ error: 'Failed to retrieve blog metrics' });
    }
  });

  // Post comment
  app.post('/api/blog/posts/:id/comments', requireAuth, async (req: AuthRequest, res) => {
    const { id: postId } = req.params;
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    try {
      const localUser = await resolveLocalUser(req);
      const formattedDate = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });

      const [newComment] = await db.insert(blogComments)
        .values({
          postId,
          userId: localUser.id,
          author: localUser.displayName || localUser.email.split('@')[0],
          content,
          date: formattedDate,
        } as any)
        .returning();

      res.json(newComment);
    } catch (error: any) {
      console.error('Error adding comment:', error);
      res.status(500).json({ error: 'Failed to submit comment' });
    }
  });

  // Toggle like
  app.post('/api/blog/posts/:id/like', requireAuth, async (req: AuthRequest, res) => {
    const { id: postId } = req.params;
    try {
      const localUser = await resolveLocalUser(req);
      
      const existing = await db.select().from(blogLikes)
        .where(
          and(
            eq(blogLikes.postId, postId),
            eq(blogLikes.userId, localUser.id)
          )
        );

      if (existing.length > 0) {
        // Dislike (delete)
        await db.delete(blogLikes)
          .where(
            and(
              eq(blogLikes.postId, postId),
              eq(blogLikes.userId, localUser.id)
            )
          );
        res.json({ liked: false });
      } else {
        // Like (insert)
        await db.insert(blogLikes).values({
          postId,
          userId: localUser.id,
        });
        res.json({ liked: true });
      }
    } catch (error: any) {
      console.error('Error toggling like:', error);
      res.status(500).json({ error: 'Failed to toggle like' });
    }
  });

  // 4. Ticket Booking Endpoints
  app.get('/api/tickets', requireAuth, async (req: AuthRequest, res) => {
    try {
      const localUser = await resolveLocalUser(req);
      const userTickets = await db.select().from(purchasedTickets)
        .where(eq(purchasedTickets.userId, localUser.id))
        .orderBy(desc(purchasedTickets.purchasedAt));
      res.json(userTickets);
    } catch (error: any) {
      console.error('Error loading tickets:', error);
      res.status(500).json({ error: 'Failed to load purchased tickets' });
    }
  });

  app.post('/api/tickets', requireAuth, async (req: AuthRequest, res) => {
    const { showId, venue, city, country, date, quantity, ticketType, totalPrice } = req.body;
    if (!showId || !venue || !quantity || !totalPrice) {
      return res.status(400).json({ error: 'Missing purchase details' });
    }

    try {
      const localUser = await resolveLocalUser(req);
      const [ticket] = await db.insert(purchasedTickets)
        .values({
          userId: localUser.id,
          showId,
          venue,
          city,
          country,
          date,
          quantity,
          ticketType,
          totalPrice,
        })
        .returning();

      res.json(ticket);
    } catch (error: any) {
      console.error('Error creating ticket:', error);
      res.status(500).json({ error: 'Failed to record purchase' });
    }
  });

  // 5. Lesson Booking Endpoints
  app.get('/api/lessons', requireAuth, async (req: AuthRequest, res) => {
    try {
      const localUser = await resolveLocalUser(req);
      const bookings = await db.select().from(lessonBookings)
        .where(eq(lessonBookings.userId, localUser.id))
        .orderBy(desc(lessonBookings.createdAt));
      res.json(bookings);
    } catch (error: any) {
      console.error('Error loading lessons:', error);
      res.status(500).json({ error: 'Failed to load bookings' });
    }
  });

  app.post('/api/lessons', requireAuth, async (req: AuthRequest, res) => {
    const { studentName, studentEmail, instrument, tutorName, date, timeSlot, totalPrice } = req.body;
    if (!studentName || !studentEmail || !instrument || !tutorName || !date || !timeSlot || !totalPrice) {
      return res.status(400).json({ error: 'Missing booking details' });
    }

    try {
      const localUser = await resolveLocalUser(req);
      const formattedBookingDate = new Date().toLocaleDateString('en-US');

      const [booking] = await db.insert(lessonBookings)
        .values({
          userId: localUser.id,
          studentName,
          studentEmail,
          instrument,
          tutorName,
          date,
          timeSlot,
          totalPrice,
          bookingDate: formattedBookingDate,
        })
        .returning();

      res.json(booking);
    } catch (error: any) {
      console.error('Error making lesson booking:', error);
      res.status(500).json({ error: 'Failed to record booking' });
    }
  });

  // 6. Shopping Cart Synchronization
  app.get('/api/cart', requireAuth, async (req: AuthRequest, res) => {
    try {
      const localUser = await resolveLocalUser(req);
      const items = await db.select().from(cartItems)
        .where(eq(cartItems.userId, localUser.id));
      res.json(items);
    } catch (error: any) {
      console.error('Error loading cart:', error);
      res.status(500).json({ error: 'Failed to load cart items' });
    }
  });

  app.post('/api/cart/sync', requireAuth, async (req: AuthRequest, res) => {
    const { items } = req.body; // Array of { id, merchId, quantity, selectedSize }
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Items array is required' });
    }

    try {
      const localUser = await resolveLocalUser(req);

      // Clear existing cart items for this user
      await db.delete(cartItems).where(eq(cartItems.userId, localUser.id));

      if (items.length > 0) {
        // Bulk insert new cart items
        await db.insert(cartItems).values(
          items.map(item => ({
            id: item.id,
            userId: localUser.id,
            merchId: item.merchItem.id,
            quantity: item.quantity,
            selectedSize: item.selectedSize || null,
          }))
        );
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error('Error synchronizing cart:', error);
      res.status(500).json({ error: 'Failed to sync cart' });
    }
  });

  // 7. Track Favorites Endpoints
  app.get('/api/favorites', requireAuth, async (req: AuthRequest, res) => {
    try {
      const localUser = await resolveLocalUser(req);
      const favs = await db.select().from(favoritedTracks)
        .where(eq(favoritedTracks.userId, localUser.id));
      res.json(favs);
    } catch (error: any) {
      console.error('Error loading favorites:', error);
      res.status(500).json({ error: 'Failed to load favorites' });
    }
  });

  app.post('/api/favorites/toggle', requireAuth, async (req: AuthRequest, res) => {
    const { trackId, albumId } = req.body;
    if (!trackId || !albumId) {
      return res.status(400).json({ error: 'Track and album IDs are required' });
    }

    try {
      const localUser = await resolveLocalUser(req);
      
      const existing = await db.select().from(favoritedTracks)
        .where(
          and(
            eq(favoritedTracks.userId, localUser.id),
            eq(favoritedTracks.trackId, trackId)
          )
        );

      if (existing.length > 0) {
        // Remove favorite
        await db.delete(favoritedTracks)
          .where(
            and(
              eq(favoritedTracks.userId, localUser.id),
              eq(favoritedTracks.trackId, trackId)
            )
          );
        res.json({ favorited: false });
      } else {
        // Add favorite
        await db.insert(favoritedTracks).values({
          userId: localUser.id,
          trackId,
          albumId,
        });
        res.json({ favorited: true });
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      res.status(500).json({ error: 'Failed to toggle favorite' });
    }
  });

  // 7.5. Custom Tour Dates / Events Endpoints
  app.get('/api/events', async (req, res) => {
    try {
      const dates = await db.select().from(tourDates).orderBy(desc(tourDates.createdAt));
      res.json(dates);
    } catch (error: any) {
      console.error('Error fetching custom tour dates:', error);
      res.status(500).json({ error: 'Failed to fetch tour dates' });
    }
  });

  app.post('/api/events', async (req, res) => {
    const { date, month, day, year, dayOfWeek, venue, city, country, ticketStatus, price } = req.body;
    if (!date || !month || !day || !year || !dayOfWeek || !venue || !city || !country || !ticketStatus || price === undefined) {
      return res.status(400).json({ error: 'Missing required tour date details' });
    }
    try {
      const [newDate] = await db.insert(tourDates)
        .values({
          date,
          month,
          day,
          year,
          dayOfWeek,
          venue,
          city,
          country,
          ticketStatus,
          price: parseFloat(price.toString()),
        })
         .returning();
      res.json(newDate);
    } catch (error: any) {
      console.error('Error creating custom tour date:', error);
      res.status(500).json({ error: 'Failed to save tour date' });
    }
  });

  app.delete('/api/events/:id', async (req, res) => {
    const { id } = req.params;
    const idNum = parseInt(id);
    if (isNaN(idNum)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    try {
      await db.delete(tourDates).where(eq(tourDates.id, idNum));
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting tour date:', error);
      res.status(500).json({ error: 'Failed to delete tour date' });
    }
  });

  // Admin Lesson Bookings - get all
  app.get('/api/admin/lessons', async (req, res) => {
    try {
      const bookings = await db.select().from(lessonBookings)
        .orderBy(desc(lessonBookings.createdAt));
      res.json(bookings);
    } catch (error: any) {
      console.error('Error loading all lessons for admin:', error);
      res.status(500).json({ error: 'Failed to load all lesson bookings' });
    }
  });

  // Admin Lesson Bookings - delete one
  app.delete('/api/admin/lessons/:id', async (req, res) => {
    const { id } = req.params;
    const idNum = parseInt(id);
    if (isNaN(idNum)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    try {
      await db.delete(lessonBookings).where(eq(lessonBookings.id, idNum));
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting lesson booking:', error);
      res.status(500).json({ error: 'Failed to delete lesson booking' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
