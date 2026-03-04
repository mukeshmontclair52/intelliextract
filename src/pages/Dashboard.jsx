import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { FileText, CheckCircle2, XCircle, Clock, RefreshCw, TrendingUp, AlertTriangle } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

const volumeData = [
  { day: "Mon", processed: 42, failed: 3 },
  { day: "Tue", processed: 58, failed: 5 },
  { day: "Wed", processed: 73, failed: 2 },
  { day: "Thu", processed: 61, failed: 8 },
  { day: "Fri", processed: 89, failed: 4 },
  { day: "Sat", processed: 34, failed: 1 },
  { day: "Sun", processed: 27, failed: 2 },
];

const trendData = [
  { month: "Oct", accuracy: 91 },
  { month: "Nov", accuracy: 93 },
  { month: "Dec", accuracy: 92 },
  { month: "Jan", accuracy: 95 },
  { month: "Feb", accuracy: 94 },
  { month: "Mar", accuracy: 97 },
];

const recentTransactions = [
  { id: "TXN-1041", file: "Blackstone_Q1_2026.pdf", useCase: "Extraction", status: "completed", time: "2 min ago" },
  { id: "TXN-1040", file: "Apollo_Fund_Report.pdf", useCase: "Extraction", status: "failed", time: "8 min ago" },
  { id: "TXN-1039", file: "KKR_Quarterly_Dec.pdf", useCase: "Classification", status: "completed", time: "15 min ago" },
  { id: "TXN-1038", file: "Carlyle_Alts_Q4.pdf", useCase: "Extraction", status: "processing", time: "21 min ago" },
  { id: "TXN-1037", file: "TPG_Schedule_2026.pdf", useCase: "Extraction", status: "completed", time: "34 min ago" },
];

const statusBadge = (status) => {
  const map = {
    completed: "bg-green-50 text-green-700 border-green-200",
    failed: "bg-red-50 text-red-700 border-red-200",
    processing: "bg-blue-50 text-blue-700 border-blue-200",
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  };
  return map[status] || "bg-slate-100 text-slate-600";
};

const stats = [
  { label: "Total Processed", value: "1,284", icon: FileText, color: "text-indigo-600", bg: "bg-indigo-50", delta: "+12% this week" },
  { label: "Completed", value: "1,201", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", delta: "93.5% success rate" },
  { label: "Failed", value: "83", icon: XCircle, color: "text-red-500", bg: "bg-red-50", delta: "6.5% failure rate" },
  { label: "Pending / In Progress", value: "14", icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50", delta: "Avg. 3.2 min / doc" },
];

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Overview of document processing activity</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border-slate-200 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">{s.label}</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{s.value}</p>
                    <p className="text-xs text-slate-400 mt-1">{s.delta}</p>
                  </div>
                  <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center`}>
                    <Icon className={`w-4.5 h-4.5 ${s.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="col-span-3 border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Daily Processing Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={volumeData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Bar dataKey="processed" fill="#6366f1" radius={[4, 4, 0, 0]} name="Processed" />
                <Bar dataKey="failed" fill="#fca5a5" radius={[4, 4, 0, 0]} name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-2 border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              Accuracy Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[85, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Line type="monotone" dataKey="accuracy" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, fill: "#6366f1" }} name="Accuracy %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-slate-700">Recent Transactions</CardTitle>
            <Link to={createPageUrl("Transactions")} className="text-xs text-indigo-600 hover:underline font-medium">
              View All →
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-400 font-medium">
                <th className="text-left px-5 py-2.5">Transaction ID</th>
                <th className="text-left px-5 py-2.5">Document</th>
                <th className="text-left px-5 py-2.5">Use Case</th>
                <th className="text-left px-5 py-2.5">Status</th>
                <th className="text-left px-5 py-2.5">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((txn) => (
                <tr key={txn.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-indigo-600">{txn.id}</td>
                  <td className="px-5 py-3 text-slate-700 font-medium">{txn.file}</td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{txn.useCase}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusBadge(txn.status)} capitalize`}>
                      {txn.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-400 text-xs">{txn.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}