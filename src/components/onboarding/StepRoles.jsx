import React from "react";
import { cn } from "@/lib/utils";
import { ShieldCheck, Eye, PenLine, Settings, UserCog, BarChart2, Lock } from "lucide-react";

const ROLES = [
  {
    id: "admin",
    label: "Admin",
    description: "Full access to all settings, configurations, and user management.",
    icon: ShieldCheck,
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-200",
  },
  {
    id: "operator",
    label: "Operator",
    description: "Can manage document configs and run extraction workflows.",
    icon: Settings,
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
  },
  {
    id: "analyst",
    label: "Analyst",
    description: "Can view and analyze extraction results and analytics dashboards.",
    icon: BarChart2,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
  },
  {
    id: "reviewer",
    label: "Reviewer",
    description: "Can review, approve, or reject extracted data and transactions.",
    icon: PenLine,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
  },
  {
    id: "viewer",
    label: "Viewer",
    description: "Read-only access to view documents and results.",
    icon: Eye,
    color: "text-slate-600",
    bg: "bg-slate-50",
    border: "border-slate-200",
  },
  {
    id: "auditor",
    label: "Auditor",
    description: "Read-only access with full audit trail visibility.",
    icon: Lock,
    color: "text-teal-600",
    bg: "bg-teal-50",
    border: "border-teal-200",
  },
  {
    id: "super_admin",
    label: "Super Admin",
    description: "Unrestricted system-wide access including billing and integrations.",
    icon: UserCog,
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
  },
];

export default function StepRoles({ data, onChange }) {
  const selected = data.roles || [];

  const toggle = (id) => {
    const updated = selected.includes(id)
      ? selected.filter((r) => r !== id)
      : [...selected, id];
    onChange({ ...data, roles: updated });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">Client Roles</h2>
        <p className="text-sm text-slate-500 mt-1">Select the roles this client profile will have access to.</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {ROLES.map(({ id, label, description, icon: Icon, color, bg, border }) => {
          const isSelected = selected.includes(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => toggle(id)}
              className={cn(
                "flex items-start gap-4 w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all",
                isSelected
                  ? cn(bg, border, "shadow-sm")
                  : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5", isSelected ? bg : "bg-slate-100")}>
                <Icon className={cn("w-4.5 h-4.5", isSelected ? color : "text-slate-400")} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-semibold", isSelected ? color : "text-slate-700")}>{label}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{description}</p>
              </div>
              <div className={cn(
                "w-4 h-4 rounded-full border-2 flex-shrink-0 mt-1 transition-all",
                isSelected ? cn("border-current", color, "bg-current") : "border-slate-300"
              )} />
            </button>
          );
        })}
      </div>

      {selected.length === 0 && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          No roles selected. Select at least one role to continue.
        </p>
      )}
    </div>
  );
}