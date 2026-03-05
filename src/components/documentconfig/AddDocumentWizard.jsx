import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, ArrowRight, Check, FileText, Zap, Scan, Scissors, EyeOff,
  Mail, Globe, Database, Cloud, ChevronRight, Plus, X, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DOCUMENT_TYPES = [
  { value: "alts-schedule", label: "Alts Schedule", desc: "Alternative investments schedule of investments" },
  { value: "quarterly-report", label: "Quarterly Report", desc: "Fund quarterly performance reports" },
  { value: "k1-tax", label: "K-1 Tax Document", desc: "Partner tax forms and distributions" },
  { value: "capital-account", label: "Capital Account Statement", desc: "LP capital account activity" },
  { value: "financial-statement", label: "Financial Statement", desc: "Balance sheets, P&L, cash flow" },
  { value: "custom", label: "Custom", desc: "Other document type" },
];

const INGESTION_METHODS = [
  { value: "email", label: "Email Ingestion", icon: Mail, desc: "Documents arrive via email attachment" },
  { value: "api", label: "API Upload", icon: Globe, desc: "Programmatic upload via REST API" },
  { value: "s3", label: "S3 / Cloud Storage", icon: Cloud, desc: "Pull from S3 bucket or cloud storage" },
  { value: "sftp", label: "SFTP / FTP", icon: Database, desc: "Scheduled pull from SFTP server" },
];

const CAPABILITIES = [
  {
    key: "parse",
    label: "Parse",
    icon: Scan,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    ring: "ring-emerald-400",
    desc: "Convert PDF to clean structured text or Markdown for downstream use.",
  },
  {
    key: "split",
    label: "Split",
    icon: Scissors,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
    ring: "ring-purple-400",
    desc: "Automatically split multi-document PDFs into separate logical documents.",
  },
  {
    key: "extraction",
    label: "Extraction",
    icon: Zap,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    ring: "ring-indigo-400",
    desc: "Extract structured fields (tables, key-values) using AI or templates.",
  },
  {
    key: "redaction",
    label: "Redaction",
    icon: EyeOff,
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-200",
    ring: "ring-rose-400",
    desc: "Automatically detect and redact sensitive PII / financial identifiers.",
  },
];

const STEPS = [
  { id: "identity", label: "Document Identity" },
  { id: "capabilities", label: "Capabilities" },
  { id: "review", label: "Review" },
];

// ── Step 1: Identity ──────────────────────────────────────────────────────────
function StepIdentity({ data, onChange }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Document Name <span className="text-rose-500">*</span></label>
        <Input
          placeholder="e.g. Blackstone Q1 2026"
          value={data.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="max-w-md"
        />
        <p className="text-xs text-slate-400 mt-1">A human-readable label for this document configuration.</p>
      </div>
    </div>
  );
}

// ── Step 2: Capabilities ──────────────────────────────────────────────────────
function CapabilityCard({ cap, enabled, onToggle, config, onConfigChange }) {
  const Icon = cap.icon;
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={cn("rounded-xl border-2 transition-all", enabled ? `${cap.border} ${cap.bg}` : "border-slate-200 bg-white")}>
      <div className="p-4 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", enabled ? cap.bg : "bg-slate-100")}>
            <Icon className={cn("w-4 h-4", enabled ? cap.color : "text-slate-400")} />
          </div>
          <div>
            <p className={cn("font-semibold text-sm", enabled ? "text-slate-800" : "text-slate-600")}>{cap.label}</p>
            <p className="text-xs text-slate-500 mt-0.5 max-w-sm">{cap.desc}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {enabled && (
            <button onClick={() => setExpanded(!expanded)} className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1">
              Configure <ChevronRight className={cn("w-3 h-3 transition-transform", expanded && "rotate-90")} />
            </button>
          )}
          <button
            onClick={onToggle}
            className={cn(
              "relative w-11 h-6 rounded-full transition-colors flex-shrink-0",
              enabled ? "bg-indigo-600" : "bg-slate-200"
            )}
          >
            <span className={cn("absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform", enabled && "translate-x-5")} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {enabled && expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-slate-200/60 pt-3 space-y-3">
              {cap.key === "extraction" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-600 mb-1 block">Engine</label>
                      <select
                        className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white"
                        value={config.engine || "gen-ai"}
                        onChange={(e) => onConfigChange({ engine: e.target.value })}
                      >
                        <option value="gen-ai">Gen AI - LLM</option>
                        <option value="template">Template Based</option>
                        <option value="hybrid">Hybrid</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 mb-1 block">Model</label>
                      <select
                        className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white"
                        value={config.model || "gpt-4-turbo"}
                        onChange={(e) => onConfigChange({ model: e.target.value })}
                      >
                        <option value="gpt-4-turbo">GPT-4 Turbo</option>
                        <option value="gpt-4o">GPT-4o</option>
                        <option value="gpt-3.5">GPT-3.5</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Task Description <span className="text-slate-400 font-normal">(optional — AI will auto-generate)</span></label>
                    <textarea
                      rows={2}
                      className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white resize-none"
                      placeholder="Describe what to extract…"
                      value={config.description || ""}
                      onChange={(e) => onConfigChange({ description: e.target.value })}
                    />
                  </div>
                  <p className="text-xs text-indigo-600 flex items-center gap-1 cursor-pointer hover:underline">
                    <Sparkles className="w-3 h-3" />You can configure extraction fields in detail after saving
                  </p>
                </>
              )}
              {cap.key === "parse" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Engine</label>
                    <select className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white" value={config.engine || "gen-ai"} onChange={(e) => onConfigChange({ engine: e.target.value })}>
                      <option value="gen-ai">Gen AI - LLM</option>
                      <option value="template">Template Based</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Output Format</label>
                    <select className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white" value={config.outputFormat || "markdown"} onChange={(e) => onConfigChange({ outputFormat: e.target.value })}>
                      <option value="markdown">Markdown</option>
                      <option value="plain">Plain Text</option>
                      <option value="json">JSON</option>
                    </select>
                  </div>
                </div>
              )}
              {cap.key === "split" && (
                <>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Model</label>
                    <select className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white max-w-xs" value={config.model || "gpt-4o"} onChange={(e) => onConfigChange({ model: e.target.value })}>
                      <option value="gpt-4o">GPT-4o</option>
                      <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    </select>
                  </div>
                  <SplitCategoriesInput categories={config.categories || []} onChange={(cats) => onConfigChange({ categories: cats })} />
                </>
              )}
              {cap.key === "redaction" && (
                <>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Redaction Method</label>
                    <select className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white max-w-xs" value={config.method || "black-box"} onChange={(e) => onConfigChange({ method: e.target.value })}>
                      <option value="black-box">Black Box (full cover)</option>
                      <option value="mask">Mask (replace with ***)</option>
                      <option value="tokenize">Tokenize (replace with token)</option>
                    </select>
                  </div>
                  <RedactionPatternsInput patterns={config.patterns || []} onChange={(p) => onConfigChange({ patterns: p })} />
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SplitCategoriesInput({ categories, onChange }) {
  const [input, setInput] = useState("");
  const add = () => { if (input.trim()) { onChange([...categories, input.trim()]); setInput(""); } };
  return (
    <div>
      <label className="text-xs font-medium text-slate-600 mb-1 block">Split Categories</label>
      <div className="flex gap-2 mb-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Add a category…" className="h-8 text-xs" />
        <Button onClick={add} size="sm" variant="outline" className="h-8"><Plus className="w-3.5 h-3.5" /></Button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {categories.map((c) => (
          <span key={c} className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded-full">
            {c}
            <button onClick={() => onChange(categories.filter((x) => x !== c))}><X className="w-3 h-3" /></button>
          </span>
        ))}
      </div>
    </div>
  );
}

function RedactionPatternsInput({ patterns, onChange }) {
  const PRESETS = ["SSN", "Account Numbers", "Tax IDs", "Personal Names", "Email Addresses", "Phone Numbers"];
  return (
    <div>
      <label className="text-xs font-medium text-slate-600 mb-1.5 block">Redaction Patterns</label>
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((p) => {
          const active = patterns.includes(p);
          return (
            <button
              key={p}
              onClick={() => onChange(active ? patterns.filter((x) => x !== p) : [...patterns, p])}
              className={cn(
                "text-xs px-2.5 py-1 rounded-full border transition-all",
                active ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
              )}
            >
              {active && <Check className="w-3 h-3 inline mr-1" />}{p}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepCapabilities({ capabilities, capConfigs, onToggle, onConfigChange }) {
  return (
    <div className="space-y-3 max-w-2xl">
      <p className="text-sm text-slate-500">Enable the processing capabilities you need for this document type. You can configure details now or after saving.</p>
      {CAPABILITIES.map((cap) => (
        <CapabilityCard
          key={cap.key}
          cap={cap}
          enabled={!!capabilities[cap.key]}
          onToggle={() => onToggle(cap.key)}
          config={capConfigs[cap.key] || {}}
          onConfigChange={(updates) => onConfigChange(cap.key, updates)}
        />
      ))}
    </div>
  );
}

// ── Step 3: Review ────────────────────────────────────────────────────────────
function StepReview({ data }) {
  const enabledCaps = CAPABILITIES.filter((c) => data.capabilities[c.key]);

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-3">Document Identity</p>
          <div>
            <p className="text-xs text-slate-400">Name</p>
            <p className="text-sm font-semibold text-slate-800">{data.name || "—"}</p>
          </div>
        </div>
        <div className="border-t border-slate-200 pt-4">
          <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-3">Enabled Capabilities</p>
          {enabledCaps.length === 0 ? (
            <p className="text-sm text-slate-400">No capabilities enabled</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {enabledCaps.map((cap) => {
                const Icon = cap.icon;
                return (
                  <span key={cap.key} className={cn("inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border", cap.color, cap.bg, cap.border)}>
                    <Icon className="w-3 h-3" />{cap.label}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 flex gap-2">
        <Sparkles className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-indigo-700">After saving, you can open this document config to fine-tune extraction fields, split rules, and test with a sample document.</p>
      </div>
    </div>
  );
}

// ── Main Wizard ───────────────────────────────────────────────────────────────
export default function AddDocumentWizard({ onCancel, onSave }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    name: "",
    type: "",
    typeLabel: "",
    ingestion: "",
    capabilities: {},
    capConfigs: {},
  });

  const update = (patch) => setData((d) => ({ ...d, ...patch }));

  const toggleCapability = (key) => {
    setData((d) => ({
      ...d,
      capabilities: { ...d.capabilities, [key]: !d.capabilities[key] },
    }));
  };

  const updateCapConfig = (key, patch) => {
    setData((d) => ({
      ...d,
      capConfigs: { ...d.capConfigs, [key]: { ...(d.capConfigs[key] || {}), ...patch } },
    }));
  };

  const canNext = () => {
    if (step === 0) return !!data.name.trim() && !!data.type;
    if (step === 1) return !!data.ingestion;
    return true;
  };

  const handleSave = () => {
    const enabledKeys = Object.keys(data.capabilities).filter((k) => data.capabilities[k]);
    const configs = {};
    ["extraction", "parse", "split", "redaction"].forEach((key) => {
      configs[key] = enabledKeys.includes(key)
        ? { enabled: true, ...(data.capConfigs[key] || {}) }
        : { enabled: false };
    });
    onSave({
      id: Date.now(),
      name: data.name,
      fileName: `${data.name.replace(/\s+/g, "_")}.pdf`,
      type: data.type,
      typeLabel: data.typeLabel,
      ingestion: data.ingestion,
      configs,
    });
  };

  const stepContent = [
    <StepIdentity key="identity" data={data} onChange={update} />,
    <StepIngestion key="ingestion" data={data} onChange={update} />,
    <StepCapabilities key="capabilities" capabilities={data.capabilities} capConfigs={data.capConfigs} onToggle={toggleCapability} onConfigChange={updateCapConfig} />,
    <StepReview key="review" data={data} />,
  ];

  return (
    <div className="p-8 max-w-3xl">
      {/* Back */}
      <button onClick={onCancel} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />Back to documents
      </button>

      <h1 className="text-2xl font-bold text-slate-800 mb-1">Add Document Configuration</h1>
      <p className="text-sm text-slate-500 mb-8">Set up how this document type will be processed by the system.</p>

      {/* Progress */}
      <div className="flex items-center gap-0 mb-10">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all",
                i < step ? "bg-indigo-600 border-indigo-600 text-white" :
                i === step ? "bg-white border-indigo-600 text-indigo-600" :
                "bg-white border-slate-200 text-slate-400"
              )}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={cn("text-xs mt-1.5 font-medium whitespace-nowrap", i === step ? "text-indigo-600" : "text-slate-400")}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("h-0.5 flex-1 mx-2 mt-[-14px]", i < step ? "bg-indigo-600" : "bg-slate-200")} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.18 }}
        >
          {stepContent[step]}
        </motion.div>
      </AnimatePresence>

      {/* Footer */}
      <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-200">
        <Button variant="outline" onClick={() => step === 0 ? onCancel() : setStep(step - 1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />{step === 0 ? "Cancel" : "Back"}
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canNext()} className="bg-indigo-600 hover:bg-indigo-700">
            Next <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
            <Check className="w-4 h-4 mr-2" />Save Document Config
          </Button>
        )}
      </div>
    </div>
  );
}