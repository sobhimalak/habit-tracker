"use client";

import React, { useState } from "react";
import { ChevronLeft, Dumbbell, Target, Info, Check } from "lucide-react";
import { useRouter } from "next/navigation";

const MUSCLE_GROUPS = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"];

export default function NewExercise() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("Chest");
  const [equipment, setEquipment] = useState("");
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !muscleGroup) return;

    setLoading(true);
    const res = await fetch("/api/exercises", {
      method: "POST",
      body: JSON.stringify({ name, muscleGroup, equipment, instructions }),
    });

    if (res.ok) {
      router.push("/exercises");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 px-8 py-12 animate-slide-up pb-32 max-w-md mx-auto w-full">
      <header className="flex items-center justify-between mb-12">
        <button onClick={() => router.back()} className="text-zinc-500 hover:text-zinc-300 transition-colors">
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500 italic">Add Movement</h1>
        <div className="w-7" />
      </header>

      <form onSubmit={handleSubmit} className="flex-1 space-y-10">
        {/* Name Input */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-1">Exercise Name</label>
          <div className="relative group">
            <Dumbbell className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Incline Bench Press"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-14 py-4 focus:outline-none focus:border-emerald-500 transition-all text-white font-black text-sm italic uppercase tracking-tight placeholder:text-zinc-800"
              required
            />
          </div>
        </div>

        {/* Muscle Group Select */}
        <div className="space-y-4">
          <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-1">Primary Muscle Group</label>
          <div className="flex flex-wrap gap-2">
            {MUSCLE_GROUPS.map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setMuscleGroup(m)}
                className={`px-5 py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${
                  muscleGroup === m 
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-600'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Equipment Input */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-1">Required Equipment</label>
          <div className="relative group">
            <Target className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input
              type="text"
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              placeholder="e.g., Dumbbells, Rack"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-14 py-4 focus:outline-none focus:border-emerald-500 transition-all text-white font-black text-sm italic uppercase tracking-tight placeholder:text-zinc-800"
            />
          </div>
        </div>

        {/* Instructions Input */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-1">Execution Guide</label>
          <div className="relative">
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="1. Start by... 2. Lower the weight..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-[2rem] p-6 focus:outline-none focus:border-emerald-500 transition-all text-white font-black text-xs italic uppercase tracking-tight placeholder:text-zinc-800 h-40 resize-none leading-relaxed"
            />
            <Info className="absolute right-5 bottom-5 text-zinc-800" size={18} />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={loading || !name}
            className="btn-primary h-14 text-[12px] tracking-[0.2em] italic"
          >
            {loading ? "..." : "ADD TO LIBRARY"}
          </button>
        </div>
      </form>
    </div>
  );
}
