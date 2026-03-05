import React from "react";
import { cn } from "@/lib/utils";
import { FileText, Zap, Scissors, Scan, EyeOff, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const CAPABILITY_ICONS = {
  extraction: { icon: Zap, color: "text-indigo-600", bg: "bg-indigo-50" },
  split:      { icon: Scissors, color: "text-purple-600", bg: "bg-purple-50" },
  parse:      { icon: Scan, color: "text-emerald-600", bg: "bg-emerald-50" },
  redaction:  { icon: EyeOff, color: "text-rose-600", bg: "bg-rose-50" },
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

export default function StepDocumentConfig({ data, onChange }) {
  const selected = data.selectedDocConfigs || [];

  const toggle = (id) => {
    if (selected.includes(id)) {
      onChange({ selectedDocConfigs: selected.filter((x) => x !== id) });
    } else {
      onChange({ selectedDocConfigs: [...selected, id] });
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Document Configurations</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Select the document configs this profile will use. You can pick one or more.
        </p>
      </div>

      <div className="space-y-3">
        {DOCUMENT_CONFIGS.map((doc) => {
          const isSelected = selected.includes(doc.id);
          const enabledCaps = Object.entries(doc.configs).filter(([, v]) => v).map(([k]) => k);

          return (
            <button
              key={doc.id}
              onClick={() => toggle(doc.id)}
              className={cn(
                "w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between gap-4",
                isSelected
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              )}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", isSelected ? "bg-indigo-100" : "bg-slate-100")}>
                  <FileText className={cn("w-4 h-4", isSelected ? "text-indigo-600" : "text-slate-400")} />
                </div>
                <div className="min-w-0">
                  <p className={cn("font-semibold text-sm truncate", isSelected ? "text-indigo-800" : "text-slate-800")}>{doc.name}</p>
                  <p className="text-xs text-slate-400 font-mono truncate">{doc.fileName}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <Badge variant="secondary" className="text-xs">{doc.typeLabel}</Badge>
                    {enabledCaps.map((cap) => {
                      const { icon: Icon, color, bg } = CAPABILITY_ICONS[cap];
                      return (
                        <span key={cap} className={cn("inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full", color, bg)}>
                          <Icon className="w-3 h-3" />
                          {cap.charAt(0).toUpperCase() + cap.slice(1)}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                isSelected ? "bg-indigo-600 border-indigo-600" : "border-slate-300"
              )}>
                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
              </div>
            </button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <p className="text-xs text-indigo-600 font-medium">{selected.length} config{selected.length > 1 ? "s" : ""} selected</p>
      )}
    </div>
  );
}