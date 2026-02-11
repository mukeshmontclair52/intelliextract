import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { GripVertical, Trash2, Plus, ChevronDown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FieldTypeToggle from "./FieldTypeToggle";
import { cn } from "@/lib/utils";

export default function FieldCard({ 
  field, 
  onUpdate, 
  onDelete, 
  onAddChild,
  depth = 0,
  index 
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = field.type === "nested" || field.type === "tabular";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={cn("relative", depth > 0 && "ml-8")}
    >
      {depth > 0 && (
        <div className="absolute left-[-20px] top-0 bottom-0 w-px bg-slate-200" />
      )}
      {depth > 0 && (
        <div className="absolute left-[-20px] top-6 w-5 h-px bg-slate-200" />
      )}
      
      <Card className={cn(
        "bg-white border border-slate-200 hover:border-slate-300 transition-all duration-200",
        depth === 0 ? "shadow-sm hover:shadow-md" : "shadow-none"
      )}>
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex items-center gap-2 pt-2">
              <button className="cursor-grab text-slate-300 hover:text-slate-400 transition-colors">
                <GripVertical className="w-4 h-4" />
              </button>
              {hasChildren && (
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
            
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-xs font-medium text-slate-500 mb-1 block">
                    Field Name
                  </label>
                  <Input
                    value={field.name}
                    onChange={(e) => onUpdate({ ...field, name: e.target.value })}
                    placeholder="Enter field name"
                    className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                  />
                </div>
                <div className="pt-5">
                  <FieldTypeToggle 
                    value={field.type} 
                    onChange={(type) => onUpdate({ ...field, type })}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">
                  Description
                </label>
                <Textarea
                  value={field.description}
                  onChange={(e) => onUpdate({ ...field, description: e.target.value })}
                  placeholder="Describe what this field should extract..."
                  className="bg-slate-50 border-slate-200 focus:bg-white transition-colors min-h-[60px] resize-none"
                  rows={2}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-1 pt-2">
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onAddChild(field.id)}
                  className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="text-slate-400 hover:text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
      
      <AnimatePresence>
        {hasChildren && isExpanded && field.children && field.children.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 space-y-3"
          >
            {field.children.map((child, idx) => (
              <FieldCard
                key={child.id}
                field={child}
                onUpdate={(updated) => {
                  const newChildren = [...field.children];
                  newChildren[idx] = updated;
                  onUpdate({ ...field, children: newChildren });
                }}
                onDelete={() => {
                  const newChildren = field.children.filter((_, i) => i !== idx);
                  onUpdate({ ...field, children: newChildren });
                }}
                onAddChild={onAddChild}
                depth={depth + 1}
                index={idx}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}