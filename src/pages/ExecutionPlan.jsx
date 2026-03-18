import React, { useState } from "react";
import { Check, ChevronRight, ChevronLeft, Play, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import EPStepProfile from "@/components/executionplan/EPStepProfile";
import EPStepDocConfig from "@/components/executionplan/EPStepDocConfig";
import EPStepPreProcessing from "@/components/executionplan/EPStepPreProcessing";
import EPStepPostProcessing from "@/components/executionplan/EPStepPostProcessing";
import EPReview from "@/components/executionplan/EPReview";

const STEPS = [
  { id: 0, label: "Profile" },
  { id: 1, label: "Document Config" },
  { id: 2, label: "Pre-Processing" },
  { id: 3, label: "Post-Processing" },
  { id: 4, label: "Review" },
];

const defaultPlan = {
  profile: null,
  docConfig: null,
  preProcessing: { ocr: false, pageRange: "all", rotation: false, denoise: false },
  postProcessing: { webhook: "", emailNotify: [], outputFormat: "json", s3Export: false, s3Bucket: "" },
};

export default function ExecutionPlan() {
  const [plans, setPlans] = useState([]);
  const [view, setView] = useState("list"); // "list" | "wizard"
  const [currentStep, setCurrentStep] = useState(0);
  const [plan, setPlan] = useState(defaultPlan);
  const [editingId, setEditingId] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const update = (key, val) => setPlan((p) => ({ ...p, [key]: val }));

  const handleNew = () => {
    setPlan(defaultPlan);
    setEditingId(null);
    setCurrentStep(0);
    setSubmitted(false);
    setView("wizard");
  };

  const handleEdit = (p) => {
    setPlan(p);
    setEditingId(p.id);
    setCurrentStep(0);
    setSubmitted(false);
    setView("wizard");
  };

  const handleFinish = () => {
    if (editingId) {
      setPlans((prev) => prev.map((p) => p.id === editingId ? { ...plan, id: editingId } : p));
    } else {
      setPlans((prev) => [...prev, { ...plan, id: Date.now() }]);
    }
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setView("list"); }, 800);
  };

  const handleDelete = (id) => setPlans((prev) => prev.filter((p) => p.id !== id));

  if (view === "list") {
    return (
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Execution Plans</h1>
            <p className="text-sm text-slate-500 mt-0.5">{plans.length} plan{plans.length !== 1 ? "s" : ""} configured</p>
          </div>
          <Button onClick={handleNew} className="bg-indigo-600 hover:bg-indigo-700">
            <Play className="w-4 h-4 mr-2" />
            New Execution Plan
          </Button>
        </div>

        {plans.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-2xl py-20 text-center text-slate-400">
            <Play className="w-10 h-10 mx-auto mb-3 opacity-25" />
            <p className="text-sm font-medium">No execution plans yet.</p>
            <p className="text-xs mt-1">Click "New Execution Plan" to get started.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden max-w-4xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs text-slate-500 font-medium">
                  <th className="text-left px-5 py-3">Profile</th>
                  <th className="text-left px-5 py-3">Document Config</th>
                  <th className="text-left px-5 py-3">Pre-Processing</th>
                  <th className="text-left px-5 py-3">Output Format</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {plans.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => handleEdit(p)}>
                    <td className="px-5 py-3 font-medium text-slate-800">{p.profile?.appName || "—"}</td>
                    <td className="px-5 py-3 text-slate-600">{p.docConfig?.name || "—"}</td>
                    <td className="px-5 py-3 text-slate-600 text-xs">
                      {[p.preProcessing?.ocr && "OCR", p.preProcessing?.rotation && "Rotation", p.preProcessing?.denoise && "Denoise"].filter(Boolean).join(", ") || "None"}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full font-medium uppercase">
                        {p.postProcessing?.outputFormat || "json"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                        className="text-slate-300 hover:text-red-500 transition-colors text-xs px-2 py-1"
                      >
                        Delete
                      </button>
                      <ChevronRight className="w-4 h-4 text-slate-300 inline" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-56 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col">
        <div className="px-6 py-6 border-b border-slate-100">
          <button onClick={() => setView("list")} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-600 mb-3 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to plans
          </button>
          <h1 className="text-base font-bold text-slate-800">{editingId ? "Edit Plan" : "New Plan"}</h1>
          <p className="text-xs text-slate-400 mt-0.5">Configure execution steps</p>
        </div>
        <nav className="flex-1 py-4 px-3">
          {STEPS.map((step, idx) => (
            <div key={step.id} className="flex items-start gap-3 mb-1">
              <div className="flex flex-col items-center mt-1">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 transition-all",
                  currentStep > idx ? "bg-indigo-600 text-white" :
                  currentStep === idx ? "border-2 border-indigo-600 text-indigo-600 bg-white" :
                  "border-2 border-slate-200 text-slate-400 bg-white"
                )}>
                  {currentStep > idx ? <Check className="w-3 h-3" /> : idx + 1}
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={cn("w-px h-8 mt-1", currentStep > idx ? "bg-indigo-300" : "bg-slate-200")} />
                )}
              </div>
              <div className="pt-0.5">
                <p className={cn("text-sm font-medium leading-none", currentStep === idx ? "text-indigo-600" : currentStep > idx ? "text-slate-600" : "text-slate-400")}>
                  {step.label}
                </p>
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.18 }}
              className="max-w-2xl"
            >
              {currentStep === 0 && <EPStepProfile data={plan.profile} onChange={(v) => update("profile", v)} />}
              {currentStep === 1 && <EPStepDocConfig data={plan.docConfig} onChange={(v) => update("docConfig", v)} />}
              {currentStep === 2 && <EPStepPreProcessing data={plan.preProcessing} onChange={(v) => update("preProcessing", v)} />}
              {currentStep === 3 && <EPStepPostProcessing data={plan.postProcessing} onChange={(v) => update("postProcessing", v)} />}
              {currentStep === 4 && <EPReview plan={plan} />}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="border-t border-slate-200 bg-white px-8 py-4 flex items-center justify-between">
          <Button variant="outline" onClick={() => setCurrentStep((s) => Math.max(s - 1, 0))} disabled={currentStep === 0} className="text-slate-600">
            <ChevronLeft className="w-4 h-4 mr-1" />Back
          </Button>
          <span className="text-xs text-slate-400">Step {currentStep + 1} of {STEPS.length}</span>
          {currentStep < STEPS.length - 1 ? (
            <Button onClick={() => setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1))} className="bg-indigo-600 hover:bg-indigo-700">
              Continue <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleFinish} disabled={submitted} className="bg-green-600 hover:bg-green-700">
              <Check className="w-4 h-4 mr-1" />
              {submitted ? "Saved!" : editingId ? "Save Changes" : "Create Plan"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}