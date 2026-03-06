import React, { useState } from "react";
import { ArrowLeft, Download, Maximize2, ChevronDown, ChevronRight, Plus, FileSearch2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

const MOCK_SCHEMA_FIELDS = [
  {
    key: "account_owner_name",
    type: "String",
    desc: "The full name of the account owner.",
  },
  {
    key: "year",
    type: "String",
    desc: "The tax year for which the statement is issued.",
  },
  {
    key: "interest_income",
    type: "Number",
    desc: "The total interest income reported in 1099-INT box 1.",
  },
  {
    key: "tax",
    type: "Object",
    desc: "Details regarding federal income tax withheld across various forms.",
    children: [
      { key: "federal_income_tax_withheld_1099_div", type: "Number", desc: "Federal Income tax withheld as reported in 1099-DIV box 4." },
      { key: "federal_income_tax_withheld_1099_int", type: "Number", desc: "Federal income tax withheld as reported in 1099-INT box 4." },
      { key: "federal_income_tax_withheld_1099_misc", type: "Number", desc: "Federal income tax withheld as reported in 1099-MISC box 4." },
      { key: "federal_income_tax_withheld_1099_oid", type: "Number", desc: "Federal income tax withheld as reported in 1099-OID box 4." },
      { key: "federal_income_tax_withheld_1099_b", type: "Number", desc: "Federal income tax withheld as reported in 1099-B box 4." },
    ],
  },
];

const MOCK_DATA = {
  account_owner_name: "MUKESH BAJAJ",
  year: "2025",
  interest_income: 0.56,
  tax: {
    federal_income_tax_withheld_1099_div: 0,
    federal_income_tax_withheld_1099_int: 0,
    federal_income_tax_withheld_1099_misc: 0,
    federal_income_tax_withheld_1099_oid: 0,
    federal_income_tax_withheld_1099_b: 0,
  },
};

const MOCK_METADATA = {
  account_owner_name: {
    value: "MUKESH BAJAJ",
    references: ["05051f3e-7408-45b4-8eaa-941f86471d31", "386f58af-db3a-46d0-b1c9-2cca63150f10", "5c//b4d6d-ad3b-4a55-8918-67bef1afffe7"],
  },
  year: {
    value: "2025",
    references: ["feb9b7a0-ab08-4367-88ca-c872b0be9083", "43f782b8-7527-4429-810b-a89d50af444a", "bc0dd2fd-1028-44cb-a0b1-5121b9c7ca8c"],
  },
  interest_income: {
    value: 0.54,
    references: ["2-x", "9-1"],
  },
  tax: {
    federal_income_tax_withheld_1099_div: {
      value: 0,
      references: ["2-v", "9-u"],
    },
  },
};

const TYPE_COLORS = {
  String: "text-emerald-600",
  Number: "text-blue-500",
  Object: "text-orange-500",
  Array: "text-purple-500",
};

function SchemaField({ field, depth = 0 }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = field.children && field.children.length > 0;

  return (
    <div className={cn("border-b border-slate-100 last:border-0", depth > 0 && "ml-6 border-l border-slate-200 pl-4")}>
      <div className="py-3 px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {hasChildren && (
              <button onClick={() => setExpanded(!expanded)} className="flex-shrink-0 text-slate-400 hover:text-slate-600">
                {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            )}
            <span className="font-mono text-sm font-medium text-slate-800 truncate">{field.key}</span>
            <span className={cn("text-xs font-medium flex-shrink-0 flex items-center gap-0.5", TYPE_COLORS[field.type] || "text-slate-500")}>
              {field.type}
              <ChevronDown className="w-3 h-3 opacity-50" />
            </span>
          </div>
        </div>
        {field.desc && (
          <p className={cn("text-xs mt-0.5 leading-relaxed", field.type === "Object" ? "text-orange-500" : "text-slate-500")}>
            {field.desc}
          </p>
        )}
      </div>
      {hasChildren && expanded && (
        <div>
          {field.children.map((child) => (
            <SchemaField key={child.key} field={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function JsonBlock({ data, title }) {
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden mb-3">
      <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-600">{title}</span>
      </div>
      <pre className="p-3 text-xs font-mono text-slate-700 bg-white overflow-auto max-h-64 leading-relaxed">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

export default function ExtractionResult() {
  const [page, setPage] = useState(2);
  const totalPages = 24;

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* Top toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-1">
          {["Parse", "Split", "Extract", "Chat"].map((label) => (
            <button
              key={label}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all",
                label === "Extract"
                  ? "bg-slate-100 text-slate-700 border-slate-200"
                  : "text-slate-500 border-transparent hover:bg-slate-50"
              )}
            >
              {(label === "Extract" || label === "Chat") && <Plus className="w-3.5 h-3.5 text-slate-400" />}
              {label}
              {label === "Split" && <Badge className="bg-teal-500 text-white text-[10px] px-1.5 py-0 rounded-full border-0 ml-0.5">Preview</Badge>}
            </button>
          ))}
        </div>
        <button className="text-slate-400 hover:text-slate-600"><Share2 className="w-4 h-4" /></button>
      </div>

      {/* Body: 3-column layout */}
      <div className="flex flex-1 min-h-0">

        {/* Left: Doc preview */}
        <div className="flex flex-col border-r border-slate-200" style={{ width: "33%" }}>
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-white flex-shrink-0">
            <span className="text-sm text-slate-600 font-medium truncate max-w-[160px]">TaxDocum...0326.pdf</span>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="hover:text-slate-800 disabled:opacity-30">&#8249;</button>
              <span>{page} / {totalPages}</span>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="hover:text-slate-800 disabled:opacity-30">&#8250;</button>
              <Download className="w-4 h-4 text-slate-400 ml-1" />
            </div>
          </div>
          <div className="flex-1 overflow-auto bg-slate-100 flex items-start justify-center p-4">
            <div className="bg-white shadow-md rounded w-full min-h-[600px] flex items-center justify-center text-slate-300 text-sm">
              <div className="text-center">
                <FileSearch2 className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p className="text-xs">TaxDocument_0326.pdf</p>
                <p className="text-xs mt-1">Page {page}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Middle: Schema */}
        <div className="flex flex-col border-r border-slate-200 overflow-hidden" style={{ width: "34%" }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 flex-shrink-0">
            <h2 className="text-sm font-semibold text-slate-800">Schema</h2>
            <div className="flex items-center gap-2">
              <button className="text-slate-400 hover:text-slate-600"><Download className="w-3.5 h-3.5" /></button>
              <button className="text-slate-400 hover:text-slate-600 text-lg leading-none">···</button>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs h-7 px-3">
                Run Schema
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            {MOCK_SCHEMA_FIELDS.map((field) => (
              <SchemaField key={field.key} field={field} />
            ))}
          </div>
          <div className="border-t border-slate-100 px-4 py-3 flex items-center gap-3 bg-white flex-shrink-0">
            <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 transition-colors">
              <Plus className="w-3.5 h-3.5" />Add New Field
            </button>
            <button className="text-slate-400 hover:text-slate-600">
              <span className="text-base leading-none">💡</span>
            </button>
          </div>
        </div>

        {/* Right: Extracted Results */}
        <div className="flex flex-col overflow-hidden" style={{ width: "33%" }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 flex-shrink-0">
            <h2 className="text-sm font-semibold text-slate-800">Extracted Results</h2>
            <div className="flex items-center gap-2">
              <button className="text-slate-400 hover:text-slate-600"><Share2 className="w-3.5 h-3.5" /></button>
              <button className="text-slate-400 hover:text-slate-600"><Maximize2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
          <p className="text-xs text-slate-400 px-4 pt-2 pb-1 flex-shrink-0">Results are up to date with the schema.</p>
          <div className="flex-1 overflow-auto p-4 space-y-3">
            <JsonBlock data={MOCK_DATA} title="Data" />
            <JsonBlock data={MOCK_METADATA} title="Metadata" />
          </div>
          <div className="border-t border-slate-100 px-4 py-2.5 flex-shrink-0">
            <Link to={createPageUrl("Playground")}>
              <Button variant="outline" size="sm" className="text-xs h-7 gap-1.5">
                <ArrowLeft className="w-3 h-3" />Back to Playground
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}