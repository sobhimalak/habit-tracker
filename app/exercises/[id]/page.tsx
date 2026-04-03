"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, Heart, Dumbbell, Target, Info, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import MuscleHeatmap from "@/components/MuscleHeatmap";
 
export default function ExerciseDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [exercise, setExercise] = useState<any>(null);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    fetchExercise();
  }, [params.id]);
 
  const fetchExercise = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/exercises/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setExercise(data);
      } else {
        router.push("/exercises");
      }
    } catch (error) {
      console.error("Error fetching exercise details:", error);
    } finally {
      setLoading(false);
    }
  };
 
  const toggleFavorite = async () => {
    if (!session) return;
    await fetch("/api/favorites", {
      method: "POST",
      body: JSON.stringify({ exerciseId: params.id }),
    });
    fetchExercise();
  };
 
  const deleteExercise = async () => {
    if (confirm("Are you sure you want to delete this custom exercise?")) {
      await fetch(`/api/exercises/${params.id}`, { method: "DELETE" });
      router.push("/exercises");
    }
  };
 
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-950 items-center justify-center space-y-4">
        <div className="w-12 h-12 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest italic">Loading Movement Details...</p>
      </div>
    );
  }
 
  if (!exercise) return null;
 
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 max-w-md mx-auto w-full relative animate-slide-up pb-20">
      {/* Navigation / Actions Bar */}
      <div className="absolute top-12 left-8 right-8 flex items-center justify-between z-50 font-black">
        <button onClick={() => router.back()} className="text-zinc-500 hover:text-zinc-300 transition-colors p-1">
          <ChevronLeft size={32} />
        </button>
        
        <div className="flex items-center space-x-3">
          {exercise.isCustom && (
            <button onClick={deleteExercise} className="text-zinc-500 hover:text-red-500 transition-colors p-2 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <Trash2 size={18} />
            </button>
          )}
          <button onClick={toggleFavorite} className={`p-2 rounded-xl bg-zinc-900/80 border transition-all ${exercise.isFavorite ? 'text-emerald-500 border-emerald-500/50 scale-110 shadow-lg shadow-emerald-500/20' : 'text-zinc-500 border-zinc-800 hover:text-zinc-300'}`}>
            <Heart size={20} fill={exercise.isFavorite ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
 
      {/* Content Area */}
      <main className="px-8 pt-32 space-y-12">
        {/* The Card */}
        <div className="bg-[#111113] border border-zinc-900 rounded-[3rem] p-8 shadow-2xl shadow-black/40 space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <div className="inline-flex px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">
                {exercise.muscleGroup} Movement
              </div>
              {exercise.secondaryMuscles?.map((sm: string) => (
                <div key={sm} className="inline-flex px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[9px] font-black text-zinc-500 uppercase tracking-widest italic">
                   + {sm}
                </div>
              ))}
            </div>
            <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-tight">{exercise.name}</h1>
          </div>
 
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-950 p-4 rounded-3xl border border-zinc-900/50 space-y-2">
              <div className="flex items-center space-x-2 text-zinc-600">
                <Target size={12} />
                <span className="text-[8px] font-black uppercase tracking-widest italic leading-none">Target</span>
              </div>
              <p className="text-[10px] font-black text-white uppercase tracking-wider">{exercise.muscleGroup}</p>
            </div>
            <div className="bg-zinc-950 p-4 rounded-3xl border border-zinc-900/50 space-y-2">
              <div className="flex items-center space-x-2 text-zinc-600">
                <Dumbbell size={12} />
                <span className="text-[8px] font-black uppercase tracking-widest italic leading-none">Equipment</span>
              </div>
              <p className="text-[10px] font-black text-white uppercase tracking-wider">{exercise.equipment || 'Bodyweight'}</p>
            </div>
          </div>
        </div>
 
        {/* The Heatmap Section */}
        <div className="space-y-10 py-6 border-y border-zinc-900/50 border-dashed">
          <div className="flex items-center space-x-3 px-1">
            <div className="w-6 h-6 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20">
              <Target size={12} className="text-emerald-500" />
            </div>
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">Anatomical Focus</h3>
          </div>
 
          <div className="animate-in fade-in zoom-in duration-700 flex justify-center">
             <MuscleHeatmap 
                primaryMuscle={exercise.muscleGroup} 
                secondaryMuscles={exercise.secondaryMuscles} 
                className="scale-90"
             />
          </div>
        </div>
 
        {/* Instructions Section */}
        <div className="space-y-6 px-1">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20">
              <Info size={12} className="text-emerald-500" />
            </div>
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">Execution Guide</h3>
          </div>

          <div className="space-y-6">
            {exercise.instructions?.split(/(\d\.\s)/).filter((s: string) => s && !s.match(/\d\.\s/)).map((step: string, index: number) => (
              <div key={index} className="flex space-x-6 group">
                <div className="text-emerald-500 font-black italic text-xl opacity-20 group-hover:opacity-100 transition-opacity">0{index + 1}</div>
                <p className="text-xs font-black text-zinc-500 leading-relaxed uppercase tracking-wider group-hover:text-zinc-300 transition-colors pt-1 italic">
                  {step.trim()}
                </p>
              </div>
            ))}
            {!exercise.instructions && (
              <p className="text-[10px] font-black text-zinc-800 uppercase tracking-widest text-center italic">
                No instructions provided for this movement.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
