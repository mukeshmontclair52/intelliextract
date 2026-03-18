import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AppWindow, Check } from "lucide-react";
import { profilesService } from "@/components/services/dataService";

export default function EPStepProfile({ data, onChange }) {
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    profilesService.getAll().then(setProfiles);
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">Select Profile</h2>
        <p className="text-sm text-slate-500 mt-1">Choose the client profile this execution plan applies to.</p>
      </div>

      <div className="space-y-2">
        {profiles.map((p) => {
          const selected = data?.id === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onChange(p)}
              className={cn(
                "w-full text-left flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 transition-all",
                selected ? "border-indigo-400 bg-indigo-50" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", selected ? "bg-indigo-100" : "bg-slate-100")}>
                <AppWindow className={cn("w-4 h-4", selected ? "text-indigo-600" : "text-slate-400")} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-semibold", selected ? "text-indigo-700" : "text-slate-700")}>{p.appName}</p>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">{p.appId}</p>
              </div>
              {selected && <Check className="w-4 h-4 text-indigo-500 flex-shrink-0" />}
            </button>
          );
        })}
        {profiles.length === 0 && (
          <p className="text-sm text-slate-400 italic py-4">No profiles found. Create one in Client Profiles first.</p>
        )}
      </div>
    </div>
  );
}