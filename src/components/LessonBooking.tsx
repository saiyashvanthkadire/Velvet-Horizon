import React, { useState, useEffect, useRef } from 'react';
import { GraduationCap, CheckCircle, X, BookOpen, Clock, Calendar, AlertCircle, Play, Pause, Compass, Music2, Star, Eye, Sliders, Volume2, Activity, Grid, Sparkles, ChevronRight } from 'lucide-react';
import { LESSON_TUTORS } from '../data';
import { LessonTutor, LessonBooking as IBooking } from '../types';
import { auth } from '../lib/firebase';
import { saveLessonToDb } from '../lib/api';

let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

interface TutorialClass {
  id: string;
  title: string;
  tutorName: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Masterclass';
  description: string;
  videoPlaceholderUrl: string;
  lessonsCount: number;
}

interface MasterclassModule {
  title: string;
  duration: string;
  videoTitle: string;
  notes: string;
  diagramTitle?: string;
  diagramSteps?: string[];
}

const MASTERCLASS_MODULES: Record<string, MasterclassModule[]> = {
  "class-1": [
    {
      title: "1. Subtractive Synthesis Fundamentals",
      duration: "18m",
      videoTitle: "Subtractive Architecture & Juno Oscillators",
      notes: "Subtractive synthesis starts with a raw, harmonic-rich waveform (such as sawtooth or square waves) and sculpts it by filtering away unwanted frequencies. In Velvet Horizon's signature live setups, Julian Vance stacks a warm analog sawtooth oscillator with a sub-octave square wave to thicken the bottom end. Control Voltage (CV) allows dynamic modulation of the pitch, filter cutoff, or pulse width via LFOs and Envelopes, creating movement that breathes naturally in the mix."
    },
    {
      title: "2. Waveform Harmonics & Frequency Math",
      duration: "22m",
      videoTitle: "Sine vs. Square vs. Sawtooth Spectrums",
      notes: "Every sound is composed of individual frequency components. A sine wave contains only a single pure fundamental frequency with no extra harmonics. A sawtooth wave contains all integer harmonics (both odd and even, e.g., f, 2f, 3f, 4f...), giving it a rich, buzzy, and aggressive texture ideal for searing lead synths. A square wave contains only odd harmonics (f, 3f, 5f, 7f...), providing a hollow, woody, clarinet-like timbre perfect for retro chip-tune tones and heavy driving basslines."
    },
    {
      title: "3. Voltage Controlled Filters & Resonance Peaks",
      duration: "25m",
      videoTitle: "Sculpting Waves with Biquad Lowpass Filters",
      notes: "The Voltage Controlled Filter (VCF) is the gateway to synthesis styling. A lowpass filter blocks high-frequency harmonics above the specified Cutoff frequency. Adjusting the Resonance (Q factor) creates a narrow, sharp feedback peak at the cutoff point. This harmonic peak adds a distinctive liquid 'chirp' or vocal-like quality to filter sweeps. At extreme resonance levels, the filter may self-oscillate, producing a pure sine-wave tone on its own."
    }
  ],
  "class-2": [
    {
      title: "1. Syncopated Dual Delay Splitting",
      duration: "15m",
      videoTitle: "Split L/R Delay Ratios & Stereo Width",
      notes: "Dual delays are essential for turning a mono instrument into a spacious, wide stereophonic landscape. By splitting the left and right channels to different rhythmic subdivisions (e.g., a dotted-eighth note on the left channel and a straight quarter note on the right channel), the echoes cascade in a tumbling, syncopated rhythm. This prevents the echoes from stacking directly on top of each other, preserving mid-channel clarity for vocals."
    },
    {
      title: "2. Decay Stacking & Reverb Tail Sculpting",
      duration: "20m",
      videoTitle: "Cathedral Spaces & Feedback Saturations",
      notes: "Reverb simulates physical rooms by combining thousands of micro-delays (early reflections) that dense up into a continuous acoustic wash (late reverberation). Elevating the Decay Time increases the tail duration, transforming a small dry room into a massive, ambient stone cathedral. Stacking a tape delay *before* the reverb feeds saturated reflections into the space, generating warm, shimmering drone pads that sustain for seconds."
    },
    {
      title: "3. Lowpass Dampening & Tone Absorption",
      duration: "15m",
      videoTitle: "Saturating Reverb Tails & Organic Damping",
      notes: "In the physical world, high frequencies are absorbed rapidly by air and porous materials (like wooden walls or cloth). To make a digital delay or reverb sound natural, we use a lowpass filter inside the feedback path. This gradually dampens high-frequency harmonics with each successive echo, causing the delay tail to melt warmly and gently into the background."
    }
  ],
  "class-3": [
    {
      title: "1. Kick & Bass Frequency Management",
      duration: "12m",
      videoTitle: "The Low-End Battleground: 50Hz to 100Hz",
      notes: "The sub-bass region is a frequent source of mud in modern arrangements. Both the kick drum and the bass guitar require heavy energy below 100Hz. To make them coexist, you must allocate specific bands: let the punch of the kick reside at 85Hz-100Hz, and let the sub-bass rumble lower at 40Hz-60Hz. Adding a highpass filter at 30Hz cuts out useless, room-rattling sub-harmonics that waste valuable amplifier headroom."
    },
    {
      title: "2. Compression & Sidechain Ducking",
      duration: "18m",
      videoTitle: "Duck the Bass to Let the Kick Punch",
      notes: "Sidechain compression is the ultimate tool for rhythmic low-end control. In sidechain setups, the volume of the bass track is dynamically reduced (ducked) whenever the kick drum strikes. This creates a temporary 50-100ms volume dip in the bass, giving the kick drum's transient complete freedom to punch through without competition. When the kick transient subsides, the bass smoothly swells back to full volume, generating a pumping, driving groove."
    },
    {
      title: "3. Integrating Guitars with Square Wave Synths",
      duration: "14m",
      videoTitle: "Fuzz Guitars meets Analog Waves",
      notes: "Heavy rock fuzz guitars share a remarkably similar odd-harmonic distribution with analog square waves. By doubling a low guitar riff with a heavy square synth-bass, the synthesizer fills in the ultra-low sub frequencies that guitars naturally lack, while the guitar's pick attack provides definition. The result is a unified, colossal wall of sound that bridges electronic and rock styles perfectly."
    }
  ],
  "class-4": [
    {
      title: "1. Cross-Rhythm Mathematics",
      duration: "22m",
      videoTitle: "Understanding the 3:4 & 2:3 Time Grid",
      notes: "Polyrhythms occur when two contrasting rhythmic patterns are superimposed over the same duration. In a 3-vs-4 polyrhythm, one instrument divides a measure into 3 equal parts while another divides it into 4. The common mathematical denominator is 12 pulses. By practicing subdivisions of 12, musicians can confidently execute both meters simultaneously, creating complex syncopated grooves that sound highly sophisticated."
    },
    {
      title: "2. Hybrid Drum Pad Routing",
      duration: "25m",
      videoTitle: "Triggering Custom Analog Drum Samples",
      notes: "In live performance, acoustic drummers use electronic drum pads loaded with piezoceramic triggers. Striking the pad sends an electrical voltage spike to a MIDI converter. Striking harder sends a larger voltage, which is translated to velocity. This velocity is routed to synthesizer parameters—allowing a harder snare hit to not only sound louder, but also trigger a wider filter cutoff or longer snare decay."
    },
    {
      title: "3. Odd Meters & Compound Accents",
      duration: "28m",
      videoTitle: "Accenting 5/4 and 7/8 Rhythms",
      notes: "Odd meters like 5/4 break out of the standard 4-beat pattern and are typically felt as asymmetric combinations of 3+2 or 2+3 beats. Accenting the primary downbeats (beats 1 and 4 in a 3+2 rhythm) sets up a rolling, conversational momentum. Synthesizers and sequencers can highlight these accents by modifying envelope decay on triggered steps, adding a physical lean to the rhythm."
    }
  ],
  "class-5": [
    {
      title: "1. The Dorian Scale & Celtic Moods",
      duration: "16m",
      videoTitle: "Dorian: Major 6th inside Minor Harmony",
      notes: "The Dorian mode is a minor scale with a raised 6th scale degree (for example, A Dorian is A B C D E F# G). This single-note alteration transforms the natural minor scale, replacing its weeping, dark mood with a mysterious, hopeful, and medieval-modern fantasy vibe. It is highly effective for building epic, anthemic chord progressions that feel ancient yet cinematic."
    },
    {
      title: "2. Phrygian & Lydian Brightness",
      duration: "20m",
      videoTitle: "Dark Phrygian Tension vs. Celestial Lydian",
      notes: " chrygian is a highly exotic minor mode defined by its flat 2nd degree (e.g., E Phrygian has an F natural), creating a heavy, brooding Spanish metal or classical dark fantasy tension. Conversely, the Lydian mode is a major scale with a raised 4th degree (e.g., C Lydian has an F#). This raised interval introduces a luminous, ethereal, and celestial quality often used in space films to invoke curiosity and wonder."
    },
    {
      title: "3. Emotional Build-ups & Anthemic Arrangement",
      duration: "25m",
      videoTitle: "Designing the Golden Drop",
      notes: "Arrangement is the management of energy over time. An anthemic buildup works by accumulating tension before the drop. This is achieved by: 1) opening the synth lowpass filters to let high-end energy rush in, 2) utilizing white-noise noise sweeping risers, and 3) temporarily cutting out the sub-bass frequencies on the final beat to make the full re-entry of the low-end feel physical and explosive."
    }
  ]
};

interface LessonBookingProps {
  currentUser: { name: string; email: string; tier: string } | null;
  setCurrentTab: (tab: string) => void;
  tutorialClasses?: TutorialClass[];
}

export default function LessonBooking({ currentUser, setCurrentTab, tutorialClasses }: LessonBookingProps) {
  const [selectedTutor, setSelectedTutor] = useState<LessonTutor | null>(null);
  const [bookingStep, setBookingStep] = useState<'details' | 'confirm'>('details');

  // Interactive video simulator state
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [isClassPlaying, setIsClassPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(35);

  // Active chord utility state
  const [chordSignature, setChordSignature] = useState<'C Major' | 'G Major' | 'A Minor' | 'F Major'>('C Major');

  // Booking details selectors
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [sessionLength, setSessionLength] = useState<number>(1); // hours
  const [experienceLevel, setExperienceLevel] = useState('Beginner');

  const [confirmedBooking, setConfirmedBooking] = useState<IBooking | null>(null);

  // Real Tutorial Masterclass Workspace state
  const [activeTutorialClass, setActiveTutorialClass] = useState<TutorialClass | null>(null);
  const [tutorialTab, setTutorialTab] = useState<'guide' | 'lab'>('guide');
  const [activeModuleIndex, setActiveModuleIndex] = useState<number>(0);
  const [tutorialVideoPlaying, setTutorialVideoPlaying] = useState<boolean>(false);
  const [tutorialVideoProgress, setTutorialVideoProgress] = useState<number>(12);

  // Refs for audio loops to prevent stale enclosure states
  const seqIntervalRef = useRef<any>(null);
  const polyIntervalRef = useRef<any>(null);

  // Lab 1: Synth Oscillators State
  const [synthWaveform, setSynthWaveform] = useState<'sine' | 'square' | 'sawtooth' | 'triangle'>('sawtooth');
  const [synthFreq, setSynthFreq] = useState<number>(220); // A3
  const [synthCutoff, setSynthCutoff] = useState<number>(1200);
  const [synthQ, setSynthQ] = useState<number>(1.5);
  const [isSynthOscPlaying, setIsSynthOscPlaying] = useState<boolean>(false);

  // Lab 2: Delay & Reverb State
  const [delayTime, setDelayTime] = useState<number>(0.375); // 375ms
  const [delayFeedback, setDelayFeedback] = useState<number>(0.4); // 40%
  const [reverbDecay, setReverbDecay] = useState<number>(4); // 4 seconds

  // Lab 3: Sidechain Sequencer State
  const [seqPlaying, setSeqPlaying] = useState<boolean>(false);
  const [seqStep, setSeqStep] = useState<number>(0);
  const [seqGrid, setSeqGrid] = useState<{kick: boolean[], bass: boolean[]}>({
    kick: [true, false, true, false],
    bass: [true, true, true, true]
  });
  const [sidechainOn, setSidechainOn] = useState<boolean>(true);

  // Lab 4: Polyrhythm State
  const [polyType, setPolyType] = useState<'2vs3' | '3vs4' | '5vs4'>('3vs4');
  const [polyBpm, setPolyBpm] = useState<number>(100);
  const [polyPlaying, setPolyPlaying] = useState<boolean>(false);
  const [polyStep, setPolyStep] = useState<number>(0);

  // Lab 5: Modes Keyboard State
  const [selectedMode, setSelectedMode] = useState<'dorian' | 'phrygian' | 'lydian'>('dorian');

  // Effect to clean up intervals on unmount
  useEffect(() => {
    return () => {
      if (seqIntervalRef.current) clearInterval(seqIntervalRef.current);
      if (polyIntervalRef.current) clearInterval(polyIntervalRef.current);
    };
  }, []);

  // Effect to simulate video playback progression
  useEffect(() => {
    let interval: any = null;
    if (tutorialVideoPlaying) {
      interval = setInterval(() => {
        setTutorialVideoProgress(prev => {
          if (prev >= 100) {
            setTutorialVideoPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [tutorialVideoPlaying]);

  // Minimum 5 structured tutorial classes
  const classes: TutorialClass[] = tutorialClasses || [
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

  const openBookingWizard = (tutor: LessonTutor) => {
    if (!currentUser) {
      alert('Please log in to book a private masterclass lesson.');
      setCurrentTab('login');
      return;
    }
    setSelectedTutor(tutor);
    setBookingStep('details');
    setStudentName('');
    setStudentEmail('');
    setSelectedDay(tutor.availableDays[0]);
    setSelectedSlot(tutor.availableSlots[0]);
    setSessionLength(1);
    setExperienceLevel('Intermediate');
    setConfirmedBooking(null);
  };

  const closeBookingWizard = () => {
    setSelectedTutor(null);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !studentEmail) {
      alert('Please enter your name and email address.');
      return;
    }

    if (!selectedDay || !selectedSlot) {
      alert('Please select an available tutoring day and hourly time slot.');
      return;
    }

    const bookingId = 'VH-EDU-' + Math.floor(10000 + Math.random() * 90000);
    const currentDateString = new Date().toLocaleDateString();

    const newBooking: IBooking = {
      id: bookingId,
      studentName,
      studentEmail,
      instrument: selectedTutor?.instrument || '',
      tutorName: selectedTutor?.name || '',
      date: `${selectedDay}, July 2026`,
      timeSlot: selectedSlot,
      totalPrice: (selectedTutor?.pricePerHour || 10) * sessionLength,
      bookingDate: currentDateString
    };

    // If logged in, save to Cloud SQL database
    if (auth.currentUser) {
      try {
        await saveLessonToDb({
          studentName,
          studentEmail,
          instrument: selectedTutor?.instrument || '',
          tutorName: selectedTutor?.name || '',
          date: `${selectedDay}, July 2026`,
          timeSlot: selectedSlot,
          totalPrice: (selectedTutor?.pricePerHour || 10) * sessionLength
        });
      } catch (err) {
        console.error("Failed to save lesson booking to database:", err);
      }
    }

    // Save lesson booking to localStorage for integration with VIP Profile Lesson timetables
    const savedLessonsStr = localStorage.getItem('vh_booked_lessons_v1');
    let existingLessons = [];
    if (savedLessonsStr) {
      try {
        existingLessons = JSON.parse(savedLessonsStr);
      } catch (err) {}
    }
    existingLessons.push(newBooking);
    localStorage.setItem('vh_booked_lessons_v1', JSON.stringify(existingLessons));

    setConfirmedBooking(newBooking);
    setBookingStep('confirm');
  };

  const getSubtotalPrice = () => {
    if (!selectedTutor) return 0;
    return selectedTutor.pricePerHour * sessionLength;
  };

  const toggleVideoPlay = (cls: TutorialClass) => {
    if (!currentUser) {
      alert('Please log in to study masterclass series.');
      setCurrentTab('login');
      return;
    }
    setActiveTutorialClass(cls);
    setTutorialTab('lab');
  };

  const playTone = (freq: number, type: 'sine' | 'square' | 'sawtooth' | 'triangle' = 'sine', duration: number = 0.5, volume: number = 0.15) => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter ? ctx.createBiquadFilter() : (ctx as any).createFilter();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(synthCutoff, ctx.currentTime);
      filter.Q.setValueAtTime(synthQ, ctx.currentTime);
      
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + duration + 0.1);
    } catch (e) {
      console.error(e);
    }
  };

  const playSynthOsc = () => {
    try {
      if (isSynthOscPlaying) {
        setIsSynthOscPlaying(false);
      } else {
        setIsSynthOscPlaying(true);
        playTone(synthFreq, synthWaveform, 1.2, 0.15);
        setTimeout(() => setIsSynthOscPlaying(false), 1200);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const playDelayedTone = (freq: number) => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const dryGain = ctx.createGain();
      const wetGain = ctx.createGain();
      const delay = ctx.createDelay();
      const feedback = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      dryGain.gain.setValueAtTime(0.2, ctx.currentTime);
      dryGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
      
      delay.delayTime.setValueAtTime(delayTime, ctx.currentTime);
      feedback.gain.setValueAtTime(delayFeedback, ctx.currentTime);
      
      wetGain.gain.setValueAtTime(0.18, ctx.currentTime);
      
      osc.connect(dryGain);
      dryGain.connect(ctx.destination);
      
      osc.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(wetGain);
      wetGain.connect(ctx.destination);
      
      const revDelay1 = ctx.createDelay();
      const revDelay2 = ctx.createDelay();
      const revGain = ctx.createGain();
      
      revDelay1.delayTime.setValueAtTime(delayTime * 1.5, ctx.currentTime);
      revDelay2.delayTime.setValueAtTime(delayTime * 2.2, ctx.currentTime);
      revGain.gain.setValueAtTime(0.08 * (reverbDecay / 4), ctx.currentTime);
      
      delay.connect(revDelay1);
      revDelay1.connect(revDelay2);
      revDelay2.connect(revGain);
      revGain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 3.5);
    } catch (e) {
      console.error(e);
    }
  };

  const triggerSeqStep = (step: number) => {
    const hasKick = seqGrid.kick[step];
    const hasBass = seqGrid.bass[step];
    
    if (hasKick || hasBass) {
      try {
        const ctx = getAudioContext();
        
        if (hasKick) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(150, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
          
          gain.gain.setValueAtTime(0.35, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.25);
        }
        
        if (hasBass) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const lp = ctx.createBiquadFilter ? ctx.createBiquadFilter() : (ctx as any).createFilter();
          
          lp.type = 'lowpass';
          lp.frequency.setValueAtTime(130, ctx.currentTime);
          
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(55, ctx.currentTime);
          
          osc.connect(lp);
          lp.connect(gain);
          gain.connect(ctx.destination);
          
          if (sidechainOn && hasKick) {
            gain.gain.setValueAtTime(0.01, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.24);
          } else {
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.24);
          }
          
          osc.start();
          osc.stop(ctx.currentTime + 0.25);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const toggleSeqPlaying = () => {
    if (seqPlaying) {
      if (seqIntervalRef.current) {
        clearInterval(seqIntervalRef.current);
        seqIntervalRef.current = null;
      }
      setSeqPlaying(false);
      setSeqStep(0);
    } else {
      setSeqPlaying(true);
      const intervalMs = 280;
      setSeqStep(0);
      let stepCounter = 0;
      
      triggerSeqStep(0);
      
      seqIntervalRef.current = setInterval(() => {
        stepCounter = (stepCounter + 1) % 4;
        setSeqStep(stepCounter);
        triggerSeqStep(stepCounter);
      }, intervalMs);
    }
  };

  const toggleSeqGrid = (row: 'kick' | 'bass', index: number) => {
    setSeqGrid(prev => {
      const rowArr = [...prev[row]];
      rowArr[index] = !rowArr[index];
      return {
        ...prev,
        [row]: rowArr
      };
    });
  };

  const playPolyrhythmStep = (type: '2vs3' | '3vs4' | '5vs4', step: number) => {
    try {
      const ctx = getAudioContext();
      
      const playClick = (freq: number, vol: number, decay: number = 0.05) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + decay);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + decay + 0.05);
      };

      if (type === '2vs3') {
        const r1 = (step % 3 === 0);
        const r2 = (step % 2 === 0);
        if (r1 && r2) {
          playClick(1000, 0.25, 0.08);
        } else if (r1) {
          playClick(800, 0.15);
        } else if (r2) {
          playClick(500, 0.15);
        }
      } else if (type === '3vs4') {
        const r1 = (step % 4 === 0);
        const r2 = (step % 3 === 0);
        if (r1 && r2) {
          playClick(1100, 0.25, 0.08);
        } else if (r1) {
          playClick(850, 0.15);
        } else if (r2) {
          playClick(550, 0.15);
        }
      } else {
        const r1 = (step % 5 === 0);
        const r2 = (step % 4 === 0);
        if (r1 && r2) {
          playClick(1200, 0.25, 0.08);
        } else if (r1) {
          playClick(900, 0.15);
        } else if (r2) {
          playClick(600, 0.15);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const togglePolyPlaying = () => {
    if (polyPlaying) {
      if (polyIntervalRef.current) {
        clearInterval(polyIntervalRef.current);
        polyIntervalRef.current = null;
      }
      setPolyPlaying(false);
      setPolyStep(0);
    } else {
      setPolyPlaying(true);
      const multiplier = polyType === '2vs3' ? 6 : polyType === '3vs4' ? 12 : 20;
      const stepMs = Math.round(60000 / (polyBpm * (multiplier / 4)));
      setPolyStep(0);
      let stepCounter = 0;
      
      playPolyrhythmStep(polyType, 0);
      
      polyIntervalRef.current = setInterval(() => {
        stepCounter = (stepCounter + 1) % multiplier;
        setPolyStep(stepCounter);
        playPolyrhythmStep(polyType, stepCounter);
      }, stepMs);
    }
  };

  const handlePolyTypeChange = (type: '2vs3' | '3vs4' | '5vs4') => {
    if (polyPlaying) {
      if (polyIntervalRef.current) {
        clearInterval(polyIntervalRef.current);
        polyIntervalRef.current = null;
      }
      setPolyPlaying(false);
      setPolyStep(0);
    }
    setPolyType(type);
  };

  const playModalNote = (freq: number) => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter ? ctx.createBiquadFilter() : (ctx as any).createFilter();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2, ctx.currentTime);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
      
      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start();
      osc2.start();
      osc.stop(ctx.currentTime + 1.3);
      osc2.stop(ctx.currentTime + 1.3);
    } catch (e) {
      console.error(e);
    }
  };

  const closeTutorialModal = () => {
    setActiveTutorialClass(null);
    setIsClassPlaying(false);
    setActiveModuleIndex(0);
    setTutorialVideoPlaying(false);
    setTutorialVideoProgress(12);
    
    if (seqIntervalRef.current) {
      clearInterval(seqIntervalRef.current);
      seqIntervalRef.current = null;
    }
    setSeqPlaying(false);
    setSeqStep(0);
    
    if (polyIntervalRef.current) {
      clearInterval(polyIntervalRef.current);
      polyIntervalRef.current = null;
    }
    setPolyPlaying(false);
    setPolyStep(0);
  };

  return (
    <div className="space-y-16 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-[#3D3A35] dark:text-[#E2E8F0]" id="lessons-booking-page">
      {/* Page Header */}
      <div className="text-center max-w-xl mx-auto space-y-3 pt-6" id="lessons-intro">
        <span className="font-mono text-xs text-[#BC6C25] dark:text-[#F59E0B] tracking-widest block uppercase font-bold flex items-center justify-center gap-1.5">
          <GraduationCap className="w-4.5 h-4.5 animate-pulse" /> VELVET ACADEMY
        </span>
        <h1 className="font-serif font-bold text-3xl md:text-5xl text-[#4A5D4E] dark:text-emerald-400 tracking-tight leading-tight">
          Learning Hub
        </h1>
        <p className="font-serif text-[#6B655C] dark:text-[#94A3B8] text-sm italic">
          "Learn professional studio and live arrangements directly from Velvet Horizon's experts. Browse our premium classes or book real-time 1-on-1 masterclasses."
        </p>
      </div>

      {/* Structured Tutorial Classes - Minimum 5 */}
      <div className="space-y-6 max-w-6xl mx-auto" id="lesson-courses-module">
        <div className="text-left border-b border-neutral-205 pb-3">
          <h2 className="font-serif font-bold text-xl md:text-2xl text-[#3D3A35] dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#BC6C25] dark:text-[#F59E0B]" /> Structured Masterclass Video Series (5 Classes)
          </h2>
          <p className="font-mono text-[9px] text-neutral-450 uppercase mt-0.5 tracking-wider">Expand or watch live synth structures</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => {
            return (
              <div
                key={cls.id}
                className="group relative rounded-[28px] overflow-hidden border border-white/20 dark:border-white/5 bg-white/30 dark:bg-[#111625]/40 backdrop-blur-xl p-5 flex flex-col justify-between hover:shadow-lg transition-all"
                id={`tutorial-class-${cls.id}`}
              >
                <div className="space-y-4">
                  {/* Class Thumbnail with simulated video trigger */}
                  <div className="relative aspect-video rounded-[20px] overflow-hidden border border-white/10 group-hover:border-emerald-500/20">
                    <img src={cls.videoPlaceholderUrl} alt={cls.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102" />
                    <div className="absolute inset-0 bg-neutral-900/40 flex items-center justify-center">
                      <button
                        onClick={() => toggleVideoPlay(cls)}
                        className="p-3.5 rounded-full transition-all cursor-pointer bg-white/80 hover:bg-emerald-500 hover:text-white text-[#4A5D4E] scale-100 hover:scale-110"
                        title="Open Interactive Studio Lab"
                      >
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </button>
                    </div>
                  </div>
 
                  <div className="space-y-2 text-left">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] px-2.5 py-0.5 bg-[#BC6C25]/10 text-[#BC6C25] rounded-full border border-[#BC6C25]/20 font-bold uppercase flex items-center gap-1">
                        {cls.level} <StarsBadge level={cls.level} />
                      </span>
                      <span className="font-mono text-[9px] text-neutral-400 font-semibold">{cls.duration}</span>
                    </div>
 
                    <h3 className="font-serif font-bold text-sm text-emerald-950 dark:text-[#E2E8F0] tracking-tight hover:text-[#BC6C25] transition-colors">
                      {cls.title}
                    </h3>
                    <p className="font-mono text-[10px] text-neutral-450 block uppercase">INSTRUCTOR: {cls.tutorName}</p>
                    <p className="font-serif text-xs text-[#6B655C] dark:text-[#94A3B8] leading-relaxed pt-1 italic">
                      "{cls.description}"
                    </p>
                  </div>
                </div>
 
                <div className="mt-4 pt-4 border-t border-white/20 dark:border-white/5 flex items-center justify-between">
                  <span className="font-mono text-[9px] text-neutral-400 uppercase">{cls.lessonsCount} Modules</span>
                  <button
                    onClick={() => {
                      if (!currentUser) {
                        alert('Please log in to study masterclass series.');
                        setCurrentTab('login');
                        return;
                      }
                      setActiveTutorialClass(cls);
                      setTutorialTab('guide');
                    }}
                    className="px-4.5 py-2 rounded-full bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-white font-mono text-[10px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer shadow-sm border border-emerald-500/20 hover:border-transparent"
                    id={`btn-open-tutorial-${cls.id}`}
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>Study Masterclass</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Chord Sheet Utility - Beautiful detail */}
      <div className="p-6 sm:p-10 rounded-[32px] border border-white/20 dark:border-white/5 bg-white/30 dark:bg-[#111625]/40 backdrop-blur-xl max-w-4xl mx-auto text-left space-y-6" id="interactive-chord-widget">
        <div className="border-b border-neutral-150 dark:border-white/5 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif font-bold text-lg md:text-xl text-[#3D3A35] dark:text-white flex items-center gap-2">
              <Music2 className="w-5 h-5 text-[#BC6C25] dark:text-[#F59E0B]" /> Practice Board: Interactive Scale Progressions
            </h3>
            <p className="font-mono text-[10px] text-neutral-400 mt-0.5 uppercase tracking-wide">Select helper chord to view key signatures as played in Velvet Horizon songs</p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(['C Major', 'G Major', 'A Minor', 'F Major'] as const).map((chord) => (
              <button
                key={chord}
                onClick={() => setChordSignature(chord)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono cursor-pointer transition-all ${
                  chordSignature === chord
                    ? 'bg-[#BC6C25] text-white font-bold'
                    : 'bg-white/40 dark:bg-[#1E2638] text-neutral-500 hover:bg-neutral-100 border border-neutral-150 dark:border-neutral-700'
                }`}
              >
                {chord}
              </button>
            ))}
          </div>
        </div>

        {/* Chord finger board rendering */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5 space-y-3">
            <span className="font-mono text-[9px] text-[#BC6C25] dark:text-[#F59E0B] tracking-wider uppercase font-bold">LORE CORRELATION</span>
            <h4 className="font-serif font-bold text-base text-[#3d3a35] dark:text-[#cbd5e1]">
              How we use {chordSignature} live
            </h4>
            <p className="font-serif text-xs text-[#6B655C] dark:text-[#94A3B8] leading-relaxed italic">
              {chordSignature === 'C Major' && "C Major provides the sparkling foundation of Sunset Grid. Highly transparent, pure, and bright."}
              {chordSignature === 'G Major' && "Julian sets Golden Hour inside G Major. The major scale chords resolve directly into sweeping, sunshine orchestral pads."}
              {chordSignature === 'A Minor' && "Pale Blue Light and Nocturnal dive heavy into A Minor. Deeply melancholic, it highlights our driving bass currents."}
              {chordSignature === 'F Major' && "Elysian Fields uses F Major modal combinations to yield a cinematic, hopeful electronic lift."}
            </p>
          </div>

          <div className="md:col-span-7 p-5 rounded-2xl bg-neutral-50 dark:bg-[#1E2536]/30 border border-neutral-200 dark:border-neutral-750 font-mono text-xs">
            <span className="text-[10px] text-neutral-400 block mb-2 uppercase font-bold">KEY INTERVAL SIGNATURE STRINGS:</span>
            <div className="flex flex-wrap gap-2">
              {chordSignature === 'C Major' && ['C', 'D', 'E', 'F', 'G', 'A', 'B'].map(n => <span key={n} className="px-2.5 py-1 bg-white dark:bg-[#121824] border border-neutral-200 dark:border-neutral-700 rounded-lg font-bold">{n}</span>)}
              {chordSignature === 'G Major' && ['G', 'A', 'B', 'C', 'D', 'E', 'F#'].map(n => <span key={n} className="px-2.5 py-1 bg-white dark:bg-[#121824] border border-neutral-200 dark:border-neutral-700 rounded-lg font-bold">{n}</span>)}
              {chordSignature === 'A Minor' && ['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(n => <span key={n} className="px-2.5 py-1 bg-white dark:bg-[#121824] border border-neutral-200 dark:border-neutral-700 rounded-lg font-bold">{n}</span>)}
              {chordSignature === 'F Major' && ['F', 'G', 'A', 'A#', 'C', 'D', 'E'].map(n => <span key={n} className="px-2.5 py-1 bg-white dark:bg-[#121824] border border-neutral-200 dark:border-neutral-700 rounded-lg font-bold">{n}</span>)}
            </div>
            
            <div className="pt-4 mt-4 border-t border-dashed border-neutral-300 dark:border-[#2A354E]/50 text-[11px] text-[#6B655C] dark:text-[#94A3B8]">
              <span className="block font-bold mb-1">PRO-TIP STUDY TIP:</span>
              Use the Web Audio Board inside our <strong>Instruments</strong> page to trigger these notes synth oscillators live to test note resonance!
            </div>
          </div>
        </div>
      </div>

      {/* 1-on-1 Tutors / Private masterclasses list */}
      <div className="space-y-6 max-w-6xl mx-auto" id="private-tutors-section">
        <div className="text-left border-b border-neutral-200 dark:border-[#1E2638] pb-3">
          <h2 className="font-serif font-bold text-xl md:text-2xl text-[#3D3A35] dark:text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#BC6C25] dark:text-[#F59E0B]" /> 1-on-1 Virtual Private Masterclasses (5 Tutors)
          </h2>
          <p className="font-mono text-[9px] text-neutral-450 uppercase mt-0.5 tracking-wider">Book custom hourly instruction slots directly with band directors</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="tutors-grid">
          {LESSON_TUTORS.map((tutor) => (
            <div
              key={tutor.id}
              className="group rounded-[24px] border border-white/20 dark:border-white/5 bg-white/30 dark:bg-[#111625]/40 backdrop-blur-xl p-6 flex flex-col sm:flex-row gap-6 text-left transition-all shadow-sm hover:border-[#BC6C25]/40"
              id={`tutor-profile-card-${tutor.id}`}
            >
              {/* Tutor Image */}
              <div className="relative w-full sm:w-40 aspect-square rounded-2xl overflow-hidden border border-white/20 dark:border-[#2A354F] flex-shrink-0 bg-[#F2ECE4] dark:bg-[#1C2335]">
                <img
                  src={tutor.imageUrl}
                  alt={tutor.name}
                  className="w-full h-full object-cover grayscale brightness-95 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Tutor Particulars */}
              <div className="flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <span className="font-mono text-[9px] text-[#BC6C25] dark:text-[#F59E0B] tracking-widest block uppercase font-bold">
                    {tutor.instrument}
                  </span>
                  <h3 className="font-serif font-bold text-xl text-[#3D3A35] dark:text-[#E2E8F0] hover:text-[#BC6C25] dark:hover:text-[#F59E0B] transition-colors leading-tight">
                    {tutor.name}
                  </h3>
                  <span className="inline-block font-mono text-[10px] text-[#6B655C] dark:text-[#94A3B8] uppercase tracking-wider font-semibold">
                    {tutor.role}
                  </span>

                  <p className="font-serif text-xs text-[#6B655C] dark:text-[#94A3B8] leading-relaxed pt-1.5 italic font-normal">
                    "{tutor.bio}"
                  </p>
                </div>

                <div className="pt-3 border-t border-[#F0EBE3] dark:border-t-[#222E46] flex items-end justify-between">
                  <div>
                    <span className="font-mono text-[8.5px] text-[#6B655C] dark:text-[#94A3B8] block uppercase tracking-wider font-bold">HOURLY RATE</span>
                    <span className="font-serif font-bold text-base text-[#3D3A35] dark:text-[#E2E8F0]">
                      ${tutor.pricePerHour} USD
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => openBookingWizard(tutor)}
                    id={`book-tutor-btn-${tutor.id}`}
                    className="px-5 py-2.5 rounded-full bg-[#4A5D4E] dark:bg-emerald-600 hover:bg-[#5B6F5F] dark:hover:bg-emerald-500 text-white font-mono text-xs font-bold tracking-widest uppercase transition-all shadow-sm cursor-pointer focus:outline-none"
                  >
                    Book Lesson
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Form Overlay Modal - Glass style */}
      {selectedTutor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in" id="booking-wizard-modal">
          <div className="relative w-full max-w-2xl bg-[#fdfbf7]/95 dark:bg-[#0E1527]/95 border border-white/20 dark:border-white/10 rounded-[28px] overflow-hidden shadow-2xl flex flex-col text-left text-[#3D3A35] dark:text-[#E2E8F0]">
            {/* Header */}
            <div className="p-6 border-b border-neutral-200 dark:border-white/10 flex items-center justify-between bg-white/20 dark:bg-[#182136]/30">
              <div className="flex items-center space-x-3 text-[#4A5D4E] dark:text-emerald-400">
                <GraduationCap className="w-6 h-6 text-[#BC6C25] dark:text-[#F59E0B]" />
                <h2 className="font-serif font-bold text-lg md:text-xl text-[#3D3A35] dark:text-white">
                  {bookingStep === 'details' ? 'Schedule Masterclass' : 'Admission Confirmed'}
                </h2>
              </div>
              <button
                onClick={closeBookingWizard}
                className="p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-[#1E2638] text-neutral-500 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[80vh]">
              {bookingStep === 'details' ? (
                /* Step 1 Form fields */
                <form onSubmit={handleBookingSubmit} className="space-y-4" id="tutor-form-submit">
                  <div className="flex items-center space-x-3 p-4 bg-[#BC6C25]/5 dark:bg-emerald-500/5 rounded-2xl border border-[#BC6C25]/20 dark:border-emerald-500/10">
                    <img src={selectedTutor.imageUrl} alt={selectedTutor.name} className="w-12 h-12 rounded-lg object-cover" />
                    <div>
                      <span className="font-mono text-[9px] text-[#BC6C25] dark:text-[#F59E0B] block uppercase font-bold">{selectedTutor.instrument}</span>
                      <span className="font-serif font-bold text-sm text-[#3D3A35] dark:text-white block">Tutor: {selectedTutor.name}</span>
                      <span className="font-mono text-[10px] text-neutral-400 block">${selectedTutor.pricePerHour} USD / hour</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-neutral-400 block uppercase font-bold">Your Full Name</label>
                      <input
                        type="text"
                        required
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="e.g. Robin Banks"
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-[#1E2638] border border-neutral-200 dark:border-neutral-750 text-[#3D3A35] dark:text-white outline-none focus:border-[#BC6C25] rounded-xl"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-neutral-400 block uppercase font-bold">Email address</label>
                      <input
                        type="email"
                        required
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        placeholder="email@address.com"
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-[#1E2638] border border-neutral-200 dark:border-neutral-750 text-[#3D3A35] dark:text-white outline-none focus:border-[#BC6C25] rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-neutral-400 block uppercase font-bold">Available Day Selector</label>
                      <select
                        value={selectedDay}
                        onChange={(e) => setSelectedDay(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-[#1E2638] border border-neutral-200 dark:border-neutral-750 text-[#3D3A35] dark:text-white outline-none focus:border-[#BC6C25] rounded-xl"
                      >
                        {selectedTutor.availableDays.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-neutral-400 block uppercase font-bold">Select hourly Time Slot</label>
                      <select
                        value={selectedSlot}
                        onChange={(e) => setSelectedSlot(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-[#1E2638] border border-neutral-200 dark:border-neutral-750 text-[#3D3A35] dark:text-white outline-none focus:border-[#BC6C25] rounded-xl"
                      >
                        {selectedTutor.availableSlots.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-neutral-400 block uppercase font-bold">Session Duration</label>
                      <select
                        value={sessionLength}
                        onChange={(e) => setSessionLength(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-[#1E2638] border border-neutral-200 dark:border-neutral-750 text-[#3D3A35] dark:text-white outline-none focus:border-[#BC6C25] rounded-xl"
                      >
                        <option value={1}>1 Hour Session</option>
                        <option value={2}>2 Hour Session</option>
                        <option value={3}>3 Hour Intensive</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-neutral-400 block uppercase font-bold">Experience Level</label>
                      <select
                        value={experienceLevel}
                        onChange={(e) => setExperienceLevel(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-[#1E2638] border border-neutral-200 dark:border-neutral-750 text-[#3D3A35] dark:text-white outline-none focus:border-[#BC6C25] rounded-xl"
                      >
                        <option value="Beginner">Beginner Trainee</option>
                        <option value="Intermediate">Intermediate player</option>
                        <option value="Advanced">Advanced player</option>
                        <option value="Expert">Live performer</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#1E2536]/30 border border-neutral-200 dark:border-neutral-750 text-xs font-mono space-y-2">
                    <div className="flex justify-between">
                      <span>HOURLY FEES RATE:</span>
                      <span>${selectedTutor.pricePerHour} USD</span>
                    </div>
                    <div className="flex justify-between">
                      <span>TERM DURATION:</span>
                      <span>{sessionLength} Hours</span>
                    </div>
                    <div className="flex justify-between border-t border-dashed pt-2 font-serif font-extrabold text-sm text-[#BC6C25] dark:text-[#F59E0B]">
                      <span>TOTAL SESSION PRICE:</span>
                      <span>${getSubtotalPrice()} USD</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-[#4A5D4E] dark:bg-emerald-600 hover:bg-[#5B6F5F] text-white font-mono text-xs font-bold uppercase tracking-widest rounded-full cursor-pointer transition-all shadow-md mt-4"
                  >
                    CONFIRM LIVE SESSION • ${getSubtotalPrice()}
                  </button>
                </form>
              ) : (
                /* Success confirmation badge */
                confirmedBooking && (
                  <div className="text-center py-6 space-y-6 animate-fade-in" id="booking-success-payout">
                    <div className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono font-bold text-emerald-600">
                      <CheckCircle className="w-5 h-5 animate-bounce" />
                      <span>MASTERCLASS SECURED</span>
                    </div>

                    <h3 className="font-serif font-bold text-xl text-[#3D3A35] dark:text-white">Admission Approved!</h3>
                    <p className="font-serif text-xs text-[#6B655C] dark:text-[#94A3B8] leading-relaxed max-w-sm mx-auto italic">
                      "Payment authorization approved. Your private masterclass index card receipt is generated below."
                    </p>

                    {/* RECEIPT BOX */}
                    <div className="p-5.5 rounded-2xl border border-neutral-200 dark:border-[#202A40] bg-white dark:bg-[#151D2F] text-left font-mono text-[10.5px] text-[#6B655C] dark:text-[#94A3B8] space-y-3.5 shadow-sm">
                      <div className="border-b border-dashed border-neutral-300 pb-2.5 flex justify-between">
                        <div>
                          <span className="font-serif font-extrabold text-sm text-[#3D3A35] dark:text-white block uppercase">VELVET ACADEMY</span>
                          <span className="text-[9px] mt-0.5">BROOKLYN LIVE SECTOR</span>
                        </div>
                        <span className="text-emerald-500 font-extrabold">APPROVED</span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <span>REGISTRATION REFERENCE:</span>
                          <span className="font-bold text-[#3D3A35] dark:text-white">{confirmedBooking.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>CLASS INSTRUMENT:</span>
                          <span className="text-[#3D3A35] dark:text-white">{confirmedBooking.instrument}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>ACADEMY INSTRUCTOR:</span>
                          <span className="font-bold text-[#3D3A35] dark:text-white">{confirmedBooking.tutorName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>SCHEDULE SLOT:</span>
                          <span className="text-[#3D3A35] dark:text-white">{confirmedBooking.date} at {confirmedBooking.timeSlot}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>STUDENT NAME:</span>
                          <span className="font-bold text-[#3D3A35] dark:text-white">{confirmedBooking.studentName}</span>
                        </div>
                      </div>

                      <div className="border-t border-solid pt-3 flex justify-between text-[#3D3A35] dark:text-white text-xs font-serif font-bold">
                        <span>ESTIMATED TUITION COMPENSATED:</span>
                        <span className="text-emerald-600 font-mono text-sm font-bold">${confirmedBooking.totalPrice} USD</span>
                      </div>
                    </div>

                    <button
                      onClick={closeBookingWizard}
                      className="w-full py-3.5 bg-[#4A5D4E] hover:bg-[#5B6F5F] text-white font-mono text-xs font-bold uppercase tracking-widest rounded-full cursor-pointer transition-all focus:outline-none"
                    >
                      Return to Learning Hub
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StarsBadge({ level }: { level: string }) {
  if (level === 'Beginner') return <div className="flex"><Star className="w-3.5 h-3.5 fill-current text-[#BC6C25]" /></div>;
  if (level === 'Intermediate') return <div className="flex"><Star className="w-3.5 h-3.5 fill-current text-[#BC6C25]" /><Star className="w-3.5 h-3.5 fill-current text-[#BC6C25]" /></div>;
  return <div className="flex"><Star className="w-3.5 h-3.5 fill-current text-[#BC6C25]" /><Star className="w-3.5 h-3.5 fill-current text-[#BC6C25]" /><Star className="w-3.5 h-3.5 fill-current text-[#BC6C25]" /></div>;
}
