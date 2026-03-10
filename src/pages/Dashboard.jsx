import React, { useState, useEffect } from "react";
import { profilesService, documentConfigsService, analyticsService } from "@/components/services/dataService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import {
  FileText, CheckCircle2, XCircle, Clock, AppWindow, Mail,
  Zap, Tag, FolderOpen, ChevronRight, TrendingUp, TrendingDown
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";



const statusStyle = {
  completed: "bg-green-50 text-green-700 border-green-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
};

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const totalProcessed = volumeData.reduce((s, d) => s + d.completed + d.failed, 0);
  const totalCompleted = volumeData.reduce((s, d) => s + d.completed, 0);
  const totalFailed = volumeData.reduce((s, d) => s + d.failed, 0);

  const stats = [
    { label: "Active Profiles", value: MOCK_PROFILES.filter(p => p.isActive).length, icon: AppWindow, color: "text-indigo-600", bg: "bg-indigo-50", sub: `${MOCK_PROFILES.length} total` },
    { label: "Document Configs", value: MOCK_DOC_CONFIGS.length, icon: FolderOpen, color: "text-purple-600", bg: "bg-purple-50", sub: `${MOCK_DOC_CONFIGS.filter(d => d.enabled).length} enabled` },
    { label: "Processed (7d)", value: totalProcessed, icon: FileText, color: "text-slate-600", bg: "bg-slate-100", sub: `${totalCompleted} completed` },
    { label: "Failed (7d)", value: totalFailed, icon: XCircle, color: "text-red-500", bg: "bg-red-50", sub: `${((totalFailed / totalProcessed) * 100).toFixed(1)}% failure rate` },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          {user ? `Welcome back, ${user.full_name?.split(" ")[0] || "there"}` : "Dashboard"}
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Here's what's happening across your profiles and documents.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border-slate-200 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">{s.label}</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{s.value}</p>
                    <p className="text-xs text-slate-400 mt-1">{s.sub}</p>
                  </div>
                  <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Profiles + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* My Profiles */}
        <Card className="lg:col-span-3 border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <AppWindow className="w-4 h-4 text-indigo-500" />My Profiles
              </CardTitle>
              <Link to={createPageUrl("Onboarding")} className="text-xs text-indigo-600 hover:underline font-medium">
                Manage →
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {MOCK_PROFILES.map((p) => (
              <Link key={p.id} to={createPageUrl("Onboarding")} className="block">
                <div className="flex items-start justify-between p-3 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <AppWindow className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{p.appName}</p>
                      <p className="text-xs text-slate-400 font-mono mb-2">{p.appId}</p>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                        <Mail className="w-3 h-3" />{p.contactEmail}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {p.useCases.map((uc, i) => (
                          <span key={i} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border bg-slate-50 text-slate-600 border-slate-200">
                            {uc.type === "extraction" ? <Zap className="w-3 h-3 text-indigo-400" /> : <Tag className="w-3 h-3 text-purple-400" />}
                            {uc.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={p.isActive ? "default" : "secondary"} className="text-xs">
                      {p.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Processing Volume */}
        <Card className="lg:col-span-2 border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Processing Volume (7d)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={volumeData} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Bar dataKey="completed" fill="#6366f1" radius={[4, 4, 0, 0]} name="Completed" />
                <Bar dataKey="failed" fill="#fca5a5" radius={[4, 4, 0, 0]} name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Document Configs + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* My Document Configs */}
        <Card className="lg:col-span-2 border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-purple-500" />Document Configs
              </CardTitle>
              <Link to={createPageUrl("DocumentConfig")} className="text-xs text-indigo-600 hover:underline font-medium">
                View All →
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {MOCK_DOC_CONFIGS.map((dc) => (
              <div key={dc.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center ${dc.enabled ? "bg-purple-50" : "bg-slate-100"}`}>
                    <FolderOpen className={`w-3.5 h-3.5 ${dc.enabled ? "text-purple-500" : "text-slate-400"}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{dc.name}</p>
                    <p className="text-xs text-slate-400">{dc.type} · {dc.lastUsed}</p>
                  </div>
                </div>
                <Badge variant={dc.enabled ? "default" : "secondary"} className="text-xs flex-shrink-0">
                  {dc.enabled ? "On" : "Off"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="lg:col-span-3 border-slate-200 shadow-sm">
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
                  <th className="text-left px-5 py-2.5">ID</th>
                  <th className="text-left px-5 py-2.5">Document</th>
                  <th className="text-left px-5 py-2.5">Profile</th>
                  <th className="text-left px-5 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((txn) => (
                  <tr key={txn.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-indigo-600">{txn.id}</td>
                    <td className="px-5 py-3 text-slate-700 text-xs font-medium truncate max-w-[140px]">{txn.file}</td>
                    <td className="px-5 py-3 text-slate-400 text-xs">{txn.profile}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusStyle[txn.status] || "bg-slate-100 text-slate-600"} capitalize`}>
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}