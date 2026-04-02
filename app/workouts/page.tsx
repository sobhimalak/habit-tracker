"use client";

import React, { useState, useEffect } from "react";
import { Plus, ChevronRight, Dumbbell, Calendar, Play, Trash2, Layout } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function WorkoutsHub() {
  const router = useRouter();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    const res = await fetch("/api/workouts");
    const data = await res.json();
    setTemplates(data);
    setLoading(false);
  };

  const deleteTemplate = async (id: string) => {
    if (confirm("Delete this workout template?")) {
      await fetch(`/api/workouts/${id}`, { method: "DELETE" });
      fetchTemplates();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 px-8 py-12 animate-slide-up pb-32 max-w-md mx-auto w-full">
      <header className="space-y-6 mb-12 text-center">
        <div className="space-y-1">
          <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">Sessions</h1>
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] pl-1 italic">Master your routines</p>
        </div>

        <Link 
          href="/workouts/new"
          className="btn-primary h-14 text-[11px] tracking-widest italic"
        >
          CREATE NEW SESSION
        </Link>
      </header>

      <main className="flex-1 space-y-8">
        <div className="flex items-center space-x-3 px-1">
          <Layout size={12} className="text-emerald-500" />
          <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic tracking-widest">
            Saved Templates ({templates.length})
          </h3>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
            <p className="text-[8px] font-black text-zinc-700 uppercase tracking-widest italic">Syncing Routines...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/10 border border-dashed border-zinc-900 rounded-[3rem] space-y-4">
            <Play className="text-zinc-800" size={32} />
            <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest text-center px-12 italic leading-relaxed">
              No saved sessions yet.<br />Start by creating your first<br />Monday or Friday routine.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {templates.map((tpl) => (
              <div key={tpl.id} className="group relative bg-[#111113] border border-zinc-900 rounded-[2.5rem] p-7 transition-all active:scale-[0.98] shadow-2xl shadow-black/30 hover:border-emerald-500/30">
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1">
                    <h4 className="text-xl font-black text-white italic uppercase tracking-tight">{tpl.name}</h4>
                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] italic">{tpl.exercises.length} Movements Linked</p>
                  </div>
                  <button onClick={() => deleteTemplate(tpl.id)} className="p-2 text-zinc-800 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                  {tpl.exercises.slice(0, 3).map((item: any) => (
                    <span key={item.id} className="px-3 py-1.5 bg-zinc-950 border border-zinc-900 rounded-xl text-[8px] font-black text-zinc-500 uppercase tracking-widest italic">
                      {item.exercise.name}
                    </span>
                  ))}
                  {tpl.exercises.length > 3 && (
                    <span className="px-3 py-1.5 bg-zinc-950 border border-zinc-900 rounded-xl text-[8px] font-black text-zinc-500 uppercase tracking-widest italic">
                      +{tpl.exercises.length - 3} More
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-zinc-900 pt-6">
                  <div className="flex items-center space-x-2 text-zinc-600">
                    <Calendar size={12} />
                    <span className="text-[8px] font-black uppercase tracking-widest italic leading-none">Last sync'd {new Date(tpl.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <button className="flex items-center space-x-2 text-emerald-500 group-hover:translate-x-1 transition-all">
                    <span className="text-[10px] font-black uppercase tracking-widest italic">Details</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
