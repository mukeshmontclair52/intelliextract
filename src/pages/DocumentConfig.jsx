import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ArrowLeft, FileText, Zap, EyeOff, ChevronRight, Search, Plus, Code2, LayoutList, Save, X, Sparkles, FileUp, Play, Scissors, Scan } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import ConfigBar from "@/components/extraction/ConfigBar";
import TaskDescription from "@/components/extraction/TaskDescription";
import FieldCard from "@/components/extraction/FieldCard";
import AddDocumentWizard from "@/components/documentconfig/AddDocumentWizard";

const DOCUMENTS = [
  {
    id: 1,
    name: "Blackstone Q1 2026",
    fileName: "Blackstone_Q1_2026.pdf",
    type: "alts-schedule",
    typeLabel: "Alts Schedule",
    configs: {
      extraction: {
        enabled: true,
        engine: "Gen AI - LLM",
        model: "GPT-4 Turbo",
        mode: "Accurate",
        temperature: 0.2,
        fields: ["Fund Name", "Investment Date", "Capital Called", "Distributions", "NAV"],
      },
      split: { enabled: false },
      parse: { enabled: false },
      redaction: { enabled: false },
    },
  },
  {
    id: 2,
    name: "Apollo Fund Report",
    fileName: "Apollo_Fund_Report.pdf",
    type: "quarterly-report",
    typeLabel: "Quarterly Report",
    configs: {
      extraction: {
        enabled: true,
        engine: "Template Based",
        model: "-",
        mode: "Fast",
        temperature: 0,
        fields: ["Total Assets", "Net Income", "Return %", "Benchmark"],
      },
      split: {
        enabled: true,
        model: "GPT-4o",
        categories: ["Equity Report", "Fixed Income", "Alternative Investment", "Mixed Asset"],
      },
      parse: {
        enabled: true,
        engine: "Gen AI - LLM",
        outputFormat: "Markdown",
      },
      redaction: { enabled: false },
    },
  },
  {
    id: 3,
    name: "KKR Quarterly Dec",
    fileName: "KKR_Quarterly_Dec.pdf",
    type: "quarterly-report",
    typeLabel: "Quarterly Report",
    configs: {
      extraction: { enabled: false },
      split: {
        enabled: true,
        model: "GPT-4o",
        categories: ["Private Equity", "Real Assets", "Credit"],
      },
      parse: { enabled: false },
      redaction: {
        enabled: true,
        patterns: ["SSN", "Account Numbers", "Personal Names"],
        method: "Black Box",
      },
    },
  },
  {
    id: 4,
    name: "Carlyle Alts Q4",
    fileName: "Carlyle_Alts_Q4.pdf",
    type: "alts-schedule",
    typeLabel: "Alts Schedule",
    configs: {
      extraction: {
        enabled: true,
        engine: "Gen AI - LLM",
        model: "GPT-4 Turbo",
        mode: "Accurate",
        temperature: 0.1,
        fields: ["Commitment", "Unfunded", "Fair Value", "Multiple"],
      },
      split: { enabled: false },
      parse: {
        enabled: true,
        engine: "Template Based",
        outputFormat: "Markdown",
      },
      redaction: {
        enabled: true,
        patterns: ["Account Numbers", "Tax IDs"],
        method: "Mask",
      },
    },
  },
];

const CONFIG_TABS = [
  { key: "extraction", label: "Extraction", icon: Zap, color: "text-indigo-600", bg: "bg-indigo-50" },
  { key: "parse", label: "Parse", icon: Scan, color: "text-emerald-600", bg: "bg-emerald-50" },
  { key: "split", label: "Split", icon: Scissors, color: "text-purple-600", bg: "bg-purple-50" },
  { key: "redaction", label: "Redaction", icon: EyeOff, color: "text-rose-600", bg: "bg-rose-50" },
];

const initialFields = [
  {
    id: "1", name: "Funds", description: "Funds", type: "tabular",
    children: [
      { id: "1-1", name: "Fund Name", description: "Extract Name of the fund", type: "text", children: [] },
      { id: "1-2", name: "Quarter of the Fund", description: "Enter the quarter in which the fund activity occurred.", type: "text", children: [] },
    ],
  },
];

const initialConfig = {
  engine: "gen-ai", documentType: "alts-schedule", model: "gpt-4",
  temperature: 0, mode: "text", rawTextModel: "textract", enableEvaluation: true, evaluationModel: "default",
};

const initialDescription = `You are an expert in extracting data from the "Schedule of Investments" section in quarterly reports. Your task is to parse the provided document and extract the complete Alts Performance report strictly following the JSON schema.`;

function DisabledState({ label }) {
  return (
    <div className="text-center py-10 text-slate-400">
      <p className="text-sm">{label} is not configured for this document.</p>
    </div>
  );
}

function ExtractionDetail({ config }) {
  const [fields, setFields] = useState(initialFields);
  const [extractConfig, setExtractConfig] = useState(initialConfig);
  const [description, setDescription] = useState(initialDescription);
  const [viewMode, setViewMode] = useState("fields");
  const [testDocument, setTestDocument] = useState(null);
  const [isGeneratingSchema, setIsGeneratingSchema] = useState(false);
  const [isTestingSchema, setIsTestingSchema] = useState(false);

  if (!config.enabled) return <DisabledState label="Extraction" />;

  // eslint-disable-next-line react-hooks/rules-of-hooks -- safe: hooks are all declared above, return is just early render

  const totalFields = fields.reduce((acc, f) => acc + 1 + (f.children?.length || 0), 0);
  const addField = () => setFields([...fields, { id: Date.now().toString(), name: "", description: "", type: "text", children: [] }]);
  const addChildToField = (parentId) => {
    const addChild = (list) => list.map((f) => {
      if (f.id === parentId) return { ...f, children: [...(f.children || []), { id: `${parentId}-${Date.now()}`, name: "", description: "", type: "text", children: [] }] };
      if (f.children) return { ...f, children: addChild(f.children) };
      return f;
    });
    setFields(addChild(fields));
  };
  const updateField = (index, updated) => { const n = [...fields]; n[index] = updated; setFields(n); };
  const deleteField = (index) => setFields(fields.filter((_, i) => i !== index));
  const handleGenerateSchema = () => { setIsGeneratingSchema(true); setTimeout(() => setIsGeneratingSchema(false), 2000); };
  const handleTestSchema = () => { setIsTestingSchema(true); setTimeout(() => setIsTestingSchema(false), 2000); };

  return (
    <div className="space-y-3">
      <ConfigBar config={extractConfig} onConfigChange={setExtractConfig} />
      <TaskDescription description={description} onDescriptionChange={setDescription} />
      <div className="flex gap-4">
        <div className="w-[400px] flex-shrink-0">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm sticky top-20">
            <div className="p-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" />Document Preview
              </h3>
            </div>
            <div className="p-3">
              <div className="aspect-[8.5/11] bg-slate-50 rounded border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                <FileUp className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No document uploaded</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => document.getElementById("doc-upload").click()}>
                  <FileUp className="w-3.5 h-3.5 mr-1.5" />Upload Document
                </Button>
                <input id="doc-upload" type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => e.target.files?.[0] && setTestDocument(e.target.files[0])} />
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-3">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="p-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="text-sm font-semibold text-slate-700">Fields Configuration</h2>
                  <Tabs value={viewMode} onValueChange={setViewMode}>
                    <TabsList className="bg-slate-100 h-8">
                      <TabsTrigger value="fields" className="text-xs h-6 px-3"><LayoutList className="w-3.5 h-3.5 mr-1.5" />Extraction Fields</TabsTrigger>
                      <TabsTrigger value="json" className="text-xs h-6 px-3"><Code2 className="w-3.5 h-3.5 mr-1.5" />JSON View</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 font-semibold">{totalFields}</Badge>
                  <Button onClick={addField} variant="outline" className="h-8 px-3 text-sm"><Plus className="w-4 h-4 mr-1.5" />Add Field</Button>
                  <Button onClick={handleGenerateSchema} disabled={isGeneratingSchema} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 h-8 px-3 text-sm">
                    <Sparkles className="w-4 h-4 mr-1.5" />{isGeneratingSchema ? "Generating..." : "Generate Schema by AI"}
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-3">
              <AnimatePresence mode="popLayout">
                {viewMode === "fields" ? (
                  <motion.div key="fields" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2.5">
                    {fields.map((field, index) => (
                      <FieldCard key={field.id} field={field} onUpdate={(u) => updateField(index, u)} onDelete={() => deleteField(index)} onAddChild={addChildToField} index={index} />
                    ))}
                    {fields.length === 0 && <div className="text-center py-12 text-slate-400 text-sm">No fields yet.</div>}
                  </motion.div>
                ) : (
                  <motion.div key="json" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-auto text-sm font-mono max-h-[400px]">{JSON.stringify(fields, null, 2)}</pre>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          {fields.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="p-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-700">Test Extraction</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Test your schema with the uploaded document</p>
                </div>
                <Button onClick={handleTestSchema} disabled={isTestingSchema || !testDocument} className="bg-green-600 hover:bg-green-700 h-8 px-3 text-sm">
                  <Play className="w-3.5 h-3.5 mr-1.5" />{isTestingSchema ? "Testing..." : "Test & View Result"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" className="text-slate-600"><X className="w-4 h-4 mr-2" />Cancel</Button>
        <Button className="bg-indigo-600 hover:bg-indigo-700"><Save className="w-4 h-4 mr-2" />Save Configuration</Button>
      </div>
    </div>
  );
}

function ParseDetail({ config }) {
  if (!config.enabled) return <DisabledState label="Parse" />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Engine", value: config.engine },
          { label: "Output Format", value: config.outputFormat },
        ].map(({ label, value }) => (
          <div key={label} className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-400 mb-0.5">{label}</p>
            <p className="text-sm font-semibold text-slate-700">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SplitDetail({ config }) {
  if (!config.enabled) return <DisabledState label="Split" />;
  return (
    <div className="space-y-4">
      <div className="bg-slate-50 rounded-lg p-3 inline-block">
        <p className="text-xs text-slate-400 mb-0.5">Model</p>
        <p className="text-sm font-semibold text-slate-700">{config.model}</p>
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Split Categories ({config.categories.length})</p>
        <div className="flex flex-wrap gap-2">
          {config.categories.map((c) => (
            <span key={c} className="text-xs bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-1 rounded-full font-medium">{c}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function RedactionDetail({ config }) {
  if (!config.enabled) return <DisabledState label="Redaction" />;
  return (
    <div className="space-y-4">
      <div className="bg-slate-50 rounded-lg p-3 inline-block">
        <p className="text-xs text-slate-400 mb-0.5">Method</p>
        <p className="text-sm font-semibold text-slate-700">{config.method}</p>
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Redaction Patterns ({config.patterns.length})</p>
        <div className="flex flex-wrap gap-2">
          {config.patterns.map((p) => (
            <span key={p} className="text-xs bg-rose-50 text-rose-700 border border-rose-100 px-2.5 py-1 rounded-full font-medium">{p}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function DocumentDetail({ doc, onBack }) {
  const [activeTab, setActiveTab] = useState("extraction");
  const activeConfigs = CONFIG_TABS.filter((t) => doc.configs[t.key]?.enabled);

  return (
    <div className="p-8 max-w-3xl">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />Back to documents
      </button>
      <div className="flex items-start gap-4 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">{doc.name}</h1>
          <p className="text-sm text-slate-400 font-mono mt-0.5">{doc.fileName}</p>
          <div className="flex gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">{doc.typeLabel}</Badge>
            {activeConfigs.map((t) => {
              const Icon = t.icon;
              return (
                <span key={t.key} className={cn("inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full", t.color, t.bg)}>
                  <Icon className="w-3 h-3" />{t.label}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex gap-1 mb-5 bg-slate-100 p-1 rounded-lg w-fit">
        {CONFIG_TABS.map((tab) => {
          const Icon = tab.icon;
          const enabled = doc.configs[tab.key]?.enabled;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                activeTab === tab.key ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Icon className={cn("w-3.5 h-3.5", activeTab === tab.key && enabled ? tab.color : "")} />
              {tab.label}
              {enabled && <span className="w-1.5 h-1.5 rounded-full bg-green-400 ml-0.5" />}
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
            {activeTab === "extraction" && <ExtractionDetail config={doc.configs.extraction} />}
            {activeTab === "parse" && <ParseDetail config={doc.configs.parse} />}
            {activeTab === "split" && <SplitDetail config={doc.configs.split} />}
            {activeTab === "redaction" && <RedactionDetail config={doc.configs.redaction} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function DocumentConfig() {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = DOCUMENTS.filter((d) =>
    !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.fileName.toLowerCase().includes(search.toLowerCase())
  );

  if (selectedDoc) {
    return <DocumentDetail doc={selectedDoc} onBack={() => setSelectedDoc(null)} />;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Document Config</h1>
          <p className="text-sm text-slate-500 mt-0.5">{DOCUMENTS.length} documents configured</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />Add Document
        </Button>
      </div>

      <div className="relative max-w-sm mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input className="pl-9 h-9 text-sm" placeholder="Search documents…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="space-y-3 max-w-4xl">
        {filtered.map((doc) => {
          const activeConfigs = CONFIG_TABS.filter((t) => doc.configs[t.key]?.enabled);
          return (
            <div key={doc.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{doc.name}</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{doc.fileName}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">{doc.typeLabel}</Badge>
                    {activeConfigs.map((t) => {
                      const Icon = t.icon;
                      return (
                        <span key={t.key} className={cn("inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full", t.color, t.bg)}>
                          <Icon className="w-3 h-3" />{t.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedDoc(doc)} className="flex-shrink-0 text-slate-600">
                View Detail<ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="text-center py-16 text-slate-400 text-sm">No documents match your search.</div>}
      </div>
    </div>
  );
}