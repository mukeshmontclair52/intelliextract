import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, RefreshCw, XCircle, Eye, ChevronDown, ChevronRight, CheckCircle2, Clock, AlertTriangle, FileText, RotateCcw, ThumbsDown, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_TRANSACTIONS = [
  {
    id: "TXN-1041", file: "Blackstone_Q1_2026.pdf", useCase: "Extraction", status: "completed",
    submittedAt: "2026-03-04 09:42", completedAt: "2026-03-04 09:45", duration: "3m 12s",
    engine: "Gen AI - LLM", model: "GPT-4 Turbo", pages: 24, fieldsExtracted: 87, confidence: 97,
    ingestion: "Email", source: "reports@blackstone.com",
    steps: [
      { name: "Document Received", status: "completed", time: "09:42:01" },
      { name: "Text Extraction", status: "completed", time: "09:42:18" },
      { name: "AI Inference", status: "completed", time: "09:44:33" },
      { name: "Validation", status: "completed", time: "09:44:51" },
      { name: "Output Generated", status: "completed", time: "09:45:02" },
    ]
  },
  {
    id: "TXN-1040", file: "Apollo_Fund_Report.pdf", useCase: "Extraction", status: "failed",
    submittedAt: "2026-03-04 09:34", completedAt: "2026-03-04 09:36", duration: "2m 01s",
    engine: "Gen AI - LLM", model: "GPT-4 Turbo", pages: 18, fieldsExtracted: 0, confidence: 0,
    ingestion: "API", source: "api-ingest",
    errorMessage: "Token limit exceeded during AI inference phase. Document may be too large.",
    steps: [
      { name: "Document Received", status: "completed", time: "09:34:10" },
      { name: "Text Extraction", status: "completed", time: "09:34:55" },
      { name: "AI Inference", status: "failed", time: "09:36:01", error: "Token limit exceeded" },
      { name: "Validation", status: "skipped", time: "-" },
      { name: "Output Generated", status: "skipped", time: "-" },
    ]
  },
  {
    id: "TXN-1039", file: "KKR_Quarterly_Dec.pdf", useCase: "Classification", status: "completed",
    submittedAt: "2026-03-04 09:27", completedAt: "2026-03-04 09:29", duration: "1m 48s",
    engine: "Gen AI - LLM", model: "GPT-4o", pages: 11, fieldsExtracted: 4, confidence: 99,
    ingestion: "S3", source: "s3://docs-bucket/kkr/",
    steps: [
      { name: "Document Received", status: "completed", time: "09:27:00" },
      { name: "Text Extraction", status: "completed", time: "09:27:40" },
      { name: "AI Inference", status: "completed", time: "09:28:55" },
      { name: "Validation", status: "completed", time: "09:29:10" },
      { name: "Output Generated", status: "completed", time: "09:29:20" },
    ]
  },
  {
    id: "TXN-1038", file: "Carlyle_Alts_Q4.pdf", useCase: "Extraction", status: "processing",
    submittedAt: "2026-03-04 09:21", completedAt: null, duration: null,
    engine: "Gen AI - LLM", model: "GPT-4 Turbo", pages: 36, fieldsExtracted: null, confidence: null,
    ingestion: "Kafka", source: "docs.inbound.topic",
    steps: [
      { name: "Document Received", status: "completed", time: "09:21:05" },
      { name: "Text Extraction", status: "completed", time: "09:22:10" },
      { name: "AI Inference", status: "processing", time: "09:22:30" },
      { name: "Validation", status: "pending", time: "-" },
      { name: "Output Generated", status: "pending", time: "-" },
    ]
  },
  {
    id: "TXN-1037", file: "TPG_Schedule_2026.pdf", useCase: "Extraction", status: "rejected",
    submittedAt: "2026-03-04 08:58", completedAt: "2026-03-04 09:01", duration: "3m 30s",
    engine: "Gen AI - LLM", model: "GPT-4 Turbo", pages: 20, fieldsExtracted: 72, confidence: 81,
    ingestion: "Email", source: "ops@tpg.com",
    rejectedBy: "john.doe@firm.com", rejectedAt: "2026-03-04 10:15", rejectionReason: "Confidence below threshold. Manual review required.",
    steps: [
      { name: "Document Received", status: "completed", time: "08:58:00" },
      { name: "Text Extraction", status: "completed", time: "08:59:05" },
      { name: "AI Inference", status: "completed", time: "09:00:50" },
      { name: "Validation", status: "completed", time: "09:01:10" },
      { name: "Output Generated", status: "completed", time: "09:01:20" },
    ]
  },
  {
    id: "TXN-1036", file: "Warburg_Annual_2025.pdf", useCase: "Extraction", status: "completed",
    submittedAt: "2026-03-04 08:45", completedAt: "2026-03-04 08:49", duration: "4m 12s",
    engine: "Template Based", model: "-", pages: 44, fieldsExtracted: 102, confidence: 95,
    ingestion: "S3", source: "s3://docs-bucket/warburg/",
    steps: [
      { name: "Document Received", status: "completed", time: "08:45:00" },
      { name: "Text Extraction", status: "completed", time: "08:46:10" },
      { name: "AI Inference", status: "completed", time: "08:48:30" },
      { name: "Validation", status: "completed", time: "08:48:55" },
      { name: "Output Generated", status: "completed", time: "08:49:05" },
    ]
  },
];

const STATUS_CONFIG = {
  completed: { label: "Completed", color: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle2 },
  failed: { label: "Failed", color: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
  processing: { label: "Processing", color: "bg-blue-50 text-blue-700 border-blue-200", icon: RefreshCw },
  pending: { label: "Pending", color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: Clock },
  rejected: { label: "Rejected", color: "bg-orange-50 text-orange-700 border-orange-200", icon: ThumbsDown },
  skipped: { label: "Skipped", color: "bg-slate-50 text-slate-500 border-slate-200", icon: Clock },
};

function StatusBadge({ status, small }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 font-medium border rounded-full capitalize", cfg.color, small ? "text-xs px-2 py-0.5" : "text-xs px-2.5 py-1")}>
      <Icon className={cn("flex-shrink-0", small ? "w-2.5 h-2.5" : "w-3 h-3")} />
      {cfg.label}
    </span>
  );
}

function StepTimeline({ steps }) {
  return (
    <div className="space-y-2 mt-2">
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

function DetailDrawer({ txn, onClose, onRerun, onReject }) {
  if (!txn) return null;
  return (
    <div className="w-[420px] flex-shrink-0 border-l border-slate-200 bg-white flex flex-col h-full overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 font-mono">{txn.id}</p>
          <p className="text-sm font-semibold text-slate-800 mt-0.5 truncate max-w-[280px]">{txn.file}</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <XCircle className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Status + Actions */}
        <div className="flex items-center justify-between">
          <StatusBadge status={txn.status} />
          <div className="flex gap-2">
            {(txn.status === "failed" || txn.status === "rejected") && (
              <Button size="sm" variant="outline" onClick={() => onRerun(txn)} className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 h-8 text-xs">
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Re-run
              </Button>
            )}
            {txn.status === "completed" && (
              <>
                <Button size="sm" variant="outline" onClick={() => onReject(txn)} className="text-orange-600 border-orange-200 hover:bg-orange-50 h-8 text-xs">
                  <ThumbsDown className="w-3.5 h-3.5 mr-1" />
                  Reject
                </Button>
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 h-8 text-xs">
                  <Download className="w-3.5 h-3.5 mr-1" />
                  Download
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Meta Info */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Use Case", value: txn.useCase },
            { label: "Engine", value: txn.engine },
            { label: "Model", value: txn.model },
            { label: "Pages", value: txn.pages },
            { label: "Ingestion", value: txn.ingestion },
            { label: "Source", value: txn.source },
            { label: "Submitted", value: txn.submittedAt },
            { label: "Duration", value: txn.duration || "In progress…" },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-slate-400">{label}</p>
              <p className="text-sm text-slate-700 font-medium truncate">{value || "—"}</p>
            </div>
          ))}
        </div>

        {/* Confidence */}
        {txn.confidence != null && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500">Confidence Score</span>
              <span className={cn("font-semibold", txn.confidence >= 90 ? "text-green-600" : txn.confidence >= 75 ? "text-yellow-600" : "text-red-600")}>
                {txn.confidence}%
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", txn.confidence >= 90 ? "bg-green-500" : txn.confidence >= 75 ? "bg-yellow-400" : "bg-red-500")}
                style={{ width: `${txn.confidence}%` }}
              />
            </div>
          </div>
        )}

        {/* Error */}
        {txn.errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-red-700 mb-0.5">Error</p>
              <p className="text-xs text-red-600">{txn.errorMessage}</p>
            </div>
          </div>
        )}

        {/* Rejected info */}
        {txn.rejectedBy && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-orange-700 mb-0.5">Rejected by {txn.rejectedBy}</p>
            <p className="text-xs text-orange-600">{txn.rejectionReason}</p>
            <p className="text-xs text-slate-400 mt-1">{txn.rejectedAt}</p>
          </div>
        )}

        {/* Step Timeline */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Processing Steps</p>
          <StepTimeline steps={txn.steps} />
        </div>
      </div>
    </div>
  );
}

export default function Transactions() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [useCaseFilter, setUseCaseFilter] = useState("all");
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);

  const filtered = transactions.filter((t) => {
    const matchSearch = !search || t.file.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    const matchUseCase = useCaseFilter === "all" || t.useCase === useCaseFilter;
    return matchSearch && matchStatus && matchUseCase;
  });

  const handleRerun = (txn) => {
    setTransactions((prev) => prev.map((t) => t.id === txn.id ? { ...t, status: "processing" } : t));
    setSelectedTxn((prev) => prev?.id === txn.id ? { ...prev, status: "processing" } : prev);
  };

  const handleReject = (txn) => {
    setTransactions((prev) => prev.map((t) => t.id === txn.id ? { ...t, status: "rejected", rejectedBy: "you@firm.com", rejectedAt: new Date().toLocaleString(), rejectionReason: "Manually rejected." } : t));
    setSelectedTxn((prev) => prev?.id === txn.id ? { ...prev, status: "rejected", rejectedBy: "you@firm.com" } : prev);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="px-6 py-5 bg-white border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-slate-800">Transactions</h1>
              <p className="text-sm text-slate-400 mt-0.5">{filtered.length} records found</p>
            </div>
            <Button variant="outline" size="sm" className="text-slate-600">
              <Download className="w-4 h-4 mr-1.5" />
              Export CSV
            </Button>
          </div>
          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                className="pl-9 h-9 text-sm"
                placeholder="Search by filename or ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-36 text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={useCaseFilter} onValueChange={setUseCaseFilter}>
              <SelectTrigger className="h-9 w-36 text-sm"><SelectValue placeholder="Use Case" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Use Cases</SelectItem>
                <SelectItem value="Extraction">Extraction</SelectItem>
                <SelectItem value="Classification">Classification</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
              <tr className="text-xs text-slate-400 font-semibold uppercase tracking-wide">
                <th className="text-left px-6 py-3">ID</th>
                <th className="text-left px-4 py-3">Document</th>
                <th className="text-left px-4 py-3">Use Case</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Confidence</th>
                <th className="text-left px-4 py-3">Submitted</th>
                <th className="text-left px-4 py-3">Duration</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((txn) => (
                <tr
                  key={txn.id}
                  onClick={() => setSelectedTxn(txn)}
                  className={cn(
                    "border-b border-slate-50 cursor-pointer transition-colors hover:bg-indigo-50/40",
                    selectedTxn?.id === txn.id && "bg-indigo-50"
                  )}
                >
                  <td className="px-6 py-3.5 font-mono text-xs text-indigo-600 font-medium">{txn.id}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="text-slate-700 font-medium truncate max-w-[200px]">{txn.file}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 text-xs">{txn.useCase}</td>
                  <td className="px-4 py-3.5"><StatusBadge status={txn.status} small /></td>
                  <td className="px-4 py-3.5">
                    {txn.confidence != null ? (
                      <span className={cn("text-xs font-semibold", txn.confidence >= 90 ? "text-green-600" : txn.confidence >= 75 ? "text-yellow-600" : "text-red-600")}>
                        {txn.confidence}%
                      </span>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-slate-400 text-xs font-mono">{txn.submittedAt}</td>
                  <td className="px-4 py-3.5 text-slate-400 text-xs">{txn.duration || "—"}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1 justify-end">
                      {(txn.status === "failed" || txn.status === "rejected") && (
                        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleRerun(txn); }} className="h-7 px-2 text-xs text-indigo-600 hover:bg-indigo-50">
                          <RotateCcw className="w-3 h-3 mr-1" />Re-run
                        </Button>
                      )}
                      {txn.status === "completed" && (
                        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleReject(txn); }} className="h-7 px-2 text-xs text-orange-600 hover:bg-orange-50">
                          <ThumbsDown className="w-3 h-3 mr-1" />Reject
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-slate-400 text-sm">No transactions match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer */}
      <AnimatePresence>
        {selectedTxn && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 420, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
            style={{ height: "100vh" }}
          >
            <DetailDrawer txn={selectedTxn} onClose={() => setSelectedTxn(null)} onRerun={handleRerun} onReject={handleReject} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}