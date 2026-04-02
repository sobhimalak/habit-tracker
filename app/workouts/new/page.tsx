"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, X, Plus, Dumbbell, Search, Check } from "lucide-react";
import { useRouter } from "next/navigation";

const MUSCLE_GROUPS = ["All", "Chest", "Back", "Legs", "Shoulders", "Arms", "Core"];

export default function NewWorkout() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [exercises, setExercises] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState("All");
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    fetchExercises();
  }, [search, selectedMuscle]);

  const fetchExercises = async () => {
    setDataLoading(true);
    const res = await fetch(`/api/exercises?search=${search}&muscle=${selectedMuscle}`);
    const data = await res.json();
    setExercises(data);
    setDataLoading(false);
  };

  const toggleExercise = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || selectedIds.length === 0) return;

    setLoading(true);
    const res = await fetch("/api/workouts", {
      method: "POST",
      body: JSON.stringify({ name, exerciseIds: selectedIds }),
    });

    if (res.ok) {
      router.push("/workouts");
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
        <h1 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500 italic">Create Session</h1>
        <div className="w-7" />
      </header>

      <form onSubmit={handleSubmit} className="flex-1 space-y-12">
        {/* Name Input */}
        <div className="space-y-4">
          <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-1">Session Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Monday Push Day"
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500/50 transition-all text-white font-black text-sm italic uppercase tracking-tight placeholder:text-zinc-700"
            required
          />
        </div>

        {/* Exercise Picker Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Select Movements ({selectedIds.length})</label>
            {selectedIds.length > 0 && (
              <button 
                type="button" 
                onClick={() => setSelectedIds([])}
                className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Search Inside Picker */}
          <div className="relative group">
            <Search size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search library..."
              className="w-full bg-zinc-950 border border-zinc-900 rounded-xl py-3 pl-10 pr-4 text-[10px] font-bold text-white focus:outline-none focus:border-zinc-800 transition-all placeholder:text-zinc-800"
            />
          </div>

          {/* Muscle Chips Inside Picker */}
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            {MUSCLE_GROUPS.map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setSelectedMuscle(m)}
                className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                  selectedMuscle === m 
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500' 
                    : 'bg-zinc-950 border-zinc-900 text-zinc-700'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide pb-4">
            {dataLoading ? (
               <p className="text-[9px] font-black text-zinc-800 uppercase tracking-[0.2em] text-center pt-10">Refreshing movements...</p>
            ) : exercises.map(ex => {
              const isSelected = selectedIds.includes(ex.id);
              return (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => toggleExercise(ex.id)}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all active:scale-95 ${
                    isSelected 
                      ? 'bg-emerald-500/10 border-emerald-500/40' 
                      : 'bg-[#111113] border-zinc-900 group'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isSelected ? 'bg-emerald-500 text-white' : 'bg-zinc-950 border border-zinc-800 text-zinc-700'}`}>
                      <Dumbbell size={16} />
                    </div>
                    <div className="text-left">
                      <p className={`text-[10px] font-black uppercase italic tracking-tight ${isSelected ? 'text-white' : 'text-zinc-500'}`}>{ex.name}</p>
                      <p className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">{ex.muscleGroup}</p>
                    </div>
                  </div>
                  {isSelected && <Check size={14} className="text-emerald-500" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-8">
          <button
            type="submit"
            disabled={loading || !name || selectedIds.length === 0}
            className="btn-primary h-14 text-[12px] tracking-[0.2em] italic"
          >
            {loading ? "SAVING..." : "SAVE SESSION TEMPLATE"}
          </button>
        </div>
      </form>
    </div>
  );
}
