import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { cn } from "@/lib/utils";
import { LayoutDashboard, ArrowLeftRight, Settings, FileSearch, UserPlus, ChevronRight, FolderOpen, FlaskConical, ChevronLeft, Menu, LifeBuoy, BarChart2, Beaker, Play } from "lucide-react";

const navItems = [
  { label: "Dashboard", page: "Dashboard", icon: LayoutDashboard },
  { label: "Transactions", page: "Transactions", icon: ArrowLeftRight },
  { label: "Document Config", page: "DocumentConfig", icon: FolderOpen },
  { label: "Analytics", page: "Analytics", icon: BarChart2 },
  { label: "Playground", page: "Playground", icon: FlaskConical },
  { label: "Playground V2", page: "PlaygroundV2", icon: Beaker },
  { label: "Client Profile", page: "Onboarding", icon: UserPlus },
  { label: "Execution Plan", page: "ExecutionPlan", icon: Play },
  { label: "Support", page: "Support", icon: LifeBuoy },
];

export default function Layout({ children, currentPageName }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className={cn("flex-shrink-0 bg-white border-r border-slate-200 flex flex-col fixed h-full z-20 transition-all duration-200", collapsed ? "w-14" : "w-56")}>
        <div className={cn("px-3 py-4 border-b border-slate-100 flex items-center", collapsed ? "justify-center" : "justify-between")}>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                <FileSearch className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-slate-800 text-sm">DocExtract</span>
            </div>
          )}
          {collapsed && (
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <FileSearch className="w-4 h-4 text-white" />
            </div>
          )}
          {!collapsed && (
            <button onClick={() => setCollapsed(true)} className="text-slate-400 hover:text-slate-600 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {collapsed && (
          <div className="flex justify-center py-2 border-b border-slate-100">
            <button onClick={() => setCollapsed(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
              <Menu className="w-4 h-4" />
            </button>
          </div>
        )}

        <nav className="flex-1 py-4 px-2 space-y-0.5">
          {navItems.map(({ label, page, icon: Icon }) => {
            const active = currentPageName === page;
            return (
              <Link
                key={page}
                to={createPageUrl(page)}
                title={collapsed ? label : undefined}
                className={cn(
                  "flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm font-medium transition-all group",
                  collapsed ? "justify-center" : "",
                  active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                )}
              >
                <Icon className={cn("w-4 h-4 flex-shrink-0", active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />
                {!collapsed && <span className="truncate">{label}</span>}
                {!collapsed && active && <ChevronRight className="w-3 h-3 ml-auto text-indigo-400" />}
              </Link>
            );
          })}
        </nav>

        <div className={cn("px-2 py-3 border-t border-slate-100", collapsed ? "flex justify-center" : "")}>
          <Link
            to={createPageUrl("ExtractionConfig")}
            title={collapsed ? "Settings" : undefined}
            className={cn("flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50", collapsed ? "justify-center" : "")}
          >
            <Settings className="w-4 h-4 flex-shrink-0" />
            {!collapsed && "Settings"}
          </Link>
        </div>
      </aside>

      {/* Page Content */}
      <main className={cn("flex-1 min-h-screen transition-all duration-200", collapsed ? "ml-14" : "ml-56")}>
        {children}
      </main>
    </div>
  );
}