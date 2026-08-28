"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Loader2, Sparkles, RotateCcw, Music2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import { useChatStore } from "@/store";

const STARTERS = [
  "I'm feeling nostalgic for 90s evenings 🌅",
  "Music like a Hayao Miyazaki film 🎋",
  "I need something energizing for the gym 💪",
  "Songs for when you miss someone 💔",
  "Music that sounds like a road trip through the desert 🏜️",
  "Something between jazz and lo-fi for studying 📚",
];

function TypewriterText({ text }: { text: string }) {
  const paragraphs = text.split("\n");

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.02 },
    },
  };

  const wordVariants: any = {
    hidden: { opacity: 0, y: 3, filter: "blur(1px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.12, ease: "easeOut" }
    },
  };

  return (
    <motion.span variants={container} initial="hidden" animate="visible" className="block">
      {paragraphs.map((para, pIdx) => (
        <span key={pIdx} className="block mb-2 last:mb-0">
          {para.split(" ").map((word, wIdx) => (
            <motion.span
              key={wIdx}
              variants={wordVariants}
              className="inline-block mr-1"
            >
              {word === "" ? "\u00A0" : word}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.span>
  );
}

export default function ChatPage() {
  const { messages, isLoading, addMessage, setLoading, clearChat } = useChatStore();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (content?: string) => {
    const text = content || input.trim();
    if (!text || isLoading) return;
    setInput("");

    addMessage({ role: "user", content: text });
    setLoading(true);

    try {
      const history = [...messages, { role: "user" as const, content: text }];
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            content: m.content,
          })),
        }),
      });
      const data = await res.json();
      addMessage({ role: "assistant", content: data.response });
    } catch (e) {
      addMessage({ role: "assistant", content: "Sorry, I couldn't process that. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 flex flex-col py-6 pb-24 md:pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-playfair text-3xl font-black uppercase text-white flex items-center gap-2">
              <Sparkles size={20} className="text-[#fbbf24]" />
              CURATOR CHAT
            </h1>
            <p className="text-xs font-mono uppercase tracking-wider text-zinc-550 mt-1">// DIALOGUE PORT WITH RESONIX AI ARCHIVE</p>
          </div>
          {!isEmpty && (
            <button
              onClick={clearChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-none border border-zinc-800 text-zinc-400 hover:text-white hover:border-[#fbbf24] text-xs font-mono uppercase tracking-wider transition-all cursor-pointer"
            >
              <RotateCcw size={12} /> Clear
            </button>
          )}
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {isEmpty ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-12 h-12 rounded-none border border-zinc-850 bg-zinc-950 flex items-center justify-center mx-auto mb-4 shadow-none">
                <Music2 size={20} className="text-[#fbbf24]" />
              </div>
              <h2 className="font-playfair text-xl font-black uppercase text-white mb-2">How can I help you discover music today?</h2>
              <p className="text-zinc-500 text-xs font-mono uppercase tracking-wider mb-8 max-w-sm mx-auto">
                // Describe a feeling, a memory, or a specific vibe. I will parse the archive for matching records.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-left p-3 border border-zinc-800 rounded-none text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-white hover:border-zinc-500 transition-all cursor-pointer bg-zinc-950/20"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <AnimatePresence>
              {messages.map((msg, index) => {
                const isLastAssistantMessage =
                  index === messages.length - 1 && msg.role === "assistant";
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-7 h-7 rounded-none border border-zinc-800 bg-zinc-900 flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                        <Sparkles size={11} className="text-[#fbbf24]" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-none px-4 py-3 text-xs leading-relaxed font-mono ${
                        msg.role === "user"
                          ? "border border-[#fbbf24]/50 bg-zinc-950 text-white"
                          : "border border-zinc-850 text-zinc-350"
                      }`}
                    >
                      {msg.role === "assistant" && isLastAssistantMessage ? (
                        <TypewriterText text={msg.content} />
                      ) : (
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="w-7 h-7 rounded-none border border-zinc-800 bg-zinc-900 flex items-center justify-center mr-2 mt-1">
                    <Sparkles size={11} className="text-[#fbbf24]" />
                  </div>
                  <div className="border border-zinc-850 rounded-none px-4 py-3 bg-zinc-950">
                    <div className="flex gap-1.5 py-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ scale: [1, 1.4, 1] }}
                          transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }}
                          className="w-1.5 h-1.5 rounded-none bg-zinc-650"
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-2 border-[#f4f3f6] rounded-none p-3 flex gap-3 items-end focus-within:border-[#fbbf24] transition-colors bg-zinc-950">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tell me your vibe, mood, or activity…"
            rows={1}
            className="flex-1 bg-transparent text-white placeholder-zinc-700 text-xs font-mono outline-none resize-none leading-relaxed"
            style={{ maxHeight: "120px" }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 w-9 h-9 rounded-none bg-[#f4f3f6] text-[#0b0a0d] flex items-center justify-center transition-all hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? <Loader2 size={13} className="animate-spin text-[#0b0a0d]" /> : <Send size={13} className="text-[#0b0a0d]" />}
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
