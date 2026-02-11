import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  History, 
  Code2, 
  LayoutList,
  Save,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ConfigSidebar from "@/components/extraction/ConfigSidebar";
import TaskDescription from "@/components/extraction/TaskDescription";
import FieldCard from "@/components/extraction/FieldCard";

const initialFields = [
  {
    id: "1",
    name: "Funds",
    description: "Funds",
    type: "tabular",
    children: [
      {
        id: "1-1",
        name: "Fund Name",
        description: "Extract Name of the fund",
        type: "text",
        children: []
      },
      {
        id: "1-2",
        name: "Quarter of the Fund",
        description: "Enter the quarter in which the fund activity or reporting occurred. The financial year is divided into four quarters.",
        type: "text",
        children: []
      }
    ]
  }
];

const initialConfig = {
  engine: "gen-ai",
  documentType: "alts-schedule",
  model: "gpt-4",
  temperature: 0,
  mode: "text",
  rawTextModel: "textract",
  enableEvaluation: true,
  evaluationModel: "default"
};

const initialDescription = `You are an expert in extracting data from the "Schedule of Investments" section in quarterly reports. Your task is to parse the provided document and extract the complete Alts Performance report strictly following the JSON schema. The data structure includes several key fields. At the fund level, there are fields such as Fund Name, Quarter of the Fund, Investment Objective, Fund Manager Commentary, and Currency. Each fund contains an array of Investment Summary of Fund and Security objects, which detail attributes like Company Name, Geography, Markup, Markdown, Sector, Exit Date, Exit Type, Ownership %, Total Value, Realized Date, Realized Value, Invested Capital, Unrealized Value, Committed...`;

export default function ExtractionConfigPage() {
  const [fields, setFields] = useState(initialFields);
  const [config, setConfig] = useState(initialConfig);
  const [description, setDescription] = useState(initialDescription);
  const [viewMode, setViewMode] = useState("fields");
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const totalFields = fields.reduce((acc, field) => {
    let count = 1;
    if (field.children) {
      count += field.children.length;
    }
    return acc + count;
  }, 0);

  const addField = () => {
    const newField = {
      id: Date.now().toString(),
      name: "",
      description: "",
      type: "text",
      children: []
    };
    setFields([...fields, newField]);
  };

  const addChildToField = (parentId) => {
    const addChild = (fieldsList) => {
      return fieldsList.map(field => {
        if (field.id === parentId) {
          return {
            ...field,
            children: [
              ...(field.children || []),
              {
                id: `${parentId}-${Date.now()}`,
                name: "",
                description: "",
                type: "text",
                children: []
              }
            ]
          };
        }
        if (field.children) {
          return { ...field, children: addChild(field.children) };
        }
        return field;
      });
    };
    setFields(addChild(fields));
  };

  const updateField = (index, updatedField) => {
    const newFields = [...fields];
    newFields[index] = updatedField;
    setFields(newFields);
  };

  const deleteField = (index) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 text-sm text-slate-500 mb-1">
                <span className="hover:text-indigo-600 cursor-pointer transition-colors">Routing</span>
                <span>/</span>
                <span className="hover:text-indigo-600 cursor-pointer transition-colors">Extraction</span>
                <span>/</span>
                <span className="text-indigo-600 font-medium">Extraction Configuration</span>
              </div>
              <h1 className="text-xl font-semibold text-slate-800">
                Configuration
                <span className="text-slate-400 font-normal ml-2">
                  (Alts Schedule on Investment - Quarterly Report)
                </span>
              </h1>
            </div>
            <Button
              variant="outline"
              className="text-slate-600 border-slate-200 hover:bg-slate-50"
            >
              <History className="w-4 h-4 mr-2" />
              View Audit History
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex p-4 gap-4">
        <ConfigSidebar 
          config={config} 
          onConfigChange={setConfig}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Fields Configuration */}
        <div className="flex-1 space-y-3">
          <TaskDescription 
            description={description} 
            onDescriptionChange={setDescription} 
          />

          {/* Fields Header */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="p-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="text-sm font-semibold text-slate-700">
                    Fields Configuration
                  </h2>
                  <Tabs value={viewMode} onValueChange={setViewMode}>
                    <TabsList className="bg-slate-100 h-8">
                      <TabsTrigger value="fields" className="text-xs h-6 px-3">
                        <LayoutList className="w-3.5 h-3.5 mr-1.5" />
                        Extraction Fields
                      </TabsTrigger>
                      <TabsTrigger value="json" className="text-xs h-6 px-3">
                        <Code2 className="w-3.5 h-3.5 mr-1.5" />
                        JSON View
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span>Total Fields:</span>
                    <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 font-semibold">
                      {totalFields}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-slate-600"
                      onClick={() => setCurrentFieldIndex(Math.max(0, currentFieldIndex - 1))}
                      disabled={currentFieldIndex === 0}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-slate-600"
                      onClick={() => setCurrentFieldIndex(Math.min(fields.length - 1, currentFieldIndex + 1))}
                      disabled={currentFieldIndex >= fields.length - 1}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    onClick={addField}
                    className="bg-indigo-600 hover:bg-indigo-700 h-8 px-3 text-sm"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Add Field
                  </Button>
                </div>
              </div>
            </div>

            {/* Fields List */}
            <div className="p-3">
              <AnimatePresence mode="popLayout">
                {viewMode === "fields" ? (
                  <motion.div
                    key="fields"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-2.5"
                  >
                    {fields.map((field, index) => (
                      <FieldCard
                        key={field.id}
                        field={field}
                        onUpdate={(updated) => updateField(index, updated)}
                        onDelete={() => deleteField(index)}
                        onAddChild={addChildToField}
                        index={index}
                      />
                    ))}
                    {fields.length === 0 && (
                      <div className="text-center py-12 text-slate-400">
                        <LayoutList className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No fields configured yet</p>
                        <p className="text-xs mt-1">Click "Add Field" to get started</p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="json"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-auto text-sm font-mono max-h-[500px]">
                      {JSON.stringify(fields, null, 2)}
                    </pre>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="sticky bottom-0 bg-white border-t border-slate-200 px-4 py-3">
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" className="text-slate-600">
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Save className="w-4 h-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
}