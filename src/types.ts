export interface Song {
  id: string;
  title: string;
  duration: string;
  trackNumber: number;
  plays: string;
}

export interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  hint: string;
  explanation: string;
}

export interface Album {
  id: string;
  title: string;
  releaseYear: number;
  coverUrl: string;
  description: string;
  tracks: Song[];
  triviaQuestions: TriviaQuestion[];
}

export interface MerchItem {
  id: string;
  name: string;
  price: number;
  category: 'apparel' | 'music' | 'accessories';
  imageUrl: string;
  description: string;
  sizes?: string[];
  rating: number;
  stock: number;
  isFeatured?: boolean;
}

export interface CartItem {
  id: string; // unique for item + size combo
  merchItem: MerchItem;
  quantity: number;
  selectedSize?: string;
}

export interface TourDate {
  id: string;
  date: string;
  month: string;
  day: string;
  year: string;
  dayOfWeek: string;
  venue: string;
  city: string;
  country: string;
  ticketStatus: 'Available' | 'Selling Fast' | 'Sold Out';
  price: number;
}

export interface BlogComment {
  id: string;
  author: string;
  content: string;
  date: string;
}

export interface BlogPost {
  id: string;
  title: string;
  date: string;
  category: string;
  summary: string;
  content: string;
  imageUrl: string;
  likes: number;
  comments: BlogComment[];
  readTime: string;
  author: string;
  userId?: number | string;
}

export interface LessonTutor {
  id: string;
  name: string;
  role: string;
  instrument: string;
  bio: string;
  imageUrl: string;
  pricePerHour: number;
  availableDays: string[]; // e.g. ["Monday", "Wednesday", "Friday"]
  availableSlots: string[]; // e.g. ["10:00 AM", "2:00 PM", "5:00 PM"]
}

export interface LessonBooking {
  id: string;
  studentName: string;
  studentEmail: string;
  instrument: string;
  tutorName: string;
  date: string;
  timeSlot: string;
  totalPrice: number;
  bookingDate: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'tickets' | 'merchandise' | 'lessons';
}

export interface SavedTicket {
  id: string;
  showId: string;
  venue: string;
  city: string;
  country: string;
  date: string;
  quantity: number;
  ticketType: string;
  totalPrice: number;
}

