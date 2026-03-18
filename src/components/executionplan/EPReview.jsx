import React from "react";
import { AppWindow, FileText, ScanText, Webhook, Mail, Upload, FileJson } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function Row({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <div className="w-7 h-7 rounded-md bg-indigo-50 flex items-center justify-center flex-shrink-0">
        <Icon className="w-3.5 h-3.5 text-indigo-500" />
      </div>
      <span className="text-xs text-slate-500 w-36 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-slate-800">{value}</span>
    </div>
  );
}

export default function EPReview({ plan }) {
  const { profile, docConfig, preProcessing, postProcessing } = plan;

  const preOpts = [
    preProcessing?.ocr && "OCR Enhancement",
    preProcessing?.rotation && "Auto Rotation",
    preProcessing?.denoise && "Denoise & Cleanup",
  ].filter(Boolean);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">Review & Confirm</h2>
        <p className="text-sm text-slate-500 mt-1">Review your execution plan before saving.</p>
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Profile</p>
        <div className="bg-white rounded-lg border border-slate-200 px-4">
          <Row icon={AppWindow} label="App Name" value={profile?.appName} />
          <Row icon={AppWindow} label="App ID" value={profile?.appId} />
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Document Config</p>
        <div className="bg-white rounded-lg border border-slate-200 px-4">
          <Row icon={FileText} label="Config Name" value={docConfig?.name} />
          <Row icon={FileText} label="File" value={docConfig?.fileName} />
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Pre-Processing</p>
        <div className="bg-white rounded-lg border border-slate-200 px-4">
          <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
            <div className="w-7 h-7 rounded-md bg-indigo-50 flex items-center justify-center flex-shrink-0">
              <ScanText className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <span className="text-xs text-slate-500 w-36 flex-shrink-0">Options</span>
            <div className="flex flex-wrap gap-1.5">
              {preOpts.length > 0 ? preOpts.map((o) => (
                <Badge key={o} variant="secondary" className="text-xs">{o}</Badge>
              )) : <span className="text-sm text-slate-400">None</span>}
            </div>
          </div>
          <Row icon={ScanText} label="Page Range" value={preProcessing?.pageRange || "all"} />
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Post-Processing</p>
        <div className="bg-white rounded-lg border border-slate-200 px-4">
          <Row icon={FileJson} label="Output Format" value={(postProcessing?.outputFormat || "json").toUpperCase()} />
          <Row icon={Webhook} label="Webhook" value={postProcessing?.webhook} />
          <Row icon={Mail} label="Email Notify" value={postProcessing?.emailNotify?.[0]} />
          {postProcessing?.s3Export && <Row icon={Upload} label="S3 Bucket" value={postProcessing?.s3Bucket} />}
        </div>
      </div>
    </div>
  );
}