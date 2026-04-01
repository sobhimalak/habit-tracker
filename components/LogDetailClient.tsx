"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Clock, AlertCircle } from "lucide-react";

export default function LogDetailClient({ habit, initialLog }: { habit: any, initialLog: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState(initialLog?.notes || "");
  const [timeCompleted, setTimeCompleted] = useState(initialLog?.timeCompleted || "");
  const [missedReason, setMissedReason] = useState(initialLog?.missedReason || "");

  const handleSave = async () => {
    setLoading(true);
    const res = await fetch("/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        habitId: habit.id,
        date: new Date().toISOString().split('T')[0],
        completed: true, // Assuming saving details marks as completed or preserves state
        notes,
        timeCompleted,
        missedReason: missedReason || undefined
      }),
    });

    if (res.ok) {
      router.push("/");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-1">Time Completed</label>
          <div className="relative group">
            <input 
              type="text" 
              value={timeCompleted}
              onChange={(e) => setTimeCompleted(e.target.value)}
              placeholder="e.g. 08:30"
              className="input-premium pl-12"
            />
            <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-primary transition-colors" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-1">Notes</label>
          <div className="relative group">
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-5 pt-12 focus:outline-none focus:border-primary/50 h-32 resize-none text-zinc-100 text-sm font-medium transition-all"
              placeholder="Any thoughts on today's progress?"
            />
            <MessageSquare size={16} className="absolute left-5 top-5 text-zinc-500 group-focus-within:text-primary transition-colors" />
          </div>
        </div>

        <div className="space-y-2 pt-4">
           <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] text-center italic">Premium Tracking System v1.0</p>
        </div>
      </div>

      <div className="fixed bottom-12 left-0 right-0 px-8 max-w-md mx-auto">
        <button
          onClick={handleSave}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? "..." : "Log Activity"}
        </button>
      </div>
    </div>
  );
}
