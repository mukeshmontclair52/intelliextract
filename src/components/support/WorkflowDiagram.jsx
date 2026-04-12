import React, { useState } from "react";
import { X, Download, Cpu, CheckCircle2, Puzzle, Share2, ChevronRight, Code2, Mail, HardDrive, Webhook, Radio, Terminal, BookOpen, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    key: "import",
    label: "Import",
    icon: Download,
    summary: "Ingest documents from multiple sources into DocExtract.",
    details: {
      description: "DocExtract supports multiple ingestion channels. Documents can be sent via REST API, email, file storage, or event streaming. Each channel is configured per Profile.",
      channels: [
        {
          name: "REST API",
          icon: Terminal,
          desc: "POST documents directly to the ingestion endpoint.",
          code: `POST /v1/ingest
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "profile_id": "PRF-001",
  "doc_config_id": "DC-101",
  "file": <binary>
}`,
        },
        {
          name: "Email",
          icon: Mail,
          desc: "Send documents to your designated intake email address.",
          code: `To: intake-PRF001@docextract.io
Subject: [DC-101] Blackstone Q1 2026

Attach your PDF file to the email.
DocExtract will auto-route based on profile config.`,
        },
        {
          name: "File Storage (S3)",
          icon: HardDrive,
          desc: "Drop files in an S3 bucket — DocExtract polls and ingests automatically.",
          code: `# Bucket configured per profile:
s3://docextract-intake/PRF-001/

# Naming convention:
{doc_config_id}_{filename}.pdf
# e.g. DC-101_Blackstone_Q1.pdf`,
        },
        {
          name: "Kafka",
          icon: Radio,
          desc: "Publish document events to a Kafka topic for event-driven ingestion.",
          code: `# Topic: docextract.inbound
{
  "profile_id": "PRF-001",
  "doc_config_id": "DC-101",
  "file_url": "https://storage.../file.pdf",
  "metadata": { "source": "blackstone-portal" }
}`,
        },
      ],
    },
  },
  {
    key: "extract",
    label: "Extract",
    icon: Cpu,
    summary: "AI-powered field extraction from document content.",
    details: {
      description: "DocExtract uses configurable AI engines to extract structured data from your documents. You define the schema — DocExtract handles the rest.",
      channels: [
        {
          name: "AI Schema (LLM)",
          icon: Cpu,
          desc: "Define fields in plain English. GPT-4 or Claude extract them automatically.",
          code: `# Document Config extraction prompt:
"Extract the following fields:
- fund_name (string)
- nav (number, in USD)
- quarter (e.g. Q1 2026)
- distributions (number)
- capital_called (number)"`,
        },
        {
          name: "JSON Schema",
          icon: Code2,
          desc: "Provide a structured JSON schema for precise field mapping.",
          code: `{
  "fields": [
    { "name": "fund_name", "type": "string" },
    { "name": "nav", "type": "number" },
    { "name": "quarter", "type": "string" },
    { "name": "distributions", "type": "number" }
  ]
}`,
        },
        {
          name: "Extraction Result",
          icon: CheckCircle2,
          desc: "Results returned as structured JSON with confidence scores.",
          code: `{
  "fund_name": "Blackstone Growth Fund",
  "nav": 1204500,
  "quarter": "Q1 2026",
  "distributions": 45200,
  "_meta": {
    "confidence": 0.97,
    "engine": "GPT-4 Turbo",
    "pages_processed": 24
  }
}`,
        },
      ],
    },
  },
  {
    key: "validate",
    label: "Validate",
    icon: CheckCircle2,
    summary: "Automatic and manual validation of extracted data.",
    details: {
      description: "DocExtract validates extracted fields against configured rules. Low-confidence results can be flagged for manual review before proceeding.",
      channels: [
        {
          name: "Auto Validation Rules",
          icon: CheckCircle2,
          desc: "Define rules per field — required, type checks, value ranges, regex.",
          code: `# Validation config in Document Config:
{
  "validation": {
    "nav": { "required": true, "min": 0 },
    "quarter": { "pattern": "Q[1-4] \\d{4}" },
    "confidence_threshold": 0.85
  }
}`,
        },
        {
          name: "Manual Review",
          icon: BookOpen,
          desc: "Transactions below confidence threshold are flagged for human review in the dashboard.",
          code: `# Webhook notification on review needed:
POST https://your-endpoint.com/webhook
{
  "event": "review_required",
  "txn_id": "TXN-1041",
  "reason": "confidence below threshold",
  "confidence": 0.81,
  "review_url": "https://app.docextract.io/txn/TXN-1041"
}`,
        },
      ],
    },
  },
  {
    key: "transform",
    label: "Transform",
    icon: Puzzle,
    summary: "Apply business logic and data transformations to extracted values.",
    details: {
      description: "Post-extraction transformations let you normalize, enrich, and validate data before export. Configure decorators per Document Config.",
      channels: [
        {
          name: "Date Normalization",
          icon: Puzzle,
          desc: "Normalize date formats across all extracted date fields.",
          code: `# Config:
"decorators": {
  "date_format": "MM/DD/YYYY"
}

# Input:  "March 31, 2026"
# Output: "03/31/2026"`,
        },
        {
          name: "ECI → GWMID",
          icon: Puzzle,
          desc: "Translate ECI identifiers to internal GWMID values automatically.",
          code: `# Input field:
{ "eci_code": "ECI-00482" }

# After transformation:
{ "eci_code": "ECI-00482", "gwmid": "GWM-992847" }`,
        },
        {
          name: "Account Validation",
          icon: CheckCircle2,
          desc: "Run checksum or lookup validation on extracted account numbers.",
          code: `# Validation result appended to output:
{
  "account_number": "4012888888881881",
  "_validation": {
    "account_valid": true,
    "validation_method": "luhn_checksum"
  }
}`,
        },
      ],
    },
  },
  {
    key: "export",
    label: "Export",
    icon: Share2,
    summary: "Deliver results to your systems via multiple output channels.",
    details: {
      description: "Processed results are delivered to your configured destinations. Supports REST webhook, S3, Kafka, and email — with full audit trail per transaction.",
      channels: [
        {
          name: "Webhook",
          icon: Webhook,
          desc: "DocExtract POSTs results to your endpoint on completion.",
          code: `POST https://your-api.com/docextract/callback
Content-Type: application/json
X-DocExtract-Signature: sha256=...

{
  "txn_id": "TXN-1041",
  "status": "completed",
  "data": { "fund_name": "Blackstone...", ... },
  "metadata": { "confidence": 0.97 }
}`,
        },
        {
          name: "AWS S3 Export",
          icon: HardDrive,
          desc: "Output JSON written to your S3 bucket on completion.",
          code: `# Output path:
s3://your-bucket/docextract-output/
  PRF-001/TXN-1041_result.json

# Content: full extraction JSON
# + _meta with confidence & audit info`,
        },
        {
          name: "Kafka Event",
          icon: Radio,
          desc: "Publish result events to a Kafka topic for downstream consumers.",
          code: `# Topic: docextract.completed
{
  "txn_id": "TXN-1041",
  "profile_id": "PRF-001",
  "doc_config_id": "DC-101",
  "status": "completed",
  "result_url": "https://api.docextract.io/results/TXN-1041"
}`,
        },
      ],
    },
  },
];

function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="relative group">
      <pre className="bg-slate-950 text-emerald-300 text-[11px] font-mono rounded-xl p-4 overflow-auto leading-relaxed whitespace-pre">{code}</pre>
      <button
        onClick={copy}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center"
      >
        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
      </button>
    </div>
  );
}

export default function WorkflowDiagram({ onClose }) {
  const [activeStep, setActiveStep] = useState("import");
  const [activeChannel, setActiveChannel] = useState(0);

  const step = STEPS.find(s => s.key === activeStep);
  const channel = step.details.channels[activeChannel];

  const handleStepClick = (key) => {
    setActiveStep(key);
    setActiveChannel(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div
        className="relative w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        style={{ background: "#0f1117", maxHeight: "90vh" }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 text-white" />
        </button>

        {/* Header */}
        <div className="px-8 pt-7 pb-5 flex-shrink-0">
          <h2 className="text-2xl font-bold text-white mb-1">How DocExtract Works</h2>
          <p className="text-slate-400 text-sm">Click each stage to explore implementation and integration details.</p>
        </div>

        {/* Pipeline */}
        <div className="px-8 pb-5 flex-shrink-0">
          <div className="flex items-center gap-0">
            {STEPS.map((s, idx) => {
              const Icon = s.icon;
              const active = activeStep === s.key;
              return (
                <React.Fragment key={s.key}>
                  <button
                    onClick={() => handleStepClick(s.key)}
                    className={cn(
                      "flex-1 flex flex-col items-center gap-2 px-3 py-3 rounded-2xl transition-all border-2",
                      active
                        ? "border-indigo-500 bg-indigo-600/20"
                        : "border-transparent hover:border-slate-700 hover:bg-slate-800/50"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all",
                      active ? "bg-indigo-600 border-indigo-400 shadow-lg shadow-indigo-900" : "bg-slate-800 border-slate-600"
                    )}>
                      <Icon className={cn("w-5 h-5", active ? "text-white" : "text-slate-400")} />
                    </div>
                    <span className={cn("text-sm font-semibold", active ? "text-white" : "text-slate-400")}>{s.label}</span>
                    <span className="text-[10px] text-slate-500 text-center leading-tight hidden sm:block">{s.summary}</span>
                  </button>
                  {idx < STEPS.length - 1 && (
                    <ChevronRight className="w-5 h-5 text-slate-600 flex-shrink-0 mx-1" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Detail panel */}
        <div className="flex flex-1 min-h-0 border-t border-slate-800 overflow-hidden">
          {/* Left: channel list */}
          <div className="w-52 flex-shrink-0 border-r border-slate-800 overflow-auto p-3 space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-3">Methods</p>
            {step.details.channels.map((ch, i) => {
              const Icon = ch.icon;
              return (
                <button
                  key={i}
                  onClick={() => setActiveChannel(i)}
                  className={cn(
                    "w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-xs font-medium",
                    activeChannel === i
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  )}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  {ch.name}
                </button>
              );
            })}
          </div>

          {/* Right: channel detail */}
          <div className="flex-1 overflow-auto p-6 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{step.label}</span>
                <ChevronRight className="w-3 h-3 text-slate-600" />
                <span className="text-xs text-slate-400">{channel.name}</span>
              </div>
              <p className="text-white font-semibold text-base mb-1">{channel.name}</p>
              <p className="text-slate-400 text-sm leading-relaxed">{channel.desc}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Example</p>
              <CodeBlock code={channel.code} />
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <p className="text-xs text-slate-400 leading-relaxed">
                <span className="text-slate-300 font-semibold">About this stage: </span>
                {step.details.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}