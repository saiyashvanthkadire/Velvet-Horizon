import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, doublePrecision } from 'drizzle-orm/pg-core';

// 1. Users table (mapped to Firebase Auth UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey().notNull(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  photoUrl: text('photo_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 2. Purchased/Saved Tickets
export const purchasedTickets = pgTable('purchased_tickets', {
  id: serial('id').primaryKey().notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  showId: text('show_id').notNull(),
  venue: text('venue').notNull(),
  city: text('city').notNull(),
  country: text('country').notNull(),
  date: text('date').notNull(),
  quantity: integer('quantity').notNull(),
  ticketType: text('ticket_type').notNull(),
  totalPrice: doublePrecision('total_price').notNull(),
  purchasedAt: timestamp('purchased_at').defaultNow(),
});

// 3. Lesson Bookings
export const lessonBookings = pgTable('lesson_bookings', {
  id: serial('id').primaryKey().notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  studentName: text('student_name').notNull(),
  studentEmail: text('student_email').notNull(),
  instrument: text('instrument').notNull(),
  tutorName: text('tutor_name').notNull(),
  date: text('date').notNull(),
  timeSlot: text('time_slot').notNull(),
  totalPrice: doublePrecision('total_price').notNull(),
  bookingDate: text('booking_date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 4. Blog Comments (Real dynamic comments!)
export const blogComments = pgTable('blog_comments', {
  id: serial('id').primaryKey().notNull(),
  postId: text('post_id').notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }), // nullable for anonymous/mock if needed
  author: text('author').notNull(),
  content: text('content').notNull(),
  date: text('date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 5. Blog Likes (Real dynamic likes!)
export const blogLikes = pgTable('blog_likes', {
  id: serial('id').primaryKey().notNull(),
  postId: text('post_id').notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 6. Shopping Cart Items
export const cartItems = pgTable('cart_items', {
  id: text('id').primaryKey().notNull(), // item + size combo
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  merchId: text('merch_id').notNull(),
  quantity: integer('quantity').notNull(),
  selectedSize: text('selected_size'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 7. Favorited Tracks
export const favoritedTracks = pgTable('favorited_tracks', {
  id: serial('id').primaryKey().notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  trackId: text('track_id').notNull(),
  albumId: text('album_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 8. Shared Blog Posts
export const blogPosts = pgTable('blog_posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  date: text('date').notNull(),
  category: text('category').notNull(),
  summary: text('summary').notNull(),
  content: text('content').notNull(),
  imageUrl: text('image_url').notNull(),
  readTime: text('read_time').notNull(),
  author: text('author').notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
});

// 9. Custom Tour Dates (Admin added events)
export const tourDates = pgTable('tour_dates', {
  id: serial('id').primaryKey().notNull(),
  date: text('date').notNull(),
  month: text('month').notNull(),
  day: text('day').notNull(),
  year: text('year').notNull(),
  dayOfWeek: text('day_of_week').notNull(),
  venue: text('venue').notNull(),
  city: text('city').notNull(),
  country: text('country').notNull(),
  ticketStatus: text('ticket_status').notNull(), // 'Available', 'Selling Fast', 'Sold Out'
  price: doublePrecision('price').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relationships
export const usersRelations = relations(users, ({ many }) => ({
  tickets: many(purchasedTickets),
  bookings: many(lessonBookings),
  comments: many(blogComments),
  likes: many(blogLikes),
  cart: many(cartItems),
  favorites: many(favoritedTracks),
  posts: many(blogPosts),
}));

export const blogPostsRelations = relations(blogPosts, ({ one }) => ({
  user: one(users, {
    fields: [blogPosts.userId],
    references: [users.id],
  }),
}));

export const purchasedTicketsRelations = relations(purchasedTickets, ({ one }) => ({
  user: one(users, {
    fields: [purchasedTickets.userId],
    references: [users.id],
  }),
}));

export const lessonBookingsRelations = relations(lessonBookings, ({ one }) => ({
  user: one(users, {
    fields: [lessonBookings.userId],
    references: [users.id],
  }),
}));

export const blogCommentsRelations = relations(blogComments, ({ one }) => ({
  user: one(users, {
    fields: [blogComments.userId],
    references: [users.id],
  }),
}));

export const blogLikesRelations = relations(blogLikes, ({ one }) => ({
  user: one(users, {
    fields: [blogLikes.userId],
    references: [users.id],
  }),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
}));

export const favoritedTracksRelations = relations(favoritedTracks, ({ one }) => ({
  user: one(users, {
    fields: [favoritedTracks.userId],
    references: [users.id],
  }),
}));
