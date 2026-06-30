import { useState, useEffect } from 'react';
import { Play, Pause, Disc, ArrowRight, Heart, Sparkles, Volume2 } from 'lucide-react';
import { BAND_BIO } from '../data';

interface HomeProps {
  setCurrentTab: (tab: string) => void;
}

export default function Home({ setCurrentTab }: HomeProps) {
  const [isPlayingSingle, setIsPlayingSingle] = useState(false);
  const [singleProgress, setSingleProgress] = useState(0);
  const [likesCount, setLikesCount] = useState(1428);
  const [hasLiked, setHasLiked] = useState(false);

  // Simulate audio single play countdown
  useEffect(() => {
    let interval: any;
    if (isPlayingSingle) {
      interval = setInterval(() => {
        setSingleProgress((prev) => {
          if (prev >= 100) {
            setIsPlayingSingle(false);
            return 0;
          }
          return prev + 1; // updates progress bar
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlayingSingle]);

  const togglePlaySingle = () => {
    setIsPlayingSingle(!isPlayingSingle);
  };

  const handleLike = () => {
    if (hasLiked) {
      setLikesCount(likesCount - 1);
      setHasLiked(false);
    } else {
      setLikesCount(likesCount + 1);
      setHasLiked(true);
    }
  };

  return (
    <div className="space-y-24 pb-20 bg-[#F9F6F2] dark:bg-[#0A0D14] text-[#3D3A35] dark:text-[#E2E8F0]" id="home-page-container">
      {/* 1. Hero Spotlight */}
      <section className="relative min-h-[80vh] flex items-center justify-center p-4 md:p-12 overflow-hidden bg-[#F2ECE4]/40 dark:bg-[#111625]/20 border-b border-[#E5DED4] dark:border-[#1E2638]" id="hero-spotlight">
        {/* Abstract Background Accents */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#BC6C25]/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#4A5D4E]/3 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
          {/* Main Copy */}
          <div className="lg:col-span-7 space-y-6 text-left animate-fade-in" id="hero-main-content">
            <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-[#BC6C25]/10 border border-[#BC6C25]/20 text-xs font-mono font-bold tracking-wider text-[#BC6C25]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>NEW ALBUM 'ELYSIAN FIELDS' OUT NOW</span>
            </div>

            <h1 className="font-serif font-bold text-4xl md:text-6xl lg:text-7xl leading-tight tracking-tight text-[#4A5D4E] dark:text-emerald-400" id="hero-heading">
              Shaping Sound <br />
              <span className="text-[#BC6C25] dark:text-[#F59E0B] italic font-normal">Beyond Horizons</span>
            </h1>

            <p className="font-serif text-[#6B655C] dark:text-[#94A3B8] text-base md:text-lg max-w-xl leading-relaxed italic">
              "We fuse late-90s raw indie grit with modern retro synthesizers and polyrhythmic drumscapes. Born in Brooklyn, playing for the wild."
            </p>

            {/* Simulated Live Audio Player on Hero */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#111625] border border-[#E5DED4] dark:border-[#1E2638] max-w-lg space-y-4 shadow-sm" id="hero-single-player">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3.5">
                  <div className={`p-3 rounded-2xl ${isPlayingSingle ? 'bg-[#BC6C25] text-white animate-spin' : 'bg-[#F2ECE4] dark:bg-[#1A2030] text-[#BC6C25] dark:text-[#F59E0B]'} transition-all`}>
                    <Disc className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-serif font-bold text-sm text-[#3D3A35] dark:text-[#E2E8F0] block">Golden Hour</span>
                    <span className="font-mono text-[11px] text-[#6B655C] dark:text-[#94A3B8] block">Velvet Horizon — Elysian Fields</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-[#6B655C] dark:text-[#94A3B8]">
                  <span className="font-mono text-xs font-semibold">
                    {isPlayingSingle ? `0:${singleProgress < 10 ? '0' : ''}${Math.floor(singleProgress * 0.3)}` : '0:00'}
                  </span>
                  <span className="text-[#E5DED4] dark:text-[#20293E] font-light">|</span>
                  <span className="font-mono text-xs text-neutral-400 dark:text-neutral-500">3:50</span>
                </div>
              </div>

              {/* Progress track */}
              <div className="h-1.5 w-full bg-[#F2ECE4] dark:bg-[#1E2638] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#BC6C25] dark:bg-[#F59E0B] transition-all duration-300 rounded-full"
                  style={{ width: `${singleProgress}%` }}
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={togglePlaySingle}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-[#4A5D4E] hover:bg-[#5B6F5F] text-white font-mono text-xs font-bold tracking-wider uppercase transition-all cursor-pointer shadow-sm"
                  id="hero-play-switch"
                >
                  {isPlayingSingle ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>PAUSE TRACK</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>LISTEN NOW</span>
                    </>
                  )}
                </button>

                <div className="flex items-center space-x-3">
                  {isPlayingSingle && (
                    <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#BC6C25]/10 text-[9px] text-[#BC6C25] dark:text-[#F59E0B] font-mono tracking-widest uppercase font-bold">
                      <Volume2 className="w-3 h-3 animate-pulse" />
                      <span>STREAMING ACTIVE</span>
                    </div>
                  )}

                  <button
                    onClick={handleLike}
                    className={`flex items-center space-x-1.5 text-xs font-mono py-1.5 px-3.5 rounded-full border transition-all cursor-pointer ${
                      hasLiked
                        ? 'border-[#BC6C25]/30 bg-[#BC6C25]/10 text-[#BC6C25] font-bold'
                        : 'border-[#E5DED4] dark:border-[#2A354F] hover:border-[#BC6C25]/40 text-[#6B655C] dark:text-[#94A3B8] hover:text-[#3D3A35] dark:hover:text-[#E2E8F0] hover:bg-[#F2ECE4] dark:hover:bg-[#1E2638]'
                    }`}
                    id="hero-like-btn"
                  >
                    <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-current text-[#BC6C25]' : ''}`} />
                    <span>{likesCount}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3.5 pt-4" id="hero-navigation-actions">
              <button
                onClick={() => setCurrentTab('tour')}
                className="flex items-center space-x-2 px-6 py-3 rounded-full bg-[#4A5D4E] hover:bg-[#5B6F5F] text-white font-mono text-xs font-bold tracking-widest uppercase transition-all cursor-pointer shadow-sm"
                id="hero-cta-tour"
              >
                <span>Check Tour Dates</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setCurrentTab('merch')}
                className="flex items-center space-x-2 px-6 py-3 rounded-full border border-[#BC6C25] hover:bg-[#BC6C25]/5 text-[#BC6C25] font-mono text-xs font-bold tracking-widest uppercase transition-all cursor-pointer"
                id="hero-cta-merch"
              >
                <span>Explore Merchandise</span>
              </button>
            </div>
          </div>

          {/* Large Visual Frame */}
          <div className="lg:col-span-5 relative flex justify-center" id="hero-visual-art">
            <div className="relative w-full max-w-sm md:max-w-md aspect-square rounded-[40px] overflow-hidden border border-[#E5DED4] dark:border-[#1E2638] shadow-md group">
              <img
                src="https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&q=80&w=600"
                alt="Velvet Horizon Performing Live"
                className="w-full h-full object-cover grayscale brightness-95 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#283618]/90 via-transparent to-transparent pointer-events-none" />

              {/* Absolute label Overlay */}
              <div className="absolute bottom-6 left-6 right-6 p-5 rounded-[24px] bg-white/95 dark:bg-[#1E2638]/95 backdrop-blur border border-[#E5DED4] dark:border-[#2A354F] text-left">
                <span className="font-mono text-[9px] text-[#BC6C25] dark:text-[#F59E0B] tracking-widest block uppercase font-bold">Live Showcase</span>
                <span className="font-serif font-bold text-sm text-[#4A5D4E] dark:text-[#E2E8F0] block mt-0.5">World Tour Starting July</span>
                <span className="font-sans text-xs text-[#6B655C] dark:text-[#94A3B8] block mt-1">Brooklyn • San Francisco • London • Tokyo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Band Narrative History */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="band-narrative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-5 text-left" id="narrative-meta">
            <span className="font-mono text-xs text-[#BC6C25] dark:text-[#F59E0B] tracking-widest block uppercase font-bold">ABOUT THE BAND</span>
            <h2 className="font-serif font-bold text-3xl md:text-4xl text-[#4A5D4E] dark:text-[#E2E8F0] tracking-tight leading-tight">
              Inception, Evolution, & Sonic Rebirth
            </h2>
            <div className="h-1.5 w-16 bg-[#BC6C25] dark:bg-[#F59E0B] rounded-full" />

            {/* Quick Stat Blocks */}
            <div className="grid grid-cols-2 gap-4 pt-6" id="narrative-stats">
              <div className="p-4 rounded-3xl border border-[#E5DED4] dark:border-[#1E2638] bg-white dark:bg-[#111625] text-left">
                <span className="font-serif font-bold text-3xl text-[#BC6C25] dark:text-[#F59E0B] block">2018</span>
                <span className="font-mono text-[9px] text-[#6B655C] dark:text-[#94A3B8] uppercase tracking-wider block font-bold mt-1">Year Formed</span>
              </div>
              <div className="p-4 rounded-3xl border border-[#E5DED4] dark:border-[#1E2638] bg-white dark:bg-[#111625] text-left">
                <span className="font-serif font-bold text-3xl text-[#4A5D4E] dark:text-[#E2E8F0] block">3+</span>
                <span className="font-mono text-[9px] text-[#6B655C] dark:text-[#94A3B8] uppercase tracking-wider block font-bold mt-1">Full Albums</span>
              </div>
              <div className="p-4 rounded-3xl border border-[#E5DED4] dark:border-[#1E2638] bg-white dark:bg-[#111625] text-left">
                <span className="font-serif font-bold text-3xl text-[#4A5D4E] dark:text-[#E2E8F0] block">50M+</span>
                <span className="font-mono text-[9px] text-[#6B655C] dark:text-[#94A3B8] uppercase tracking-wider block font-bold mt-1">Global Streams</span>
              </div>
              <div className="p-4 rounded-3xl border border-[#E5DED4] dark:border-[#1E2638] bg-white dark:bg-[#111625] text-left">
                <span className="font-serif font-bold text-3xl text-[#4A5D4E] dark:text-[#E2E8F0] block">150+</span>
                <span className="font-mono text-[9px] text-[#6B655C] dark:text-[#94A3B8] uppercase tracking-wider block font-bold mt-1">Live Concerts</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 text-left space-y-6 lg:pl-10 lg:border-l border-[#E5DED4] dark:border-[#1E2638]" id="narrative-text">
            <p className="font-serif text-[#3D3A35] dark:text-[#E2E8F0] text-base md:text-lg leading-relaxed italic">
              {BAND_BIO.about}
            </p>
            <p className="font-sans text-[#6B655C] dark:text-[#94A3B8] text-sm leading-relaxed">
              Velvet Horizon maintains a profound offline relationship with their instruments, spending hundreds of hours writing together on real tape racks before compiling digital layers. Their upcoming world tour represents an evolution of this manual approach, translating atmospheric compositions into giant, immersive physical spaces.
            </p>

            <div className="pt-2">
              <button
                onClick={() => setCurrentTab('lessons')}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-[#4A5D4E] hover:bg-[#5B6F5F] text-xs font-mono font-bold text-white tracking-widest uppercase transition-all cursor-pointer shadow-sm"
                id="narrative-lessons-cta"
              >
                <span>Book 1-on-1 Lessons with Band Members</span>
                <ArrowRight className="w-3.5 h-3.5 text-white animate-pulse" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Band Members Carousel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12" id="band-members-section">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <span className="font-mono text-xs text-[#BC6C25] dark:text-[#F59E0B] tracking-widest block uppercase font-bold">THE LINEUP</span>
          <h2 className="font-serif font-bold text-3xl md:text-4xl text-[#4A5D4E] dark:text-[#E2E8F0] tracking-tight">Meet Velvet Horizon</h2>
          <p className="font-sans text-[#6B655C] dark:text-[#94A3B8] text-sm leading-relaxed">
            Four independent artistic minds bringing specialized instrumental philosophies into a single, cohesive auditory horizon.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="members-list-grid">
          {BAND_BIO.members.map((member, index) => (
            <div
              key={index}
              className="group relative rounded-[32px] overflow-hidden border border-[#E5DED4] dark:border-[#1E2638] bg-white dark:bg-[#111625] hover:shadow-md transition-all flex flex-col h-full"
              id={`member-card-${index}`}
            >
              {/* Photo */}
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={member.imageUrl}
                  alt={member.name}
                  className="w-full h-full object-cover grayscale brightness-95 group-hover:grayscale-0 group-hover:scale-103 transition-all duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#283618]/40 via-transparent to-transparent pointer-events-none" />

                {/* Overlaid Role */}
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="font-mono text-[9px] text-white tracking-wider px-3 py-1 rounded-full bg-[#4A5D4E] inline-block uppercase font-bold">
                    {member.role}
                  </span>
                </div>
              </div>

              {/* Biography Details */}
              <div className="p-5 flex-grow flex flex-col justify-between text-left space-y-3">
                <div className="space-y-2">
                  <h3 className="font-serif font-bold text-base text-[#3D3A35] dark:text-[#E2E8F0] group-hover:text-[#BC6C25] dark:group-hover:text-[#F59E0B] transition-colors leading-tight">
                    {member.name}
                  </h3>
                  <p className="font-sans text-xs text-[#6B655C] dark:text-[#94A3B8] leading-relaxed">
                    {member.bio}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#F0EBE3] dark:border-[#1E2638] flex items-center justify-between">
                  <span className="font-mono text-[9px] text-[#6B655C] dark:text-[#94A3B8] uppercase tracking-wider font-semibold">SINCE 2018</span>
                  <button
                    onClick={() => setCurrentTab('lessons')}
                    className="flex items-center space-x-1 font-mono text-[9px] text-[#BC6C25] hover:text-[#CD7D36] uppercase tracking-widest font-bold transition-colors cursor-pointer focus:outline-none"
                  >
                    <span>STUDY</span>
                    <ArrowRight className="w-3 h-3 text-[#BC6C25]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Mini Banner Highlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in" id="newsletter-highlight-section">
        <div className="relative rounded-[32px] border-none bg-[#4A5D4E] p-8 md:p-12 overflow-hidden text-left md:flex md:items-center md:justify-between gap-8 md:max-w-5xl mx-auto text-white shadow-md">
          {/* Subtle Background Art */}
          <div className="absolute inset-0 bg-radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops)) from-[#BC6C25]/20 via-transparent to-transparent pointer-events-none" />

          <div className="space-y-2 text-left" id="home-sub-panel-text">
            <h3 className="font-serif font-bold text-xl md:text-2xl tracking-tight text-white">
              Looking for Backstage Masterclasses?
            </h3>
            <p className="font-serif italic text-xs md:text-sm text-[#F9F6F2]/80 max-w-lg leading-relaxed">
              "Book real-time 1-on-1 tutoring sessions with the band members. Available on-stage during select tour stops or via video streams."
            </p>
          </div>

          <button
            onClick={() => setCurrentTab('lessons')}
            className="mt-6 md:mt-0 px-6 py-3.5 rounded-full bg-white hover:bg-[#F9F6F2] text-[#4A5D4E] font-mono text-xs font-bold tracking-widest uppercase transition-all cursor-pointer block text-center focus:outline-none"
            id="home-sub-panel-btn"
          >
            Schedule Masterclass
          </button>
        </div>
      </section>
    </div>
  );
}

