import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface FooterSocialIconProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  ariaLabel: string;
  title: string;
  theme: 'natural' | 'midnight';
  id?: string;
}

export default function FooterSocialIcon({
  href,
  onClick,
  children,
  ariaLabel,
  title,
  theme,
  id
}: FooterSocialIconProps) {
  const [ripples, setRipples] = useState<{ id: number }[]>([]);

  const handleClick = (e: React.MouseEvent) => {
    const id = Date.now() + Math.random();
    setRipples(prev => [...prev, { id }]);
    
    if (onClick) {
      onClick();
    }
  };

  const commonClasses = "p-3 rounded-full border border-[#E5DED4] dark:border-[#2A354F] bg-white dark:bg-[#1E2638] text-[#6B655C] dark:text-[#94A3B8] focus:outline-none shadow-sm cursor-pointer relative overflow-hidden flex items-center justify-center select-none";

  const hoverVariants = {
    scale: 1.12,
    color: theme === 'midnight' ? '#F59E0B' : '#BC6C25',
    borderColor: theme === 'midnight' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(188, 108, 37, 0.4)',
  };

  const springTransition = { type: "spring", stiffness: 300, damping: 15 };

  // Ripple color based on theme
  const rippleBg = theme === 'midnight' ? 'bg-amber-400/30' : 'bg-[#BC6C25]/30';

  return (
    <>
      {href ? (
        <motion.a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={ariaLabel}
          title={title}
          onClick={handleClick}
          className={commonClasses}
          whileHover={hoverVariants}
          transition={springTransition}
          id={id}
        >
          {/* Ripple animation elements */}
          <AnimatePresence>
            {ripples.map(ripple => (
              <motion.span
                key={ripple.id}
                initial={{ scale: 0, opacity: 0.6 }}
                animate={{ scale: 2.2, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                onAnimationComplete={() => {
                  setRipples(prev => prev.filter(r => r.id !== ripple.id));
                }}
                className={`absolute inset-0 rounded-full pointer-events-none ${rippleBg}`}
              />
            ))}
          </AnimatePresence>
          <span className="relative z-10 flex items-center justify-center">
            {children}
          </span>
        </motion.a>
      ) : (
        <motion.button
          onClick={handleClick}
          aria-label={ariaLabel}
          title={title}
          className={commonClasses}
          whileHover={hoverVariants}
          transition={springTransition}
          id={id}
        >
          {/* Ripple animation elements */}
          <AnimatePresence>
            {ripples.map(ripple => (
              <motion.span
                key={ripple.id}
                initial={{ scale: 0, opacity: 0.6 }}
                animate={{ scale: 2.2, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                onAnimationComplete={() => {
                  setRipples(prev => prev.filter(r => r.id !== ripple.id));
                }}
                className={`absolute inset-0 rounded-full pointer-events-none ${rippleBg}`}
              />
            ))}
          </AnimatePresence>
          <span className="relative z-10 flex items-center justify-center">
            {children}
          </span>
        </motion.button>
      )}
    </>
  );
}
