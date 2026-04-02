"use client";

import React, { useState, useEffect } from "react";
import { Plus, Dumbbell, Check, Layout, ChevronRight, X } from "lucide-react";

interface WorkoutSelectorProps {
  logId: string;
  onClose: () => void;
  onSaved: () => void;
}

export default function WorkoutSelector({ logId, onClose, onSaved }: WorkoutSelectorProps) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    const res = await fetch("/api/workouts");
    const data = await res.json();
    setTemplates(data);
    setLoading(false);
  };

  const selectTemplate = async (templateId: string) => {
    setSaving(true);
    const res = await fetch("/api/logs/exercises", {
      method: "POST",
      body: JSON.stringify({ logId, templateId }),
    });
    if (res.ok) {
      onSaved();
      onClose();
    }
    setSaving(false);
  };

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-2">
          <Layout size={12} className="text-emerald-500" />
          <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">Assign a Session</h3>
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center">
          <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto" />
        </div>
      ) : templates.length === 0 ? (
        <div className="p-8 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-3xl text-center space-y-4">
          <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest italic">No templates found.</p>
          <button 
            type="button"
            onClick={() => window.location.href = "/workouts/new"}
            className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic underline"
          >
            Create your first session
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {templates.map(tpl => (
            <button
              key={tpl.id}
              disabled={saving}
              onClick={() => selectTemplate(tpl.id)}
              className="flex items-center justify-between p-5 bg-zinc-900/40 border border-zinc-800 rounded-3xl hover:border-emerald-500/30 transition-all active:scale-[0.98] group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-zinc-950 rounded-2xl flex items-center justify-center border border-zinc-900 group-hover:border-emerald-500/20 transition-colors">
                  <Dumbbell size={20} className="text-zinc-700 group-hover:text-emerald-500" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-black text-white uppercase italic tracking-tight">{tpl.name}</p>
                  <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">{tpl.exercises.length} Movements</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-zinc-800 group-hover:text-emerald-500" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
