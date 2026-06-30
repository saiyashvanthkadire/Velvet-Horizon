import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Sparkles, HelpCircle, Key, Waves, Calendar, MessageSquare, Shield, Clock, Mic, MicOff, Play, Pause, Square, Trash2, Download, Upload, Music, Check, AlertCircle, RotateCcw } from 'lucide-react';

export default function Instruments() {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [activeInstKey, setActiveInstKey] = useState<string | null>(null);
  const [activePad, setActivePad] = useState<string | null>(null);
  const activeOscs = useRef<{ [key: string]: any }>({});

  const [bookingName, setBookingName] = useState('');
  const [bookingEmail, setBookingEmail] = useState('');
  const [selectedRentalInst, setSelectedRentalInst] = useState('Astral Poly-Synthesizer');
  const [rentalDate, setRentalDate] = useState('');
  const [rentalDuration, setRentalDuration] = useState('1 Hour (Trial - Sandbox)');
  const [bookingNote, setBookingNote] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [isBooked, setIsBooked] = useState(false);

  // Interfaces
  interface SavedRecording {
    id: string;
    title: string;
    instrument: string;
    date: string;
    duration: number; // in seconds
    audioData: string; // Base64 url
  }

  // State for recording and saving
  const [savedRecordings, setSavedRecordings] = useState<SavedRecording[]>(() => {
    const saved = localStorage.getItem('vh_instruments_recordings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved recordings:", e);
      }
    }
    return [];
  });

  const [isRecording, setIsRecording] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  
  const [formTitle, setFormTitle] = useState('');
  const [formInstrument, setFormInstrument] = useState('Astral Synth');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // For playing saved recordings
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Sync saved recordings to localStorage
  useEffect(() => {
    localStorage.setItem('vh_instruments_recordings', JSON.stringify(savedRecordings));
  }, [savedRecordings]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (previewAudioRef.current) previewAudioRef.current.pause();
      if (activeAudioRef.current) activeAudioRef.current.pause();
    };
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Start recording
  const startRecording = async () => {
    try {
      // Pause any active playback
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        setPlayingId(null);
      }
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        setIsPlayingPreview(false);
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      let options = {};
      if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/webm' };
      } else if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported('audio/mp4')) {
        options = { mimeType: 'audio/mp4' };
      }
      
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setPreviewBlob(blob);
        
        // Convert to base64 immediately for saving
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        
        // Stop all tracks on the stream to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setElapsedTime(0);
      
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => {
          if (prev >= 15) { // Auto-stop at 15 seconds
            stopRecording();
            return 15;
          }
          return prev + 1;
        });
      }, 1000);

      triggerToast("Recording started. Play something!");
    } catch (err) {
      console.error("Microphone access denied", err);
      alert("Microphone access was denied or is not supported in this browser environment. Please enable microphone permissions in your browser settings.");
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    triggerToast("Recording captured! Preview below.");
  };

  // File upload processing
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (max 1.5MB to fit local storage limit safely)
      if (file.size > 1.5 * 1024 * 1024) {
        alert("File size exceeds 1.5MB. Please upload a short audio clip under 1.5MB to save it locally.");
        return;
      }

      if (!file.type.startsWith('audio/')) {
        alert("Please upload a valid audio file.");
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        setPreviewBlob(file);
        // Pre-fill form title with file name (without extension)
        const nameNoExt = file.name.replace(/\.[^/.]+$/, "");
        setFormTitle(nameNoExt);
        triggerToast("Audio file uploaded! Ready to save.");
      };
    }
  };

  // Play/Pause Preview audio
  const togglePlayPreview = () => {
    if (!previewUrl) return;

    if (isPlayingPreview) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      setIsPlayingPreview(false);
    } else {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        setPlayingId(null);
      }

      if (!previewAudioRef.current) {
        previewAudioRef.current = new Audio(previewUrl);
        previewAudioRef.current.onended = () => setIsPlayingPreview(false);
      } else {
        previewAudioRef.current.src = previewUrl;
      }
      
      previewAudioRef.current.play()
        .then(() => setIsPlayingPreview(true))
        .catch(e => {
          console.error("Preview playback failed", e);
          alert("Playback failed. Please try recording again or uploading a different file.");
        });
    }
  };

  // Clear current active preview
  const resetPreview = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }
    setPreviewUrl(null);
    setPreviewBlob(null);
    setIsPlayingPreview(false);
    setFormTitle('');
  };

  // Save current preview to list
  const handleSaveRecording = (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUrl) return;
    if (!formTitle.trim()) {
      alert("Please enter a title for your recording.");
      return;
    }

    const newRec: SavedRecording = {
      id: `rec-${Date.now()}`,
      title: formTitle.trim(),
      instrument: formInstrument,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      duration: elapsedTime || 5, // fallback estimate if uploaded
      audioData: previewUrl
    };

    setSavedRecordings(prev => [newRec, ...prev]);
    resetPreview();
    triggerToast("Saved to Tape Deck successfully!");
  };

  // Play/pause a saved recording
  const playSavedRecording = (id: string, base64Data: string) => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      setIsPlayingPreview(false);
    }

    if (playingId === id) {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
      }
      setPlayingId(null);
    } else {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
      }

      const audio = new Audio(base64Data);
      activeAudioRef.current = audio;
      setPlayingId(id);
      
      audio.play()
        .catch(e => {
          console.error("Playback failed", e);
          setPlayingId(null);
        });

      audio.onended = () => {
        setPlayingId(null);
      };
    }
  };

  // Download a recording
  const downloadRecording = (rec: SavedRecording) => {
    const link = document.createElement('a');
    link.href = rec.audioData;
    
    let extension = 'webm';
    const matches = rec.audioData.match(/^data:audio\/([^;]+);/);
    if (matches && matches[1]) {
      extension = matches[1];
    }
    
    link.download = `${rec.title.toLowerCase().replace(/\s+/g, '-')}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Delete a recording
  const deleteRecording = (id: string) => {
    if (playingId === id && activeAudioRef.current) {
      activeAudioRef.current.pause();
      setPlayingId(null);
    }
    setSavedRecordings(prev => prev.filter(r => r.id !== id));
    triggerToast("Recording deleted.");
  };

  // Initialize Audio Context on click
  const activateAudio = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      setAudioContext(ctx);
      setIsAudioActive(true);
    } catch (e) {
      alert('Your browser does not support Web Audio API synthesis.');
    }
  };

  // Synthesize custom sound wave
  const playSound = (instrumentType: string, noteFreq: number, padId?: string) => {
    if (!audioContext) {
      activateAudio();
      return;
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    const triggerId = padId || `${instrumentType}-${noteFreq}`;
    setActiveInstKey(triggerId);
    setTimeout(() => {
      setActiveInstKey(null);
    }, 180);

    // Audio routing
    const osc = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);

    if (instrumentType === 'synth') {
      // Astral Synth: Warm sawtooth scale
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(noteFreq, audioContext.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, audioContext.currentTime);
      filter.frequency.exponentialRampToValueAtTime(120, audioContext.currentTime + 1.2);

      gainNode.gain.linearRampToValueAtTime(0.18, audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1.2);
    } 
    else if (instrumentType === 'bass') {
      // Horizon Bass: Heavy pulsing square waves with sub-sine
      osc.type = 'square';
      osc.frequency.setValueAtTime(noteFreq / 2, audioContext.currentTime); // sub level

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, audioContext.currentTime);

      gainNode.gain.linearRampToValueAtTime(0.25, audioContext.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1.5);
    } 
    else if (instrumentType === 'guitar') {
      // Elena Plucks: metallic comb wave with delayed sustain simulated
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(noteFreq * 2, audioContext.currentTime);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, audioContext.currentTime);

      gainNode.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.6);

      // Play simulated echo pluck a fraction later
      setTimeout(() => {
        if (!audioContext) return;
        const oscEcho = audioContext.createOscillator();
        const gainEcho = audioContext.createGain();
        oscEcho.connect(gainEcho);
        gainEcho.connect(audioContext.destination);
        oscEcho.type = 'sine';
        oscEcho.frequency.setValueAtTime(noteFreq * 2, audioContext.currentTime);
        gainEcho.gain.setValueAtTime(0, audioContext.currentTime);
        gainEcho.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
        gainEcho.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
        oscEcho.start();
        oscEcho.stop(audioContext.currentTime + 0.6);
      }, 250);
    } 
    else if (instrumentType === 'bells') {
      // FM Bell Sound
      osc.type = 'sine';
      osc.frequency.setValueAtTime(noteFreq, audioContext.currentTime);

      // Modulator oscillator for bell metallic ring
      const modulator = audioContext.createOscillator();
      const modGain = audioContext.createGain();
      modulator.type = 'sine';
      modulator.frequency.setValueAtTime(noteFreq * 3.5, audioContext.currentTime);
      modGain.gain.setValueAtTime(450, audioContext.currentTime); // FM depth

      modulator.connect(modGain);
      modGain.connect(osc.frequency);

      gainNode.gain.linearRampToValueAtTime(0.25, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 2.0);

      modulator.start();
      modulator.stop(audioContext.currentTime + 2.0);
    }

    osc.start();
    osc.stop(audioContext.currentTime + 2.0);
  };

  // Drum Synthesizer: Play Kick, Snare, Hi-hat, Cowbell
  const playDrum = (type: string) => {
    if (!audioContext) {
      activateAudio();
      return;
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    setActivePad(type);
    setTimeout(() => {
      setActivePad(null);
    }, 120);

    const gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);

    if (type === 'kick') {
      const osc = audioContext.createOscillator();
      osc.connect(gainNode);
      osc.type = 'sine';
      // Fast pitch sweep from 150Hz to 0.01Hz
      osc.frequency.setValueAtTime(160, audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      gainNode.gain.setValueAtTime(0.6, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);

      osc.start();
      osc.stop(audioContext.currentTime + 0.35);
    } 
    else if (type === 'snare') {
      // Noise component for snare rattle
      const bufferSize = audioContext.sampleRate * 0.2;
      const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = audioContext.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = audioContext.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.setValueAtTime(1000, audioContext.currentTime);

      noise.connect(noiseFilter);
      noiseFilter.connect(gainNode);

      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

      // Low pitch tone underlying the snare rattle
      const snap = audioContext.createOscillator();
      snap.connect(gainNode);
      snap.type = 'triangle';
      snap.frequency.setValueAtTime(180, audioContext.currentTime);
      snap.start();
      snap.stop(audioContext.currentTime + 0.1);

      noise.start();
      noise.stop(audioContext.currentTime + 0.2);
    } 
    else if (type === 'hihat') {
      // High frequency noise burst
      const bufferSize = audioContext.sampleRate * 0.08;
      const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = audioContext.createBufferSource();
      noise.buffer = buffer;

      const filter = audioContext.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(8000, audioContext.currentTime);

      noise.connect(filter);
      filter.connect(gainNode);

      gainNode.gain.setValueAtTime(0.18, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.08);

      noise.start();
      noise.stop(audioContext.currentTime + 0.09);
    }
  };

  const submitRentalBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingName || !bookingEmail || !rentalDate) {
      alert('Please fill out your name, email, and trial testing date.');
      return;
    }
    setIsBooked(true);
  };

  const resetRentalForm = () => {
    setBookingName('');
    setBookingEmail('');
    setRentalDate('');
    setBookingNote('');
    setIsBooked(false);
  };

  // Playable Scale Notes definition
  const notes = [
    { name: 'C4', freq: 261.63, key: 'A' },
    { name: 'D4', freq: 293.66, key: 'S' },
    { name: 'E4', freq: 329.63, key: 'D' },
    { name: 'F4', freq: 349.23, key: 'F' },
    { name: 'G4', freq: 392.00, key: 'G' },
    { name: 'A4', freq: 440.00, key: 'H' },
    { name: 'B4', freq: 493.88, key: 'J' },
    { name: 'C5', freq: 523.25, key: 'K' }
  ];

  return (
    <div className="space-y-16 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-[#3D3A35] dark:text-[#E2E8F0]" id="instrument-page-root">
      {/* Page Header */}
      <div className="text-center max-w-xl mx-auto space-y-3 pt-6" id="instrument-intro">
        <span className="font-mono text-xs text-[#BC6C25] dark:text-[#F59E0B] tracking-widest block uppercase font-bold flex items-center justify-center gap-1.5">
          <Volume2 className="w-4 h-4 animate-pulse" /> LIVE SOUND SYNTHESIS
        </span>
        <h1 className="font-serif font-bold text-3xl md:text-5xl text-[#4A5D4E] dark:text-emerald-400 tracking-tight leading-tight">
          Velvet Acoustics
        </h1>
        <p className="font-serif text-[#6B655C] dark:text-[#94A3B8] text-sm italic">
          "Try out our custom stage gear right in your browser! Play simulated patches utilizing actual synthesizers or schedule a private studio trial."
        </p>
      </div>

      {/* Audio activation panel if not ready */}
      {!isAudioActive && (
        <div className="max-w-xl mx-auto p-6 rounded-[24px] border border-dashed border-[#BC6C25]/40 bg-[#BC6C25]/5 text-center space-y-4 shadow-sm animate-pulse">
          <p className="font-serif text-sm text-[#BC6C25] dark:text-[#F59E0B] leading-relaxed italic">
            "For performance security, browsers require user permission before audio synthesis runs. Click below to boot the Velvet Web Synth."
          </p>
          <button
            onClick={activateAudio}
            className="px-6 py-3.5 bg-[#BC6C25] hover:bg-[#CD7D36] text-white font-mono text-xs font-bold uppercase tracking-widest rounded-full cursor-pointer transition-all shadow-md active:scale-95"
            id="boot-synth-button"
          >
            ACTIVATE AUDIO BOARD
          </button>
        </div>
      )}

      {/* Grid of the 5 playables instruments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto" id="playable-soundboard-containers">
        {/* Left Column: Playable patches */}
        <div className="lg:col-span-8 space-y-6" id="instrument-soundboard">
          {/* Instrument 1: Astral Poly-Synth Key-bed */}
          <div className="p-6 rounded-[28px] border border-white/20 dark:border-white/5 bg-white/30 dark:bg-[#111625]/40 backdrop-blur-xl space-y-5 text-left">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-white/10 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-[#BC6C25]/10 text-[#BC6C25] dark:text-[#F59E0B] rounded-xl border border-[#BC6C25]/20">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#3D3A35] dark:text-white">Astral Poly-Synthesizer</h3>
                  <span className="font-mono text-[9px] text-neutral-400 block uppercase">1984 VINTAGE SAWTOOTH SCALE</span>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#BC6C25] bg-[#BC6C25]/10 px-2.5 py-1 rounded-full border border-[#BC6C25]/20 uppercase">
                Active Oscillators
              </span>
            </div>

            <p className="font-serif text-xs text-[#6B655C] dark:text-[#94A3B8] leading-relaxed italic">
              "Julian's primary synthesizer patch. Produces a retro, drive-heavy analog sustain with automatic frequency filter cutoffs."
            </p>

            {/* Simulated Synthesizer Keys row */}
            <div className="grid grid-cols-8 gap-1 pt-1.5">
              {notes.map((note) => {
                const isActive = activeInstKey === `synth-${note.freq}`;
                return (
                  <button
                    key={`synth-${note.name}`}
                    onClick={() => playSound('synth', note.freq)}
                    className={`h-24 sm:h-32 rounded-lg border flex flex-col justify-between py-3 px-1.5 transition-all text-center focus:outline-none cursor-pointer ${
                      isActive 
                        ? 'bg-[#BC6C25] dark:bg-[#F59E0B] border-[#BC6C25] text-white' 
                        : 'bg-white dark:bg-[#1E2638] hover:bg-[#F2ECE4] dark:hover:bg-[#20293D] border-neutral-200 dark:border-neutral-700 text-[#3D3A35] dark:text-[#CBD5E1]'
                    }`}
                  >
                    <span className="font-mono text-[9px] text-neutral-400 font-bold block">{note.key}</span>
                    <div className="text-center">
                      <span className="font-mono text-xs font-bold block">{note.name}</span>
                      <span className="font-mono text-[8px] text-neutral-400 block">{Math.round(note.freq)}Hz</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Instrument 2: Horizon Deep Sub-Bass & Plucking */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bass Synth Panel */}
            <div className="p-6 rounded-[28px] border border-white/20 dark:border-white/5 bg-white/30 dark:bg-[#111625]/40 backdrop-blur-xl text-left space-y-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-[#4A5D4E]/10 text-[#4A5D4E] dark:text-emerald-400 rounded-xl border border-[#4A5D4E]/20">
                  <Waves className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#3D3A35] dark:text-white">Horizon Sub Bass</h3>
                  <span className="font-mono text-[9px] text-neutral-400 block uppercase">Rex's Low-End Driver</span>
                </div>
              </div>
              <p className="font-serif text-xs text-[#6B655C] dark:text-[#94A3B8] italic leading-relaxed">
                "Heavy, vibrating custom poly-synthesizer squares designed for stadium low-end."
              </p>
              
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {notes.slice(0, 4).map((note) => {
                  const isActive = activeInstKey === `bass-${note.freq}`;
                  return (
                    <button
                      key={`bass-${note.name}`}
                      onClick={() => playSound('bass', note.freq)}
                      className={`py-3.5 px-2 rounded-xl text-xs font-mono font-bold border transition-all text-center focus:outline-none cursor-pointer ${
                        isActive
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-white dark:bg-[#1E2638] hover:bg-neutral-150 text-[#3D3A35] dark:text-white border-neutral-200 dark:border-neutral-700'
                      }`}
                    >
                      <span className="block text-[8px] text-neutral-400 mb-1">SUB</span>
                      {note.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Elena's Echo Tape Strat Plucks */}
            <div className="p-6 rounded-[28px] border border-white/20 dark:border-white/5 bg-white/30 dark:bg-[#111625]/40 backdrop-blur-xl text-left space-y-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-[#BC6C25]/10 text-orange-500 rounded-xl border border-orange-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#3D3A35] dark:text-white">Strat Echo Plucks</h3>
                  <span className="font-mono text-[9px] text-neutral-400 block uppercase">1965 Tape Delay Simulator</span>
                </div>
              </div>
              <p className="font-serif text-xs text-[#6B655C] dark:text-[#94A3B8] italic leading-relaxed">
                "Shimmering, metallic comb wave plucks with automatic delayed echo repetition."
              </p>
              
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {notes.slice(4, 8).map((note) => {
                  const isActive = activeInstKey === `guitar-${note.freq}`;
                  return (
                    <button
                      key={`guitar-${note.name}`}
                      onClick={() => playSound('guitar', note.freq)}
                      className={`py-3.5 px-2 rounded-xl text-xs font-mono font-bold border transition-all text-center focus:outline-none cursor-pointer ${
                        isActive
                          ? 'bg-orange-500 border-orange-500 text-white'
                          : 'bg-white dark:bg-[#1E2638] hover:bg-neutral-150 text-[#3D3A35] dark:text-white border-neutral-200 dark:border-neutral-700'
                      }`}
                    >
                      <span className="block text-[8px] text-neutral-400 mb-1">ECHO</span>
                      {note.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Instruments 4 & 5: Chloe's Drum Pads & Vibe Bells board */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Drum Pads */}
            <div className="p-6 rounded-[28px] border border-white/20 dark:border-white/5 bg-white/30 dark:bg-[#111625]/40 backdrop-blur-xl text-left space-y-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#3D3A35] dark:text-white">Chloe's Drum Kit Pads</h3>
                  <span className="font-mono text-[9px] text-neutral-400 block uppercase">SYNTHESIZED NOISE TRIGGERS</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-1">
                <button
                  onClick={() => playDrum('kick')}
                  className={`h-20 rounded-2xl border flex flex-col items-center justify-center font-mono text-xs font-bold transition-all focus:outline-none cursor-pointer ${
                    activePad === 'kick'
                      ? 'bg-rose-500-custom text-white border-rose-500 bg-rose-500'
                      : 'bg-white dark:bg-[#1E2638] text-rose-500 hover:bg-rose-50 border-neutral-200 dark:border-neutral-700'
                  }`}
                >
                  <span className="block text-[8px] text-neutral-400 uppercase">Pad 1</span>
                  KICK DRUM
                </button>

                <button
                  onClick={() => playDrum('snare')}
                  className={`h-20 rounded-2xl border flex flex-col items-center justify-center font-mono text-xs font-bold transition-all focus:outline-none cursor-pointer ${
                    activePad === 'snare'
                      ? 'bg-blue-500-custom text-white border-blue-500 bg-blue-500'
                      : 'bg-white dark:bg-[#1E2638] text-blue-500 hover:bg-blue-50 border-neutral-200 dark:border-neutral-700'
                  }`}
                >
                  <span className="block text-[8px] text-neutral-400 uppercase">Pad 2</span>
                  SNARE RATTLE
                </button>

                <button
                  onClick={() => playDrum('hihat')}
                  className={`h-20 rounded-2xl border flex flex-col items-center justify-center font-mono text-xs font-bold transition-all focus:outline-none cursor-pointer ${
                    activePad === 'hihat'
                      ? 'bg-amber-500-custom text-white border-amber-500 bg-amber-500'
                      : 'bg-white dark:bg-[#1E2638] text-amber-500 hover:bg-amber-50 border-neutral-200 dark:border-neutral-700'
                  }`}
                >
                  <span className="block text-[8px] text-neutral-400 uppercase">Pad 3</span>
                  HI-HAT TICK
                </button>
              </div>
            </div>

            {/* FM Vibe Bells */}
            <div className="p-6 rounded-[28px] border border-white/20 dark:border-white/5 bg-white/30 dark:bg-[#111625]/40 backdrop-blur-xl text-left space-y-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-teal-500/10 text-teal-500 rounded-xl border border-teal-500/20">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#3D3A35] dark:text-white">FM Vibraphone Bells</h3>
                  <span className="font-mono text-[9px] text-neutral-400 block uppercase">Ethereal FM Carrier bell</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {notes.slice(2, 6).map((note) => {
                  const isActive = activeInstKey === `bells-${note.freq}`;
                  return (
                    <button
                      key={`bells-${note.name}`}
                      onClick={() => playSound('bells', note.freq)}
                      className={`py-3.5 px-2 rounded-xl text-xs font-mono font-bold border transition-all text-center focus:outline-none cursor-pointer ${
                        isActive
                          ? 'bg-teal-500 border-teal-500 text-white'
                          : 'bg-white dark:bg-[#1E2638] hover:bg-neutral-150 text-[#3D3A35] dark:text-white border-neutral-200 dark:border-neutral-700'
                      }`}
                    >
                      <span className="block text-[7px] text-neutral-400 mb-1">FM</span>
                      {note.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Instrument Rental booking form */}
        <div className="lg:col-span-4" id="rental-form-container">
          <div className="p-6 rounded-[32px] border border-white/20 dark:border-white/5 bg-white/35 dark:bg-[#111625]/40 backdrop-blur-xl space-y-6 text-left shadow-lg">
            {!isBooked ? (
              <form onSubmit={submitRentalBooking} className="space-y-4" id="instrument-rental-booking">
                <div className="border-b border-neutral-200 dark:border-white/5 pb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-[#BC6C25] dark:text-[#F59E0B]" />
                    <h3 className="font-serif font-bold text-base text-[#3D3A35] dark:text-white">Rent & Testing</h3>
                  </div>
                  <p className="font-serif text-[11px] text-[#6B655C] dark:text-[#94A3B8] italic mt-1 leading-relaxed">
                    Book individual instrument keys, studio sessions on rare gears, or rent custom setups.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-[9px] text-neutral-400 uppercase tracking-wider block font-bold">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={bookingName}
                    onChange={(e) => setBookingName(e.target.value)}
                    placeholder="Enter full guest name"
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-[#1E2638] border border-neutral-200 dark:border-neutral-750 text-[#3D3A35] dark:text-white outline-none focus:border-[#BC6C25] rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-[9px] text-neutral-400 uppercase tracking-wider block font-bold">Email Address</label>
                  <input
                    type="email"
                    required
                    value={bookingEmail}
                    onChange={(e) => setBookingEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-[#1E2638] border border-neutral-200 dark:border-neutral-750 text-[#3D3A35] dark:text-white outline-none focus:border-[#BC6C25] rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-[9px] text-neutral-400 uppercase tracking-wider block font-bold">Select Instrument</label>
                  <select
                    value={selectedRentalInst}
                    onChange={(e) => setSelectedRentalInst(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs bg-white dark:bg-[#1E2638] border border-neutral-200 dark:border-neutral-750 text-[#3D3A35] dark:text-white outline-none focus:border-[#BC6C25] rounded-xl"
                  >
                    <option>Astral Poly-Synthesizer (Roland Juno)</option>
                    <option>Horizon Custom Sub Bass Rig</option>
                    <option>Elena's 1965 Fender Stratocaster</option>
                    <option>Chloe's Studio Acoustic Drum set</option>
                    <option>FM Vibraphone Bells</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-[9px] text-neutral-400 uppercase tracking-wider block font-bold">Trial Testing Date</label>
                  <input
                    type="date"
                    required
                    value={rentalDate}
                    onChange={(e) => setRentalDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-[#1E2638] border border-neutral-200 dark:border-neutral-750 text-[#3D3A35] dark:text-white outline-none focus:border-[#BC6C25] rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-[9px] text-neutral-400 uppercase tracking-wider block font-bold">Duration Option</label>
                  <select
                    value={rentalDuration}
                    onChange={(e) => setRentalDuration(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs bg-white dark:bg-[#1E2638] border border-neutral-200 dark:border-neutral-750 text-[#3D3A35] dark:text-white outline-none focus:border-[#BC6C25] rounded-xl"
                  >
                    <option>1 Hour Studio Trial session (Free)</option>
                    <option>Daily Private Rental ($125 USD)</option>
                    <option>Full Week Production Rental ($650 USD)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-[9px] text-neutral-400 uppercase tracking-wider block font-bold">Custom requests (Optional)</label>
                  <textarea
                    rows={2}
                    value={bookingNote}
                    onChange={(e) => setBookingNote(e.target.value)}
                    placeholder="e.g. Include custom audio patch files"
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-[#1E2638] border border-neutral-200 dark:border-neutral-750 text-[#3D3A35] dark:text-white outline-none focus:border-[#BC6C25] rounded-xl"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#4A5D4E] dark:bg-emerald-600 hover:bg-[#5B6F5F] dark:hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase tracking-widest rounded-full cursor-pointer transition-all shadow-md mt-4"
                >
                  BOOK TRIAL APPOINTMENT
                </button>
              </form>
            ) : (
              <div className="py-6 text-center space-y-5 animate-fade-in" id="rental-booking-success">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20 mx-auto">
                  <Clock className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-serif font-bold text-[#3D3A35] dark:text-white text-base">Trial Slot Reserved!</h4>
                  <p className="font-serif text-xs text-[#6B655C] dark:text-[#94A3B8] leading-relaxed italic pr-1">
                    "We have provisionally booked a private session for you to trial the <strong>{selectedRentalInst}</strong> on <strong>{rentalDate}</strong>. We'll follow up shortly."
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#1A2030] border border-neutral-200 dark:border-neutral-750 text-left font-mono text-[9.5px] text-[#6B655C] dark:text-[#94A3B8] space-y-1.5">
                  <div><span className="font-bold">STUDIO LOCATION:</span> Brooklyn synth cellars</div>
                  <div><span className="font-bold">VISITING GUEST:</span> {bookingName}</div>
                  <div><span className="font-bold">APPARATUS:</span> {selectedRentalInst}</div>
                  <div><span className="font-bold">TERM DURATION:</span> {rentalDuration}</div>
                </div>

                <button
                  onClick={resetRentalForm}
                  className="w-full py-2.5 border border-dashed border-[#BC6C25] text-[#BC6C25] hover:bg-[#BC6C25]/5 font-mono text-2xs font-bold uppercase tracking-widest rounded-full cursor-pointer transition-all"
                >
                  Book another trial
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] bg-[#BC6C25] dark:bg-emerald-600 text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 font-mono text-xs tracking-wider uppercase font-bold animate-bounce">
          <Sparkles className="w-4 h-4 animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Velvet Fan Jam Studio & Recording Desk */}
      <div 
        className="max-w-6xl mx-auto bg-white/40 dark:bg-[#111625]/40 backdrop-blur-xl rounded-[32px] border border-[#E5DED4] dark:border-[#1E2638] shadow-lg p-6 md:p-8 space-y-8 text-left"
        id="recording-desk-section"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 dark:border-white/10 pb-6">
          <div className="space-y-1">
            <span className="font-mono text-[9px] text-[#BC6C25] dark:text-emerald-400 tracking-widest uppercase font-extrabold flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 animate-pulse" /> VELVET FAN STUDIO
            </span>
            <h2 className="font-serif font-bold text-2xl text-[#3D3A35] dark:text-[#E2E8F0]">
              Live Fan Jam & Tape Deck
            </h2>
            <p className="text-xs text-[#6B655C] dark:text-[#94A3B8] leading-relaxed max-w-xl">
              Record a short clip of your playing (up to 15 seconds) using your microphone or upload an audio file. Custom-name your jam, specify your instrument, and save it to your local Tape Deck database.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block font-bold">Tape Deck Library</span>
              <span className="text-xs font-mono font-bold text-[#BC6C25] dark:text-emerald-400">{savedRecordings.length} Saved Jams</span>
            </div>
            <div className="p-3 bg-[#BC6C25]/10 dark:bg-emerald-500/10 rounded-2xl border border-[#BC6C25]/20 dark:border-emerald-500/20 text-[#BC6C25] dark:text-emerald-400">
              <Music className="w-5 h-5 animate-bounce" />
            </div>
          </div>
        </div>

        {/* Studio Control Room Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Column 1: Record & Upload Dashboard (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="p-6 rounded-2xl border border-neutral-200 dark:border-[#1E2638] bg-white/60 dark:bg-[#1E2638]/20 space-y-6">
              <h3 className="font-serif font-bold text-base text-[#3D3A35] dark:text-white flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-[#BC6C25] dark:text-emerald-400" /> Control Deck
              </h3>

              {/* Action Tabs: Record / Upload */}
              <div className="grid grid-cols-2 gap-4">
                {/* Micro Recording Deck */}
                <div className="p-4 rounded-xl border border-neutral-200 dark:border-[#2A354F] bg-white/30 dark:bg-[#1E2638]/40 space-y-4 flex flex-col items-center justify-between text-center min-h-[170px]">
                  <div className="space-y-1">
                    <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-widest block font-bold">Microphone API</span>
                    <span className="text-xs font-semibold text-[#3D3A35] dark:text-[#E2E8F0] block">Record Live Clip</span>
                  </div>

                  {isRecording ? (
                    <div className="space-y-2 flex flex-col items-center">
                      <div className="relative flex items-center justify-center">
                        <div className="absolute w-12 h-12 rounded-full bg-red-500/30 animate-ping" />
                        <button
                          onClick={stopRecording}
                          type="button"
                          className="relative p-4 rounded-full bg-red-600 text-white hover:bg-red-700 active:scale-95 transition-all shadow-md flex items-center justify-center cursor-pointer"
                          title="Stop Recording"
                        >
                          <Square className="w-5 h-5" />
                        </button>
                      </div>
                      <span className="font-mono text-[11px] font-bold text-red-500 animate-pulse uppercase tracking-wider">
                        Recording {elapsedTime}s / 15s
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2 flex flex-col items-center">
                      <button
                        onClick={startRecording}
                        type="button"
                        className="p-4 rounded-full bg-[#BC6C25] hover:bg-[#A3591E] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white active:scale-95 transition-all shadow-md flex items-center justify-center cursor-pointer"
                        title="Start Recording"
                      >
                        <Mic className="w-5 h-5" />
                      </button>
                      <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-widest">
                        Max 15 seconds
                      </span>
                    </div>
                  )}
                </div>

                {/* Upload File Desk */}
                <div className="p-4 rounded-xl border border-neutral-200 dark:border-[#2A354F] bg-white/30 dark:bg-[#1E2638]/40 space-y-3 flex flex-col items-center justify-between text-center min-h-[170px]">
                  <div className="space-y-1">
                    <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-widest block font-bold">Local File Transfer</span>
                    <span className="text-xs font-semibold text-[#3D3A35] dark:text-[#E2E8F0] block">Upload Audio Jam</span>
                  </div>

                  <label className="flex flex-col items-center justify-center p-3 rounded-full bg-neutral-100 dark:bg-[#1E2638] hover:bg-neutral-200 dark:hover:bg-[#20293D] cursor-pointer border border-[#E5DED4] dark:border-neutral-700 transition-colors w-12 h-12">
                    <Upload className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioUpload}
                      className="hidden"
                    />
                  </label>

                  <span className="font-mono text-[8px] text-neutral-400 uppercase tracking-widest block">
                    MP3, WAV, M4A &lt; 1.5MB
                  </span>
                </div>
              </div>

              {/* Active Audio Clip Preview */}
              {previewUrl && (
                <div className="p-4 rounded-xl border border-[#BC6C25]/30 dark:border-emerald-500/30 bg-[#BC6C25]/5 dark:bg-emerald-500/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] text-[#BC6C25] dark:text-emerald-400 uppercase tracking-widest font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 animate-bounce" /> Active Jam Captured
                    </span>
                    <button
                      onClick={resetPreview}
                      type="button"
                      className="text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                      title="Clear preview"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlayPreview}
                      type="button"
                      className="p-2.5 rounded-xl bg-[#BC6C25] dark:bg-emerald-600 text-white hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                    >
                      {isPlayingPreview ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <div className="flex-1 text-left min-w-0">
                      <span className="text-[11px] font-bold text-[#3D3A35] dark:text-white block truncate">
                        {formTitle || "Unnamed Captured Clip"}
                      </span>
                      <span className="text-[9px] font-mono text-neutral-400 block uppercase">
                        {previewBlob ? `${(previewBlob.size / 1024).toFixed(1)} KB` : 'Live recorded clip'} • Ready to Archive
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Save metadata Form & Saved Library Grid (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            {previewUrl ? (
              /* If preview is active, show the Save Form */
              <div className="p-6 rounded-2xl border border-neutral-200 dark:border-[#1E2638] bg-white/60 dark:bg-[#1E2638]/20 space-y-4">
                <h3 className="font-serif font-bold text-base text-[#3D3A35] dark:text-white flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#BC6C25] dark:text-emerald-400" /> Save Jam Details
                </h3>

                <form onSubmit={handleSaveRecording} className="space-y-4">
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] text-neutral-400 uppercase tracking-wider block font-bold">Recording Name / Title *</label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={e => setFormTitle(e.target.value)}
                      placeholder="e.g. Astral Pad Melodic Jam"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-[#1E2638] border border-neutral-200 dark:border-neutral-750 text-[#3D3A35] dark:text-white outline-none focus:border-[#BC6C25] dark:focus:border-emerald-500 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-[9px] text-neutral-400 uppercase tracking-wider block font-bold">Instrument Used</label>
                    <select
                      value={formInstrument}
                      onChange={e => setFormInstrument(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs bg-white dark:bg-[#1E2638] border border-neutral-200 dark:border-neutral-750 text-[#3D3A35] dark:text-white outline-none focus:border-[#BC6C25] dark:focus:border-emerald-500 rounded-xl"
                    >
                      <option value="Astral Synth">Astral Poly-Synthesizer</option>
                      <option value="Horizon Bass">Horizon Sub Bass</option>
                      <option value="Elena Plucks">Strat Echo Plucks</option>
                      <option value="Chloe Drums">Chloe's Drum Pads</option>
                      <option value="Vibe Bells">FM Vibraphone Bells</option>
                      <option value="Vocal Feed">Vocals / Acoustic Mic</option>
                      <option value="Other Instrument">Other Custom Gear</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#BC6C25] hover:bg-[#CD7D36] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase tracking-widest rounded-xl cursor-pointer transition-all shadow-md active:scale-95"
                  >
                    SAVE TO TAPE DECK
                  </button>
                </form>
              </div>
            ) : (
              /* If no active preview, show instructions / guide */
              <div className="p-6 rounded-2xl border border-dashed border-neutral-300 dark:border-[#2A354F] bg-neutral-50/50 dark:bg-[#111625]/20 text-center py-10 space-y-4">
                <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-[#1E2638] flex items-center justify-center mx-auto text-neutral-400">
                  <Mic className="w-6 h-6" />
                </div>
                <div className="space-y-1 max-w-sm mx-auto">
                  <h4 className="font-serif font-bold text-[#3D3A35] dark:text-white text-sm">No Active Recording Selected</h4>
                  <p className="font-serif text-xs text-[#6B655C] dark:text-[#94A3B8] leading-relaxed italic">
                    "Start recording via microphone or upload an audio file. Once captured, the save form will appear here to record details."
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Saved Tape Deck List */}
        <div className="space-y-4 pt-4 border-t border-neutral-200 dark:border-white/10">
          <h3 className="font-serif font-bold text-base text-[#3D3A35] dark:text-white flex items-center gap-2">
            <Music className="w-4 h-4 text-[#BC6C25] dark:text-emerald-400 animate-pulse" /> Your Tape Deck Library
          </h3>

          {savedRecordings.length === 0 ? (
            <div className="p-8 rounded-2xl border border-dashed border-neutral-200 dark:border-[#2A354F] text-center bg-neutral-50/20 dark:bg-[#1A2030]/10 py-12 space-y-3">
              <span className="font-mono text-[9px] text-neutral-400 block uppercase tracking-widest font-bold">ARCHIVES EMPTY</span>
              <p className="font-serif text-xs text-[#6B655C] dark:text-[#94A3B8] max-w-md mx-auto italic">
                "No custom tracks saved yet. Be the first to record a sound check, scale riff, or live synth jam and archive it to local tape memory!"
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedRecordings.map((rec) => {
                const isPlaying = playingId === rec.id;
                return (
                  <div
                    key={rec.id}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                      isPlaying
                        ? 'border-[#BC6C25] bg-[#BC6C25]/5 dark:border-emerald-500 dark:bg-emerald-500/5'
                        : 'border-neutral-200 dark:border-[#1E2638] bg-white dark:bg-[#111625]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Play/Pause Button */}
                      <button
                        onClick={() => playSavedRecording(rec.id, rec.audioData)}
                        type="button"
                        className={`p-3 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                          isPlaying
                            ? 'bg-[#BC6C25] dark:bg-emerald-600 text-white animate-pulse'
                            : 'bg-neutral-100 dark:bg-[#1E2638] text-neutral-600 dark:text-neutral-300 hover:bg-[#BC6C25]/10 hover:text-[#BC6C25] dark:hover:text-emerald-400'
                        }`}
                        title={isPlaying ? "Pause Track" : "Play Track"}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>

                      {/* Details */}
                      <div className="text-left min-w-0">
                        <span className="text-xs font-bold text-[#3D3A35] dark:text-white block truncate">
                          {rec.title}
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] font-mono font-bold text-[#BC6C25] dark:text-emerald-400 bg-[#BC6C25]/10 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase">
                            {rec.instrument}
                          </span>
                          <span className="text-[9px] font-mono text-neutral-400">
                            {rec.date} • {rec.duration}s
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {/* Download */}
                      <button
                        onClick={() => downloadRecording(rec)}
                        type="button"
                        className="p-2 rounded-xl bg-neutral-50 dark:bg-[#1E2638] border border-neutral-200 dark:border-neutral-750 text-neutral-500 dark:text-neutral-400 hover:text-[#3D3A35] dark:hover:text-white transition-colors cursor-pointer animate-none"
                        title="Download audio clip"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => deleteRecording(rec.id)}
                        type="button"
                        className="p-2 rounded-xl bg-neutral-50 dark:bg-[#1E2638] border border-neutral-200 dark:border-neutral-750 text-neutral-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer animate-none"
                        title="Delete recording"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
