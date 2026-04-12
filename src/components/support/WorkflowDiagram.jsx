import React from "react";
import { X, Download, Upload, Cpu, CheckCircle2, Puzzle, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    key: "import",
    label: "Import",
    icon: Download,
    color: "from-indigo-500 to-blue-600",
    desc: null,
    items: ["API", "E-mail", "File Storage", "Integration"],
    itemsBelow: true,
  },
  {
    key: "extract",
    label: "Extract",
    icon: Cpu,
    color: "from-indigo-500 to-blue-600",
    desc: "AI-powered\nData Extraction",
    items: [],
    itemsBelow: false,
  },
  {
    key: "validate",
    label: "Validate",
    icon: CheckCircle2,
    color: "from-indigo-500 to-blue-600",
    desc: "Automatic / Manual\nValidation of the Extracted Data",
    items: [],
    itemsBelow: false,
  },
  {
    key: "transform",
    label: "Transform",
    icon: Puzzle,
    color: "from-indigo-500 to-blue-600",
    desc: "Apply Business Logic\nwith custom Extensions",
    items: [],
    itemsBelow: false,
  },
  {
    key: "export",
    label: "Export",
    icon: Share2,
    color: "from-indigo-500 to-blue-600",
    desc: null,
    items: ["API", "File", "Integration"],
    itemsBelow: true,
  },
];

export default function WorkflowDiagram({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div
        className="relative w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "linear-gradient(135deg, #0f1117 0%, #1a1d2e 100%)" }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 text-white" />
        </button>

        <div className="px-10 py-10">
          {/* Title */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">How DocExtract Works</h2>
            <p className="text-slate-400 text-sm">
              Wondering where DocExtract fits in your process? Here's an overview of a typical use-case!
            </p>
          </div>

          {/* Diagram */}
          <div className="relative flex items-start justify-between gap-0">
            {/* Connector line behind */}
            <div className="absolute top-[88px] left-[10%] right-[10%] h-1 z-0" style={{
              background: "linear-gradient(90deg, #6366f1, #818cf8, #6366f1, #818cf8, #6366f1)",
              borderRadius: "4px",
              opacity: 0.6,
            }} />

            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={step.key} className="flex-1 flex flex-col items-center relative z-10">
                  {/* Icon circle */}
                  <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center mb-3 shadow-lg">
                    <Icon className="w-6 h-6 text-slate-300" />
                  </div>

                  {/* Pill label */}
                  <div className={cn(
                    "px-6 py-2.5 rounded-full text-white font-semibold text-sm shadow-lg",
                    "bg-gradient-to-r from-indigo-500 to-blue-600"
                  )} style={{ minWidth: "110px", textAlign: "center" }}>
                    {step.label}
                  </div>

                  {/* Arrow down indicator */}
                  <div className="mt-2 mb-1">
                    {(step.desc || step.itemsBelow) && (
                      <div className="w-0.5 h-4 bg-indigo-400 mx-auto" />
                    )}
                  </div>

                  {/* Description text */}
                  {step.desc && (
                    <p className="text-slate-400 text-xs text-center leading-relaxed whitespace-pre-line mt-1 px-2">
                      {step.desc}
                    </p>
                  )}

                  {/* Items below (Import / Export) */}
                  {step.itemsBelow && step.items.length > 0 && (
                    <div className="flex flex-col items-center gap-1.5 mt-2">
                      {step.items.map((item, i) => (
                        <React.Fragment key={item}>
                          <div className="px-4 py-1 rounded-full bg-transparent border border-slate-500 text-slate-300 text-xs font-medium">
                            {item}
                          </div>
                          {i < step.items.length - 2 && i === 1 && (
                            <div className="flex gap-1">
                              {[0,1,2].map(d => <div key={d} className="w-1 h-1 rounded-full bg-slate-600" />)}
                            </div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <p className="text-center text-slate-500 text-xs mt-10">
            DocExtract integrates at every stage — from ingestion to delivery — with full auditability and configuration control.
          </p>
        </div>
      </div>
    </div>
  );
}