import React, { useState, useRef, useEffect } from "react";
import {
  Upload, FileText, Scan, Scissors, FileSearch2,
  MessageSquare, ArrowLeftRight, Zap, RefreshCw, Sparkles,
  ChevronLeft, ChevronRight, Download, Copy, Send,
  CheckCircle2, XCircle, Wand2, Plus, X, FolderOpen,
  ChevronDown, RotateCcw, Code2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import ComparePanel from "@/components/playground/ComparePanel";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_PARSE_BLOCKS = [
  { id: 1, type: "Heading", content: "Step-by-Step Instructions for Rollover Contributions", isHeading: true },
  { id: 2, type: "Paragraph", content: "The JPMorgan Chase 401(k) Savings Plan offers you the opportunity to roll over the distribution you receive from your previous employer or IRA." },
  { id: 3, type: "Paragraph", content: "Direct Rollover: Your previous plan or annuity makes the distribution check payable directly to JPMorgan Chase 401(k) Savings Plan.\n\nRegular 60-Day Rollover: Your previous plan or annuity makes the distribution check payable to you." },
];

const MOCK_SPLIT_RESULTS = [
  { title: "1099 Consolidated Tax Statement", tags: ["2025"], pages: "2-3" },
  { title: "uncategorized", tags: [], pages: "4" },
  { title: "1099 Consolidated Tax Statement", tags: ["2025"], pages: "5-12" },
  { title: "uncategorized", tags: [], pages: "13" },
  { title: "1099 Consolidated Tax Statement", tags: ["2025"], pages: "14-24" },
];

const MOCK_SPLIT_CONFIGS = [
  { id: 1, name: "K-1 Schedule Parser", rules: ["Schedule of Investments", "Capital Account Summary"] },
  { id: 2, name: "Fund Report Splitter", rules: ["Equity Report", "Fixed Income", "Alternative Investment"] },
];

const MOCK_DOC_CONFIGS = [
  { id: 1, name: "Invoice Processing", prompt: "Extract invoice number, vendor name, total amount, line items, and due date." },
  { id: 2, name: "Tax Statement", prompt: "Extract account number, tax year, income totals, dividends, and tax withheld." },
  { id: 3, name: "KYC Document", prompt: "Extract full name, date of birth, address, ID number, and expiry date." },
];

// ─── Tool Definitions ─────────────────────────────────────────────────────────

const TOOLS = [
  { key: "parse",   label: "Parse",   icon: Scan,          color: "emerald", desc: "Extract structured text blocks from documents" },
  { key: "split",   label: "Split",   icon: Scissors,      color: "rose",    desc: "Segment a document into named sections" },
  { key: "extract", label: "Extract", icon: FileSearch2,   color: "violet",  desc: "Pull specific fields using a schema or AI" },
  { key: "chat",    label: "Chat",    icon: MessageSquare, color: "sky",     desc: "Ask questions about the document" },
  { key: "compare", label: "Compare", icon: ArrowLeftRight,color: "indigo",  desc: "Side-by-side engine comparison" },
];

const COLOR_MAP = {
  emerald: { bg: "bg-emerald-500", light: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-200", border: "border-emerald-300", grad: "from-emerald-500 to-teal-500" },
  rose:    { bg: "bg-rose-500",    light: "bg-rose-50",    text: "text-rose-600",    ring: "ring-rose-200",    border: "border-rose-300",    grad: "from-rose-500 to-pink-500"    },
  violet:  { bg: "bg-violet-500",  light: "bg-violet-50",  text: "text-violet-600",  ring: "ring-violet-200",  border: "border-violet-300",  grad: "from-violet-500 to-indigo-500" },
  sky:     { bg: "bg-sky-500",     light: "bg-sky-50",     text: "text-sky-600",     ring: "ring-sky-200",     border: "border-sky-300",     grad: "from-sky-500 to-blue-500"     },
  indigo:  { bg: "bg-indigo-500",  light: "bg-indigo-50",  text: "text-indigo-600",  ring: "ring-indigo-200",  border: "border-indigo-300",  grad: "from-indigo-500 to-blue-600"  },
};

// ─── Document Panel ───────────────────────────────────────────────────────────

function DocumentPanel({ file, page, setPage, onUpload }) {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <span className="text-xs font-semibold text-slate-600">
            {file ? file.name : "Document"}
          </span>
        </div>
        <button
          onClick={onUpload}
          className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          <Upload className="w-3 h-3" />
          {file ? "Replace" : "Upload"}
        </button>
      </div>

      {/* Body */}
      {!file ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
          <button
            onClick={onUpload}
            className="flex flex-col items-center gap-3 w-full max-w-xs border-2 border-dashed border-slate-200 rounded-2xl p-10 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-700">Upload a document</p>
              <p className="text-xs text-slate-400 mt-1">PDF, PNG or JPEG</p>
            </div>
          </button>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-slate-50">
            <div className="bg-white rounded-xl shadow border border-slate-100 w-full max-w-[260px] min-h-[360px] flex flex-col items-center justify-center gap-2 text-slate-200">
              <FileText className="w-10 h-10 opacity-20" />
              <p className="text-xs text-slate-400">{file.name}</p>
              <p className="text-xs text-slate-300">Page {page}</p>
            </div>
          </div>
          <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-slate-500" />
              </button>
              <span className="text-xs text-slate-500 font-medium w-12 text-center">{page} / 7</span>
              <button
                onClick={() => setPage(p => Math.min(7, p + 1))}
                disabled={page >= 7}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>
            <button className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Parse Output ─────────────────────────────────────────────────────────────

function ParseOutput({ file }) {
  const [ran, setRan] = useState(false);
  const [running, setRunning] = useState(false);
  const [view, setView] = useState("blocks");

  const run = () => {
    setRunning(true);
    setTimeout(() => { setRunning(false); setRan(true); }, 1500);
  };

  if (!ran) {
    return (
      <EmptyOutput
        icon={Scan}
        color="emerald"
        title="Ready to Parse"
        desc="Run the parser to extract text blocks and structure from your document."
        action={run}
        loading={running}
        disabled={!file}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs font-semibold text-slate-600">{MOCK_PARSE_BLOCKS.length} blocks extracted</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ViewToggle value={view} onChange={setView} />
          <button className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors" onClick={() => setRan(false)}>
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {view === "blocks" ? (
          <div className="space-y-2.5">
            {MOCK_PARSE_BLOCKS.map(b => (
              <div key={b.id} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 rounded px-1.5 py-0.5">{b.type}</span>
                <p className={cn("text-sm text-slate-700 leading-relaxed mt-2 whitespace-pre-wrap", b.isHeading && "font-bold text-slate-800")}>{b.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <pre className="text-xs font-mono text-emerald-300 bg-slate-950 rounded-2xl p-5 overflow-auto leading-relaxed h-full">
            {JSON.stringify(MOCK_PARSE_BLOCKS, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

// ─── Split Output ─────────────────────────────────────────────────────────────

function SplitOutput({ file }) {
  const [ran, setRan] = useState(false);
  const [running, setRunning] = useState(false);
  const [view, setView] = useState("list");
  const [rules, setRules] = useState([]);
  const [newRule, setNewRule] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  const run = () => {
    setRunning(true);
    setTimeout(() => { setRunning(false); setRan(true); }, 1500);
  };

  if (!ran) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 pt-4 pb-3 border-b border-slate-100 flex-shrink-0">
          <p className="text-xs font-semibold text-slate-600">Split Rules</p>
          <p className="text-xs text-slate-400 mt-0.5">Define document sections before running.</p>
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-3">
          {/* Config picker */}
          <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
            <button onClick={() => setShowPicker(!showPicker)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-medium text-slate-600">Load from config</span>
              </div>
              <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform", showPicker && "rotate-180")} />
            </button>
            {showPicker && (
              <div className="border-t border-slate-100">
                {MOCK_SPLIT_CONFIGS.map(cfg => (
                  <button key={cfg.id} onClick={() => { setRules(cfg.rules); setShowPicker(false); }} className="w-full text-left px-4 py-2.5 text-xs hover:bg-rose-50 transition-colors">
                    <p className="font-medium text-slate-700">{cfg.name}</p>
                    <p className="text-slate-400 mt-0.5">{cfg.rules.length} rules</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Rules list */}
          {rules.length > 0 && (
            <div className="space-y-1.5">
              {rules.map((r, i) => (
                <div key={i} className="flex items-center gap-2 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
                  <Scissors className="w-3 h-3 text-rose-400 flex-shrink-0" />
                  <span className="text-xs font-medium text-rose-700 flex-1">{r}</span>
                  <button onClick={() => setRules(p => p.filter((_, j) => j !== i))} className="text-rose-300 hover:text-rose-500 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add rule */}
          <div className="flex gap-2">
            <input
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-rose-200"
              placeholder="Add a rule…"
              value={newRule}
              onChange={e => setNewRule(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && newRule.trim()) { setRules(p => [...p, newRule.trim()]); setNewRule(""); } }}
            />
            <button
              onClick={() => { if (newRule.trim()) { setRules(p => [...p, newRule.trim()]); setNewRule(""); } }}
              className="px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="px-4 py-3 border-t border-slate-100 flex justify-end">
          <Button
            size="sm"
            onClick={run}
            disabled={running || rules.length === 0 || !file}
            className={cn("h-8 rounded-xl text-xs border-0 gap-1.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600")}
          >
            {running ? <><RefreshCw className="w-3 h-3 animate-spin" />Running…</> : <><Zap className="w-3 h-3" />Run Split</>}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-rose-400" />
          <span className="text-xs font-semibold text-slate-600">{MOCK_SPLIT_RESULTS.length} segments found</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ViewToggle value={view} onChange={setView} />
          <button className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors" onClick={() => setRan(false)}>
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {view === "list" ? (
          <div className="space-y-2">
            {MOCK_SPLIT_RESULTS.map((r, i) => (
              <div key={i} className={cn("flex items-center justify-between bg-white border rounded-xl px-4 py-3 shadow-sm", r.title === "uncategorized" ? "border-slate-100 opacity-50" : "border-rose-100")}>
                <div className="flex items-center gap-2.5">
                  <div className={cn("w-2 h-2 rounded-full flex-shrink-0", r.title === "uncategorized" ? "bg-slate-300" : "bg-rose-400")} />
                  <span className={cn("text-xs font-medium", r.title === "uncategorized" ? "text-slate-400 italic" : "text-slate-700")}>{r.title}</span>
                  {r.tags.map(t => <span key={t} className="text-[10px] font-medium bg-rose-50 text-rose-500 border border-rose-100 rounded-full px-2 py-0.5">{t}</span>)}
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-100 rounded px-2 py-0.5">p. {r.pages}</span>
              </div>
            ))}
          </div>
        ) : (
          <pre className="text-xs font-mono text-rose-300 bg-slate-950 rounded-2xl p-5 overflow-auto leading-relaxed">
            {JSON.stringify(MOCK_SPLIT_RESULTS, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

// ─── Extract Output ───────────────────────────────────────────────────────────

function ExtractOutput({ file }) {
  const [ran, setRan] = useState(false);
  const [running, setRunning] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [footerMode, setFooterMode] = useState(null); // "ai" | "json" | "scratch"
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);

  const run = () => {
    setRunning(true);
    setTimeout(() => { setRunning(false); setRan(true); }, 1500);
  };

  const canRun = !!selectedConfig && !!file;

  if (ran) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-violet-500" />
            <span className="text-xs font-semibold text-slate-600">Extraction complete</span>
          </div>
          <button className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors" onClick={() => setRan(false)}>
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <pre className="text-xs font-mono text-violet-300 bg-slate-950 rounded-2xl p-5 overflow-auto leading-relaxed h-full">
            {JSON.stringify({ invoice_number: "INV-20250315", vendor: "Acme Corp", total: "$4,250.00", due_date: "2025-04-15" }, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">

      {/* ── Main body: Document Config selector ── */}
      <div className="flex-1 flex flex-col justify-center px-5 py-6 gap-5 overflow-auto">

        {/* Hero label */}
        <div>
          <p className="text-xs font-semibold text-violet-500 uppercase tracking-widest mb-1">Step 1</p>
          <p className="text-lg font-bold text-slate-800">Select a Document Config</p>
          <p className="text-xs text-slate-400 mt-1">Choose the configuration that defines what to extract.</p>
        </div>

        {/* Dropdown trigger */}
        <div className="relative">
          <button
            onClick={() => setShowPicker(!showPicker)}
            className={cn(
              "w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border-2 transition-all bg-white",
              selectedConfig
                ? "border-violet-400 shadow-md shadow-violet-100"
                : "border-slate-200 hover:border-violet-300"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0", selectedConfig ? "bg-violet-100" : "bg-slate-100")}>
                <FolderOpen className={cn("w-4 h-4", selectedConfig ? "text-violet-500" : "text-slate-400")} />
              </div>
              {selectedConfig ? (
                <div className="text-left">
                  <p className="text-sm font-semibold text-violet-700">{selectedConfig.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[220px]">{selectedConfig.prompt}</p>
                </div>
              ) : (
                <span className="text-sm font-medium text-slate-400">Choose a document config…</span>
              )}
            </div>
            <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform flex-shrink-0", showPicker && "rotate-180")} />
          </button>

          {/* Dropdown list */}
          {showPicker && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-10">
              {MOCK_DOC_CONFIGS.map((cfg, i) => (
                <button
                  key={cfg.id}
                  onClick={() => { setSelectedConfig(cfg); setShowPicker(false); }}
                  className={cn(
                    "w-full text-left px-4 py-3.5 hover:bg-violet-50 transition-colors flex items-center justify-between gap-3",
                    i !== MOCK_DOC_CONFIGS.length - 1 && "border-b border-slate-50",
                    selectedConfig?.id === cfg.id && "bg-violet-50"
                  )}
                >
                  <div>
                    <p className={cn("text-sm font-semibold", selectedConfig?.id === cfg.id ? "text-violet-700" : "text-slate-700")}>{cfg.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[260px]">{cfg.prompt}</p>
                  </div>
                  {selectedConfig?.id === cfg.id && <CheckCircle2 className="w-4 h-4 text-violet-500 flex-shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected config detail card */}
        {selectedConfig && (
          <div className="bg-violet-50 border border-violet-200 rounded-2xl px-4 py-4 space-y-2">
            <p className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">Extraction Prompt</p>
            <p className="text-xs text-violet-800 leading-relaxed">{selectedConfig.prompt}</p>
          </div>
        )}

        {/* Empty hint */}
        {!selectedConfig && (
          <div className="flex flex-col items-center gap-2 py-4 opacity-40">
            <FileSearch2 className="w-8 h-8 text-slate-300" />
            <p className="text-xs text-slate-400 text-center">Select a config above to enable extraction</p>
          </div>
        )}
      </div>

      {/* ── Footer: secondary options + Run ── */}
      <div className="border-t border-slate-100 flex-shrink-0">
        {/* Footer mode expanded panel */}
        {footerMode === "ai" && (
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-slate-600">Generate with AI</p>
              <button onClick={() => setFooterMode(null)} className="text-slate-400 hover:text-slate-600"><X className="w-3.5 h-3.5" /></button>
            </div>
            <textarea
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-violet-200 resize-none bg-white"
              rows={2}
              placeholder="Describe what to extract…"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
            />
            <Button
              onClick={() => { setGenerating(true); setTimeout(() => setGenerating(false), 1500); }}
              disabled={generating || !prompt.trim()}
              size="sm"
              className="w-full h-7 rounded-lg text-xs border-0 bg-gradient-to-r from-violet-500 to-indigo-500 gap-1.5"
            >
              {generating ? <><RefreshCw className="w-3 h-3 animate-spin" />Generating…</> : <><Sparkles className="w-3 h-3" />Generate</>}
            </Button>
          </div>
        )}
        {footerMode === "json" && (
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-slate-600">Upload JSON Schema</p>
              <button onClick={() => setFooterMode(null)} className="text-slate-400 hover:text-slate-600"><X className="w-3.5 h-3.5" /></button>
            </div>
            <textarea
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-violet-200 resize-none bg-white"
              rows={3}
              placeholder={'{ "fields": [...] }'}
            />
          </div>
        )}
        {footerMode === "scratch" && (
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-600">Build from Scratch</p>
              <button onClick={() => setFooterMode(null)} className="text-slate-400 hover:text-slate-600"><X className="w-3.5 h-3.5" /></button>
            </div>
            <p className="text-xs text-slate-400 text-center py-2">Visual field builder coming soon.</p>
          </div>
        )}

        {/* Footer menu row */}
        <div className="flex items-center px-4 py-2.5 gap-1">
          <div className="flex items-center gap-0.5 flex-1">
            {[
              { key: "ai", icon: Wand2, label: "AI Generate" },
              { key: "json", icon: Code2, label: "JSON Schema" },
              { key: "scratch", icon: Plus, label: "From Scratch" },
            ].map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setFooterMode(footerMode === key ? null : key)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                  footerMode === key
                    ? "bg-violet-100 text-violet-700"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                )}
              >
                <Icon className="w-3 h-3" />
                {label}
              </button>
            ))}
          </div>
          <Button
            size="sm"
            onClick={run}
            disabled={running || !canRun}
            className="h-8 px-4 rounded-xl text-xs border-0 gap-1.5 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 disabled:opacity-40"
          >
            {running ? <><RefreshCw className="w-3 h-3 animate-spin" />Running…</> : <><Zap className="w-3 h-3" />Run Extract</>}
          </Button>
        </div>
      </div>

    </div>
  );
}

// ─── Chat Output ──────────────────────────────────────────────────────────────

function ChatOutput() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! I can answer questions about your uploaded document. What would you like to know?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const send = () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages(p => [...p, { role: "user", text }]);
    setLoading(true);
    setTimeout(() => {
      setMessages(p => [...p, { role: "assistant", text: "Based on the document, I found relevant information related to your query. This is a demo response — upload a real document to get actual answers." }]);
      setLoading(false);
    }, 1200);
  };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[85%] text-xs leading-relaxed px-3.5 py-2.5 rounded-2xl",
              m.role === "user"
                ? "bg-gradient-to-br from-sky-500 to-blue-500 text-white rounded-br-sm"
                : "bg-slate-50 border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm"
            )}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-2.5 flex gap-1">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="flex items-center gap-2 px-4 py-3 border-t border-slate-100">
        <input
          className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-sky-200"
          placeholder="Ask something about the document…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
        />
        <Button
          size="sm"
          onClick={send}
          disabled={!input.trim() || loading}
          className="h-8 w-8 p-0 rounded-xl border-0 bg-gradient-to-br from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600"
        >
          <Send className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function EmptyOutput({ icon: Icon, color, title, desc, action, loading, disabled }) {
  const c = COLOR_MAP[color];
  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 p-8">
      <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center", c.light)}>
        <Icon className={cn("w-7 h-7", c.text)} />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-700">{title}</p>
        <p className="text-xs text-slate-400 mt-1 max-w-[220px] leading-relaxed">{desc}</p>
      </div>
      <Button
        size="sm"
        onClick={action}
        disabled={loading || disabled}
        className={cn("h-9 px-6 rounded-xl text-xs border-0 gap-2 bg-gradient-to-r", c.grad)}
      >
        {loading ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" />Running…</> : <><Zap className="w-3.5 h-3.5" />Run</>}
      </Button>
      {disabled && <p className="text-xs text-slate-300">Upload a document first</p>}
    </div>
  );
}

function ViewToggle({ value, onChange }) {
  return (
    <div className="flex bg-slate-100 rounded-lg p-0.5">
      {["blocks", "list"].includes(value)
        ? [["blocks", "Preview"], ["json", "JSON"]].map(([v, l]) => (
          <button key={v} onClick={() => onChange(v)} className={cn("px-2.5 py-1 rounded-md text-xs font-medium transition-all", value === v ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
            {l}
          </button>
        ))
        : [["list", "List"], ["json", "JSON"]].map(([v, l]) => (
          <button key={v} onClick={() => onChange(v)} className={cn("px-2.5 py-1 rounded-md text-xs font-medium transition-all", value === v ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
            {l}
          </button>
        ))
      }
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PlaygroundV3() {
  const [file, setFile] = useState(null);
  const [page, setPage] = useState(1);
  const [activeTool, setActiveTool] = useState("parse");

  const handleUpload = () => document.getElementById("pg3-upload").click();

  const tool = TOOLS.find(t => t.key === activeTool);
  const c = COLOR_MAP[tool.color];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">

      {/* ── Left: Tool Selector (vertical) ── */}
      <div className="w-[68px] flex-shrink-0 bg-white border-r border-slate-200 flex flex-col items-center py-4 gap-1 z-10">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mb-4 shadow-md shadow-indigo-200">
          <FileSearch2 className="w-4 h-4 text-white" />
        </div>
        {TOOLS.map(t => {
          const Icon = t.icon;
          const active = activeTool === t.key;
          const cc = COLOR_MAP[t.color];
          return (
            <button
              key={t.key}
              onClick={() => setActiveTool(t.key)}
              title={t.label}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all group relative",
                active ? cn("shadow-sm", cc.light) : "hover:bg-slate-50"
              )}
            >
              <Icon className={cn("w-4 h-4 transition-colors", active ? cc.text : "text-slate-400 group-hover:text-slate-600")} />
              {active && <div className={cn("absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full", cc.bg)} />}
            </button>
          );
        })}
      </div>

      {/* ── Center: Document Panel ── */}
      <div className="w-[280px] flex-shrink-0 border-r border-slate-200 flex flex-col overflow-hidden">
        <DocumentPanel file={file} page={page} setPage={setPage} onUpload={handleUpload} />
      </div>

      {/* ── Right: Tool Config + Output ── */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden">

        {/* Tool header bar */}
        <div className="flex items-center gap-3 px-5 py-3 bg-white border-b border-slate-200 flex-shrink-0">
          <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", c.light)}>
            {React.createElement(tool.icon, { className: cn("w-4 h-4", c.text) })}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{tool.label}</p>
            <p className="text-xs text-slate-400">{tool.desc}</p>
          </div>
        </div>

        {/* Panel body */}
        <div className="flex-1 overflow-hidden bg-white">
          {activeTool === "parse"   && <ParseOutput file={file} />}
          {activeTool === "split"   && <SplitOutput file={file} />}
          {activeTool === "extract" && <ExtractOutput file={file} />}
          {activeTool === "chat"    && <ChatOutput />}
          {activeTool === "compare" && (
            <div className="h-full overflow-auto">
              <ComparePanel defaultTool="parse" />
            </div>
          )}
        </div>
      </div>

      <input
        id="pg3-upload"
        type="file"
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={e => { if (e.target.files?.[0]) { setFile(e.target.files[0]); setPage(1); } }}
      />
    </div>
  );
}