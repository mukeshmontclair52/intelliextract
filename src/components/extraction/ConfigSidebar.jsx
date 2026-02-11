import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings2, Cpu, Thermometer, FileText, Sparkles, Brain } from "lucide-react";

export default function ConfigSidebar({ config, onConfigChange }) {
  return (
    <div className="w-80 flex-shrink-0 space-y-4">
      <Card className="bg-white shadow-sm border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-indigo-500" />
            Extraction Engine
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              Engine Type
            </Label>
            <Select 
              value={config.engine} 
              onValueChange={(v) => onConfigChange({ ...config, engine: v })}
            >
              <SelectTrigger className="bg-slate-50 border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gen-ai">Gen AI Extraction - LLM</SelectItem>
                <SelectItem value="template">Template Based</SelectItem>
                <SelectItem value="hybrid">Hybrid Approach</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Document Type
            </Label>
            <Select 
              value={config.documentType} 
              onValueChange={(v) => onConfigChange({ ...config, documentType: v })}
            >
              <SelectTrigger className="bg-slate-50 border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alts-schedule">Alts Schedule on Investment</SelectItem>
                <SelectItem value="quarterly-report">Quarterly Report</SelectItem>
                <SelectItem value="annual-statement">Annual Statement</SelectItem>
                <SelectItem value="fund-summary">Fund Summary</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Brain className="w-4 h-4 text-indigo-500" />
            Model Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-500">GPT Model</Label>
            <Select 
              value={config.model} 
              onValueChange={(v) => onConfigChange({ ...config, model: v })}
            >
              <SelectTrigger className="bg-slate-50 border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4">GPT-4 Turbo</SelectItem>
                <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                <SelectItem value="gpt-3.5">GPT-3.5 Turbo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5" />
                Temperature
              </Label>
              <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                {config.temperature}
              </span>
            </div>
            <Slider
              value={[config.temperature]}
              onValueChange={([v]) => onConfigChange({ ...config, temperature: v })}
              min={0}
              max={1}
              step={0.1}
              className="w-full"
            />
            <p className="text-xs text-slate-400">
              Lower values produce more focused outputs
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-500">Mode</Label>
            <Select 
              value={config.mode} 
              onValueChange={(v) => onConfigChange({ ...config, mode: v })}
            >
              <SelectTrigger className="bg-slate-50 border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="vision">Vision</SelectItem>
                <SelectItem value="multimodal">Multimodal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-500">Raw Text Model</Label>
            <Select 
              value={config.rawTextModel} 
              onValueChange={(v) => onConfigChange({ ...config, rawTextModel: v })}
            >
              <SelectTrigger className="bg-slate-50 border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="textract">Amazon Textract</SelectItem>
                <SelectItem value="azure-ocr">Azure OCR</SelectItem>
                <SelectItem value="google-vision">Google Vision</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            AI Evaluation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-xs font-medium text-slate-700">
                Enable Evaluation
              </Label>
              <p className="text-xs text-slate-400">
                May increase processing time
              </p>
            </div>
            <Switch
              checked={config.enableEvaluation}
              onCheckedChange={(v) => onConfigChange({ ...config, enableEvaluation: v })}
            />
          </div>

          {config.enableEvaluation && (
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-500">
                Evaluation Model
              </Label>
              <Select 
                value={config.evaluationModel} 
                onValueChange={(v) => onConfigChange({ ...config, evaluationModel: v })}
              >
                <SelectTrigger className="bg-slate-50 border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default (if evaluation selected)</SelectItem>
                  <SelectItem value="strict">Strict Validation</SelectItem>
                  <SelectItem value="lenient">Lenient</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}