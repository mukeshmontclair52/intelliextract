import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Settings2, Cpu, Brain, Thermometer } from "lucide-react";

export default function ConfigBar({ config, onConfigChange }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
      <div className="px-4 py-2.5 flex items-center gap-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Settings2 className="w-4 h-4 text-indigo-500" />
          Configuration
        </div>

        <div className="flex items-center gap-2">
          <Label className="text-xs text-slate-500 flex items-center gap-1">
            <Cpu className="w-3 h-3" />
            Engine
          </Label>
          <Select 
            value={config.engine} 
            onValueChange={(v) => onConfigChange({ ...config, engine: v })}
          >
            <SelectTrigger className="h-7 w-[140px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gen-ai">Gen AI - LLM</SelectItem>
              <SelectItem value="template">Template</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Label className="text-xs text-slate-500 flex items-center gap-1">
            <Brain className="w-3 h-3" />
            Model
          </Label>
          <Select 
            value={config.model} 
            onValueChange={(v) => onConfigChange({ ...config, model: v })}
          >
            <SelectTrigger className="h-7 w-[110px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4">GPT-4 Turbo</SelectItem>
              <SelectItem value="gpt-4o">GPT-4o</SelectItem>
              <SelectItem value="gpt-3.5">GPT-3.5</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Label className="text-xs text-slate-500 flex items-center gap-1">
            <Thermometer className="w-3 h-3" />
            Temperature
          </Label>
          <div className="flex items-center gap-2">
            <Slider
              value={[config.temperature]}
              onValueChange={([v]) => onConfigChange({ ...config, temperature: v })}
              min={0}
              max={1}
              step={0.1}
              className="w-24"
            />
            <span className="text-xs font-mono text-slate-600 w-8">{config.temperature}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Label className="text-xs text-slate-500">AI Evaluation</Label>
          <Switch
            checked={config.enableEvaluation}
            onCheckedChange={(v) => onConfigChange({ ...config, enableEvaluation: v })}
          />
        </div>
      </div>
    </div>
  );
}