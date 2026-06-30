import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, CreditCard, Plus, Minus, Trash2, CheckCircle, Instagram, Youtube, Facebook, Music2, ArrowUp, Disc, Share2, Printer, Mail, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Import Custom components
import Navbar from './components/Navbar';
import Home from './components/Home';
import Tour from './components/Tour';
import Discography from './components/Discography';
import MerchStore from './components/MerchStore';
import LessonBooking from './components/LessonBooking';
import Blog from './components/Blog';
import FAQs from './components/FAQs';
import About from './components/About';
import Instruments from './components/Instruments';
import PhotoGallery from './components/PhotoGallery';
import Login from './components/Login';
import Admin from './components/Admin';
import MiniMusicPlayer from './components/MiniMusicPlayer';
import GeminiChatbot from './components/GeminiChatbot';
import ShareModal from './components/ShareModal';
import FooterSocialIcon from './components/FooterSocialIcon';

// Import Types
import { MerchItem, CartItem, SavedTicket } from './types';
import { BAND_BIO, MERCH_STORE } from './data';

import { auth } from './lib/firebase.ts';
import { onAuthStateChanged } from 'firebase/auth';
import { setAuthToken, syncAuthWithBackend, syncCartWithDb } from './lib/api.ts';

export default function App() {
  const [currentTab, setCurrentTab] = useState(() => {
    if (window.location.pathname === '/admin') {
      return 'admin';
    }
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && ['home', 'tour', 'discography', 'merch', 'lessons', 'instruments', 'gallery', 'about', 'blog', 'faq', 'login', 'admin'].includes(tab)) {
      return tab;
    }
    return 'home';
  });

  // Keep URL parameters updated when active tab changes
  useEffect(() => {
    const url = new URL(window.location.href);
    if (currentTab === 'admin') {
      url.pathname = '/admin';
      url.search = '';
    } else {
      url.pathname = '/';
      const params = new URLSearchParams(url.search);
      if (currentTab === 'home') {
        params.delete('tab');
      } else {
        params.set('tab', currentTab);
      }
      url.search = params.toString();
    }
    window.history.replaceState(null, '', url.toString());
  }, [currentTab]);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Merchandise dynamic state
  const [merchItems, setMerchItems] = useState<MerchItem[]>(() => {
    const saved = localStorage.getItem('vh_merch_items_v1');
    return saved ? JSON.parse(saved) : MERCH_STORE;
  });

  // Tutorial masterclass dynamic state
  const [tutorialClasses, setTutorialClasses] = useState<any[]>(() => {
    const saved = localStorage.getItem('vh_tutorial_classes_v1');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "class-1",
        title: "Modular Synthesis & Analog Oscillators",
        tutorName: "Julian Vance",
        duration: "2h 15m",
        level: "Masterclass",
        description: "Dive deep into hardware oscillators, modulating control voltages, and building towering synth patches on the vintage Roland Juno-106 and Moog systems.",
        videoPlaceholderUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=600",
        lessonsCount: 8
      },
      {
        id: "class-2",
        title: "Atmospheric Dual Delay & Space Reverbs",
        tutorName: "Elena Rostova",
        duration: "1h 45m",
        level: "Intermediate",
        description: "Recreate Elena's iconic cathedral delay chains. Learn syncopated dual delay splits, tone saturation, and atmospheric guitar decay stacking.",
        videoPlaceholderUrl: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&q=80&w=600",
        lessonsCount: 6
      },
      {
        id: "class-3",
        title: "Electronic-Rock low-end & Sub-bass logic",
        tutorName: "Marcus \"Rex\" Thorn",
        duration: "1h 30m",
        level: "Beginner",
        description: "Build a rock-solid rhythmic foundation. Program custom analog drum machines, compress heavy sub-bass layers, and synchronize guitars with square synth waves.",
        videoPlaceholderUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
        lessonsCount: 5
      },
      {
        id: "class-4",
        title: "Polyrhythms & Synthesized Trigger Drums",
        tutorName: "Chloe Mercer",
        duration: "2h 40m",
        level: "Masterclass",
        description: "Perfect your timing on hybrid acoustic-digital drum pads. We explore complex tempos, odd meter signatures, and routing drum synth samples in a live environment.",
        videoPlaceholderUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400",
        lessonsCount: 10
      },
      {
        id: "class-5",
        title: "Harmonic Modes, Lyre & Anthemic Arrangement",
        tutorName: "Sienna Brooks",
        duration: "1h 55m",
        level: "Intermediate",
        description: "The complete roadmap of anthemic arrangement. Discover how we construct emotional build-ups, manage chord progressions, and layer vocal tracks for commercial appeal.",
        videoPlaceholderUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400",
        lessonsCount: 7
      }
    ];
  });

  // Watch and persist dynamic admin lists
  useEffect(() => {
    localStorage.setItem('vh_merch_items_v1', JSON.stringify(merchItems));
  }, [merchItems]);

  useEffect(() => {
    localStorage.setItem('vh_tutorial_classes_v1', JSON.stringify(tutorialClasses));
  }, [tutorialClasses]);

  // Global Loading & Asset Initialization State
  const [isInitializing, setIsInitializing] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Initializing acoustic nodes...');

  useEffect(() => {
    // Phase 1: load sessions
    const timer1 = setTimeout(() => {
      setLoadingProgress(25);
      setLoadingMessage('Loading user state & session tokens...');
    }, 250);

    // Phase 2: preload critical styles/media
    const timer2 = setTimeout(() => {
      setLoadingProgress(55);
      setLoadingMessage('Preloading Elysian audio snippets...');
    }, 600);

    // Phase 3: mount widgets and interface elements
    const timer3 = setTimeout(() => {
      setLoadingProgress(85);
      setLoadingMessage('Syncing discography data logs...');
    }, 950);

    // Phase 4: complete initialization
    const timer4 = setTimeout(() => {
      setLoadingProgress(100);
      setLoadingMessage('Done! Welcome to Velvet Horizon.');
    }, 1250);

    const timer5 = setTimeout(() => {
      setIsInitializing(false);
    }, 1500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, []);

  // Floating 'Back to Top' state
  const [showBackToTop, setShowBackToTop] = useState(false);
  // Scroll Progress Bar state
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Toggle back to top button
      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }

      // Calculate scroll progress percentage
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
      } else {
        setScrollProgress(0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset scroll and progress when switching tabs
  useEffect(() => {
    window.scrollTo(0, 0);
    setScrollProgress(0);
  }, [currentTab]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // User authentication state
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; tier: string } | null>(() => {
    const saved = localStorage.getItem('vh_user_v1');
    return saved ? JSON.parse(saved) : null;
  });

  // Track saved concert tickets globally to sync with Navbar badge & Tour component & Login dashboard
  const [savedTickets, setSavedTickets] = useState<SavedTicket[]>(() => {
    const saved = localStorage.getItem('vh_booked_tickets_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  // Share active login subtab state
  const [loginSubTab, setLoginSubTab] = useState<'profile' | 'tickets' | 'masterclasses' | 'rewards'>('profile');

  // Cart Coupon/Discount states
  const [cartPromo, setCartPromo] = useState('');
  const [isPromoApplied, setIsPromoApplied] = useState(false);

  // Checkout modal states
  const [checkoutStep, setCheckoutStep] = useState<'idle' | 'success'>('idle');
  const [billingName, setBillingName] = useState('');
  const [billingEmail, setBillingEmail] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [checkoutInvoice, setCheckoutInvoice] = useState<{ orderId: string; date: string } | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Email invoice states
  const [emailInput, setEmailInput] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    if (checkoutStep === 'success' && billingEmail) {
      setEmailInput(billingEmail);
      setEmailStatus('idle');
      setEmailError('');
    }
  }, [checkoutStep, billingEmail]);

  // Theme state
  const [theme, setTheme] = useState<'natural' | 'midnight'>(() => {
    const saved = localStorage.getItem('vh_theme_v1');
    return saved === 'midnight' ? 'midnight' : 'natural';
  });

  useEffect(() => {
    if (theme === 'midnight') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('vh_theme_v1', theme);
  }, [theme]);

  // Listen to Firebase Auth changes to synchronize with PostgreSQL database
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
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
        } catch (err) {
          console.error("Failed to sync on auth change:", err);
        }
      } else {
        setAuthToken(null);
        setCurrentUser(null);
        localStorage.removeItem('vh_user_v1');
      }
    });

    return () => unsubscribe();
  }, []);

  // Load existing shopping cart from localStorage if present
  useEffect(() => {
    const savedCart = localStorage.getItem('vh_cart_v1');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const saveCartToStorage = async (updatedCart: CartItem[]) => {
    setCart(updatedCart);
    localStorage.setItem('vh_cart_v1', JSON.stringify(updatedCart));

    if (auth.currentUser) {
      try {
        await syncCartWithDb(updatedCart);
      } catch (err) {
        console.error("Failed to sync cart with PostgreSQL:", err);
      }
    }
  };

  const handleAddToCart = (product: MerchItem, size?: string) => {
    // Unique ID combo of Item ID + Size chosen
    const cartId = size ? `${product.id}-${size}` : product.id;

    const existingIndex = cart.findIndex((item) => item.id === cartId);
    let updatedCart: CartItem[] = [];

    if (existingIndex > -1) {
      updatedCart = cart.map((item, idx) => {
        if (idx === existingIndex) {
          return {
            ...item,
            quantity: Math.min(item.merchItem.stock, item.quantity + 1)
          };
        }
        return item;
      });
    } else {
      updatedCart = [
        ...cart,
        {
          id: cartId,
          merchItem: product,
          quantity: 1,
          selectedSize: size
        }
      ];
    }

    saveCartToStorage(updatedCart);
    setIsCartOpen(true); // Open drawer automatically to confirm addition visually
  };

  const handleUpdateCartQuantity = (cartId: string, delta: number) => {
    const updatedCart = cart
      .map((item) => {
        if (item.id === cartId) {
          const newQty = item.quantity + delta;
          return {
            ...item,
            quantity: Math.max(1, Math.min(item.merchItem.stock, newQty))
          };
        }
        return item;
      });
    saveCartToStorage(updatedCart);
  };

  const handleRemoveFromCart = (cartId: string) => {
    const updatedCart = cart.filter((item) => item.id !== cartId);
    saveCartToStorage(updatedCart);
  };

  const applyCartPromo = () => {
    const cleanPromo = cartPromo.trim().toUpperCase();
    if (cleanPromo === 'TRIVIA20' || cleanPromo === 'VELVET20') {
      setIsPromoApplied(true);
    } else {
      alert('Invalid promo code. Solve a Discography Album Trivia quiz to obtain a secure code!');
    }
  };

  // Pricing calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.merchItem.price * item.quantity, 0);
  const cartDiscount = isPromoApplied ? cartSubtotal * 0.2 : 0;
  const cartShipping = cartSubtotal > 100 || cartSubtotal === 0 ? 0 : 5; // Free shipping on orders over $100
  const cartTotalTotal = Math.round(cartSubtotal - cartDiscount + cartShipping);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billingName || !billingEmail || !billingAddress) {
      alert('Please fill in your shipping details completely to process order.');
      return;
    }

    const oId = 'VH-SHP-' + Math.floor(100000 + Math.random() * 900000);
    const orderDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    setCheckoutInvoice({
      orderId: oId,
      date: orderDate
    });
    setCheckoutStep('success');
  };

  const completeAndClearInvoice = () => {
    // Clear cart entirely upon order success
    setCart([]);
    localStorage.removeItem('vh_cart_v1');
    setCheckoutStep('idle');
    setCheckoutInvoice(null);
    setBillingName('');
    setBillingEmail('');
    setBillingAddress('');
    setCartPromo('');
    setIsPromoApplied(false);
    setIsCartOpen(false);
    setEmailInput('');
    setEmailStatus('idle');
    setEmailError('');
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput || !emailRegex.test(emailInput)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailError('');
    setEmailStatus('sending');

    // Simulate sending email receipt
    setTimeout(() => {
      setEmailStatus('sent');
    }, 2000);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F6F2] dark:bg-[#0A0D14] text-[#3D3A35] dark:text-[#E2E8F0] font-sans selection:bg-[#BC6C25] selection:text-white" id="main-band-website">
      {/* Scroll Progress Bar */}
      <div 
        id="scroll-progress-bar"
        className="fixed top-0 left-0 right-0 h-1 bg-[#BC6C25] dark:bg-emerald-500 z-[100] transition-all duration-75 ease-out origin-left"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* 1. Header Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        cartItemsCount={totalCartCount}
        toggleCartOpen={() => setIsCartOpen(!isCartOpen)}
        theme={theme}
        setTheme={setTheme}
        currentUser={currentUser}
        savedTicketsCount={savedTickets.length}
        loginSubTab={loginSubTab}
        setLoginSubTab={setLoginSubTab}
      />

      {/* 2. Main Active Render Viewport */}
      <main className="flex-grow pt-24" id="view-route-container">
        {currentTab === 'home' && <Home setCurrentTab={setCurrentTab} />}
        {currentTab === 'tour' && (
          <Tour 
            savedTickets={savedTickets}
            setSavedTickets={setSavedTickets}
            currentUser={currentUser}
            setCurrentTab={setCurrentTab}
          />
        )}
        {currentTab === 'discography' && <Discography />}
        {currentTab === 'merch' && <MerchStore onAddToCart={handleAddToCart} cart={cart} merchItems={merchItems} />}
        {currentTab === 'lessons' && (
          <LessonBooking 
            currentUser={currentUser}
            setCurrentTab={setCurrentTab}
            tutorialClasses={tutorialClasses}
          />
        )}
        {currentTab === 'instruments' && <Instruments />}
        {currentTab === 'gallery' && <PhotoGallery />}
        {currentTab === 'about' && <About />}
        {currentTab === 'blog' && <Blog setCurrentTab={setCurrentTab} />}
        {currentTab === 'faq' && <FAQs />}
        {currentTab === 'login' && (
          <Login 
            currentUser={currentUser} 
            setCurrentUser={setCurrentUser} 
            setCurrentTab={setCurrentTab} 
            savedTickets={savedTickets}
            setSavedTickets={setSavedTickets}
            activeTab={loginSubTab}
            setActiveTab={setLoginSubTab}
          />
        )}
        {currentTab === 'admin' && (
          <Admin 
            setCurrentTab={setCurrentTab} 
            merchItems={merchItems}
            setMerchItems={setMerchItems}
            tutorialClasses={tutorialClasses}
            setTutorialClasses={setTutorialClasses}
          />
        )}
      </main>

      {/* 3. Sliding Shopping Bag Panel */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" id="shopping-cart-drawer">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white dark:bg-[#111625] border-l border-[#E5DED4] dark:border-[#1E2638] shadow-xl flex flex-col pt-6 text-left">
              {/* Drawer Header */}
              <div className="px-6 pb-4 border-b border-[#E5DED4] dark:border-[#1E2638] flex items-center justify-between">
                <div className="flex items-center space-x-2.5 text-[#BC6C25] dark:text-[#F59E0B]">
                  <ShoppingBag className="w-5 h-5" />
                  <h2 className="font-serif font-bold text-base text-[#3D3A35] dark:text-[#E2E8F0]">
                    Your Shopping Bag ({totalCartCount})
                  </h2>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-3 py-1.5 rounded-full bg-[#F2ECE4] dark:bg-[#1E2638] border border-[#E5DED4] dark:border-[#2A354F] text-[#6B655C] dark:text-[#94A3B8] hover:bg-[#E5DED4] dark:hover:bg-[#2A354F] hover:text-[#3D3A35] dark:hover:text-white text-[10px] font-mono tracking-widest uppercase cursor-pointer focus:outline-none font-bold"
                >
                  Close
                </button>
              </div>

              {/* Drawer Body Scroll Content */}
              <div className="flex-grow overflow-y-auto px-6 py-4 space-y-4">
                {checkoutStep === 'idle' ? (
                  /* Idle items stream view */
                  cart.length === 0 ? (
                    <div className="text-center py-20 space-y-3" id="empty-cart-splash">
                      <div className="w-12 h-12 rounded-full bg-[#F2ECE4] dark:bg-[#1E2638] border border-[#E5DED4] dark:border-[#2A354F] flex items-center justify-center text-[#BC6C25] dark:text-[#F59E0B] mx-auto">
                        <ShoppingBag className="w-5 h-5 animate-pulse" />
                      </div>
                      <p className="font-serif text-xs text-[#6B655C] dark:text-[#94A3B8] leading-relaxed max-w-xs mx-auto italic">
                        "Your shopping bag is currently empty. Explore our records and organic apparel sizes in the virtual store!"
                      </p>
                      <button
                        onClick={() => {
                          setCurrentTab('merch');
                          setIsCartOpen(false);
                        }}
                        className="px-5 py-2.5 bg-[#4A5D4E] dark:bg-[#BC6C25] hover:bg-[#5B6F5F] dark:hover:bg-[#CD7D36] text-white text-[10px] font-mono font-bold tracking-widest uppercase rounded-full cursor-pointer mt-2 inline-block focus:outline-none"
                      >
                        Visit Shop
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4" id="cart-items-wrapper">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 rounded-xl border border-[#E5DED4] dark:border-[#1E2638] bg-[#FCFAF7] dark:bg-[#1A2030] flex items-center justify-between gap-4"
                          id={`cart-row-${item.id}`}
                        >
                          {/* Left: thumb and title */}
                          <div className="flex items-center space-x-3.5 min-w-0">
                            <div className="w-14 h-14 rounded-lg overflow-hidden border border-[#E5DED4] dark:border-[#2A354F] bg-white dark:bg-[#1E2638] flex-shrink-0">
                              <img src={item.merchItem.imageUrl} alt={item.merchItem.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-serif font-bold text-xs text-[#3D3A35] dark:text-[#E2E8F0] truncate pr-2">
                                {item.merchItem.name}
                              </h4>
                              {item.selectedSize && (
                                <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-[#F2ECE4] dark:bg-[#1E2638] text-[9.5px] font-mono text-[#BC6C25] dark:text-[#F59E0B] uppercase border border-[#E5DED4] dark:border-[#2A354F] font-bold">
                                  Size: {item.selectedSize}
                                </span>
                              )}
                              <span className="font-sans font-bold text-[11px] text-[#6B655C] dark:text-[#94A3B8] block mt-1">
                                ${item.merchItem.price} USD
                              </span>
                            </div>
                          </div>

                          {/* Right: quantities controls and trash */}
                          <div className="flex flex-col items-end justify-between space-y-2">
                            {/* Counter */}
                            <div className="flex items-center space-x-1.5">
                              <button
                                onClick={() => handleUpdateCartQuantity(item.id, -1)}
                                className="h-6 w-6 flex items-center justify-center rounded bg-white dark:bg-[#1E2638] border border-[#E5DED4] dark:border-[#2A354F] text-[#6B655C] dark:text-[#94A3B8] hover:bg-[#F2ECE4] dark:hover:bg-[#2A354F] cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="font-sans font-bold text-xs text-[#3D3A35] dark:text-[#E2E8F0] px-1">{item.quantity}</span>
                              <button
                                onClick={() => handleUpdateCartQuantity(item.id, 1)}
                                className="h-6 w-6 flex items-center justify-center rounded bg-white dark:bg-[#1E2638] border border-[#E5DED4] dark:border-[#2A354F] text-[#6B655C] dark:text-[#94A3B8] hover:bg-[#F2ECE4] dark:hover:bg-[#2A354F] cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Trash delete button */}
                            <button
                              onClick={() => handleRemoveFromCart(item.id)}
                              className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Checkout Billing Form if items are present */}
                      <form onSubmit={handleCheckoutSubmit} className="pt-6 border-t border-[#E5DED4] dark:border-[#1E2638] space-y-4" id="cart-billing-form">
                        <span className="font-mono text-[9px] text-[#BC6C25] dark:text-[#F59E0B] font-bold uppercase tracking-widest block font-bold">SHIPPING & BILLING</span>

                        <div className="grid grid-cols-1 gap-3">
                          <input
                            type="text"
                            required
                            placeholder="Recipient Full Name"
                            value={billingName}
                            onChange={(e) => setBillingName(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white dark:bg-[#1E2638] border border-[#E5DED4] dark:border-[#2A354F] rounded-xl text-xs text-[#3D3A35] dark:text-white outline-none focus:border-[#BC6C25] dark:focus:border-[#F59E0B]"
                          />

                          <input
                            type="email"
                            required
                            placeholder="Email address for receipt"
                            value={billingEmail}
                            onChange={(e) => setBillingEmail(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white dark:bg-[#1E2638] border border-[#E5DED4] dark:border-[#2A354F] rounded-xl text-xs text-[#3D3A35] dark:text-white outline-none focus:border-[#BC6C25] dark:focus:border-[#F59E0B]"
                          />

                          <textarea
                            required
                            rows={2}
                            placeholder="Shipping Address details"
                            value={billingAddress}
                            onChange={(e) => setBillingAddress(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white dark:bg-[#1E2638] border border-[#E5DED4] dark:border-[#2A354F] rounded-xl text-xs text-[#3D3A35] dark:text-white outline-none focus:border-[#BC6C25] dark:focus:border-[#F59E0B]"
                          />
                        </div>

                        {/* Coupon item */}
                        <div className="p-3 bg-[#FCFAF7] dark:bg-[#1A2030] border border-[#E5DED4] dark:border-[#2A354F] rounded-xl space-y-1.5 text-left">
                          <label className="font-mono text-[9px] text-[#6B655C] dark:text-[#94A3B8] block uppercase tracking-wider font-bold">REDEEM QUIZ PROMO CODE</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              placeholder="e.g. TRIVIA20"
                              value={cartPromo}
                              onChange={(e) => setCartPromo(e.target.value)}
                              className="px-3 py-1.5 bg-white dark:bg-[#1E2638] border border-[#E5DED4] dark:border-[#2A354F] rounded text-xs text-[#3D3A35] dark:text-white uppercase outline-none focus:border-[#BC6C25] dark:focus:border-[#F59E0B] flex-grow"
                            />
                            <button
                              type="button"
                              onClick={applyCartPromo}
                              className="px-3.5 py-1.5 bg-[#F2ECE4] dark:bg-[#2A354F] hover:bg-[#E5DED4] dark:hover:bg-[#344160] text-[#BC6C25] dark:text-[#F59E0B] border border-[#E5DED4] dark:border-[#38486F] font-mono text-[10px] tracking-wider font-bold rounded cursor-pointer focus:outline-none"
                            >
                              Redeem
                            </button>
                          </div>
                          {isPromoApplied && (
                            <span className="font-mono text-[10px] text-emerald-600 pt-0.5 block font-bold">
                              • 20% Trivia Discount Subtracted!
                            </span>
                          )}
                        </div>

                        {/* Billing details review */}
                        <div className="pt-4 border-t border-[#E5DED4] dark:border-[#1E2638] space-y-2 text-xs font-mono text-[#6B655C] dark:text-[#94A3B8] font-bold">
                          <div className="flex items-center justify-between">
                            <span>SUBTOTAL:</span>
                            <span className="text-[#3D3A35] dark:text-[#E2E8F0]">${cartSubtotal} USD</span>
                          </div>
                          {isPromoApplied && (
                            <div className="flex items-center justify-between text-emerald-600">
                              <span>QUIZ DISCOUNT (20%):</span>
                              <span>- ${cartDiscount} USD</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span>SHIPPING FEE:</span>
                            <span className="text-[#3D3A35] dark:text-[#E2E8F0]">{cartShipping === 0 ? 'FREE' : `$${cartShipping} USD`}</span>
                          </div>
                          <div className="flex items-center justify-between border-t border-[#E5DED4] dark:border-[#1E2638] pt-2 text-sm font-serif font-bold text-[#3D3A35] dark:text-[#E2E8F0]">
                            <span>TOTAL PAYMENT:</span>
                            <span className="text-[#BC6C25] dark:text-[#F59E0B] font-mono">${cartTotalTotal} USD</span>
                          </div>
                        </div>

                        {/* Submit Button */}
                        <button
                          type="submit"
                          className="w-full py-4 rounded-full bg-[#4A5D4E] dark:bg-[#BC6C25] hover:bg-[#5B6F5F] dark:hover:bg-[#CD7D36] text-white font-mono font-bold text-xs tracking-widest uppercase transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-sm focus:outline-none"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>SECURE BILLING CHECKOUT • ${cartTotalTotal}</span>
                        </button>
                      </form>
                    </div>
                  )
                ) : (
                  /* Checkout Success Invoice */
                  <div className="animate-fade-in py-4 space-y-6 text-center" id="checkout-success-invoice">
                    <div className="inline-flex items-center space-x-1 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono font-bold text-emerald-600 shadow-sm mb-1">
                      <CheckCircle className="w-4 h-4 text-emerald-600 animate-bounce" />
                      <span>CHARGE INVOICE APPROVED</span>
                    </div>

                    <h3 className="font-serif font-bold text-xl text-[#3D3A35] dark:text-[#E2E8F0]">Shipment Processed!</h3>
                    <p className="font-serif text-xs text-[#6B655C] dark:text-[#94A3B8] max-w-xs mx-auto leading-relaxed italic">
                      "We've collected payment and generated order keys. Check your inbox for trackable shipping updates."
                    </p>

                    {/* SKEUOMORPHIC INVOICE BILL */}
                    <div id="printable-invoice" className="p-5.5 rounded-2xl border border-[#E5DED4] dark:border-[#1E2638] bg-white dark:bg-[#1A2030] text-left font-mono text-[10.5px] text-[#6B655C] dark:text-[#94A3B8] space-y-4 shadow-sm">
                      {/* Logo header */}
                      <div className="border-b border-dashed border-[#E5DED4] pb-3 flex items-center justify-between">
                        <div>
                          <span className="font-serif font-bold text-xs text-[#3D3A35] uppercase tracking-wider block">VELVET HORIZON SHOP</span>
                          <span className="text-[9px] text-[#6B655C] block mt-0.5">BROOKLYN SHIPMENT HUB</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[#BC6C25] font-bold">ORDER SLIP</span>
                        </div>
                      </div>

                      {/* Info lines */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <span>ORDER REFERENCE ID:</span>
                          <span className="font-bold text-[#3D3A35]">{checkoutInvoice?.orderId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>TRANSACTION DATE:</span>
                          <span className="text-[#3D3A35]">{checkoutInvoice?.date}</span>
                        </div>
                        <div className="flex justify-between truncate">
                          <span>RECIPIENT NAME:</span>
                          <span className="font-bold text-[#3D3A35]">{billingName}</span>
                        </div>
                        <div className="flex justify-between truncate">
                          <span>SHIPPED ADDRESS:</span>
                          <span className="text-[#3D3A35] max-w-[180px] text-right truncate font-bold">{billingAddress}</span>
                        </div>
                      </div>

                      {/* Summary of totals */}
                      <div className="border-t border-dashed border-[#E5DED4] pt-3.5 space-y-1.5">
                        <div className="flex justify-between text-[#BC6C25] uppercase text-[9px] font-bold">
                          <span>Purchased Items</span>
                          <span>QTY × Price</span>
                        </div>
                        {cart.map((c) => (
                          <div key={c.id} className="flex justify-between text-[#3D3A35]">
                            <span className="max-w-[200px] truncate">
                              • {c.merchItem.name} {c.selectedSize ? `(${c.selectedSize})` : ''}
                            </span>
                            <span>{c.quantity}x ${c.merchItem.price}</span>
                          </div>
                        ))}
                      </div>

                      {/* Balance line */}
                      <div className="border-t border-solid border-[#E5DED4] pt-3 flex items-center justify-between text-[#3D3A35] text-xs font-serif font-bold">
                        <span>TOTAL CHARGED BALANCE:</span>
                        <span className="text-[#BC6C25] font-mono text-sm font-bold">${cartTotalTotal} USD</span>
                      </div>
                    </div>

                    {/* EMAIL INVOICE CONTROL BOX */}
                    <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#1E2638]/40 border border-[#E5DED4] dark:border-[#2A354F] text-left space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#6B655C] dark:text-[#94A3B8] flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-[#BC6C25] dark:text-[#F59E0B]" />
                          <span>Digital Receipt Dispatch</span>
                        </span>
                        {emailStatus === 'sent' && (
                          <span className="text-[9px] font-mono uppercase font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full animate-pulse">
                            Dispatched
                          </span>
                        )}
                      </div>

                      {emailStatus === 'sent' ? (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 text-center space-y-2"
                        >
                          <div className="inline-flex items-center justify-center p-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <motion.div
                              initial={{ rotate: -15, scale: 0.8 }}
                              animate={{ rotate: 0, scale: [1, 1.2, 1] }}
                              transition={{ duration: 0.4 }}
                            >
                              <CheckCircle className="w-5 h-5" />
                            </motion.div>
                          </div>
                          <p className="text-xs text-neutral-800 dark:text-neutral-200 font-medium">
                            Invoice successfully sent!
                          </p>
                          <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono">
                            Sent to <span className="font-bold text-neutral-700 dark:text-neutral-300">{emailInput}</span>. Check your spam folders if not received within 2 minutes.
                          </p>
                          <button
                            type="button"
                            onClick={() => setEmailStatus('idle')}
                            className="text-[9px] font-mono text-[#BC6C25] hover:underline uppercase tracking-wider font-bold block mx-auto mt-1 cursor-pointer"
                          >
                            Send to another email
                          </button>
                        </motion.div>
                      ) : (
                        <form onSubmit={handleSendEmail} className="space-y-2">
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <input
                                type="email"
                                required
                                value={emailInput}
                                disabled={emailStatus === 'sending'}
                                onChange={(e) => {
                                  setEmailInput(e.target.value);
                                  if (emailError) setEmailError('');
                                }}
                                placeholder="customer@example.com"
                                className="w-full px-3 py-2.5 bg-white dark:bg-[#111625] border border-[#E5DED4] dark:border-[#2A354F] rounded-xl text-xs text-[#3D3A35] dark:text-white outline-none focus:border-[#BC6C25] dark:focus:border-[#F59E0B] disabled:opacity-60 transition-all font-mono"
                              />
                            </div>
                            <button
                              type="submit"
                              disabled={emailStatus === 'sending'}
                              className="px-4 bg-[#4A5D4E] hover:bg-[#5B6F5F] dark:bg-[#BC6C25] dark:hover:bg-[#CD7D36] disabled:bg-[#4A5D4E]/60 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 min-w-[110px]"
                            >
                              {emailStatus === 'sending' ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>Sending...</span>
                                </>
                              ) : (
                                <>
                                  <Mail className="w-3.5 h-3.5" />
                                  <span>Email Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          {emailError && (
                            <p className="text-[10px] text-rose-500 font-mono mt-1" id="email-validation-error">
                              {emailError}
                            </p>
                          )}
                          {emailStatus === 'sending' && (
                            <div className="h-1 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden mt-1">
                              <motion.div 
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 2, ease: "easeInOut" }}
                                className="h-full bg-emerald-500"
                              />
                            </div>
                          )}
                        </form>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => window.print()}
                        id="print-invoice-btn"
                        className="flex-1 py-3.5 rounded-full border-2 border-[#4A5D4E] dark:border-[#BC6C25] text-[#4A5D4E] dark:text-[#F59E0B] hover:bg-[#4A5D4E]/10 dark:hover:bg-[#BC6C25]/10 font-mono font-bold text-xs tracking-widest uppercase transition-all cursor-pointer shadow-sm focus:outline-none flex items-center justify-center gap-2"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Print Invoice</span>
                      </button>
                      <button
                        type="button"
                        onClick={completeAndClearInvoice}
                        className="flex-1 py-3.5 rounded-full bg-[#4A5D4E] hover:bg-[#5B6F5F] dark:bg-[#BC6C25] dark:hover:bg-[#CD7D36] text-white font-mono font-bold text-xs tracking-widest uppercase transition-all cursor-pointer shadow-sm focus:outline-none"
                      >
                        Complete Checkout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Elegant Footer */}
      <footer className="bg-[#F2ECE4] dark:bg-[#111625] border-t border-[#E5DED4] dark:border-[#1E2638] py-16" id="band-footer-element">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="flex flex-col items-center justify-center space-y-3.5">
            <div className="p-3 bg-white dark:bg-[#1E2638] rounded-full border border-[#E5DED4] dark:border-[#2A354F] text-[#BC6C25] dark:text-[#F59E0B]">
              <Music2 className="w-7 h-7" />
            </div>
            <div>
              <span className="font-serif font-bold text-2xl tracking-widest text-[#3D3A35] dark:text-[#E2E8F0] block">
                {BAND_BIO.name.toUpperCase()}
              </span>
              <span className="font-mono text-xs text-[#BC6C25] dark:text-[#F59E0B] uppercase tracking-widest block mt-0.5 font-bold">
                {BAND_BIO.genre}
              </span>
            </div>
          </div>

          {/* Social icons */}
          <div className="flex items-center justify-center space-x-5" id="footer-social-panel">
            <FooterSocialIcon
              href="https://instagram.com"
              ariaLabel="Follow Velvet Horizon on Instagram"
              title="Follow Velvet Horizon on Instagram"
              theme={theme}
              id="footer-instagram-btn"
            >
              <Instagram className="w-5 h-5" />
            </FooterSocialIcon>

            <FooterSocialIcon
              href="https://youtube.com"
              ariaLabel="Follow Velvet Horizon on YouTube"
              title="Follow Velvet Horizon on YouTube"
              theme={theme}
              id="footer-youtube-btn"
            >
              <Youtube className="w-5 h-5" />
            </FooterSocialIcon>

            <FooterSocialIcon
              href="https://facebook.com"
              ariaLabel="Follow Velvet Horizon on Facebook"
              title="Follow Velvet Horizon on Facebook"
              theme={theme}
              id="footer-facebook-btn"
            >
              <Facebook className="w-5 h-5" />
            </FooterSocialIcon>

            <FooterSocialIcon
              onClick={() => setIsShareOpen(true)}
              ariaLabel="Share Velvet Horizon official website"
              title="Share Velvet Horizon official website"
              theme={theme}
              id="footer-share-btn"
            >
              <Share2 className="w-5 h-5" />
            </FooterSocialIcon>
          </div>

          <p className="font-mono text-[10px] text-[#6B655C] dark:text-[#94A3B8] max-w-md mx-auto leading-relaxed font-bold">
            © 2026 VELVET HORIZON • RECORDED LIVE ON REEL-TO-REEL • ALL RIGHTS RESERVED. <br />
            TRIVIA REWARDS COUPON ENFORCED WITH PERSISTED SANDBOX VALIDITY.
          </p>
        </div>
      </footer>

      {/* 5. Floating Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={scrollToTop}
            id="back-to-top-btn"
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 p-2.5 rounded-full bg-[#BC6C25] hover:bg-[#CD7D36] text-white shadow-lg border border-[#BC6C25]/20 dark:border-amber-500/25 flex items-center justify-center cursor-pointer transition-all focus:outline-none hover:shadow-xl hover:scale-105 active:scale-95 group"
            title="Back to Top"
            aria-label="Back to Top"
          >
            <ArrowUp className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* 6. Persistent Mini Music Player */}
      <MiniMusicPlayer />

      {/* 7. Gemini Chatbot Companion */}
      <GeminiChatbot theme={theme} />

      {/* Share Modal Overlay */}
      <ShareModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} theme={theme} />

      {/* 8. Global Initializer Loading Overlay Screen */}
      <AnimatePresence>
        {isInitializing && (
          <motion.div
            key="global-initializer"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            id="global-loading-screen"
            className="fixed inset-0 bg-[#F9F6F2] dark:bg-[#0A0D14] z-[9999] flex flex-col items-center justify-center p-6 text-center select-none"
          >
            <div className="max-w-md w-full flex flex-col items-center">
              {/* Spinning stylized vinyl / disk */}
              <div className="relative mb-8 w-24 h-24 flex items-center justify-center" id="loader-disc-wrapper">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
                  className="w-20 h-20 rounded-full border-4 border-dashed border-[#BC6C25] dark:border-emerald-500 flex items-center justify-center"
                >
                  <Disc className="w-10 h-10 text-[#BC6C25] dark:text-emerald-500" />
                </motion.div>
                {/* Micro outer rings */}
                <div className="absolute inset-0 border border-[#BC6C25]/20 dark:border-emerald-500/20 rounded-full animate-ping pointer-events-none" />
              </div>

              {/* Title / Logo */}
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="font-serif text-3xl font-bold tracking-widest text-[#3D3A35] dark:text-[#E2E8F0]"
                id="loader-title"
              >
                VELVET HORIZON
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: 0.3 }}
                className="font-mono text-[10px] uppercase tracking-widest text-[#BC6C25] dark:text-emerald-400 mt-1.5 font-bold"
                id="loader-subtitle"
              >
                Elysian Soundscapes & Discography
              </motion.p>

              {/* Progress bar container */}
              <div className="w-48 h-1 bg-[#E5DED4] dark:bg-[#1E2638] rounded-full overflow-hidden mt-8 mb-3" id="loader-progress-container">
                <motion.div
                  className="h-full bg-[#BC6C25] dark:bg-emerald-500 rounded-full"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>

              {/* Loading subtexts */}
              <div className="h-6 flex items-center justify-center font-mono text-[11px] text-[#6B655C] dark:text-[#94A3B8] tracking-wider uppercase" id="loader-status-text">
                {loadingMessage}
              </div>

              {/* Simulated diagnostic metrics */}
              <span className="font-mono text-[9px] text-neutral-400 dark:text-neutral-500 mt-1 block">
                {Math.round(loadingProgress)}% Loaded
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
