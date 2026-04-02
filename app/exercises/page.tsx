"use client";

import React, { useState, useEffect } from "react";
import { Search, Heart, ChevronRight, Plus, Dumbbell, Filter } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

const MUSCLE_GROUPS = ["All", "Chest", "Back", "Legs", "Shoulders", "Arms", "Core"];

export default function ExerciseLibrary() {
  const { data: session } = useSession();
  const [exercises, setExercises] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExercises();
  }, [search, selectedMuscle]);

  const fetchExercises = async () => {
    setLoading(true);
    const res = await fetch(`/api/exercises?search=${search}&muscle=${selectedMuscle}`);
    const data = await res.json();
    setExercises(data);
    setLoading(false);
  };

  const toggleFavorite = async (exerciseId: string) => {
    if (!session) return;
    await fetch("/api/favorites", {
      method: "POST",
      body: JSON.stringify({ exerciseId }),
    });
    fetchExercises();
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 px-8 py-12 animate-slide-up pb-32 max-w-md mx-auto w-full">
      <header className="space-y-6 mb-12 text-center">
        <div className="space-y-1">
          <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">Library</h1>
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] pl-1 italic">Master your movements</p>
        </div>

        {/* Premium Search Bar */}
        <div className="relative group mx-auto max-w-[280px]">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search size={14} className="text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exercises..."
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-3.5 pl-12 pr-6 text-xs font-bold text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-700"
          />
        </div>

        {/* Muscle Group Filter (Horizontal Scrolling) */}
        <div className="flex space-x-2 overflow-x-auto pb-4 scrollbar-hide px-1">
          {MUSCLE_GROUPS.map((muscle) => (
            <button
              key={muscle}
              onClick={() => setSelectedMuscle(muscle)}
              className={`px-5 py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                selectedMuscle === muscle
                  ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-105"
                  : "bg-zinc-900 border-zinc-800 text-zinc-600 hover:border-zinc-700 hover:text-zinc-400"
              }`}
            >
              {muscle}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 space-y-6">
        {/* Section Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-2">
            <Filter size={10} className="text-emerald-500" />
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">
              {selectedMuscle} Exercises ({exercises.length})
            </h3>
          </div>
          <Link 
            href="/exercises/new"
            className="flex items-center space-x-1 group"
          >
            <Plus size={12} className="text-emerald-500 group-hover:rotate-90 transition-transform" />
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Custom</span>
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
            <p className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">Initializing Library...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {exercises.map((ex) => (
              <div
                key={ex.id}
                className="group relative bg-[#111113] border border-zinc-900 hover:border-emerald-500/30 rounded-[2rem] p-5 transition-all active:scale-[0.98] shadow-xl shadow-black/20"
              >
                <Link href={`/exercises/${ex.id}`} className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-5">
                    <div className="w-14 h-14 bg-zinc-950/50 border border-zinc-900 rounded-2xl flex items-center justify-center group-hover:border-emerald-500/20 transition-colors">
                      <Dumbbell size={24} className="text-zinc-700 group-hover:text-emerald-500 transition-colors" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-white italic uppercase tracking-tight leading-none">{ex.name}</h4>
                      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{ex.muscleGroup} • {ex.equipment || 'Any'}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-zinc-800 group-hover:text-emerald-500 transition-all group-hover:translate-x-1" />
                </Link>
                
                {/* Favorite Toggle */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleFavorite(ex.id);
                  }}
                  className={`absolute top-5 right-5 p-2 rounded-full transition-all ${
                    ex.isFavorite 
                      ? "text-emerald-500 scale-110 shadow-lg shadow-emerald-500/10" 
                      : "text-zinc-800 hover:text-zinc-400"
                  }`}
                >
                  <Heart size={14} fill={ex.isFavorite ? "currentColor" : "none"} />
                </button>
              </div>
            ))}
          </div>
        )}

        {!loading && exercises.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/10 border border-dashed border-zinc-900 rounded-3xl space-y-4">
            <X className="text-zinc-800" size={32} />
            <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest text-center px-12 italic">
              No movements found for "{search}" in {selectedMuscle}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function X({ ...props }) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
