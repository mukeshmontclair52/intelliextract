import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { KNOWLEDGE_BASE } from "../components/support/knowledgeBase";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, LifeBuoy, Code2, Briefcase, Ticket, Bell, CheckCircle, X, Activity, Map } from "lucide-react";
import WorkflowDiagram from "../components/support/WorkflowDiagram";
import { Link } from "react-router-dom";
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

function ContactCard({ icon: Icon, color, title, desc, contact, channel }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex gap-3 items-start shadow-sm">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
        <div className="mt-2 flex flex-col gap-1">
          {contact && <span className="text-xs text-indigo-600 font-medium">{contact}</span>}
          {channel && <span className="text-xs text-slate-500">{channel}</span>}
        </div>
      </div>
    </div>
  );
}

function SnowTicketSteps() {
  const steps = [
    "Go to the ServiceNow portal at <strong>snow.internal.company.com</strong>",
    "Click <strong>Create New Incident</strong> or <strong>Request</strong>",
    "Set <strong>Category</strong> to <em>Data Platform</em> and <strong>Sub-category</strong> to <em>DocExtract</em>",
    "Fill in the description — include doc type, environment, and error details",
    "Set priority and assign to the <strong>DocExtract</strong> team",
    "Submit and save your ticket number for reference",
  ];
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
        <Ticket className="w-4 h-4 text-violet-600" />
        <p className="text-sm font-semibold text-slate-800">How to Create a SNOW Ticket</p>
      </div>
      <ol className="px-4 py-3 space-y-2">
        {steps.map((step, i) => (
          <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-100 text-violet-700 font-bold flex items-center justify-center text-[10px]">{i + 1}</span>
            <span dangerouslySetInnerHTML={{ __html: step }} />
          </li>
        ))}
      </ol>
    </div>
  );
}

function NotifyTeamsModal({ onClose }) {
  const [sent, setSent] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSend = () => {
    if (!msg.trim()) return;
    setSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        {sent ? (
          <div className="flex flex-col items-center py-4 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-500 mb-3" />
            <p className="font-semibold text-slate-800">Both teams have been notified!</p>
            <p className="text-xs text-slate-500 mt-1">Tech & Business teams will get back to you shortly.</p>
            <Button className="mt-5 bg-indigo-600 hover:bg-indigo-700 w-full" onClick={onClose}>Done</Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800 text-sm">Notify Tech & Business Teams</h2>
              <button onClick={onClose}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <p className="text-xs text-slate-500 mb-4">Your message will be sent to both the <strong>Tech team</strong> (tech-support@docextract.io) and <strong>Business team</strong> (business@docextract.io).</p>
            <textarea
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Describe your question or what you need help with…"
              rows={4}
              className="w-full resize-none border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-300 bg-slate-50 text-slate-700 placeholder-slate-400"
            />
            <Button
              className="mt-3 bg-indigo-600 hover:bg-indigo-700 w-full"
              disabled={!msg.trim()}
              onClick={handleSend}
            >
              <Bell className="w-4 h-4 mr-2" />Send Notification
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default function Support() {
  const [showModal, setShowModal] = useState(false);
  const [showWorkflow, setShowWorkflow] = useState(false);
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
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs text-slate-500">Online</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-8 gap-1.5 border-slate-300"
            onClick={() => setShowWorkflow(true)}
          >
            <Map className="w-3.5 h-3.5" />How it Works
          </Button>
          <Link to="/ServiceStatus">
            <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5 border-slate-300">
              <Activity className="w-3.5 h-3.5" />Service Status
            </Button>
          </Link>
          <Button
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-xs h-8 gap-1.5"
            onClick={() => setShowModal(true)}
          >
            <Bell className="w-3.5 h-3.5" />Notify Teams
          </Button>
        </div>
      </div>

      {/* Contact & SNOW info panel */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Contact & Escalation</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <ContactCard
              icon={Code2}
              color="bg-indigo-500"
              title="Tech Team"
              desc="For technical issues, API errors, integration questions, and platform bugs."
              contact="tech-support@docextract.io"
              channel="Slack: #docextract-tech"
            />
            <ContactCard
              icon={Briefcase}
              color="bg-emerald-500"
              title="Business Team"
              desc="For business requirements, onboarding, SLA queries, and partnership requests."
              contact="business@docextract.io"
              channel="Slack: #docextract-business"
            />
            <SnowTicketSteps />
          </div>
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

      {showModal && <NotifyTeamsModal onClose={() => setShowModal(false)} />}
      {showWorkflow && <WorkflowDiagram onClose={() => setShowWorkflow(false)} />}

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