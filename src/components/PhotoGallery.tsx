import React, { useState, useEffect, useRef } from 'react';
import { Camera, Eye, X, ChevronLeft, ChevronRight, Calendar, MapPin, Tag, Heart, MessageCircle, Share2, Trash2, Plus, Upload, Link, Check, Image as ImageIcon, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CommentItem {
  id: string;
  author: string;
  text: string;
  date: string;
}

interface PhotoItem {
  id: string;
  title: string;
  category: 'live' | 'studio' | 'backstage';
  date: string;
  location: string;
  photographer: string;
  description: string;
  imageUrl: string;
  likes: number;
  isLiked?: boolean;
  comments: CommentItem[];
  isUserUploaded?: boolean;
}

const INITIAL_PHOTOS: PhotoItem[] = [
  {
    id: "photo-1",
    title: "Brooklyn Steel Mainstage",
    category: "live",
    date: "June 14, 2026",
    location: "Brooklyn, NY",
    photographer: "Lucas Thorne",
    description: "Elena playing the custom 1965 Fender Stratocaster during the sold-out opening night of the Elysian Fields Tour.",
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=1200",
    likes: 142,
    comments: [
      { id: "c-1", author: "AcousticWave", text: "OMG I was there right at the front! Julian's solo blew my mind!", date: "June 14, 2026" },
      { id: "c-2", author: "RiffMaster99", text: "Unbelievable stage presence. Elena's Strat tone is unmatched.", date: "June 15, 2026" }
    ]
  },
  {
    id: "photo-2",
    title: "Synthesizer Setup in Reykjavik",
    category: "studio",
    date: "January 22, 2026",
    location: "Reykjavik, Iceland",
    photographer: "Elena Vance",
    description: "Marcus tuning the polyphonic analog synthesizers in our temporary Icelandic cliffside recording retreat.",
    imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=1200",
    likes: 89,
    comments: [
      { id: "c-3", author: "NordicAmbient", text: "Icelandic cliffs are the perfect creative refuge for Velvet Horizon.", date: "Jan 23, 2026" },
      { id: "c-4", author: "SynthGeek", text: "Analog gear heaven. I can hear the warmth already.", date: "Jan 24, 2026" }
    ]
  },
  {
    id: "photo-3",
    title: "Nocturnal Crowd Energy",
    category: "live",
    date: "May 29, 2026",
    location: "Chicago, IL",
    photographer: "Lucas Thorne",
    description: "A sea of fans illuminated by laser beams and retro neon projections during 'Pale Blue Light'.",
    imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1200",
    likes: 211,
    comments: [
      { id: "c-5", author: "LightSpeed", text: "The lasers during Pale Blue Light were incredible.", date: "May 29, 2026" },
      { id: "c-6", author: "VelvetVibe", text: "Best concert of my entire life.", date: "May 30, 2026" }
    ]
  },
  {
    id: "photo-4",
    title: "Pre-Show Vinyl Warmup",
    category: "backstage",
    date: "March 18, 2026",
    location: "London, UK",
    photographer: "Chloe Martinez",
    description: "Julian checking the vinyl mastering samples behind the stage at the legendary Wembley Arena.",
    imageUrl: "https://images.unsplash.com/photo-1539628399243-734011af5b83?auto=format&fit=crop&q=80&w=1200",
    likes: 76,
    comments: [
      { id: "c-7", author: "SpinDoctor", text: "Can't wait to grab the vinyl from the merch store!", date: "March 19, 2026" }
    ]
  },
  {
    id: "photo-5",
    title: "Mixing 'Elysian Fields'",
    category: "studio",
    date: "November 10, 2025",
    location: "Los Angeles, CA",
    photographer: "Arthur Green",
    description: "Julian and the engineering team running the warm 2-inch tape masters through an antique console board.",
    imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1200",
    likes: 105,
    comments: [
      { id: "c-8", author: "TapeWarmth", text: "Analogue tape mastering is why Velvet Horizon sounds so timeless.", date: "Nov 11, 2025" }
    ]
  },
  {
    id: "photo-6",
    title: "Underground Club Jam",
    category: "live",
    date: "April 02, 2026",
    location: "Berlin, Germany",
    photographer: "Katrin Weber",
    description: "An intimate guerrilla set played in a subterranean raw concrete club, testing unreleased tracks.",
    imageUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&q=80&w=1200",
    likes: 194,
    comments: [
      { id: "c-9", author: "ClubGoer", text: "Berlin secret sets are legendary. Wish I was there!", date: "April 03, 2026" }
    ]
  },
  {
    id: "photo-7",
    title: "Elena's Pedalboard Mapping",
    category: "studio",
    date: "December 05, 2025",
    location: "Brooklyn, NY",
    photographer: "Julian Finch",
    description: "The sprawling labyrinth of delay loops, bucket-brigade pitch shifters, and analog fuzz boxes.",
    imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=1200",
    likes: 67,
    comments: [
      { id: "c-10", author: "StompBoxer", text: "Is that a space echo delay pedal? Awesome setup.", date: "Dec 06, 2025" }
    ]
  },
  {
    id: "photo-8",
    title: "Behind the Curtain Whisper",
    category: "backstage",
    date: "June 20, 2026",
    location: "Toronto, ON",
    photographer: "Lucas Thorne",
    description: "Chloe and Marcus sharing a quick laugh and review of the rhythm sync seconds before stepping into the arena spotlights.",
    imageUrl: "https://images.unsplash.com/photo-1487180142328-054b783fc471?auto=format&fit=crop&q=80&w=1200",
    likes: 112,
    comments: [
      { id: "c-11", author: "BandFanatic", text: "The mutual respect and energy between Julian and Marcus is inspiring.", date: "June 20, 2026" }
    ]
  },
  {
    id: "photo-9",
    title: "Drenched in Laser Light",
    category: "live",
    date: "June 08, 2026",
    location: "Austin, TX",
    photographer: "Lucas Thorne",
    description: "Marcus silhouetted against our massive customized 3D holographic projection rig during 'Resonance'.",
    imageUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=1200",
    likes: 178,
    comments: [
      { id: "c-12", author: "VJMix", text: "This hologram rig is visual poetry.", date: "June 09, 2026" }
    ]
  }
];

const PHOTO_PRESETS = [
  { name: 'Neon Stage vibe', url: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&q=80&w=1200' },
  { name: 'Warm Studio gear', url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&q=80&w=1200' },
  { name: 'Glow Lights stage', url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&q=80&w=1200' },
  { name: 'Synthesizers knobs', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1200' }
];

export default function PhotoGallery() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'live' | 'studio' | 'backstage'>('all');
  const [activePhotoIdx, setActivePhotoIdx] = useState<number | null>(null);

  // Live Photos list with persistent local storage
  const [photos, setPhotos] = useState<PhotoItem[]>(() => {
    const saved = localStorage.getItem('vh_gallery_photos_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved gallery:", e);
      }
    }
    return INITIAL_PHOTOS;
  });

  // Sync back to local storage
  useEffect(() => {
    localStorage.setItem('vh_gallery_photos_v2', JSON.stringify(photos));
  }, [photos]);

  // Transient feedback state (copied link, deleted notifications)
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null); // Click twice to confirm delete
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form Fields State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<'live' | 'studio' | 'backstage'>('live');
  const [formDate, setFormDate] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formPhotographer, setFormPhotographer] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCustomUrl, setFormCustomUrl] = useState('');
  const [selectedPresetUrl, setSelectedPresetUrl] = useState('');
  const [uploadedBase64, setUploadedBase64] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Comments Input State (inside full view modal)
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentText, setCommentText] = useState('');

  // File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter photos
  const filteredPhotos = photos.filter(photo => {
    if (selectedCategory === 'all') return true;
    return photo.category === selectedCategory;
  });

  // Keyboard navigation inside modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activePhotoIdx === null) return;
      if (e.key === 'Escape') {
        setActivePhotoIdx(null);
      } else if (e.key === 'ArrowRight') {
        handleNextPhoto();
      } else if (e.key === 'ArrowLeft') {
        handlePrevPhoto();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePhotoIdx, filteredPhotos]);

  const handleNextPhoto = () => {
    if (activePhotoIdx === null || filteredPhotos.length === 0) return;
    const nextInFilter = (activePhotoIdx + 1) % filteredPhotos.length;
    setActivePhotoIdx(nextInFilter);
  };

  const handlePrevPhoto = () => {
    if (activePhotoIdx === null || filteredPhotos.length === 0) return;
    const prevInFilter = (activePhotoIdx - 1 + filteredPhotos.length) % filteredPhotos.length;
    setActivePhotoIdx(prevInFilter);
  };

  // Like Toggle action
  const handleLike = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setPhotos(prev => prev.map(photo => {
      if (photo.id === id) {
        const isLiked = !photo.isLiked;
        return {
          ...photo,
          isLiked,
          likes: isLiked ? photo.likes + 1 : photo.likes - 1
        };
      }
      return photo;
    }));
  };

  // Share Copy link action
  const handleShare = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const mockLink = `${window.location.origin}/#gallery-photo-${id}`;
    navigator.clipboard.writeText(mockLink).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(err => {
      console.warn("Clipboard access denied", err);
    });
  };

  // Click-twice deletion logic to prevent mistakes
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (deletingId === id) {
      // Confirmed delete
      setPhotos(prev => prev.filter(p => p.id !== id));
      setDeletingId(null);
      if (activePhotoIdx !== null) {
        setActivePhotoIdx(null);
      }
      triggerSuccessToast("Photo archive deleted successfully.");
    } else {
      setDeletingId(id);
      // reset after 3 seconds if not clicked again
      setTimeout(() => {
        setDeletingId(current => current === id ? null : current);
      }, 3000);
    }
  };

  // Comment submission
  const handleAddComment = (e: React.FormEvent, photoId: string) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const authorName = commentAuthor.trim() || "Anonymous Fan";
    const newComment: CommentItem = {
      id: `comment-${Date.now()}`,
      author: authorName,
      text: commentText.trim(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    setPhotos(prev => prev.map(p => {
      if (p.id === photoId) {
        return {
          ...p,
          comments: [...p.comments, newComment]
        };
      }
      return p;
    }));

    setCommentText('');
    setCommentAuthor('');
  };

  // Toast Helper
  const triggerSuccessToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Drag over upload handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle file drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  // Handle file picker selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Convert File to base64
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("Please upload a valid image file.");
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setUploadedBase64(reader.result as string);
      setSelectedPresetUrl(''); // Clear preset if file is uploaded
      setFormCustomUrl(''); // Clear custom url
    };
  };

  // Save the custom concert memory
  const handleSaveMemory = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      alert("Please provide a Title for the concert photo.");
      return;
    }

    // Determine absolute image URL
    let finalImageUrl = 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&q=80&w=1200'; // Default fallback
    if (uploadedBase64) {
      finalImageUrl = uploadedBase64;
    } else if (selectedPresetUrl) {
      finalImageUrl = selectedPresetUrl;
    } else if (formCustomUrl.trim()) {
      finalImageUrl = formCustomUrl.trim();
    }

    const newPhoto: PhotoItem = {
      id: `user-photo-${Date.now()}`,
      title: formTitle.trim(),
      category: formCategory,
      date: formDate.trim() || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      location: formLocation.trim() || "Concert Stage",
      photographer: formPhotographer.trim() || "Concert Attendee",
      description: formDescription.trim() || "Amazing memory captured live at the Velvet Horizon tour stage.",
      imageUrl: finalImageUrl,
      likes: 0,
      comments: [],
      isUserUploaded: true
    };

    setPhotos(prev => [newPhoto, ...prev]);

    // Reset Form fields
    setFormTitle('');
    setFormCategory('live');
    setFormDate('');
    setFormLocation('');
    setFormPhotographer('');
    setFormDescription('');
    setFormCustomUrl('');
    setSelectedPresetUrl('');
    setUploadedBase64('');

    triggerSuccessToast("Your concert memory was successfully added to the gallery!");
  };

  return (
    <div className="space-y-12 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-[#3D3A35] dark:text-[#E2E8F0] font-sans" id="photo-gallery-page">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            id="gallery-toast-msg"
            className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[1000] bg-[#BC6C25] dark:bg-emerald-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2.5 font-mono text-xs tracking-wider uppercase font-bold"
          >
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div 
        className="relative rounded-[32px] overflow-hidden p-8 md:p-14 border border-white/20 dark:border-white/10 backdrop-blur-xl bg-white/20 dark:bg-[#0D1527]/30 shadow-sm text-center max-w-5xl mx-auto space-y-4"
        id="gallery-glass-header"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#BC6C25]/10 dark:bg-emerald-500/15 rounded-full blur-[70px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 dark:bg-blue-600/10 rounded-full blur-[70px] pointer-events-none" />

        <div className="space-y-3 relative z-10 max-w-2xl mx-auto">
          <span className="font-mono text-xs text-[#BC6C25] dark:text-[#F59E0B] tracking-[0.25em] block uppercase font-extrabold flex items-center justify-center gap-2">
            <Camera className="w-4 h-4 animate-pulse" /> FAN PORTAL & GALLERIES
          </span>
          <h1 className="font-serif font-bold text-4xl md:text-5.5xl text-[#4A5D4E] dark:text-emerald-400 tracking-tight leading-none">
            Echoes & Frames
          </h1>
          <p className="font-serif text-xs md:text-sm text-[#6B655C] dark:text-[#94A3B8] leading-relaxed max-w-xl mx-auto italic pt-1">
            Browse high-definition captures of the band, customize memory feeds, add like tags, submit comments, or upload your own concert frames.
          </p>
        </div>
      </div>

      {/* Elegant Segmented Category Filter */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto" id="gallery-filters-container">
        {[
          { id: 'all', label: 'All Archives' },
          { id: 'live', label: 'Live Concerts' },
          { id: 'studio', label: 'Studio Retreats' },
          { id: 'backstage', label: 'Backstage' }
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id as any);
              setActivePhotoIdx(null);
            }}
            id={`gallery-filter-btn-${cat.id}`}
            className={`px-4 py-2 rounded-full font-mono text-[10px] uppercase font-bold tracking-widest cursor-pointer transition-all border ${
              selectedCategory === cat.id
                ? 'bg-[#BC6C25] dark:bg-emerald-500 border-[#BC6C25] dark:border-emerald-500 text-white shadow-sm'
                : 'bg-white dark:bg-[#111625] border-[#E5DED4] dark:border-[#1E2638] text-[#6B655C] dark:text-[#94A3B8] hover:text-[#3D3A35] dark:hover:text-white hover:bg-[#F2ECE4] dark:hover:bg-[#1E2638]/50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of Photo Cards */}
      <motion.div 
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
        id="gallery-grid"
      >
        <AnimatePresence mode="popLayout">
          {filteredPhotos.map((photo, index) => {
            const isLiked = photo.isLiked;
            const isDeleting = deletingId === photo.id;
            const commentsCount = photo.comments ? photo.comments.length : 0;

            return (
              <motion.div
                key={photo.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                onClick={() => setActivePhotoIdx(index)}
                id={`gallery-photo-card-${photo.id}`}
                className="group relative rounded-2xl overflow-hidden bg-white dark:bg-[#111625] border border-[#E5DED4] dark:border-[#1E2638] cursor-pointer shadow-sm hover:shadow-xl transition-all h-[360px] flex flex-col"
              >
                {/* Image Area */}
                <div className="relative flex-1 overflow-hidden bg-neutral-150 dark:bg-neutral-850" id={`gallery-image-container-${photo.id}`}>
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Hover visual check overlay */}
                  <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="p-3.5 rounded-full bg-white/95 dark:bg-[#111625]/95 text-[#3D3A35] dark:text-[#E2E8F0] shadow-md transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                      <Eye className="w-5 h-5 text-[#BC6C25] dark:text-emerald-400" />
                    </div>
                  </div>

                  {/* Left Floating Category Tag */}
                  <div className="absolute top-3 left-3 z-10" id={`gallery-category-badge-${photo.id}`}>
                    <span className="px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md text-[8px] font-mono font-bold tracking-widest text-white uppercase border border-white/10">
                      {photo.category}
                    </span>
                  </div>

                  {/* Action Floating Buttons Bar inside card */}
                  <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                    {/* Share action */}
                    <button
                      onClick={(e) => handleShare(e, photo.id)}
                      id={`card-share-btn-${photo.id}`}
                      className="p-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 hover:bg-[#BC6C25] dark:hover:bg-emerald-600 text-white transition-colors duration-200 relative group"
                      title="Copy Share Link"
                    >
                      {copiedId === photo.id ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Share2 className="w-3.5 h-3.5" />}
                      <AnimatePresence>
                        {copiedId === photo.id && (
                          <motion.span 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: -25 }}
                            exit={{ opacity: 0 }}
                            className="absolute right-0 bg-[#3D3A35] text-white text-[8px] font-mono uppercase tracking-wider py-1 px-2 rounded-md whitespace-nowrap"
                          >
                            Copied!
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </button>

                    {/* Delete capability (for user uploaded ones or any for convenience) */}
                    <button
                      onClick={(e) => handleDelete(e, photo.id)}
                      id={`card-delete-btn-${photo.id}`}
                      className={`p-1.5 rounded-full backdrop-blur-md border transition-all duration-200 ${
                        isDeleting 
                          ? 'bg-red-600 border-red-500 text-white font-bold scale-110' 
                          : 'bg-black/60 border-white/10 hover:bg-red-600 text-white/80 hover:text-white'
                      }`}
                      title={isDeleting ? "Click again to confirm delete" : "Delete image archive"}
                    >
                      {isDeleting ? <span className="text-[8px] font-mono uppercase px-1 font-extrabold">Confirm?</span> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Info & Micro Actions Bar */}
                <div className="p-4 flex flex-col justify-between bg-white dark:bg-[#111625]" id={`gallery-meta-${photo.id}`}>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-[#3D3A35] dark:text-white truncate group-hover:text-[#BC6C25] dark:group-hover:text-emerald-400 transition-colors">
                      {photo.title}
                    </h3>
                    <p className="font-mono text-[9px] text-neutral-400 dark:text-neutral-500 mt-0.5 uppercase tracking-widest truncate">
                      {photo.location} — {photo.date}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#E5DED4]/50 dark:border-[#1E2638]/50 flex items-center justify-between" id={`gallery-card-footer-${photo.id}`}>
                    <div className="flex items-center gap-3 font-mono text-[10px] text-[#6B655C] dark:text-[#94A3B8]" onClick={e => e.stopPropagation()}>
                      {/* Interactive Like action */}
                      <button 
                        onClick={(e) => handleLike(e, photo.id)}
                        className="flex items-center gap-1 group/like focus:outline-none cursor-pointer"
                        id={`card-like-action-${photo.id}`}
                        title="Like photo"
                      >
                        <motion.div whileTap={{ scale: 1.4 }}>
                          <Heart className={`w-3.5 h-3.5 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-[#6B655C] dark:text-[#94A3B8] group-hover/like:text-red-400'}`} />
                        </motion.div>
                        <span className={isLiked ? 'text-red-500 font-bold' : ''}>{photo.likes}</span>
                      </button>

                      {/* Interactive Comment count preview */}
                      <button 
                        onClick={() => setActivePhotoIdx(index)}
                        className="flex items-center gap-1 hover:text-[#BC6C25] dark:hover:text-emerald-400 cursor-pointer"
                        id={`card-comment-action-${photo.id}`}
                        title="View comments"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{commentsCount}</span>
                      </button>
                    </div>

                    <div className="text-[9px] font-mono text-[#6B655C] dark:text-[#94A3B8] truncate max-w-[120px] text-right">
                      <span className="opacity-60 italic">by</span> <span className="font-bold text-[#3D3A35] dark:text-neutral-200">{photo.photographer}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* User Concert Photo Upload Section (Placed at the bottom / last section of the page) */}
      <div 
        className="max-w-3xl mx-auto bg-white/70 dark:bg-[#111625]/70 backdrop-blur-md rounded-[24px] border border-[#E5DED4] dark:border-[#1E2638] shadow-md p-6 md:p-8 space-y-6"
        id="concert-upload-form-section"
      >
        <div className="space-y-1" id="form-header-intro">
          <span className="font-mono text-[9px] text-[#BC6C25] dark:text-emerald-400 tracking-widest uppercase font-extrabold block">
            STATION WORKSPACE
          </span>
          <h2 className="font-serif font-bold text-2xl text-[#3D3A35] dark:text-[#E2E8F0]">
            Upload Your Concert Frame
          </h2>
          <p className="text-xs text-[#6B655C] dark:text-[#94A3B8] leading-relaxed">
            Have an outstanding concert memory or studio setup capture? Save it directly into the collective Velvet Horizon live feed database.
          </p>
        </div>

        <form onSubmit={handleSaveMemory} className="space-y-4" id="upload-memory-form">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="form-grid-fields">
            {/* Title */}
            <div className="flex flex-col space-y-1">
              <label htmlFor="input-form-title" className="font-mono text-[10px] uppercase font-bold text-[#6B655C] dark:text-[#94A3B8]">
                Photo Title *
              </label>
              <input
                type="text"
                id="input-form-title"
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                placeholder="e.g. Red Rock Amphitheater Crowd"
                required
                className="px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-[#1E2638] border border-[#E5DED4] dark:border-[#2A354F] text-[#3D3A35] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#BC6C25] dark:focus:ring-emerald-500"
              />
            </div>

            {/* Category selection */}
            <div className="flex flex-col space-y-1">
              <label htmlFor="select-form-category" className="font-mono text-[10px] uppercase font-bold text-[#6B655C] dark:text-[#94A3B8]">
                Category Channel
              </label>
              <select
                id="select-form-category"
                value={formCategory}
                onChange={e => setFormCategory(e.target.value as any)}
                className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#1E2638] border border-[#E5DED4] dark:border-[#2A354F] text-[#3D3A35] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#BC6C25] dark:focus:ring-emerald-500"
              >
                <option value="live">Live Concert Stage</option>
                <option value="studio">Studio Archives</option>
                <option value="backstage">Backstage Pass</option>
              </select>
            </div>

            {/* Location */}
            <div className="flex flex-col space-y-1">
              <label htmlFor="input-form-location" className="font-mono text-[10px] uppercase font-bold text-[#6B655C] dark:text-[#94A3B8]">
                Venue / Location
              </label>
              <input
                type="text"
                id="input-form-location"
                value={formLocation}
                onChange={e => setFormLocation(e.target.value)}
                placeholder="e.g. Denver, CO"
                className="px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-[#1E2638] border border-[#E5DED4] dark:border-[#2A354F] text-[#3D3A35] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#BC6C25] dark:focus:ring-emerald-500"
              />
            </div>

            {/* Date */}
            <div className="flex flex-col space-y-1">
              <label htmlFor="input-form-date" className="font-mono text-[10px] uppercase font-bold text-[#6B655C] dark:text-[#94A3B8]">
                Event Date
              </label>
              <input
                type="text"
                id="input-form-date"
                value={formDate}
                onChange={e => setFormDate(e.target.value)}
                placeholder="e.g. June 22, 2026"
                className="px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-[#1E2638] border border-[#E5DED4] dark:border-[#2A354F] text-[#3D3A35] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#BC6C25] dark:focus:ring-emerald-500"
              />
            </div>

            {/* Photographer */}
            <div className="flex flex-col space-y-1">
              <label htmlFor="input-form-photographer" className="font-mono text-[10px] uppercase font-bold text-[#6B655C] dark:text-[#94A3B8]">
                Photographer
              </label>
              <input
                type="text"
                id="input-form-photographer"
                value={formPhotographer}
                onChange={e => setFormPhotographer(e.target.value)}
                placeholder="Your Name / handle"
                className="px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-[#1E2638] border border-[#E5DED4] dark:border-[#2A354F] text-[#3D3A35] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#BC6C25] dark:focus:ring-emerald-500"
              />
            </div>

            {/* Custom image URL input */}
            <div className="flex flex-col space-y-1">
              <label htmlFor="input-form-customurl" className="font-mono text-[10px] uppercase font-bold text-[#6B655C] dark:text-[#94A3B8]">
                Custom Image URL (Optional)
              </label>
              <input
                type="url"
                id="input-form-customurl"
                value={formCustomUrl}
                disabled={!!uploadedBase64}
                onChange={e => {
                  setFormCustomUrl(e.target.value);
                  if (e.target.value) {
                    setUploadedBase64('');
                    setSelectedPresetUrl('');
                  }
                }}
                placeholder="https://images.unsplash.com/... or blank"
                className="px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-[#1E2638] border border-[#E5DED4] dark:border-[#2A354F] text-[#3D3A35] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#BC6C25] dark:focus:ring-emerald-500 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col space-y-1" id="form-desc-wrapper">
            <label htmlFor="input-form-desc" className="font-mono text-[10px] uppercase font-bold text-[#6B655C] dark:text-[#94A3B8]">
              Image Description / Story
            </label>
            <textarea
              id="input-form-desc"
              rows={2}
              value={formDescription}
              onChange={e => setFormDescription(e.target.value)}
              placeholder="What makes this frame special? Tell us about the audio aura..."
              className="px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-[#1E2638] border border-[#E5DED4] dark:border-[#2A354F] text-[#3D3A35] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#BC6C25] dark:focus:ring-emerald-500"
            />
          </div>

          {/* Preset templates choice */}
          <div className="space-y-2 pt-1" id="form-preset-templates-selector">
            <span className="font-mono text-[10px] uppercase font-bold text-[#6B655C] dark:text-[#94A3B8] block">
              Or Choose an Elegant Scenic Vibe
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5" id="presets-choices-row">
              {PHOTO_PRESETS.map((p, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => {
                    setSelectedPresetUrl(p.url);
                    setUploadedBase64('');
                    setFormCustomUrl('');
                  }}
                  id={`preset-option-btn-${idx}`}
                  className={`relative h-14 rounded-xl overflow-hidden cursor-pointer transition-all border-2 text-left ${
                    selectedPresetUrl === p.url 
                      ? 'border-[#BC6C25] dark:border-emerald-500 scale-102 shadow-sm' 
                      : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={p.url} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/45 flex items-end p-1">
                    <span className="text-[7.5px] font-mono font-bold text-white uppercase truncate block w-full">{p.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive File drag & drop box */}
          <div className="space-y-2 pt-2" id="form-file-upload-dragbox">
            <span className="font-mono text-[10px] uppercase font-bold text-[#6B655C] dark:text-[#94A3B8] block">
              Or Drop a Local Concert Photo
            </span>
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2 ${
                dragActive 
                  ? 'border-[#BC6C25] bg-[#BC6C25]/5 dark:border-emerald-500 dark:bg-emerald-500/5' 
                  : 'border-[#E5DED4] dark:border-[#2A354F] hover:border-[#BC6C25]/60 dark:hover:border-emerald-500/60'
              }`}
              id="drop-target-area"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="hidden-file-input"
              />

              {uploadedBase64 ? (
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#E5DED4] dark:border-[#2A354F]" id="uploaded-base64-preview">
                  <img src={uploadedBase64} className="w-full h-full object-cover" alt="Selected thumbnail" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadedBase64('');
                    }}
                    className="absolute top-1 right-1 p-0.5 rounded-full bg-black/70 text-white hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-1.5" id="dragbox-prompt">
                  <Upload className="w-6 h-6 text-neutral-400" />
                  <p className="text-xs font-semibold text-[#3D3A35] dark:text-[#E2E8F0]">
                    Drag & Drop concert file here, or <span className="text-[#BC6C25] dark:text-emerald-400 underline font-bold">browse</span>
                  </p>
                  <p className="text-[9px] text-neutral-400 dark:text-neutral-500 font-mono uppercase">
                    Supports JPEG, PNG, WEBP files
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Actions button */}
          <div className="pt-2 flex justify-end" id="form-submit-actions">
            <button
              type="submit"
              id="save-memory-submit-btn"
              className="px-6 py-2.5 rounded-full font-mono text-xs uppercase font-bold tracking-widest text-white bg-[#BC6C25] hover:bg-[#A3591E] dark:bg-emerald-500 dark:hover:bg-emerald-600 shadow-md hover:scale-102 active:scale-98 transition-all cursor-pointer flex items-center gap-1.5 focus:outline-none"
            >
              <Plus className="w-4 h-4" /> Save Concert Memory
            </button>
          </div>
        </form>
      </div>

      {/* Full-Screen Lightbox Modal Popup with Split-Screen & Active Comments Sidebar */}
      <AnimatePresence>
        {activePhotoIdx !== null && filteredPhotos[activePhotoIdx] && (
          (() => {
            const currentPhoto = filteredPhotos[activePhotoIdx];
            const isLiked = currentPhoto.isLiked;

            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                id="gallery-fullscreen-modal"
                className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-md flex flex-col lg:flex-row text-[#E2E8F0] select-none"
                onClick={() => setActivePhotoIdx(null)}
              >
                {/* LEFT PORTION: Large Immersive Image & Navigation Slider */}
                <div className="flex-1 flex flex-col justify-between p-4 md:p-6 relative min-h-[50vh] lg:min-h-screen" onClick={e => e.stopPropagation()}>
                  {/* Top Bar on Image Portion */}
                  <div className="w-full flex items-center justify-between z-10" id="modal-top-bar-left">
                    <div className="flex flex-col text-left">
                      <span className="font-mono text-[9px] tracking-widest text-[#BC6C25] dark:text-emerald-400 uppercase font-bold flex items-center gap-1.5">
                        <Tag className="w-3 h-3" /> {currentPhoto.category} VIEWPORT
                      </span>
                      <h2 className="font-serif font-bold text-lg md:text-xl text-neutral-100">
                        {currentPhoto.title}
                      </h2>
                    </div>
                  </div>

                  {/* Main Slider Area */}
                  <div className="flex-1 flex items-center justify-between relative my-3" id="modal-image-slider-area">
                    {/* Left Chevron Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevPhoto();
                      }}
                      id="gallery-modal-prev-btn"
                      className="absolute left-2 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white hover:scale-105 active:scale-95 transition-all cursor-pointer focus:outline-none"
                      title="Previous (ArrowLeft)"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {/* Image visual wrapper */}
                    <div className="w-full h-full flex items-center justify-center p-2">
                      <motion.div
                        key={currentPhoto.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="relative max-h-[45vh] lg:max-h-[75vh] max-w-full rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-neutral-900"
                      >
                        <img
                          src={currentPhoto.imageUrl}
                          alt={currentPhoto.title}
                          className="max-h-[45vh] lg:max-h-[75vh] w-auto max-w-full object-contain mx-auto"
                          referrerPolicy="no-referrer"
                        />
                      </motion.div>
                    </div>

                    {/* Right Chevron Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextPhoto();
                      }}
                      id="gallery-modal-next-btn"
                      className="absolute right-2 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white hover:scale-105 active:scale-95 transition-all cursor-pointer focus:outline-none"
                      title="Next (ArrowRight)"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Micro Helper Index Indicator at bottom of left stage */}
                  <div className="text-center font-mono text-[8px] text-neutral-500 uppercase tracking-widest" id="modal-image-counter">
                    Use Left/Right keys to navigate • Frame {activePhotoIdx + 1} of {filteredPhotos.length}
                  </div>
                </div>

                {/* RIGHT PORTION: Split-screen sidebar with details, Likes count, and interactive fan feedback comments thread */}
                <div 
                  className="w-full lg:w-[400px] bg-neutral-950/90 lg:bg-[#0A0D14]/95 border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col justify-between h-[50vh] lg:h-screen z-10 overflow-hidden"
                  onClick={e => e.stopPropagation()}
                  id="modal-details-sidebar"
                >
                  {/* Sidebar Header details */}
                  <div className="p-4 md:p-6 border-b border-white/10 space-y-4" id="sidebar-header-details">
                    <div className="flex items-center justify-between" id="sidebar-header-actions-row">
                      <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-[#BC6C25] dark:text-emerald-400">
                        Detailed Archives
                      </span>
                      {/* Close button top right */}
                      <button
                        onClick={() => setActivePhotoIdx(null)}
                        className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white hover:scale-105 transition-all cursor-pointer focus:outline-none"
                        title="Close Modal (Esc)"
                        id="sidebar-close-btn"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Meta info boxes (Location, Date, Photographer) */}
                    <div className="grid grid-cols-3 gap-2 text-left" id="sidebar-meta-subgrid">
                      <div className="bg-white/5 rounded-xl p-2.5 space-y-1">
                        <MapPin className="w-3.5 h-3.5 text-[#BC6C25] dark:text-emerald-400" />
                        <span className="text-[7.5px] font-mono tracking-wider text-neutral-500 block uppercase">VENUE</span>
                        <span className="text-[10px] font-bold text-neutral-200 block truncate">{currentPhoto.location}</span>
                      </div>

                      <div className="bg-white/5 rounded-xl p-2.5 space-y-1">
                        <Calendar className="w-3.5 h-3.5 text-[#BC6C25] dark:text-emerald-400" />
                        <span className="text-[7.5px] font-mono tracking-wider text-neutral-500 block uppercase">DATE</span>
                        <span className="text-[10px] font-bold text-neutral-200 block truncate">{currentPhoto.date}</span>
                      </div>

                      <div className="bg-white/5 rounded-xl p-2.5 space-y-1">
                        <Camera className="w-3.5 h-3.5 text-[#BC6C25] dark:text-emerald-400" />
                        <span className="text-[7.5px] font-mono tracking-wider text-neutral-500 block uppercase">LENS BY</span>
                        <span className="text-[10px] font-bold text-neutral-200 block truncate">{currentPhoto.photographer}</span>
                      </div>
                    </div>

                    {/* Story description text */}
                    <div className="space-y-1 text-left" id="sidebar-story-description">
                      <span className="text-[8px] font-mono tracking-widest uppercase text-neutral-500 font-bold block">MEMO DETAILS</span>
                      <p className="text-xs text-neutral-300 leading-relaxed italic font-serif">
                        "{currentPhoto.description}"
                      </p>
                    </div>

                    {/* Action Panel Toggles inside modal header */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/5" id="sidebar-actions-panel-row">
                      <div className="flex items-center gap-4 text-xs font-mono">
                        {/* Likes counter */}
                        <button 
                          onClick={(e) => handleLike(e, currentPhoto.id)}
                          className="flex items-center gap-1.5 text-neutral-300 hover:text-red-400 cursor-pointer group focus:outline-none"
                          id={`sidebar-like-action-${currentPhoto.id}`}
                        >
                          <Heart className={`w-4 h-4 ${currentPhoto.isLiked ? 'fill-red-500 text-red-500' : 'text-neutral-300 group-hover:text-red-400'}`} />
                          <span className={currentPhoto.isLiked ? 'text-red-400 font-bold' : ''}>{currentPhoto.likes} Likes</span>
                        </button>

                        {/* Comments Count indicator */}
                        <div className="flex items-center gap-1.5 text-neutral-300">
                          <MessageCircle className="w-4 h-4 text-neutral-300" />
                          <span>{currentPhoto.comments.length} Comments</span>
                        </div>
                      </div>

                      {/* Share & Delete inside sidebar */}
                      <div className="flex items-center gap-1.5" id="sidebar-quick-actions">
                        <button
                          onClick={(e) => handleShare(e, currentPhoto.id)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer relative"
                          title="Copy Share Link"
                          id="sidebar-share-btn"
                        >
                          {copiedId === currentPhoto.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, currentPhoto.id)}
                          className={`p-1.5 rounded-lg transition-all text-xs font-mono uppercase tracking-wider font-bold cursor-pointer ${
                            deletingId === currentPhoto.id 
                              ? 'bg-red-600 text-white scale-102 px-2.5' 
                              : 'bg-white/5 hover:bg-red-600 hover:text-white'
                          }`}
                          title="Delete photo"
                          id="sidebar-delete-btn"
                        >
                          {deletingId === currentPhoto.id ? "Delete?" : <Trash2 className="w-3.5 h-3.5 text-white/80" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Scrollable comments listing feed */}
                  <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 text-left" id="sidebar-comments-list-feed">
                    <span className="font-mono text-[9px] uppercase tracking-widest font-extrabold text-[#BC6C25] dark:text-emerald-400 block mb-3">
                      Fan Feed & Logs ({currentPhoto.comments.length})
                    </span>

                    {currentPhoto.comments.length === 0 ? (
                      <div className="py-8 text-center text-xs text-neutral-500 space-y-1.5" id="no-comments-prompt">
                        <MessageCircle className="w-6 h-6 mx-auto opacity-35" />
                        <p>No fan remarks logged yet.</p>
                        <p className="text-[10px] text-neutral-600 uppercase font-mono tracking-wider">Be the first to echo!</p>
                      </div>
                    ) : (
                      <div className="space-y-3" id="comments-items-wrapper">
                        {currentPhoto.comments.map((cmt) => (
                          <div 
                            key={cmt.id} 
                            className="bg-white/5 rounded-xl p-3 border border-white/5 space-y-1" 
                            id={`comment-card-${cmt.id}`}
                          >
                            <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400" id={`comment-author-row-${cmt.id}`}>
                              <span className="font-bold text-neutral-200">@{cmt.author}</span>
                              <span>{cmt.date}</span>
                            </div>
                            <p className="text-xs text-neutral-300 leading-relaxed font-sans">{cmt.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Write a comment form section */}
                  <form 
                    onSubmit={(e) => handleAddComment(e, currentPhoto.id)}
                    className="p-4 border-t border-white/10 bg-[#07090E]"
                    id="sidebar-add-comment-form"
                  >
                    <div className="space-y-2.5" id="comment-form-inputs">
                      {/* Optional Name */}
                      <input
                        type="text"
                        value={commentAuthor}
                        onChange={e => setCommentAuthor(e.target.value)}
                        placeholder="Your Alias (e.g. @EchoFan)"
                        maxLength={25}
                        className="w-full px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-[#BC6C25] dark:focus:ring-emerald-500"
                        id="input-comment-author"
                      />

                      {/* Comment text area */}
                      <div className="relative flex items-center" id="comment-text-wrapper">
                        <input
                          type="text"
                          value={commentText}
                          onChange={e => setCommentText(e.target.value)}
                          placeholder="Type an acoustic feedback comment..."
                          required
                          className="w-full pl-3 pr-10 py-2 rounded-lg text-xs bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-[#BC6C25] dark:focus:ring-emerald-500"
                          id="input-comment-text"
                        />
                        <button
                          type="submit"
                          className="absolute right-1.5 p-1.5 rounded-md hover:bg-white/10 text-[#BC6C25] dark:text-emerald-400 hover:text-white transition-colors focus:outline-none"
                          title="Post Comment"
                          id="submit-comment-button"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </motion.div>
            );
          })()
        )}
      </AnimatePresence>
    </div>
  );
}
