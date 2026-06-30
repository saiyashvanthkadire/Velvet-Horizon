import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, Share2, Globe, ExternalLink } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'natural' | 'midnight';
}

export default function ShareModal({ isOpen, onClose, theme }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const bandUrl = window.location.origin;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(bandUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Velvet Horizon',
          text: 'Experience the warm analog synth and nostalgic reverb of Velvet Horizon!',
          url: bandUrl,
        });
      } catch (err) {
        // User cancelled or share failed, ignore safely unless critical
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    }
  };

  const isShareSupported = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="share-modal-container">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            id="share-modal-overlay"
          />

          {/* Modal Content Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
            className={`relative w-full max-w-md overflow-hidden rounded-2xl border p-6 text-left shadow-2xl ${
              theme === 'midnight'
                ? 'bg-[#111625] border-[#2A354F] text-white'
                : 'bg-white border-[#E5DED4] text-[#3D3A35]'
            }`}
            id="share-modal-content"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-2 rounded-lg text-[#6B655C] dark:text-[#94A3B8] hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus:outline-none"
              aria-label="Close modal"
              id="share-modal-close-btn"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            {/* Header */}
            <div className="mb-5 flex items-center space-x-3" id="share-modal-header">
              <div className={`p-2 rounded-xl ${
                theme === 'midnight' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-[#4A5D4E]/10 text-[#4A5D4E]'
              }`}>
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base tracking-tight" id="share-modal-title">
                  Share Velvet Horizon
                </h3>
                <p className="font-mono text-[9px] uppercase tracking-wider text-[#BC6C25] dark:text-emerald-400 font-bold">
                  Spread the waves
                </p>
              </div>
            </div>

            {/* Link Preview box */}
            <div 
              className={`p-3.5 rounded-xl border mb-5 font-mono text-xs flex items-center justify-between ${
                theme === 'midnight'
                  ? 'bg-[#182035] border-[#2A354F] text-[#94A3B8]'
                  : 'bg-[#FCFAF7] border-[#E5DED4] text-[#6B655C]'
              }`}
              id="share-modal-link-box"
            >
              <div className="flex items-center space-x-2 truncate mr-3">
                <Globe className="w-4 h-4 flex-shrink-0 text-neutral-400 dark:text-neutral-500" />
                <span className="truncate select-all">{bandUrl}</span>
              </div>
              <a 
                href={bandUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${
                  theme === 'midnight' ? 'text-emerald-400' : 'text-[#BC6C25]'
                }`}
                title="Open link in new tab"
                id="share-modal-external-link"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="share-modal-actions">
              {/* Copy Link Button */}
              <button
                onClick={handleCopy}
                className={`w-full py-3 px-4 rounded-xl font-mono text-xs font-bold tracking-wider uppercase border transition-all flex items-center justify-center space-x-2 cursor-pointer focus:outline-none ${
                  copied
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : theme === 'midnight'
                      ? 'bg-[#182035] border-[#2A354F] hover:bg-[#1E2942] text-[#E2E8F0]'
                      : 'bg-white border-[#E5DED4] hover:bg-[#FCFAF7] text-[#3D3A35]'
                }`}
                id="share-modal-copy-btn"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>

              {/* Native Web Share Button */}
              <button
                onClick={handleNativeShare}
                disabled={!isShareSupported}
                className={`w-full py-3 px-4 rounded-xl font-mono text-xs font-bold tracking-wider uppercase border transition-all flex items-center justify-center space-x-2 cursor-pointer focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed ${
                  theme === 'midnight'
                    ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-600 hover:border-emerald-500 text-white'
                    : 'bg-[#4A5D4E] hover:bg-[#5B6F5F] border-[#4A5D4E] hover:border-[#5B6F5F] text-white'
                }`}
                title={isShareSupported ? 'Share via standard system apps' : 'Native share not supported on this browser'}
                id="share-modal-native-btn"
              >
                <Share2 className="w-4 h-4" />
                <span>System Share</span>
              </button>
            </div>

            {!isShareSupported && (
              <p className="font-mono text-[9.5px] text-neutral-400 dark:text-neutral-500 mt-3 text-center">
                * Native sharing is unavailable on this browser. Use copy link instead!
              </p>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
