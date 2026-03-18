import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { FileText, Check, Zap, Scissors, Scan, EyeOff } from "lucide-react";
import { documentConfigsService } from "@/components/services/dataService";
import { Badge } from "@/components/ui/badge";

const CAP_ICONS = { extraction: Zap, split: Scissors, parse: Scan, redaction: EyeOff };
const CAP_COLORS = { extraction: "text-indigo-600 bg-indigo-50", split: "text-purple-600 bg-purple-50", parse: "text-emerald-600 bg-emerald-50", redaction: "text-rose-600 bg-rose-50" };

export default function EPStepDocConfig({ data, onChange }) {
  const [configs, setConfigs] = useState([]);

  useEffect(() => {
    documentConfigsService.getAll().then(setConfigs);
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">Select Document Config</h2>
        <p className="text-sm text-slate-500 mt-1">Choose the document configuration to use for this plan.</p>
      </div>

      <div className="space-y-2">
        {configs.map((c) => {
          const selected = data?.id === c.id;
          const active = Object.entries(c.configs || {}).filter(([, v]) => v?.enabled).map(([k]) => k);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onChange(c)}
              className={cn(
                "w-full text-left flex items-start gap-4 px-4 py-3.5 rounded-xl border-2 transition-all",
                selected ? "border-indigo-400 bg-indigo-50" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5", selected ? "bg-indigo-100" : "bg-slate-100")}>
                <FileText className={cn("w-4 h-4", selected ? "text-indigo-600" : "text-slate-400")} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-semibold", selected ? "text-indigo-700" : "text-slate-700")}>{c.name}</p>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{c.fileName}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {active.map((cap) => {
                    const Icon = CAP_ICONS[cap];
                    return Icon ? (
                      <span key={cap} className={cn("inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full", CAP_COLORS[cap])}>
                        <Icon className="w-2.5 h-2.5" />{cap}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
              {selected && <Check className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-1" />}
            </button>
          );
        })}
        {configs.length === 0 && (
          <p className="text-sm text-slate-400 italic py-4">No document configs found. Add one in Document Config first.</p>
        )}
      </div>
    </div>
  );
}