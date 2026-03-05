import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check, ChevronRight, ChevronLeft, Plus, AppWindow, Mail, Zap, Tag, Trash2, ArrowLeft, ChevronRight as GoIcon } from "lucide-react";
import ProfileDetail from "@/components/onboarding/ProfileDetail";
import { motion, AnimatePresence } from "framer-motion";
import StepProfile from "@/components/onboarding/StepProfile";
import StepDocumentConfig from "@/components/onboarding/StepDocumentConfig";
import StepDocumentPrefs from "@/components/onboarding/StepDocumentPrefs";
import StepReview from "@/components/onboarding/StepReview";

const steps = [
  { id: 0, label: "Profile" },
  { id: 1, label: "Document Config" },
  { id: 2, label: "Document Prefs" },
  { id: 3, label: "Review" },
];

const MOCK_PROFILES = [
  {
    id: 1,
    appId: "app-001",
    appName: "Alts Extraction App",
    contactEmail: "ops@alts.com",
    approvers: ["john.doe@firm.com", "jane.smith@firm.com"],
    useCases: [{ type: "extraction", name: "Schedule K-1 Extraction" }, { type: "classification", name: "Doc Classifier" }],
    documentType: "alts-schedule",
  },
  {
    id: 2,
    appId: "app-002",
    appName: "Fund Reports Pipeline",
    contactEmail: "reports@fundco.com",
    approvers: ["manager@fundco.com"],
    useCases: [{ type: "extraction", name: "Quarterly Report Extraction" }],
    documentType: "quarterly-report",
  },
];

function ProfileList({ profiles, onAdd, onDelete, onSelect }) {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Onboarded Profiles</h1>
          <p className="text-sm text-slate-500 mt-0.5">{profiles.length} profile{profiles.length !== 1 ? "s" : ""} configured</p>
        </div>
        <Button onClick={onAdd} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          Add New Profile
        </Button>
      </div>

      <div className="space-y-3 max-w-4xl">
        {profiles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => onSelect(p)}
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <AppWindow className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{p.appName}</p>
                    <p className="text-xs text-slate-400 font-mono">{p.appId}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 mb-3 ml-11">
                  <Mail className="w-3.5 h-3.5" />
                  {p.contactEmail}
                </div>

                <div className="flex flex-wrap gap-2 ml-11">
                  {p.useCases.map((uc, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border bg-slate-50 text-slate-600 border-slate-200">
                      {uc.type === "extraction" ? <Zap className="w-3 h-3 text-indigo-400" /> : <Tag className="w-3 h-3 text-purple-400" />}
                      {uc.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant="secondary" className="text-xs">{p.approvers.length} approver{p.approvers.length !== 1 ? "s" : ""}</Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-300 hover:text-red-500 h-8 w-8"
                  onClick={() => onDelete(p.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}

        {profiles.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <AppWindow className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No profiles yet. Click "Add New Profile" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Onboarding() {
  const [view, setView] = useState("list"); // "list" | "wizard"
  const [profiles, setProfiles] = useState(MOCK_PROFILES);
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState({});
  const [docConfigData, setDocConfigData] = useState({ selectedDocConfigs: [] });
  const [docPrefs, setDocPrefs] = useState({ documentType: "alts-schedule", rawTextModel: "textract" });

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  const goPrev = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const handleAddNew = () => {
    setCurrentStep(0);
    setProfile({});
    setDocConfigData({ selectedDocConfigs: [] });
    setDocPrefs({ documentType: "alts-schedule", rawTextModel: "textract" });
    setView("wizard");
  };

  const handleFinish = () => {
    const newProfile = {
      id: Date.now(),
      appId: profile.appId || "app-new",
      appName: profile.appName || "New App",
      contactEmail: profile.contactEmail || "",
      approvers: profile.approvers || [],
      selectedDocConfigs: docConfigData.selectedDocConfigs || [],
      documentType: docPrefs.documentType,
    };
    setProfiles((prev) => [...prev, newProfile]);
    setView("list");
  };

  const handleDelete = (id) => {
    setProfiles((prev) => prev.filter((p) => p.id !== id));
  };

  if (view === "list") {
    return <ProfileList profiles={profiles} onAdd={handleAddNew} onDelete={handleDelete} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Sidebar - Steps */}
      <div className="w-56 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col">
        <div className="px-6 py-6 border-b border-slate-100">
          <button onClick={() => setView("list")} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-600 mb-3 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to profiles
          </button>
          <h1 className="text-base font-bold text-slate-800">New Profile</h1>
          <p className="text-xs text-slate-400 mt-0.5">Complete your setup</p>
        </div>
        <nav className="flex-1 py-4 px-3">
          {steps.map((step, idx) => (
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
                {idx < steps.length - 1 && (
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="max-w-3xl"
            >
              {currentStep === 0 && <StepProfile data={profile} onChange={setProfile} />}
              {currentStep === 1 && <StepDocumentConfig data={docConfigData} onChange={setDocConfigData} />}
              {currentStep === 2 && <StepDocumentPrefs data={docPrefs} onChange={setDocPrefs} />}
              {currentStep === 3 && <StepReview profile={profile} useCasesData={docConfigData} docPrefs={docPrefs} />}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="border-t border-slate-200 bg-white px-8 py-4 flex items-center justify-between">
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
  );
}