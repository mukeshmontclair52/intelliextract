import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Save, X, Plus, AppWindow, Mail, Hash, UserCheck,
  Clock, User, ChevronDown, ChevronUp, Edit2, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import StepDocumentConfig from "@/components/onboarding/StepDocumentConfig";

function AuditRow({ entry }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-100 rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <User className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">{entry.action}</p>
            <p className="text-xs text-slate-400">{entry.by} · {entry.at}</p>
          </div>
        </div>
        {entry.changes && (open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />)}
      </button>
      <AnimatePresence>
        {open && entry.changes && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 border-t border-slate-100 bg-slate-50 space-y-2 pt-3">
              {entry.changes.map((c, i) => (
                <div key={i} className="flex items-start gap-3 text-xs">
                  <span className="text-slate-500 w-28 flex-shrink-0 font-medium">{c.field}</span>
                  <span className="text-red-500 line-through flex-1 truncate">{c.from}</span>
                  <span className="text-slate-300 mx-1">→</span>
                  <span className="text-green-600 flex-1 truncate">{c.to}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const MOCK_AUDIT = [
  {
    action: "Profile Created",
    by: "ops@alts.com",
    at: "2026-01-10 09:14",
    changes: null,
  },
  {
    action: "Profile Updated",
    by: "john.doe@firm.com",
    at: "2026-02-03 14:22",
    changes: [
      { field: "Contact Email", from: "old@alts.com", to: "ops@alts.com" },
      { field: "App Name", from: "Alts App", to: "Alts Extraction App" },
    ],
  },
  {
    action: "Approver Added",
    by: "ops@alts.com",
    at: "2026-02-18 11:05",
    changes: [
      { field: "Approvers", from: "john.doe@firm.com", to: "john.doe@firm.com, jane.smith@firm.com" },
    ],
  },
  {
    action: "Profile Updated",
    by: "jane.smith@firm.com",
    at: "2026-03-01 16:48",
    changes: [
      { field: "App ID", from: "app-000", to: "app-001" },
    ],
  },
];

export default function ProfileDetail({ profile, onBack, onSave }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...profile });
  const [docConfigData, setDocConfigData] = useState({ selectedDocConfigs: profile.selectedDocConfigs || [] });
  const [docPrefs, setDocPrefs] = useState({ documentType: profile.documentType || "alts-schedule", rawTextModel: profile.rawTextModel || "textract", instructions: profile.instructions || "" });
  const [approverInput, setApproverInput] = useState("");
  const [activeTab, setActiveTab] = useState("details");
  const [saved, setSaved] = useState(false);

  const addApprover = () => {
    const email = approverInput.trim();
    if (!email) return;
    const current = form.approvers || [];
    if (!current.includes(email)) setForm(f => ({ ...f, approvers: [...current, email] }));
    setApproverInput("");
  };

  const removeApprover = (email) => setForm(f => ({ ...f, approvers: f.approvers.filter(e => e !== email) }));

  const handleSave = () => {
    onSave({ ...form, selectedDocConfigs: docConfigData.selectedDocConfigs, documentType: docPrefs.documentType, rawTextModel: docPrefs.rawTextModel, instructions: docPrefs.instructions });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCancel = () => {
    setForm({ ...profile });
    setDocConfigData({ selectedDocConfigs: profile.selectedDocConfigs || [] });
    setDocPrefs({ documentType: profile.documentType || "alts-schedule", rawTextModel: profile.rawTextModel || "textract", instructions: profile.instructions || "" });
    setEditing(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />Back
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
              <AppWindow className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{profile.appName}</p>
              <p className="text-xs text-slate-400 font-mono">{profile.appId}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {saved && (
            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <Check className="w-3.5 h-3.5" />Saved
            </span>
          )}
          {editing ? (
            <>
              <Button size="sm" variant="outline" onClick={handleCancel} className="h-8 text-xs">Cancel</Button>
              <Button size="sm" onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 h-8 text-xs">
                <Save className="w-3.5 h-3.5 mr-1" />Save Changes
              </Button>
            </>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="h-8 text-xs">
              <Edit2 className="w-3.5 h-3.5 mr-1" />Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-6">
        <div className="flex gap-0">
          {[
            { key: "details", label: "Details", showIcon: false },
            { key: "audit", label: "Audit History", showIcon: true },
          ].map(({ key, label, showIcon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === key ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"
              )}
            >
              {showIcon && <Clock className="w-4 h-4" />}{label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 max-w-3xl">
        <AnimatePresence mode="wait">
          {activeTab === "details" && (
            <motion.div key="details" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-5">
              {/* Profile Info */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Profile Info</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5" />App ID
                    </Label>
                    {editing ? (
                      <Input value={form.appId || ""} onChange={e => setForm(f => ({ ...f, appId: e.target.value }))} />
                    ) : (
                      <p className="text-sm font-medium text-slate-800 font-mono">{form.appId || "—"}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                      <AppWindow className="w-3.5 h-3.5" />App Name
                    </Label>
                    {editing ? (
                      <Input value={form.appName || ""} onChange={e => setForm(f => ({ ...f, appName: e.target.value }))} />
                    ) : (
                      <p className="text-sm font-medium text-slate-800">{form.appName || "—"}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />Contact Email
                  </Label>
                  {editing ? (
                    <Input type="email" value={form.contactEmail || ""} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))} />
                  ) : (
                    <p className="text-sm font-medium text-slate-800">{form.contactEmail || "—"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5" />Approvers
                  </Label>
                  {editing && (
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="approver@company.com"
                        value={approverInput}
                        onChange={e => setApproverInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addApprover())}
                      />
                      <Button type="button" variant="outline" onClick={addApprover} className="flex-shrink-0"><Plus className="w-4 h-4" /></Button>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {(form.approvers || []).length > 0 ? (form.approvers.map(email => (
                      <Badge key={email} variant="secondary" className="flex items-center gap-1.5 pr-1">
                        {email}
                        {editing && (
                          <button onClick={() => removeApprover(email)} className="hover:text-rose-600">
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </Badge>
                    ))) : <p className="text-sm text-slate-400">No approvers</p>}
                  </div>
                  {editing && <p className="text-xs text-slate-400">Press Enter or click + to add.</p>}
                </div>
              </div>

              {/* Document Config */}
              <div className={cn("bg-white border border-slate-200 rounded-xl p-6 shadow-sm", !editing && "pointer-events-none opacity-80")}>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">Document Configurations</p>
                <StepDocumentConfig data={docConfigData} onChange={setDocConfigData} />
              </div>

              {/* Document Prefs */}
              <div className={cn("bg-white border border-slate-200 rounded-xl p-6 shadow-sm", !editing && "pointer-events-none opacity-80")}>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">Document Preferences</p>
                <StepDocumentPrefs data={docPrefs} onChange={setDocPrefs} />
              </div>
            </motion.div>
          )}

          {activeTab === "audit" && (
            <motion.div key="audit" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-2">
              <p className="text-xs text-slate-400 mb-4">{MOCK_AUDIT.length} events recorded</p>
              {[...MOCK_AUDIT].reverse().map((entry, i) => (
                <AuditRow key={i} entry={entry} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}