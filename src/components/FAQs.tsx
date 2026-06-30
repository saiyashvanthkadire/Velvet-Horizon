import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { FAQS } from '../data';

export default function FAQs() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'general' | 'tickets' | 'merchandise' | 'lessons'>('all');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('faq-1'); // default open Q1

  // Filter lists based on category
  const filteredFaqs = FAQS.filter((faq) => {
    if (activeCategory === 'all') return true;
    return faq.category === activeCategory;
  });

  const toggleAccordion = (id: string) => {
    if (expandedFaqId === id) {
      setExpandedFaqId(null);
    } else {
      setExpandedFaqId(id);
    }
  };

  return (
    <div className="space-y-12 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-[#F9F6F2] dark:bg-[#0A0D14] text-[#3D3A35] dark:text-[#E2E8F0]" id="faqs-section-page">
      {/* Page Header */}
      <div className="text-center max-w-xl mx-auto space-y-3 pt-6" id="faq-intro">
        <span className="font-mono text-xs text-[#BC6C25] dark:text-[#F59E0B] tracking-widest block uppercase font-bold">SUPPORT & INQUIRIES</span>
        <h1 className="font-serif font-bold text-3xl md:text-5xl text-[#4A5D4E] dark:text-emerald-400 tracking-tight">Frequently Asked</h1>
        <p className="font-serif text-[#6B655C] dark:text-[#94A3B8] text-sm italic">
          "Got questions about our world tour tickets, organic merch fabrics, international transit times, or booking slots? We're here to help."
        </p>
      </div>

      {/* Accordion categories filters row */}
      <div className="flex flex-wrap items-center justify-center gap-2 border-b border-[#E5DED4] dark:border-[#1E2638] pb-6" id="faq-filters">
        {([
          { id: 'all', label: 'All Questions' },
          { id: 'general', label: 'Band Inquiries' },
          { id: 'tickets', label: 'Concert Tickets' },
          { id: 'merchandise', label: 'Shop Purchases' },
          { id: 'lessons', label: 'Lessons' }
        ] as const).map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setActiveCategory(cat.id);
              setExpandedFaqId(null); // Reset open states after switching categories
            }}
            id={`filter-faq-${cat.id}`}
            className={`px-4 py-2 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase transition-all cursor-pointer focus:outline-none ${
              activeCategory === cat.id
                ? 'bg-[#4A5D4E] dark:bg-emerald-600 text-white shadow-sm'
                : 'bg-[#F2ECE4]/70 dark:bg-[#1E2638]/70 text-[#6B655C] dark:text-[#94A3B8] border border-[#E5DED4] dark:border-[#2A354F] hover:bg-[#E5DED4] dark:hover:bg-[#20293D]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Collapsible Accordion Stream */}
      <div className="space-y-3.5" id="faqs-accordion-stream">
        {filteredFaqs.map((faq) => {
          const isExpanded = expandedFaqId === faq.id;
          return (
            <div
              key={faq.id}
              className={`rounded-[20px] border transition-all ${
                isExpanded
                  ? 'border-[#BC6C25]/50 dark:border-[#F59E0B]/50 bg-white dark:bg-[#111625] shadow-sm'
                  : 'border-[#E5DED4] dark:border-[#1E2638] bg-white dark:bg-[#111625]'
              }`}
              id={`faq-accordion-box-${faq.id}`}
            >
              {/* Question Expand Trigger Header */}
              <button
                onClick={() => toggleAccordion(faq.id)}
                className="w-full p-5 flex items-center justify-between text-left cursor-pointer select-none focus:outline-none group"
                aria-expanded={isExpanded}
                id={`faq-accordion-trigger-${faq.id}`}
              >
                <div className="flex items-center space-x-3.5 pr-4 min-w-0">
                  <div className={`p-2.5 rounded-xl flex-shrink-0 transition-colors ${
                    isExpanded 
                      ? 'bg-[#BC6C25]/10 dark:bg-[#F59E0B]/10 text-[#BC6C25] dark:text-[#F59E0B]' 
                      : 'bg-[#F2ECE4] dark:bg-[#1C2335] text-[#6B655C] dark:text-[#94A3B8]'
                  }`}>
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <h3 className={`font-serif font-bold text-sm md:text-base leading-snug tracking-tight ${
                    isExpanded ? 'text-[#BC6C25] dark:text-[#F59E0B]' : 'text-[#3D3A35] dark:text-[#E2E8F0] group-hover:text-[#BC6C25] dark:group-hover:text-[#F59E0B]'
                  }`}>
                    {faq.question}
                  </h3>
                </div>

                <div className="flex-shrink-0 p-1 rounded-lg text-neutral-400">
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[#BC6C25] dark:text-[#F59E0B]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#6B655C] dark:text-[#94A3B8]" />
                  )}
                </div>
              </button>

              {/* Collapsed Answer Details Panel */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-1 border-t border-[#F0EBE3] dark:border-t-[#1E2638]" id={`faq-accordion-answer-${faq.id}`}>
                  <p className="font-serif text-[#6B655C] dark:text-[#94A3B8] text-xs sm:text-sm leading-relaxed text-left whitespace-pre-line pl-12 italic">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Support help footer banner */}
      <div className="p-6 rounded-[24px] border border-[#E5DED4] dark:border-[#1E2638] bg-white dark:bg-[#111625] text-left flex flex-col md:flex-row md:items-center md:justify-between gap-4 max-w-3xl mx-auto shadow-sm animate-fade-in" id="faq-direct-assist">
        <div className="flex items-start space-x-3 text-left">
          <AlertCircle className="w-5.5 h-4.5 text-[#BC6C25] dark:text-[#F59E0B] flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-serif font-bold text-[#3D3A35] dark:text-[#E2E8F0] text-sm">Have a unique request or booking concern?</h4>
            <p className="font-serif text-xs text-[#6B655C] dark:text-[#94A3B8] leading-normal pt-0.5">
              Drop our management team a note directly: <span className="text-[#BC6C25] dark:text-[#F59E0B] font-bold underline">support@velvethorizon.com</span>. We typically respond within 24 hours.
            </p>
          </div>
        </div>

        <button
          onClick={() => alert('Coaching support ticket dispatched inside our sandbox environment successfully.')}
          className="px-5 py-2.5 rounded-full bg-[#4A5D4E] dark:bg-emerald-600 hover:bg-[#5B6F5F] dark:hover:bg-emerald-500 font-mono text-[10px] text-white font-bold uppercase tracking-widest transition-all cursor-pointer block text-center focus:outline-none"
        >
          Send Inquiry
        </button>
      </div>
    </div>
  );
}
