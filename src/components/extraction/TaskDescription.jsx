import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronUp, FileText, Pencil, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TaskDescription({ description, onDescriptionChange }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(description);

  const handleSave = () => {
    onDescriptionChange(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(description);
    setIsEditing(false);
  };

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-white border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-500" />
            Task Description
          </CardTitle>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="text-slate-500 hover:text-indigo-600 h-7 px-2"
              >
                <Pencil className="w-3.5 h-3.5 mr-1" />
                Edit
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-slate-500 hover:text-slate-700 h-7 px-2"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5 mr-1" />
                  Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 mr-1" />
                  More
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="editing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <Textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="min-h-[120px] bg-white border-slate-200 text-sm"
                placeholder="Describe the extraction task..."
              />
              <div className="flex items-center gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  className="text-slate-500"
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Save
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="viewing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className={`text-sm text-slate-600 leading-relaxed ${!isExpanded ? 'line-clamp-2' : ''}`}>
                {description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}