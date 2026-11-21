"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Sparkles,
  User,
  RotateCcw,
  HelpCircle,
  TrendingDown,
  Package,
  ClockAlert,
  ArrowRight,
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  {
    icon: TrendingDown,
    label: "Why were sales low yesterday?",
    prompt: "Why were sales low yesterday? Break down customer volume, ticket sizes, and what contributed to the dip.",
  },
  {
    icon: Package,
    label: "Which items should I restock first?",
    prompt: "Which items should I restock first based on current inventory, margin, and sales velocity?",
  },
  {
    icon: ClockAlert,
    label: "Who was late or absent recently?",
    prompt: "Who was late or had irregular attendance shifts recently, and did it impact sales during their shift?",
  },
  {
    icon: Sparkles,
    label: "How to boost margins this week?",
    prompt: "What are 3 practical promotions or inventory adjustments I can make this week to increase gross profit?",
  },
];

const INITIAL_MESSAGE: ChatMessage = {
  id: "welcome-msg",
  role: "model",
  content:
    "Hello! I am your Smart කඩේ AI Business Advisor. I have access to your real-time store metrics—including the last 14 days of sales, live inventory stock, staff attendance logs, and today's AI Diagnostic Report.\n\nAsk me anything about your revenue, restocking priorities, low sales days, or staffing efficiency.",
  timestamp: "Just now",
};

export function BusinessAdvisorChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (messageToSend?: string) => {
    const text = (messageToSend ?? input).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: "user-" + Date.now(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Build history for context (excluding the welcome message and current message)
      const historyPayload = messages
        .filter((m) => m.id !== "welcome-msg")
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to receive advice from advisor");
      }

      const advisorMsg: ChatMessage = {
        id: "advisor-" + Date.now(),
        role: "model",
        content: data.reply || "I analyzed your store data but could not generate a response. Please try rephrasing your question.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, advisorMsg]);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Network error";
      const errorMsg: ChatMessage = {
        id: "error-" + Date.now(),
        role: "model",
        content: `⚠️ Error contacting Business Advisor: ${errMsg}. Please ensure your GEMINI_API_KEY is active and valid.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleResetChat = () => {
    setMessages([INITIAL_MESSAGE]);
  };

  return (
    <div className="bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 lg:p-6 shadow-md dark:shadow-xl flex flex-col h-full transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 dark:shadow-emerald-950/40">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                Chat with Your Business Advisor
              </h2>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono font-bold">
                Gemini Intelligence
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live context: 14d Sales, Stocks, Attendance & Reports
            </p>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          title="Reset conversation"
          className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 rounded-xl transition cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-zinc-700"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Prompt Chips */}
      <div className="py-3 border-b border-slate-200/80 dark:border-zinc-800/60 overflow-x-auto custom-scrollbar flex items-center gap-2">
        <span className="text-[11px] text-slate-500 dark:text-zinc-500 font-semibold shrink-0 flex items-center gap-1">
          <HelpCircle className="w-3 h-3" /> Quick:
        </span>
        {QUICK_PROMPTS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSend(item.prompt)}
              disabled={isLoading}
              className="text-[11px] shrink-0 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-750 hover:border-emerald-500/40 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white px-2.5 py-1 rounded-full transition flex items-center gap-1.5 active:scale-95 disabled:opacity-50 cursor-pointer font-medium"
            >
              <Icon className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 max-h-[510px] custom-scrollbar">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-semibold ${
                  isUser
                    ? "bg-slate-200 text-slate-700 dark:bg-zinc-700 dark:text-zinc-200 border border-slate-300 dark:border-zinc-600"
                    : "bg-emerald-600 text-white shadow-sm shadow-emerald-700/20 dark:shadow-emerald-950/40"
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-sm ${
                  isUser
                    ? "bg-emerald-600 text-white rounded-tr-sm"
                    : "bg-slate-100 border border-slate-200/80 text-slate-800 dark:bg-zinc-950/80 dark:border-zinc-800 dark:text-zinc-200 rounded-tl-sm"
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                ) : (
                  <AdvisorMessageText content={msg.content} />
                )}
                <div
                  className={`text-[10px] mt-1.5 ${
                    isUser ? "text-emerald-100 text-right font-medium" : "text-slate-400 dark:text-zinc-500"
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-100 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 rounded-2xl rounded-tl-sm p-3.5 text-xs text-slate-600 dark:text-zinc-400 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-spin" />
              <span>Advisor is analyzing 14-day trends & inventory numbers...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="pt-3 border-t border-slate-200 dark:border-zinc-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 focus-within:border-emerald-500 rounded-2xl p-1.5 transition shadow-sm"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about yesterday's sales, restock priorities, employee punctuality..."
            disabled={isLoading}
            className="flex-1 bg-transparent px-3 py-1.5 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
            title="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] text-slate-500 dark:text-zinc-500 text-center mt-2">
          Responses are grounded in real-time database records: Sales, Inventory, Attendance & Daily AI Reports.
        </p>
      </div>
    </div>
  );
}

/**
 * Renders advisor reply markdown cleanly with bold highlights and bullet styling
 */
function AdvisorMessageText({ content }: { content: string }) {
  const paragraphs = content.split("\n\n");

  return (
    <div className="space-y-2 leading-relaxed">
      {paragraphs.map((para, pIdx) => {
        // Bullet points
        if (para.includes("\n- ") || para.startsWith("- ") || para.startsWith("* ")) {
          const lines = para.split("\n").filter((l) => l.trim().length > 0);
          return (
            <ul key={pIdx} className="space-y-1.5 my-1.5 pl-1">
              {lines.map((line, lIdx) => {
                const isBullet = line.startsWith("- ") || line.startsWith("* ");
                const clean = line.replace(/^[-*]\s*/, "");
                return (
                  <li key={lIdx} className="flex items-start gap-1.5">
                    {isBullet && (
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    )}
                    <span>{parseBoldMarkdown(clean)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        // Heading tags (# or ##)
        if (para.startsWith("# ") || para.startsWith("## ") || para.startsWith("### ")) {
          const title = para.replace(/^#+\s*/, "");
          return (
            <h4 key={pIdx} className="font-bold text-slate-900 dark:text-white text-xs mt-2 border-b border-slate-200 dark:border-zinc-800 pb-1">
              {title}
            </h4>
          );
        }

        return <p key={pIdx}>{parseBoldMarkdown(para)}</p>;
      })}
    </div>
  );
}

function parseBoldMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-emerald-700 dark:text-emerald-300 font-bold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}
