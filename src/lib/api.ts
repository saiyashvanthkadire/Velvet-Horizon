import { CartItem, SavedTicket } from '../types';

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken() {
  return authToken;
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }
  
  headers.set('Content-Type', 'application/json');
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

// Auth synchronization
export async function syncAuthWithBackend() {
  if (!authToken) return null;
  return fetchWithAuth('/api/auth/sync', { method: 'POST' });
}

// Blog interactions
export async function getBlogStats() {
  try {
    const response = await fetch('/api/blog/posts/stats');
    if (!response.ok) throw new Error('Failed to fetch blog stats');
    return response.json();
  } catch (e) {
    console.error('Error fetching blog stats:', e);
    return { comments: [], likes: [] };
  }
}

export async function getCustomBlogPosts() {
  try {
    const response = await fetch('/api/blog/posts');
    if (!response.ok) throw new Error('Failed to fetch custom blog posts');
    return response.json();
  } catch (e) {
    console.error('Error fetching custom blog posts:', e);
    return [];
  }
}

export async function saveBlogPost(post: { title: string; content: string; summary: string; category: string; imageUrl: string }) {
  return fetchWithAuth('/api/blog/posts', {
    method: 'POST',
    body: JSON.stringify(post),
  });
}

export async function deleteBlogPost(postId: string) {
  return fetchWithAuth(`/api/blog/posts/${postId}`, {
    method: 'DELETE',
  });
}

export async function submitBlogComment(postId: string, content: string) {
  return fetchWithAuth(`/api/blog/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export async function toggleBlogLike(postId: string) {
  return fetchWithAuth(`/api/blog/posts/${postId}/like`, {
    method: 'POST',
  });
}

// Tickets
export async function getTicketsFromDb() {
  if (!authToken) return [];
  return fetchWithAuth('/api/tickets');
}

export async function saveTicketToDb(ticket: any) {
  if (!authToken) return null;
  return fetchWithAuth('/api/tickets', {
    method: 'POST',
    body: JSON.stringify(ticket),
  });
}

// Lessons
export async function getLessonsFromDb() {
  if (!authToken) return [];
  return fetchWithAuth('/api/lessons');
}

export async function saveLessonToDb(lesson: any) {
  if (!authToken) return null;
  return fetchWithAuth('/api/lessons', {
    method: 'POST',
    body: JSON.stringify(lesson),
  });
}

// Cart Sync
export async function syncCartWithDb(items: CartItem[]) {
  if (!authToken) return;
  return fetchWithAuth('/api/cart/sync', {
    method: 'POST',
    body: JSON.stringify({ items }),
  });
}

// Favorites Sync
export async function getFavoritesFromDb() {
  if (!authToken) return [];
  return fetchWithAuth('/api/favorites');
}

export async function toggleFavoriteInDb(trackId: string, albumId: string) {
  if (!authToken) return null;
  return fetchWithAuth('/api/favorites/toggle', {
    method: 'POST',
    body: JSON.stringify({ trackId, albumId }),
  });
}

// Custom Tour Dates / Events
export async function getCustomEvents() {
  try {
    const response = await fetch('/api/events');
    if (!response.ok) throw new Error('Failed to fetch events');
    return response.json();
  } catch (e) {
    console.error('Error fetching custom events:', e);
    return [];
  }
}

export async function addCustomEvent(event: any) {
  const response = await fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to add custom event');
  }
  return response.json();
}

export async function deleteCustomEvent(id: number) {
  const response = await fetch(`/api/events/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete custom event');
  }
  return response.json();
}

// Administrative Lessons
export async function getAdminLessonsFromDb() {
  const response = await fetch('/api/admin/lessons');
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch admin lessons');
  }
  return response.json();
}

export async function deleteAdminLessonFromDb(id: number) {
  const response = await fetch(`/api/admin/lessons/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete lesson booking');
  }
  return response.json();
}
