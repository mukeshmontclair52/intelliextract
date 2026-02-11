import React from "react";
import { cn } from "@/lib/utils";
import { Type, Layers, Table2 } from "lucide-react";

const fieldTypes = [
  { value: "text", label: "Text", icon: Type },
  { value: "nested", label: "Nested", icon: Layers },
  { value: "tabular", label: "Tabular", icon: Table2 },
];

export default function FieldTypeToggle({ value, onChange }) {
  return (
    <div className="inline-flex bg-slate-100 rounded-lg p-1 gap-1">
      {fieldTypes.map((type) => {
        const Icon = type.icon;
        const isActive = value === type.value;
        return (
          <button
            key={type.value}
            onClick={() => onChange(type.value)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {type.label}
          </button>
        );
      })}
    </div>
  );
}