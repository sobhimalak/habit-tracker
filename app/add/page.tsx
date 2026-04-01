"use client";

import { useState } from "react";
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

  const SUGGESTED_ICONS = ["✨", "🏃", "💧", "📖", "🧘", "💪", "🍎", "💤", "💻", "🎵", "💰", "🎨"];
  const ICONS = ["✨", "🏃", "🥗", "📚", "🧘", "💧", "💪", "🍎", "🚶", "🥛", "🍳"];
const COLORS = ["#71717a", "#ef4444", "#f43f5e", "#f59e0b", "#10b981", "#3b82f6"];

  const handleSubmit = async (e: React.FormEvent) => {
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
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background px-6">
      <header className="pt-12 pb-6 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground">
          <ChevronLeft size={28} />
        </button>
        <button onClick={() => router.push('/')} className="text-muted-foreground hover:text-foreground">
          <X size={28} />
        </button>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8 flex-1 pb-32">
        <div className="space-y-2">
          <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest ml-1">Habit Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-transparent border border-zinc-800 rounded-lg px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors h-12"
            placeholder="Go outside"
            required
          />
        </div>

        <div className="space-y-4">
          <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest ml-1">Choose Icon</label>
          <div className="grid grid-cols-6 gap-3">
            {ICONS.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIcon(i)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all ${
                  icon === i ? "bg-[#71717a] scale-110" : "bg-[#27272a] opacity-60"
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest ml-1">Select Color</label>
          <div className="grid grid-cols-6 gap-3">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-10 h-10 rounded-full transition-all border-2 ${
                  color === c ? "border-zinc-400 scale-110" : "border-transparent opacity-60"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest ml-1">Habit Type</label>
          <div className="flex h-12 bg-[#27272a] p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setIsChallenge(false)}
              className={`flex-1 flex items-center justify-center rounded-md font-bold transition-all ${!isChallenge ? 'bg-[#71717a] text-white' : 'text-zinc-500'}`}
            >
              Daily
            </button>
            <button
              type="button"
              onClick={() => setIsChallenge(true)}
              className={`flex-1 flex items-center justify-center rounded-md font-bold transition-all ${isChallenge ? 'bg-[#71717a] text-white' : 'text-zinc-500'}`}
            >
              Challenge
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest ml-1">Set Goal Days</label>
          <select
            value={challengeGoal}
            onChange={(e) => setChallengeGoal(e.target.value)}
            className="w-full bg-[#27272a] border-none rounded-lg px-4 py-3 focus:outline-none h-12 font-bold appearance-none"
          >
            <option value="7">7 Days</option>
            <option value="21">21 Days</option>
            <option value="30">30 Days</option>
            <option value="60">60 Days</option>
            <option value="100">100 Days</option>
          </select>
        </div>

        <div className="fixed bottom-12 left-0 right-0 px-6 max-w-md mx-auto">
          <button
            type="submit"
            disabled={loading || !name}
            className="w-full bg-white text-black font-black text-lg h-14 rounded-xl active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? "..." : "Save Habit"}
          </button>
        </div>
      </form>
    </div>
  );
}
