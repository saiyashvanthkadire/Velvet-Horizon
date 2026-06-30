import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, ListMusic, ChevronDown, ChevronUp, Disc, Shuffle, Repeat, Settings, GripHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Track {
  id: string;
  title: string;
  albumTitle: string;
  albumCover: string;
  duration: string;
  audioUrl: string;
}

const PLAYLIST: Track[] = [
  {
    id: "nw-1",
    title: "Sunset Grid",
    albumTitle: "Neon Whispers",
    albumCover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=600",
    duration: "3:45",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    id: "nw-2",
    title: "Retrograde",
    albumTitle: "Neon Whispers",
    albumCover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=600",
    duration: "4:12",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    id: "nw-3",
    title: "Echoes in Tokyo",
    albumTitle: "Neon Whispers",
    albumCover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=600",
    duration: "3:55",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  },
  {
    id: "nw-4",
    title: "Midnight Drive",
    albumTitle: "Neon Whispers",
    albumCover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=600",
    duration: "5:01",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
  },
  {
    id: "nw-5",
    title: "Static Waves",
    albumTitle: "Neon Whispers",
    albumCover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=600",
    duration: "3:30",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
  },
  {
    id: "sd-1",
    title: "Nocturnal",
    albumTitle: "Shadows & Dust",
    albumCover: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=600",
    duration: "4:08",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3"
  },
  {
    id: "sd-2",
    title: "Pale Blue Light",
    albumTitle: "Shadows & Dust",
    albumCover: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=600",
    duration: "3:42",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3"
  },
  {
    id: "sd-3",
    title: "Ghost In The Machine",
    albumTitle: "Shadows & Dust",
    albumCover: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=600",
    duration: "4:30",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"
  },
  {
    id: "sd-4",
    title: "Velvet Skyline",
    albumTitle: "Shadows & Dust",
    albumCover: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=600",
    duration: "3:58",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3"
  },
  {
    id: "sd-5",
    title: "After the Rain",
    albumTitle: "Shadows & Dust",
    albumCover: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=600",
    duration: "5:20",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3"
  },
  {
    id: "ef-1",
    title: "Golden Hour",
    albumTitle: "Elysian Fields",
    albumCover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=600",
    duration: "3:50",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3"
  },
  {
    id: "ef-2",
    title: "Astral Plane",
    albumTitle: "Elysian Fields",
    albumCover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=600",
    duration: "4:15",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3"
  },
  {
    id: "ef-3",
    title: "Resonance",
    albumTitle: "Elysian Fields",
    albumCover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=600",
    duration: "3:35",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3"
  },
  {
    id: "ef-4",
    title: "Silent Symphony",
    albumTitle: "Elysian Fields",
    albumCover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=600",
    duration: "4:45",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3"
  },
  {
    id: "ef-5",
    title: "Infinite Echo",
    albumTitle: "Elysian Fields",
    albumCover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=600",
    duration: "5:10",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3"
  }
];

export default function MiniMusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [showTracklist, setShowTracklist] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Custom Persistent Position & Draggable states
  const [playerPos, setPlayerPos] = useState<'bottom-left' | 'bottom-right' | 'top-right' | 'top-left'>(() => {
    const saved = localStorage.getItem('vh_player_pos_v1');
    return (saved as any) || 'bottom-left';
  });
  const [isDraggable, setIsDraggable] = useState<boolean>(() => {
    return localStorage.getItem('vh_player_drag_v1') === 'true';
  });

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  useEffect(() => {
    localStorage.setItem('vh_player_pos_v1', playerPos);
  }, [playerPos]);

  useEffect(() => {
    localStorage.setItem('vh_player_drag_v1', isDraggable ? 'true' : 'false');
  }, [isDraggable]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  const currentTrack = PLAYLIST[currentTrackIndex];

  // Initialize Audio
  useEffect(() => {
    audioRef.current = new Audio(currentTrack.audioUrl);
    
    const audio = audioRef.current;
    audio.volume = isMuted ? 0 : volume / 100;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play().catch(err => console.log('Audio replay issue:', err));
      } else {
        handleNext();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, [currentTrackIndex]);

  // Handle play/pause toggle
  const togglePlay = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.log('Playback blocked by browser autoplay settings:', err));
    }
  };

  // Sync volume state with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  // Track switching logic with immediate playback if it was already playing
  const playTrackAtIndex = (index: number) => {
    setCurrentTrackIndex(index);
    setCurrentTime(0);
    setDuration(0);
    
    // We want it to play automatically once loaded
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.src = PLAYLIST[index].audioUrl;
        audioRef.current.load();
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(err => console.log('Autoplay deferred:', err));
      }
    }, 50);
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * PLAYLIST.length);
      playTrackAtIndex(randomIndex);
    } else {
      const nextIndex = (currentTrackIndex + 1) % PLAYLIST.length;
      playTrackAtIndex(nextIndex);
    }
  };

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const prevIndex = (currentTrackIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
    playTrackAtIndex(prevIndex);
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !audioRef.current || duration === 0) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const targetTime = percentage * duration;
    
    audioRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const getPositionClass = () => {
    switch (playerPos) {
      case 'bottom-right':
        return 'fixed bottom-6 right-6 z-50 font-sans';
      case 'top-right':
        return 'fixed top-20 right-6 z-50 font-sans';
      case 'top-left':
        return 'fixed top-20 left-6 z-50 font-sans';
      case 'bottom-left':
      default:
        return 'fixed bottom-6 left-6 z-50 font-sans';
    }
  };

  return (
    <div className={getPositionClass()} id="persistent-music-player">
      <AnimatePresence mode="wait">
        {isMinimized ? (
          /* Minimized State: Rotating Compact CD Disc floating in corner */
          <motion.div
            key={`minimized-player-${playerPos}`}
            drag={isDraggable}
            dragMomentum={false}
            dragElastic={0.1}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={() => setIsMinimized(false)}
            className={`flex items-center gap-3 bg-white/95 dark:bg-[#111625]/95 backdrop-blur-md p-2.5 rounded-full shadow-lg border border-[#E5DED4] dark:border-[#1E2638] cursor-pointer hover:scale-105 active:scale-95 transition-all group ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
            title={isDraggable ? "Drag to relocate (Double click/Tap to expand)" : "Click/Tap to expand"}
            id="player-minimized-trigger"
          >
            {/* Spinning Vinyl Record Disc */}
            <div className="relative w-10 h-10 flex-shrink-0" id="player-minimized-disc-container">
              <img
                src={currentTrack.albumCover}
                alt={currentTrack.albumTitle}
                className={`w-full h-full rounded-full object-cover border border-neutral-300 dark:border-neutral-700 ${isPlaying ? 'animate-spin' : ''}`}
                style={{ animationDuration: '6s' }}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 m-auto w-3 h-3 bg-white dark:bg-[#111625] rounded-full border border-neutral-300 dark:border-neutral-700 flex items-center justify-center">
                <div className="w-1 h-1 bg-neutral-400 dark:bg-neutral-500 rounded-full" />
              </div>
            </div>

            {/* Song Details in Mini Bar */}
            <div className="flex flex-col pr-2 max-w-[120px]" id="player-minimized-details">
              <span className="font-sans font-bold text-xs text-[#3D3A35] dark:text-[#E2E8F0] truncate block">
                {currentTrack.title}
              </span>
              <span className="font-mono text-[9px] text-[#6B655C] dark:text-[#94A3B8] tracking-wider uppercase truncate block">
                {currentTrack.albumTitle}
              </span>
            </div>

            {/* Quick Play/Pause circle inside minimized mode */}
            <button
              onClick={togglePlay}
              id="player-minimized-play-toggle"
              className="w-8 h-8 rounded-full bg-[#BC6C25] dark:bg-emerald-500 text-white flex items-center justify-center hover:bg-[#CD7D36] dark:hover:bg-emerald-400 transition-colors cursor-pointer focus:outline-none"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
            </button>
          </motion.div>
        ) : (
          /* Maximized State: Fully-featured responsive music player dashboard */
          <motion.div
            key={`maximized-player-${playerPos}`}
            drag={isDraggable}
            dragMomentum={false}
            dragElastic={0.1}
            dragHandleClassName="drag-handle"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="w-[310px] md:w-[350px] bg-white/95 dark:bg-[#111625]/95 backdrop-blur-md rounded-2xl shadow-2xl border border-[#E5DED4] dark:border-[#1E2638] overflow-hidden"
            id="player-maximized-container"
          >
            {/* Drag Handle Bar at very top of player card if Draggable */}
            {isDraggable && (
              <div className="drag-handle w-full py-1 bg-[#BC6C25]/10 dark:bg-emerald-500/10 flex items-center justify-center cursor-grab active:cursor-grabbing border-b border-[#E5DED4]/40 dark:border-[#1E2638]/40" title="Drag Player">
                <GripHorizontal className="w-4 h-4 text-[#BC6C25]/50 dark:text-emerald-400/50" />
              </div>
            )}

            {/* Player Header with Settings & Minimize Button */}
            <div className="px-4 py-2 bg-[#F9F6F2] dark:bg-[#1E2638]/50 border-b border-[#E5DED4] dark:border-[#1E2638]/80 flex items-center justify-between" id="player-header">
              <div className="flex items-center gap-1.5" id="player-header-title">
                <Disc className={`w-4 h-4 text-[#BC6C25] dark:text-emerald-400 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
                <span className="font-mono text-[10px] uppercase tracking-widest font-bold text-[#6B655C] dark:text-[#94A3B8]">Velvet Horizon FM</span>
              </div>
              <div className="flex items-center gap-1.5" id="player-header-actions">
                {/* Settings Toggle button */}
                <button
                  onClick={() => {
                    setShowSettings(!showSettings);
                    setShowTracklist(false);
                  }}
                  id="player-settings-btn"
                  className={`p-1 rounded-md transition-all cursor-pointer ${showSettings ? 'text-[#BC6C25] dark:text-emerald-400 bg-[#BC6C25]/15' : 'text-[#6B655C] dark:text-[#94A3B8] hover:text-[#3D3A35] dark:hover:text-white hover:bg-[#E5DED4] dark:hover:bg-[#2A354F]'}`}
                  title="Player Settings & Position Selector"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setIsMinimized(true);
                    setShowTracklist(false);
                    setShowSettings(false);
                  }}
                  id="player-minimize-btn"
                  className="p-1 rounded-md hover:bg-[#E5DED4] dark:hover:bg-[#2A354F] text-[#6B655C] dark:text-[#94A3B8] hover:text-[#3D3A35] dark:hover:text-white transition-all cursor-pointer"
                  title="Minimize player"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Collapsible Settings Panel Section */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  id="player-settings-dropdown"
                  className="bg-[#F9F6F2]/95 dark:bg-[#0D111A]/95 border-t border-[#E5DED4] dark:border-[#1E2638] overflow-hidden"
                >
                  <div className="p-4 space-y-4" id="settings-body-container">
                    {/* Anchor Position Choice */}
                    <div>
                      <p className="font-mono text-[9px] text-[#6B655C] dark:text-[#94A3B8] tracking-widest uppercase font-bold mb-2">Anchor Corner Position</p>
                      <div className="grid grid-cols-2 gap-2" id="settings-position-grid">
                        {[
                          { id: 'top-left', label: 'Top Left' },
                          { id: 'top-right', label: 'Top Right' },
                          { id: 'bottom-left', label: 'Bottom Left' },
                          { id: 'bottom-right', label: 'Bottom Right' }
                        ].map((pos) => (
                          <button
                            key={pos.id}
                            onClick={() => setPlayerPos(pos.id as any)}
                            id={`settings-pos-btn-${pos.id}`}
                            className={`px-3 py-2 rounded-lg text-xs font-mono tracking-wider transition-all cursor-pointer border text-center ${playerPos === pos.id ? 'bg-[#BC6C25] dark:bg-emerald-500 border-[#BC6C25] dark:border-emerald-500 text-white font-bold' : 'bg-white dark:bg-[#1E2638] border-[#E5DED4] dark:border-[#2A354F] text-[#3D3A35] dark:text-[#94A3B8] hover:bg-[#E5DED4]/40 dark:hover:bg-[#1E2638]'}`}
                          >
                            {pos.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Enable Free Draggable Mode Toggle */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#E5DED4]/60 dark:border-[#1E2638]/60" id="settings-drag-toggle-row">
                      <div id="settings-drag-text">
                        <p className="font-mono text-[9px] text-[#6B655C] dark:text-[#94A3B8] tracking-widest uppercase font-bold">Free Drag Mode</p>
                        <p className="text-[10px] text-neutral-400 dark:text-neutral-500">Drag player anywhere on screen</p>
                      </div>
                      <button
                        onClick={() => setIsDraggable(!isDraggable)}
                        id="settings-drag-switch"
                        className={`w-10 h-6 rounded-full p-1 transition-all duration-300 focus:outline-none cursor-pointer flex items-center ${isDraggable ? 'bg-[#BC6C25] dark:bg-emerald-500 justify-end' : 'bg-neutral-300 dark:bg-[#1E2638] justify-start border border-[#E5DED4]/40'}`}
                      >
                        <motion.div 
                          layout 
                          className="w-4 h-4 rounded-full bg-white shadow-md"
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Player Display Area */}
            <div className="p-4" id="player-body">
              <div className="flex gap-4 items-center" id="player-track-info-layout">
                {/* Album Cover */}
                <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-lg overflow-hidden border border-[#E5DED4] dark:border-[#2A354F] shadow-sm" id="player-art">
                  <img
                    src={currentTrack.albumCover}
                    alt={currentTrack.albumTitle}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Song Meta Information */}
                <div className="flex-1 min-w-0" id="player-meta">
                  <h4 className="font-serif font-bold text-sm md:text-base text-[#3D3A35] dark:text-[#E2E8F0] truncate leading-tight">
                    {currentTrack.title}
                  </h4>
                  <p className="font-sans text-xs text-[#6B655C] dark:text-[#94A3B8] truncate mt-0.5">
                    {currentTrack.albumTitle}
                  </p>
                  <span className="inline-block mt-2 font-mono text-[9px] uppercase font-bold tracking-widest text-[#BC6C25] dark:text-emerald-400 bg-[#BC6C25]/10 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    Snippet
                  </span>
                </div>
              </div>

              {/* Progress Slider (Interactive Custom Range) */}
              <div className="mt-4" id="player-progress-section">
                <div 
                  ref={progressBarRef}
                  onClick={handleProgressBarClick}
                  id="player-progress-bar-bg"
                  className="w-full h-1.5 bg-[#E5DED4] dark:bg-[#1E2638] rounded-full cursor-pointer overflow-hidden relative group"
                >
                  <div 
                    id="player-progress-bar-fill"
                    className="h-full bg-[#BC6C25] dark:bg-emerald-500 rounded-full transition-all duration-75 relative"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                {/* Time Display indicators */}
                <div className="flex justify-between font-mono text-[9px] text-[#6B655C] dark:text-[#94A3B8] mt-1" id="player-time-display">
                  <span>{formatTime(currentTime)}</span>
                  <span>{currentTrack.duration}</span>
                </div>
              </div>

              {/* Core Playback Control Buttons */}
              <div className="flex items-center justify-between mt-3" id="player-control-actions">
                <div className="flex items-center gap-1.5" id="player-left-actions">
                  {/* Shuffle Toggle */}
                  <button
                    onClick={() => setIsShuffle(!isShuffle)}
                    id="player-shuffle-btn"
                    className={`p-1.5 rounded-md hover:bg-[#F2ECE4] dark:hover:bg-[#1E2638] transition-all cursor-pointer ${isShuffle ? 'text-[#BC6C25] dark:text-emerald-400 font-bold' : 'text-[#6B655C] dark:text-[#94A3B8]'}`}
                    title={isShuffle ? "Shuffle On" : "Shuffle Off"}
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                  </button>
                  {/* Repeat Toggle */}
                  <button
                    onClick={() => setIsRepeat(!isRepeat)}
                    id="player-repeat-btn"
                    className={`p-1.5 rounded-md hover:bg-[#F2ECE4] dark:hover:bg-[#1E2638] transition-all cursor-pointer ${isRepeat ? 'text-[#BC6C25] dark:text-emerald-400 font-bold' : 'text-[#6B655C] dark:text-[#94A3B8]'}`}
                    title={isRepeat ? "Repeat On" : "Repeat Off"}
                  >
                    <Repeat className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Primary Playback buttons (Prev, Play, Next) */}
                <div className="flex items-center gap-3" id="player-playback-toggles">
                  <button
                    onClick={handlePrev}
                    id="player-prev-btn"
                    className="p-2 rounded-full hover:bg-[#F2ECE4] dark:hover:bg-[#1E2638] text-[#3D3A35] dark:text-[#E2E8F0] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    title="Previous Track"
                  >
                    <SkipBack className="w-4 h-4 fill-current" />
                  </button>
                  <button
                    onClick={() => togglePlay()}
                    id="player-play-btn"
                    className="w-10 h-10 rounded-full bg-[#BC6C25] dark:bg-emerald-500 text-white flex items-center justify-center hover:bg-[#CD7D36] dark:hover:bg-emerald-400 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-md focus:outline-none"
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </button>
                  <button
                    onClick={handleNext}
                    id="player-next-btn"
                    className="p-2 rounded-full hover:bg-[#F2ECE4] dark:hover:bg-[#1E2638] text-[#3D3A35] dark:text-[#E2E8F0] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    title="Next Track"
                  >
                    <SkipForward className="w-4 h-4 fill-current" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5" id="player-right-actions">
                  {/* Playlist Toggle */}
                  <button
                    onClick={() => setShowTracklist(!showTracklist)}
                    id="player-playlist-btn"
                    className={`p-1.5 rounded-md hover:bg-[#F2ECE4] dark:hover:bg-[#1E2638] transition-all cursor-pointer ${showTracklist ? 'text-[#BC6C25] dark:text-emerald-400 font-bold bg-[#BC6C25]/10' : 'text-[#6B655C] dark:text-[#94A3B8]'}`}
                    title="Show Playlist"
                  >
                    <ListMusic className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Volume Controller slider bar */}
              <div className="mt-3.5 pt-3.5 border-t border-[#E5DED4]/60 dark:border-[#1E2638]/60 flex items-center gap-2.5" id="player-volume-control">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  id="player-volume-mute-btn"
                  className="text-[#6B655C] dark:text-[#94A3B8] hover:text-[#3D3A35] dark:hover:text-white transition-colors cursor-pointer"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(parseInt(e.target.value));
                    if (isMuted) setIsMuted(false);
                  }}
                  id="player-volume-slider"
                  className="flex-1 h-1 bg-[#E5DED4] dark:bg-[#1E2638] rounded-full appearance-none cursor-pointer accent-[#BC6C25] dark:accent-emerald-500 focus:outline-none"
                  style={{
                    background: `linear-gradient(to right, ${isMuted ? 'transparent' : '#BC6C25'} ${isMuted ? 0 : volume}%, #E5DED4 ${isMuted ? 0 : volume}%)`
                  }}
                />
              </div>
            </div>

            {/* Collapsible Playlist Tracklist Section */}
            <AnimatePresence>
              {showTracklist && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 210, opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  id="player-playlist-dropdown"
                  className="bg-[#F9F6F2]/95 dark:bg-[#0D111A]/95 border-t border-[#E5DED4] dark:border-[#1E2638] overflow-y-auto"
                >
                  <div className="p-3 space-y-1" id="playlist-tracklist-rows">
                    <p className="font-mono text-[9px] text-[#6B655C] dark:text-[#94A3B8] tracking-widest uppercase font-bold px-1.5 pb-2">Select Track ({PLAYLIST.length} Songs)</p>
                    {PLAYLIST.map((track, idx) => (
                      <button
                        key={track.id}
                        onClick={() => playTrackAtIndex(idx)}
                        id={`player-track-option-${track.id}`}
                        className={`w-full flex items-center justify-between p-1.5 rounded-lg text-left text-xs transition-all cursor-pointer ${currentTrackIndex === idx ? 'bg-[#BC6C25]/10 dark:bg-emerald-500/10 text-[#BC6C25] dark:text-emerald-400 font-semibold' : 'text-[#3D3A35] dark:text-[#94A3B8] hover:bg-[#E5DED4]/45 dark:hover:bg-[#1E2638]'}`}
                      >
                        <div className="flex items-center gap-2 min-w-0" id={`player-track-option-left-${track.id}`}>
                          <img src={track.albumCover} className="w-5 h-5 rounded object-cover" alt="" referrerPolicy="no-referrer" />
                          <div className="min-w-0" id={`player-track-option-meta-${track.id}`}>
                            <p className="truncate text-xs">{track.title}</p>
                            <p className="text-[9px] opacity-70 truncate font-mono tracking-wide">{track.albumTitle}</p>
                          </div>
                        </div>
                        <span className="font-mono text-[10px] opacity-85 ml-2">{track.duration}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
