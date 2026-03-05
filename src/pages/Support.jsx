import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { KNOWLEDGE_BASE } from "../components/support/knowledgeBase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Lightbulb, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const SUGGESTED_QUESTIONS = [
  "How do I integrate via REST API?",
  "How does Kafka ingestion work?",
  "How do I set up email ingestion?",
  "What is a Profile and how do I create one?",
  "How do I configure extraction fields?",
  "How do webhooks work?",
  "How does document splitting work?",
  "How do I authenticate API requests?",
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
        "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
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
      content: "Hi! I'm the DocExtract assistant. I can help you with API integration, Kafka setup, email ingestion, extraction configuration, and more. What would you like to know?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userText }]);
    setLoading(true);

    const knowledgeContext = buildKnowledgeContext();
    const history = messages.map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n");

    const prompt = `You are a helpful support assistant for DocExtract, a document intelligence platform.
Use ONLY the knowledge base below to answer. Be concise and practical. If the answer isn't in the knowledge base, say so politely and suggest they contact support.

KNOWLEDGE BASE:
${knowledgeContext}

CONVERSATION SO FAR:
${history}

User: ${userText}