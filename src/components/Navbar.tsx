import { useState } from 'react';
import { Menu, X, ShoppingBag, Music2, Calendar, BookOpen, Disc, HelpCircle, GraduationCap, Home, Sun, Moon, Sliders, Info, User, Ticket, Camera } from 'lucide-react';
import { BAND_BIO } from '../data';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  cartItemsCount: number;
  toggleCartOpen: () => void;
  theme: 'natural' | 'midnight';
  setTheme: (theme: 'natural' | 'midnight') => void;
  currentUser: { name: string; email: string; tier: string } | null;
  savedTicketsCount: number;
  loginSubTab: 'profile' | 'tickets' | 'masterclasses' | 'rewards';
  setLoginSubTab: (tab: 'profile' | 'tickets' | 'masterclasses' | 'rewards') => void;
}

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  cartItemsCount, 
  toggleCartOpen, 
  theme, 
  setTheme, 
  currentUser,
  savedTicketsCount,
  loginSubTab,
  setLoginSubTab
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'tour', label: 'Tour Dates', icon: Calendar },
    { id: 'discography', label: 'Album Logs', icon: Disc },
    { id: 'instruments', label: 'Instruments', icon: Sliders },
    { id: 'gallery', label: 'Gallery', icon: Camera },
    { id: 'lessons', label: 'Learning', icon: GraduationCap },
    { id: 'merch', label: 'Merch Store', icon: ShoppingBag },
    { id: 'about', label: 'About', icon: Info },
    { id: 'blog', label: 'Blog', icon: BookOpen },
    { id: 'faq', label: 'FAQs', icon: HelpCircle },
  ];

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F9F6F2]/80 dark:bg-[#0A0D14]/80 backdrop-blur-md border-b border-[#E5DED4] dark:border-[#1E2638] sticky-nav" id="main-nav-bar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center space-x-3 group cursor-pointer text-left focus:outline-none"
            id="nav-logo-btn"
          >
            <div className="p-2 bg-[#4A5D4E]/10 dark:bg-[#BC6C25]/10 rounded-xl border border-[#4A5D4E]/20 dark:border-[#BC6C25]/20 group-hover:bg-[#4A5D4E]/25 dark:group-hover:bg-[#BC6C25]/25 group-hover:border-[#4A5D4E]/45 dark:group-hover:border-[#BC6C25]/45 transition-all text-[#4A5D4E] dark:text-[#F59E0B]">
              <Music2 className="w-5.5 h-5.5" />
            </div>
            <div className="text-left">
              <span className="font-serif font-bold text-xl md:text-2xl tracking-tighter text-[#4A5D4E] dark:text-[#E2E8F0] group-hover:text-[#BC6C25] dark:group-hover:text-[#F59E0B] transition-colors block leading-tight">
                {BAND_BIO.name.toUpperCase()}
              </span>
              <span className="font-mono text-[9px] text-[#6B655C] dark:text-[#94A3B8] uppercase tracking-widest block font-medium mt-0.5">
                {BAND_BIO.genre}
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-5" id="desktop-nav-links">
            {navLinks.map((link) => {
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  id={`nav-link-${link.id}`}
                  className={`px-1 py-1.5 text-xs font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer focus:outline-none ${
                    isActive
                      ? 'text-[#BC6C25] dark:text-[#F59E0B] border-b-2 border-[#BC6C25] dark:border-[#F59E0B] font-semibold'
                      : 'text-[#6B655C] dark:text-[#94A3B8] hover:text-[#3D3A35] dark:hover:text-white border-b-2 border-transparent'
                  }`}
                >
                  <span>{link.label}</span>
                </button>
              );
            })}
          </div>

          {/* Cart & Mobile Toggles */}
          <div className="flex items-center space-x-3">
            {/* Theme switcher toggle */}
            <button
              onClick={() => setTheme(theme === 'natural' ? 'midnight' : 'natural')}
              className="p-2.5 rounded-full text-[#6B655C] hover:text-[#3D3A35] dark:text-[#94A3B8] dark:hover:text-[#E2E8F0] hover:bg-[#F2ECE4] dark:hover:bg-[#1E2638] border border-[#E5DED4] dark:border-[#2A354F] transition-all cursor-pointer focus:outline-none"
              aria-label="Toggle theme variant"
              id="theme-switcher-btn"
            >
              {theme === 'natural' ? (
                <Moon className="w-4.5 h-4.5" />
              ) : (
                <Sun className="w-4.5 h-4.5 text-[#F59E0B]" />
              )}
            </button>

            {/* VIP Fan Dashboard / Sign In Button */}
            {currentUser ? (
              <button
                onClick={() => handleNavClick('login')}
                className={`p-1.5 px-3 rounded-full flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer focus:outline-none border ${
                  currentTab === 'login'
                    ? 'border-[#BC6C25] bg-[#BC6C25]/10 text-[#BC6C25] dark:border-[#F59E0B] dark:bg-[#F59E0B]/10 dark:text-[#F59E0B]'
                    : 'border-[#E5DED4] hover:border-[#4A5D4E]/30 bg-[#F2ECE4]/30 dark:border-[#2A354F] dark:hover:border-emerald-500/30 dark:bg-[#111625]/30 text-[#6B655C] dark:text-[#94A3B8] hover:text-[#3D3A35] dark:hover:text-white'
                }`}
                id="navbar-profile-btn"
              >
                <div className="w-5 h-5 rounded-full bg-[#BC6C25] dark:bg-[#F59E0B] text-[9px] text-white flex items-center justify-center font-bold">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:inline text-[9px] tracking-wide max-w-[80px] truncate">{currentUser.name.split(' ')[0]}</span>
              </button>
            ) : (
              <button
                onClick={() => handleNavClick('login')}
                className={`p-2 rounded-full text-[#6B655C] hover:text-[#3D3A35] dark:text-[#94A3B8] dark:hover:text-[#E2E8F0] hover:bg-[#F2ECE4] dark:hover:bg-[#1E2638] border border-[#E5DED4] dark:border-[#2A354F] transition-all cursor-pointer focus:outline-none flex items-center gap-1.5 ${
                  currentTab === 'login' ? 'border-[#BC6C25] text-[#BC6C25] dark:border-[#F59E0B] dark:text-[#F59E0B]' : ''
                }`}
                id="navbar-login-btn"
                aria-label="Sign In"
              >
                <User className="w-4 h-4" />
                <span className="hidden md:inline text-[9px] font-mono font-extrabold uppercase tracking-widest pr-1">Sign In</span>
              </button>
            )}

            {/* Tickets Wallet Quick Access Trigger */}
            <button
              onClick={() => {
                setLoginSubTab('tickets');
                handleNavClick('login');
              }}
              className={`relative p-2.5 rounded-full text-[#6B655C] hover:text-[#3D3A35] dark:text-[#94A3B8] dark:hover:text-[#E2E8F0] hover:bg-[#F2ECE4] dark:hover:bg-[#1E2638] border border-[#E5DED4] dark:border-[#2A354F] transition-all cursor-pointer focus:outline-none flex items-center gap-1 ${
                currentTab === 'login' && loginSubTab === 'tickets'
                  ? 'border-[#BC6C25] text-[#BC6C25] dark:border-[#F59E0B] dark:text-[#F59E0B]'
                  : ''
              }`}
              aria-label="Toggle Saved Tickets"
              id="navbar-tickets-shortcut-btn"
            >
              <Ticket className="w-4.5 h-4.5" />
              {savedTicketsCount > 0 && (
                <span
                  id="navbar-tickets-badge-count"
                  className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 dark:bg-emerald-500 text-[9px] font-mono font-bold text-white ring-2 ring-[#F9F6F2] dark:ring-[#0A0D14]"
                >
                  {savedTicketsCount}
                </span>
              )}
            </button>

            {/* Shopping Cart Trigger */}
            <button
              onClick={toggleCartOpen}
              className="relative p-2.5 rounded-full text-[#6B655C] hover:text-[#3D3A35] dark:text-[#94A3B8] dark:hover:text-[#E2E8F0] hover:bg-[#F2ECE4] dark:hover:bg-[#1E2638] border border-[#E5DED4] dark:border-[#2A354F] transition-all cursor-pointer focus:outline-none"
              aria-label="Toggle Shopping Cart"
              id="navbar-cart-toggle-btn"
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              {cartItemsCount > 0 && (
                <span
                  id="cart-badge-count"
                  className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#BC6C25] dark:bg-[#F59E0B] text-[9px] font-mono font-bold text-white ring-2 ring-[#F9F6F2] dark:ring-[#0A0D14] animate-bounce"
                >
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggler */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2.5 rounded-full text-[#6B655C] hover:text-[#3D3A35] dark:text-[#94A3B8] dark:hover:text-[#E2E8F0] hover:bg-[#F2ECE4] dark:hover:bg-[#1E2638] border border-[#E5DED4] dark:border-[#2A354F] transition-all cursor-pointer focus:outline-none"
              aria-label="Toggle Mobile Menu"
              id="navbar-mobile-toggle-btn"
            >
              {isOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="lg:hidden border-t border-[#E5DED4] dark:border-[#1E2638] bg-[#F9F6F2]/95 dark:bg-[#0A0D14]/95 backdrop-blur-lg px-3 pt-2 pb-6 space-y-1 shadow-md" id="mobile-nav-drawer">
          {navLinks.map((link) => {
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                id={`mobile-nav-link-${link.id}`}
                className={`flex items-center space-x-3.5 w-full px-4 py-3 rounded-xl font-sans text-xs font-bold uppercase tracking-widest transition-all ${
                  isActive
                    ? 'bg-[#4A5D4E] dark:bg-[#BC6C25] text-white shadow-sm'
                    : 'text-[#6B655C] dark:text-[#94A3B8] hover:text-[#3D3A35] dark:hover:text-white hover:bg-[#F2ECE4] dark:hover:bg-[#1D2433]'
                }`}
              >
                <link.icon className="w-4 h-4 flex-shrink-0" />
                <span>{link.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
}

