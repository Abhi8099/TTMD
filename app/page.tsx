'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function Chat() {
  const [input, setInput] = useState('');
  const { messages, sendMessage, status } = useChat();

  const isStreaming =
    status === 'submitted' || status === 'streaming';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = input.trim();
    if (!value) return;
    sendMessage({ text: value });
    setInput('');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-50">
      <div className="flex flex-col w-full max-w-2xl mx-auto px-4 py-10 md:py-16">
        {/* Shell / Card */}
        <motion.div
          className="relative flex flex-col rounded-3xl border border-slate-800/80 bg-slate-900/70 shadow-[0_18px_45px_rgba(0,0,0,0.7)] backdrop-blur-md overflow-hidden"
          initial={{ opacity: 0, y: 18, filter: 'blur(10px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          {/* Subtle gradient overlay */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-sky-500/15 via-slate-900/0 to-transparent" />

          {/* Header */}
          <div className="relative flex items-center justify-between px-5 py-4 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              {/* Branded icon block */}
              <motion.div
                className="flex h-9 w-9 items-center justify-center rounded-2xl border border-sky-500/40 bg-sky-500/10 shadow-inner"
                initial={{ opacity: 0, scale: 0.8, filter: 'blur(6px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
              >
                <svg
                  viewBox="0 0 32 32"
                  className="h-5 w-5 text-sky-400"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient
                      id="chat-icon-grad"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#38BDF8" />
                      <stop offset="100%" stopColor="#0EA5E9" />
                    </linearGradient>
                  </defs>
                  <rect
                    x="3"
                    y="3"
                    width="26"
                    height="22"
                    rx="5"
                    fill="url(#chat-icon-grad)"
                    opacity="0.95"
                  />
                  <rect x="8" y="9" width="16" height="2" rx="1" fill="#0B1120" />
                  <rect x="8" y="14" width="10" height="2" rx="1" fill="#0B1120" />
                  <path
                    d="M14 25c2.5 0 4.4-.8 5.7-2.3L25 25l-1.5-3.9"
                    stroke="#0B1120"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.9"
                  />
                </svg>
              </motion.div>

              <div className="space-y-0.5">
                <div className="text-sm font-medium tracking-[0.18em] uppercase text-slate-300/80">
                  Conversation
                </div>
                <div className="text-base font-semibold text-slate-50">
                  AI Assistant
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px]">
              <span className="rounded-full border border-slate-700/80 bg-slate-900/80 px-2.5 py-1 text-[11px] text-slate-300/90 tracking-[0.14em] uppercase">
                Session
              </span>
              <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-300 tracking-[0.16em] uppercase">
                {isStreaming ? 'Responding' : 'Ready'}
              </span>
            </div>
          </div>

          {/* Messages area */}
          <div className="relative flex flex-col px-5 pt-4 pb-24 md:pb-28 space-y-3 overflow-y-auto max-h-[70vh]">
            {/* Empty state with animated skeleton */}
            {messages.length === 0 && !isStreaming && (
              <motion.div
                className="mt-1 rounded-2xl border border-slate-800/80 bg-slate-900/80 p-5 backdrop-blur-sm shadow-inner"
                initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <div className="animate-pulse space-y-3">
                  <div className="h-3.5 w-28 rounded-full bg-slate-800/80" />
                  <div className="h-4 w-3/4 rounded bg-slate-800/80" />
                  <div className="h-4 w-2/3 rounded bg-slate-800/70" />
                </div>
                <div className="mt-4 text-xs text-slate-400">
                  Ask a question, paste some text, or describe a task. The model
                  will respond here.
                </div>
              </motion.div>
            )}

            {/* Messages list with motion */}
            <AnimatePresence initial={false}>
              {messages.map((message, index) => {
                const isUser = message.role === 'user';

                return (
                  <motion.div
                    key={message.id}
                    layout
                    className={`flex ${
                      isUser ? 'justify-end' : 'justify-start'
                    }`}
                    initial={{
                      opacity: 0,
                      y: 10,
                      filter: 'blur(7px)',
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      filter: 'blur(0px)',
                    }}
                    exit={{
                      opacity: 0,
                      y: -6,
                      filter: 'blur(6px)',
                    }}
                    transition={{
                      duration: 0.25,
                      ease: 'easeOut',
                      delay: Math.min(index * 0.04, 0.28),
                    }}
                  >
                    <div
                      className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm backdrop-blur-sm border ${
                        isUser
                          ? 'bg-sky-500/95 text-slate-50 border-sky-400/80'
                          : 'bg-slate-900/85 text-slate-50 border-slate-800/90'
                      }`}
                    >
                      <div
                        className={`mb-1 text-[11px] font-medium tracking-[0.16em] uppercase ${
                          isUser
                            ? 'text-sky-100/80'
                            : 'text-slate-400/90'
                        }`}
                      >
                        {isUser ? 'You' : 'Assistant'}
                      </div>

                      <div className="space-y-2">
                        {(message.parts ?? []).map((part: any, i: number) => {
                          switch (part.type) {
                            case 'text':
                              return (
                                <div key={`${message.id}-${i}`} className="whitespace-pre-wrap">
                                  {part.text}
                                </div>
                              );
                            case 'tool-db':
                            case 'tool-schema':
                              return (
                                <motion.pre
                                  key={`${message.id}-${i}`}
                                  className="mt-1 max-h-64 overflow-auto rounded-xl border border-slate-800/90 bg-slate-950/80 p-3 text-[11px] text-slate-300/90"
                                  initial={{ opacity: 0, y: 6, filter: 'blur(6px)' }}
                                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                  transition={{ duration: 0.25, ease: 'easeOut' }}
                                >
                                  {JSON.stringify(part, null, 2)}
                                </motion.pre>
                              );
                            default:
                              return null;
                          }
                        })}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Streaming loader */}
            <AnimatePresence>
              {isStreaming && (
                <motion.div
                  className="flex justify-start mt-1"
                  initial={{ opacity: 0, y: 6, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: 6, filter: 'blur(6px)' }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                >
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-800/80 bg-slate-950/80 px-3 py-1.5 text-[11px] text-slate-300/90 shadow-sm backdrop-blur">
                    <span className="tracking-[0.16em] uppercase text-slate-400/90">
                      Thinking
                    </span>
                    <div className="inline-flex items-center gap-1.5">
                      {[0, 1, 2].map((d) => (
                        <motion.span
                          key={d}
                          className="h-1.5 w-1.5 rounded-full bg-sky-400/90"
                          animate={{
                            opacity: [0.25, 1, 0.25],
                            scale: [0.9, 1.1, 0.9],
                            filter: ['blur(0px)', 'blur(1px)', 'blur(0px)'],
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: d * 0.16,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input bar */}
          <motion.form
            onSubmit={handleSubmit}
            className="sticky bottom-0 flex items-center gap-2 border-t border-slate-800/80 bg-slate-950/95 px-5 py-3 backdrop-blur"
            initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(16,185,129,0.3)]" />
              </div>
              <input
                className="block w-full rounded-2xl border border-slate-700/80 bg-slate-950/90 px-8 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 outline-none transition focus:border-sky-400 focus:ring-1 focus:ring-sky-500/80"
                value={input}
                placeholder="Type your message and press Enter…"
                onChange={e => setInput(e.currentTarget.value)}
              />
            </div>

            <motion.button
              type="submit"
              className="inline-flex items-center justify-center rounded-2xl border border-sky-500/70 bg-sky-500/90 px-3.5 py-2 text-xs font-medium text-slate-50 tracking-[0.16em] uppercase shadow-md hover:bg-sky-400 transition cursor-pointer"
              whileHover={{ y: -1, filter: 'blur(0px)' }}
              whileTap={{ scale: 0.96 }}
            >
              Send
            </motion.button>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
}
