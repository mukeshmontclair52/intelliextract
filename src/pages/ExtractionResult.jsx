import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft, Download, Share2, FileSearch2, CheckCircle2,
  Code2, X, ExternalLink, Table2, AlignLeft, Info,
  FileText, Send, MoreHorizontal, ChevronDown,
  FileJson, ScanText, Braces, FileDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

// ── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_FLAT_FIELDS = [
  { key: "account_owner_name",  label: "Account Owner Name", value: "MUKESH BAJAJ",    confidence: 0.98, page: 2,  type: "String" },
  { key: "year",                label: "Tax Year",           value: "2025",             confidence: 0.99, page: 1,  type: "String" },
  { key: "interest_income",     label: "Interest Income",    value: "$0.56",            confidence: 0.91, page: 5,  type: "Number" },
  { key: "account_number",      label: "Account Number",     value: "****-8821",        confidence: 0.97, page: 1,  type: "String" },
  { key: "statement_date",      label: "Statement Date",     value: "2025-12-31",       confidence: 0.96, page: 1,  type: "String" },
  { key: "institution_name",    label: "Institution Name",   value: "JPMorgan Chase",   confidence: 0.99, page: 1,  type: "String" },
];

const MOCK_TABLE = {
  key: "transactions",
  label: "Transaction History",
  confidence: 0.89,
  columns: ["Date", "Description", "Amount", "Type"],
  rows: [
    { values: ["2025-01-15", "Dividend Payment",             "$245.80",   "Credit"], confidence: 0.92, page: 8  },
    { values: ["2025-02-10", "Interest Accrual",             "$0.56",     "Credit"], confidence: 0.91, page: 9  },
    { values: ["2025-03-22", "Tax Withheld 1099-B",          "$12.40",    "Debit"],  confidence: 0.88, page: 10 },
    { values: ["2025-06-15", "Dividend Payment",             "$312.50",   "Credit"], confidence: 0.94, page: 12 },
    { values: ["2025-09-30", "Capital Gains Distribution",   "$1,204.00", "Credit"], confidence: 0.86, page: 14 },
  ],
};

const MOCK_SCHEMA_FIELDS = [
  { key: "account_owner_name", type: "String",  desc: "The full name of the account owner." },
  { key: "year",               type: "String",  desc: "Tax year of the statement." },
  { key: "interest_income",    type: "Number",  desc: "Total interest income reported in 1099-INT box 1." },
  { key: "account_number",     type: "String",  desc: "Masked account number." },
  { key: "statement_date",     type: "String",  desc: "Statement end date." },
  { key: "institution_name",   type: "String",  desc: "Name of the financial institution." },
  { key: "transactions",       type: "Array",   desc: "List of account transactions." },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function ConfidencePill({ value }) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 95 ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : pct >= 85 ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-red-50 text-red-700 border-red-200";
  const dot = pct >= 95 ? "bg-emerald-400" : pct >= 85 ? "bg-amber-400" : "bg-red-400";
  return (
    <span className={cn("inline-flex items-center gap-1 text-[10px] font-semibold border rounded-full px-1.5 py-0.5 whitespace-nowrap", color)}>
      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", dot)} />
      {pct}%
    </span>
  );
}

function PageBadge({ page, onJump }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onJump(page); }}
      className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-indigo-500 bg-indigo-50 border border-indigo-100 rounded px-1.5 py-0.5 hover:bg-indigo-100 hover:text-indigo-700 transition-colors whitespace-nowrap"
    >
      pg {page}
      <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
    </button>
  );
}

function filterByConf(items, confFilter) {
  return items.filter(item => {
    const c = item.confidence;
    if (confFilter === "high") return c >= 0.90;
    if (confFilter === "mid")  return c >= 0.70 && c < 0.90;
    if (confFilter === "low")  return c < 0.70;
    return true;
  });
}

// ── Dropdown Menu ─────────────────────────────────────────────────────────────

function DropdownMenu({ trigger, items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden py-1">
          {items.map((item, i) =>
            item === "divider" ? (
              <div key={i} className="my-1 border-t border-slate-100" />
            ) : (
              <button
                key={i}
                onClick={() => { item.onClick?.(); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors text-left"
              >
                {item.icon && <item.icon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />}
                <span>{item.label}</span>
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

// ── Schema Modal ──────────────────────────────────────────────────────────────

function SchemaModal({ onClose }) {
  const TYPE_COLORS = {
    String: "text-emerald-600 bg-emerald-50",
    Number: "text-blue-600 bg-blue-50",
    Object: "text-orange-600 bg-orange-50",
    Array:  "text-purple-600 bg-purple-50",
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Extraction Schema</h2>
            <p className="text-xs text-slate-400 mt-0.5">{MOCK_SCHEMA_FIELDS.length} fields defined</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
        <div className="flex-1 overflow-auto divide-y divide-slate-100">
          {MOCK_SCHEMA_FIELDS.map((f) => (
            <div key={f.key} className="px-5 py-3 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-slate-800">{f.key}</span>
                  <span className={cn("text-[10px] font-bold rounded px-1.5 py-0.5", TYPE_COLORS[f.type] || "text-slate-400 bg-slate-50")}>{f.type}</span>
                </div>
                {f.desc && <p className="text-xs text-slate-400 mt-0.5">{f.desc}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Submit Review Modal ───────────────────────────────────────────────────────

function SubmitReviewModal({ onClose, onSubmit }) {
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handle = () => {
    setSubmitting(true);
    setTimeout(() => { onSubmit(); onClose(); }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Submit Review</h2>
            <p className="text-xs text-slate-400 mt-0.5">Confirm and submit this extraction for downstream processing.</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Summary */}
          <div className="bg-slate-50 rounded-xl border border-slate-100 divide-y divide-slate-100">
            <div className="flex justify-between items-center px-4 py-2.5">
              <span className="text-xs text-slate-500">Document</span>
              <span className="text-xs font-semibold text-slate-700">TaxDocument_0326.pdf</span>
            </div>
            <div className="flex justify-between items-center px-4 py-2.5">
              <span className="text-xs text-slate-500">Fields extracted</span>
              <span className="text-xs font-semibold text-slate-700">{MOCK_FLAT_FIELDS.length} flat · {MOCK_TABLE.rows.length} table rows</span>
            </div>
            <div className="flex justify-between items-center px-4 py-2.5">
              <span className="text-xs text-slate-500">Overall confidence</span>
              <ConfidencePill value={0.94} />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Review Notes <span className="text-slate-300 font-normal">(optional)</span></label>
            <textarea
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
              rows={3}
              placeholder="Add any notes or comments before submitting…"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100">
          <Button variant="outline" size="sm" className="h-8 text-xs border-slate-200" onClick={onClose}>Cancel</Button>
          <Button
            size="sm"
            className="h-8 text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 border-0"
            onClick={handle}
            disabled={submitting}
          >
            <Send className="w-3.5 h-3.5" />
            {submitting ? "Submitting…" : "Submit Review"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Flat Fields Tab ───────────────────────────────────────────────────────────

function FlatFieldsTab({ onJump, confFilter }) {
  const visible = filterByConf(MOCK_FLAT_FIELDS, confFilter);
  const avgConf = MOCK_FLAT_FIELDS.reduce((s, f) => s + f.confidence, 0) / MOCK_FLAT_FIELDS.length;

  if (visible.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
        <AlignLeft className="w-8 h-8 opacity-30" />
        <p className="text-sm">No fields match the current confidence filter.</p>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-3">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
        <span className="text-xs text-slate-500">{visible.length} of {MOCK_FLAT_FIELDS.length} fields shown</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Avg confidence</span>
          <ConfidencePill value={avgConf} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-slate-50 border-b border-slate-100">
          <div className="col-span-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Field</div>
          <div className="col-span-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Value</div>
          <div className="col-span-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Confidence</div>
          <div className="col-span-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Source Page</div>
        </div>

        <div className="divide-y divide-slate-50">
          {visible.map((f) => (
            <div
              key={f.key}
              onClick={() => onJump(f.page)}
              className="grid grid-cols-12 gap-2 px-4 py-3 hover:bg-indigo-50/40 cursor-pointer group transition-colors items-center"
            >
              <div className="col-span-4 min-w-0">
                <p className="text-xs font-semibold text-slate-700 group-hover:text-indigo-700 transition-colors truncate">{f.label}</p>
                <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5">{f.key}</p>
              </div>
              <div className="col-span-4 min-w-0">
                <span className="text-sm font-bold text-slate-800 group-hover:text-indigo-700 transition-colors truncate block" title={String(f.value)}>
                  {String(f.value)}
                </span>
                <span className={cn("text-[10px] font-medium mt-0.5 inline-block", f.type === "Number" ? "text-blue-500" : "text-slate-400")}>{f.type}</span>
              </div>
              <div className="col-span-2 flex justify-center">
                <ConfidencePill value={f.confidence} />
              </div>
              <div className="col-span-2 flex justify-center">
                <PageBadge page={f.page} onJump={onJump} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tabular Data Tab ──────────────────────────────────────────────────────────

function TabularDataTab({ onJump, confFilter }) {
  const visibleRows = filterByConf(MOCK_TABLE.rows, confFilter);
  const avgConf = MOCK_TABLE.rows.reduce((s, r) => s + r.confidence, 0) / MOCK_TABLE.rows.length;

  if (visibleRows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
        <Table2 className="w-8 h-8 opacity-30" />
        <p className="text-sm">No rows match the current confidence filter.</p>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-3">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">{MOCK_TABLE.label}</span>
          <span className="text-xs text-slate-400">· {visibleRows.length} of {MOCK_TABLE.rows.length} rows shown</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Avg confidence</span>
          <ConfidencePill value={avgConf} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {MOCK_TABLE.columns.map((col) => (
                  <th key={col} className="text-left px-4 py-2.5 font-bold text-slate-400 uppercase tracking-wider text-[10px] whitespace-nowrap">{col}</th>
                ))}
                <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center whitespace-nowrap">Confidence</th>
                <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center whitespace-nowrap">Source Page</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {visibleRows.map((row, i) => (
                <tr key={i} onClick={() => onJump(row.page)} className="hover:bg-indigo-50/40 cursor-pointer group transition-colors">
                  {row.values.map((v, j) => (
                    <td key={j} className={cn(
                      "px-4 py-3 font-medium group-hover:text-indigo-700 transition-colors whitespace-nowrap",
                      j === 3
                        ? v === "Credit" ? "text-emerald-600" : "text-red-500"
                        : "text-slate-700"
                    )}>
                      {v}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center"><ConfidencePill value={row.confidence} /></div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center"><PageBadge page={row.page} onJump={onJump} /></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center gap-4 px-1">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400"><span className="w-2 h-2 rounded-full bg-emerald-400" />Credit</div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400"><span className="w-2 h-2 rounded-full bg-red-400" />Debit</div>
        <span className="text-[10px] text-slate-300 ml-auto">Click any row to jump to source page</span>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const TABS = [
  { key: "fields",  label: "Flat Fields",  icon: AlignLeft, count: MOCK_FLAT_FIELDS.length },
  { key: "tabular", label: "Tabular Data", icon: Table2,    count: MOCK_TABLE.rows.length  },
];

export default function ExtractionResult() {
  const [docPage, setDocPage]       = useState(2);
  const [showSchema, setShowSchema] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [confFilter, setConfFilter] = useState("all");
  const [activeTab, setActiveTab]   = useState("fields");
  const totalPages  = 24;
  const overallConf = 0.94;

  const jumpToPage = (p) => setDocPage(Math.min(totalPages, Math.max(1, p)));

  const downloadItems = [
    { icon: FileText,  label: "Original Document",   onClick: () => {} },
    { icon: ScanText,  label: "Digitized Document",  onClick: () => {} },
    "divider",
    { icon: Braces,    label: "Raw Response",        onClick: () => {} },
    { icon: FileJson,  label: "Structured Response", onClick: () => {} },
  ];

  const moreItems = [
    { icon: Code2,     label: "View Schema",  onClick: () => setShowSchema(true) },
    { icon: Share2,    label: "Share",        onClick: () => {} },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">

      {/* ── Top toolbar ── */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-slate-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl("PlaygroundV3")}>
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 text-slate-500">
              <ArrowLeft className="w-3.5 h-3.5" />Back
            </Button>
          </Link>
          <div className="h-4 w-px bg-slate-200" />
          <div>
            <p className="text-sm font-semibold text-slate-800">TaxDocument_0326.pdf</p>
            <p className="text-xs text-slate-400">Extraction complete · {totalPages} pages</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Confidence badge */}
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs font-semibold text-emerald-700">Overall {Math.round(overallConf * 100)}% confidence</span>
          </div>

          {/* Download menu */}
          <DropdownMenu
            trigger={
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-slate-200 cursor-pointer">
                <Download className="w-3.5 h-3.5" />Download
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </Button>
            }
            items={downloadItems}
          />

          {/* More menu */}
          <DropdownMenu
            trigger={
              <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-slate-200 cursor-pointer">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            }
            items={moreItems}
          />

          {/* Submit Review */}
          {submitted ? (
            <div className="flex items-center gap-1.5 bg-emerald-600 text-white rounded-lg px-3 py-1.5 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />Submitted
            </div>
          ) : (
            <Button
              size="sm"
              className="h-8 text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 border-0"
              onClick={() => setShowSubmit(true)}
            >
              <Send className="w-3.5 h-3.5" />Submit Review
            </Button>
          )}
        </div>
      </div>

      {/* ── Body: 2-column ── */}
      <div className="flex flex-1 min-h-0">

        {/* Left: Doc viewer */}
        <div className="flex flex-col border-r border-slate-200 bg-white flex-shrink-0" style={{ width: "42%" }}>
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 flex-shrink-0">
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-medium text-slate-600">TaxDocument_0326.pdf</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => jumpToPage(docPage - 1)} disabled={docPage <= 1}
                className="w-6 h-6 rounded hover:bg-slate-100 flex items-center justify-center disabled:opacity-30 text-base text-slate-500">‹</button>
              <span className="text-xs font-mono font-semibold text-slate-600 min-w-[52px] text-center">{docPage} / {totalPages}</span>
              <button onClick={() => jumpToPage(docPage + 1)} disabled={docPage >= totalPages}
                className="w-6 h-6 rounded hover:bg-slate-100 flex items-center justify-center disabled:opacity-30 text-base text-slate-500">›</button>
              <div className="w-px h-4 bg-slate-200 mx-0.5" />
              <button className="w-6 h-6 rounded hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                <Download className="w-3 h-3" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto bg-slate-100 flex items-start justify-center p-6">
            <div className="bg-white shadow-lg rounded-xl w-full min-h-[600px] flex items-center justify-center border border-slate-100">
              <div className="text-center space-y-3">
                <FileSearch2 className="w-12 h-12 mx-auto text-slate-200" />
                <p className="text-xs text-slate-400 font-medium">TaxDocument_0326.pdf</p>
                <p className="text-xs text-slate-300">Page {docPage} of {totalPages}</p>
                <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1.5 text-[10px] text-indigo-400 font-medium">
                  <ExternalLink className="w-3 h-3" />
                  Click any value to jump here
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Extraction results */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

          {/* Tab bar + confidence filter */}
          <div className="bg-white border-b border-slate-200 flex-shrink-0">
            <div className="flex items-center gap-0 px-5 pt-3">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all mr-1",
                      active
                        ? "border-indigo-600 text-indigo-700"
                        : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                    <span className={cn(
                      "text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center",
                      active ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-400"
                    )}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
              <div className="ml-auto flex items-center gap-1 pb-2 text-[10px] text-slate-400">
                <Info className="w-3 h-3" />
                Click any row to jump to source page
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-5 py-2.5 border-t border-slate-50">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-1">Filter:</span>
              {[
                { key: "all",  label: "All" },
                { key: "high", label: "High ≥90%",  dot: "bg-emerald-400" },
                { key: "mid",  label: "Avg 70–90%", dot: "bg-amber-400"   },
                { key: "low",  label: "Low <70%",   dot: "bg-red-400"     },
              ].map(({ key, label, dot }) => (
                <button
                  key={key}
                  onClick={() => setConfFilter(key)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
                    confFilter === key
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                  )}
                >
                  {dot && <span className={cn("w-1.5 h-1.5 rounded-full", dot)} />}
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {activeTab === "fields"  && <FlatFieldsTab  onJump={jumpToPage} confFilter={confFilter} />}
            {activeTab === "tabular" && <TabularDataTab onJump={jumpToPage} confFilter={confFilter} />}
          </div>
        </div>
      </div>

      {showSchema && <SchemaModal onClose={() => setShowSchema(false)} />}
      {showSubmit && (
        <SubmitReviewModal
          onClose={() => setShowSubmit(false)}
          onSubmit={() => setSubmitted(true)}
        />
      )}
    </div>
  );
}