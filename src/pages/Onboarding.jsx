import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, ChevronRight, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import StepProfile from "@/components/onboarding/StepProfile";
import StepUseCases from "@/components/onboarding/StepUseCases";
import StepDocumentPrefs from "@/components/onboarding/StepDocumentPrefs";
import StepReview from "@/components/onboarding/StepReview";

const steps = [
  { id: 0, label: "Profile" },
  { id: 1, label: "Use Cases" },
  { id: 2, label: "Document Prefs" },
  { id: 3, label: "Review" },
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState({});
  const [useCasesData, setUseCasesData] = useState({ useCases: [] });
  const [docPrefs, setDocPrefs] = useState({ documentType: "alts-schedule", rawTextModel: "textract" });

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  const goPrev = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const handleFinish = () => {
    alert("Onboarding complete!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Welcome aboard</h1>
          <p className="text-slate-500 text-sm mt-1">Let's get you set up in just a few steps.</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((step, idx) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                    currentStep > idx
                      ? "bg-indigo-600 text-white"
                      : currentStep === idx
                      ? "bg-white border-2 border-indigo-600 text-indigo-600"
                      : "bg-white border-2 border-slate-200 text-slate-400"
                  )}
                >
                  {currentStep > idx ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <span className={cn(
                  "text-xs mt-1.5 font-medium",
                  currentStep === idx ? "text-indigo-600" : "text-slate-400"
                )}>
                  {step.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={cn(
                  "h-0.5 w-16 mx-2 mb-5 transition-all",
                  currentStep > idx ? "bg-indigo-600" : "bg-slate-200"
                )} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
          <div className="p-8 max-h-[65vh] overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {currentStep === 0 && <StepProfile data={profile} onChange={setProfile} />}
                {currentStep === 1 && <StepUseCases data={useCasesData} onChange={setUseCasesData} />}
                {currentStep === 2 && <StepDocumentPrefs data={docPrefs} onChange={setDocPrefs} />}
                {currentStep === 3 && <StepReview profile={profile} useCasesData={useCasesData} docPrefs={docPrefs} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <Button variant="outline" onClick={goPrev} disabled={currentStep === 0} className="text-slate-600">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>

            <span className="text-xs text-slate-400">Step {currentStep + 1} of {steps.length}</span>

            {currentStep < steps.length - 1 ? (
              <Button onClick={goNext} className="bg-indigo-600 hover:bg-indigo-700">
                Continue
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleFinish} className="bg-green-600 hover:bg-green-700">
                <Check className="w-4 h-4 mr-1" />
                Finish Setup
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}