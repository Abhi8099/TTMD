'use client';

import { useChat } from '@ai-sdk/react';
import React, { useCallback, useMemo, useState, FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type ToolPart = {
  type: 'tool-db' | 'tool-schema';
  [key: string]: any;
};

type MessagePart =
  | { type: 'text'; text: string }
  | ToolPart;

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | string;
  parts: MessagePart[];
};

const messageCardVariants:any = {
  hidden: {
    opacity: 0,
    y: 8,
    filter: 'blur(8px)',
  },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.35,
      delay: index * 0.04,
      ease: 'easeOut',
    },
  }),
  exit: {
    opacity: 0,
    y: -6,
    filter: 'blur(4px)',
    transition: {
      duration: 0.25,
      ease: 'easeInOut',
    },
  },
};

const loaderVariants:any = {
  hidden: { opacity: 0, y: 8, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    y: 8,
    filter: 'blur(4px)',
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

interface ToolAccordionProps {
  id: string;
  title: string;
  subtitle?: string;
  data: unknown;
  isOpen: boolean;
  onToggle: () => void;
}

/**
 * Small inline chevron icon with rotation animation.
 */
const ChevronIcon: React.FC<{ open: boolean }> = ({ open }) => (
  <motion.span
    initial={false}
    animate={{ rotate: open ? 180 : 0 }}
    transition={{ duration: 0.2, ease: 'easeOut' }}
    className="ml-2 inline-flex text-slate-400"
  >
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="block"
    >
      <path
        d="M6 9l6 6 6-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </motion.span>
);

/**
 * Simple circular icon for tool type.
 */
const ToolBadgeIcon: React.FC = () => (
  <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-sky-600 text-xs font-semibold">
    T
  </span>
);

const ToolAccordion: React.FC<ToolAccordionProps> = ({
  id,
  title,
  subtitle,
  data,
  isOpen,
  onToggle,
}) => {
  return (
    <div
      className="overflow-hidden rounded-xl border border-sky-100 bg-sky-50/70 shadow-sm backdrop-blur-sm"
      key={id}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-sky-100/80 cursor-pointer"
      >
        <div className="flex items-center">
          <ToolBadgeIcon />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-800">
              {title}
            </span>
            {subtitle && (
              <span className="mt-0.5 text-xs font-medium text-slate-500">
                {subtitle}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-medium text-sky-700 shadow-sm">
            View details
          </span>
          <ChevronIcon open={isOpen} />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key={`${id}-content`}
            initial={{ height: 0, opacity: 0, filter: 'blur(4px)' }}
            animate={{
              height: 'auto',
              opacity: 1,
              filter: 'blur(0px)',
            }}
            exit={{
              height: 0,
              opacity: 0,
              filter: 'blur(3px)',
            }}
            transition={{
              duration: 0.3,
              ease: 'easeInOut',
            }}
          >
            <div className="border-t border-sky-100 bg-white/80 px-4 py-3">
              <motion.pre
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="max-h-64 overflow-auto rounded-lg bg-slate-900/5 p-3 text-[11px] leading-relaxed text-slate-800 font-mono"
              >
                {JSON.stringify(data, null, 2)}
              </motion.pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Chat() {
  const [input, setInput] = useState('');
  const [accordionState, setAccordionState] = useState<Record<string, boolean>>(
    {},
  );

const [isSending, setIsSending] = useState(false);
  const { messages, sendMessage, isLoading } = useChat() as {
    messages: ChatMessage[];
    sendMessage: (opts: { text: string }) => Promise<void> | void;
    isLoading?: boolean;
  };

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const trimmed = input.trim();
      if (!trimmed) return;
      setIsSending(true);
      await sendMessage({ text: trimmed });
      setInput('');
      setIsSending(false);
    },
    [input, sendMessage],
  );

  const toggleAccordion = useCallback((key: string) => {
    setAccordionState(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const hasMessages = useMemo(() => messages && messages.length > 0, [messages]);

  return (
    <div className="min-h-screen bg-white/97 py-10 px-4">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
          whileInView={{
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
          }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="mb-1 rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 via-white to-cyan-50/80 px-6 py-5 shadow-sm backdrop-blur-sm"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-base font-semibold tracking-tight text-slate-900">
                Talk To My Database
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Ask questions and explore tool responses via collapsible,
                animated accordions.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 rounded-xl bg-white/80 px-3 py-2 shadow-sm border border-slate-100">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.25)]" />
              <span className="text-xs font-medium text-slate-600">
                Ready to respond
              </span>
            </div>
          </div>
        </motion.header>

        {/* Chat panel */}
        <motion.section
          initial={{ opacity: 0, y: 8, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex flex-col rounded-2xl border border-slate-100 bg-white/90 shadow-[0_18px_40px_rgba(15,23,42,0.04)] backdrop-blur-md"
        >
          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-4 pt-5 max-h-[60vh]">
            <AnimatePresence initial={false}>
              {hasMessages ? (
                messages.map((message, index) => {
                  const isUser = message.role === 'user';
                  const keyBase = message.id;

                  return (
                    <motion.div
                      key={message.id}
                      layout
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={messageCardVariants}
                      custom={index}
                      className={`flex w-full ${
                        isUser ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl border px-4 py-3 shadow-sm backdrop-blur-sm ${
                          isUser
                            ? 'border-sky-100 bg-sky-50/80 text-slate-900'
                            : 'border-slate-100 bg-slate-50/80 text-slate-900'
                        }`}
                      >
                        <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                          {isUser ? 'You' : 'Assistant'}
                        </div>

                        <div className="space-y-3">
{message.parts.map((part, idx) => {
  const compositeId = `${keyBase}-${idx}`;
  const partType = (part as any).type;

  // 1) Hide internal step metadata so it never shows in the UI
  if (
    typeof partType === "string" &&
    (partType.startsWith("step-") || partType === "tool-input-available")
  ) {
    return null;
  }

  // 2) Show tool errors nicely in the UI
  if (partType === "tool-output-error") {
    const errorText =
      (part as any).errorText ||
      "An error occurred while executing the database tool.";

    return (
      <motion.div
        key={compositeId}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="mt-1 rounded-xl border border-red-100 bg-red-50/90 px-3 py-2 text-xs text-red-700"
      >
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-red-500">
          Tool error
        </div>
        <div className="mt-1 whitespace-pre-wrap">
          {errorText}
        </div>
      </motion.div>
    );
  }

  // 3) Normal text parts
  if (part.type === "text") {
    return (
      <motion.p
        key={compositeId}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.25,
          ease: "easeOut",
          delay: idx * 0.02,
        }}
        className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800"
      >
        {(part as any).text}
      </motion.p>
    );
  }

  // 4) Tool responses -> animated accordions (schema/db tools)
  if (part.type === "tool-db" || part.type === "tool-schema") {
    const title =
      part.type === "tool-db"
        ? "Database Tool Response"
        : "Schema Tool Response";

    const subtitle =
      part.type === "tool-db"
        ? "Structured data returned from database tool."
        : "Schema inspection / generation details.";

    return (
      <ToolAccordion
        key={compositeId}
        id={compositeId}
        title={title}
        subtitle={subtitle}
        data={part}
        isOpen={!!accordionState[compositeId]}
        onToggle={() => toggleAccordion(compositeId)}
      />
    );
  }

  // 5) Fallback for any truly unknown part types (kept for debugging)
  return (
    <motion.pre
      key={compositeId}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="max-h-64 overflow-auto rounded-lg bg-slate-900/5 p-3 text-[11px] leading-relaxed text-slate-800 font-mono"
    >
      {JSON.stringify(part, null, 2)}
    </motion.pre>
  );
})}

                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0, y: 4, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: 4, filter: 'blur(3px)' }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="flex h-40 items-center justify-center"
                >
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-6 text-center">
                    <p className="text-sm font-medium text-slate-700">
                      Start a conversation to see tool responses in animated accordions.
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Ask a question or run a tool. Results will appear as collapsible,
                      interactive cards.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Animated loader when tool/chat is working */}
            <AnimatePresence>
              {(isSending  ||isLoading) && (
                <motion.div
                  key="loader"
                  variants={loaderVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="flex justify-start"
                >
                  <div className="flex max-w-[70%] flex-col gap-2 rounded-2xl border border-sky-100 bg-sky-50/70 p-3 shadow-sm backdrop-blur-sm">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-sky-600">
                      Working
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
                        <span className="text-xs text-slate-600">
                          Analysing your request and preparing tool output…
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input */}
          <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-3 rounded-b-2xl">
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="flex items-center rounded-xl border border-slate-200 bg-white/90 px-3 py-2 shadow-sm focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100"
                >
                  <input
                    className="w-full border-none bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                    value={input}
                    placeholder="Ask something or run a tool…"
                    onChange={e => setInput(e.currentTarget.value)}
                  />
                </motion.div>
              </div>
              <motion.button
                type="submit"
                disabled={!input.trim()}
                whileTap={{ scale: 0.97, filter: 'blur(0px)' }}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-100 cursor-pointer"
              >
                Send
              </motion.button>
            </form>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
