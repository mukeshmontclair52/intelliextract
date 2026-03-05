import React, { useState } from "react";
import { Upload, FileText, Download, ChevronLeft, ChevronRight, Plus, Share2, Scissors, Scan, FileSearch2, MessageSquare, X, Lightbulb, FileJson, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TOOLS = [
  { key: "parse", label: "Parse", icon: Scan, color: "text-emerald-600", activeColor: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { key: "split", label: "Split", icon: Scissors, color: "text-rose-500", activeColor: "bg-rose-50 text-rose-700 border-rose-200", preview: true },
  { key: "extract", label: "Extract", icon: FileSearch2, color: "text-slate-600", activeColor: "bg-slate-100 text-slate-700 border-slate-200" },
  { key: "chat", label: "Chat", icon: MessageSquare, color: "text-slate-600", activeColor: "bg-slate-100 text-slate-700 border-slate-200" },
];

const SPLIT_SUGGESTIONS = [
  {
    title: "Rollover Contribution Instructions",
    desc: "A guide providing step-by-step instructions for making rollover contributions to a 401(k) savings plan.",
    color: "text-emerald-600",
  },
  {
    title: "Incoming Rollover Election Form",
    tags: ["Social Security Number"],
    desc: "A form used to elect an incoming rollover, requiring personal details, rollover type, and fund allocation choices.",
    color: "text-orange-500",
  },
];

function EmptyDocViewer({ onUpload }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl m-4 text-slate-400">
      <FileText className="w-14 h-14 mb-3 opacity-30" />
      <p className="text-sm font-medium mb-1">No document uploaded</p>
      <p className="text-xs mb-4">Upload a PDF to get started</p>
      <Button variant="outline" onClick={onUpload}>
        <Upload className="w-4 h-4 mr-2" />
        Upload File
      </Button>
    </div>
  );
}

function DocViewer({ file, page, totalPages, onPageChange }) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Doc toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <FileText className="w-4 h-4 text-slate-400" />
          <span className="font-medium truncate max-w-[180px]">{file.name}</span>
          <button className="text-slate-400 hover:text-slate-600"><Download className="w-4 h-4" /></button>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <button onClick={() => onPageChange(Math.max(1, page - 1))} className="hover:text-slate-800 disabled:opacity-30" disabled={page <= 1}>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span>{page} / {totalPages}</span>
          <button onClick={() => onPageChange(Math.min(totalPages, page + 1))} className="hover:text-slate-800 disabled:opacity-30" disabled={page >= totalPages}>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      {/* PDF display area */}
      <div className="flex-1 overflow-auto bg-slate-100 flex items-start justify-center p-4">
        <div className="bg-white shadow-md rounded w-full max-w-[520px] min-h-[700px] flex items-center justify-center text-slate-300 text-sm">
          <div className="text-center">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>{file.name}</p>
            <p className="text-xs mt-1">Page {page}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SplitPanel() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <span className="font-semibold text-slate-700 text-sm">Suggest Split Types</span>
        <button className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {SPLIT_SUGGESTIONS.map((s, i) => (
          <div key={i} className="border border-slate-200 rounded-lg p-3">
            <div className="flex items-start gap-2 mb-1">
              <span className={`font-semibold text-sm ${s.color}`}>{s.title}</span>
            </div>
            {s.tags && (
              <div className="flex gap-1 mb-2">
                {s.tags.map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs bg-orange-50 text-orange-600 border-orange-100">{t}</Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
          </div>
        ))}
        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-sm mt-2">Start with Suggestions</Button>
      </div>
      <div className="border-t border-slate-100 p-3 space-y-1">
        {[
          { icon: PenLine, label: "Write a Rule Prompt" },
          { icon: FileJson, label: "Upload JSON Rules" },
          { icon: Plus, label: "Start from Scratch" },
        ].map(({ icon: Icon, label }) => (
          <button key={label} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
            <Icon className="w-4 h-4 text-slate-400" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ParsePanel() {
  return (
    <div className="flex flex-col h-full p-4">
      <p className="text-sm font-semibold text-slate-700 mb-3">Parse Output</p>
      <div className="flex-1 bg-slate-50 rounded-lg border border-slate-200 p-3 text-xs text-slate-500 font-mono overflow-auto">
        Upload a document and click Parse to see structured Markdown output here.
      </div>
      <Button className="mt-3 bg-emerald-600 hover:bg-emerald-700 w-full">Run Parse</Button>
    </div>
  );
}

function ExtractPanel() {
  return (
    <div className="flex flex-col h-full p-4">
      <p className="text-sm font-semibold text-slate-700 mb-3">Extract Fields</p>
      <div className="flex-1 bg-slate-50 rounded-lg border border-slate-200 p-3 text-xs text-slate-500 overflow-auto">
        Upload a document and run Extract to pull key fields like names, dates, and totals.
      </div>
      <Button className="mt-3 bg-amber-500 hover:bg-amber-600 w-full">Run Extract</Button>
    </div>
  );
}

function ChatPanel() {
  return (
    <div className="flex flex-col h-full p-4">
      <p className="text-sm font-semibold text-slate-700 mb-3">Chat with Document</p>
      <div className="flex-1 bg-slate-50 rounded-lg border border-slate-200 p-3 text-xs text-slate-400 italic">
        Ask questions about the uploaded document…
      </div>
      <div className="mt-3 flex gap-2">
        <input className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300" placeholder="Ask something…" />
        <Button className="bg-indigo-600 hover:bg-indigo-700">Send</Button>
      </div>
    </div>
  );
}

export default function Playground() {
  const [file, setFile] = useState(null);
  const [activeTool, setActiveTool] = useState("split");
  const [page, setPage] = useState(1);

  const handleUpload = () => document.getElementById("playground-upload").click();

  return (
    <div className="flex flex-col h-[calc(100vh)] bg-white">
      {/* Top toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-1">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            const active = activeTool === tool.key;
            return (
              <button
                key={tool.key}
                onClick={() => setActiveTool(tool.key)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all",
                  active ? tool.activeColor : "text-slate-500 border-transparent hover:bg-slate-50"
                )}
              >
                {tool.key === "extract" || tool.key === "chat" ? (
                  <Plus className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <Icon className={cn("w-4 h-4", tool.color)} />
                )}
                {tool.label}
                {tool.preview && <Badge className="bg-teal-500 text-white text-[10px] px-1.5 py-0 rounded-full border-0 ml-0.5">Preview</Badge>}
              </button>
            );
          })}
        </div>
        <button className="text-slate-400 hover:text-slate-600"><Share2 className="w-4 h-4" /></button>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        {/* Left: Doc area */}
        <div className="flex-1 flex flex-col min-h-0 border-r border-slate-200">
          {file ? (
            <DocViewer file={file} page={page} totalPages={7} onPageChange={setPage} />
          ) : (
            <EmptyDocViewer onUpload={handleUpload} />
          )}
        </div>

        {/* Right: Tool Panel */}
        <div className="w-80 flex flex-col min-h-0 bg-white">
          {activeTool === "split" && <SplitPanel />}
          {activeTool === "parse" && <ParsePanel />}
          {activeTool === "extract" && <ExtractPanel />}
          {activeTool === "chat" && <ChatPanel />}
        </div>
      </div>

      <input
        id="playground-upload"
        type="file"
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={(e) => { if (e.target.files?.[0]) { setFile(e.target.files[0]); setPage(1); } }}
      />
    </div>
  );
}