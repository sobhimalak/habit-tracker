"use client";
import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Menu, ChevronLeft, X, Target } from "lucide-react";

export default function AddHabit() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("✨");
  const [color, setColor] = useState("#10b981");
  const [isChallenge, setIsChallenge] = useState(false);
  const [challengeGoal, setChallengeGoal] = useState("30");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const SUGGESTED_ICONS = ["✨", "🏃", "💧", "📖", "🧘", "💪", "🍎", "💤", "💻", "🎵", "💰", "🎨"];
  const ICONS = ["✨", "🏃", "🥗", "📚", "🧘", "💧", "💪", "🍎", "🚶", "🥛", "🍳"];
  const COLORS = ["#71717a", "#ef4444", "#f43f5e", "#f59e0b", "#10b981", "#3b82f6"];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name) return;
    
    setLoading(true);
    const res = await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        icon,
        color,
        type: isChallenge ? "challenge" : "daily",
        isChallenge,
        challengeGoal,
      }),
    });

    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError("Failed to create habit");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col min-h-screen bg-zinc-950 px-8 py-12 animate-slide-up max-w-md mx-auto w-full">
      <header className="flex items-center justify-between mb-16">
        <button type="button" onClick={() => router.back()} className="text-zinc-500 hover:text-zinc-300 transition-colors">
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500 italic">Create Habit</h1>
        <div className="w-7" />
      </header>

      <main className="flex-1 space-y-12">
        <div className="space-y-4">
          <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-1">Habit Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Go for a run..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500 transition-all text-white font-medium"
            autoFocus
          />
        </div>

        <div className="space-y-4 pt-4 border-t border-zinc-900">
          <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-1">Icon & Color</label>
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
              {ICONS.map(i => (
                <button 
                  key={i} 
                  type="button" 
                  onClick={() => setIcon(i)} 
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${
                    icon === i 
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-110' 
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-500 hover:border-zinc-700'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-4">
              {COLORS.map(c => (
                <button 
                  key={c} 
                  type="button" 
                  onClick={() => setColor(c)} 
                  className={`w-8 h-8 rounded-full transition-all ${
                    color === c 
                      ? 'ring-2 ring-white ring-offset-4 ring-offset-zinc-950 scale-110' 
                      : 'hover:scale-110 opacity-60 hover:opacity-100'
                  }`} 
                  style={{ backgroundColor: c }} 
                />
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-6 pt-4 border-t border-zinc-900">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-1">Challenge Mode</label>
              <p className="text-[10px] text-zinc-500 italic pl-1">Track progress over specific days</p>
            </div>
            <button 
              type="button" 
              onClick={() => setIsChallenge(!isChallenge)}
              className={`w-12 h-6 rounded-full transition-all relative ${isChallenge ? 'bg-emerald-500' : 'bg-zinc-800'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isChallenge ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          {isChallenge && (
            <div className="space-y-4 animate-slide-up">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-1">Goal (Days)</label>
              <div className="flex gap-2">
                {[
                  { label: "1 MONTH", value: "30" },
                  { label: "2 MONTHS", value: "60" },
                  { label: "3 MONTHS", value: "90" },
                  { label: "4 MONTHS", value: "120" },
                ].map(item => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setChallengeGoal(item.value)}
                    className={`flex-1 py-3 rounded-xl border font-black text-[10px] transition-all ${challengeGoal === item.value ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
                  >
                    {item.label}
                  </button>
                ))}
                <input
                  type="number"
                  value={challengeGoal}
                  onChange={(e) => setChallengeGoal(e.target.value)}
                  className="w-20 bg-zinc-900 border border-zinc-800 rounded-xl px-2 text-center text-white font-black text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}
        </div>
        <div className="pt-8 px-4">
          <button
            type="submit"
            disabled={loading || !name}
            className="w-full bg-emerald-500 text-white font-black text-sm h-14 rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-emerald-500/20"
          >
            {loading ? "..." : "Save Habit"}
          </button>
        </div>
      </main>
    </form>
  );
}
