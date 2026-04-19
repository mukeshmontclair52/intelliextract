import React, { useState } from "react";
import {
  ArrowLeft, Download, Share2, FileSearch2, CheckCircle2,
  AlertCircle, ChevronDown, ChevronRight, Code2, X, ExternalLink,
  Table2, AlignLeft, Layers, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

// ── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_FLAT_FIELDS = [
  { key: "account_owner_name", value: "MUKESH BAJAJ", confidence: 0.98, page: 2, type: "String" },
  { key: "year", value: "2025", confidence: 0.99, page: 1, type: "String" },
  { key: "interest_income", value: "$0.56", confidence: 0.91, page: 5, type: "Number" },
  { key: "account_number", value: "****-8821", confidence: 0.97, page: 1, type: "String" },
  { key: "statement_date", value: "2025-12-31", confidence: 0.96, page: 1, type: "String" },
  { key: "institution_name", value: "JPMorgan Chase", confidence: 0.99, page: 1, type: "String" },
];

const MOCK_NESTED = {
  key: "tax",
  label: "Tax Withholding Details",
  confidence: 0.93,
  page: 3,
  children: [
    { key: "federal_income_tax_withheld_1099_div", value: "$0.00", confidence: 0.95, page: 3 },
    { key: "federal_income_tax_withheld_1099_int", value: "$0.00", confidence: 0.94, page: 4 },
    { key: "federal_income_tax_withheld_1099_misc", value: "$0.00", confidence: 0.93, page: 4 },
    { key: "federal_income_tax_withheld_1099_oid", value: "$0.00", confidence: 0.91, page: 5 },
    { key: "federal_income_tax_withheld_1099_b", value: "$12.40", confidence: 0.88, page: 6 },
  ],
};

const MOCK_TABLE = {
  key: "transactions",
  label: "Transaction History",
  confidence: 0.89,
  columns: ["Date", "Description", "Amount", "Type"],
  rows: [
    { values: ["2025-01-15", "Dividend Payment", "$245.80", "Credit"], confidence: 0.92, page: 8 },
    { values: ["2025-02-10", "Interest Accrual", "$0.56", "Credit"], confidence: 0.91, page: 9 },
    { values: ["2025-03-22", "Tax Withheld 1099-B", "$12.40", "Debit"], confidence: 0.88, page: 10 },
    { values: ["2025-06-15", "Dividend Payment", "$312.50", "Credit"], confidence: 0.94, page: 12 },
    { values: ["2025-09-30", "Capital Gains Distribution", "$1,204.00", "Credit"], confidence: 0.86, page: 14 },
  ],
};

const MOCK_SCHEMA_FIELDS = [
  { key: "account_owner_name", type: "String", desc: "The full name of the account owner." },
  { key: "year", type: "String", desc: "Tax year of the statement." },
  { key: "interest_income", type: "Number", desc: "Total interest income reported in 1099-INT box 1." },
  { key: "account_number", type: "String", desc: "Masked account number." },
  { key: "statement_date", type: "String", desc: "Statement end date." },
  { key: "institution_name", type: "String", desc: "Name of the financial institution." },
  {
    key: "tax", type: "Object", desc: "Federal tax withholding details across forms.",
    children: [
      { key: "federal_income_tax_withheld_1099_div", type: "Number" },
      { key: "federal_income_tax_withheld_1099_int", type: "Number" },
      { key: "federal_income_tax_withheld_1099_misc", type: "Number" },
      { key: "federal_income_tax_withheld_1099_oid", type: "Number" },
      { key: "federal_income_tax_withheld_1099_b", type: "Number" },
    ],
  },
  { key: "transactions", type: "Array", desc: "List of account transactions." },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function ConfidencePill({ value }) {
  const pct = Math.round(value * 100);
  const color = pct >= 95 ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : pct >= 85 ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-red-50 text-red-700 border-red-200";
  const dot = pct >= 95 ? "bg-emerald-400" : pct >= 85 ? "bg-amber-400" : "bg-red-400";
  return (
    <span className={cn("inline-flex items-center gap-1 text-[10px] font-semibold border rounded-full px-1.5 py-0.5", color)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", dot)} />
      {pct}%
    </span>
  );
}

function PageLink({ page, onJump }) {
  return (
    <button
      onClick={() => onJump(page)}
      className="inline-flex items-center gap-0.5 text-[10px] text-indigo-500 hover:text-indigo-700 hover:underline font-medium transition-colors"
    >
      p.{page} <ExternalLink className="w-2.5 h-2.5" />
    </button>
  );
}

// ── Schema Modal ──────────────────────────────────────────────────────────────

function SchemaModal({ onClose }) {
  const TYPE_COLORS = { String: "text-emerald-600", Number: "text-blue-500", Object: "text-orange-500", Array: "text-purple-500" };
  const [expanded, setExpanded] = useState({});
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
            <div key={f.key}>
              <div className="px-5 py-3 flex items-start gap-3">
                {f.children && (
                  <button onClick={() => setExpanded(p => ({ ...p, [f.key]: !p[f.key] }))} className="mt-0.5 text-slate-400 hover:text-slate-600">
                    {expanded[f.key] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                )}
                {!f.children && <span className="w-3.5" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-800">{f.key}</span>
                    <span className={cn("text-[10px] font-bold", TYPE_COLORS[f.type] || "text-slate-400")}>{f.type}</span>
                  </div>
                  {f.desc && <p className="text-xs text-slate-400 mt-0.5">{f.desc}</p>}
                </div>
              </div>
              {f.children && expanded[f.key] && (
                <div className="pl-10 divide-y divide-slate-50 bg-slate-50/50">
                  {f.children.map(c => (
                    <div key={c.key} className="px-5 py-2.5 flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-600">{c.key}</span>
                      <span className={cn("text-[10px] font-bold", TYPE_COLORS[c.type] || "text-slate-400")}>{c.type}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Result Sections ───────────────────────────────────────────────────────────

function FlatFieldsSection({ onJump }) {
  const avgConf = MOCK_FLAT_FIELDS.reduce((s, f) => s + f.confidence, 0) / MOCK_FLAT_FIELDS.length;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/60">
        <div className="flex items-center gap-2">
          <AlignLeft className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Flat Fields</span>
          <span className="text-xs text-slate-400">{MOCK_FLAT_FIELDS.length} fields</span>
        </div>
        <ConfidencePill value={avgConf} />
      </div>
      <div className="divide-y divide-slate-50">
        {MOCK_FLAT_FIELDS.map((f) => (
          <div key={f.key} className="flex items-center justify-between px-4 py-2.5 hover:bg-indigo-50/30 group transition-colors">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono text-xs text-slate-500 truncate">{f.key}</span>
            </div>
            <div className="flex items-center gap-2.5 flex-shrink-0 ml-3">
              <ConfidencePill value={f.confidence} />
              <PageLink page={f.page} onJump={onJump} />
              <span
                className="text-sm font-semibold text-slate-800 text-right max-w-[150px] truncate cursor-pointer group-hover:text-indigo-700 transition-colors"
                title={String(f.value)}
                onClick={() => onJump(f.page)}
              >
                {String(f.value)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NestedSection({ onJump }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <button
        className="w-full flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Nested Objects</span>
          <span className="text-xs text-slate-400">{MOCK_NESTED.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <ConfidencePill value={MOCK_NESTED.confidence} />
          <PageLink page={MOCK_NESTED.page} onJump={onJump} />
          {open ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
        </div>
      </button>
      {open && (
        <div className="divide-y divide-slate-50">
          {MOCK_NESTED.children.map((c) => (
            <div key={c.key} className="flex items-center justify-between px-4 py-2.5 pl-8 hover:bg-indigo-50/30 group transition-colors">
              <span className="font-mono text-xs text-slate-500 truncate">{c.key}</span>
              <div className="flex items-center gap-2.5 flex-shrink-0 ml-3">
                <ConfidencePill value={c.confidence} />
                <PageLink page={c.page} onJump={onJump} />
                <span
                  className="text-sm font-semibold text-slate-800 cursor-pointer group-hover:text-indigo-700 transition-colors"
                  onClick={() => onJump(c.page)}
                >
                  {c.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TableSection({ onJump }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <button
        className="w-full flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          <Table2 className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Tabular Data</span>
          <span className="text-xs text-slate-400">{MOCK_TABLE.label} · {MOCK_TABLE.rows.length} rows</span>
        </div>
        <div className="flex items-center gap-2">
          <ConfidencePill value={MOCK_TABLE.confidence} />
          {open ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
        </div>
      </button>
      {open && (
        <div className="overflow-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {MOCK_TABLE.columns.map((col) => (
                  <th key={col} className="text-left px-4 py-2 font-semibold text-slate-500 uppercase tracking-wide text-[10px]">{col}</th>
                ))}
                <th className="px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wide text-right">Conf · Page</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {MOCK_TABLE.rows.map((row, i) => (
                <tr
                  key={i}
                  onClick={() => onJump(row.page)}
                  className="hover:bg-indigo-50/40 cursor-pointer group transition-colors"
                >
                  {row.values.map((v, j) => (
                    <td key={j} className="px-4 py-2.5 text-slate-700 font-medium group-hover:text-indigo-700 transition-colors">
                      {v}
                    </td>
                  ))}
                  <td className="px-3 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <ConfidencePill value={row.confidence} />
                      <PageLink page={row.page} onJump={onJump} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ExtractionResult() {
  const [page, setPage] = useState(2);
  const [showSchema, setShowSchema] = useState(false);
  const totalPages = 24;

  const overallConf = 0.94;

  const jumpToPage = (p) => {
    setPage(Math.min(totalPages, Math.max(1, p)));
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      {/* Top toolbar */}
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
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs font-semibold text-emerald-700">Overall {Math.round(overallConf * 100)}% confidence</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5 border-slate-200"
            onClick={() => setShowSchema(true)}
          >
            <Code2 className="w-3.5 h-3.5" />View Schema
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-slate-200">
            <Download className="w-3.5 h-3.5" />Export JSON
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-slate-200">
            <Share2 className="w-3.5 h-3.5" />Share
          </Button>
        </div>
      </div>

      {/* Body: 2-column */}
      <div className="flex flex-1 min-h-0 gap-0">

        {/* Left: Doc viewer */}
        <div className="flex flex-col border-r border-slate-200 bg-white flex-shrink-0" style={{ width: "42%" }}>
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-white flex-shrink-0">
            <span className="text-xs font-medium text-slate-600 truncate max-w-[180px]">TaxDocument_0326.pdf</span>
            <div className="flex items-center gap-2 text-slate-500">
              <button
                onClick={() => jumpToPage(page - 1)}
                disabled={page <= 1}
                className="w-6 h-6 rounded hover:bg-slate-100 flex items-center justify-center disabled:opacity-30 text-base"
              >‹</button>
              <span className="text-xs font-mono font-medium text-slate-600 min-w-[48px] text-center">{page} / {totalPages}</span>
              <button
                onClick={() => jumpToPage(page + 1)}
                disabled={page >= totalPages}
                className="w-6 h-6 rounded hover:bg-slate-100 flex items-center justify-center disabled:opacity-30 text-base"
              >›</button>
              <Download className="w-3.5 h-3.5 text-slate-400 ml-1 cursor-pointer hover:text-slate-600" />
            </div>
          </div>
          <div className="flex-1 overflow-auto bg-slate-100 flex items-start justify-center p-6">
            <div className="bg-white shadow-lg rounded-lg w-full min-h-[640px] flex items-center justify-center text-slate-200 border border-slate-100">
              <div className="text-center">
                <FileSearch2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-xs text-slate-400 font-medium">TaxDocument_0326.pdf</p>
                <p className="text-xs text-slate-300 mt-1">Page {page} of {totalPages}</p>
                <p className="text-[10px] text-indigo-300 mt-3 bg-indigo-50 rounded-full px-3 py-1">Click any data cell to jump here</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Extraction results */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-white flex-shrink-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-800">Extracted Results</h2>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">
                <Info className="w-3 h-3" />
                Click any value to jump to its source page
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">{MOCK_FLAT_FIELDS.length + MOCK_NESTED.children.length + MOCK_TABLE.rows.length} values extracted</span>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-5 space-y-4">
            <FlatFieldsSection onJump={jumpToPage} />
            <NestedSection onJump={jumpToPage} />
            <TableSection onJump={jumpToPage} />
          </div>
        </div>

      </div>

      {showSchema && <SchemaModal onClose={() => setShowSchema(false)} />}
    </div>
  );
}