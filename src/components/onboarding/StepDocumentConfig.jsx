import React from "react";
import { cn } from "@/lib/utils";
import { FileText, Zap, Scissors, Scan, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

const CAPABILITY_ICONS = {
  extraction: { icon: Zap, color: "text-indigo-600", bg: "bg-indigo-50", label: "Extraction" },
  split:      { icon: Scissors, color: "text-purple-600", bg: "bg-purple-50", label: "Split" },
  parse:      { icon: Scan, color: "text-emerald-600", bg: "bg-emerald-50", label: "Parse" },
  redaction:  { icon: EyeOff, color: "text-rose-600", bg: "bg-rose-50", label: "Redaction" },
};

const DOCUMENT_CONFIGS = [
  {
    id: 1,
    name: "Blackstone Q1 2026",
    fileName: "Blackstone_Q1_2026.pdf",
    typeLabel: "Alts Schedule",
    configs: { extraction: true, split: false, parse: false, redaction: false },
  },
  {
    id: 2,
    name: "Apollo Fund Report",
    fileName: "Apollo_Fund_Report.pdf",
    typeLabel: "Quarterly Report",
    configs: { extraction: true, split: true, parse: true, redaction: false },
  },
  {
    id: 3,
    name: "KKR Quarterly Dec",
    fileName: "KKR_Quarterly_Dec.pdf",
    typeLabel: "Quarterly Report",
    configs: { extraction: false, split: true, parse: false, redaction: true },
  },
  {
    id: 4,
    name: "Carlyle Alts Q4",
    fileName: "Carlyle_Alts_Q4.pdf",
    typeLabel: "Alts Schedule",
    configs: { extraction: true, split: false, parse: true, redaction: true },
  },
];

const CAPS = ["extraction", "split", "parse", "redaction"];

export default function StepDocumentConfig({ data, onChange }) {
  const selected = data.selectedDocConfigs || [];

  const toggle = (id) => {
    if (selected.includes(id)) {
      onChange({ selectedDocConfigs: selected.filter((x) => x !== id) });
    } else {
      onChange({ selectedDocConfigs: [...selected, id] });
    }
  };

  const toggleAll = () => {
    if (selected.length === DOCUMENT_CONFIGS.length) {
      onChange({ selectedDocConfigs: [] });
    } else {
      onChange({ selectedDocConfigs: DOCUMENT_CONFIGS.map((d) => d.id) });
    }
  };

  const allSelected = selected.length === DOCUMENT_CONFIGS.length;
  const someSelected = selected.length > 0 && !allSelected;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Document Configurations</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Select the document configs this profile will use. You can pick one or more.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="w-10 px-4 py-3">
                <Checkbox
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected; }}
                  onCheckedChange={toggleAll}
                />
              </th>
              <th className="text-left px-3 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Document</th>
              <th className="text-left px-3 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Type</th>
              {CAPS.map((cap) => {
                const { icon: Icon, color, label } = CAPABILITY_ICONS[cap];
                return (
                  <th key={cap} className="text-center px-3 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">
                    <span className={cn("inline-flex items-center gap-1", color)}>
                      <Icon className="w-3.5 h-3.5" />{label}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {DOCUMENT_CONFIGS.map((doc) => {
              const isSelected = selected.includes(doc.id);
              return (
                <tr
                  key={doc.id}
                  onClick={() => toggle(doc.id)}
                  className={cn(
                    "cursor-pointer transition-colors",
                    isSelected ? "bg-indigo-50/60" : "hover:bg-slate-50"
                  )}
                >
                  <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <Checkbox checked={isSelected} onCheckedChange={() => toggle(doc.id)} />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", isSelected ? "bg-indigo-100" : "bg-slate-100")}>
                        <FileText className={cn("w-3.5 h-3.5", isSelected ? "text-indigo-600" : "text-slate-400")} />
                      </div>
                      <div>
                        <p className={cn("font-semibold text-sm", isSelected ? "text-indigo-800" : "text-slate-800")}>{doc.name}</p>
                        <p className="text-xs text-slate-400 font-mono">{doc.fileName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <Badge variant="secondary" className="text-xs">{doc.typeLabel}</Badge>
                  </td>
                  {CAPS.map((cap) => {
                    const { icon: Icon, color, bg } = CAPABILITY_ICONS[cap];
                    return (
                      <td key={cap} className="px-3 py-3 text-center">
                        {doc.configs[cap] ? (
                          <span className={cn("inline-flex items-center justify-center w-6 h-6 rounded-full", bg)}>
                            <Icon className={cn("w-3.5 h-3.5", color)} />
                          </span>
                        ) : (
                          <span className="text-slate-200">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected.length > 0 && (
        <p className="text-xs text-indigo-600 font-medium">{selected.length} config{selected.length > 1 ? "s" : ""} selected</p>
      )}
    </div>
  );
}