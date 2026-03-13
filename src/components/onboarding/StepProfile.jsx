import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppWindow, Mail, X, Plus, IdCard } from "lucide-react";

export default function StepProfile({ data, onChange }) {
  const [contactEmailInput, setContactEmailInput] = React.useState("");
  const [ccIntakeInput, setCcIntakeInput] = React.useState("");

  const addContactEmail = () => {
    const email = contactEmailInput.trim();
    if (!email) return;
    const current = data.contactEmails || [];
    if (!current.includes(email)) onChange({ ...data, contactEmails: [...current, email] });
    setContactEmailInput("");
  };

  const removeContactEmail = (email) => {
    onChange({ ...data, contactEmails: (data.contactEmails || []).filter((e) => e !== email) });
  };

  const addCcIntake = () => {
    const email = ccIntakeInput.trim();
    if (!email) return;
    const current = data.ccIntake || [];
    if (!current.includes(email)) onChange({ ...data, ccIntake: [...current, email] });
    setCcIntakeInput("");
  };

  const removeCcIntake = (email) => {
    onChange({ ...data, ccIntake: (data.ccIntake || []).filter((e) => e !== email) });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">App Profile</h2>
        <p className="text-sm text-slate-500 mt-1">Set up your application identity and contacts.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
            <IdCard className="w-3.5 h-3.5" /> Type of ID
          </Label>
          <select
            value={data.sealIdType || ""}
            onChange={(e) => onChange({ ...data, sealIdType: e.target.value })}
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Select type...</option>
            <option value="FID">FID</option>
            <option value="SID">SID</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
          <IdCard className="w-3.5 h-3.5" /> Seal ID Value
        </Label>
        <Input
          placeholder={`Enter ${data.sealIdType || "FID/SID"} value`}
          value={data.sealId || ""}
          onChange={(e) => onChange({ ...data, sealId: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5" /> Contact Emails
        </Label>
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="contact@yourcompany.com"
            value={contactEmailInput}
            onChange={(e) => setContactEmailInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addContactEmail(); } }}
          />
          <Button type="button" variant="outline" onClick={addContactEmail} className="flex-shrink-0">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {(data.contactEmails || []).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {data.contactEmails.map((email) => (
              <Badge key={email} variant="secondary" className="flex items-center gap-1.5 pr-1">
                {email}
                <button onClick={() => removeContactEmail(email)} className="hover:text-rose-600">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        <p className="text-xs text-slate-400">Press Enter or click + to add each email.</p>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5" /> CC Intake
        </Label>
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="cc@yourcompany.com"
            value={ccIntakeInput}
            onChange={(e) => setCcIntakeInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCcIntake(); } }}
          />
          <Button type="button" variant="outline" onClick={addCcIntake} className="flex-shrink-0">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {(data.ccIntake || []).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {data.ccIntake.map((email) => (
              <Badge key={email} variant="secondary" className="flex items-center gap-1.5 pr-1">
                {email}
                <button onClick={() => removeCcIntake(email)} className="hover:text-rose-600">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        <p className="text-xs text-slate-400">Press Enter or click + to add each CC email.</p>
      </div>


    </div>
  );
}