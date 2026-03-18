import React from "react";
import { cn } from "@/lib/utils";
import { ScanText, RotateCw, Wand2, KeyRound } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const OPTIONS = [
  { key: "ocr", label: "OCR Enhancement", description: "Apply optical character recognition to improve text extraction accuracy.", icon: ScanText, color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
  { key: "rotation", label: "Auto Rotation", description: "Automatically detect and correct page rotation.", icon: RotateCw, color: "text-purple-600 bg-purple-50 border-purple-200" },
  { key: "denoise", label: "Denoise & Cleanup", description: "Remove noise, artifacts, and background from scanned documents.", icon: Wand2, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { key: "checkPassword", label: "Check Password", description: "Detect and handle password-protected documents before processing.", icon: KeyRound, color: "text-amber-600 bg-amber-50 border-amber-200" },
];

const PAGE_RANGES = ["all", "first-10", "custom"];

export default function EPStepPreProcessing({ data, onChange }) {
  const update = (key, val) => onChange({ ...data, [key]: val });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">Pre-Processing</h2>
        <p className="text-sm text-slate-500 mt-1">Configure how documents are prepared before processing.</p>
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        {OPTIONS.map(({ key, label, description, icon: Icon, color }) => {
          const active = !!data?.[key];
          return (
            <div key={key} className="space-y-1">
              <button
                type="button"
                onClick={() => update(key, !active)}
                className={cn(
                  "w-full text-left flex items-start gap-4 px-4 py-3.5 rounded-xl border-2 transition-all",
                  active ? `border-current ${color.split(" ")[2]} bg-opacity-30 ${color}` : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border", active ? color : "bg-slate-100 border-slate-200")}>
                  <Icon className={cn("w-4 h-4", active ? color.split(" ")[0] : "text-slate-400")} />
                </div>
                <div className="flex-1">
                  <p className={cn("text-sm font-semibold", active ? color.split(" ")[0] : "text-slate-700")}>{label}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{description}</p>
                </div>
                <div className={cn("w-4 h-4 rounded-full border-2 flex-shrink-0 mt-1 transition-all", active ? `border-current bg-current ${color.split(" ")[0]}` : "border-slate-300")} />
              </button>
              {key === "checkPassword" && active && (
                <div className="mt-2 px-4">
                  <Input
                    type="password"
                    placeholder="Enter document password (optional)"
                    className="h-8 text-xs"
                    value={data?.documentPassword || ""}
                    onChange={(e) => update("documentPassword", e.target.value)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Page range */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600">Page Range</Label>
        <div className="flex gap-2">
          {PAGE_RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => update("pageRange", r)}
              className={cn(
                "px-3 py-1.5 rounded-lg border text-xs font-medium capitalize transition-all",
                data?.pageRange === r || (!data?.pageRange && r === "all")
                  ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
              )}
            >
              {r === "first-10" ? "First 10 pages" : r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
        {(data?.pageRange === "custom") && (
          <input
            type="text"
            placeholder="e.g. 1-5, 8, 10-15"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 mt-2"
            value={data?.customRange || ""}
            onChange={(e) => update("customRange", e.target.value)}
          />
        )}
      </div>
    </div>
  );
}