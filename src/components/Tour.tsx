import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Ticket, X, CheckCircle, Smartphone, ArrowRight, Save, Heart, Search } from 'lucide-react';
import { TOUR_DATES } from '../data';
import { TourDate, SavedTicket } from '../types';
import { auth } from '../lib/firebase';
import { saveTicketToDb, getCustomEvents } from '../lib/api';

interface TourProps {
  savedTickets: SavedTicket[];
  setSavedTickets: React.Dispatch<React.SetStateAction<SavedTicket[]>>;
  currentUser: { name: string; email: string; tier: string } | null;
  setCurrentTab: (tab: string) => void;
}

export default function Tour({ savedTickets, setSavedTickets, currentUser, setCurrentTab }: TourProps) {
  const [regionFilter, setRegionFilter] = useState<'All' | 'USA' | 'Europe' | 'Japan'>('All');
  const [citySearch, setCitySearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [selectedShow, setSelectedShow] = useState<TourDate | null>(null);
  const [bookingStep, setBookingStep] = useState<'details' | 'confirmation'>('details');

  // Booking Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [ticketType, setTicketType] = useState<'General Admission' | 'VIP Backstage Premium'>('General Admission');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<{ id: string; barcodeText: string } | null>(null);
  
  // Track generated ticket structure and its local save state
  const [generatedTicket, setGeneratedTicket] = useState<SavedTicket | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const [customEvents, setCustomEvents] = useState<TourDate[]>([]);

  useEffect(() => {
    let active = true;
    getCustomEvents().then((data) => {
      if (active) {
        const formatted: TourDate[] = data.map((d: any) => ({
          ...d,
          id: d.id.toString(),
        }));
        setCustomEvents(formatted);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const allShows = [...customEvents, ...TOUR_DATES];

  const getShowDate = (show: TourDate) => {
    const monthsMap: Record<string, number> = {
      'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAY': 4, 'JUN': 5,
      'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
    };
    const monthIdx = monthsMap[show.month.toUpperCase()] ?? 0;
    return new Date(parseInt(show.year), monthIdx, parseInt(show.day));
  };

  // Filter lists based on region, city, and date
  const filteredShows = allShows.filter((show) => {
    // 1. Region Filter
    if (regionFilter !== 'All') {
      if (regionFilter === 'USA' && show.country !== 'USA') return false;
      if (regionFilter === 'Europe' && !['UK', 'Germany', 'France', 'Netherlands', 'Czech Republic'].includes(show.country)) return false;
      if (regionFilter === 'Japan' && show.country !== 'Japan') return false;
    }

    // 2. City Filter (Case-insensitive match on city)
    if (citySearch.trim() !== '') {
      const searchLower = citySearch.toLowerCase();
      if (!show.city.toLowerCase().includes(searchLower)) return false;
    }

    // 3. Month Filter
    if (selectedMonth !== 'All') {
      if (show.month.toUpperCase() !== selectedMonth.toUpperCase()) return false;
    }

    // 4. Date Filter (on or after selected date)
    if (filterStartDate) {
      const showDate = getShowDate(show);
      const filterDate = new Date(filterStartDate);
      // Reset hours to compare dates cleanly
      showDate.setHours(0, 0, 0, 0);
      filterDate.setHours(0, 0, 0, 0);
      if (showDate < filterDate) return false;
    }

    return true;
  });

  const openBookingModal = (show: TourDate) => {
    if (!currentUser) {
      alert('Please log in to purchase concert tickets.');
      setCurrentTab('login');
      return;
    }
    setSelectedShow(show);
    setBookingStep('details');
    setName('');
    setEmail('');
    setQuantity(1);
    setTicketType('General Admission');
    setPromoCode('');
    setPromoApplied(false);
    setCompletedBooking(null);
    setGeneratedTicket(null);
    setIsSaved(false);
  };

  const closeBookingModal = () => {
    setSelectedShow(null);
  };

  const applyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'VELVET20' || promoCode.trim().toUpperCase() === 'TRIVIA20') {
      setPromoApplied(true);
    } else {
      alert('Invalid Promo Code. Try solving a Discography trivia quiz to unlock an active code!');
    }
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      alert('Please fill out your name and email address.');
      return;
    }

    const uniqueBookingId = 'VH-' + Math.floor(100000 + Math.random() * 900000);
    const barcodeSecret = `*VH-${selectedShow?.id}-${quantity}-${ticketType.substring(0, 3).toUpperCase()}*`;

    // Create the ticket object but do NOT save immediately; let user click the Save button
    const newTicket: SavedTicket = {
      id: uniqueBookingId,
      showId: selectedShow?.id || '',
      venue: selectedShow?.venue || '',
      city: selectedShow?.city || '',
      country: selectedShow?.country || '',
      date: selectedShow ? `${selectedShow.month} ${selectedShow.day}, ${selectedShow.year}` : '',
      quantity,
      ticketType,
      totalPrice: getTotalPrice()
    };

    setGeneratedTicket(newTicket);
    setIsSaved(false);

    setCompletedBooking({
      id: uniqueBookingId,
      barcodeText: barcodeSecret
    });
    setBookingStep('confirmation');
  };

  const handleSaveToWallet = async () => {
    if (!generatedTicket) return;

    const savedTicketsStr = localStorage.getItem('vh_booked_tickets_v1');
    let existingTickets = [];
    if (savedTicketsStr) {
      try {
        existingTickets = JSON.parse(savedTicketsStr);
      } catch (err) {}
    }

    // Check duplicate
    if (existingTickets.some((t: any) => t.id === generatedTicket.id)) {
      setIsSaved(true);
      return;
    }

    // If logged in, save to Cloud SQL database
    if (auth.currentUser) {
      try {
        await saveTicketToDb({
          showId: generatedTicket.showId,
          venue: generatedTicket.venue,
          city: generatedTicket.city,
          country: generatedTicket.country,
          date: generatedTicket.date,
          quantity: generatedTicket.quantity,
          ticketType: generatedTicket.ticketType,
          totalPrice: generatedTicket.totalPrice
        });
      } catch (err) {
        console.error("Failed to save ticket booking to database:", err);
      }
    }

    const updated = [...existingTickets, generatedTicket];
    localStorage.setItem('vh_booked_tickets_v1', JSON.stringify(updated));
    setSavedTickets(updated);
    setIsSaved(true);
  };

  const getBasePrice = () => {
    if (!selectedShow) return 0;
    const base = selectedShow.price;
    return ticketType === 'VIP Backstage Premium' ? base + 75 : base;
  };

  const getTotalPrice = () => {
    const basePrice = getBasePrice();
    const subtotal = basePrice * quantity;
    const discounted = promoApplied ? subtotal * 0.8 : subtotal;
    return Math.round(discounted);
  };

  return (
    <div className="space-y-12 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-[#F9F6F2] dark:bg-[#0A0D14] text-[#3D3A35] dark:text-[#E2E8F0]" id="tour-dates-page">
      {/* Page Header */}
      <div className="text-center max-w-xl mx-auto space-y-3 pt-6" id="tour-intro">
        <span className="font-mono text-xs text-[#BC6C25] dark:text-[#F59E0B] tracking-widest block uppercase font-bold">WORLDWIDE CONCERTS</span>
        <h1 className="font-serif font-bold text-3xl md:text-5xl text-[#4A5D4E] dark:text-emerald-400 tracking-tight">Elysian Fields Tour</h1>
        <p className="font-serif text-[#6B655C] dark:text-[#94A3B8] text-sm italic">
          "Catch us live on stage as we showcase our physical soundboards, customized analog delays, and organic light show designs."
        </p>
      </div>

      {/* Filter and Status Indicators Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-2 border-b border-[#E5DED4] dark:border-[#1E2638] pb-6" id="tour-filters-row">
        {/* Toggle Tags */}
        <div className="flex flex-wrap gap-2" id="tour-region-selectors">
          {(['All', 'USA', 'Europe', 'Japan'] as const).map((region) => (
            <button
               key={region}
               onClick={() => setRegionFilter(region)}
               id={`filter-tour-${region}`}
               className={`px-4.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider uppercase transition-all cursor-pointer focus:outline-none ${
                 regionFilter === region
                   ? 'bg-[#4A5D4E] dark:bg-[#BC6C25] text-white shadow-sm'
                   : 'bg-[#F2ECE4] dark:bg-[#1E2638] text-[#6B655C] dark:text-[#94A3B8] border border-[#E5DED4] dark:border-[#2A354F] hover:bg-white dark:hover:bg-[#111625] hover:text-[#3D3A35] dark:hover:text-white'
               }`}
            >
              {region === 'Europe' ? 'UK & Europe' : region}
            </button>
          ))}
        </div>

        {/* Quick legend */}
        <div className="flex items-center space-x-4 text-xs font-mono text-[#6B655C] dark:text-[#94A3B8] font-semibold" id="tour-legend">
          <div className="flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-600 block" />
            <span>Available</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-[#BC6C25] block" />
            <span>Selling Fast</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-neutral-400 block" />
            <span>Sold Out</span>
          </div>
        </div>
      </div>

      {/* Advanced Filter System: Search by City and Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-white dark:bg-[#111625] border border-[#E5DED4] dark:border-[#1E2638] shadow-sm" id="tour-advanced-filters">
        {/* City Filter */}
        <div className="flex flex-col gap-1.5" id="filter-city-container">
          <label className="font-mono text-[10px] text-[#6B655C] dark:text-[#94A3B8] uppercase tracking-widest block font-bold">Search City</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#6B655C] dark:text-[#94A3B8]">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
              placeholder="e.g. London, Chicago, Tokyo..."
              id="tour-city-search-input"
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#F9F6F2] dark:bg-[#1E2638] border border-[#E5DED4] dark:border-[#2A354F] text-[#3D3A35] dark:text-[#E2E8F0] text-xs font-sans focus:border-[#4A5D4E]/50 dark:focus:border-emerald-500/50 outline-none transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
            />
            {citySearch && (
              <button
                onClick={() => setCitySearch('')}
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-[#6B655C] dark:text-[#94A3B8] hover:text-[#3D3A35] dark:hover:text-white cursor-pointer"
                title="Clear city filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Month Dropdown */}
        <div className="flex flex-col gap-1.5" id="filter-month-container">
          <label className="font-mono text-[10px] text-[#6B655C] dark:text-[#94A3B8] uppercase tracking-widest block font-bold">Show Month</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            id="tour-month-select"
            className="w-full px-3 py-2 rounded-xl bg-[#F9F6F2] dark:bg-[#1E2638] border border-[#E5DED4] dark:border-[#2A354F] text-[#3D3A35] dark:text-[#E2E8F0] text-xs focus:border-[#4A5D4E]/50 dark:focus:border-emerald-500/50 outline-none cursor-pointer"
          >
            <option value="All">All Months</option>
            <option value="JUL">July 2026</option>
            <option value="AUG">August 2026</option>
            <option value="SEP">September 2026</option>
            <option value="OCT">October 2026</option>
            <option value="NOV">November 2026</option>
            <option value="DEC">December 2026</option>
          </select>
        </div>

        {/* Date Picker Filter */}
        <div className="flex flex-col gap-1.5" id="filter-date-container">
          <label className="font-mono text-[10px] text-[#6B655C] dark:text-[#94A3B8] uppercase tracking-widest block font-bold">On or After Date</label>
          <div className="relative">
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              min="2026-01-01"
              max="2026-12-31"
              id="tour-date-picker-input"
              className="w-full px-3 py-2 rounded-xl bg-[#F9F6F2] dark:bg-[#1E2638] border border-[#E5DED4] dark:border-[#2A354F] text-[#3D3A35] dark:text-[#E2E8F0] text-xs focus:border-[#4A5D4E]/50 dark:focus:border-emerald-500/50 outline-none cursor-pointer font-sans"
            />
            {filterStartDate && (
              <button
                onClick={() => setFilterStartDate('')}
                className="absolute inset-y-0 right-2.5 flex items-center text-[#6B655C] dark:text-[#94A3B8] hover:text-[#3D3A35] dark:hover:text-white cursor-pointer"
                title="Clear date filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Reset Button / Stats */}
        <div className="flex items-end" id="filter-reset-container">
          {(citySearch || selectedMonth !== 'All' || filterStartDate || regionFilter !== 'All') ? (
            <button
              onClick={() => {
                setCitySearch('');
                setSelectedMonth('All');
                setFilterStartDate('');
                setRegionFilter('All');
              }}
              id="tour-reset-filters-btn"
              className="w-full py-2 px-4 rounded-xl border border-[#BC6C25]/20 hover:border-[#BC6C25] bg-[#F2ECE4] dark:bg-[#1E2638] text-[#BC6C25] dark:text-[#F59E0B] text-xs font-mono font-bold tracking-wider uppercase cursor-pointer hover:bg-[#BC6C25]/5 dark:hover:bg-[#BC6C25]/10 transition-all flex items-center justify-center gap-1"
            >
              Reset Filters
            </button>
          ) : (
            <div className="w-full text-center py-2.5 text-[10px] font-mono text-neutral-400 dark:text-neutral-500 font-bold tracking-wider select-none bg-[#F9F6F2] dark:bg-[#1E2638]/30 rounded-xl border border-[#E5DED4]/40 dark:border-[#1E2638]/40">
              Showing {filteredShows.length} of {allShows.length} Shows
            </div>
          )}
        </div>
      </div>

      {/* Tour Stops List */}
      <div className="space-y-4" id="tour-stops-list">
        {filteredShows.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-[#E5DED4] dark:border-[#1E2638] rounded-2xl bg-white dark:bg-[#111625]">
            <p className="font-serif text-[#6B655C] dark:text-[#94A3B8] text-sm">No shows scheduled in this region yet. Check back soon!</p>
          </div>
        ) : (
          filteredShows.map((show) => (
            <div
              key={show.id}
              className="group p-5 md:p-6 rounded-[24px] border border-[#E5DED4] dark:border-[#1E2638] bg-white dark:bg-[#111625] hover:shadow-md transition-all grid grid-cols-1 md:grid-cols-12 gap-4 items-center text-left"
              id={`tour-stop-card-${show.id}`}
            >
              {/* Date Box */}
              <div className="md:col-span-2 flex items-center space-x-4 md:space-x-0 md:flex-col md:items-start text-left md:border-r border-[#E5DED4] dark:border-[#1E2638] md:pr-4">
                <span className="font-serif font-bold text-3xl text-[#BC6C25] dark:text-[#F59E0B] tracking-tight leading-none">
                  {show.day}
                </span>
                <div>
                  <span className="font-mono text-xs font-bold text-[#4A5D4E] dark:text-emerald-400 block tracking-widest uppercase">
                    {show.month} {show.year}
                  </span>
                  <span className="font-mono text-[9px] text-[#6B655C] dark:text-[#94A3B8] block uppercase tracking-wider font-semibold">
                    {show.dayOfWeek}
                  </span>
                </div>
              </div>

              {/* Location & Venue */}
              <div className="md:col-span-5 flex items-start space-x-3">
                <div className="p-2.5 rounded-xl bg-[#F2ECE4] dark:bg-[#1E2638] text-[#BC6C25] dark:text-[#F59E0B] mt-1">
                  <MapPin className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base md:text-lg text-[#3D3A35] dark:text-[#E2E8F0] group-hover:text-[#BC6C25] dark:group-hover:text-[#F59E0B] transition-colors">
                    {show.city}, {show.country}
                  </h3>
                  <p className="font-sans text-sm text-[#6B655C] dark:text-[#94A3B8]">
                    {show.venue}
                  </p>
                </div>
              </div>

              {/* Price Details */}
              <div className="md:col-span-2 text-left md:text-center block">
                <span className="font-mono text-[9px] text-[#6B655C] dark:text-[#94A3B8] block uppercase tracking-widest font-bold">TICKET PRICE</span>
                <span className="font-mono font-bold text-base text-[#3D3A35] dark:text-[#E2E8F0]">
                  ${show.price} USD
                </span>
              </div>

              {/* Status Badge */}
              <div className="md:col-span-1 text-left">
                {show.ticketStatus === 'Available' && (
                  <span className="inline-flex px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-mono tracking-wide text-emerald-600 font-bold uppercase">
                    Available
                  </span>
                )}
                {show.ticketStatus === 'Selling Fast' && (
                  <span className="inline-flex px-2.5 py-0.5 rounded-full bg-[#BC6C25]/10 border border-[#BC6C25]/20 text-[9px] font-mono tracking-wide text-[#BC6C25] font-bold uppercase animate-pulse">
                    Selling Fast
                  </span>
                )}
                {show.ticketStatus === 'Sold Out' && (
                  <span className="inline-flex px-2.5 py-0.5 rounded-full bg-neutral-100 border border-neutral-200 text-[9px] font-mono tracking-wide text-neutral-400 font-bold uppercase">
                    Sold Out
                  </span>
                )}
              </div>

              {/* Action Button */}
              <div className="md:col-span-2 text-right">
                <button
                  disabled={show.ticketStatus === 'Sold Out'}
                  onClick={() => openBookingModal(show)}
                  id={`buy-button-${show.id}`}
                  className={`w-full py-2.5 px-4 rounded-full font-mono font-bold text-[10px] tracking-widest uppercase transition-all cursor-pointer focus:outline-none ${
                    show.ticketStatus === 'Sold Out'
                      ? 'bg-neutral-100 border border-neutral-200 text-neutral-400 cursor-not-allowed'
                      : 'bg-[#4A5D4E] hover:bg-[#5B6F5F] text-white shadow-sm hover:-translate-y-0.5'
                  }`}
                >
                  {show.ticketStatus === 'Sold Out' ? 'SOLD OUT' : 'BUY TICKETS'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Ticket Booking Modal */}
      {selectedShow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" id="booking-modal">
          <div className="relative w-full max-w-2xl bg-[#F9F6F2] dark:bg-[#0A0D14] border border-[#E5DED4] dark:border-[#1E2638] rounded-[32px] overflow-hidden shadow-xl flex flex-col text-left">
            {/* Header */}
            <div className="p-6 border-b border-[#E5DED4] dark:border-[#1E2638] flex items-center justify-between bg-[#F2ECE4] dark:bg-[#111625]">
              <div className="flex items-center space-x-3 text-[#4A5D4E] dark:text-emerald-400">
                <Ticket className="w-5.5 h-4.5" />
                <h2 className="font-serif font-bold text-xl text-[#3D3A35] dark:text-[#E2E8F0]">
                  {bookingStep === 'details' ? 'Ticket Reservation' : 'Your Digital Pass'}
                </h2>
              </div>
              <button
                onClick={closeBookingModal}
                className="p-1.5 rounded-full text-[#6B655C] dark:text-[#94A3B8] hover:text-[#3D3A35] dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-[#1D2535] focus:outline-none cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Container with Step Navigation */}
            <div className="p-6 overflow-y-auto max-h-[75vh]">
              {bookingStep === 'details' ? (
                /* Step 1: Details and Checkout */
                <form onSubmit={handleBookingSubmit} className="space-y-6" id="booking-form">
                  {/* Selected Event Details banner */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#111625] border border-[#E5DED4] dark:border-[#1E2638] flex items-center justify-between">
                    <div>
                      <span className="font-mono text-[9px] text-[#BC6C25] dark:text-[#F59E0B] tracking-widest block uppercase font-bold">
                        {selectedShow.date} • {selectedShow.venue}
                      </span>
                      <h4 className="font-serif font-bold text-[#4A5D4E] dark:text-emerald-400 text-base">
                        {selectedShow.city}, {selectedShow.country}
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-[9px] text-[#6B655C] dark:text-[#94A3B8] block font-bold uppercase tracking-wider">BASE GIG</span>
                      <span className="font-mono font-bold text-[#3D3A35] dark:text-[#E2E8F0] block">${selectedShow.price}</span>
                    </div>
                  </div>

                  {/* Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-left">
                      <label className="font-mono text-[10px] text-[#6B655C] dark:text-[#94A3B8] uppercase tracking-widest block font-bold">Full Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. John Doe"
                        id="booking-name-input"
                        className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#1E2638] border border-[#E5DED4] dark:border-[#2A354F] text-[#3D3A35] dark:text-[#E2E8F0] text-sm focus:border-[#4A5D4E]/50 dark:focus:border-emerald-500/50 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="font-mono text-[10px] text-[#6B655C] dark:text-[#94A3B8] uppercase tracking-widest block font-bold">Email Address</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. john@example.com"
                        id="booking-email-input"
                        className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#1E2638] border border-[#E5DED4] dark:border-[#2A354F] text-[#3D3A35] dark:text-[#E2E8F0] text-sm focus:border-[#4A5D4E]/50 dark:focus:border-emerald-500/50 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Ticket Tier */}
                    <div className="space-y-1.5 text-left">
                      <label className="font-mono text-[10px] text-[#6B655C] dark:text-[#94A3B8] uppercase tracking-widest block font-bold">Ticket Class</label>
                      <select
                        value={ticketType}
                        onChange={(e) => setTicketType(e.target.value as any)}
                        id="booking-class-select"
                        className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#1E2638] border border-[#E5DED4] dark:border-[#2A354F] text-[#3D3A35] dark:text-[#E2E8F0] text-sm focus:border-[#4A5D4E]/50 outline-none"
                      >
                        <option value="General Admission">General Admission (${selectedShow.price})</option>
                        <option value="VIP Backstage Premium">VIP Backstage + Exclusive Meet & Greet (+ $75)</option>
                      </select>
                    </div>

                    {/* Quantity */}
                    <div className="space-y-1.5 text-left">
                      <label className="font-mono text-[10px] text-[#6B655C] dark:text-[#94A3B8] uppercase tracking-widest block font-bold">Quantity</label>
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-3 py-1.5 rounded-lg bg-[#F2ECE4] dark:bg-[#1D2535] hover:bg-white dark:hover:bg-[#202A3C] border border-[#E5DED4] dark:border-[#2A354F] text-[#3D3A35] dark:text-[#E2E8F0] text-xs font-bold cursor-pointer"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold text-base text-[#3D3A35] dark:text-[#E2E8F0] px-2">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.min(6, quantity + 1))}
                          className="px-3 py-1.5 rounded-lg bg-[#F2ECE4] dark:bg-[#1D2535] hover:bg-white dark:hover:bg-[#202A3C] border border-[#E5DED4] dark:border-[#2A354F] text-[#3D3A35] dark:text-[#E2E8F0] text-xs font-bold cursor-pointer"
                        >
                          +
                        </button>
                        <span className="font-mono text-[10px] text-[#6B655C] dark:text-[#94A3B8]">(Max 6)</span>
                      </div>
                    </div>
                  </div>

                  {/* Promo code field */}
                  <div className="p-4 rounded-2xl border border-[#E5DED4] dark:border-[#1E2638] bg-[#F2ECE4]/50 dark:bg-[#1C2335]/50 text-left space-y-2">
                    <label className="font-mono text-[10px] text-[#6B655C] dark:text-[#94A3B8] block tracking-wide font-bold">GOT A TRIVIA PROMO CODE?</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="e.g. TRIVIA20"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="px-3 py-2 bg-white dark:bg-[#1E2638] border border-[#E5DED4] dark:border-[#2A354F] rounded-lg text-sm text-[#3D3A35] dark:text-[#E2E8F0] uppercase outline-none focus:border-[#4A5D4E]/40 flex-grow"
                      />
                      <button
                        type="button"
                        onClick={applyPromo}
                        className="px-4 py-2 border border-[#BC6C25] bg-white dark:bg-[#1E2638] hover:bg-[#F2ECE4] dark:hover:bg-[#2A354F] font-mono text-xs text-[#BC6C25] dark:text-[#F59E0B] tracking-widest font-bold rounded-lg cursor-pointer"
                      >
                        Apply Code
                      </button>
                    </div>
                    {promoApplied && (
                      <span className="font-mono text-xs text-emerald-600 flex items-center space-x-1 pt-1 block font-bold">
                        <CheckCircle className="w-3.5 h-3.5 inline mr-1" />
                        <span>Code Applied! 20% discount unlocked.</span>
                      </span>
                    )}
                  </div>

                  {/* Total calculation banner */}
                  <div className="pt-4 border-t border-[#E5DED4] dark:border-[#1E2638] flex items-center justify-between">
                    <div>
                      <span className="font-mono text-[9px] text-[#6B655C] dark:text-[#94A3B8] block font-bold uppercase tracking-wide">SUBTOTAL</span>
                      <span className="font-serif text-xs text-[#6B655C] dark:text-[#94A3B8] block italic mt-0.5">
                        ${getBasePrice()} x {quantity} tickets
                      </span>
                      {promoApplied && <span className="font-mono text-[10px] text-emerald-600 block font-bold">Less 20% Discount</span>}
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-[10px] text-[#6B655C] dark:text-[#94A3B8] block font-bold uppercase tracking-wider">TOTAL PAYABLE</span>
                      <span className="font-mono font-bold text-2xl text-[#BC6C25] dark:text-[#F59E0B] tracking-tight">
                        ${getTotalPrice()} USD
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <button
                    type="submit"
                    className="w-full py-4 rounded-full bg-[#BC6C25] dark:bg-[#F59E0B] hover:bg-[#CD7D36] transition-all font-mono font-bold text-xs text-white tracking-widest uppercase flex items-center justify-center space-x-2 cursor-pointer shadow-sm focus:outline-none"
                    id="submit-booking-order"
                  >
                    <Smartphone className="w-4 h-4 fill-current" />
                    <span>GENERATE DIGITAL TICKETS</span>
                  </button>
                </form>
              ) : (
                /* Step 2: Confirmation & High-End Ticket Print */
                <div className="space-y-8 py-2 text-center" id="ticket-generator-window">
                  {/* success toast banner */}
                  <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono font-medium text-emerald-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>BOOKING COMPLETED SUCCESSFULLY</span>
                  </div>

                  <h3 className="font-serif font-bold text-2xl text-[#3D3A35] dark:text-[#E2E8F0]">See you at the horizon!</h3>
                  <p className="font-sans text-sm text-[#6B655C] dark:text-[#94A3B8] max-w-md mx-auto">
                    We've registered your booking. Present this pass on your mobile device at the venue gate for instant access.
                  </p>

                  {/* Absolute Beautiful Skeuomorphic Concert Ticket */}
                  <div
                    className="relative w-full max-w-md mx-auto border border-[#E5DED4] dark:border-[#1E2638] bg-white dark:bg-[#111625] rounded-3xl overflow-hidden shadow-sm flex flex-col pt-6 border-t-8 border-t-[#4A5D4E]"
                    id="skeuomorphic-ticket"
                  >
                    {/* Inner dotted separation rings */}
                    <div className="absolute top-[68%] -left-3 h-6 w-6 rounded-full bg-[#F9F6F2] dark:bg-[#0A0D14] border-r border-[#E5DED4] dark:border-[#1E2638] z-15" />
                    <div className="absolute top-[68%] -right-3 h-6 w-6 rounded-full bg-[#F9F6F2] dark:bg-[#0A0D14] border-l border-[#E5DED4] dark:border-[#1E2638] z-15" />

                    {/* Band Logo Header inside ticket */}
                    <div className="px-6 pb-4 border-b border-dashed border-[#E5DED4] dark:border-[#1E2638] flex justify-between items-center text-left">
                      <div>
                        <span className="font-serif font-bold text-base text-[#4A5D4E] dark:text-emerald-400 tracking-tight">
                          VELVET HORIZON
                        </span>
                        <span className="font-mono text-[9px] text-[#BC6C25] dark:text-[#F59E0B] block uppercase tracking-widest mt-0.5 font-bold">
                          Elysian Fields Tour
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="px-2.5 py-1 rounded-full bg-[#F2ECE4] dark:bg-[#1E2638] text-[9px] font-mono font-bold text-[#6B655C] dark:text-[#94A3B8] tracking-wider uppercase border border-[#E5DED4] dark:border-[#2A354F]">
                          {ticketType.split(' ')[0]} PASS
                        </span>
                      </div>
                    </div>

                    {/* Event Dates & Info inside ticket */}
                    <div className="p-6 grid grid-cols-2 gap-y-4 gap-x-2 text-left">
                      <div className="space-y-0.5">
                        <span className="font-mono text-[9px] text-[#6B655C] dark:text-[#94A3B8] uppercase tracking-wide font-bold">LOCATION & VENUE</span>
                        <span className="font-serif font-bold text-sm text-[#3D3A35] dark:text-[#E2E8F0] block truncate">
                          {selectedShow.city}
                        </span>
                        <span className="font-sans text-xs text-[#6B655C] dark:text-[#94A3B8] block truncate leading-tight">
                          {selectedShow.venue}
                        </span>
                      </div>

                      <div className="space-y-0.5 text-right">
                        <span className="font-mono text-[9px] text-[#6B655C] dark:text-[#94A3B8] uppercase tracking-wide font-bold">DATE & SCHEDULE</span>
                        <span className="font-serif font-bold text-sm text-[#3D3A35] dark:text-[#E2E8F0] block">
                          {selectedShow.month} {selectedShow.day}, {selectedShow.year}
                        </span>
                        <span className="font-mono text-[10px] text-[#BC6C25] dark:text-[#F59E0B] block font-bold">
                          DOORS AT 7:30 PM
                        </span>
                      </div>

                      <div className="space-y-0.5 pt-2">
                        <span className="font-mono text-[9px] text-[#6B655C] dark:text-[#94A3B8] uppercase tracking-wide font-bold">VISITOR</span>
                        <span className="font-serif font-bold text-sm text-[#3D3A35] dark:text-[#E2E8F0] block truncate">
                          {name}
                        </span>
                        <span className="font-sans text-xs text-[#6B655C] dark:text-[#94A3B8] block truncate">
                          {email}
                        </span>
                      </div>

                      <div className="space-y-0.5 pt-2 text-right">
                        <span className="font-mono text-[9px] text-[#6B655C] dark:text-[#94A3B8] uppercase tracking-wide font-bold">DETAILS</span>
                        <span className="font-serif font-bold text-sm text-[#3D3A35] dark:text-[#E2E8F0] block">
                          {quantity}x {ticketType.split(' ')[0]}s
                        </span>
                        <span className="font-mono text-[11px] text-[#BC6C25] dark:text-[#F59E0B] block font-bold">
                          Paid: ${getTotalPrice()} USD
                        </span>
                      </div>
                    </div>

                    {/* Ticket Stub Footer */}
                    <div className="mt-4 px-6 pt-6 pb-6 border-t border-dashed border-[#E5DED4] dark:border-[#1E2638] bg-[#F2ECE4]/30 dark:bg-[#1C2335]/30 flex flex-col items-center justify-center space-y-3">
                      {/* Fake Barcode representation using custom monospace fonts and pipes! */}
                      <div className="text-center font-serif text-[#6B655C] dark:text-[#94A3B8] font-semibold text-2xl tracking-[0.25em] h-8 flex items-center justify-center leading-none">
                        ||||| | ||| ||||| || | | |||| ||
                      </div>

                      {/* Barcode labels */}
                      <div className="text-center">
                        <span className="font-mono text-[9px] text-[#6B655C] dark:text-[#94A3B8] block tracking-[0.1em] font-medium">
                          {completedBooking?.barcodeText}
                        </span>
                        <span className="font-mono font-bold text-[10px] text-[#4A5D4E] dark:text-emerald-400 block uppercase mt-1 tracking-wider">
                          CONFIRMATION: {completedBooking?.id}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-2">
                    <button
                      onClick={handleSaveToWallet}
                      disabled={isSaved}
                      id="save-ticket-to-wallet-btn"
                      className={`w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-mono font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isSaved
                          ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 cursor-default font-extrabold'
                          : 'bg-[#BC6C25] hover:bg-[#CD7D36] text-white shadow-sm hover:scale-[1.02]'
                      }`}
                    >
                      {isSaved ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>Saved to Wallet</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save Ticket to Wallet</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-[#E5DED4] dark:border-[#1E2638] bg-white dark:bg-[#1E2638] hover:bg-[#F2ECE4] dark:hover:bg-[#20293D] text-[#6B655C] dark:text-[#94A3B8] text-xs font-mono font-bold tracking-widest uppercase cursor-pointer transition-all"
                    >
                      Print Ticket
                    </button>
                    <button
                      onClick={closeBookingModal}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#4A5D4E] hover:bg-[#5B6F5F] text-white text-xs font-mono font-bold tracking-widest uppercase cursor-pointer transition-all shadow-sm"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
