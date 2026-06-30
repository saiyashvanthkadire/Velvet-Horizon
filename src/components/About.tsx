import React, { useState } from 'react';
import { Shield, Sparkles, Award, Star, Guitar, Calendar, Radio, Compass, Users } from 'lucide-react';
import { BAND_BIO } from '../data';

export default function About() {
  const [activeTimeline, setActiveTimeline] = useState(4); // default active milestone

  const milestones = [
    {
      year: '2018',
      title: 'Dusk Sessions',
      subtitle: 'Formed in Brooklyn',
      description: 'Julian and Marcus find a dusty Korg synth in a Williamsburg cellar, launching nocturnal jam sessions with local street percussionists.',
      category: 'Foundation',
      icon: Compass,
    },
    {
      year: '2020',
      title: 'First EP Breakthrough',
      subtitle: 'Static Waves Release',
      description: 'Elena joins with raw delay pedals, cementing their distinctive synth-rock blend. The self-released EP gains viral underground radio traction.',
      category: 'Record',
      icon: Radio,
    },
    {
      year: '2022',
      title: 'Neon Whispers Ascent',
      subtitle: 'Global Tour & Award Nominations',
      description: 'Their debut full-length album storms electronic indie charts. Chloe joins on acoustic drums, turning live sets into explosive polyrhythmic events.',
      category: 'Tour',
      icon: Calendar,
    },
    {
      year: '2024',
      title: 'Shadows & Dust Era',
      subtitle: 'Deep Moog exploration',
      description: 'Crafted in dark Icelandic isolation, this heavier, melancholic post-punk exploration delivers triple-platinum single "Pale Blue Light".',
      category: 'Milestone',
      icon: Award,
    },
    {
      year: '2026',
      title: 'Elysian Fields Rebirth',
      subtitle: 'Cinematic Solar Soundscapes',
      description: 'Their most mature record yet, featuring cinematic orchestral synths, organic vibraphones, and grand hope-infused vocal peaks.',
      category: 'Present',
      icon: Sparkles,
    }
  ];

  return (
    <div className="space-y-16 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-[#3D3A35] dark:text-[#E2E8F0]" id="about-band-page">
      {/* Glass Header */}
      <div 
        className="relative rounded-[32px] overflow-hidden p-8 md:p-16 border border-white/20 dark:border-white/10 backdrop-blur-xl bg-white/20 dark:bg-[#0D1527]/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] text-center max-w-5xl mx-auto spacing-y-6"
        id="about-header-glass"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#BC6C25]/10 dark:bg-emerald-500/15 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 dark:bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="space-y-4 relative z-10 max-w-3xl mx-auto">
          <span className="font-mono text-xs text-[#BC6C25] dark:text-[#F59E0B] tracking-[0.25em] block uppercase font-extrabold flex items-center justify-center gap-2">
            <Users className="w-4 h-4" /> THE SONIC ODYSSEY
          </span>
          <h1 className="font-serif font-bold text-4xl md:text-6xl text-[#4A5D4E] dark:text-emerald-400 tracking-tight leading-tight">
            Meet Velvet Horizon
          </h1>
          <p className="font-serif text-[#6B655C] dark:text-[#94A3B8] text-base md:text-lg leading-relaxed max-w-2xl mx-auto italic pt-2">
            "Formed in the neon basement studios of Brooklyn, we fuse raw synth melodies, driving low-end bass, and soaring delayed guitar solos."
          </p>
        </div>
      </div>

      {/* Core Band Backstory: Side-by-Side Glass Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto" id="backstory-bento">
        {/* Story details */}
        <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-10 rounded-[28px] border border-white/10 dark:border-white/5 backdrop-blur-xl bg-white/30 dark:bg-[#0E1628]/40 shadow-sm space-y-6">
          <div className="space-y-4 text-justify">
            <span className="font-mono text-[10px] text-[#BC6C25] dark:text-[#F59E0B] tracking-widest font-extrabold uppercase">Est. 2018 in Brooklyn, NY</span>
            <h3 className="font-serif font-bold text-2xl lg:text-3xl text-[#3D3A35] dark:text-white">Our Sonic Foundations</h3>
            <p className="font-serif text-sm text-[#6B655C] dark:text-[#94A3B8] leading-relaxed italic">
              {BAND_BIO.about}
            </p>
            <p className="font-serif text-sm text-[#6B655C] dark:text-[#94A3B8] leading-relaxed italic">
              Our creation pipeline begins with an analog tape delay and an unwavering dedication to authentic, raw waveforms. In an era dominated by computerized automation, we cherish live organic feedback and direct human interaction.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/20 dark:border-white/5">
            <div>
              <span className="font-mono text-xl sm:text-2xl font-bold text-[#BC6C25] dark:text-[#F59E0B] block">3</span>
              <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-widest block">Studio Albums</span>
            </div>
            <div>
              <span className="font-mono text-xl sm:text-2xl font-bold text-[#BC6C25] dark:text-[#F59E0B] block">120+</span>
              <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-widest block">Live Arenas</span>
            </div>
            <div>
              <span className="font-mono text-xl sm:text-2xl font-bold text-[#BC6C25] dark:text-[#F59E0B] block">60M+</span>
              <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-widest block">Global Plays</span>
            </div>
          </div>
        </div>

        {/* Dynamic Glass Quote Card */}
        <div className="lg:col-span-5 relative overflow-hidden rounded-[28px] p-8 border border-white/10 dark:border-white/5 bg-gradient-to-br from-[#4A5D4E]/10 to-[#BC6C25]/15 backdrop-blur-xl flex flex-col justify-between space-y-8 text-left shadow-md">
          <div className="absolute top-4 right-4 text-[#BC6C25]/20 dark:text-[#F59E0B]/20 pointer-events-none">
            <Star className="w-16 h-16" />
          </div>
          
          <div className="space-y-4 pt-4">
            <span className="font-mono text-[10px] text-emerald-600 dark:text-[#0AEAA5] tracking-widest font-extrabold uppercase">Band Philosophy</span>
            <p className="font-serif text-lg text-emerald-950 dark:text-[#E2E8F0] leading-relaxed italic font-medium">
              "We don't play acoustic rock, and we don't synthesize plastic electronic presets. We create a shimmering bridge where acoustic strings meet electricity and late-night dust."
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-[#E5DED4]">
              <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150" alt="Julian" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="font-serif font-bold text-xs text-[#3D3A35] dark:text-[#E2E8F0] block">Julian Vance</span>
              <span className="font-mono text-[9px] text-neutral-400 block uppercase">Lead Synthesist</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Milestones Timeline Section */}
      <div className="py-10 max-w-5xl mx-auto space-y-8" id="lore-timeline-module">
        <div className="text-center space-y-2">
          <span className="font-mono text-xs text-[#BC6C25] dark:text-[#F59E0B] tracking-wider uppercase font-bold">CHRONOLOGY</span>
          <h2 className="font-serif font-bold text-2xl md:text-3.5xl text-[#3D3A35] dark:text-[#E2E8F0]">Milestone Chronology</h2>
          <p className="font-serif text-xs text-[#6B655C] dark:text-[#94A3B8] italic">Click on any year to explore that specific saga</p>
        </div>

        {/* Timeline year selection strip - glass */}
        <div className="flex flex-wrap items-center justify-center gap-3 p-3 rounded-[24px] border border-white/20 dark:border-white/5 bg-white/25 dark:bg-[#0D1526]/30 backdrop-blur-md">
          {milestones.map((item, index) => {
            const isActive = index === activeTimeline;
            const IconComponent = item.icon;
            return (
              <button
                key={item.year}
                onClick={() => setActiveTimeline(index)}
                className={`px-5 py-3.5 rounded-xl flex items-center space-x-2.5 transition-all text-sm font-mono font-bold uppercase cursor-pointer focus:outline-none ${
                  isActive
                    ? 'bg-[#BC6C25]/80 dark:bg-emerald-600/80 text-white shadow-md border-b-2 border-[#BC6C25] scale-105'
                    : 'bg-white/40 dark:bg-[#111625]/30 hover:bg-white/60 dark:hover:bg-[#1D2535] text-neutral-500 dark:text-[#94A3B8]'
                }`}
              >
                <IconComponent className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#BC6C25]'}`} />
                <span>{item.year}</span>
              </button>
            );
          })}
        </div>

        {/* Core Timeline Active Block Card - glass */}
        <div className="p-6 sm:p-10 rounded-[32px] border border-white/20 dark:border-white/5 bg-white/40 dark:bg-[#0D1527]/30 backdrop-blur-xl text-left shadow-lg scale-100 transition-all duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/20 dark:border-white/5 pb-5">
            <div>
              <span className="font-mono text-xs font-bold px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20">
                {milestones[activeTimeline].category}
              </span>
              <h3 className="font-serif font-bold text-2.5xl text-[#3D3A35] dark:text-white mt-2">
                {milestones[activeTimeline].title}
              </h3>
              <p className="font-mono text-xs text-neutral-400 mt-1 uppercase tracking-wider">{milestones[activeTimeline].subtitle}</p>
            </div>
            <div className="text-right">
              <span className="font-mono text-4xl md:text-5xl font-extrabold text-[#BC6C25] dark:text-emerald-400 tracking-tighter">
                {milestones[activeTimeline].year}
              </span>
            </div>
          </div>

          <p className="font-serif text-sm md:text-base text-[#6B655C] dark:text-[#CBD5E1] pt-5 leading-relaxed text-justify italic whitespace-pre-line">
            "{milestones[activeTimeline].description}"
          </p>
        </div>
      </div>

      {/* Meet the Members Section - Grid of Glass Cards */}
      <div className="space-y-10" id="members-about-grid">
        <div className="text-center space-y-2">
          <span className="font-mono text-xs text-[#BC6C25] dark:text-[#F59E0B] tracking-wider uppercase font-bold">THE CREW</span>
          <h2 className="font-serif font-bold text-2xl md:text-3.5xl text-[#3D3A35] dark:text-[#E2E8F0]">Creative Directors</h2>
          <p className="font-serif text-xs text-[#6B655C] dark:text-[#94A3B8] italic">Each director shapes and customizes our signature tone</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {BAND_BIO.members.map((member, i) => (
            <div
              key={member.name}
              className="group relative rounded-[28px] overflow-hidden border border-white/20 dark:border-white/5 bg-white/35 dark:bg-[#111625]/40 backdrop-blur-xl p-5 flex flex-col justify-between h-full hover:shadow-xl transition-all hover:scale-[1.02] hover:border-[#BC6C25]/40"
              id={`member-glass-card-${i}`}
            >
              <div className="space-y-4">
                {/* Image panel */}
                <div className="relative aspect-square rounded-[22px] overflow-hidden border border-white/20 dark:border-white/5">
                  <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Floating role indicator */}
                  <div className="absolute bottom-3 left-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full px-3 py-1 inline-block border border-white/30">
                    <span className="text-[9px] font-mono text-white tracking-widest uppercase font-bold">{member.role.split(' ')[0]}</span>
                  </div>
                </div>

                {/* Text particulars */}
                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-lg text-emerald-950 dark:text-[#E2E8F0] tracking-tight group-hover:text-[#BC6C25] transition-colors">{member.name}</h3>
                  <span className="font-mono text-[9px] text-[#BC6C25] dark:text-[#F59E0B] tracking-widest block uppercase font-bold">{member.role}</span>
                  <p className="font-serif text-xs text-[#6B655C] dark:text-[#94A3B8] leading-relaxed pt-2 italic">
                    "{member.bio}"
                  </p>
                </div>
              </div>

              {/* Backing custom sound signature decorative block */}
              <div className="mt-4 pt-3.5 border-t border-white/20 dark:border-white/5 flex items-center justify-between">
                <span className="font-mono text-[8px] text-neutral-400 block uppercase">Sound Engine</span>
                <span className="font-mono text-[9px] font-extrabold text-[#BC6C25] tracking-widest">
                  {i === 0 ? 'ANALOG JUN-106' : i === 1 ? 'TAPE DELAY STRAT' : i === 2 ? 'SUB-BASS 808' : 'POLYRHYTHMIC AKAI'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
