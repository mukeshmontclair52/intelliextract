import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, ArrowRight, Check, Zap, Scan, Scissors, EyeOff,
  ChevronRight, Plus, X, Sparkles, FileJson, HardDrive, Bell
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";



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
  { id: "preprocessing", label: "Pre-Processing" },
  { id: "postprocessing", label: "Post-Processing" },
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
function CapabilityCard({ cap, enabled, onSelect }) {
  const Icon = cap.icon;

  return (
    <div
      onClick={onSelect}
      className={cn("rounded-xl border-2 transition-all cursor-pointer", enabled ? `${cap.border} ${cap.bg}` : "border-slate-200 bg-white hover:border-slate-300")}
    >
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
        <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1", enabled ? "border-indigo-600 bg-indigo-600" : "border-slate-300 bg-white")}>
          {enabled && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
      </div>
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

function StepCapabilities({ capabilities, onSelect }) {
  return (
    <div className="space-y-3 max-w-2xl">
      <p className="text-sm text-slate-500">Select one processing capability for this document type.</p>
      {CAPABILITIES.map((cap) => (
        <CapabilityCard
          key={cap.key}
          cap={cap}
          enabled={!!capabilities[cap.key]}
          onSelect={() => onSelect(cap.key)}
        />
      ))}
    </div>
  );
}

// ── Step 2b: Pre-Processing ───────────────────────────────────────────────────
function StepPreProcessing({ settings, onChange }) {
  const options = [
    { key: "autoOrientation", label: "Auto Orientation Detection & Correction", desc: "Automatically detect and correct document orientation." },
    { key: "dpiCorrection", label: "DPI Quality Correction", desc: "Enhance low-resolution scans to improve processing accuracy." },
    { key: "rotationCorrection", label: "Rotation Correction", desc: "Detect and fix rotated pages before processing." },
  ];

  return (
    <div className="space-y-3 max-w-2xl">
      <p className="text-sm text-slate-500">Configure pre-processing steps applied to documents before extraction.</p>
      {options.map(({ key, label, desc }) => (
        <div
          key={key}
          onClick={() => onChange({ ...settings, [key]: !settings[key] })}
          className={cn(
            "rounded-xl border-2 p-4 flex items-start justify-between gap-4 cursor-pointer transition-all",
            settings[key] ? "border-indigo-200 bg-indigo-50" : "border-slate-200 bg-white hover:border-slate-300"
          )}
        >
          <div>
            <p className={cn("font-semibold text-sm", settings[key] ? "text-slate-800" : "text-slate-600")}>{label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
          </div>
          <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5", settings[key] ? "border-indigo-600 bg-indigo-600" : "border-slate-300 bg-white")}>
            {settings[key] && <Check className="w-3 h-3 text-white" />}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Step 3: Post-Processing ──────────────────────────────────────────────────
function StepPostProcessing({ settings, onChange }) {
  const formats = [
    { key: "json", label: "JSON", icon: FileJson, desc: "Structured JSON format for API integration." },
    { key: "csv", label: "CSV", icon: FileJson, desc: "Comma-separated values for spreadsheets." },
    { key: "xml", label: "XML", icon: FileJson, desc: "XML format for enterprise systems." },
  ];

  const storageOptions = [
    { key: "localStorage", label: "Local Storage", desc: "Store in local file system." },
    { key: "s3", label: "AWS S3", desc: "Store in Amazon S3 bucket." },
    { key: "googleCloud", label: "Google Cloud", desc: "Store in Google Cloud Storage." },
  ];

  const notificationOptions = [
    { key: "email", label: "Email Notification", desc: "Send notification when processing completes." },
    { key: "webhook", label: "Webhook", desc: "Post results to external webhook URL." },
    { key: "slack", label: "Slack", desc: "Send notification to Slack channel." },
  ];

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Output Format */}
      <div>
        <p className="text-sm text-slate-500 mb-3 flex items-center gap-1.5"><FileJson className="w-4 h-4" />Output Format</p>
        <div className="grid grid-cols-3 gap-2">
          {formats.map(({ key, label, desc }) => (
            <button
              key={key}
              onClick={() => onChange({ ...settings, outputFormat: key })}
              className={cn(
                "rounded-lg border-2 p-3 text-left transition-all",
                settings.outputFormat === key
                  ? "border-indigo-600 bg-indigo-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              )}
            >
              <p className={cn("text-sm font-semibold", settings.outputFormat === key ? "text-slate-800" : "text-slate-600")}>{label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Storage Options */}
      <div>
        <p className="text-sm text-slate-500 mb-3 flex items-center gap-1.5"><HardDrive className="w-4 h-4" />Storage Options</p>
        <div className="space-y-2">
          {storageOptions.map(({ key, label, desc }) => (
            <div
              key={key}
              onClick={() => onChange({ ...settings, storage: settings.storage === key ? null : key })}
              className={cn(
                "rounded-lg border-2 p-3 flex items-start justify-between gap-3 cursor-pointer transition-all",
                settings.storage === key ? "border-indigo-200 bg-indigo-50" : "border-slate-200 bg-white hover:border-slate-300"
              )}
            >
              <div>
                <p className={cn("text-sm font-semibold", settings.storage === key ? "text-slate-800" : "text-slate-600")}>{label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
              </div>
              <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5", settings.storage === key ? "border-indigo-600 bg-indigo-600" : "border-slate-300 bg-white")}>
                {settings.storage === key && <Check className="w-3 h-3 text-white" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div>
        <p className="text-sm text-slate-500 mb-3 flex items-center gap-1.5"><Bell className="w-4 h-4" />Notification Options</p>
        <div className="space-y-2">
          {notificationOptions.map(({ key, label, desc }) => (
            <div
              key={key}
              onClick={() => onChange({ ...settings, notifications: settings.notifications?.includes(key) ? settings.notifications.filter(n => n !== key) : [...(settings.notifications || []), key] })}
              className={cn(
                "rounded-lg border-2 p-3 flex items-start justify-between gap-3 cursor-pointer transition-all",
                settings.notifications?.includes(key) ? "border-indigo-200 bg-indigo-50" : "border-slate-200 bg-white hover:border-slate-300"
              )}
            >
              <div>
                <p className={cn("text-sm font-semibold", settings.notifications?.includes(key) ? "text-slate-800" : "text-slate-600")}>{label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
              </div>
              <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5", settings.notifications?.includes(key) ? "border-indigo-600 bg-indigo-600" : "border-slate-300 bg-white")}>
                {settings.notifications?.includes(key) && <Check className="w-3 h-3 text-white" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Step 4: Review ────────────────────────────────────────────────────────────
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
        <div className="border-t border-slate-200 pt-4">
          <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-3">Pre-Processing</p>
          {[
            { key: "autoOrientation", label: "Auto Orientation Detection & Correction" },
            { key: "dpiCorrection", label: "DPI Quality Correction" },
            { key: "rotationCorrection", label: "Rotation Correction" },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center gap-2 mb-1.5">
              <div className={cn("w-4 h-4 rounded-full flex items-center justify-center", data.preProcessing?.[key] ? "bg-indigo-600" : "bg-slate-200")}>
                {data.preProcessing?.[key] && <Check className="w-2.5 h-2.5 text-white" />}
              </div>
              <span className={cn("text-sm", data.preProcessing?.[key] ? "text-slate-800" : "text-slate-400")}>{label}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-200 pt-4">
          <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-3">Post-Processing</p>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-slate-500 mb-1">Output Format</p>
              <p className="text-sm font-semibold text-slate-800 capitalize">{data.postProcessing?.outputFormat || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Storage</p>
              <p className="text-sm font-semibold text-slate-800 capitalize">{data.postProcessing?.storage || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Notifications</p>
              {data.postProcessing?.notifications && data.postProcessing.notifications.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {data.postProcessing.notifications.map((n) => (
                    <span key={n} className="inline-flex text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{n}</span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">None</p>
              )}
            </div>
          </div>
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
export default function AddDocumentWizard({ initialData, onCancel, onSave }) {
  const isEditing = !!initialData;
  const [step, setStep] = useState(0);
  const [data, setData] = useState(initialData ? {
    name: initialData.name || "",
    capabilities: Object.keys(initialData.configs || {}).reduce((acc, key) => {
      if (initialData.configs[key]?.enabled) acc[key] = true;
      return acc;
    }, {}),
    preProcessing: initialData.preProcessing || {},
    postProcessing: initialData.postProcessing || {},
  } : {
    name: "",
    capabilities: {},
    preProcessing: {},
    postProcessing: {},
  });

  const update = (patch) => setData((d) => ({ ...d, ...patch }));

  const selectCapability = (key) => {
    setData((d) => ({
      ...d,
      capabilities: { [key]: true },
    }));
  };

  const canNext = () => {
    if (step === 0) return !!data.name.trim();
    return true;
  };

  const handleSave = () => {
    const enabledKeys = Object.keys(data.capabilities).filter((k) => data.capabilities[k]);
    const configs = {};
    ["extraction", "parse", "split", "redaction"].forEach((key) => {
      configs[key] = { enabled: enabledKeys.includes(key) };
    });
    onSave({
      id: Date.now(),
      name: data.name,
      fileName: `${data.name.replace(/\s+/g, "_")}.pdf`,
      configs,
      preProcessing: data.preProcessing,
    });
  };

  const stepContent = [
    <StepIdentity key="identity" data={data} onChange={update} />,
    <StepCapabilities key="capabilities" capabilities={data.capabilities} onSelect={selectCapability} />,
    <StepPreProcessing key="preprocessing" settings={data.preProcessing} onChange={(preProcessing) => update({ preProcessing })} />,
    <StepReview key="review" data={data} />,
  ];

  return (
    <div className="p-8 max-w-3xl">
      {/* Back */}
      <button onClick={onCancel} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />Back to documents
      </button>

      <h1 className="text-2xl font-bold text-slate-800 mb-1">{isEditing ? "Edit" : "Add"} Document Configuration</h1>
      <p className="text-sm text-slate-500 mb-8">{isEditing ? "Update" : "Set up"} how this document type will be processed by the system.</p>

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
            <Check className="w-4 h-4 mr-2" />{isEditing ? "Save Changes" : "Save Document Config"}
          </Button>
        )}
      </div>
    </div>
  );
}