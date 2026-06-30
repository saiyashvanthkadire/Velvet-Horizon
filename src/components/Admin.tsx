import React, { useState, useEffect } from 'react';
import { 
  Calendar, MapPin, DollarSign, Plus, Trash2, ArrowLeft, 
  ShieldAlert, CheckCircle, Ticket, ShoppingBag, GraduationCap, 
  BookOpen, Clock, Tag, Image, Award, Eye, Sparkles, X, Info, Bell 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  getCustomEvents, addCustomEvent, deleteCustomEvent,
  getAdminLessonsFromDb, deleteAdminLessonFromDb 
} from '../lib/api';
import { TourDate, MerchItem } from '../types';

interface AdminProps {
  setCurrentTab: (tab: string) => void;
  merchItems?: MerchItem[];
  setMerchItems?: React.Dispatch<React.SetStateAction<MerchItem[]>>;
  tutorialClasses?: any[];
  setTutorialClasses?: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function Admin({ 
  setCurrentTab, 
  merchItems = [], 
  setMerchItems, 
  tutorialClasses = [], 
  setTutorialClasses 
}: AdminProps) {
  // Navigation inside Admin Panel
  const [adminTab, setAdminTab] = useState<'tour' | 'merch' | 'lessons'>('tour');
  const [lessonsSubTab, setLessonsSubTab] = useState<'bookings' | 'courses'>('bookings');

  // Shared alerts
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // --- Toast System ---
  interface ToastItem {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
    category?: 'tour' | 'merch' | 'lessons' | 'general';
    createdAt: number;
  }

  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (
    message: string, 
    type: 'success' | 'error' | 'info' | 'warning' = 'success', 
    title?: string,
    category?: 'tour' | 'merch' | 'lessons' | 'general'
  ) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    
    // Auto-detect title and category from message text if not provided
    let finalTitle = title;
    let finalCategory = category;
    
    if (!finalTitle) {
      if (type === 'error') {
        finalTitle = 'System Error';
      } else if (type === 'warning') {
        finalTitle = 'System Warning';
      } else {
        finalTitle = 'Notification';
      }
    }
    
    if (!finalCategory) {
      const msgLower = message.toLowerCase();
      if (msgLower.includes('concert') || msgLower.includes('tour') || msgLower.includes('show') || msgLower.includes('event')) {
        finalCategory = 'tour';
        if (!title && type === 'success') finalTitle = 'Tour Event Scheduled';
      } else if (msgLower.includes('merch') || msgLower.includes('product') || msgLower.includes('catalog') || msgLower.includes('inventory')) {
        finalCategory = 'merch';
        if (!title && type === 'success') finalTitle = 'Merch Catalog Updated';
      } else if (msgLower.includes('lesson') || msgLower.includes('course') || msgLower.includes('booking') || msgLower.includes('syllabus') || msgLower.includes('masterclass')) {
        finalCategory = 'lessons';
        if (!title && type === 'success') finalTitle = 'Learning Hub Updated';
      } else {
        finalCategory = 'general';
      }
    }

    const newToast: ToastItem = {
      id,
      type,
      title: finalTitle,
      message,
      category: finalCategory,
      createdAt: Date.now()
    };

    setToasts(prev => [newToast, ...prev]);

    // Auto-dismiss after 6 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 6000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // --- TAB 1: Tour Dates States ---
  const [events, setEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [pickerDate, setPickerDate] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [month, setMonth] = useState('JAN');
  const [day, setDay] = useState('01');
  const [year, setYear] = useState('2026');
  const [dayOfWeek, setDayOfWeek] = useState('SUNDAY');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('USA');
  const [ticketStatus, setTicketStatus] = useState<'Available' | 'Selling Fast' | 'Sold Out'>('Available');
  const [price, setPrice] = useState(50);

  // --- TAB 2: Merch Store States ---
  const [merchName, setMerchName] = useState('');
  const [merchPrice, setMerchPrice] = useState(25);
  const [merchCategory, setMerchCategory] = useState<'apparel' | 'music' | 'accessories'>('apparel');
  const [merchImage, setMerchImage] = useState('');
  const [merchDesc, setMerchDesc] = useState('');
  const [merchStock, setMerchStock] = useState(50);
  const [merchSizes, setMerchSizes] = useState('S, M, L, XL');
  const [merchRating, setMerchRating] = useState(5.0);
  const [merchIsFeatured, setMerchIsFeatured] = useState(false);

  // --- TAB 3: Learning Hub States ---
  const [studentBookings, setStudentBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Course Form States
  const [courseTitle, setCourseTitle] = useState('');
  const [courseTutor, setCourseTutor] = useState('Julian Vance');
  const [courseLevel, setCourseLevel] = useState<'Beginner' | 'Intermediate' | 'Masterclass'>('Intermediate');
  const [courseDuration, setCourseDuration] = useState('1h 45m');
  const [courseLessonsCount, setCourseLessonsCount] = useState(6);
  const [courseDesc, setCourseDesc] = useState('');
  const [courseImage, setCourseImage] = useState('');

  // Trigger load on tab switches
  useEffect(() => {
    if (adminTab === 'tour') {
      loadEvents();
    } else if (adminTab === 'lessons' && lessonsSubTab === 'bookings') {
      loadBookings();
    }
  }, [adminTab, lessonsSubTab]);

  const triggerAlert = (success: string, error: string, customTitle?: string, category?: 'tour' | 'merch' | 'lessons' | 'general') => {
    if (success) {
      setSuccessMsg(success);
      setErrorMsg('');
      addToast(success, 'success', customTitle, category);
      setTimeout(() => setSuccessMsg(''), 5000);
    }
    if (error) {
      setErrorMsg(error);
      setSuccessMsg('');
      addToast(error, 'error', customTitle, category);
      setTimeout(() => setErrorMsg(''), 5000);
    }
  };

  // --- LOADERS ---
  const loadEvents = async () => {
    try {
      setLoadingEvents(true);
      const data = await getCustomEvents();
      setEvents(data);
    } catch (err: any) {
      console.error('Error loading custom events:', err);
    } finally {
      setLoadingEvents(false);
    }
  };

  const loadBookings = async () => {
    try {
      setLoadingBookings(true);
      const data = await getAdminLessonsFromDb();
      setStudentBookings(data);
    } catch (err: any) {
      console.error('Error loading lesson bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  // --- TOUR EVENTS SUBMISSIONS ---
  const handleDateChange = (dateVal: string) => {
    setPickerDate(dateVal);
    if (!dateVal) return;
    
    const parts = dateVal.split('-');
    if (parts.length !== 3) return;
    
    const yr = parts[0];
    const mo = parseInt(parts[1]) - 1;
    const dy = parseInt(parts[2]);
    
    const parsedDate = new Date(parseInt(yr), mo, dy);
    
    const monthsShort = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const monthsFull = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const daysOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

    const mShort = monthsShort[parsedDate.getMonth()];
    const mFull = monthsFull[parsedDate.getMonth()];
    const dOfWeek = daysOfWeek[parsedDate.getDay()];
    const dayStr = parsedDate.getDate().toString().padStart(2, '0');

    setMonth(mShort);
    setDay(dayStr);
    setYear(yr);
    setDayOfWeek(dOfWeek);
    setDateStr(`${mFull} ${dayStr}`);
  };

  const handleTourSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!venue || !city || !country || !dateStr) {
      triggerAlert('', 'Please fill in all tour event fields.', 'Missing Fields', 'tour');
      return;
    }

    try {
      const payload = {
        date: dateStr,
        month,
        day,
        year,
        dayOfWeek,
        venue,
        city,
        country,
        ticketStatus,
        price,
      };

      await addCustomEvent(payload);
      triggerAlert('Successfully added new concert tour event!', '', 'Concert Scheduled', 'tour');
      
      // Reset form
      setPickerDate('');
      setDateStr('');
      setVenue('');
      setCity('');
      setCountry('USA');
      setTicketStatus('Available');
      setPrice(50);

      loadEvents();
    } catch (err: any) {
      triggerAlert('', err.message || 'Failed to save concert event.', 'Database Error', 'tour');
    }
  };

  const handleTourDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await deleteCustomEvent(id);
      triggerAlert('Concert event deleted successfully.', '', 'Concert Removed', 'tour');
      loadEvents();
    } catch (err: any) {
      triggerAlert('', err.message || 'Failed to delete concert event.', 'Delete Error', 'tour');
    }
  };

  // --- MERCH SUBMISSIONS ---
  const handleMerchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchName || !merchDesc) {
      triggerAlert('', 'Please fill in product name and description.', 'Missing Info', 'merch');
      return;
    }

    if (!setMerchItems) {
      triggerAlert('', 'Inventory manager not linked.', 'Catalog Error', 'merch');
      return;
    }

    const defaultImages = {
      apparel: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600",
      music: "https://images.unsplash.com/photo-1539628399213-d648278a4425?auto=format&fit=crop&q=80&w=600",
      accessories: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600"
    };

    const finalImage = merchImage.trim() || defaultImages[merchCategory];
    const finalSizes = merchCategory === 'apparel' && merchSizes.trim()
      ? merchSizes.split(',').map(s => s.trim())
      : undefined;

    const newItem: MerchItem = {
      id: 'merch-' + Date.now(),
      name: merchName,
      price: Number(merchPrice) || 0,
      category: merchCategory,
      imageUrl: finalImage,
      description: merchDesc,
      sizes: finalSizes,
      rating: Number(merchRating) || 5.0,
      stock: Number(merchStock) || 0,
      isFeatured: merchIsFeatured
    };

    setMerchItems(prev => [newItem, ...prev]);
    triggerAlert(`Successfully added ${newItem.name} to the merch store!`, '', 'Merch Added', 'merch');

    // Reset Form
    setMerchName('');
    setMerchPrice(25);
    setMerchCategory('apparel');
    setMerchImage('');
    setMerchDesc('');
    setMerchStock(50);
    setMerchSizes('S, M, L, XL');
    setMerchRating(5.0);
    setMerchIsFeatured(false);
  };

  const handleMerchDelete = (id: string) => {
    if (!confirm('Are you sure you want to remove this merchandise product?')) return;
    if (!setMerchItems) return;

    setMerchItems(prev => prev.filter(item => item.id !== id));
    triggerAlert('Merchandise removed successfully.', '', 'Merch Removed', 'merch');
  };

  // --- LESSONS/LEARNING SUBMISSIONS ---
  const handleBookingCancel = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this student lesson booking? This acts directly on the PostgreSQL database.')) return;
    try {
      await deleteAdminLessonFromDb(id);
      triggerAlert('Student lesson booking cancelled and removed successfully.', '', 'Booking Cancelled', 'lessons');
      loadBookings();
    } catch (err: any) {
      triggerAlert('', err.message || 'Failed to cancel lesson booking.', 'Cancellation Failed', 'lessons');
    }
  };

  const handleCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle || !courseDesc) {
      triggerAlert('', 'Please fill in course title and syllabus description.', 'Missing Details', 'lessons');
      return;
    }

    if (!setTutorialClasses) {
      triggerAlert('', 'Tutorial registry not linked.', 'Registry Error', 'lessons');
      return;
    }

    const defaultCourseImages = [
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600"
    ];

    const randomDefaultImage = defaultCourseImages[Math.floor(Math.random() * defaultCourseImages.length)];
    const finalImage = courseImage.trim() || randomDefaultImage;

    const newCourse = {
      id: 'class-' + Date.now(),
      title: courseTitle,
      tutorName: courseTutor,
      duration: courseDuration,
      level: courseLevel,
      description: courseDesc,
      videoPlaceholderUrl: finalImage,
      lessonsCount: Number(courseLessonsCount) || 1
    };

    setTutorialClasses(prev => [newCourse, ...prev]);
    triggerAlert(`Successfully created new course "${newCourse.title}"!`, '', 'Syllabus Published', 'lessons');

    // Reset Form
    setCourseTitle('');
    setCourseTutor('Julian Vance');
    setCourseLevel('Intermediate');
    setCourseDuration('1h 45m');
    setCourseLessonsCount(6);
    setCourseDesc('');
    setCourseImage('');
  };

  const handleCourseDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this masterclass course?')) return;
    if (!setTutorialClasses) return;

    setTutorialClasses(prev => prev.filter(c => c.id !== id));
    triggerAlert('Masterclass course deleted successfully.', '', 'Course Removed', 'lessons');
  };

  return (
    <div id="admin-panel-root" className="min-h-screen bg-[#FDFBF7] dark:bg-[#0B0F19] text-[#3D3A35] dark:text-neutral-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-6 gap-4" id="admin-header">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#BC6C25] dark:text-[#F59E0B] font-bold">Velvet Horizon</span>
            <h1 className="font-serif text-3xl font-semibold mt-1">Admin Command Center</h1>
          </div>
          <button
            onClick={() => setCurrentTab('home')}
            id="admin-back-home-btn"
            className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-[#BC6C25] bg-white dark:bg-[#111625] text-xs font-mono font-bold tracking-wider uppercase cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-all self-start sm:self-center"
          >
            <ArrowLeft className="w-4 h-4" /> Exit Admin
          </button>
        </div>

        {/* Dynamic Admin Subsections Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-4" id="admin-navigation-tabs">
          <button
            onClick={() => { setAdminTab('tour'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              adminTab === 'tour'
                ? 'bg-[#4A5D4E] dark:bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-[#111625] text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50'
            }`}
          >
            <Ticket className="w-4 h-4" /> Tour Dates
          </button>
          
          <button
            onClick={() => { setAdminTab('merch'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              adminTab === 'merch'
                ? 'bg-[#4A5D4E] dark:bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-[#111625] text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50'
            }`}
          >
            <ShoppingBag className="w-4 h-4" /> Merch Store
          </button>

          <button
            onClick={() => { setAdminTab('lessons'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              adminTab === 'lessons'
                ? 'bg-[#4A5D4E] dark:bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-[#111625] text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50'
            }`}
          >
            <GraduationCap className="w-4 h-4" /> Learning Hub
          </button>
        </div>

        {/* Security Warning Panel */}
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/40 dark:border-amber-900/40 flex items-start gap-3 text-left" id="admin-security-banner">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-mono font-bold tracking-wider uppercase text-amber-800 dark:text-amber-500">
              {adminTab === 'tour' && "Tour Dates Live Database Engine"}
              {adminTab === 'merch' && "Dynamic Inventory Management Engine"}
              {adminTab === 'lessons' && "Lesson & Tutorial Dynamic Syllabus"}
            </h4>
            <p className="text-xs text-amber-700/80 dark:text-neutral-300 mt-1">
              {adminTab === 'tour' && "You are editing the live PostgreSQL database. Event schedules added or removed here immediately update the main Tour page."}
              {adminTab === 'merch' && "Changes here update the live shopping inventory. Products created here support size configurations, stock indicators, and real-time carts."}
              {adminTab === 'lessons' && "Monitor real student lesson slots recorded in the database, or create new interactive Masterclass Courses available in the student lab."}
            </p>
          </div>
        </div>

        {/* Status Messages */}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/40 dark:border-emerald-900/40 flex items-center gap-3 text-left animate-fade-in" id="admin-success-alert">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
            <p className="text-xs text-emerald-800 dark:text-emerald-300">{successMsg}</p>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200/40 dark:border-rose-900/40 flex items-center gap-3 text-left animate-fade-in" id="admin-error-alert">
            <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-500" />
            <p className="text-xs text-rose-800 dark:text-rose-300">{errorMsg}</p>
          </div>
        )}

        {/* --- RENDERING TAB 1: TOUR DATES --- */}
        {adminTab === 'tour' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="admin-tour-view">
            
            {/* Add Event Form Card */}
            <div className="lg:col-span-5 p-6 sm:p-8 rounded-[28px] border border-neutral-200/60 dark:border-neutral-800/60 bg-white dark:bg-[#111625]" id="admin-add-event-card">
              <h2 className="font-serif text-xl font-semibold mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#BC6C25] dark:text-[#F59E0B]" />
                Schedule New Show
              </h2>

              <form onSubmit={handleTourSubmit} className="space-y-5 text-left" id="admin-event-form">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-bold mb-2">Concert Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={pickerDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#181F30] focus:border-[#BC6C25] focus:ring-1 focus:ring-[#BC6C25] transition-all text-sm font-mono text-neutral-800 dark:text-neutral-200"
                    />
                    <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-neutral-400" />
                  </div>
                </div>

                {pickerDate && (
                  <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-[#F9F6F2] dark:bg-[#1E2638]/20 border border-[#E5DED4]/40 dark:border-[#1E2638]/40 font-mono text-xs">
                    <div>
                      <span className="text-neutral-400 text-[9px] uppercase tracking-wider font-bold">Month / Day</span>
                      <p className="text-[#BC6C25] dark:text-[#F59E0B] font-bold mt-0.5">{month} - {day}</p>
                    </div>
                    <div>
                      <span className="text-neutral-400 text-[9px] uppercase tracking-wider font-bold">Day of Week</span>
                      <p className="text-[#BC6C25] dark:text-[#F59E0B] font-bold mt-0.5">{dayOfWeek}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-neutral-400 text-[9px] uppercase tracking-wider font-bold">Label String</span>
                      <p className="text-neutral-700 dark:text-neutral-300 font-bold mt-0.5">{dateStr}, {year}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-bold mb-2">Venue Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Madison Square Garden"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#181F30] focus:border-[#BC6C25] focus:ring-1 focus:ring-[#BC6C25] transition-all text-sm text-neutral-800 dark:text-neutral-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-bold mb-2">City</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. New York, NY"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#181F30] focus:border-[#BC6C25] focus:ring-1 focus:ring-[#BC6C25] transition-all text-sm text-neutral-800 dark:text-neutral-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-bold mb-2">Country</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. USA"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#181F30] focus:border-[#BC6C25] focus:ring-1 focus:ring-[#BC6C25] transition-all text-sm text-neutral-800 dark:text-neutral-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-bold mb-2">Ticket Status</label>
                    <select
                      value={ticketStatus}
                      onChange={(e) => setTicketStatus(e.target.value as any)}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#181F30] focus:border-[#BC6C25] focus:ring-1 focus:ring-[#BC6C25] transition-all text-sm cursor-pointer text-neutral-800 dark:text-neutral-200"
                    >
                      <option value="Available">Available</option>
                      <option value="Selling Fast">Selling Fast</option>
                      <option value="Sold Out">Sold Out</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-bold mb-2">Base Price ($)</label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        min="1"
                        value={price}
                        onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                        className="w-full pl-9 pr-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#181F30] focus:border-[#BC6C25] focus:ring-1 focus:ring-[#BC6C25] transition-all text-sm font-mono text-neutral-800 dark:text-neutral-200"
                      />
                      <DollarSign className="absolute left-3 top-3.5 w-4 h-4 text-neutral-400" />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  id="admin-add-show-submit-btn"
                  className="w-full py-3.5 rounded-xl bg-[#BC6C25] hover:bg-[#A3591E] dark:bg-[#F59E0B] dark:hover:bg-[#D97706] text-white dark:text-neutral-950 font-mono font-bold tracking-wider uppercase cursor-pointer transition-all shadow-sm flex items-center justify-center gap-2 mt-4"
                >
                  <Plus className="w-4 h-4" /> Create Concert Event
                </button>
              </form>
            </div>

            {/* List custom events */}
            <div className="lg:col-span-7 flex flex-col space-y-6" id="admin-manage-events-card">
              <div className="p-6 sm:p-8 rounded-[28px] border border-neutral-200/60 dark:border-neutral-800/60 bg-white dark:bg-[#111625] flex-1 flex flex-col">
                <h2 className="font-serif text-xl font-semibold mb-6 flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-[#BC6C25] dark:text-[#F59E0B]" />
                  Live Dynamic Events ({events.length})
                </h2>

                {loadingEvents ? (
                  <div className="flex-1 flex items-center justify-center py-12" id="admin-events-loading">
                    <div className="w-6 h-6 border-2 border-t-[#BC6C25] dark:border-t-[#F59E0B] border-neutral-200 dark:border-neutral-800 rounded-full animate-spin"></div>
                  </div>
                ) : events.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-12 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl bg-neutral-50/50 dark:bg-[#181F30]/20" id="admin-no-events">
                    <Calendar className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mb-2" />
                    <p className="font-serif text-sm text-neutral-500 dark:text-neutral-400">No dynamic database events found.</p>
                    <p className="text-xs text-neutral-400 mt-1 max-w-xs">Use the left panel to populate custom shows.</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto max-h-[500px] space-y-3 pr-1" id="admin-custom-events-list">
                    {events.map((evt) => (
                      <div
                        key={evt.id}
                        className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800/60 bg-[#FDFBF7] dark:bg-[#181F30]/40 flex items-center justify-between text-left"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#BC6C25] dark:text-[#F59E0B]">
                              {evt.date}, {evt.year}
                            </span>
                            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              evt.ticketStatus === 'Sold Out'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                                : evt.ticketStatus === 'Selling Fast'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            }`}>
                              {evt.ticketStatus}
                            </span>
                          </div>
                          <h4 className="font-serif text-sm font-semibold text-neutral-800 dark:text-neutral-100">{evt.venue}</h4>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" /> {evt.city}, {evt.country}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-semibold text-neutral-700 dark:text-neutral-300">${evt.price}</span>
                          <button
                            onClick={() => handleTourDelete(evt.id)}
                            className="p-2 rounded-xl text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer transition-all"
                            title="Delete Event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- RENDERING TAB 2: MERCH STORE --- */}
        {adminTab === 'merch' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in" id="admin-merch-view">
            
            {/* Left Column: Form Card */}
            <div className="lg:col-span-5 p-6 sm:p-8 rounded-[28px] border border-neutral-200/60 dark:border-neutral-800/60 bg-white dark:bg-[#111625]" id="admin-add-merch-card">
              <h2 className="font-serif text-xl font-semibold mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#BC6C25] dark:text-[#F59E0B]" />
                Add Merch Product
              </h2>

              <form onSubmit={handleMerchSubmit} className="space-y-4 text-left" id="admin-merch-form">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-bold mb-1.5">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Silk Horizon Tour Tee"
                    value={merchName}
                    onChange={(e) => setMerchName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#181F30] focus:border-[#BC6C25] focus:ring-1 focus:ring-[#BC6C25] transition-all text-sm text-neutral-800 dark:text-neutral-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-bold mb-1.5">Category</label>
                    <select
                      value={merchCategory}
                      onChange={(e) => setMerchCategory(e.target.value as any)}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#181F30] focus:border-[#BC6C25] focus:ring-1 focus:ring-[#BC6C25] transition-all text-sm cursor-pointer text-neutral-800 dark:text-neutral-200"
                    >
                      <option value="apparel">Apparel</option>
                      <option value="music">Vinyl & Tapes</option>
                      <option value="accessories">Accessories</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-bold mb-1.5">Price ($ USD)</label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        min="1"
                        value={merchPrice}
                        onChange={(e) => setMerchPrice(parseInt(e.target.value) || 0)}
                        className="w-full pl-9 pr-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#181F30] focus:border-[#BC6C25] focus:ring-1 focus:ring-[#BC6C25] transition-all text-sm font-mono text-neutral-800 dark:text-neutral-200"
                      />
                      <DollarSign className="absolute left-3 top-3.5 w-4 h-4 text-neutral-400" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-bold mb-1.5">Stock Count</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={merchStock}
                      onChange={(e) => setMerchStock(parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#181F30] focus:border-[#BC6C25] focus:ring-1 focus:ring-[#BC6C25] transition-all text-sm font-mono text-neutral-800 dark:text-neutral-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-bold mb-1.5">Mock Rating (1-5)</label>
                    <input
                      type="number"
                      required
                      step="0.1"
                      min="1"
                      max="5"
                      value={merchRating}
                      onChange={(e) => setMerchRating(parseFloat(e.target.value) || 5.0)}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#181F30] focus:border-[#BC6C25] focus:ring-1 focus:ring-[#BC6C25] transition-all text-sm font-mono text-neutral-800 dark:text-neutral-200"
                    />
                  </div>
                </div>

                {merchCategory === 'apparel' && (
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-bold mb-1.5">Sizes (Comma-separated)</label>
                    <input
                      type="text"
                      placeholder="S, M, L, XL"
                      value={merchSizes}
                      onChange={(e) => setMerchSizes(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#181F30] focus:border-[#BC6C25] focus:ring-1 focus:ring-[#BC6C25] transition-all text-xs font-mono text-neutral-800 dark:text-neutral-200"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-bold mb-1.5">Custom Image URL (Optional)</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Leave blank for a clean placeholder"
                      value={merchImage}
                      onChange={(e) => setMerchImage(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#181F30] focus:border-[#BC6C25] focus:ring-1 focus:ring-[#BC6C25] transition-all text-xs text-neutral-800 dark:text-neutral-200"
                    />
                    <Image className="absolute left-3 top-3.5 w-4 h-4 text-neutral-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-bold mb-1.5">Product Description</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe material, print specs, or audio formats..."
                    value={merchDesc}
                    onChange={(e) => setMerchDesc(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#181F30] focus:border-[#BC6C25] focus:ring-1 focus:ring-[#BC6C25] transition-all text-sm text-neutral-800 dark:text-neutral-200 resize-none"
                  />
                </div>

                <div className="flex items-center gap-2 py-2">
                  <input
                    type="checkbox"
                    id="merchIsFeatured"
                    checked={merchIsFeatured}
                    onChange={(e) => setMerchIsFeatured(e.target.checked)}
                    className="w-4 h-4 text-[#BC6C25] focus:ring-[#BC6C25] border-neutral-300 rounded cursor-pointer"
                  />
                  <label htmlFor="merchIsFeatured" className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 cursor-pointer">
                    Highlight as Featured Item
                  </label>
                </div>

                <button
                  type="submit"
                  id="admin-add-merch-submit-btn"
                  className="w-full py-3.5 rounded-xl bg-[#BC6C25] hover:bg-[#A3591E] dark:bg-[#F59E0B] dark:hover:bg-[#D97706] text-white dark:text-neutral-950 font-mono font-bold tracking-wider uppercase cursor-pointer transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add to Catalog
                </button>
              </form>
            </div>

            {/* Right Column: Manage Products list */}
            <div className="lg:col-span-7 flex flex-col space-y-6" id="admin-merch-catalog-card">
              <div className="p-6 sm:p-8 rounded-[28px] border border-neutral-200/60 dark:border-neutral-800/60 bg-white dark:bg-[#111625] flex-1 flex flex-col">
                <h2 className="font-serif text-xl font-semibold mb-6 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#BC6C25] dark:text-[#F59E0B]" />
                  Active Catalog ({merchItems.length} Products)
                </h2>

                {merchItems.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-12 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl bg-neutral-50/50 dark:bg-[#181F30]/20">
                    <ShoppingBag className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mb-2" />
                    <p className="font-serif text-sm text-neutral-500 dark:text-neutral-400">Inventory is empty.</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto max-h-[560px] space-y-3 pr-1" id="admin-merch-items-list">
                    {merchItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800/60 bg-[#FDFBF7] dark:bg-[#181F30]/40 flex items-center gap-4 text-left justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            className="w-12 h-12 rounded-xl object-cover border border-neutral-200 dark:border-neutral-800" 
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-serif text-sm font-semibold text-neutral-800 dark:text-neutral-100 line-clamp-1">{item.name}</h4>
                              {item.isFeatured && (
                                <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-[8px] font-mono uppercase px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 shrink-0">
                                  <Sparkles className="w-2 h-2" /> Featured
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500 dark:text-neutral-400 font-bold">
                              <span className="uppercase text-[#BC6C25] dark:text-[#F59E0B]">{item.category}</span>
                              <span>•</span>
                              <span>Stock: {item.stock} units</span>
                              {item.sizes && item.sizes.length > 0 && (
                                <>
                                  <span>•</span>
                                  <span>Sizes: {item.sizes.join(', ')}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-bold text-neutral-700 dark:text-neutral-300 shrink-0">${item.price}</span>
                          <button
                            onClick={() => handleMerchDelete(item.id)}
                            className="p-2 rounded-xl text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer transition-all shrink-0"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- RENDERING TAB 3: LEARNING HUB --- */}
        {adminTab === 'lessons' && (
          <div className="space-y-6 animate-fade-in" id="admin-learning-view">
            
            {/* Learning Hub Sub Navigation */}
            <div className="flex gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-2" id="admin-learning-sub-tabs">
              <button
                onClick={() => setLessonsSubTab('bookings')}
                className={`pb-2 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer border-b-2 ${
                  lessonsSubTab === 'bookings'
                    ? 'border-[#BC6C25] dark:border-[#F59E0B] text-[#BC6C25] dark:text-[#F59E0B]'
                    : 'border-transparent text-neutral-400 hover:text-neutral-600'
                }`}
              >
                1-on-1 Student Bookings (PostgreSQL)
              </button>
              <button
                onClick={() => setLessonsSubTab('courses')}
                className={`pb-2 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer border-b-2 ${
                  lessonsSubTab === 'courses'
                    ? 'border-[#BC6C25] dark:border-[#F59E0B] text-[#BC6C25] dark:text-[#F59E0B]'
                    : 'border-transparent text-neutral-400 hover:text-neutral-600'
                }`}
              >
                Online Masterclass Courses (Dynamic)
              </button>
            </div>

            {/* Subtab 1: Student Bookings */}
            {lessonsSubTab === 'bookings' && (
              <div className="p-6 sm:p-8 rounded-[28px] border border-neutral-200/60 dark:border-neutral-800/60 bg-white dark:bg-[#111625]" id="admin-lesson-bookings-list-container">
                <h2 className="font-serif text-xl font-semibold mb-6 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#BC6C25] dark:text-[#F59E0B]" />
                  Active Tutoring Registrations ({studentBookings.length} Bookings)
                </h2>

                {loadingBookings ? (
                  <div className="flex items-center justify-center py-20" id="admin-bookings-loading">
                    <div className="w-6 h-6 border-2 border-t-[#BC6C25] dark:border-t-[#F59E0B] border-neutral-200 dark:border-neutral-800 rounded-full animate-spin"></div>
                  </div>
                ) : studentBookings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-16 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl bg-neutral-50/50 dark:bg-[#181F30]/20">
                    <BookOpen className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mb-2" />
                    <p className="font-serif text-sm text-neutral-500 dark:text-neutral-400">No student bookings recorded in PostgreSQL.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto" id="admin-bookings-table-wrapper">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-neutral-200 dark:border-neutral-800 text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-bold">
                          <th className="py-3 px-4">Booking ID</th>
                          <th className="py-3 px-4">Student</th>
                          <th className="py-3 px-4">Course/Tutor</th>
                          <th className="py-3 px-4">Session Date & Time</th>
                          <th className="py-3 px-4">Amount</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentBookings.map((b) => (
                          <tr key={b.id} className="border-b border-neutral-100 dark:border-neutral-800/40 hover:bg-neutral-50/40 dark:hover:bg-neutral-900/10">
                            <td className="py-3 px-4 font-mono font-bold text-neutral-400">
                              #{b.id}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-medium text-neutral-800 dark:text-neutral-200">{b.studentName}</div>
                              <div className="text-neutral-400 font-mono text-[10px]">{b.studentEmail}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-medium text-[#BC6C25] dark:text-[#F59E0B]">{b.instrument}</div>
                              <div className="text-neutral-400">Tutor: {b.tutorName}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-neutral-400" /> {b.date}</div>
                              <div className="flex items-center gap-1 text-neutral-400 mt-0.5"><Clock className="w-3.5 h-3.5 text-neutral-400" /> {b.timeSlot}</div>
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-neutral-800 dark:text-neutral-200">
                              ${b.totalPrice}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => handleBookingCancel(b.id)}
                                className="p-2 rounded-xl text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer transition-all"
                                title="Cancel and Delete Booking"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Subtab 2: Dynamic Masterclass Courses */}
            {lessonsSubTab === 'courses' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="admin-courses-subtab-container">
                
                {/* Form to add masterclass */}
                <div className="lg:col-span-5 p-6 sm:p-8 rounded-[28px] border border-neutral-200/60 dark:border-neutral-800/60 bg-white dark:bg-[#111625]" id="admin-create-course-card">
                  <h2 className="font-serif text-xl font-semibold mb-6 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-[#BC6C25] dark:text-[#F59E0B]" />
                    Create Course
                  </h2>

                  <form onSubmit={handleCourseSubmit} className="space-y-4 text-left" id="admin-course-form">
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-bold mb-1.5">Course Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Vintage Reverbs & Plate Echoes"
                        value={courseTitle}
                        onChange={(e) => setCourseTitle(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#181F30] focus:border-[#BC6C25] focus:ring-1 focus:ring-[#BC6C25] transition-all text-sm text-neutral-800 dark:text-neutral-200"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-bold mb-1.5">Tutor</label>
                        <select
                          value={courseTutor}
                          onChange={(e) => setCourseTutor(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#181F30] focus:border-[#BC6C25] focus:ring-1 focus:ring-[#BC6C25] transition-all text-sm cursor-pointer text-neutral-800 dark:text-neutral-200"
                        >
                          <option value="Julian Vance">Julian Vance</option>
                          <option value="Elena Rostova">Elena Rostova</option>
                          <option value="Marcus &quot;Rex&quot; Thorn">Marcus Rex Thorn</option>
                          <option value="Chloe Mercer">Chloe Mercer</option>
                          <option value="Sienna Brooks">Sienna Brooks</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-bold mb-1.5">Skill Level</label>
                        <select
                          value={courseLevel}
                          onChange={(e) => setCourseLevel(e.target.value as any)}
                          className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#181F30] focus:border-[#BC6C25] focus:ring-1 focus:ring-[#BC6C25] transition-all text-sm cursor-pointer text-neutral-800 dark:text-neutral-200"
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Masterclass">Masterclass</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-bold mb-1.5">Course Duration</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 1h 45m"
                          value={courseDuration}
                          onChange={(e) => setCourseDuration(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#181F30] focus:border-[#BC6C25] focus:ring-1 focus:ring-[#BC6C25] transition-all text-sm text-neutral-800 dark:text-neutral-200"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-bold mb-1.5">Video Syllabus Steps</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={courseLessonsCount}
                          onChange={(e) => setCourseLessonsCount(parseInt(e.target.value) || 1)}
                          className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#181F30] focus:border-[#BC6C25] focus:ring-1 focus:ring-[#BC6C25] transition-all text-sm font-mono text-neutral-800 dark:text-neutral-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-bold mb-1.5">Cover Image URL (Optional)</label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="e.g. https://images.unsplash.com/..."
                          value={courseImage}
                          onChange={(e) => setCourseImage(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#181F30] focus:border-[#BC6C25] focus:ring-1 focus:ring-[#BC6C25] transition-all text-xs text-neutral-800 dark:text-neutral-200"
                        />
                        <Image className="absolute left-3 top-3.5 w-4 h-4 text-neutral-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-bold mb-1.5">Syllabus Overview / Summary</label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Detail modular synthesizers, physical modeling, delay stacking..."
                        value={courseDesc}
                        onChange={(e) => setCourseDesc(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#181F30] focus:border-[#BC6C25] focus:ring-1 focus:ring-[#BC6C25] transition-all text-sm text-neutral-800 dark:text-neutral-200 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      id="admin-add-course-submit-btn"
                      className="w-full py-3.5 rounded-xl bg-[#BC6C25] hover:bg-[#A3591E] dark:bg-[#F59E0B] dark:hover:bg-[#D97706] text-white dark:text-neutral-950 font-mono font-bold tracking-wider uppercase cursor-pointer transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Publish Course
                    </button>
                  </form>
                </div>

                {/* Course List */}
                <div className="lg:col-span-7 flex flex-col space-y-6" id="admin-courses-list-card">
                  <div className="p-6 sm:p-8 rounded-[28px] border border-neutral-200/60 dark:border-neutral-800/60 bg-white dark:bg-[#111625] flex-1 flex flex-col">
                    <h2 className="font-serif text-xl font-semibold mb-6 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-[#BC6C25] dark:text-[#F59E0B]" />
                      Active Syllabus Courses ({tutorialClasses.length} Courses)
                    </h2>

                    <div className="flex-1 overflow-y-auto max-h-[560px] space-y-3 pr-1" id="admin-courses-items-list">
                      {tutorialClasses.map((c) => (
                        <div
                          key={c.id}
                          className="p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800/60 bg-[#FDFBF7] dark:bg-[#181F30]/40 flex items-center gap-4 text-left justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <img 
                              src={c.videoPlaceholderUrl} 
                              alt={c.title} 
                              className="w-12 h-12 rounded-xl object-cover border border-neutral-200 dark:border-neutral-800 shrink-0" 
                            />
                            <div>
                              <h4 className="font-serif text-sm font-semibold text-neutral-800 dark:text-neutral-100 line-clamp-1">{c.title}</h4>
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] font-mono text-neutral-500 dark:text-neutral-400 font-bold">
                                <span className="text-[#BC6C25] dark:text-[#F59E0B]">{c.level}</span>
                                <span>•</span>
                                <span>Tutor: {c.tutorName}</span>
                                <span>•</span>
                                <span>Syllabus: {c.lessonsCount} lessons</span>
                                <span>•</span>
                                <span className="flex items-center gap-0.5"><Clock className="w-3 h-3 text-neutral-400" /> {c.duration}</span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleCourseDelete(c.id)}
                            className="p-2 rounded-xl text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer transition-all shrink-0"
                            title="Delete Course"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

      </div>

      {/* Toast Notification Container */}
      <div 
        id="admin-toasts-container" 
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-full max-w-sm px-4 sm:px-0 pointer-events-none"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => {
            // Pick corresponding icon
            let IconComponent = Bell;
            let iconColorClass = "text-amber-500 bg-amber-50 dark:bg-amber-950/30";
            let borderColorClass = "border-neutral-200/80 dark:border-neutral-800/80";
            
            if (toast.type === 'error') {
              IconComponent = ShieldAlert;
              iconColorClass = "text-rose-600 bg-rose-50 dark:bg-rose-950/30";
            } else if (toast.category === 'tour') {
              IconComponent = Ticket;
              iconColorClass = "text-[#BC6C25] bg-[#BC6C25]/10 dark:text-[#F59E0B] dark:bg-[#F59E0B]/10";
            } else if (toast.category === 'merch') {
              IconComponent = ShoppingBag;
              iconColorClass = "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30";
            } else if (toast.category === 'lessons') {
              IconComponent = GraduationCap;
              iconColorClass = "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30";
            } else if (toast.type === 'success') {
              IconComponent = CheckCircle;
              iconColorClass = "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30";
            }

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.2 } }}
                className={`pointer-events-auto relative overflow-hidden bg-white/95 dark:bg-[#111625]/95 backdrop-blur-md shadow-xl border ${borderColorClass} rounded-2xl p-4 flex gap-3 text-left`}
                role="alert"
              >
                {/* Visual Icon */}
                <div className={`p-2.5 rounded-xl h-10 w-10 flex items-center justify-center shrink-0 ${iconColorClass}`}>
                  <IconComponent className="w-5 h-5" />
                </div>

                {/* Content details */}
                <div className="flex-1 pr-6">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-100">
                    {toast.title}
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                    {toast.message}
                  </p>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => removeToast(toast.id)}
                  className="absolute top-3 right-3 p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 cursor-pointer transition-all"
                  title="Close Alert"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {/* Micro Progress Bar timer */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-100 dark:bg-neutral-800/40">
                  <motion.div 
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 6, ease: "linear" }}
                    className={`h-full ${
                      toast.type === 'error' 
                        ? 'bg-rose-500' 
                        : toast.category === 'tour' 
                        ? 'bg-[#BC6C25] dark:bg-[#F59E0B]' 
                        : toast.category === 'merch' 
                        ? 'bg-emerald-500' 
                        : toast.category === 'lessons' 
                        ? 'bg-blue-500' 
                        : 'bg-[#BC6C25] dark:bg-[#F59E0B]'
                    }`}
                  />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
