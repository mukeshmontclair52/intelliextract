import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, RefreshCw, XCircle, CheckCircle2, Clock, FileText, RotateCcw, ThumbsDown, Download, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import TransactionDetail from "@/components/transactions/TransactionDetail";

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

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 font-medium border rounded-full text-xs px-2 py-0.5", cfg.color)}>
      <Icon className="w-2.5 h-2.5 flex-shrink-0" />
      {cfg.label}
    </span>
  );
}



export default function Transactions() {
  // Search fields
  const [txnId, setTxnId] = useState("");
  const [profileId, setProfileId] = useState("");
  const [docConfigId, setDocConfigId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Results
  const [hasSearched, setHasSearched] = useState(false);
  const [filtered, setFiltered] = useState([]);

  const [selectedTxn, setSelectedTxn] = useState(null);
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);

  const handleSearch = () => {
    const results = transactions.filter((t) => {
      const matchTxn = !txnId || t.id.toLowerCase().includes(txnId.toLowerCase());
      const matchDate =
        (!dateFrom || t.submittedAt >= dateFrom) &&
        (!dateTo || t.submittedAt <= dateTo + " 23:59");
      return matchTxn && matchDate;
    });
    setFiltered(results);
    setHasSearched(true);
  };

  const handleClear = () => {
    setTxnId(""); setProfileId(""); setDocConfigId("");
    setDateFrom(""); setDateTo("");
    setFiltered([]); setHasSearched(false);
  };

  if (selectedTxn) {
    return (
      <TransactionDetail
        txn={selectedTxn}
        onBack={() => setSelectedTxn(null)}
        onRerun={(txn) => {
          handleRerunFn(txn);
          setSelectedTxn(prev => prev?.id === txn.id ? { ...prev, status: "processing" } : prev);
        }}
        onReject={(txn) => {
          handleRejectFn(txn);
          setSelectedTxn(prev => prev?.id === txn.id ? { ...prev, status: "rejected", rejectedBy: "you@firm.com" } : prev);
        }}
      />
    );
  }

  const handleRerunFn = (txn) => {
    setTransactions((prev) => prev.map((t) => t.id === txn.id ? { ...t, status: "processing" } : t));
    setFiltered((prev) => prev.map((t) => t.id === txn.id ? { ...t, status: "processing" } : t));
  };

  const handleRejectFn = (txn) => {
    setTransactions((prev) => prev.map((t) => t.id === txn.id ? { ...t, status: "rejected", rejectedBy: "you@firm.com", rejectedAt: new Date().toLocaleString(), rejectionReason: "Manually rejected." } : t));
    setFiltered((prev) => prev.map((t) => t.id === txn.id ? { ...t, status: "rejected", rejectedBy: "you@firm.com", rejectedAt: new Date().toLocaleString(), rejectionReason: "Manually rejected." } : t));
  };

  const handleRerun = (txn) => {
    handleRerunFn(txn);
    setSelectedTxn((prev) => prev?.id === txn.id ? { ...prev, status: "processing" } : prev);
  };

  const handleReject = (txn) => {
    handleRejectFn(txn);
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
              <p className="text-sm text-slate-400 mt-0.5">
                {hasSearched ? `${filtered.length} records found` : "Search to load transactions"}
              </p>
            </div>
            {hasSearched && (
              <Button variant="outline" size="sm" className="text-slate-600">
                <Download className="w-4 h-4 mr-1.5" />Export CSV
              </Button>
            )}
          </div>
          {/* Search fields */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input className="pl-8 h-9 text-sm" placeholder="Transaction ID" value={txnId} onChange={(e) => setTxnId(e.target.value)} />
            </div>
            <Input className="h-9 text-sm" placeholder="Profile ID" value={profileId} onChange={(e) => setProfileId(e.target.value)} />
            <Input className="h-9 text-sm" placeholder="Doc Config ID" value={docConfigId} onChange={(e) => setDocConfigId(e.target.value)} />
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <Input type="date" className="pl-8 h-9 text-sm" placeholder="From" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <Input type="date" className="pl-8 h-9 text-sm" placeholder="To" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 h-9 px-5" onClick={handleSearch}>
              <Search className="w-3.5 h-3.5 mr-1.5" />Search
            </Button>
            {hasSearched && (
              <Button size="sm" variant="outline" className="h-9 px-4 text-slate-500" onClick={handleClear}>
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          {!hasSearched ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3 py-24">
              <Search className="w-10 h-10 opacity-30" />
              <p className="text-sm font-medium">Enter search criteria above and click Search</p>
              <p className="text-xs">You can search by Transaction ID, Profile ID, Doc Config ID, or date range</p>
            </div>
          ) : (
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
                  <td colSpan={8} className="text-center py-16 text-slate-400 text-sm">No transactions match your search criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
          )}
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