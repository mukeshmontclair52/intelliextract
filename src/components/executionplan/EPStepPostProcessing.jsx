import React from "react";
import { cn } from "@/lib/utils";
import { FileJson, Table, FileText, Mail, Radio, Database, HardDrive, Webhook } from "lucide-react";
import { Input } from "@/components/ui/input";

const OUTPUT_FORMATS = [
  { value: "json", label: "JSON", icon: FileJson },
  { value: "csv", label: "CSV", icon: Table },
  { value: "markdown", label: "Markdown", icon: FileText },
];

const NOTIFY_OPTIONS = [
  { key: "email", label: "Email", icon: Mail, placeholder: "notify@example.com", inputType: "email", field: "emailAddress" },
  { key: "kafka", label: "Kafka", icon: Radio, placeholder: "kafka-topic-name", inputType: "text", field: "kafkaTopic" },
];

const STORAGE_OPTIONS = [
  { key: "s3", label: "S3", icon: HardDrive, placeholder: "s3://my-bucket/output-path/", inputType: "text", field: "s3Bucket" },
  { key: "cds", label: "CDS", icon: Database, placeholder: "CDS endpoint or path", inputType: "text", field: "cdsEndpoint" },
  { key: "webhook", label: "Webhook URL", icon: Webhook, placeholder: "https://your-endpoint.com/webhook", inputType: "url", field: "webhookUrl" },
];

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-3">
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function ToggleOptionRow({ label, icon: Icon, active, onToggle, field, placeholder, inputType, value, onInputChange }) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all",
          active ? "border-indigo-300 bg-indigo-50" : "border-slate-200 bg-white hover:border-slate-300"
        )}
      >
        <div className="flex items-center gap-2.5">
          <Icon className={cn("w-4 h-4", active ? "text-indigo-500" : "text-slate-400")} />
          <span className={cn("text-sm font-medium", active ? "text-indigo-700" : "text-slate-600")}>{label}</span>
        </div>
        <div className={cn("relative rounded-full transition-colors flex-shrink-0", active ? "bg-indigo-500" : "bg-slate-200")} style={{ height: "18px", width: "32px" }}>
          <span className={cn("absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-transform", active && "translate-x-3.5")} />
        </div>
      </button>
      {active && (
        <div className="mt-1.5 px-1">
          <Input
            type={inputType}
            placeholder={placeholder}
            className="h-8 text-xs"
            value={value || ""}
            onChange={(e) => onInputChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}

export default function EPStepPostProcessing({ data, onChange }) {
  const update = (key, val) => onChange({ ...data, [key]: val });
  const d = data || {};

  const toggleOption = (key) => update(key, !d[key]);

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">Post-Processing</h2>
        <p className="text-sm text-slate-500 mt-1">Configure how results are delivered and stored after processing.</p>
      </div>

      {/* Output Format */}
      <div>
        <SectionHeader title="Output Format" subtitle="Choose the format for the processed output." />
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

      {/* Notify */}
      <div>
        <SectionHeader title="Notify" subtitle="Send notifications when processing completes." />
        <div className="space-y-2">
          {NOTIFY_OPTIONS.map((opt) => (
            <ToggleOptionRow
              key={opt.key}
              label={opt.label}
              icon={opt.icon}
              active={!!d[opt.key]}
              onToggle={() => toggleOption(opt.key)}
              placeholder={opt.placeholder}
              inputType={opt.inputType}
              value={d[opt.field]}
              onInputChange={(v) => update(opt.field, v)}
            />
          ))}
        </div>
      </div>

      {/* Storage */}
      <div>
        <SectionHeader title="Storage" subtitle="Export results to external storage destinations." />
        <div className="space-y-2">
          {STORAGE_OPTIONS.map((opt) => (
            <ToggleOptionRow
              key={opt.key}
              label={opt.label}
              icon={opt.icon}
              active={!!d[opt.key]}
              onToggle={() => toggleOption(opt.key)}
              placeholder={opt.placeholder}
              inputType={opt.inputType}
              value={d[opt.field]}
              onInputChange={(v) => update(opt.field, v)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}