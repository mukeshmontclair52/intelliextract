import React, { useState, useRef, useEffect } from "react";
import {
  Upload, FileText, Download, ChevronLeft, ChevronRight, Plus, Share2,
  Scissors, Scan, FileSearch2, MessageSquare, X, FileJson, RefreshCw,
  Copy, RotateCcw, Sparkles, FolderOpen, ChevronDown, Play, Trash2,
  Send, Mail, Zap, CheckCircle2, AlertCircle, Clock, ChevronUp,
  Layers, Settings2, Eye, Code2, ArrowRight, Wand2, ArrowLeftRight
} from "lucide-react";
import ComparePanel from "@/components/playground/ComparePanel";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ─── Constants ──────────────────────────────────────────────────────────────

const TOOLS = [
  { key: "parse",   label: "Parse",   icon: Scan,         gradient: "from-emerald-500 to-teal-500",   accent: "emerald" },
  { key: "split",   label: "Split",   icon: Scissors,     gradient: "from-rose-500 to-pink-500",      accent: "rose"    },
  { key: "extract", label: "Extract", icon: FileSearch2,  gradient: "from-violet-500 to-indigo-500",  accent: "violet"  },
  { key: "chat",    label: "Chat",    icon: MessageSquare,gradient: "from-sky-500 to-blue-500",       accent: "sky"     },
];

const MOCK_SPLIT_DOC_CONFIGS = [
  { id: 1, name: "K-1 Schedule Parser",    rules: ["Schedule of Investments", "Capital Account Summary", "Tax Information"] },
  { id: 2, name: "Fund Report Splitter",   rules: ["Equity Report", "Fixed Income", "Alternative Investment", "Mixed Asset"] },
  { id: 3, name: "Quarterly Extractor",    rules: ["Executive Summary", "Financial Statements", "Risk Disclosures"] },
];

const MOCK_SPLIT_RESULTS = [
  { title: "uncategorized",                  tags: [],       pages: "1"     },
  { title: "1099 Consolidated Tax Statement", tags: ["2025"], pages: "2-3"   },
  { title: "uncategorized",                  tags: [],       pages: "4"     },
  { title: "1099 Consolidated Tax Statement", tags: ["2025"], pages: "5-12"  },
  { title: "uncategorized",                  tags: [],       pages: "13"    },
  { title: "1099 Consolidated Tax Statement", tags: ["2025"], pages: "14-24" },
];

const MOCK_PARSE_BLOCKS = [
  { id: 1, type: "Heading", content: "Step-by-Step Instructions for Rollover Contributions", isHeading: true },
  { id: 2, type: "Paragraph", content: "The JPMorgan Chase 401(k) Savings Plan offers you the opportunity to roll over the distribution you receive from your previous employer or IRA. The following instructions are designed to help you through this process." },
  { id: 3, type: "Paragraph", content: "Direct Rollover: Your previous plan or annuity makes the distribution check payable directly to JPMorgan Chase 401(k) Savings Plan.\n\nRegular 60-Day Rollover: Your previous plan or annuity makes the distribution check payable to you." },
  { id: 4, type: "Paragraph", content: "Complete the Participant Information section of the Incoming Rollover Election form. Complete the Rollover Information section choosing Direct Rollover and the applicable Internal Revenue Code plan type." },
];

const MOCK_DOC_CONFIGS = [
  { id: 1, name: "Invoice Processing",  prompt: "Extract invoice number, vendor name, total amount, line items, and due date." },
  { id: 2, name: "Tax Statement",       prompt: "Extract account number, tax year, income totals, dividends, and tax withheld." },
  { id: 3, name: "KYC Document",        prompt: "Extract full name, date of birth, address, ID number, and expiry date." },
  { id: 4, name: "Bank Statement",      prompt: "Extract account holder, account number, statement period, and transactions." },
];

// ─── Shared UI Atoms ─────────────────────────────────────────────────────────

function GlassCard({ children, className }) {
  return (
    <div className={cn("bg-white/70 backdrop-blur-sm border border-white/80 shadow-sm rounded-2xl", className)}>
      {children}
    </div>
  );
}

function PillToggle({ options, value, onChange }) {
  return (
    <div className="flex gap-0.5 bg-slate-100/80 rounded-xl p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-3 py-1 rounded-lg text-xs font-medium transition-all",
            value === opt.value
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── Empty / Doc Viewer ───────────────────────────────────────────────────────

function EmptyDocViewer({ onUpload }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center m-4">
      <div className="relative group cursor-pointer" onClick={onUpload}>
        <div className="w-48 h-64 bg-gradient-to-b from-slate-100 to-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <Upload className="w-6 h-6 text-white" />
          </div>
          <div className="text-center px-4">
            <p className="text-sm font-semibold text-slate-700">Drop a file here</p>
            <p className="text-xs text-slate-400 mt-1">PDF, PNG or JPEG</p>
          </div>
        </div>
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="text-xs text-slate-400 bg-white border border-slate-200 rounded-full px-3 py-1 shadow-sm">
            or click to browse
          </span>
        </div>
      </div>
    </div>
  );
}

function DocViewer({ file, page, totalPages, onPageChange }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-7 h-7 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center">
            <FileText className="w-3.5 h-3.5 text-red-500" />
          </div>
          <span className="font-medium text-slate-700 truncate max-w-[160px] text-xs">{file.name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="w-6 h-6 rounded-lg hover:bg-slate-100 flex items-center justify-center disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-slate-500" />
          </button>
          <span className="text-xs text-slate-500 font-medium min-w-[40px] text-center">{page} / {totalPages}</span>
          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="w-6 h-6 rounded-lg hover:bg-slate-100 flex items-center justify-center disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </button>
          <button className="w-6 h-6 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 ml-1">
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto flex items-start justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-sm min-h-[500px] flex flex-col items-center justify-center text-slate-200 border border-slate-100">
          <FileText className="w-10 h-10 mb-2 opacity-20" />
          <p className="text-xs text-slate-400">{file.name}</p>
          <p className="text-xs text-slate-300 mt-1">Page {page}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Tool Panels ─────────────────────────────────────────────────────────────

function ParsePanel() {
  const [viewMode, setViewMode] = useState("preview");
  const [engine, setEngine] = useState("docling");
  const [confidence, setConfidence] = useState(true);
  const [running, setRunning] = useState(false);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-white/80 backdrop-blur-sm flex-shrink-0">
        <PillToggle
          options={[{ value: "preview", label: "Preview" }, { value: "json", label: "JSON" }]}
          value={viewMode}
          onChange={setViewMode}
        />
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400">Confidence</span>
            <button
              onClick={() => setConfidence(!confidence)}
              className={cn("relative rounded-full transition-colors flex-shrink-0", confidence ? "bg-emerald-500" : "bg-slate-200")}
              style={{ height: "16px", width: "28px" }}
            >
              <span className={cn("absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform", confidence && "translate-x-3")} />
            </button>
          </div>
          <select
            value={engine}
            onChange={(e) => setEngine(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1 bg-white text-slate-600 outline-none focus:ring-2 focus:ring-emerald-200"
          >
            <option value="docling">Docling</option>
            <option value="fast-parse">Fast Parse</option>
          </select>
          <button className="text-slate-400 hover:text-slate-600 transition-colors"><Copy className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-slate-50/30">
        {viewMode === "preview" ? (
          <div className="p-5 space-y-3">
            {MOCK_PARSE_BLOCKS.map((block) => (
              <div key={block.id} className="group">
                <GlassCard className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-100 rounded-md px-2 py-0.5">
                      {block.type}
                    </span>
                    {confidence && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 rounded-md px-2 py-0.5">
                        {Math.floor(92 + Math.random() * 7)}% confidence
                      </span>
                    )}
                  </div>
                  <p className={cn("text-sm text-slate-700 leading-relaxed whitespace-pre-wrap", block.isHeading && "font-bold text-base text-slate-800")}>
                    {block.content}
                  </p>
                </GlassCard>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 h-full">
            <pre className="text-xs font-mono text-emerald-300 bg-slate-950 rounded-2xl p-5 overflow-auto h-full leading-relaxed">
              {JSON.stringify(MOCK_PARSE_BLOCKS.map(b => ({ id: b.id, type: b.type, content: b.content })), null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-white/80 flex-shrink-0">
        <Button variant="outline" size="sm" className="text-xs h-8 rounded-xl gap-1.5">
          <RotateCcw className="w-3 h-3" /> Re-parse
        </Button>
        <Button
          size="sm"
          onClick={() => { setRunning(true); setTimeout(() => setRunning(false), 1500); }}
          disabled={running}
          className="h-8 rounded-xl text-xs bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 border-0 gap-1.5 shadow-sm shadow-emerald-200"
        >
          {running ? <><RefreshCw className="w-3 h-3 animate-spin" />Parsing…</> : <><Zap className="w-3 h-3" />Run Parse</>}
        </Button>
      </div>
    </div>
  );
}

function SplitPanel() {
  const [showDocPicker, setShowDocPicker] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [rules, setRules] = useState([]);
  const [newRule, setNewRule] = useState({ title: "", description: "" });
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [viewMode, setViewMode] = useState("list");

  const handleSelectConfig = (cfg) => {
    setSelectedConfig(cfg);
    setRules(cfg.rules.map((r, i) => ({ id: i, title: r, description: "" })));
    setShowDocPicker(false);
  };

  const addRule = () => {
    const title = newRule.title.trim();
    if (!title) return;
    setRules(p => [...p, { id: Date.now(), title, description: newRule.description.trim() }]);
    setNewRule({ title: "", description: "" });
  };

  const handleRun = () => {
    setRunning(true);
    setTimeout(() => { setRunning(false); setResults(MOCK_SPLIT_RESULTS); }, 1600);
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {results ? (
        // Results view
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-white/80 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-slate-600">{results.length} segments found</span>
            </div>
            <div className="flex items-center gap-2">
              <PillToggle
                options={[{ value: "list", label: "List" }, { value: "json", label: "JSON" }]}
                value={viewMode}
                onChange={setViewMode}
              />
              <button className="text-slate-400 hover:text-slate-600"><Download className="w-3.5 h-3.5" /></button>
              <button onClick={() => setResults(null)} className="text-slate-400 hover:text-rose-500 transition-colors"><X className="w-3.5 h-3.5" /></button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4">
            {viewMode === "list" ? (
              <div className="space-y-2">
                {results.map((r, i) => (
                  <GlassCard key={i} className={cn("px-4 py-3 flex items-center justify-between", r.title === "uncategorized" && "opacity-60")}>
                    <div className="flex items-center gap-2.5">
                      <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", r.title === "uncategorized" ? "bg-slate-300" : "bg-rose-400")} />
                      <span className={cn("text-sm font-medium", r.title === "uncategorized" ? "text-slate-400 italic" : "text-slate-700")}>
                        {r.title}
                      </span>
                      {r.tags.map(t => (
                        <Badge key={t} className="bg-rose-50 text-rose-600 border-rose-100 text-[10px] px-1.5">{t}</Badge>
                      ))}
                    </div>
                    <span className="text-xs font-mono text-slate-400 bg-slate-100 rounded-md px-2 py-0.5">p. {r.pages}</span>
                  </GlassCard>
                ))}
              </div>
            ) : (
              <pre className="text-xs font-mono text-rose-300 bg-slate-950 rounded-2xl p-5 overflow-auto h-full leading-relaxed">
                {JSON.stringify(results, null, 2)}
              </pre>
            )}
          </div>
        </div>
      ) : (
        // Config view
        <>
          <div className="px-4 pt-4 pb-3 border-b border-slate-100 flex-shrink-0 bg-white/50">
            <h3 className="text-sm font-semibold text-slate-700">Split Rules</h3>
            <p className="text-xs text-slate-400 mt-0.5">Configure how your document should be segmented.</p>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-3">
            {/* Config picker */}
            <GlassCard className="overflow-hidden">
              <button
                onClick={() => setShowDocPicker(!showDocPicker)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-white/60 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-rose-400" />
                  <span className={cn("font-medium text-sm", selectedConfig ? "text-rose-600" : "text-slate-600")}>
                    {selectedConfig ? selectedConfig.name : "Load from Document Config"}
                  </span>
                </div>
                <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", showDocPicker && "rotate-180")} />
              </button>
              {showDocPicker && (
                <div className="border-t border-slate-100">
                  {MOCK_SPLIT_DOC_CONFIGS.map(cfg => (
                    <button
                      key={cfg.id}
                      onClick={() => handleSelectConfig(cfg)}
                      className={cn("w-full text-left px-4 py-2.5 text-sm hover:bg-rose-50/50 transition-colors flex items-center justify-between", selectedConfig?.id === cfg.id && "bg-rose-50")}
                    >
                      <div>
                        <p className={cn("font-medium text-xs", selectedConfig?.id === cfg.id ? "text-rose-700" : "text-slate-700")}>{cfg.name}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{cfg.rules.length} rules</p>
                      </div>
                      {selectedConfig?.id === cfg.id && <CheckCircle2 className="w-3.5 h-3.5 text-rose-500" />}
                    </button>
                  ))}
                </div>
              )}
            </GlassCard>

            {/* Rules */}
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-0.5">
                Rules {rules.length > 0 && `· ${rules.length}`}
              </p>
              <div className="space-y-1.5">
                {rules.map(rule => (
                  <GlassCard key={rule.id} className="flex items-center gap-2.5 px-3.5 py-2.5">
                    <Scissors className="w-3 h-3 text-rose-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-700 truncate">{rule.title}</p>
                      {rule.description && <p className="text-[11px] text-slate-400 truncate">{rule.description}</p>}
                    </div>
                    <button onClick={() => setRules(p => p.filter(r => r.id !== rule.id))} className="text-slate-300 hover:text-rose-400 transition-colors flex-shrink-0">
                      <X className="w-3 h-3" />
                    </button>
                  </GlassCard>
                ))}

                {/* Add rule */}
                <div className="bg-slate-50/70 rounded-xl border border-slate-200/70 p-3 space-y-2">
                  <input
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-rose-200"
                    placeholder="Rule title…"
                    value={newRule.title}
                    onChange={e => setNewRule(p => ({ ...p, title: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && addRule()}
                  />
                  <input
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-rose-200"
                    placeholder="Description (optional)"
                    value={newRule.description}
                    onChange={e => setNewRule(p => ({ ...p, description: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && addRule()}
                  />
                  <button
                    onClick={addRule}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Add Rule
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end px-4 py-3 border-t border-slate-100 bg-white/80 flex-shrink-0">
            <Button
              size="sm"
              onClick={handleRun}
              disabled={running || rules.length === 0}
              className="h-8 rounded-xl text-xs bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 border-0 gap-1.5 shadow-sm shadow-rose-200"
            >
              {running ? <><RefreshCw className="w-3 h-3 animate-spin" />Running…</> : <><Zap className="w-3 h-3" />Run Split</>}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function ExtractPanel({ onRunExtract }) {
  const [mode, setMode] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [showDocPicker, setShowDocPicker] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);

  const handleSelectConfig = (cfg) => {
    setSelectedConfig(cfg);
    setPrompt(cfg.prompt);
    setMode("prompt");
    setShowDocPicker(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-3 border-b border-slate-100 bg-white/50 flex-shrink-0">
        <h3 className="text-sm font-semibold text-slate-700">Extraction Schema</h3>
        <p className="text-xs text-slate-400 mt-0.5">Define what data to extract from your document.</p>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-3">
        {/* Config picker */}
        <GlassCard className="overflow-hidden">
          <button
            onClick={() => setShowDocPicker(!showDocPicker)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-white/60 transition-colors"
          >
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-violet-400" />
              <span className={cn("font-medium text-sm", selectedConfig ? "text-violet-600" : "text-slate-600")}>
                {selectedConfig ? selectedConfig.name : "Load from Document Config"}
              </span>
            </div>
            <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", showDocPicker && "rotate-180")} />
          </button>
          {showDocPicker && (
            <div className="border-t border-slate-100">
              {MOCK_DOC_CONFIGS.map(cfg => (
                <button
                  key={cfg.id}
                  onClick={() => handleSelectConfig(cfg)}
                  className={cn("w-full text-left px-4 py-2.5 text-sm hover:bg-violet-50/50 transition-colors", selectedConfig?.id === cfg.id && "bg-violet-50")}
                >
                  <p className={cn("font-medium text-xs", selectedConfig?.id === cfg.id ? "text-violet-700" : "text-slate-700")}>{cfg.name}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">{cfg.prompt}</p>
                </button>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Generate with AI */}
        <GlassCard className={cn("overflow-hidden transition-all", mode === "prompt" && "ring-2 ring-violet-200")}>
          <button
            onClick={() => setMode(mode === "prompt" ? null : "prompt")}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/60 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                <Wand2 className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-700">Generate with AI</span>
            </div>
            <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", mode === "prompt" && "rotate-180")} />
          </button>
          {mode === "prompt" && (
            <div className="px-4 pb-4 space-y-3 border-t border-slate-100">
              <p className="text-xs text-violet-600 pt-3">Schema generation uses the first 10 pages of your document.</p>
              <textarea
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-violet-200 resize-none"
                rows={3}
                placeholder="Describe the fields you need (e.g. invoice number, date, total amount)."
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
              />
              <Button
                onClick={() => { setGenerating(true); setTimeout(() => setGenerating(false), 2000); }}
                disabled={generating || !prompt.trim()}
                className="w-full text-xs h-8 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 border-0 gap-1.5"
              >
                {generating ? <><RefreshCw className="w-3 h-3 animate-spin" />Generating…</> : <><Sparkles className="w-3 h-3" />Generate Schema</>}
              </Button>
            </div>
          )}
        </GlassCard>

        {/* Upload JSON */}
        <button
          onClick={() => setMode("json")}
          className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 text-sm font-medium transition-all", mode === "json" ? "border-violet-300 bg-violet-50/50 text-violet-700" : "border-slate-200/70 bg-white/50 text-slate-500 hover:border-slate-300 hover:bg-white/70")}
        >
          <Code2 className="w-4 h-4" /> Upload JSON Schema
        </button>

        {/* Scratch */}
        <button
          onClick={() => setMode("scratch")}
          className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 text-sm font-medium transition-all", mode === "scratch" ? "border-violet-300 bg-violet-50/50 text-violet-700" : "border-slate-200/70 bg-white/50 text-slate-500 hover:border-slate-300 hover:bg-white/70")}
        >
          <Plus className="w-4 h-4" /> Start from Scratch
        </button>
      </div>

      <div className="flex items-center justify-end px-4 py-3 border-t border-slate-100 bg-white/80 flex-shrink-0">
        <Button
          size="sm"
          onClick={onRunExtract}
          className="h-8 rounded-xl text-xs bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 border-0 gap-1.5 shadow-sm shadow-violet-200"
        >
          <Zap className="w-3 h-3" /> Run Extract
        </Button>
      </div>
    </div>
  );
}

function ChatPanel() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! I can answer questions about your uploaded document. What would you like to know?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const sendMessage = () => {
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
    <div className="flex flex-col h-full bg-slate-50/30">
      <div className="px-4 py-2.5 border-b border-slate-100 bg-white/80 flex items-center gap-2 flex-shrink-0">
        <div className="w-2 h-2 rounded-full bg-sky-400" />
        <span className="text-xs font-semibold text-slate-600">Document Chat</span>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[85%] text-xs leading-relaxed px-3.5 py-2.5 rounded-2xl", m.role === "user" ? "bg-gradient-to-br from-sky-500 to-blue-500 text-white rounded-br-md" : "bg-white border border-slate-200 text-slate-700 rounded-bl-md shadow-sm")}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-2.5 shadow-sm flex gap-1">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="flex items-center gap-2 px-4 py-3 border-t border-slate-100 bg-white/80 flex-shrink-0">
        <input
          className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-sky-200"
          placeholder="Ask something about the document…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
        />
        <Button
          size="sm"
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          className="h-8 w-8 p-0 rounded-xl bg-gradient-to-br from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 border-0 shadow-sm shadow-sky-200"
        >
          <Send className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PlaygroundV2() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [activeTool, setActiveTool] = useState("parse");
  const [page, setPage] = useState(1);
  const [leftPct, setLeftPct] = useState(40);
  const containerRef = useRef(null);
  const dragging = useRef(false);

  const handleUpload = () => document.getElementById("pg2-upload").click();

  const onMouseDown = (e) => {
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setLeftPct(Math.min(70, Math.max(25, pct)));
    };
    const onUp = () => {
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, []);

  const activeMeta = TOOLS.find(t => t.key === activeTool);

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: "linear-gradient(135deg, #f8faff 0%, #f1f5fb 100%)" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-white/80 backdrop-blur-sm border-b border-slate-200/70 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          {TOOLS.map(tool => {
            const Icon = tool.icon;
            const active = activeTool === tool.key;
            return (
              <button
                key={tool.key}
                onClick={() => setActiveTool(tool.key)}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all",
                  active
                    ? `bg-gradient-to-r ${tool.gradient} text-white shadow-sm`
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/70"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {tool.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleUpload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors bg-white"
          >
            <Upload className="w-3 h-3" />
            {file ? "Replace file" : "Upload file"}
          </button>
          <button className="w-7 h-7 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div ref={containerRef} className="flex flex-1 min-h-0 relative">
        {/* Left: Doc viewer */}
        <div className="flex flex-col min-h-0 overflow-hidden" style={{ width: `${leftPct}%` }}>
          {file
            ? <DocViewer file={file} page={page} totalPages={7} onPageChange={setPage} />
            : <EmptyDocViewer onUpload={handleUpload} />
          }
        </div>

        {/* Drag handle */}
        <div
          onMouseDown={onMouseDown}
          className="w-1 flex-shrink-0 bg-slate-200/60 hover:bg-indigo-400 cursor-col-resize transition-colors relative group"
        >
          <div className="absolute inset-y-0 -left-2 -right-2" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-1">
            <div className="w-0.5 h-4 bg-slate-300 rounded-full group-hover:bg-indigo-300 transition-colors" />
          </div>
        </div>

        {/* Right: Tool panel */}
        <div
          className="flex flex-col min-h-0 overflow-hidden rounded-tl-2xl"
          style={{ width: `${100 - leftPct}%`, background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)", borderLeft: "1px solid rgba(226,232,240,0.6)" }}
        >
          {activeTool === "parse"   && <ParsePanel />}
          {activeTool === "split"   && <SplitPanel />}
          {activeTool === "extract" && <ExtractPanel onRunExtract={() => navigate(createPageUrl("ExtractionResult"))} />}
          {activeTool === "chat"    && <ChatPanel />}
        </div>
      </div>

      <input
        id="pg2-upload"
        type="file"
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={(e) => { if (e.target.files?.[0]) { setFile(e.target.files[0]); setPage(1); } }}
      />
    </div>
  );
}