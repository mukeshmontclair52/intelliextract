import React, { useState, useRef, useEffect } from "react";
import { Upload, FileText, Download, ChevronLeft, ChevronRight, Plus, Share2, Scissors, Scan, FileSearch2, MessageSquare, X, FileJson, RefreshCw, Copy, RotateCcw, Sparkles, FolderOpen, ChevronDown, Play, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TOOLS = [
  { key: "parse", label: "Parse", icon: Scan, color: "text-emerald-600", activeColor: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { key: "split", label: "Split", icon: Scissors, color: "text-rose-500", activeColor: "bg-rose-50 text-rose-700 border-rose-200", preview: true },
  { key: "extract", label: "Extract", icon: FileSearch2, color: "text-slate-600", activeColor: "bg-slate-100 text-slate-700 border-slate-200" },
  { key: "chat", label: "Chat", icon: MessageSquare, color: "text-slate-600", activeColor: "bg-slate-100 text-slate-700 border-slate-200" },
];

const MOCK_SPLIT_DOC_CONFIGS = [
  { id: 1, name: "K-1 Schedule Parser", rules: ["Schedule of Investments", "Capital Account Summary", "Tax Information"] },
  { id: 2, name: "Fund Report Splitter", rules: ["Equity Report", "Fixed Income", "Alternative Investment", "Mixed Asset"] },
  { id: 3, name: "Quarterly Extractor", rules: ["Executive Summary", "Financial Statements", "Risk Disclosures"] },
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

const MOCK_SPLIT_RESULTS = [
  { title: "uncategorized", tags: [], pages: "1" },
  { title: "1099 Consolidated Tax Statement", tags: ["2025"], pages: "2-3" },
  { title: "uncategorized", tags: [], pages: "4" },
  { title: "1099 Consolidated Tax Statement", tags: ["2025"], pages: "5-12" },
  { title: "uncategorized", tags: [], pages: "13" },
  { title: "1099 Consolidated Tax Statement", tags: ["2025"], pages: "14-24" },
];

function SplitResultPanel({ results, onReset }) {
  const [viewMode, setViewMode] = useState("list");
  return (
    <div className="flex flex-col h-full border-l border-slate-200">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-white flex-shrink-0">
        <div className="flex gap-0.5 bg-slate-100 rounded-lg p-0.5">
          {[{ key: "list", icon: "☰" }, { key: "json", icon: "{}" }].map((m) => (
            <button
              key={m.key}
              onClick={() => setViewMode(m.key)}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-all",
                viewMode === m.key ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {m.icon}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button className="text-slate-400 hover:text-slate-600"><Download className="w-4 h-4" /></button>
          <button onClick={onReset} className="text-slate-400 hover:text-slate-600" title="Close"><X className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-3 space-y-2">
        {viewMode === "list" ? results.map((r, i) => (
          <div key={i} className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2">
              <span className={cn("text-sm font-medium", r.title === "uncategorized" ? "text-slate-500" : "text-slate-800")}>{r.title}</span>
              {r.tags.map((t) => (
                <span key={t} className="text-xs text-indigo-500 font-medium">{t}</span>
              ))}
            </div>
            <span className="text-xs text-rose-500 font-medium">page {r.pages}</span>
          </div>
        )) : (
          <pre className="text-xs font-mono text-slate-100 bg-slate-950 rounded-lg p-4 overflow-auto h-full">
            {JSON.stringify(results.map(r => ({ title: r.title, tags: r.tags, pages: r.pages })), null, 2)}
          </pre>
        )}
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

  const handleSelectConfig = (cfg) => {
    setSelectedConfig(cfg);
    setRules(cfg.rules.map((r, i) => ({ id: i, title: r, description: "" })));
    setShowDocPicker(false);
  };

  const addRule = () => {
    const title = newRule.title.trim();
    if (!title) return;
    setRules((prev) => [...prev, { id: Date.now(), title, description: newRule.description.trim() }]);
    setNewRule({ title: "", description: "" });
  };

  const removeRule = (id) => setRules((prev) => prev.filter((r) => r.id !== id));

  const handleRun = () => {
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      setResults(MOCK_SPLIT_RESULTS);
    }, 1500);
  };

  return (
    <div className="flex h-full min-h-0">
      {/* Config panel */}
      <div className={cn("flex flex-col min-h-0", results ? "w-1/2 border-r border-slate-200" : "w-full")}>
        <div className="px-5 pt-5 pb-3 border-b border-slate-100 flex-shrink-0">
          <h2 className="text-base font-semibold text-slate-800">Split Rules</h2>
          <p className="text-xs text-slate-400 mt-0.5">Pick from a document config or define rules manually.</p>
        </div>

        <div className="flex-1 overflow-auto p-5 space-y-4">
          {/* Pick from Document Config */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowDocPicker(!showDocPicker)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-rose-500" />
                <span className="font-medium">
                  {selectedConfig ? (
                    <span>Using: <span className="text-rose-600">{selectedConfig.name}</span></span>
                  ) : "Pick from Document Config"}
                </span>
              </div>
              <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", showDocPicker && "rotate-180")} />
            </button>
            {showDocPicker && (
              <div className="border-t border-slate-100 divide-y divide-slate-100">
                {MOCK_SPLIT_DOC_CONFIGS.map((cfg) => (
                  <button
                    key={cfg.id}
                    onClick={() => handleSelectConfig(cfg)}
                    className={cn("w-full text-left px-4 py-3 text-sm hover:bg-slate-50 transition-colors", selectedConfig?.id === cfg.id && "bg-rose-50")}
                  >
                    <p className={cn("font-medium", selectedConfig?.id === cfg.id ? "text-rose-700" : "text-slate-700")}>{cfg.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{cfg.rules.length} rules</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Rules list */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Split Rules {rules.length > 0 && `(${rules.length})`}
            </p>
            {rules.map((rule) => (
              <div key={rule.id} className="flex items-start gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2.5">
                <Scissors className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700">{rule.title}</p>
                  {rule.description && <p className="text-xs text-slate-400 mt-0.5">{rule.description}</p>}
                </div>
                <button onClick={() => removeRule(rule.id)} className="text-slate-300 hover:text-rose-500 transition-colors flex-shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {rules.length === 0 && (
              <p className="text-xs text-slate-400 italic py-2">No rules defined yet.</p>
            )}

            {/* Add new rule */}
            <div className="border border-slate-200 rounded-lg p-3 space-y-2 bg-slate-50">
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-300 placeholder:text-slate-400 bg-white"
                placeholder="Rule title (required)"
                value={newRule.title}
                onChange={(e) => setNewRule((p) => ({ ...p, title: e.target.value }))}
              />
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-300 placeholder:text-slate-400 bg-white"
                placeholder="Description (optional)"
                value={newRule.description}
                onChange={(e) => setNewRule((p) => ({ ...p, description: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRule())}
              />
              <Button variant="outline" size="sm" onClick={addRule} className="w-full h-8 text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" />Add Rule
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-4 py-2.5 flex justify-end bg-white flex-shrink-0">
          <Button
            size="sm"
            className="bg-rose-600 hover:bg-rose-700 text-xs h-7"
            onClick={handleRun}
            disabled={running || rules.length === 0}
          >
            {running ? (
              <><RefreshCw className="w-3 h-3 mr-1 animate-spin" />Running…</>
            ) : (
              <><Play className="w-3 h-3 mr-1" />Run Split</>
            )}
          </Button>
        </div>
      </div>

      {/* Results panel */}
      {results && (
        <div className="w-1/2 flex flex-col min-h-0">
          <SplitResultPanel results={results} onReset={() => setResults(null)} />
        </div>
      )}
    </div>
  );
}

const MOCK_PARSE_BLOCKS = [
  {
    id: 1,
    type: "Text",
    content: "Step-by-Step Instructions for Rollover Contributions",
    isHeading: true,
  },
  {
    id: 2,
    type: "Text",
    content: "The JPMorgan Chase 401(k) Savings Plan offers you the opportunity to \"roll over\" the distribution you receive from your previous employer or IRA or the JPMorgan Chase Retirement Plan (after you terminate employment with the firm). The following information and instructions are designed to help you through this process. If you have any questions, please contact the 401(k) Savings Plan Call Center.",
  },
  {
    id: 3,
    type: "Text",
    content: "Determine Whether Your Contribution Is a Direct Rollover or a Regular 60-Day Rollover.\n\n**Direct Rollover:** Your previous plan or annuity makes the distribution check payable directly to JPMorgan Chase 401(k) Savings Plan.\n\n**Regular 60-Day Rollover:** Your previous plan or annuity makes the distribution check payable to you.",
  },
  {
    id: 4,
    type: "Text",
    content: "If You Are Electing a Direct Rollover\n\nComplete the Participant Information section of the Incoming Rollover Election form.\nComplete the Rollover Information section choosing Direct Rollover and the applicable Internal Revenue Code (\"Code\") plan type on the form.\nIf you are rolling over after-tax contributions, cost basis, earnings or pre-1987 after-tax cost basis, please indicate the amounts on Page 5. Please contact your previous Plan Administrator if you need assistance.",
  },
];

function ParsePanel() {
  const [viewMode, setViewMode] = useState("markdown");
  const [engine, setEngine] = useState("docling");
  const [confidence, setConfidence] = useState(true);
  const [hasRun, setHasRun] = useState(true);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-white flex-shrink-0">
        <div className="flex gap-0.5 bg-slate-100 rounded-lg p-0.5">
          {["Markdown", "JSON"].map((m) => (
            <button
              key={m}
              onClick={() => setViewMode(m.toLowerCase())}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-all",
                viewMode === m.toLowerCase() ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {m}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Confidence</span>
          <button
            onClick={() => setConfidence(!confidence)}
            className={cn("relative w-8 h-4.5 rounded-full transition-colors", confidence ? "bg-indigo-500" : "bg-slate-200")}
            style={{ height: "18px", width: "32px" }}
          >
            <span className={cn("absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-transform", confidence && "translate-x-3.5")} />
          </button>
          <select
            value={engine}
            onChange={(e) => setEngine(e.target.value)}
            className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-white text-slate-600 outline-none"
          >
            <option value="docling">Docling</option>
            <option value="fast-parse">Fast Parse</option>
          </select>
          <button className="text-slate-400 hover:text-slate-600"><RefreshCw className="w-3.5 h-3.5" /></button>
          <button className="text-slate-400 hover:text-slate-600"><Copy className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-white">
        {viewMode === "markdown" ? (
          <div className="p-4 space-y-4">
            {MOCK_PARSE_BLOCKS.map((block) => (
              <div key={block.id} className="group relative">
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5 text-[10px] text-slate-400 font-mono bg-slate-100 rounded px-1.5 py-0.5 select-none">
                    {block.id} · {block.type}
                  </span>
                  {confidence && (
                    <span className="flex-shrink-0 mt-0.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 rounded px-1.5 py-0.5 select-none">
                      {Math.floor(92 + Math.random() * 7)}%
                    </span>
                  )}
                </div>
                <div className={cn("mt-2 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap pl-0", block.isHeading && "font-bold text-base")}>
                  {block.content}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <pre className="p-4 text-xs font-mono text-slate-700 bg-slate-950 text-slate-100 h-full overflow-auto">
{JSON.stringify(MOCK_PARSE_BLOCKS.map(b => ({ id: b.id, type: b.type, content: b.content })), null, 2)}
          </pre>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 px-4 py-2.5 flex items-center justify-between bg-white flex-shrink-0">
        <Button variant="outline" size="sm" className="text-xs h-7">
          <RotateCcw className="w-3 h-3 mr-1" />Re-parse
        </Button>
        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs h-7">
          <Scan className="w-3 h-3 mr-1" />Run Parse
        </Button>
      </div>
    </div>
  );
}

const MOCK_DOC_CONFIGS = [
  { id: 1, name: "Invoice Processing", prompt: "Extract invoice number, vendor name, total amount, line items, and due date." },
  { id: 2, name: "Tax Statement", prompt: "Extract account number, tax year, income totals, dividends, and tax withheld." },
  { id: 3, name: "KYC Document", prompt: "Extract full name, date of birth, address, ID number, and expiry date." },
  { id: 4, name: "Bank Statement", prompt: "Extract account holder, account number, statement period, opening and closing balance, and transactions." },
];

function ExtractPanel({ onRunExtract }) {
  const [mode, setMode] = useState(null); // null | "prompt" | "json" | "scratch" | "docconfig"
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [showDocPicker, setShowDocPicker] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => setGenerating(false), 2000);
  };

  const handleSelectConfig = (cfg) => {
    setSelectedConfig(cfg);
    setPrompt(cfg.prompt);
    setMode("prompt");
    setShowDocPicker(false);
  };

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-slate-100 flex-shrink-0">
        <h2 className="text-base font-semibold text-slate-800 mb-1">Schema</h2>
      </div>

      <div className="flex-1 overflow-auto p-5 space-y-3">

        {/* Pick from Document Config */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowDocPicker(!showDocPicker)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-indigo-500" />
              <span className="font-medium">
                {selectedConfig ? (
                  <span>Using: <span className="text-indigo-600">{selectedConfig.name}</span></span>
                ) : (
                  "Pick from Document Config"
                )}
              </span>
            </div>
            <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", showDocPicker && "rotate-180")} />
          </button>
          {showDocPicker && (
            <div className="border-t border-slate-100 divide-y divide-slate-100">
              {MOCK_DOC_CONFIGS.map((cfg) => (
                <button
                  key={cfg.id}
                  onClick={() => handleSelectConfig(cfg)}
                  className={cn(
                    "w-full text-left px-4 py-3 text-sm hover:bg-slate-50 transition-colors",
                    selectedConfig?.id === cfg.id && "bg-indigo-50"
                  )}
                >
                  <p className={cn("font-medium", selectedConfig?.id === cfg.id ? "text-indigo-700" : "text-slate-700")}>{cfg.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{cfg.prompt}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Generate with prompt */}
        <div
          className={cn(
            "rounded-xl border-2 transition-all",
            mode === "prompt" ? "border-indigo-300 bg-indigo-50/40" : "border-slate-200 bg-white"
          )}
        >
          <button
            onClick={() => setMode(mode === "prompt" ? null : "prompt")}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-700"
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            Write a Schema Prompt
          </button>
          {mode === "prompt" && (
            <div className="px-4 pb-4 space-y-3">
              <p className="text-xs text-indigo-600">Schema generation uses the first 10 pages of your document.</p>
              <textarea
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                rows={4}
                placeholder="Describe the fields you need (e.g. invoice number, date, total amount)."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <Button
                onClick={handleGenerate}
                disabled={generating || !prompt.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-sm"
              >
                {generating ? (
                  <><RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />Generating…</>
                ) : (
                  <><Sparkles className="w-3.5 h-3.5 mr-2" />Generate Schema</>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Upload JSON */}
        <button
          onClick={() => setMode("json")}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all",
            mode === "json" ? "border-indigo-300 bg-indigo-50/40 text-indigo-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
          )}
        >
          <FileJson className="w-4 h-4 text-slate-400" />
          Upload JSON Schema
        </button>

        {/* Start from Scratch */}
        <button
          onClick={() => setMode("scratch")}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all",
            mode === "scratch" ? "border-indigo-300 bg-indigo-50/40 text-indigo-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
          )}
        >
          <Plus className="w-4 h-4 text-slate-400" />
          Start from Scratch
        </button>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 px-4 py-2.5 flex justify-end bg-white flex-shrink-0">
        <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-xs h-7" onClick={onRunExtract}>
          <FileSearch2 className="w-3 h-3 mr-1" />Run Extract
        </Button>
      </div>
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
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [activeTool, setActiveTool] = useState("split");
  const [page, setPage] = useState(1);
  // leftPct: percentage of total width for the doc panel (35–75%)
  const [leftPct, setLeftPct] = useState(38);
  const containerRef = useRef(null);
  const dragging = useRef(false);

  const handleUpload = () => document.getElementById("playground-upload").click();

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

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
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
      <div ref={containerRef} className="flex flex-1 min-h-0 relative">
        {/* Left: Doc area */}
        <div className="flex flex-col min-h-0 overflow-hidden" style={{ width: `${leftPct}%` }}>
          {file ? (
            <DocViewer file={file} page={page} totalPages={7} onPageChange={setPage} />
          ) : (
            <EmptyDocViewer onUpload={handleUpload} />
          )}
        </div>

        {/* Drag handle */}
        <div
          onMouseDown={onMouseDown}
          className="w-1.5 flex-shrink-0 bg-slate-200 hover:bg-indigo-400 cursor-col-resize transition-colors relative group"
        >
          <div className="absolute inset-y-0 -left-1 -right-1" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-0.5">
            <div className="w-0.5 h-3 bg-slate-400 rounded-full group-hover:bg-indigo-200" />
            <div className="w-0.5 h-3 bg-slate-400 rounded-full group-hover:bg-indigo-200" />
          </div>
        </div>

        {/* Right: Tool Panel */}
        <div className="flex flex-col min-h-0 bg-white overflow-hidden" style={{ width: `${100 - leftPct}%` }}>
          {activeTool === "split" && <SplitPanel />}
          {activeTool === "parse" && <ParsePanel />}
          {activeTool === "extract" && <ExtractPanel onRunExtract={() => navigate(createPageUrl("ExtractionResult"))} />}
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