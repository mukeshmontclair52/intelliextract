import React, { useState } from "react";
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
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.15 }}
      className={cn("relative", depth > 0 && "ml-6")}
    >
      {depth > 0 && (
        <div className="absolute left-[-16px] top-0 bottom-0 w-px bg-slate-200" />
      )}
      {depth > 0 && (
        <div className="absolute left-[-16px] top-4 w-4 h-px bg-slate-200" />
      )}
      
      <div className={cn(
        "bg-white hover:bg-slate-50 transition-all duration-150 rounded-lg border border-slate-200",
        depth === 0 && "border-l-2 border-l-indigo-500"
      )}>
        <div className="p-2.5">
          <div className="flex items-start gap-2">
            <div className="flex items-center gap-1 pt-1.5">
              <button className="cursor-grab text-slate-300 hover:text-slate-400 transition-colors">
                <GripVertical className="w-3.5 h-3.5" />
              </button>
              {hasChildren && (
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Input
                    value={field.name}
                    onChange={(e) => onUpdate({ ...field, name: e.target.value })}
                    placeholder="Field name"
                    className="h-8 text-sm bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                  />
                </div>
                <FieldTypeToggle 
                  value={field.type} 
                  onChange={(type) => onUpdate({ ...field, type })}
                />
              </div>
              
              <Textarea
                value={field.description}
                onChange={(e) => onUpdate({ ...field, description: e.target.value })}
                placeholder="Description..."
                className="bg-slate-50 border-slate-200 focus:bg-white transition-colors min-h-[50px] resize-none text-sm"
                rows={2}
              />
            </div>
            
            <div className="flex items-center gap-0.5 pt-1.5">
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onAddChild(field.id)}
                  className="h-7 w-7 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {hasChildren && isExpanded && field.children && field.children.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 space-y-2"
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