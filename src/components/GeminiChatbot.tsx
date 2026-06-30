import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, Sparkles, Trash2, User, Music, HelpCircle, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface GeminiChatbotProps {
  theme: 'natural' | 'midnight';
}

const SUGGESTED_PROMPTS = [
  { text: "🎵 Tell me about the band", label: "About" },
  { text: "📅 When is the next concert?", label: "Tour Dates" },
  { text: "🛍️ What merch is available?", label: "Merch Info" },
  { text: "🎹 Can I book music lessons?", label: "Lessons" },
];

export default function GeminiChatbot({ theme }: GeminiChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('vh_chat_history');
    return saved ? JSON.parse(saved) : [
      {
        role: 'assistant',
        content: "Hi! I'm **Aura**, your Velvet Horizon AI companion. Ask me anything about our music, tour dates, custom merch, or booking lessons with Elena or Julian! 📻✨"
      }
    ];
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Save chat history to localStorage
  useEffect(() => {
    localStorage.setItem('vh_chat_history', JSON.stringify(messages));
  }, [messages]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage: Message = { role: 'user', content: textToSend };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Could not connect to Aura. Please try again.');
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.reply || "I'm having trouble thinking of a response. Please try again!"
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  const handleClearHistory = () => {
    if (window.confirm("Would you like to reset your conversation history with Aura?")) {
      const defaultMsg: Message[] = [
        {
          role: 'assistant',
          content: "Hi! I'm **Aura**, your Velvet Horizon AI companion. Ask me anything about our music, tour dates, custom merch, or booking lessons with Elena or Julian! 📻✨"
        }
      ];
      setMessages(defaultMsg);
      setErrorMsg(null);
    }
  };

  return (
    <div id="aura-chatbot-root">
      {/* Floating Chat Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl flex items-center justify-center cursor-pointer transition-all focus:outline-none ${
          theme === 'midnight'
            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
            : 'bg-[#4A5D4E] hover:bg-[#5B6F5F] text-white'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        id="aura-chat-toggle-btn"
        title="Chat with Aura, our AI Assistant"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
        </span>
      </motion.button>

      {/* Chat Window Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-24 right-6 w-[360px] sm:w-[410px] h-[550px] max-h-[80vh] z-50 bg-white dark:bg-[#111625] border border-[#E5DED4] dark:border-[#2A354F] rounded-2xl shadow-2xl flex flex-col overflow-hidden font-sans text-left"
            id="aura-chat-panel"
          >
            {/* Header */}
            <div 
              className={`p-4 flex items-center justify-between border-b ${
                theme === 'midnight'
                  ? 'bg-[#182035] border-[#2A354F]'
                  : 'bg-[#F2ECE4] border-[#E5DED4]'
              }`}
              id="aura-chat-header"
            >
              <div className="flex items-center space-x-2.5">
                <div className={`p-2 rounded-xl ${
                  theme === 'midnight' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-[#4A5D4E]/10 text-[#4A5D4E]'
                }`}>
                  <Sparkles className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm tracking-tight text-[#3D3A35] dark:text-[#E2E8F0] flex items-center gap-1.5">
                    Aura
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </h3>
                  <span className="text-[10px] font-mono text-[#6B655C] dark:text-[#94A3B8] font-bold uppercase tracking-wider">
                    VH COMPANION AI
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-1.5">
                {messages.length > 1 && (
                  <button
                    onClick={handleClearHistory}
                    className="p-2 text-[#6B655C] dark:text-[#94A3B8] hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all focus:outline-none"
                    title="Clear history"
                    id="aura-clear-history-btn"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-[#6B655C] dark:text-[#94A3B8] hover:text-[#3D3A35] dark:hover:text-white rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all focus:outline-none"
                  title="Close chat"
                  id="aura-close-chat-btn"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Messages body thread */}
            <div 
              ref={chatContainerRef}
              className="flex-grow p-4 overflow-y-auto space-y-4 bg-[#FCFAF7] dark:bg-[#0E1321]"
              id="aura-messages-container"
            >
              {/* List of Messages */}
              {messages.map((msg, index) => {
                const isAssistant = msg.role === 'assistant';
                return (
                  <div
                    key={index}
                    className={`flex items-start space-x-2.5 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                  >
                    {isAssistant && (
                      <div className={`p-1.5 rounded-lg flex-shrink-0 mt-0.5 ${
                        theme === 'midnight' ? 'bg-emerald-950 text-emerald-400' : 'bg-[#4A5D4E]/10 text-[#4A5D4E]'
                      }`}>
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div
                      className={`p-3 rounded-2xl text-xs max-w-[82%] leading-relaxed shadow-sm border ${
                        isAssistant
                          ? theme === 'midnight'
                            ? 'bg-[#182035] border-[#2A354F] text-[#E2E8F0]'
                            : 'bg-white border-[#E5DED4] text-[#3D3A35]'
                          : theme === 'midnight'
                            ? 'bg-emerald-900/40 border-emerald-800/40 text-emerald-100'
                            : 'bg-[#F2ECE4] border-[#E5DED4] text-[#3D3A35]'
                      }`}
                    >
                      {/* Simple markdown bolding helper */}
                      <span className="whitespace-pre-wrap">
                        {msg.content.split('**').map((part, i) => 
                          i % 2 === 1 ? <strong key={i} className="font-bold">{part}</strong> : part
                        )}
                      </span>
                    </div>

                    {!isAssistant && (
                      <div className="p-1.5 rounded-lg bg-[#E5DED4] dark:bg-[#1E2638] text-[#6B655C] dark:text-[#94A3B8] flex-shrink-0 mt-0.5">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Loader Typing indicator */}
              {isTyping && (
                <div className="flex items-start space-x-2.5 justify-start">
                  <div className={`p-1.5 rounded-lg flex-shrink-0 mt-0.5 ${
                    theme === 'midnight' ? 'bg-emerald-950 text-emerald-400' : 'bg-[#4A5D4E]/10 text-[#4A5D4E]'
                  }`}>
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className={`p-3.5 rounded-2xl border flex items-center space-x-1.5 ${
                    theme === 'midnight' ? 'bg-[#182035] border-[#2A354F]' : 'bg-white border-[#E5DED4]'
                  }`}>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#BC6C25] dark:text-emerald-400" />
                    <span className="text-[11px] text-[#6B655C] dark:text-[#94A3B8] italic">Aura is listening...</span>
                  </div>
                </div>
              )}

              {/* Error warning state */}
              {errorMsg && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] rounded-xl text-center">
                  {errorMsg}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions Chips Drawer */}
            <div className="px-4 py-2 bg-white dark:bg-[#111625] border-t border-[#F0EBE3] dark:border-[#1E2638] overflow-x-auto flex items-center space-x-1.5 scrollbar-none" id="aura-suggested-prompts-row">
              {SUGGESTED_PROMPTS.map((chip, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(chip.text)}
                  disabled={isTyping}
                  className={`px-3 py-1.5 rounded-full text-[10.5px] font-medium transition-all whitespace-nowrap cursor-pointer hover:scale-[1.02] active:scale-95 disabled:opacity-50 border ${
                    theme === 'midnight'
                      ? 'bg-[#182035] border-[#2A354F] text-[#94A3B8] hover:text-emerald-400 hover:border-emerald-500/30'
                      : 'bg-[#FCFAF7] border-[#E5DED4] text-[#6B655C] hover:text-[#BC6C25] hover:border-[#BC6C25]/40'
                  }`}
                  id={`aura-suggest-chip-${index}`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Bottom Form Submission Panel */}
            <form 
              onSubmit={handleFormSubmit}
              className="p-3 bg-[#FCFAF7] dark:bg-[#111625] border-t border-[#E5DED4] dark:border-[#2A354F] flex items-center space-x-2"
              id="aura-chat-form"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message Aura..."
                disabled={isTyping}
                className="flex-grow px-3.5 py-2 rounded-xl text-xs border bg-white dark:bg-[#0E1321] text-[#3D3A35] dark:text-white border-[#E5DED4] dark:border-[#2A354F] outline-none focus:border-[#BC6C25] dark:focus:border-[#10B981] disabled:opacity-60"
                id="aura-message-input"
              />
              <button
                type="submit"
                disabled={isTyping || !input.trim()}
                className={`p-2.5 rounded-xl text-white transition-all focus:outline-none flex items-center justify-center disabled:opacity-40 disabled:scale-100 ${
                  theme === 'midnight'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-[#4A5D4E] hover:bg-[#5B6F5F]'
                }`}
                id="aura-send-message-btn"
                title="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
