import React, { useState, useEffect } from "react";
import { documentConfigsService } from "@/components/services/dataService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ArrowLeft, FileText, Zap, EyeOff, ChevronRight, Search, Plus, Code2, LayoutList, Save, X, Sparkles, FileUp, Play, Scissors, Scan, Edit, Copy } from "lucide-react";
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
      extraction: { enabled: false },
      split: {
        enabled: true,
        model: "GPT-4o",
        categories: ["Equity Report", "Fixed Income", "Alternative Investment", "Mixed Asset"],
      },
      parse: { enabled: false },
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
      split: { enabled: false },
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
      extraction: { enabled: false },
      split: { enabled: false },
      parse: {
        enabled: true,
        engine: "Template Based",
        outputFormat: "Markdown",
      },
      redaction: { enabled: false },
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
  engine: "gen-ai", model: "gpt-4",
  temperature: 0, mode: "text", enableEvaluation: true,
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
      <div className="space-y-3">
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

const SPLIT_ENGINES = ["Gen AI - LLM", "Rule Based", "Template Based"];
const SPLIT_MODELS = ["GPT-4o", "GPT-4 Turbo", "Claude 3.5 Sonnet", "Gemini 1.5 Pro"];
const SPLIT_MODES = ["Accurate", "Fast", "Balanced"];

function SplitDetail({ config }) {
  const [splitConfig, setSplitConfig] = useState({
    engine: config.engine || "Gen AI - LLM",
    model: config.model || "GPT-4o",
    mode: config.mode || "Accurate",
  });
  const [rules, setRules] = useState(
    (config.categories || []).map((c, i) => ({ id: String(i), title: c, description: "" }))
  );
  const [activeTab, setActiveTab] = useState("rules");

  if (!config.enabled) return <DisabledState label="Split" />;

  const addRule = () => setRules([...rules, { id: Date.now().toString(), title: "", description: "" }]);
  const removeRule = (id) => setRules(rules.filter((r) => r.id !== id));
  const updateRule = (id, field, value) => setRules(rules.map((r) => r.id === id ? { ...r, [field]: value } : r));

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b border-slate-100 pb-0">
        {["configuration", "rules"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors",
              activeTab === tab
                ? "border-purple-600 text-purple-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "configuration" && (
        <div className="grid grid-cols-3 gap-4 pt-2">
          {[
            { label: "Engine", key: "engine", options: SPLIT_ENGINES },
            { label: "Model", key: "model", options: SPLIT_MODELS },
            { label: "Mode", key: "mode", options: SPLIT_MODES },
          ].map(({ label, key, options }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500">{label}</label>
              <select
                value={splitConfig[key]}
                onChange={(e) => setSplitConfig({ ...splitConfig, [key]: e.target.value })}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {options.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}

      {activeTab === "rules" && (
        <div className="space-y-3 pt-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Rules</p>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            {rules.map((rule, idx) => (
              <div key={rule.id} className={cn("p-3 space-y-2", idx < rules.length - 1 && "border-b border-slate-100")}>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={rule.title}
                    onChange={(e) => updateRule(rule.id, "title", e.target.value)}
                    placeholder="Rule title..."
                    className="flex-1 h-8 rounded-md border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <button onClick={() => removeRule(rule.id)} className="text-slate-300 hover:text-rose-500 transition-colors flex-shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  value={rule.description}
                  onChange={(e) => updateRule(rule.id, "description", e.target.value)}
                  placeholder="Description (optional)"
                  className="w-full h-8 rounded-md border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            ))}
            <button
              onClick={addRule}
              className="w-full py-2.5 text-sm text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />Add Rule
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" className="text-slate-600"><X className="w-4 h-4 mr-2" />Cancel</Button>
        <Button className="bg-purple-600 hover:bg-purple-700"><Save className="w-4 h-4 mr-2" />Save Configuration</Button>
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

function DocumentDetail({ doc, onBack, onEdit }) {
  const activeConfigs = CONFIG_TABS.filter((t) => doc.configs[t.key]?.enabled);
  const activeTab = activeConfigs[0]?.key || "extraction";

  return (
    <div className="p-8">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />Back to documents
      </button>
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
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
        <Button variant="outline" onClick={() => onEdit(doc)} className="text-slate-600 flex-shrink-0">
          <Edit className="w-4 h-4 mr-2" />Edit
        </Button>
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
  const [addingDoc, setAddingDoc] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    documentConfigsService.getAll().then((data) => { setDocuments(data); setLoading(false); });
  }, []);

  const filtered = documents.filter((d) =>
    !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.fileName.toLowerCase().includes(search.toLowerCase())
  );

  if (addingDoc) {
    return (
      <AddDocumentWizard
        onCancel={() => setAddingDoc(false)}
        onSave={async (newDoc) => {
          const created = await documentConfigsService.create(newDoc);
          setDocuments((prev) => [...prev, created]);
          setAddingDoc(false);
        }}
      />
    );
  }

  if (editingDoc) {
    return (
      <AddDocumentWizard
        initialData={editingDoc}
        onCancel={() => setEditingDoc(null)}
        onSave={async (updatedDoc) => {
          if (!editingDoc.id) {
            const created = await documentConfigsService.create(updatedDoc);
            setDocuments((prev) => [...prev, created]);
          } else {
            await documentConfigsService.update(editingDoc.id, updatedDoc);
            setDocuments((prev) => prev.map((d) => d.id === editingDoc.id ? { ...d, ...updatedDoc } : d));
          }
          setEditingDoc(null);
        }}
      />
    );
  }

  if (selectedDoc) {
    return <DocumentDetail doc={selectedDoc} onBack={() => setSelectedDoc(null)} onEdit={setEditingDoc} />;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Document Config</h1>
          <p className="text-sm text-slate-500 mt-0.5">{documents.length} documents configured</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setAddingDoc(true)}>
          <Plus className="w-4 h-4 mr-2" />Add Document
        </Button>
      </div>

      <div className="relative max-w-sm mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input className="pl-9 h-9 text-sm" placeholder="Search documents…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs text-slate-400 font-medium bg-slate-50">
              <th className="text-left px-5 py-3">Document</th>
              <th className="text-left px-5 py-3">File</th>
              <th className="text-left px-5 py-3">Type</th>
              <th className="text-left px-5 py-3">Capabilities</th>
              <th className="text-left px-5 py-3">Engine</th>
              <th className="text-left px-5 py-3">LLM Model</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((doc) => {
              const activeConfigs = CONFIG_TABS.filter((t) => doc.configs[t.key]?.enabled);
              const engine = doc.configs.extraction?.engine || doc.configs.parse?.engine || "—";
              const model = doc.configs.extraction?.model || doc.configs.split?.model || "—";
              return (
                <tr key={doc.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setSelectedDoc(doc)}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                      <span className="font-medium text-slate-800">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-400">{doc.fileName}</td>
                  <td className="px-5 py-3">
                    <Badge variant="secondary" className="text-xs">{doc.typeLabel}</Badge>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {activeConfigs.length > 0 ? activeConfigs.map((t) => {
                        const Icon = t.icon;
                        return (
                          <span key={t.key} className={cn("inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full", t.color, t.bg)}>
                            <Icon className="w-3 h-3" />{t.label}
                          </span>
                        );
                      }) : <span className="text-xs text-slate-400">—</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-600">{engine}</td>
                  <td className="px-5 py-3 text-xs text-slate-600">{model}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost" size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingDoc({ ...doc, id: null, name: `${doc.name} (Copy)`, fileName: `copy_${doc.fileName}` });
                        }}
                        className="text-slate-400 hover:text-indigo-600 h-8 px-2"
                        title="Clone document"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedDoc(doc); }} className="text-slate-500 hover:text-indigo-600 h-8 px-2">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="text-center py-16 text-slate-400 text-sm">No documents match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}