import React, { useState, useMemo, useEffect } from "react";
import { analyticsService } from "@/components/services/dataService";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { CalendarDays, TrendingUp, TrendingDown, FileText, CheckCircle2, XCircle, Clock, Filter, ChevronDown, BookOpen, UserCheck, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ── Constants ──────────────────────────────────────────────────────────────────
const CLIENT_PROFILES = ["All Clients", "Alts Extraction App", "Fund Reports Pipeline", "Tax Doc Processor", "Insurance Claims AI"];
const DOCUMENT_IDS = ["All Documents", "doc-001", "doc-002", "doc-003", "doc-004", "doc-005"];
const DATE_RANGES = ["Last 7 Days", "Last 30 Days", "Last 90 Days", "Last 12 Months"];

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({ title, value, sub, trend, trendUp, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-slate-800">{value}</p>
        <div className="flex items-center gap-1.5 mt-1">
          {trend && (
            trendUp
              ? <TrendingUp className="w-3.5 h-3.5 text-green-500" />
              : <TrendingDown className="w-3.5 h-3.5 text-red-500" />
          )}
          <span className={`text-xs font-medium ${trendUp ? "text-green-600" : "text-red-600"}`}>{trend}</span>
          <span className="text-xs text-slate-400">{sub}</span>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return <h2 className="text-base font-semibold text-slate-700 mb-3">{children}</h2>;
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function Analytics() {
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [clientProfile, setClientProfile] = useState("All Clients");
  const [documentId, setDocumentId] = useState("All Documents");
  const [dailyData, setDailyData] = useState([]);
  const [engineData, setEngineData] = useState([]);
  const [docTypeData, setDocTypeData] = useState([]);
  const [latencyData, setLatencyData] = useState([]);

  useEffect(() => {
    analyticsService.getEngineData().then(setEngineData);
    analyticsService.getDocTypeData().then(setDocTypeData);
    analyticsService.getLatencyData().then(setLatencyData);
  }, []);

  useEffect(() => {
    analyticsService.getVolumeData(dateRange).then(setDailyData);
  }, [dateRange]);

  const totals = useMemo(() => {
    const completed = dailyData.reduce((s, d) => s + d.completed, 0);
    const failed = dailyData.reduce((s, d) => s + d.failed, 0);
    const total = completed + failed;
    return { completed, failed, total, successRate: total ? ((completed / total) * 100).toFixed(1) : "0.0" };
  }, [dailyData]);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">Overall application performance and processing insights</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40 h-8 text-xs">
              <CalendarDays className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_RANGES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={clientProfile} onValueChange={setClientProfile}>
            <SelectTrigger className="w-48 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CLIENT_PROFILES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={documentId} onValueChange={setDocumentId}>
            <SelectTrigger className="w-40 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DOCUMENT_IDS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard title="Total Transactions" value={totals.total.toLocaleString()} sub="vs prev period" trend="+12.4%" trendUp icon={FileText} color="bg-indigo-500" />
        <StatCard title="Completed" value={totals.completed.toLocaleString()} sub="vs prev period" trend="+8.7%" trendUp icon={CheckCircle2} color="bg-green-500" />
        <StatCard title="Failed" value={totals.failed.toLocaleString()} sub="vs prev period" trend="-3.1%" trendUp icon={XCircle} color="bg-red-400" />
        <StatCard title="Success Rate" value={`${totals.successRate}%`} sub="vs prev period" trend="+0.4%" trendUp icon={TrendingUp} color="bg-violet-500" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard title="Pages Processed" value={(totals.total * 4).toLocaleString()} sub="vs prev period" trend="+14.1%" trendUp icon={BookOpen} color="bg-sky-500" />
        <StatCard title="Docs Reviewed by Human" value={Math.floor(totals.total * 0.18).toLocaleString()} sub="vs prev period" trend="-5.2%" trendUp={false} icon={UserCheck} color="bg-amber-500" />
        <StatCard title="Fields Edited by Human" value={Math.floor(totals.total * 0.09 * 3).toLocaleString()} sub="vs prev period" trend="-8.3%" trendUp={false} icon={PenLine} color="bg-rose-500" />
      </div>

      {/* Volume Over Time */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
        <SectionTitle>Processing Volume Over Time</SectionTitle>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={dailyData} barSize={dailyData.length > 20 ? 4 : 14}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} interval={Math.floor(dailyData.length / 6)} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="completed" name="Completed" fill="#6366f1" radius={[2, 2, 0, 0]} />
            <Bar dataKey="failed" name="Failed" fill="#f87171" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Row: Engine breakdown + Latency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Engine Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <SectionTitle>Engine Usage Breakdown</SectionTitle>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={engineData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                  {engineData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => [`${v}%`]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 flex-1">
              {ENGINE_DATA.map((e) => (
                <div key={e.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: e.color }} />
                    <span className="text-slate-600">{e.name}</span>
                  </div>
                  <span className="font-semibold text-slate-800">{e.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Latency Percentiles */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <SectionTitle>Response Latency (seconds)</SectionTitle>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={LATENCY_DATA} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#94a3b8" }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} unit="s" />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => [`${v}s`]} />
              <Bar dataKey="value" name="Latency" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Document Type Performance */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
        <SectionTitle>Document Type Performance</SectionTitle>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left py-2 px-3 font-medium text-slate-500">Document Type</th>
              <th className="text-right py-2 px-3 font-medium text-slate-500">Transactions</th>
              <th className="text-right py-2 px-3 font-medium text-slate-500">Success Rate</th>
              <th className="py-2 px-3 font-medium text-slate-500">Volume Bar</th>
            </tr>
          </thead>
          <tbody>
            {DOC_TYPE_DATA.map((row) => {
              const maxCount = Math.max(...DOC_TYPE_DATA.map(r => r.count));
              return (
                <tr key={row.type} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-medium text-slate-700">{row.type}</td>
                  <td className="py-3 px-3 text-right text-slate-600">{row.count.toLocaleString()}</td>
                  <td className="py-3 px-3 text-right">
                    <Badge className={`text-xs ${row.success >= 96 ? "bg-green-100 text-green-700 border-green-200" : "bg-yellow-100 text-yellow-700 border-yellow-200"}`}>
                      {row.success}%
                    </Badge>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 rounded-full h-2">
                        <div className="bg-indigo-400 h-2 rounded-full" style={{ width: `${(row.count / maxCount) * 100}%` }} />
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Daily Success Rate Trend */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <SectionTitle>Success Rate Trend</SectionTitle>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={dailyData.map(d => ({ ...d, rate: +((d.completed / d.total) * 100).toFixed(1) }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} interval={Math.floor(dailyData.length / 6)} />
            <YAxis domain={[80, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} unit="%" />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => [`${v}%`, "Success Rate"]} />
            <Line type="monotone" dataKey="rate" stroke="#6366f1" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}