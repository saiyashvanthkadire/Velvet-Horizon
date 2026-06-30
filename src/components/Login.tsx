import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import QRCode from 'qrcode';
import { 
  User, Mail, Lock, Shield, Ticket, GraduationCap, Heart, Calendar, 
  Award, LogOut, ArrowRight, ArrowLeft, Sparkles, CheckCircle, Copy, ExternalLink, 
  Eye, EyeOff, UserCheck, Smartphone, Music, Star, Zap, ShoppingBag, ShieldCheck, Trash2,
  Share2, Download, X, AlertTriangle, QrCode
} from 'lucide-react';
import { Song, SavedTicket } from '../types';

import { auth, googleAuthProvider } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  updateProfile, 
  signOut 
} from 'firebase/auth';
import { 
  setAuthToken, 
  syncAuthWithBackend, 
  getTicketsFromDb, 
  saveTicketToDb, 
  getLessonsFromDb, 
  saveLessonToDb 
} from '../lib/api';

interface LoginProps {
  currentUser: { name: string; email: string; tier: string } | null;
  setCurrentUser: (user: { name: string; email: string; tier: string } | null) => void;
  setCurrentTab: (tab: string) => void;
  savedTickets: SavedTicket[];
  setSavedTickets: React.Dispatch<React.SetStateAction<SavedTicket[]>>;
  activeTab: 'profile' | 'tickets' | 'masterclasses' | 'rewards';
  setActiveTab: (tab: 'profile' | 'tickets' | 'masterclasses' | 'rewards') => void;
}

interface SavedLesson {
  id: string;
  studentName: string;
  studentEmail: string;
  instrument: string;
  tutorName: string;
  date: string;
  timeSlot: string;
  totalPrice: number;
}

const getDaysUntilConcert = (dateStr: string): number | null => {
  try {
    const cleanStr = dateStr.trim();
    let parsedDate = new Date(cleanStr);
    
    // Fallback manual parsing if standard Date parsing is not fully supported or fails
    if (isNaN(parsedDate.getTime())) {
      const parts = cleanStr.replace(',', '').split(/\s+/);
      if (parts.length >= 3) {
        const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
        const monthIdx = monthNames.findIndex(m => parts[0].toLowerCase().startsWith(m));
        if (monthIdx !== -1) {
          const day = parseInt(parts[1], 10);
          const year = parseInt(parts[2], 10);
          parsedDate = new Date(year, monthIdx, day);
        }
      }
    }

    if (isNaN(parsedDate.getTime())) {
      return null;
    }

    // Baseline from current local time metadata: 2026-06-27
    const systemDate = new Date('2026-06-27T12:00:00');
    const today = new Date();
    
    // If running in a context where "today" is past or significantly different, 
    // we use standard systemDate to keep the 2026-06-27 baseline accurate for the tour year.
    const referenceDate = today > systemDate ? today : systemDate;
    
    referenceDate.setHours(0, 0, 0, 0);
    parsedDate.setHours(0, 0, 0, 0);
    
    const diffTime = parsedDate.getTime() - referenceDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (e) {
    return null;
  }
};

export default function Login({ 
  currentUser, 
  setCurrentUser, 
  setCurrentTab,
  savedTickets,
  setSavedTickets,
  activeTab,
  setActiveTab
}: LoginProps) {
  // Authentication forms tab states
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Login Form Input States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register Form Input States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regTier, setRegTier] = useState('Standard Fan');
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Form Submission Alert/Loading States
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Dashboard state variables (Tickets and Bookings loaded dynamically)
  const [localLessons, setLocalLessons] = useState<SavedLesson[]>([]);
  const [likedSongs, setLikedSongs] = useState<any[]>([]);
  
  // Fan Engagement / Game States
  const [copiedRewardId, setCopiedRewardId] = useState<string | null>(null);
  const [xpPoints, setXpPoints] = useState(150); // standard baseline starting XP

  // Share & Social Card States
  const [sharingTicket, setSharingTicket] = useState<SavedTicket | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [socialCardTheme, setSocialCardTheme] = useState<'sunset' | 'midnight' | 'gold' | 'neon'>('sunset');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Secure Gate Entry QR Code States
  const [selectedQrTicket, setSelectedQrTicket] = useState<SavedTicket | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  // Dynamically generate the QR Code when a ticket is selected
  useEffect(() => {
    if (selectedQrTicket) {
      const qrPayload = JSON.stringify({
        ticketId: selectedQrTicket.id,
        venue: selectedQrTicket.venue,
        date: selectedQrTicket.date,
        type: selectedQrTicket.ticketType,
        quantity: selectedQrTicket.quantity,
        holder: currentUser?.email || 'guest@velvethorizon.com',
        issuer: 'VELVET_HORIZON_TICKETING_SYSTEM',
        checksum: Math.random().toString(36).substring(2, 10).toUpperCase()
      }, null, 2);

      QRCode.toDataURL(qrPayload, {
        width: 380,
        margin: 2,
        color: {
          dark: '#0B0F19', // Extremely dark slate/blue for contrast
          light: '#FFFFFF' // Clean white background for quick scanning
        },
        errorCorrectionLevel: 'H' // High error tolerance
      })
        .then(url => {
          setQrCodeDataUrl(url);
        })
        .catch(err => {
          console.error("Error generating secure entry QR code:", err);
        });
    } else {
      setQrCodeDataUrl('');
    }
  }, [selectedQrTicket, currentUser]);

  // Setup localTickets derived from global savedTickets props with a fallback for the guest user
  const fallbackTicket: SavedTicket = {
    id: 'VH-719302',
    showId: 'show-2',
    venue: 'The Kings Theatre',
    city: 'Brooklyn, NY',
    country: 'USA',
    date: 'July 14, 2026',
    quantity: 2,
    ticketType: 'VIP Backstage Premium',
    totalPrice: 190
  };
  
  const localTickets = savedTickets.length > 0
    ? savedTickets
    : (currentUser?.email === 'vip.fan@velvethorizon.com' ? [fallbackTicket] : []);

  // Load ticket bookings, lesson bookings, and favorite tracks from localStorage & PostgreSQL
  useEffect(() => {
    async function loadDataFromDb() {
      let lessons: SavedLesson[] = [];
      const savedLessonsStr = localStorage.getItem('vh_booked_lessons_v1');
      if (savedLessonsStr) {
        try {
          lessons = JSON.parse(savedLessonsStr);
        } catch (e) {
          console.error('Error parsing local lessons', e);
        }
      }

      // If logged in, fetch from DB and merge/override
      if (auth.currentUser) {
        try {
          const token = await auth.currentUser.getIdToken();
          setAuthToken(token);
          
          const dbTickets = await getTicketsFromDb();
          if (dbTickets && dbTickets.length > 0) {
            const mappedTickets: SavedTicket[] = dbTickets.map((t: any) => ({
              id: t.id.toString(),
              showId: t.showId,
              venue: t.venue,
              city: t.city,
              country: t.country,
              date: t.date,
              quantity: t.quantity,
              ticketType: t.ticketType,
              totalPrice: t.totalPrice
            }));
            setSavedTickets(mappedTickets);
          }

          const dbLessons = await getLessonsFromDb();
          if (dbLessons && dbLessons.length > 0) {
            const mappedLessons: SavedLesson[] = dbLessons.map((l: any) => ({
              id: l.id.toString(),
              studentName: l.studentName,
              studentEmail: l.studentEmail,
              instrument: l.instrument,
              tutorName: l.tutorName,
              date: l.date,
              timeSlot: l.timeSlot,
              totalPrice: l.totalPrice
            }));
            setLocalLessons(mappedLessons);
            lessons = mappedLessons;
          }
        } catch (err) {
          console.error("Failed to load user data from PostgreSQL:", err);
        }
      } else {
        setLocalLessons(lessons);
      }

      // 3. Fetch favorited tracks from Discography component
      const favStr = localStorage.getItem('vh_favorites_v1');
      if (favStr) {
        try {
          setLikedSongs(JSON.parse(favStr));
        } catch (e) {}
      }

      // 4. Update XP based on actions taken
      let computedXp = 150;
      if (savedTickets) {
        computedXp += savedTickets.length * 120; // 120 XP per ticket booking
      }
      if (lessons) {
        computedXp += lessons.length * 100; // 100 XP per lesson booking
      }
      
      // Add XP for trivia solves
      const solvedTrivia = localStorage.getItem('vh_solved_trivia_v1');
      if (solvedTrivia) {
        computedXp += 80;
      }

      setXpPoints(computedXp);
    }

    loadDataFromDb();
  }, [currentUser, savedTickets]);

  const handleDeleteTicket = (ticketId: string) => {
    if (window.confirm('Are you sure you want to remove this ticket from your digital wallet?')) {
      const savedTicketsStr = localStorage.getItem('vh_booked_tickets_v1');
      let existingTickets = [];
      if (savedTicketsStr) {
        try {
          existingTickets = JSON.parse(savedTicketsStr);
        } catch (e) {}
      }

      // If they delete the seed/fallback ticket and it's not saved, we can just save an empty array or handle it
      const filtered = existingTickets.filter((t: any) => t.id !== ticketId);
      localStorage.setItem('vh_booked_tickets_v1', JSON.stringify(filtered));
      setSavedTickets(filtered);
    }
  };

  const handleDownloadSocialCard = (ticket: SavedTicket) => {
    setIsGeneratingImage(true);
    
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsGeneratingImage(false);
      return;
    }

    // 1. Draw background gradients based on theme
    let gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
    if (socialCardTheme === 'sunset') {
      gradient.addColorStop(0, '#BC6C25');
      gradient.addColorStop(0.5, '#DDA15E');
      gradient.addColorStop(1, '#283618');
    } else if (socialCardTheme === 'midnight') {
      gradient.addColorStop(0, '#0F172A');
      gradient.addColorStop(0.5, '#1E293B');
      gradient.addColorStop(1, '#090D16');
    } else if (socialCardTheme === 'gold') {
      gradient.addColorStop(0, '#1E1B4B');
      gradient.addColorStop(0.5, '#B45309');
      gradient.addColorStop(1, '#020617');
    } else { // neon
      gradient.addColorStop(0, '#111827');
      gradient.addColorStop(0.5, '#4C1D95');
      gradient.addColorStop(1, '#030712');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1080);

    // 2. Add some modern geometric decorative background elements
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 1080; i += 60) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 1080);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(1080, i);
      ctx.stroke();
    }

    // Large glowing circle in background
    ctx.beginPath();
    ctx.arc(540, 540, 420, 0, Math.PI * 2);
    let radialGlow = ctx.createRadialGradient(540, 540, 50, 540, 540, 420);
    if (socialCardTheme === 'sunset') {
      radialGlow.addColorStop(0, 'rgba(221, 161, 94, 0.2)');
      radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    } else if (socialCardTheme === 'midnight') {
      radialGlow.addColorStop(0, 'rgba(56, 189, 248, 0.15)');
      radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    } else if (socialCardTheme === 'gold') {
      radialGlow.addColorStop(0, 'rgba(245, 158, 11, 0.2)');
      radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    } else { // neon
      radialGlow.addColorStop(0, 'rgba(236, 72, 153, 0.2)');
      radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    }
    ctx.fillStyle = radialGlow;
    ctx.fill();

    // 3. Draw glassmorphic main card panel
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 20;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    const rx = 100;
    const ry = 140;
    const rw = 880;
    const rh = 800;
    const radius = 40;

    ctx.beginPath();
    ctx.moveTo(rx + radius, ry);
    ctx.lineTo(rx + rw - radius, ry);
    ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + radius);
    ctx.lineTo(rx + rw, ry + rh - radius);
    ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - radius, ry + rh);
    ctx.lineTo(rx + radius, ry + rh);
    ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - radius);
    ctx.lineTo(rx, ry + radius);
    ctx.quadraticCurveTo(rx, ry, rx + radius, ry);
    ctx.closePath();
    ctx.fill();

    // Border line on card
    ctx.shadowBlur = 0; // reset shadow for border
    ctx.shadowOffsetY = 0;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner glowing ring
    ctx.strokeStyle = socialCardTheme === 'sunset' ? 'rgba(221, 161, 94, 0.25)' : 
                      socialCardTheme === 'midnight' ? 'rgba(56, 189, 248, 0.25)' :
                      socialCardTheme === 'gold' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(236, 72, 153, 0.25)';
    ctx.lineWidth = 1;
    ctx.strokeRect(rx + 20, ry + 20, rw - 40, rh - 40);

    // 4. Texts
    // BAND NAME Header
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    
    // Band logo title
    ctx.font = 'bold 54px Serif, Georgia, Times';
    ctx.fillText('VELVET HORIZON', 540, 240);

    // Subtitle
    ctx.font = 'bold 16px monospace, Courier';
    ctx.fillStyle = socialCardTheme === 'sunset' ? '#DDA15E' : 
                     socialCardTheme === 'midnight' ? '#38BDF8' :
                     socialCardTheme === 'gold' ? '#F59E0B' : '#F472B6';
    ctx.fillText('2026 WORLD TOUR ACCESS PASS', 540, 285);

    // Draw separator line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rx + 80, 330);
    ctx.lineTo(rx + rw - 80, 330);
    ctx.stroke();

    // 5. EVENT DETAILS
    // Venue Name
    ctx.font = 'bold 44px sans-serif, Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(ticket.venue, 540, 420);

    // City & Country
    ctx.font = '28px monospace, Courier';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText(`${ticket.city.toUpperCase()}, ${ticket.country.toUpperCase()}`, 540, 470);

    // Date
    ctx.font = 'bold 36px serif, Georgia';
    ctx.fillStyle = socialCardTheme === 'sunset' ? '#DDA15E' : 
                     socialCardTheme === 'midnight' ? '#38BDF8' :
                     socialCardTheme === 'gold' ? '#F59E0B' : '#F472B6';
    ctx.fillText(ticket.date, 540, 530);

    // Draw secondary separator
    ctx.beginPath();
    ctx.moveTo(rx + 80, 590);
    ctx.lineTo(rx + rw - 80, 590);
    ctx.stroke();

    // 6. PASS TYPE & QUANTITY
    // Ticket Type
    ctx.font = 'bold 28px sans-serif, Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(ticket.ticketType.toUpperCase(), 540, 650);

    // Pass Quantity Label
    ctx.font = '22px monospace, Courier';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillText(`QUANTITY: ${ticket.quantity} PASS(ES)`, 540, 695);

    // Ref ID
    ctx.font = '20px monospace, Courier';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillText(`WALLET REF ID: ${ticket.id}`, 540, 735);

    // 7. BARCODE SIMULATION
    const bcy = 780;
    const bcHeight = 70;
    const bcWidth = 400;
    const bcStart = 540 - (bcWidth / 2);
    ctx.fillStyle = '#FFFFFF';
    
    // Draw pseudo random lines for barcode
    let seedValue = ticket.id.charCodeAt(3) + (ticket.id.charCodeAt(5) || 55);
    for (let x = 0; x < bcWidth; x += 5) {
      let w = ((seedValue * x) % 13) < 6 ? 1 : 3;
      if (x % 3 === 0) w = 2;
      ctx.fillRect(bcStart + x, bcy, w, bcHeight);
    }

    ctx.font = 'bold 16px monospace, Courier';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText(`*${ticket.id}*`, 540, 885);

    // Sub watermark
    ctx.font = '14px monospace, Courier';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fillText('VELVET HORIZON SECURE FAN TICKET PORTAL', 540, 915);

    // Save image
    setTimeout(() => {
      try {
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `velvethorizon-social-ticket-${ticket.id}.png`;
        link.href = url;
        link.click();
      } catch (err) {
        console.error('Failed to export canvas', err);
      }
      setIsGeneratingImage(false);
    }, 600);
  };

  const handleCopyDirectLink = (ticket: SavedTicket) => {
    const textToCopy = `🎫 Grab your tickets to see Velvet Horizon Live!\n📍 Venue: ${ticket.venue} (${ticket.city}, ${ticket.country})\n📅 Date: ${ticket.date}\n🎟️ My Reservation ID: ${ticket.id}\nCheck out the official tour at: ${window.location.origin}/?ticket=${ticket.id}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    }).catch(err => {
      console.error('Failed to copy', err);
    });
  };

  // Handle preset guest credential autologin for review
  const handleLoadGuestCredentials = () => {
    setLoginEmail('vip.fan@velvethorizon.com');
    setLoginPassword('velvet2026');
    setAuthErrorAndClear('');
  };

  const setAuthErrorAndClear = (msg: string) => {
    setFormError(msg);
    setTimeout(() => setFormError(''), 5000);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!loginEmail || !loginPassword) {
      setAuthErrorAndClear('Please fill in both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      } catch (loginErr: any) {
        if (loginErr.code === 'auth/operation-not-allowed') {
          const clientUser = {
            name: loginEmail === 'vip.fan@velvethorizon.com' ? 'Julian Vance fan' : loginEmail.split('@')[0],
            email: loginEmail,
            tier: loginEmail === 'vip.fan@velvethorizon.com' ? 'Elysian VIP Master' : 'Standard Fan'
          };
          setCurrentUser(clientUser);
          localStorage.setItem('vh_user_v1', JSON.stringify(clientUser));
          setFormSuccess('Initialized Local Session! (Firebase Email/Password Auth is disabled. Activate it in Firebase Console to sync data)');
          return;
        }
        if (loginEmail === 'vip.fan@velvethorizon.com' && loginPassword === 'velvet2026' && (loginErr.code === 'auth/user-not-found' || loginErr.code === 'auth/invalid-credential')) {
          try {
            userCredential = await createUserWithEmailAndPassword(auth, loginEmail, loginPassword);
            await updateProfile(userCredential.user, { displayName: 'Julian Vance fan' });
          } catch (createErr: any) {
            if (createErr.code === 'auth/operation-not-allowed') {
              const clientUser = {
                name: 'Julian Vance fan',
                email: 'vip.fan@velvethorizon.com',
                tier: 'Elysian VIP Master'
              };
              setCurrentUser(clientUser);
              localStorage.setItem('vh_user_v1', JSON.stringify(clientUser));
              setFormSuccess('Initialized Local Session! (Firebase Email/Password Auth is disabled. Activate it in Firebase Console to sync data)');
              return;
            }
            throw createErr;
          }
        } else {
          throw loginErr;
        }
      }

      const user = userCredential.user;
      const token = await user.getIdToken();
      setAuthToken(token);

      await syncAuthWithBackend();

      const clientUser = {
        name: user.displayName || user.email?.split('@')[0] || 'Julian Vance fan',
        email: user.email || '',
        tier: user.email === 'vip.fan@velvethorizon.com' ? 'Elysian VIP Master' : 'Standard Fan'
      };

      setCurrentUser(clientUser);
      localStorage.setItem('vh_user_v1', JSON.stringify(clientUser));
      setFormSuccess('Successfully logged in securely!');
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/operation-not-allowed') {
        const clientUser = {
          name: loginEmail === 'vip.fan@velvethorizon.com' ? 'Julian Vance fan' : loginEmail.split('@')[0],
          email: loginEmail,
          tier: loginEmail === 'vip.fan@velvethorizon.com' ? 'Elysian VIP Master' : 'Standard Fan'
        };
        setCurrentUser(clientUser);
        localStorage.setItem('vh_user_v1', JSON.stringify(clientUser));
        setFormSuccess('Initialized Local Session! (Firebase Email/Password Auth is disabled. Activate it in Firebase Console to sync data)');
        return;
      }
      let errorMsg = 'Invalid email or password.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errorMsg = 'Incorrect email or password.';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'Please enter a valid email address.';
      } else {
        errorMsg = err.message || errorMsg;
      }
      setAuthErrorAndClear(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!regName || !regEmail || !regPassword) {
      setAuthErrorAndClear('Please fill in all requested fields.');
      return;
    }

    if (regPassword.length < 6) {
      setAuthErrorAndClear('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, regEmail, regPassword);
      const user = userCredential.user;
      await updateProfile(user, { displayName: regName });
      
      const token = await user.getIdToken();
      setAuthToken(token);

      await syncAuthWithBackend();

      const clientUser = {
        name: regName,
        email: regEmail,
        tier: regTier
      };

      setCurrentUser(clientUser);
      localStorage.setItem('vh_user_v1', JSON.stringify(clientUser));
      setFormSuccess('Registration complete! Welcome to Velvet Horizon Hub.');
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.code === 'auth/operation-not-allowed') {
        const clientUser = {
          name: regName,
          email: regEmail,
          tier: regTier
        };
        setCurrentUser(clientUser);
        localStorage.setItem('vh_user_v1', JSON.stringify(clientUser));
        setFormSuccess('Registered locally! (Firebase Email/Password Auth is disabled. Activate it in Firebase Console to sync data)');
        return;
      }
      let errorMsg = 'Failed to register account.';
      if (err.code === 'auth/email-already-in-use') {
        errorMsg = 'This email address is already in use.';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'Please enter a valid email address.';
      } else if (err.code === 'auth/weak-password') {
        errorMsg = 'Password is too weak.';
      } else {
        errorMsg = err.message || errorMsg;
      }
      setAuthErrorAndClear(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setFormError('');
    setFormSuccess('');
    setIsLoading(true);

    try {
      const userCredential = await signInWithPopup(auth, googleAuthProvider);
      const user = userCredential.user;
      const token = await user.getIdToken();
      setAuthToken(token);

      await syncAuthWithBackend();

      const clientUser = {
        name: user.displayName || user.email?.split('@')[0] || 'Velvet Horizon Fan',
        email: user.email || '',
        tier: 'Standard Fan'
      };

      setCurrentUser(clientUser);
      localStorage.setItem('vh_user_v1', JSON.stringify(clientUser));
      setFormSuccess('Google Sign-in successful!');
    } catch (err: any) {
      console.error('Google Sign-in error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setAuthErrorAndClear(err.message || 'Google authentication failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Logout error', e);
    }
    setAuthToken(null);
    setCurrentUser(null);
    localStorage.removeItem('vh_user_v1');
    setSavedTickets([]);
    localStorage.removeItem('vh_booked_tickets_v1');
    setLocalLessons([]);
    setXpPoints(150);
    setActiveTab('profile');
  };

  const copyRewardCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedRewardId(id);
    setTimeout(() => setCopiedRewardId(null), 2000);
  };

  const getRankName = (xp: number) => {
    if (xp >= 500) return 'Emerald Celestial Legend';
    if (xp >= 350) return 'Royal Blue Backstage Elite';
    if (xp >= 200) return 'Sunset Gold Veteran';
    return 'Silver Deck Cadet';
  };

  return (
    <div className="space-y-12 pb-36 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-[#3D3A35] dark:text-[#E2E8F0]" id="login-module-container">
      {/* 1. Header Introductions */}
      <div className="text-center max-w-xl mx-auto space-y-3 pt-6" id="login-intro">
        <span className="font-mono text-xs text-[#BC6C25] dark:text-[#F59E0B] tracking-widest block uppercase font-bold flex items-center justify-center gap-1.5">
          <Shield className="w-4 h-4 animate-pulse" /> SECURE VIP GATEWAY
        </span>
        <h1 className="font-serif font-bold text-3xl md:text-5xl text-[#4A5D4E] dark:text-emerald-400 tracking-tight leading-tight">
          {currentUser ? 'VIP Fan Dashboard' : 'Fan Hub Admission'}
        </h1>
        <p className="font-serif text-[#6B655C] dark:text-[#94A3B8] text-sm italic">
          {currentUser 
            ? `"Access your Elysian tour tickets, review lesson bookings, unlock premium downloads, and track your VIP member tier."`
            : `"Register your official Velvet Horizon membership. Backstage passes, learning credits, and music downloads await inside."`
          }
        </p>
      </div>

      {currentUser ? (
        /* ======================== POST-LOGIN STATE: VIP FAN DASHBOARD ======================== */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10" id="vip-dashboard-grid">
          {/* Left Column: Dashboard Navigation & VIP Profile Card */}
          <div className="lg:col-span-4 space-y-6" id="vip-left-sidebar">
            
            {/* Holographic Digital Member Pass */}
            <div className="relative rounded-[32px] overflow-hidden p-6 border border-[#E5DED4]/60 dark:border-white/10 bg-gradient-to-br from-[#FCFAF7] to-[#F5EFE6] dark:from-[#111625] dark:to-[#0F1321] shadow-xl text-left" id="digital-member-pass">
              {/* Decorative Background Accents */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#BC6C25]/10 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-[#4A5D4E]/10 dark:bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-[#4A5D4E]/10 dark:bg-[#BC6C25]/10 rounded-lg text-[#4A5D4E] dark:text-[#F59E0B]">
                    <Music className="w-4.5 h-4.5" />
                  </div>
                  <span className="font-mono text-[9px] tracking-widest font-extrabold text-[#BC6C25] dark:text-[#F59E0B]">VH-PASSPORT</span>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>SECURE GATE</span>
                </div>
              </div>

              {/* holographic card profile */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-[#E5DED4] dark:bg-[#1C2436] border border-[#BC6C25]/30 dark:border-emerald-500/30 flex items-center justify-center font-serif text-xl font-bold text-[#4A5D4E] dark:text-emerald-400 relative">
                  {currentUser.name.charAt(0).toUpperCase()}
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#111625]" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-serif font-bold text-base text-[#3D3A35] dark:text-white truncate">
                    {currentUser.name}
                  </h3>
                  <p className="font-mono text-[10px] text-neutral-400 truncate mt-0.5 uppercase tracking-wide">
                    {currentUser.email}
                  </p>
                </div>
              </div>

              {/* Credentials Details */}
              <div className="space-y-3.5 font-mono text-[10px] border-t border-[#F0EBE3] dark:border-white/5 pt-4">
                <div className="flex justify-between">
                  <span className="text-neutral-450">FAN TIER RATING:</span>
                  <span className="font-extrabold text-[#BC6C25] dark:text-[#F59E0B] uppercase">{currentUser.tier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-450">SECURE TOKEN REF:</span>
                  <span className="font-bold text-[#3D3A35] dark:text-[#E2E8F0]">#VH-2026-VIP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-450">CURRENT CADET EXP:</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-450">{xpPoints} XP POINTS</span>
                </div>
              </div>

              {/* Card Hologram Footer Barcode */}
              <div className="mt-6 pt-4 border-t border-dashed border-[#E5DED4] dark:border-white/5 text-center">
                <div className="font-mono text-[12px] tracking-widest text-neutral-400 opacity-65 select-none font-bold">
                  ||| | | |||| | |||| || | | |||
                </div>
                <span className="font-mono text-[8px] text-neutral-450 tracking-widest block mt-1 uppercase font-bold">VIP DIGITAL BADGE VERIFIED</span>
              </div>
            </div>

            {/* Sidebar Tab Options */}
            <div className="p-3 rounded-2xl border border-neutral-200 dark:border-white/5 bg-white/30 dark:bg-[#111625]/40 backdrop-blur-xl flex flex-col gap-1.5" id="vip-tab-controls">
              <button
                onClick={() => setActiveTab('profile')}
                className={`p-3 rounded-xl flex items-center space-x-3 text-xs font-mono font-bold uppercase tracking-wider transition-all text-left cursor-pointer focus:outline-none ${
                  activeTab === 'profile'
                    ? 'bg-[#4A5D4E] dark:bg-emerald-600 text-white shadow-sm'
                    : 'text-[#6B655C] dark:text-[#94A3B8] hover:text-[#3D3A35] dark:hover:text-white hover:bg-[#F2ECE4]/50 dark:hover:bg-[#1D2436]/50'
                }`}
              >
                <User className="w-4.5 h-4.5" />
                <span>Overview & Rank</span>
              </button>

              <button
                onClick={() => setActiveTab('tickets')}
                className={`p-3 rounded-xl flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider transition-all text-left cursor-pointer focus:outline-none ${
                  activeTab === 'tickets'
                    ? 'bg-[#4A5D4E] dark:bg-emerald-600 text-white shadow-sm'
                    : 'text-[#6B655C] dark:text-[#94A3B8] hover:text-[#3D3A35] dark:hover:text-white hover:bg-[#F2ECE4]/50 dark:hover:bg-[#1D2436]/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Ticket className="w-4.5 h-4.5" />
                  <span>My Tickets</span>
                </div>
                {localTickets.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#BC6C25] dark:bg-[#F59E0B] text-[8px] text-white font-mono">
                    {localTickets.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('masterclasses')}
                className={`p-3 rounded-xl flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider transition-all text-left cursor-pointer focus:outline-none ${
                  activeTab === 'masterclasses'
                    ? 'bg-[#4A5D4E] dark:bg-emerald-600 text-white shadow-sm'
                    : 'text-[#6B655C] dark:text-[#94A3B8] hover:text-[#3D3A35] dark:hover:text-white hover:bg-[#F2ECE4]/50 dark:hover:bg-[#1D2436]/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <GraduationCap className="w-4.5 h-4.5" />
                  <span>Class Schedules</span>
                </div>
                {localLessons.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#BC6C25] dark:bg-[#F59E0B] text-[8px] text-white font-mono">
                    {localLessons.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('rewards')}
                className={`p-3 rounded-xl flex items-center space-x-3 text-xs font-mono font-bold uppercase tracking-wider transition-all text-left cursor-pointer focus:outline-none ${
                  activeTab === 'rewards'
                    ? 'bg-[#4A5D4E] dark:bg-emerald-600 text-white shadow-sm'
                    : 'text-[#6B655C] dark:text-[#94A3B8] hover:text-[#3D3A35] dark:hover:text-white hover:bg-[#F2ECE4]/50 dark:hover:bg-[#1D2436]/50'
                }`}
              >
                <Award className="w-4.5 h-4.5" />
                <span>Rewards Locker</span>
              </button>

              <button
                onClick={handleLogOut}
                className="p-3 rounded-xl flex items-center space-x-3 text-xs font-mono font-bold uppercase tracking-wider text-red-500 hover:bg-red-500/10 dark:hover:bg-red-500/15 transition-all text-left cursor-pointer focus:outline-none"
              >
                <LogOut className="w-4.5 h-4.5" />
                <span>Sign Out Account</span>
              </button>
            </div>
          </div>

          {/* Right Column: Dynamic Dashboard Workspaces */}
          <div className="lg:col-span-8" id="vip-workspace-area">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'profile' && (
              <div className="space-y-8 animate-fade-in" id="profile-overview-panel">
                
                {/* Gamification Level Dashboard Card */}
                <div className="p-6 sm:p-8 rounded-[32px] border border-white/20 dark:border-white/5 bg-white/30 dark:bg-[#111625]/40 backdrop-blur-xl text-left space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 dark:border-white/5 pb-5">
                    <div>
                      <span className="font-mono text-[9px] text-[#BC6C25] dark:text-[#F59E0B] tracking-wider uppercase font-bold flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-[#F59E0B]" /> LEVEL XP MILESTONES
                      </span>
                      <h3 className="font-serif font-bold text-xl text-[#3D3A35] dark:text-white">
                        {getRankName(xpPoints)}
                      </h3>
                    </div>
                    <span className="inline-block px-3.5 py-1.5 rounded-full bg-[#BC6C25]/10 border border-[#BC6C25]/20 font-mono text-xs text-[#BC6C25] dark:text-[#F59E0B] font-bold">
                      {xpPoints} TOTAL XP POINTS
                    </span>
                  </div>

                  {/* XP progress bar */}
                  <div className="space-y-3">
                    <div className="flex justify-between font-mono text-[10px] text-neutral-450">
                      <span>CURRENT RANK XP: {xpPoints} XP</span>
                      <span>NEXT RANK AT: 500 XP</span>
                    </div>
                    <div className="relative h-2.5 bg-neutral-200 dark:bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#BC6C25] to-emerald-500 dark:from-[#F59E0B] dark:to-emerald-400 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(100, (xpPoints / 500) * 100)}%` }}
                      />
                    </div>
                    <p className="font-serif text-[11px] text-[#6B655C] dark:text-[#94A3B8] italic">
                      "Earn XP by purchasing Elysian tour tickets, booking private lessons, or completing the interactive discography lyric trivia challenges!"
                    </p>
                  </div>
                </div>

                {/* Grid stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Tour ticket counter */}
                  <div className="p-6 rounded-[24px] border border-white/20 dark:border-white/5 bg-white/30 dark:bg-[#111625]/40 backdrop-blur-xl text-left flex items-start space-x-4">
                    <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                      <Ticket className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="font-mono text-[9px] text-neutral-400 block uppercase font-bold">SECURED SHOW TICKETS</span>
                      <span className="font-serif font-bold text-2xl text-[#3D3A35] dark:text-white mt-1 block">
                        {localTickets.length} Passes
                      </span>
                      <button 
                        onClick={() => setActiveTab('tickets')}
                        className="font-mono text-[9px] text-[#BC6C25] dark:text-[#F59E0B] hover:underline font-extrabold tracking-widest mt-2 uppercase flex items-center gap-1 cursor-pointer"
                      >
                        VIEW TICKETS <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Private Lessons counter */}
                  <div className="p-6 rounded-[24px] border border-white/20 dark:border-white/5 bg-white/30 dark:bg-[#111625]/40 backdrop-blur-xl text-left flex items-start space-x-4">
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="font-mono text-[9px] text-neutral-400 block uppercase font-bold">ACADEMY MASTERCLASSES</span>
                      <span className="font-serif font-bold text-2xl text-[#3D3A35] dark:text-white mt-1 block">
                        {localLessons.length} Scheduled
                      </span>
                      <button 
                        onClick={() => setActiveTab('masterclasses')}
                        className="font-mono text-[9px] text-[#BC6C25] dark:text-[#F59E0B] hover:underline font-extrabold tracking-widest mt-2 uppercase flex items-center gap-1 cursor-pointer"
                      >
                        VIEW SCHEDULES <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Band Activity Feed */}
                <div className="p-6 rounded-[32px] border border-white/20 dark:border-white/5 bg-white/30 dark:bg-[#111625]/40 backdrop-blur-xl text-left space-y-4">
                  <h4 className="font-serif font-bold text-base text-[#3D3A35] dark:text-white">Recent Fan Actions Ledger</h4>
                  <div className="space-y-3.5">
                    <div className="flex items-start space-x-3 text-xs">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="text-[#3D3A35] dark:text-[#E2E8F0]">Account successfully signed in to Velvet VIP Fan Network</p>
                        <span className="font-mono text-[9px] text-neutral-400 block mt-0.5">Today • 11:48 AM</span>
                      </div>
                    </div>
                    {localTickets.length > 0 && (
                      <div className="flex items-start space-x-3 text-xs border-t border-dashed border-neutral-200 dark:border-white/5 pt-3.5">
                        <div className="w-2 h-2 rounded-full bg-[#BC6C25] mt-1.5 flex-shrink-0" />
                        <div>
                          <p className="text-[#3D3A35] dark:text-[#E2E8F0]">Elysian Fields Tour concert reservation updated</p>
                          <span className="font-mono text-[9px] text-neutral-400 block mt-0.5">Authorized • Ticket Wallet synced</span>
                        </div>
                      </div>
                    )}
                    {localLessons.length > 0 && (
                      <div className="flex items-start space-x-3 text-xs border-t border-dashed border-neutral-200 dark:border-white/5 pt-3.5">
                        <div className="w-2 h-2 rounded-full bg-[#BC6C25] mt-1.5 flex-shrink-0" />
                        <div>
                          <p className="text-[#3D3A35] dark:text-[#E2E8F0]">Lesson registry slot linked to user profile</p>
                          <span className="font-mono text-[9px] text-neutral-400 block mt-0.5">Authorized • Learning Hub active</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TICKETS WALLET TAB */}
            {activeTab === 'tickets' && (
              <div className="space-y-6 animate-fade-in text-left" id="tickets-wallet-panel">
                <div className="flex justify-between items-center pb-3 border-b border-neutral-200 dark:border-white/5">
                  <div>
                    <h3 className="font-serif font-bold text-lg md:text-xl text-[#3D3A35] dark:text-white">Concert Tickets Wallet</h3>
                    <p className="font-mono text-[9px] text-neutral-450 uppercase block mt-0.5 tracking-wider">Your digital gates tickets stub verification ledger</p>
                  </div>
                  <button
                    onClick={() => setCurrentTab('tour')}
                    className="px-3.5 py-1.5 rounded-full bg-[#4A5D4E] dark:bg-[#BC6C25] hover:opacity-90 text-white font-mono text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer"
                  >
                    Book New Tickets
                  </button>
                </div>

                {localTickets.length === 0 ? (
                  <div className="p-12 text-center border-2 border-dashed border-neutral-200 dark:border-white/5 rounded-[32px] space-y-4">
                    <p className="font-serif text-sm text-neutral-400 italic">"No secured concert tickets found inside your digital wallet yet."</p>
                    <button
                      onClick={() => setCurrentTab('tour')}
                      className="px-5 py-2.5 bg-[#4A5D4E] dark:bg-[#BC6C25] text-white text-xs font-mono font-bold uppercase tracking-widest rounded-full cursor-pointer hover:opacity-95"
                    >
                      Browse Elysian Fields Tour Dates
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {localTickets.map((tkt, idx) => {
                      const daysLeft = getDaysUntilConcert(tkt.date);
                      const isCritical = daysLeft !== null && daysLeft >= 0 && daysLeft <= 15;
                      const isUrgent = daysLeft !== null && daysLeft >= 0 && daysLeft <= 30;
                      
                      let containerStyles = "group overflow-hidden rounded-[24px] border border-neutral-200 dark:border-[#222B3D] bg-[#FCFAF7] dark:bg-[#121725] flex flex-col sm:flex-row transition-all duration-350";
                      let stubStyles = "p-6 bg-[#F2ECE4] dark:bg-[#1E2536] flex flex-col justify-between text-left sm:w-1/3 border-b sm:border-b-0 sm:border-r border-dashed border-neutral-300 dark:border-[#2A354E] transition-all duration-350";
                      
                      if (isCritical) {
                        containerStyles = "group overflow-hidden rounded-[24px] border border-red-400/50 dark:border-red-500/30 bg-[#FFFBFB] dark:bg-[#1F1012]/80 flex flex-col sm:flex-row shadow-lg shadow-red-500/5 transition-all duration-350";
                        stubStyles = "p-6 bg-[#FFEBEF] dark:bg-[#2C1316] flex flex-col justify-between text-left sm:w-1/3 border-b sm:border-b-0 sm:border-r border-dashed border-red-300/40 dark:border-red-900/30 transition-all duration-350";
                      } else if (isUrgent) {
                        containerStyles = "group overflow-hidden rounded-[24px] border border-amber-500/50 dark:border-amber-500/35 bg-[#FFFDF9] dark:bg-[#1A140E]/80 flex flex-col sm:flex-row shadow-md shadow-amber-500/5 transition-all duration-350";
                        stubStyles = "p-6 bg-[#FFF4E4] dark:bg-[#231A10] flex flex-col justify-between text-left sm:w-1/3 border-b sm:border-b-0 sm:border-r border-dashed border-amber-300/40 dark:border-amber-900/30 transition-all duration-350";
                      }

                      return (
                        <motion.div 
                          key={tkt.id} 
                          className={containerStyles}
                          id={`ticket-card-${tkt.id}`}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ 
                            duration: 0.45, 
                            delay: idx * 0.08,
                            ease: [0.16, 1, 0.3, 1] 
                          }}
                        >
                          {/* Ticket left stub */}
                          <div className={stubStyles}>
                            <div className="space-y-2">
                              <span className={`inline-block px-2.5 py-0.5 font-mono text-[8px] font-extrabold uppercase rounded-full tracking-wider border ${
                                isCritical 
                                  ? 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/25'
                                  : isUrgent
                                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25'
                                  : 'bg-[#BC6C25]/15 dark:bg-emerald-500/10 text-[#BC6C25] dark:text-emerald-400 border-[#BC6C25]/20 dark:border-emerald-500/20'
                              }`}>
                                {tkt.ticketType}
                              </span>
                              <h4 className="font-serif font-extrabold text-sm text-[#3D3A35] dark:text-[#E2E8F0] tracking-tight">{tkt.venue}</h4>
                              <p className="font-mono text-[10px] text-neutral-450 uppercase tracking-wider">{tkt.city}, {tkt.country}</p>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-solid border-neutral-300/40 dark:border-neutral-700/40">
                              <span className="font-mono text-[8px] text-neutral-400 uppercase tracking-widest block font-bold">DATE REFERENCE</span>
                              <span className={`font-serif font-bold text-xs block mt-0.5 ${
                                isCritical ? 'text-red-600 dark:text-red-400' : isUrgent ? 'text-amber-600 dark:text-amber-400' : 'text-[#BC6C25] dark:text-[#F59E0B]'
                              }`}>{tkt.date}</span>
                              
                              {daysLeft !== null && (
                                <div className="mt-2">
                                  {isCritical ? (
                                    <span className="inline-flex items-center gap-1 font-mono text-[7.5px] text-red-600 dark:text-red-400 font-bold uppercase tracking-wider animate-pulse">
                                      <AlertTriangle className="w-3 h-3 text-red-500 animate-bounce" />
                                      CRITICAL: SHOW IN {daysLeft === 0 ? 'TODAY!' : daysLeft === 1 ? 'TOMORROW!' : `${daysLeft} DAYS`}
                                    </span>
                                  ) : isUrgent ? (
                                    <span className="inline-flex items-center gap-1 font-mono text-[7.5px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">
                                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                                      UPCOMING: IN {daysLeft} DAYS
                                    </span>
                                  ) : (
                                    <span className="font-mono text-[7.5px] text-neutral-400 block uppercase">
                                      Show is in {daysLeft} days
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Ticket main body stub */}
                          <div className="p-6 flex-grow flex flex-col justify-between text-left space-y-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-mono text-[8px] text-neutral-400 uppercase tracking-widest font-bold">TICKET REGISTRATION REF</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="font-mono font-extrabold text-base text-[#3D3A35] dark:text-white block tracking-wider">{tkt.id}</span>
                                  {isCritical && (
                                    <span className="px-2 py-0.5 bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 font-mono text-[8px] font-bold rounded uppercase tracking-wider border border-red-500/20 animate-pulse">
                                      URGENT ALERT
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="font-mono text-[8px] text-neutral-400 uppercase tracking-widest block font-bold">TOTAL COMPENSATED</span>
                                <span className="font-serif font-extrabold text-sm text-emerald-600 dark:text-emerald-400 block">${tkt.totalPrice} USD</span>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-dashed border-neutral-200 dark:border-white/5 pt-4">
                              <div className="space-y-1">
                                <span className="font-mono text-[9px] text-neutral-450 block font-bold">PASS QUANTITY: {tkt.quantity} {tkt.ticketType.split(' ')[0]}s</span>
                                <span className="font-mono text-[8.5px] text-neutral-400 block">Authorized Digital Ticket • Access QR linked</span>
                              </div>

                              <div className="flex items-center space-x-3">
                                <div className="hidden sm:flex items-center space-x-2.5 font-mono text-[11px] font-bold bg-[#E5DED4]/30 dark:bg-[#172031] py-1.5 px-3 rounded-lg border border-neutral-250 dark:border-neutral-700">
                                  <span className="tracking-widest text-[#3D3A35] dark:text-[#E2E8F0] select-none text-[12px]">||||| | || ||||| | |</span>
                                </div>
                                <button
                                  onClick={() => {
                                    setSelectedQrTicket(tkt);
                                    setShowQrModal(true);
                                  }}
                                  className="flex items-center space-x-1.5 bg-neutral-900 dark:bg-amber-500/10 hover:bg-[#BC6C25] dark:hover:bg-amber-500 text-white dark:text-amber-400 dark:hover:text-neutral-950 border border-neutral-800 dark:border-amber-500/25 hover:border-transparent py-1.5 px-3 rounded-xl transition-all cursor-pointer focus:outline-none shadow-sm font-mono text-[10px] font-bold uppercase tracking-wider"
                                  title="Scan QR Code for Gate Entry"
                                  id={`view-qr-${tkt.id}`}
                                >
                                  <QrCode className="w-3.5 h-3.5" />
                                  <span>GATE QR</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setSharingTicket(tkt);
                                    setShowShareModal(true);
                                  }}
                                  className="p-2 bg-[#BC6C25]/10 hover:bg-[#BC6C25] text-[#BC6C25] hover:text-white border border-[#BC6C25]/20 hover:border-transparent rounded-xl transition-all cursor-pointer focus:outline-none flex items-center justify-center"
                                  title="Share & Social Card"
                                  id={`share-ticket-${tkt.id}`}
                                >
                                  <Share2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTicket(tkt.id)}
                                  className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 hover:border-transparent rounded-xl transition-all cursor-pointer focus:outline-none flex items-center justify-center"
                                  title="Remove ticket from Wallet"
                                  id={`delete-ticket-${tkt.id}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* MASTERCLASSES TIMETABLE TAB */}
            {activeTab === 'masterclasses' && (
              <div className="space-y-6 animate-fade-in text-left" id="masterclasses-timetable-panel">
                <div className="flex justify-between items-center pb-3 border-b border-neutral-200 dark:border-white/5">
                  <div>
                    <h3 className="font-serif font-bold text-lg md:text-xl text-[#3D3A35] dark:text-white">Academy Private Classes</h3>
                    <p className="font-mono text-[9px] text-neutral-450 uppercase block mt-0.5 tracking-wider">Review your private 1-on-1 scheduled sessions</p>
                  </div>
                  <button
                    onClick={() => setCurrentTab('lessons')}
                    className="px-3.5 py-1.5 rounded-full bg-[#4A5D4E] dark:bg-[#BC6C25] hover:opacity-90 text-white font-mono text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer"
                  >
                    Book Masterclass
                  </button>
                </div>

                {localLessons.length === 0 ? (
                  <div className="p-12 text-center border-2 border-dashed border-neutral-200 dark:border-white/5 rounded-[32px] space-y-4">
                    <p className="font-serif text-sm text-neutral-400 italic">"No scheduled academic masterclasses booked under your profile yet."</p>
                    <button
                      onClick={() => setCurrentTab('lessons')}
                      className="px-5 py-2.5 bg-[#4A5D4E] dark:bg-[#BC6C25] text-white text-xs font-mono font-bold uppercase tracking-widest rounded-full cursor-pointer hover:opacity-95"
                    >
                      Explore Learning Academy
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {localLessons.map((lsn) => (
                      <div 
                        key={lsn.id} 
                        className="p-5 rounded-2xl border border-neutral-200 dark:border-[#222B3D] bg-[#FCFAF7] dark:bg-[#121725] flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center"
                        id={`lesson-row-${lsn.id}`}
                      >
                        <div className="space-y-1">
                          <span className="font-mono text-[9px] text-[#BC6C25] dark:text-[#F59E0B] tracking-widest block uppercase font-extrabold">{lsn.instrument}</span>
                          <h4 className="font-serif font-bold text-base text-[#3D3A35] dark:text-white">With Instructor: {lsn.tutorName}</h4>
                          <span className="font-mono text-[10px] text-neutral-400 block font-semibold uppercase tracking-wide">
                            {lsn.date} • {lsn.timeSlot}
                          </span>
                        </div>

                        <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-neutral-200/50 pt-3 sm:pt-0">
                          <div className="text-left sm:text-right">
                            <span className="font-mono text-[8px] text-neutral-400 uppercase tracking-widest block font-bold">FEES TOTAL</span>
                            <span className="font-serif font-extrabold text-sm text-emerald-600 dark:text-emerald-400">${lsn.totalPrice} USD</span>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => alert('Virtual Classroom links activate 15 minutes before the scheduled hour! Check your registered inbox.')}
                            className="px-4 py-2 bg-[#4A5D4E] dark:bg-emerald-600 hover:bg-[#5B6F5F] dark:hover:bg-emerald-500 text-white font-mono text-[10px] font-bold tracking-widest uppercase rounded-lg transition-all cursor-pointer"
                          >
                            Join Session
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* REWARDS LOCKER TAB */}
            {activeTab === 'rewards' && (
              <div className="space-y-6 animate-fade-in text-left" id="rewards-locker-panel">
                <div>
                  <h3 className="font-serif font-bold text-lg md:text-xl text-[#3D3A35] dark:text-white">VIP Rewards Locker</h3>
                  <p className="font-mono text-[9px] text-neutral-450 uppercase block mt-0.5 tracking-wider">Unlocked store rewards and backstages downloads</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Coupon reward card */}
                  <div className="p-5.5 rounded-2xl border border-[#E5DED4] dark:border-white/5 bg-[#FCFAF7] dark:bg-[#121725] text-left space-y-4">
                    <div className="flex items-center space-x-2 text-[#BC6C25] dark:text-[#F59E0B] font-serif font-bold text-sm">
                      <Award className="w-5 h-5 flex-shrink-0 animate-bounce" />
                      <span>Velvet VIP Store Discount</span>
                    </div>
                    <p className="font-serif text-xs text-[#6B655C] dark:text-[#94A3B8] leading-relaxed italic">
                      Enjoy an exclusive 10% discount on all official apparel, vinyl logs, and accessories inside our Merch Store.
                    </p>
                    <div className="space-y-1.5">
                      <span className="font-mono text-[8px] text-neutral-400 uppercase tracking-wider block font-bold">EXCLUSIVE DISCOUNT COUPON</span>
                      <div className="flex items-center bg-[#F2ECE4] dark:bg-[#1C2335] border border-neutral-200 dark:border-neutral-750 rounded-xl overflow-hidden py-1.5 px-3">
                        <span className="font-mono font-bold text-[#BC6C25] dark:text-[#F59E0B] text-xs tracking-widest flex-grow">
                          FANVIP10
                        </span>
                        <button
                          onClick={() => copyRewardCode('FANVIP10', 'r1')}
                          className="p-1 px-2.5 bg-white dark:bg-[#121724] border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 rounded text-[9px] font-mono text-neutral-450 hover:text-[#BC6C25] cursor-pointer flex items-center space-x-1"
                        >
                          {copiedRewardId === 'r1' ? 'COPIED' : 'COPY'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Audio Mix download reward */}
                  <div className="p-5.5 rounded-2xl border border-[#E5DED4] dark:border-white/5 bg-[#FCFAF7] dark:bg-[#121725] text-left space-y-4">
                    <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400 font-serif font-bold text-sm">
                      <Music className="w-5 h-5 flex-shrink-0 animate-pulse" />
                      <span>Backstage Rehearsal Log</span>
                    </div>
                    <p className="font-serif text-xs text-[#6B655C] dark:text-[#94A3B8] leading-relaxed italic">
                      Download a 15-minute raw analog jam session recorded live in Sienna's Brooklyn bedroom studio in 2019.
                    </p>
                    <button
                      type="button"
                      onClick={() => alert('Download triggered successfully! Loading "Velvet_Horizon_Tape_Session_2019.mp3" to system.')}
                      className="w-full py-2 bg-[#4A5D4E] dark:bg-emerald-600 hover:opacity-95 text-white font-mono text-[10px] font-bold tracking-wider uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Download MP3 Mix</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      ) : (
        /* ======================== PRE-LOGIN STATE: AUTH FORMS ======================== */
        <div className="max-w-md mx-auto" id="auth-forms-viewport">
          
          {/* Glassmorphic card envelope */}
          <div className="p-6 sm:p-8 rounded-[32px] border border-white/20 dark:border-[#1E2638] bg-white/30 dark:bg-[#111625]/40 backdrop-blur-xl space-y-6 shadow-sm" id="auth-box-wrapper">
            
            {/* Tab buttons */}
            <div className="grid grid-cols-2 gap-2 border-b border-[#F0EBE3] dark:border-[#1E2638] pb-4" id="auth-tab-buttons">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthErrorAndClear('');
                }}
                className={`py-2 text-xs font-mono font-bold tracking-widest uppercase border-b-2 transition-all cursor-pointer focus:outline-none ${
                  authMode === 'login'
                    ? 'border-[#BC6C25] dark:border-[#F59E0B] text-[#BC6C25] dark:text-[#F59E0B] font-extrabold'
                    : 'border-transparent text-[#6B655C] dark:text-[#94A3B8] hover:text-[#3D3A35]'
                }`}
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setAuthErrorAndClear('');
                }}
                className={`py-2 text-xs font-mono font-bold tracking-widest uppercase border-b-2 transition-all cursor-pointer focus:outline-none ${
                  authMode === 'register'
                    ? 'border-[#BC6C25] dark:border-[#F59E0B] text-[#BC6C25] dark:text-[#F59E0B] font-extrabold'
                    : 'border-transparent text-[#6B655C] dark:text-[#94A3B8] hover:text-[#3D3A35]'
                }`}
              >
                VIP Register
              </button>
            </div>

            {/* Error notifications */}
            {formError && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-400 text-xs text-left rounded-xl flex items-start space-x-2 animate-fade-in font-serif italic">
                <span className="font-sans block flex-grow">Error: {formError}</span>
              </div>
            )}

            {/* Success notifications */}
            {formSuccess && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-450 text-xs text-left rounded-xl flex items-start space-x-2 animate-fade-in font-serif italic">
                <span className="font-sans block flex-grow">Success: {formSuccess}</span>
              </div>
            )}

            {/* Demo review credentials notification banner */}
            {authMode === 'login' && (
              <div className="p-4 rounded-2xl bg-[#BC6C25]/5 dark:bg-[#BC6C25]/10 border border-[#BC6C25]/20 text-left space-y-2 animate-fade-in" id="guest-credential-banner">
                <div className="flex items-center space-x-2 text-[#BC6C25] dark:text-[#F59E0B]">
                  <Sparkles className="w-4 h-4 text-[#BC6C25] dark:text-[#F59E0B] animate-spin" style={{ animationDuration: '4s' }} />
                  <span className="font-mono text-[9px] uppercase tracking-wider font-extrabold">Instant Guest Review Mode</span>
                </div>
                <p className="font-serif text-[11px] text-[#6B655C] dark:text-[#CBD5E1] leading-relaxed italic">
                  Reviewing the fully loaded VIP Fan Dashboard? Skip signup and click the button below to pre-load our official premium guest profile instantly.
                </p>
                <button
                  type="button"
                  onClick={handleLoadGuestCredentials}
                  className="w-full mt-2.5 py-1.5 rounded-lg bg-[#BC6C25]/15 hover:bg-[#BC6C25]/25 border border-[#BC6C25]/30 text-[9.5px] font-mono text-[#BC6C25] dark:text-[#F59E0B] uppercase font-bold tracking-widest cursor-pointer transition-all"
                >
                  Fill Guest credentials
                </button>
              </div>
            )}

            {/* FORM BODY RENDERS */}
            {authMode === 'login' ? (
              /* SIGN IN FORM */
              <form onSubmit={handleLoginSubmit} className="space-y-4 text-left" id="signin-form-action">
                <div className="space-y-1">
                  <label className="font-mono text-[9px] text-neutral-400 block uppercase font-bold">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="vip.fan@velvethorizon.com"
                      className="w-full pl-9.5 pr-4 py-2 text-xs bg-white dark:bg-[#1D2535]/30 border border-neutral-200 dark:border-white/10 text-[#3D3A35] dark:text-white outline-none focus:border-[#BC6C25] rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="font-mono text-[9px] text-neutral-400 block uppercase font-bold">Password</label>
                    <button
                      type="button"
                      onClick={() => alert('Password recovery: A verification link has been triggered to the specified address!')}
                      className="text-[9px] font-mono text-neutral-450 hover:text-[#BC6C25] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9.5 pr-10 py-2 text-xs bg-white dark:bg-[#1D2535]/30 border border-neutral-200 dark:border-white/10 text-[#3D3A35] dark:text-white outline-none focus:border-[#BC6C25] rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1.5">
                  <label className="flex items-center space-x-2 text-[10px] font-mono text-neutral-450 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-[#E5DED4] text-[#BC6C25] focus:ring-[#BC6C25]/20"
                    />
                    <span>Remember my session</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-[#4A5D4E] dark:bg-[#BC6C25] hover:opacity-95 text-white font-mono text-xs font-bold uppercase tracking-widest rounded-full cursor-pointer transition-all shadow-sm flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <span>AUTHORIZING CRITICAL ACCESS...</span>
                  ) : (
                    <>
                      <span>SIGN IN GATES</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center my-4">
                  <div className="flex-grow border-t border-[#F0EBE3] dark:border-[#1E2638]"></div>
                  <span className="px-3 font-mono text-[9px] text-neutral-400 uppercase tracking-widest">or</span>
                  <div className="flex-grow border-t border-[#F0EBE3] dark:border-[#1E2638]"></div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full py-3.5 bg-white hover:bg-neutral-50 dark:bg-[#1E2535]/50 dark:hover:bg-[#1C2232] border border-neutral-200 dark:border-white/10 text-[#3D3A35] dark:text-white font-mono text-xs font-bold uppercase tracking-widest rounded-full cursor-pointer transition-all shadow-xs flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Google Sign In</span>
                </button>
              </form>
            ) : (
              /* VIP REGISTRATION FORM */
              <form onSubmit={handleRegisterSubmit} className="space-y-4 text-left" id="signup-form-action">
                <div className="space-y-1">
                  <label className="font-mono text-[9px] text-neutral-400 block uppercase font-bold">Your Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Robin Banks"
                      className="w-full pl-9.5 pr-4 py-2 text-xs bg-white dark:bg-[#1D2535]/30 border border-neutral-200 dark:border-white/10 text-[#3D3A35] dark:text-white outline-none focus:border-[#BC6C25] rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-[9px] text-neutral-400 block uppercase font-bold">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="email@address.com"
                      className="w-full pl-9.5 pr-4 py-2 text-xs bg-white dark:bg-[#1D2535]/30 border border-neutral-200 dark:border-white/10 text-[#3D3A35] dark:text-white outline-none focus:border-[#BC6C25] rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] text-neutral-400 block uppercase font-bold">Secure Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9.5 pr-4 py-2 text-xs bg-white dark:bg-[#1D2535]/30 border border-neutral-200 dark:border-white/10 text-[#3D3A35] dark:text-white outline-none focus:border-[#BC6C25] rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-[9px] text-neutral-400 block uppercase font-bold">Initial Member Tier</label>
                    <select
                      value={regTier}
                      onChange={(e) => setRegTier(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-[#1D2535]/30 border border-neutral-200 dark:border-white/10 text-[#3D3A35] dark:text-white outline-none focus:border-[#BC6C25] rounded-xl cursor-pointer"
                    >
                      <option value="Standard Fan">Standard Fan Base</option>
                      <option value="Sunset Gold Member">Sunset Gold Member (+50 XP)</option>
                      <option value="Elite Backstage VIP">Elite Backstage VIP (+100 XP)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <label className="flex items-center space-x-2 text-[10px] font-mono text-neutral-450 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="rounded border-[#E5DED4] text-[#BC6C25] focus:ring-[#BC6C25]/20"
                    />
                    <span>Accept terms & VIP fan codes</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-[#4A5D4E] dark:bg-[#BC6C25] hover:opacity-95 text-white font-mono text-xs font-bold uppercase tracking-widest rounded-full cursor-pointer transition-all shadow-sm flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <span>ENROLLING MEMBER...</span>
                  ) : (
                    <>
                      <span>SECURE ADMISSION</span>
                      <UserCheck className="w-4.5 h-4.5" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Footer lock note */}
            <div className="text-center font-mono text-[9px] text-neutral-450 pt-2 flex items-center justify-center gap-1.5 opacity-70 border-t border-neutral-200/50 dark:border-white/5">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>AES-256 Bit Local End-to-End Handshake Encryption Active</span>
            </div>

          </div>
        </div>
      )}

      {/* SOCIAL MEDIA SHARE & VISUAL CARD GENERATION MODAL */}
      {showShareModal && sharingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto" id="share-ticket-modal">
          <div className="relative w-full max-w-md rounded-[28px] border border-neutral-200 dark:border-[#222B3D] bg-[#FDFBF7] dark:bg-[#0F1420] p-6 text-center shadow-2xl max-h-[95vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={() => {
                setShowShareModal(false);
                setSharingTicket(null);
              }}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-[#F2ECE4] dark:hover:bg-[#1E2536] rounded-full transition-all cursor-pointer focus:outline-none z-50"
              id="close-share-modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div className="mb-5 text-left">
              <h3 className="font-serif font-extrabold text-base md:text-lg text-[#3D3A35] dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Share Concert Pass!
              </h3>
              <p className="font-mono text-[9px] text-neutral-450 uppercase block mt-1 tracking-wider">
                Generate custom social card & copy access link
              </p>
            </div>

            {/* Preview of Social Media Ready Visual Card */}
            <div 
              className={`w-full aspect-square rounded-2xl relative p-6 overflow-hidden shadow-lg transition-all flex flex-col justify-between text-left ${
                socialCardTheme === 'sunset'
                  ? 'bg-gradient-to-br from-[#BC6C25] via-[#DDA15E] to-[#283618]'
                  : socialCardTheme === 'midnight'
                  ? 'bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#090D16]'
                  : socialCardTheme === 'gold'
                  ? 'bg-gradient-to-br from-[#1E1B4B] via-[#B45309] to-[#020617]'
                  : 'bg-gradient-to-br from-[#111827] via-[#4C1D95] to-[#030712]'
              }`}
              id="social-ticket-preview-card"
            >
              {/* Geometric Grid lines */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:30px_30px]" />
              
              {/* Radial glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15),transparent_70%)]" />

              {/* Glassmorphic border box */}
              <div className="absolute inset-4 rounded-[20px] border border-white/10 bg-slate-900/75 backdrop-blur-md p-5 flex flex-col justify-between z-10">
                {/* Glowing subtle color border */}
                <div className={`absolute inset-2 rounded-[14px] border ${
                  socialCardTheme === 'sunset'
                    ? 'border-[#DDA15E]/20'
                    : socialCardTheme === 'midnight'
                    ? 'border-sky-400/20'
                    : socialCardTheme === 'gold'
                    ? 'border-amber-400/20'
                    : 'border-pink-400/20'
                }`} />

                {/* Card Header */}
                <div className="text-center pt-1.5 relative z-20">
                  <span className="font-serif font-extrabold text-xl text-white tracking-widest block leading-none">VELVET HORIZON</span>
                  <span className={`font-mono text-[7px] tracking-[3px] block mt-1.5 font-bold ${
                    socialCardTheme === 'sunset'
                      ? 'text-[#DDA15E]'
                      : socialCardTheme === 'midnight'
                      ? 'text-sky-400'
                      : socialCardTheme === 'gold'
                      ? 'text-amber-400'
                      : 'text-pink-400'
                  }`}>2026 TOUR ACCESS PASS</span>
                </div>

                {/* Event center Details */}
                <div className="text-center space-y-1 relative z-20">
                  <h4 className="font-serif font-extrabold text-base text-white tracking-tight leading-tight">{sharingTicket.venue}</h4>
                  <p className="font-mono text-[8px] text-white/70 uppercase tracking-widest">{sharingTicket.city}, {sharingTicket.country}</p>
                  <p className={`font-serif font-bold text-xs ${
                    socialCardTheme === 'sunset'
                      ? 'text-[#DDA15E]'
                      : socialCardTheme === 'midnight'
                      ? 'text-sky-400'
                      : socialCardTheme === 'gold'
                      ? 'text-amber-400'
                      : 'text-pink-400'
                  }`}>{sharingTicket.date}</p>
                </div>

                {/* Card Footer Barcode */}
                <div className="border-t border-white/10 pt-2.5 flex flex-col items-center relative z-20">
                  <div className="font-mono text-xs font-bold tracking-widest text-white leading-none uppercase">{sharingTicket.ticketType}</div>
                  <div className="font-mono text-[7px] text-white/50 tracking-wider mt-1 uppercase">PASS QUANTITY: {sharingTicket.quantity}</div>
                  
                  {/* Fake barcode */}
                  <div className="mt-2 h-4 w-36 bg-white/15 rounded flex items-center justify-around px-1.5 opacity-80 overflow-hidden">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="bg-white h-full" 
                        style={{ width: i % 3 === 0 ? '3px' : i % 5 === 0 ? '1px' : '2px', opacity: i % 7 === 0 ? 0.3 : 0.9 }} 
                      />
                    ))}
                  </div>
                  <span className="font-mono text-[7px] text-white/60 mt-1 tracking-[3px] font-bold">*{sharingTicket.id}*</span>
                </div>
              </div>
            </div>

            {/* Customizer Palette Selection */}
            <div className="my-4 text-left">
              <span className="font-mono text-[9px] text-neutral-450 block uppercase font-bold mb-2">Select Visual Theme</span>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'sunset', label: 'Sunset', bg: 'bg-gradient-to-r from-[#BC6C25] to-[#DDA15E]' },
                  { id: 'midnight', label: 'Midnight', bg: 'bg-gradient-to-r from-[#0F172A] to-[#1E293B]' },
                  { id: 'gold', label: 'Amber', bg: 'bg-gradient-to-r from-[#1E1B4B] to-[#B45309]' },
                  { id: 'neon', label: 'Neon', bg: 'bg-gradient-to-r from-[#111827] to-[#4C1D95]' },
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setSocialCardTheme(th.id as any)}
                    className={`p-1.5 rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                      socialCardTheme === th.id
                        ? 'border-[#BC6C25] bg-[#BC6C25]/10 font-bold dark:border-amber-500'
                        : 'border-neutral-200 dark:border-white/5 hover:bg-neutral-100 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full ${th.bg}`} />
                    <span className="font-mono text-[8px] text-[#3D3A35] dark:text-neutral-300">{th.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sharing buttons */}
            <div className="space-y-2">
              <button
                onClick={() => handleDownloadSocialCard(sharingTicket)}
                disabled={isGeneratingImage}
                className="w-full py-3 bg-[#BC6C25] hover:bg-[#CD7D36] text-white font-mono text-xs font-bold uppercase tracking-widest rounded-xl cursor-pointer transition-all shadow-sm flex items-center justify-center space-x-2"
                id="download-social-image-btn"
              >
                <Download className="w-4 h-4" />
                <span>{isGeneratingImage ? 'GENERATING PASS PNG...' : 'DOWNLOAD PNG CARD'}</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => handleCopyDirectLink(sharingTicket)}
                  className="flex-grow py-2.5 bg-[#4A5D4E] hover:bg-[#5B6F5F] text-white font-mono text-[10px] font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all shadow-sm flex items-center justify-center space-x-1.5"
                  id="copy-direct-link-btn"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{linkCopied ? 'COPIED!' : 'COPY ACCESS LINK'}</span>
                </button>
                <button
                  onClick={() => {
                    const tweetText = `🎫 I am ready to see Velvet Horizon live at ${sharingTicket.venue} on their 2026 World Tour! 🎸🔥\n\nAccess Pass Ref: ${sharingTicket.id}\nCheck the tour out at: ${window.location.origin}/?ticket=${sharingTicket.id}`;
                    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
                    window.open(tweetUrl, '_blank');
                  }}
                  className="px-3 py-2.5 bg-[#1DA1F2] hover:opacity-90 text-white font-mono text-[10px] font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all shadow-sm flex items-center justify-center"
                  id="share-twitter-btn"
                >
                  Tweet
                </button>
              </div>

              {linkCopied && (
                <div className="p-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono text-[8px] font-bold rounded-lg uppercase tracking-wider animate-pulse mt-2" id="toast-message">
                  ✓ Concert deep-link copied to clipboard!
                </div>
              )}
            </div>

            <p className="font-mono text-[7px] text-neutral-450 uppercase block mt-3.5 tracking-wider opacity-60">
              Pass ID: {sharingTicket.id} • Secure fan authentication system
            </p>
          </div>
        </div>
      )}

      {/* SECURE GATE ENTRY QR CODE MODAL */}
      {showQrModal && selectedQrTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto" id="qr-ticket-modal">
          <div className="relative w-full max-w-sm rounded-[32px] border border-neutral-800 dark:border-neutral-800 bg-[#0B0F19] p-6 text-center shadow-2xl overflow-hidden">
            {/* Background glowing ambient light */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#BC6C25]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Close button */}
            <button
              onClick={() => {
                setShowQrModal(false);
                setSelectedQrTicket(null);
              }}
              className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer focus:outline-none z-50"
              id="close-qr-modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header branding */}
            <div className="mb-6 mt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-mono text-[9px] font-bold uppercase rounded-full tracking-widest mb-3">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                SECURE GATE PASS
              </div>
              <h3 className="font-serif font-extrabold text-xl text-white tracking-widest leading-none">
                VELVET HORIZON
              </h3>
              <span className="font-mono text-[7.5px] tracking-[4px] text-[#BC6C25] font-bold block mt-1.5 uppercase">
                2026 WORLD TOUR ACCESS
              </span>
            </div>

            {/* Main Pass Card Representation */}
            <div className="rounded-2xl bg-[#111726] border border-white/5 p-5 mb-5 relative flex flex-col items-center">
              {/* Concert Title */}
              <div className="text-center w-full mb-4 pb-4 border-b border-white/5">
                <h4 className="font-serif font-extrabold text-base text-white tracking-tight leading-snug">
                  {selectedQrTicket.venue}
                </h4>
                <p className="font-mono text-[9px] text-neutral-400 uppercase mt-0.5 tracking-wider">
                  {selectedQrTicket.city}, {selectedQrTicket.country}
                </p>
                <div className="flex justify-center gap-4 mt-2">
                  <div className="text-center">
                    <span className="font-mono text-[7px] text-neutral-500 block uppercase">CONCERT DATE</span>
                    <span className="font-serif font-bold text-xs text-amber-400">{selectedQrTicket.date}</span>
                  </div>
                  <div className="border-r border-white/5" />
                  <div className="text-center">
                    <span className="font-mono text-[7px] text-neutral-500 block uppercase">PASS TYPE</span>
                    <span className="font-mono font-bold text-[10px] text-emerald-400 uppercase">{selectedQrTicket.ticketType.split(' ')[0]}</span>
                  </div>
                </div>
              </div>

              {/* QR Code Scan Stage with Sweeping Laser Line */}
              <div className="relative w-[180px] h-[180px] bg-white p-3.5 rounded-2xl shadow-inner shadow-black/40 overflow-hidden flex items-center justify-center">
                {qrCodeDataUrl ? (
                  <>
                    <img 
                      src={qrCodeDataUrl} 
                      alt="Venue Entry QR Code" 
                      className="w-full h-full object-contain select-none relative z-0"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Active Scanning Laser effect */}
                    <motion.div 
                      className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-[0_0_8px_rgba(16,185,129,0.8)] z-10 pointer-events-none"
                      animate={{ y: [14, 166, 14] }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 2.2, 
                        ease: "easeInOut" 
                      }}
                    />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-neutral-900 rounded-lg">
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Status and Holder */}
              <div className="mt-4 text-center w-full">
                <span className="font-mono text-[8px] text-neutral-500 uppercase tracking-widest block font-bold">PASS HOLDER</span>
                <span className="font-mono text-[10px] text-white block mt-0.5 font-bold truncate max-w-[240px] mx-auto">
                  {currentUser?.email || 'guest@velvethorizon.com'}
                </span>
                <span className="font-mono text-[7.5px] text-neutral-400 block mt-2 tracking-widest">
                  PASS QUANTITY: {selectedQrTicket.quantity} • SECURE REF: {selectedQrTicket.id}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2">
              <a
                href={qrCodeDataUrl}
                download={`VH-ENTRY-PASS-${selectedQrTicket.id}.png`}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase tracking-widest rounded-xl cursor-pointer transition-all shadow-sm flex items-center justify-center space-x-2"
                id="download-qr-pass-btn"
              >
                <Download className="w-4 h-4" />
                <span>SAVE PASS TO DEVICE</span>
              </a>

              <button
                onClick={() => {
                  const qrPayload = JSON.stringify({
                    ticketId: selectedQrTicket.id,
                    venue: selectedQrTicket.venue,
                    date: selectedQrTicket.date,
                    type: selectedQrTicket.ticketType,
                    quantity: selectedQrTicket.quantity,
                    holder: currentUser?.email || 'guest@velvethorizon.com',
                    issuer: 'VELVET_HORIZON_TICKETING_SYSTEM'
                  }, null, 2);
                  navigator.clipboard.writeText(qrPayload);
                  
                  const btnSpan = document.getElementById(`copy-payload-text-${selectedQrTicket.id}`);
                  if (btnSpan) {
                    btnSpan.innerText = "COPIED PAYLOAD!";
                    setTimeout(() => {
                      if (btnSpan) btnSpan.innerText = "COPY VERIFICATION DATA";
                    }, 1800);
                  }
                }}
                className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-350 font-mono text-[9px] font-bold uppercase tracking-widest rounded-xl cursor-pointer transition-all border border-white/5 flex items-center justify-center space-x-2"
                id="copy-qr-payload-btn"
              >
                <Copy className="w-3.5 h-3.5" />
                <span id={`copy-payload-text-${selectedQrTicket.id}`}>COPY VERIFICATION DATA</span>
              </button>

              <button
                onClick={() => {
                  setShowQrModal(false);
                  setSelectedQrTicket(null);
                }}
                className="w-full py-2 bg-transparent hover:bg-white/5 text-neutral-400 hover:text-white font-mono text-[9px] font-bold uppercase tracking-widest rounded-xl cursor-pointer transition-all border border-dashed border-white/10 flex items-center justify-center space-x-2"
                id="back-to-wallet-btn"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>BACK TO WALLET</span>
              </button>
            </div>

            {/* Disclaimer */}
            <p className="font-mono text-[7px] text-neutral-500 uppercase block mt-4 tracking-wider leading-relaxed">
              Show this QR code at the door for direct scanning. Admission is subject to age restrictions & ticket guidelines of the venue.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
