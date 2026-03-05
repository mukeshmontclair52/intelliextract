import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Download, RotateCcw, ThumbsDown, AlertTriangle,
  CheckCircle2, Clock, XCircle, RefreshCw, FileText, UserCheck,
  Zap, Scissors, Scan, ChevronRight, Check, X, Edit2, Save
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const STATUS_CONFIG = {
  completed: { label: "Completed", color: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle2 },
  failed: { label: "Failed", color: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
  processing: { label: "Processing", color: "bg-blue-50 text-blue-700 border-blue-200", icon: RefreshCw },
  pending: { label: "Pending", color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: Clock },
  rejected: { label: "Rejected", color: "bg-orange-50 text-orange-700 border-orange-200", icon: ThumbsDown },
  skipped: { label: "Skipped", color: "bg-slate-50 text-slate-500 border-slate-200", icon: Clock },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 font-medium border rounded-full text-xs px-2.5 py-1", cfg.color)}>
      <Icon className="w-3 h-3 flex-shrink-0" />
      {cfg.label}
    </span>
  );
}

function StepTimeline({ steps }) {
  return (
    <div className="space-y-2">
      {steps.map((step, i) => {
        const cfg = STATUS_CONFIG[step.status] || STATUS_CONFIG.pending;
        const Icon = cfg.icon;
        return (
          <div key={i} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className={cn("w-6 h-6 rounded-full flex items-center justify-center border", cfg.color)}>
                <Icon className="w-3 h-3" />
              </div>
              {i < steps.length - 1 && <div className="w-px h-4 bg-slate-200 mt-1" />}
            </div>
            <div className="pt-0.5 flex-1 flex items-center justify-between">
              <span className={cn("text-sm", step.status === "skipped" || step.status === "pending" ? "text-slate-400" : "text-slate-700")}>{step.name}</span>
              <div className="text-right">
                <span className="text-xs text-slate-400 font-mono">{step.time}</span>
                {step.error && <p className="text-xs text-red-500 mt-0.5">{step.error}</p>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Mock extraction result data for human review
const MOCK_EXTRACTION_FIELDS = [
  { field: "Fund Name", value: "Blackstone Real Estate Partners X", confidence: 99 },
  { field: "Investment Date", value: "2024-09-15", confidence: 94 },
  { field: "Capital Called", value: "$12,450,000", confidence: 97 },
  { field: "Distributions", value: "$3,200,000", confidence: 91 },
  { field: "NAV", value: "$18,750,000", confidence: 88 },
  { field: "Commitment", value: "$25,000,000", confidence: 95 },
  { field: "Unfunded", value: "$12,550,000", confidence: 83 },
];

const MOCK_SPLIT_RESULT = [
  { page: "1-4", category: "Equity Report", confidence: 98 },
  { page: "5-11", category: "Fixed Income", confidence: 92 },
  { page: "12-18", category: "Alternative Investment", confidence: 96 },
  { page: "19-24", category: "Mixed Asset", confidence: 87 },
];

const MOCK_PARSE_BLOCKS = [
  { id: 1, type: "heading", content: "Schedule of Investments – Q1 2026", confidence: 99 },
  { id: 2, type: "paragraph", content: "The following table presents the consolidated schedule of investments as of March 31, 2026, including all alternative investment strategies.", confidence: 96 },
  { id: 3, type: "table", content: "Fund | Commitment | NAV | Return\nBXREP X | $25M | $18.75M | +12.4%\nBXCRE | $10M | $11.2M | +9.1%", confidence: 94 },
  { id: 4, type: "paragraph", content: "Total portfolio NAV increased by 11.2% compared to the prior quarter, driven primarily by strong performance in private equity holdings.", confidence: 91 },
];

function ExtractionReview({ txn }) {
  const [fields, setFields] = useState(MOCK_EXTRACTION_FIELDS.map(f => ({ ...f, approved: null, editedValue: f.value, editing: false })));
  const [submitted, setSubmitted] = useState(false);

  const approve = (i) => setFields(f => f.map((r, idx) => idx === i ? { ...r, approved: true, editing: false } : r));
  const reject = (i) => setFields(f => f.map((r, idx) => idx === i ? { ...r, approved: false, editing: false } : r));
  const startEdit = (i) => setFields(f => f.map((r, idx) => idx === i ? { ...r, editing: true } : r));
  const saveEdit = (i, val) => setFields(f => f.map((r, idx) => idx === i ? { ...r, editedValue: val, editing: false, approved: true } : r));
  const approveAll = () => setFields(f => f.map(r => ({ ...r, approved: true, editing: false })));

  const reviewed = fields.filter(f => f.approved !== null).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{reviewed}/{fields.length} fields reviewed</p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={approveAll} className="text-green-600 border-green-200 hover:bg-green-50 h-8 text-xs">
            <Check className="w-3.5 h-3.5 mr-1" />Approve All
          </Button>
          {reviewed === fields.length && !submitted && (
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 h-8 text-xs" onClick={() => setSubmitted(true)}>
              <UserCheck className="w-3.5 h-3.5 mr-1" />Submit Review
            </Button>
          )}
        </div>
      </div>

      {submitted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-green-700 text-sm">
          <CheckCircle2 className="w-4 h-4" />Review submitted successfully.
        </div>
      )}

      <div className="space-y-2">
        {fields.map((row, i) => (
          <div key={i} className={cn("border rounded-lg p-3 flex items-center gap-3 transition-colors",
            row.approved === true ? "border-green-200 bg-green-50/40" :
            row.approved === false ? "border-red-200 bg-red-50/40" :
            "border-slate-200 bg-white"
          )}>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-400 mb-0.5">{row.field}</p>
              {row.editing ? (
                <EditField value={row.editedValue} onSave={(v) => saveEdit(i, v)} onCancel={() => setFields(f => f.map((r, idx) => idx === i ? { ...r, editing: false } : r))} />
              ) : (
                <p className="text-sm font-medium text-slate-800 truncate">{row.editedValue}</p>
              )}
            </div>
            <span className={cn("text-xs font-semibold flex-shrink-0", row.confidence >= 90 ? "text-green-600" : row.confidence >= 80 ? "text-yellow-600" : "text-red-500")}>
              {row.confidence}%
            </span>
            {!row.editing && (
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => startEdit(i)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => approve(i)} className={cn("p-1.5 rounded hover:bg-green-100", row.approved === true ? "text-green-600" : "text-slate-300 hover:text-green-600")}><Check className="w-3.5 h-3.5" /></button>
                <button onClick={() => reject(i)} className={cn("p-1.5 rounded hover:bg-red-100", row.approved === false ? "text-red-500" : "text-slate-300 hover:text-red-500")}><X className="w-3.5 h-3.5" /></button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function EditField({ value, onSave, onCancel }) {
  const [val, setVal] = useState(value);
  return (
    <div className="flex gap-2 items-center mt-1">
      <input
        className="flex-1 text-sm border border-indigo-300 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-indigo-400"
        value={val}
        onChange={e => setVal(e.target.value)}
        autoFocus
      />
      <button onClick={() => onSave(val)} className="p-1 text-green-600 hover:bg-green-100 rounded"><Save className="w-3.5 h-3.5" /></button>
      <button onClick={onCancel} className="p-1 text-slate-400 hover:bg-slate-100 rounded"><X className="w-3.5 h-3.5" /></button>
    </div>
  );
}

function SplitReview() {
  const [splits, setSplits] = useState(MOCK_SPLIT_RESULT.map(s => ({ ...s, approved: null })));
  const [submitted, setSubmitted] = useState(false);
  const approve = (i) => setSplits(s => s.map((r, idx) => idx === i ? { ...r, approved: true } : r));
  const reject = (i) => setSplits(s => s.map((r, idx) => idx === i ? { ...r, approved: false } : r));
  const reviewed = splits.filter(s => s.approved !== null).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{reviewed}/{splits.length} segments reviewed</p>
        {reviewed === splits.length && !submitted && (
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 h-8 text-xs" onClick={() => setSubmitted(true)}>
            <UserCheck className="w-3.5 h-3.5 mr-1" />Submit Review
          </Button>
        )}
      </div>
      {submitted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-green-700 text-sm">
          <CheckCircle2 className="w-4 h-4" />Review submitted successfully.
        </div>
      )}
      <div className="space-y-2">
        {splits.map((row, i) => (
          <div key={i} className={cn("border rounded-lg p-3 flex items-center gap-3",
            row.approved === true ? "border-green-200 bg-green-50/40" :
            row.approved === false ? "border-red-200 bg-red-50/40" :
            "border-slate-200 bg-white"
          )}>
            <div className="flex-1">
              <p className="text-xs text-slate-400 mb-0.5">Pages {row.page}</p>
              <span className="text-sm font-medium text-purple-700 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-full">{row.category}</span>
            </div>
            <span className={cn("text-xs font-semibold", row.confidence >= 90 ? "text-green-600" : "text-yellow-600")}>{row.confidence}%</span>
            <div className="flex gap-1">
              <button onClick={() => approve(i)} className={cn("p-1.5 rounded hover:bg-green-100", row.approved === true ? "text-green-600" : "text-slate-300 hover:text-green-600")}><Check className="w-3.5 h-3.5" /></button>
              <button onClick={() => reject(i)} className={cn("p-1.5 rounded hover:bg-red-100", row.approved === false ? "text-red-500" : "text-slate-300 hover:text-red-500")}><X className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ParseReview() {
  const [blocks, setBlocks] = useState(MOCK_PARSE_BLOCKS.map(b => ({ ...b, approved: null })));
  const [submitted, setSubmitted] = useState(false);
  const approve = (i) => setBlocks(b => b.map((r, idx) => idx === i ? { ...r, approved: true } : r));
  const reject = (i) => setBlocks(b => b.map((r, idx) => idx === i ? { ...r, approved: false } : r));
  const approveAll = () => setBlocks(b => b.map(r => ({ ...r, approved: true })));
  const reviewed = blocks.filter(b => b.approved !== null).length;

  const typeStyle = { heading: "text-slate-800 font-bold", paragraph: "text-slate-700", table: "font-mono text-xs text-slate-600 whitespace-pre-wrap" };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{reviewed}/{blocks.length} blocks reviewed</p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={approveAll} className="text-green-600 border-green-200 hover:bg-green-50 h-8 text-xs"><Check className="w-3.5 h-3.5 mr-1" />Approve All</Button>
          {reviewed === blocks.length && !submitted && (
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 h-8 text-xs" onClick={() => setSubmitted(true)}>
              <UserCheck className="w-3.5 h-3.5 mr-1" />Submit Review
            </Button>
          )}
        </div>
      </div>
      {submitted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-green-700 text-sm">
          <CheckCircle2 className="w-4 h-4" />Review submitted successfully.
        </div>
      )}
      <div className="space-y-2">
        {blocks.map((block, i) => (
          <div key={i} className={cn("border rounded-lg p-3 flex gap-3",
            block.approved === true ? "border-green-200 bg-green-50/40" :
            block.approved === false ? "border-red-200 bg-red-50/40" :
            "border-slate-200 bg-white"
          )}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded capitalize">{block.type}</span>
                <span className={cn("text-xs font-semibold", block.confidence >= 90 ? "text-green-600" : "text-yellow-600")}>{block.confidence}%</span>
              </div>
              <p className={cn("text-sm", typeStyle[block.type] || "text-slate-700")}>{block.content}</p>
            </div>
            <div className="flex flex-col gap-1 flex-shrink-0">
              <button onClick={() => approve(i)} className={cn("p-1.5 rounded hover:bg-green-100", block.approved === true ? "text-green-600" : "text-slate-300 hover:text-green-600")}><Check className="w-3.5 h-3.5" /></button>
              <button onClick={() => reject(i)} className={cn("p-1.5 rounded hover:bg-red-100", block.approved === false ? "text-red-500" : "text-slate-300 hover:text-red-500")}><X className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TransactionDetail({ txn, onBack, onRerun, onReject }) {
  const [activeView, setActiveView] = useState("details");

  return (
    <div className="flex-1 min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />Back
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <div>
            <span className="text-xs font-mono text-indigo-600 font-semibold">{txn.id}</span>
            <span className="text-slate-400 mx-2">·</span>
            <span className="text-sm font-medium text-slate-800">{txn.file}</span>
          </div>
          <StatusBadge status={txn.status} />
        </div>
        <div className="flex gap-2">
          {(txn.status === "failed" || txn.status === "rejected") && (
            <Button size="sm" variant="outline" onClick={() => onRerun(txn)} className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 h-8 text-xs">
              <RotateCcw className="w-3.5 h-3.5 mr-1" />Re-run
            </Button>
          )}
          {txn.status === "completed" && (
            <>
              <Button size="sm" variant="outline" onClick={() => onReject(txn)} className="text-orange-600 border-orange-200 hover:bg-orange-50 h-8 text-xs">
                <ThumbsDown className="w-3.5 h-3.5 mr-1" />Reject
              </Button>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 h-8 text-xs">
                <Download className="w-3.5 h-3.5 mr-1" />Download
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tab switcher */}
      <div className="bg-white border-b border-slate-200 px-6">
        <div className="flex gap-0">
          {[
            { key: "details", label: "Details", icon: FileText },
            { key: "human-review", label: "Human Review", icon: UserCheck },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveView(key)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                activeView === key ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"
              )}
            >
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 max-w-5xl">
        <AnimatePresence mode="wait">
          {activeView === "details" && (
            <motion.div key="details" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-3 gap-6">
              {/* Meta */}
              <div className="col-span-2 space-y-5">
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-700 mb-4">Transaction Info</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "Use Case", value: txn.useCase },
                      { label: "Engine", value: txn.engine },
                      { label: "Model", value: txn.model },
                      { label: "Pages", value: txn.pages },
                      { label: "Fields Extracted", value: txn.fieldsExtracted ?? "—" },
                      { label: "Ingestion", value: txn.ingestion },
                      { label: "Source", value: txn.source },
                      { label: "Submitted", value: txn.submittedAt },
                      { label: "Completed", value: txn.completedAt || "—" },
                      { label: "Duration", value: txn.duration || "In progress…" },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                        <p className="text-sm text-slate-700 font-medium truncate">{value ?? "—"}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {txn.confidence != null && (
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">Confidence Score</h3>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-slate-500">Overall confidence</span>
                      <span className={cn("font-bold text-base", txn.confidence >= 90 ? "text-green-600" : txn.confidence >= 75 ? "text-yellow-600" : "text-red-600")}>
                        {txn.confidence}%
                      </span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all", txn.confidence >= 90 ? "bg-green-500" : txn.confidence >= 75 ? "bg-yellow-400" : "bg-red-500")}
                        style={{ width: `${txn.confidence}%` }}
                      />
                    </div>
                  </div>
                )}

                {txn.errorMessage && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-700 mb-1">Error Details</p>
                      <p className="text-sm text-red-600">{txn.errorMessage}</p>
                    </div>
                  </div>
                )}

                {txn.rejectedBy && (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-orange-700 mb-1">Rejected by {txn.rejectedBy}</p>
                    <p className="text-sm text-orange-600">{txn.rejectionReason}</p>
                    <p className="text-xs text-slate-400 mt-1">{txn.rejectedAt}</p>
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm h-fit">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Processing Steps</h3>
                <StepTimeline steps={txn.steps} />
              </div>
            </motion.div>
          )}

          {activeView === "human-review" && (
            <motion.div key="review" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-sm font-semibold text-slate-700">Human Review</h3>
                  <span className="text-xs text-slate-400 ml-1">Review and approve AI output before finalizing</span>
                </div>
                <div className="p-5">
                  <Tabs defaultValue="extraction">
                    <TabsList className="bg-slate-100 mb-5">
                      <TabsTrigger value="extraction" className="text-xs gap-1.5">
                        <Zap className="w-3.5 h-3.5" />Extraction
                      </TabsTrigger>
                      <TabsTrigger value="split" className="text-xs gap-1.5">
                        <Scissors className="w-3.5 h-3.5" />Classification / Split
                      </TabsTrigger>
                      <TabsTrigger value="parse" className="text-xs gap-1.5">
                        <Scan className="w-3.5 h-3.5" />Parse
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="extraction"><ExtractionReview txn={txn} /></TabsContent>
                    <TabsContent value="split"><SplitReview /></TabsContent>
                    <TabsContent value="parse"><ParseReview /></TabsContent>
                  </Tabs>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}