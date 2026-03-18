import React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Webhook, Mail, Upload, FileJson, FileText, Table } from "lucide-react";

const OUTPUT_FORMATS = [
  { value: "json", label: "JSON", icon: FileJson },
  { value: "csv", label: "CSV", icon: Table },
  { value: "markdown", label: "Markdown", icon: FileText },
];

export default function EPStepPostProcessing({ data, onChange }) {
  const update = (key, val) => onChange({ ...data, [key]: val });
  const d = data || {};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">Post-Processing</h2>
        <p className="text-sm text-slate-500 mt-1">Configure how results are delivered and stored after processing.</p>
      </div>

      {/* Output format */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600">Output Format</Label>
        <div className="flex gap-2">
          {OUTPUT_FORMATS.map(({ value, label, icon: Icon }) => {
            const active = d.outputFormat === value || (!d.outputFormat && value === "json");
            return (
              <button
                key={value}
                type="button"
                onClick={() => update("outputFormat", value)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all",
                  active ? "border-indigo-400 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                )}
              >
                <Icon className={cn("w-4 h-4", active ? "text-indigo-500" : "text-slate-400")} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Webhook */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
          <Webhook className="w-3.5 h-3.5" /> Webhook URL
        </Label>
        <input
          type="url"
          placeholder="https://your-endpoint.com/webhook"
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
          value={d.webhook || ""}
          onChange={(e) => update("webhook", e.target.value)}
        />
      </div>

      {/* Email notifications */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5" /> Email Notifications
        </Label>
        <input
          type="email"
          placeholder="notify@example.com"
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
          value={d.emailNotify?.[0] || ""}
          onChange={(e) => update("emailNotify", e.target.value ? [e.target.value] : [])}
        />
      </div>

      {/* S3 Export */}
      <div className={cn("rounded-xl border-2 transition-all", d.s3Export ? "border-indigo-300 bg-indigo-50/40" : "border-slate-200 bg-white")}>
        <button
          type="button"
          onClick={() => update("s3Export", !d.s3Export)}
          className="w-full flex items-center justify-between px-4 py-3"
        >
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">Export to S3</span>
          </div>
          <div className={cn("relative rounded-full transition-colors flex-shrink-0", d.s3Export ? "bg-indigo-500" : "bg-slate-200")} style={{ height: "18px", width: "32px" }}>
            <span className={cn("absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-transform", d.s3Export && "translate-x-3.5")} />
          </div>
        </button>
        {d.s3Export && (
          <div className="px-4 pb-4">
            <input
              type="text"
              placeholder="s3://my-bucket/output-path/"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
              value={d.s3Bucket || ""}
              onChange={(e) => update("s3Bucket", e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );
}