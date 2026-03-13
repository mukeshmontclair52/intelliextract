import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppWindow, Mail, X, IdCard } from "lucide-react";

function EmailTagInput({ values, onChange, placeholder }) {
  const [input, setInput] = React.useState("");
  const [error, setError] = React.useState("");

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const add = () => {
    const email = input.trim();
    if (!email) return;
    if (!isValidEmail(email)) { setError("Invalid email address"); return; }
    if (values.includes(email)) { setError("Email already added"); return; }
    onChange([...values, email]);
    setInput("");
    setError("");
  };

  const remove = (email) => onChange(values.filter((e) => e !== email));

  return (
    <div className="rounded-lg border border-input bg-white p-2 min-h-[44px] flex flex-wrap gap-1.5 items-center focus-within:ring-1 focus-within:ring-ring">
      {values.map((email) => (
        <span key={email} className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-medium px-2 py-1 rounded-full">
          {email}
          <button type="button" onClick={() => remove(email)} className="hover:text-rose-500 transition-colors ml-0.5">
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        type="email"
        value={input}
        onChange={(e) => { setInput(e.target.value); setError(""); }}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }}
        onBlur={add}
        placeholder={values.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[180px] text-sm outline-none bg-transparent placeholder:text-slate-400"
      />
      {error && <span className="w-full text-xs text-rose-500 mt-0.5">{error}</span>}
    </div>
  );
}

export default function StepProfile({ data, onChange }) {

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">App Profile</h2>
        <p className="text-sm text-slate-500 mt-1">Set up your application identity and contacts.</p>
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

      <div className="grid grid-cols-2 gap-4">
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
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
            <IdCard className="w-3.5 h-3.5" /> ID Value
          </Label>
          <Input
            placeholder={`Enter ${data.sealIdType || "FID/SID"} value`}
            value={data.idValue || ""}
            onChange={(e) => onChange({ ...data, idValue: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
          <IdCard className="w-3.5 h-3.5" /> Seal ID
        </Label>
        <Input
          placeholder="Enter Seal ID"
          value={data.sealId || ""}
          onChange={(e) => onChange({ ...data, sealId: e.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5" /> Contact Emails
        </Label>
        <EmailTagInput
          values={data.contactEmails || []}
          onChange={(emails) => onChange({ ...data, contactEmails: emails })}
          placeholder="Type email and press Enter..."
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5" /> CC Intake
        </Label>
        <EmailTagInput
          values={data.ccIntake || []}
          onChange={(emails) => onChange({ ...data, ccIntake: emails })}
          placeholder="Type email and press Enter..."
        />
      </div>


    </div>
  );
}