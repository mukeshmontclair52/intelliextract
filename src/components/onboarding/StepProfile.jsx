import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Hash, AppWindow, Mail, UserCheck, X, Plus, IdCard } from "lucide-react";

export default function StepProfile({ data, onChange }) {
  const [approverInput, setApproverInput] = React.useState("");
  const [fidInput, setFidInput] = React.useState("");
  const [sidInput, setSidInput] = React.useState("");

  const addApprover = () => {
    const email = approverInput.trim();
    if (!email) return;
    const current = data.approvers || [];
    if (!current.includes(email)) {
      onChange({ ...data, approvers: [...current, email] });
    }
    setApproverInput("");
  };

  const removeApprover = (email) => {
    onChange({ ...data, approvers: (data.approvers || []).filter((e) => e !== email) });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addApprover();
    }
  };

  const addFid = () => {
    const val = fidInput.trim();
    if (!val) return;
    const current = data.fids || [];
    if (!current.includes(val)) onChange({ ...data, fids: [...current, val] });
    setFidInput("");
  };

  const removeFid = (val) => onChange({ ...data, fids: (data.fids || []).filter((v) => v !== val) });

  const addSid = () => {
    const val = sidInput.trim();
    if (!val) return;
    const current = data.sids || [];
    if (!current.includes(val)) onChange({ ...data, sids: [...current, val] });
    setSidInput("");
  };

  const removeSid = (val) => onChange({ ...data, sids: (data.sids || []).filter((v) => v !== val) });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">App Profile</h2>
        <p className="text-sm text-slate-500 mt-1">Set up your application identity and contacts.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5" /> App ID
          </Label>
          <Input
            placeholder="e.g. app-001"
            value={data.appId || ""}
            onChange={(e) => onChange({ ...data, appId: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
            <AppWindow className="w-3.5 h-3.5" /> App Name
          </Label>
          <Input
            placeholder="e.g. Alts Extraction App"
            value={data.appName || ""}
            onChange={(e) => onChange({ ...data, appName: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5" /> Contact Email
        </Label>
        <Input
          type="email"
          placeholder="contact@yourcompany.com"
          value={data.contactEmail || ""}
          onChange={(e) => onChange({ ...data, contactEmail: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
          <UserCheck className="w-3.5 h-3.5" /> Approvers Email IDs
        </Label>
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="approver@yourcompany.com"
            value={approverInput}
            onChange={(e) => setApproverInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button type="button" variant="outline" onClick={addApprover} className="flex-shrink-0">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {(data.approvers || []).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {data.approvers.map((email) => (
              <Badge key={email} variant="secondary" className="flex items-center gap-1.5 pr-1">
                {email}
                <button onClick={() => removeApprover(email)} className="hover:text-rose-600">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        <p className="text-xs text-slate-400">Press Enter or click + to add each approver email.</p>
      </div>

      {/* FIDs */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
          <IdCard className="w-3.5 h-3.5" /> FIDs
        </Label>
        <div className="flex gap-2">
          <Input
            placeholder="Enter FID"
            value={fidInput}
            onChange={(e) => setFidInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFid(); } }}
          />
          <Button type="button" variant="outline" onClick={addFid} className="flex-shrink-0">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {(data.fids || []).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {data.fids.map((val) => (
              <Badge key={val} variant="secondary" className="flex items-center gap-1.5 pr-1">
                {val}
                <button onClick={() => removeFid(val)} className="hover:text-rose-600"><X className="w-3 h-3" /></button>
              </Badge>
            ))}
          </div>
        )}
        <p className="text-xs text-slate-400">Press Enter or click + to add each FID.</p>
      </div>

      {/* SIDs */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
          <IdCard className="w-3.5 h-3.5" /> SIDs
        </Label>
        <div className="flex gap-2">
          <Input
            placeholder="Enter SID"
            value={sidInput}
            onChange={(e) => setSidInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSid(); } }}
          />
          <Button type="button" variant="outline" onClick={addSid} className="flex-shrink-0">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {(data.sids || []).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {data.sids.map((val) => (
              <Badge key={val} variant="secondary" className="flex items-center gap-1.5 pr-1">
                {val}
                <button onClick={() => removeSid(val)} className="hover:text-rose-600"><X className="w-3 h-3" /></button>
              </Badge>
            ))}
          </div>
        )}
        <p className="text-xs text-slate-400">Press Enter or click + to add each SID.</p>
      </div>
    </div>
  );
}