"use client";

import React from "react";

interface MuscleHeatmapProps {
  primaryMuscle: string;
  secondaryMuscles?: string[];
  className?: string;
}

const MUSCLE_MAP: Record<string, string[]> = {
  "Chest": ["chest"],
  "Back": ["upper-back", "lower-back", "lats"],
  "Shoulders": ["deltoids"],
  "Arms": ["biceps", "triceps"],
  "Core": ["abs", "obliques"],
  "Legs": ["quads", "hamstrings", "glutes", "calves"],
};

export default function MuscleHeatmap({ primaryMuscle, secondaryMuscles = [], className = "" }: MuscleHeatmapProps) {
  const isSelected = (muscleGroup: string, type: 'primary' | 'secondary') => {
    const targets = MUSCLE_MAP[muscleGroup] || [];
    if (type === 'primary') {
      return targets.some(t => MUSCLE_MAP[primaryMuscle]?.includes(t));
    }
    return secondaryMuscles.some(sm => targets.some(t => MUSCLE_MAP[sm]?.includes(t)));
  };

  const getFill = (id: string) => {
    // Check if this ID belongs to primary muscle group
    const primaryTargets = MUSCLE_MAP[primaryMuscle] || [];
    if (primaryTargets.includes(id)) return "#10b981"; // emerald-500
    
    // Check if this ID belongs to any secondary muscle group
    for (const sm of secondaryMuscles) {
      const secondaryTargets = MUSCLE_MAP[sm] || [];
      if (secondaryTargets.includes(id)) return "#10b98144"; // emerald-500 with opacity
    }
    
    return "#27272a"; // zinc-800
  };

  return (
    <div className={`flex items-center justify-center space-x-8 ${className}`}>
      {/* Front View */}
      <div className="relative group">
        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-widest text-zinc-600 italic">Anatomy Front</span>
        <svg width="100" height="220" viewBox="0 0 100 220" className="drop-shadow-2xl">
          {/* Head & Neck */}
          <circle cx="50" cy="15" r="10" fill="#18181b" />
          <rect x="46" y="24" width="8" height="8" fill="#18181b" />
          
          {/* Torso */}
          <path id="chest" d="M35 35 Q50 32 65 35 L62 55 Q50 58 38 55 Z" fill={getFill("chest")} className="transition-all duration-500" />
          <path id="abs" d="M40 58 Q50 58 60 58 L58 85 Q50 88 42 85 Z" fill={getFill("abs")} className="transition-all duration-500" />
          <path id="obliques" d="M32 45 L38 55 L42 85 L35 85 Z M68 45 L62 55 L58 85 L65 85 Z" fill={getFill("obliques")} className="transition-all duration-500" />
          
          {/* Arms (Front) */}
          <path id="deltoids-front" d="M28 35 Q22 35 18 45 L25 50 Z M72 35 Q78 35 82 45 L75 50 Z" fill={getFill("deltoids")} className="transition-all duration-500" />
          <path id="biceps" d="M18 45 L15 80 L25 80 L28 45 Z M82 45 L85 80 L75 80 L72 45 Z" fill={getFill("biceps")} className="transition-all duration-500" />
          <path d="M15 80 L12 110 L22 110 L25 80 Z M85 80 L88 110 L78 110 L75 80 Z" fill="#18181b" /> {/* Forearms */}
          
          {/* Legs (Front) */}
          <path id="quads" d="M30 90 L48 90 L46 140 L32 140 Z M70 90 L52 90 L54 140 L68 140 Z" fill={getFill("quads")} className="transition-all duration-500" />
          <path id="calves-front" d="M32 150 L46 150 L44 195 L34 195 Z M68 150 L54 150 L56 195 L66 195 Z" fill={getFill("calves")} className="transition-all duration-500" />
        </svg>
      </div>

      {/* Back View */}
      <div className="relative group">
        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-widest text-zinc-600 italic">Anatomy Back</span>
        <svg width="100" height="220" viewBox="0 0 100 220" className="drop-shadow-2xl">
          {/* Head & Neck */}
          <circle cx="50" cy="15" r="10" fill="#18181b" />
          
          {/* Back Muscles */}
          <path id="upper-back" d="M30 35 Q50 30 70 35 L65 55 Q50 52 35 55 Z" fill={getFill("upper-back")} className="transition-all duration-500" />
          <path id="lats" d="M28 45 L35 55 L42 85 Q50 82 58 85 L65 55 L72 45 Z" fill={getFill("lats")} className="transition-all duration-500" />
          <path id="lower-back" d="M42 85 Q50 82 58 85 L56 95 Q50 92 44 95 Z" fill={getFill("lower-back")} className="transition-all duration-500" />
          
          {/* Arms (Back) */}
          <path id="triceps" d="M18 45 L15 80 L25 80 L28 45 Z M82 45 L85 80 L75 80 L72 45 Z" fill={getFill("triceps")} className="transition-all duration-500" />
          
          {/* Legs (Back) */}
          <path id="glutes" d="M30 90 L70 90 L65 110 Q50 115 35 110 Z" fill={getFill("glutes")} className="transition-all duration-500" />
          <path id="hamstrings" d="M32 110 L48 110 L46 150 L34 150 Z M68 110 L52 110 L54 150 L66 150 Z" fill={getFill("hamstrings")} className="transition-all duration-500" />
        </svg>
      </div>
    </div>
  );
}
