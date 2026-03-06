import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { KNOWLEDGE_BASE } from "../components/support/knowledgeBase";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, LifeBuoy, Code2, Briefcase, Ticket, Bell, CheckCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

const SUGGESTED_QUESTIONS = [
  "How do I integrate via REST API?",
  "How does Kafka ingestion work?",
  "How do I set up email ingestion?",
  "What is a Profile and how do I create one?",
  "How do webhooks work?",
  "How does document splitting work?",
  "How do I authenticate API requests?",
  "How does redaction work?",
];

function buildKnowledgeContext() {
  return KNOWLEDGE_BASE.map(k => `## ${k.topic}\n${k.content}`).join("\n\n---\n\n");
}

function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={cn("flex gap-3 mb-4", isUser && "flex-row-reverse")}>
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        isUser ? "bg-indigo-100" : "bg-slate-100"
      )}>
        {isUser ? <User className="w-4 h-4 text-indigo-600" /> : <Bot className="w-4 h-4 text-slate-600" />}
      </div>
      <div className={cn(
        "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
        isUser
          ? "bg-indigo-600 text-white rounded-tr-sm"
          : "bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm"
      )}>
        {msg.content}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
        <Bot className="w-4 h-4 text-slate-600" />
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center h-4">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

export default function Support() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm the DocExtract assistant. I can help you with API integration, Kafka setup, email ingestion, extraction configuration, webhooks, and more. What would you like to know?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    setInput("");
    const updatedMessages = [...messages, { role: "user", content: userText }];
    setMessages(updatedMessages);
    setLoading(true);

    const knowledgeContext = buildKnowledgeContext();
    const history = messages.map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n");

    const prompt = `You are a helpful, friendly support assistant for DocExtract — a document intelligence platform.\nAnswer using ONLY the knowledge base below. Be concise and practical. Format code samples clearly.\nIf the user's question is not covered by the knowledge base, politely say you don't have that info and suggest contacting support@docextract.io.\n\nKNOWLEDGE BASE:\n${knowledgeContext}\n\nCONVERSATION HISTORY:\n${history}\n\nUser: ${userText}\nAssistant:`;

    const response = await base44.integrations.Core.InvokeLLM({ prompt });
    setMessages(prev => [...prev, { role: "assistant", content: response }]);
    setLoading(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const showSuggestions = messages.length <= 1;

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
          <LifeBuoy className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-semibold text-slate-800 text-sm">DocExtract Support</h1>
          <p className="text-xs text-slate-500">Ask anything about integration, configuration, or usage</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs text-slate-500">Online</span>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-3xl mx-auto">
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} />
          ))}
          {loading && <TypingIndicator />}

          {/* Suggested questions — only shown at start */}
          {showSuggestions && !loading && (
            <div className="mt-4">
              <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wide">Suggested questions</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-xs px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="bg-white border-t border-slate-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question… (Enter to send, Shift+Enter for new line)"
            rows={1}
            className="flex-1 resize-none border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-300 bg-slate-50 text-slate-700 placeholder-slate-400"
            style={{ minHeight: "42px", maxHeight: "120px" }}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
          />
          <Button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="bg-indigo-600 hover:bg-indigo-700 h-[42px] px-4 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="max-w-3xl mx-auto mt-2 text-xs text-slate-400 text-center">
          Answers are based on DocExtract documentation. For complex issues, contact <span className="text-indigo-500">support@docextract.io</span>
        </p>
      </div>
    </div>
  );
}