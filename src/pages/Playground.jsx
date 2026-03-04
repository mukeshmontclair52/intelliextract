import React, { useState } from "react";
import { ExternalLink, Scissors, FileSearch2, Scan, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TOOLS = [
  {
    key: "parse",
    icon: <Scan className="w-6 h-6 text-emerald-600" />,
    iconBg: "bg-emerald-50",
    label: "Parse",
    preview: false,
    description: "Turn documents into structured, machine-readable Markdown.",
  },
  {
    key: "split",
    icon: <Scissors className="w-6 h-6 text-rose-500" />,
    iconBg: "bg-rose-50",
    label: "Split",
    preview: true,
    description: "Split the parsed output for multi-document files into individual records.",
  },
  {
    key: "extract",
    icon: <FileSearch2 className="w-6 h-6 text-amber-500" />,
    iconBg: "bg-amber-50",
    label: "Extract",
    preview: false,
    description: "Extract key fields like names, dates, and totals from parsed output.",
  },
];

function ToolCard({ tool }) {
  const [file, setFile] = useState(null);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tool.iconBg}`}>
          {tool.icon}
        </div>
        <button className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-600 transition-colors">
          <ExternalLink className="w-3.5 h-3.5" /> Docs
        </button>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold text-slate-800 text-base">{tool.label}</span>
          {tool.preview && (
            <Badge className="bg-teal-500 text-white text-xs px-2 py-0.5 rounded-full border-0">Preview</Badge>
          )}
        </div>
        <p className="text-sm text-slate-500 leading-relaxed">{tool.description}</p>
      </div>

      <div>
        <input
          id={`upload-${tool.key}`}
          type="file"
          className="hidden"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
        />
        <Button
          variant="outline"
          className="w-full text-sm"
          onClick={() => document.getElementById(`upload-${tool.key}`).click()}
        >
          <Upload className="w-4 h-4 mr-2" />
          {file ? file.name : "Upload File"}
        </Button>
      </div>
    </div>
  );
}

export default function Playground() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="inline-block bg-teal-50 text-teal-700 text-sm font-medium px-4 py-2 rounded-full border border-teal-100 mb-6">
          How would you like to process your files?
        </div>
        <div className="grid grid-cols-3 gap-5 max-w-4xl">
          {TOOLS.map((tool) => (
            <ToolCard key={tool.key} tool={tool} />
          ))}
        </div>
      </div>
    </div>
  );
}