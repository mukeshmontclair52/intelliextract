import React from "react";
import { Badge } from "@/components/ui/badge";
import { Hash, AppWindow, Mail, UserCheck, FileText, Zap, Tag, ShieldCheck } from "lucide-react";

function ReviewRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <div className="w-7 h-7 rounded-md bg-indigo-50 flex items-center justify-center flex-shrink-0">
        <Icon className="w-3.5 h-3.5 text-indigo-500" />
      </div>
      <span className="text-xs text-slate-500 w-36 flex-shrink-0">{label}</span>
      <span className="text-sm text-slate-800 font-medium">{value}</span>
    </div>
  );
}

const docTypeLabels = {
  "alts-schedule": "Alts Schedule on Investment",
  "quarterly-report": "Quarterly Report",
  "annual-statement": "Annual Statement",
  "fund-summary": "Fund Summary",
};

const ingestionLabels = {
  email: "Email",
  api: "API",
  kafka: "Kafka Event",
  s3: "S3 / Storage",
};

export default function StepReview({ profile, useCasesData, docPrefs }) {
  const useCases = useCasesData?.useCases || [];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">Review & Confirm</h2>
        <p className="text-sm text-slate-500 mt-1">Please review your settings before finishing onboarding.</p>
      </div>

      {/* Profile */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">App Profile</p>
        <div className="bg-white rounded-lg border border-slate-200 px-4">
          <ReviewRow icon={Hash} label="App ID" value={profile.appId} />
          <ReviewRow icon={AppWindow} label="App Name" value={profile.appName} />
          <ReviewRow icon={Mail} label="Contact Email" value={profile.contactEmail} />
          {(profile.approvers || []).length > 0 && (
            <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
              <div className="w-7 h-7 rounded-md bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
              </div>
              <span className="text-xs text-slate-500 w-36 flex-shrink-0 mt-0.5">Approvers</span>
              <div className="flex flex-wrap gap-1.5">
                {profile.approvers.map((e) => (
                  <Badge key={e} variant="secondary" className="text-xs">{e}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Roles */}
      {(profile.roles || []).length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Roles</p>
          <div className="bg-white rounded-lg border border-slate-200 px-4">
            <div className="flex items-start gap-3 py-2.5">
              <div className="w-7 h-7 rounded-md bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
              </div>
              <span className="text-xs text-slate-500 w-36 flex-shrink-0 mt-0.5">Assigned Roles</span>
              <div className="flex flex-wrap gap-1.5">
                {profile.roles.map((r) => (
                  <Badge key={r} variant="secondary" className="text-xs capitalize">{r.replace("_", " ")}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Use Cases */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Use Cases ({useCases.length})</p>
        <div className="space-y-2">
          {useCases.map((uc) => (
            <div key={uc.id} className="bg-white rounded-lg border border-slate-200 px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                {uc.type === "extraction" ? <Zap className="w-4 h-4 text-indigo-500" /> : <Tag className="w-4 h-4 text-purple-500" />}
                <span className="text-sm font-semibold text-slate-700">{uc.name || "(unnamed)"}</span>
                <Badge variant="outline" className="text-xs capitalize">{uc.type}</Badge>
              </div>
              {uc.type === "extraction" && uc.extractionConfig && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500 ml-6">
                  {uc.extractionConfig.engine && <span>Engine: <b className="text-slate-700">{uc.extractionConfig.engine}</b></span>}
                  {uc.extractionConfig.model && <span>Model: <b className="text-slate-700">{uc.extractionConfig.model}</b></span>}
                  {uc.extractionConfig.documentType && <span>Doc Type: <b className="text-slate-700">{docTypeLabels[uc.extractionConfig.documentType] || uc.extractionConfig.documentType}</b></span>}
                  {uc.extractionConfig.ingestion && <span>Ingestion: <b className="text-slate-700">{ingestionLabels[uc.extractionConfig.ingestion] || uc.extractionConfig.ingestion}</b></span>}
                </div>
              )}
            </div>
          ))}
          {useCases.length === 0 && <p className="text-xs text-slate-400 italic">No use cases configured.</p>}
        </div>
      </div>

      {/* Document Prefs */}
      {docPrefs && (
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Document Preferences</p>
          <div className="bg-white rounded-lg border border-slate-200 px-4">
            <ReviewRow icon={FileText} label="Document Type" value={docTypeLabels[docPrefs.documentType] || docPrefs.documentType} />
            <ReviewRow icon={FileText} label="Raw Text Model" value={docPrefs.rawTextModel} />
          </div>
        </div>
      )}
    </div>
  );
}