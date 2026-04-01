"use client";

import { useState } from "react";
import { Check, X, MessageSquare, Clock, AlertCircle, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type Habit = any;

export default function HabitListClient({ habits: initialHabits, dateStr }: { habits: Habit[], dateStr: string }) {
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
  const [expandedHabitId, setExpandedHabitId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [missedReason, setMissedReason] = useState("");
  const [timeCompleted, setTimeCompleted] = useState("");

  const handleLog = async (habitId: string, completed: boolean) => {
    setLoadingId(habitId);
    try {
      const res = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habitId,
          date: dateStr,
          completed,
          timeCompleted: completed ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : null
        }),
      });
      
      if (res.ok) {
        const updatedLog = await res.json();
        setHabits(habits.map(h => 
          h.id === habitId ? { ...h, todayLog: updatedLog } : h
        ));
      }
    } finally {
      setLoadingId(null);
    }
  };

  const handleSaveDetails = async (habitId: string) => {
    setLoadingId(habitId);
    try {
      const habit = habits.find(h => h.id === habitId);
      const isCompleted = habit?.todayLog?.completed ?? false;
      
      const res = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habitId,
          date: dateStr,
          completed: isCompleted,
          notes,
          timeCompleted: isCompleted ? timeCompleted : undefined,
          missedReason: !isCompleted ? missedReason : undefined
        }),
      });
      
      if (res.ok) {
        const updatedLog = await res.json();
        setHabits(habits.map(h => 
          h.id === habitId ? { ...h, todayLog: updatedLog } : h
        ));
        setExpandedHabitId(null);
      }
    } finally {
      setLoadingId(null);
    }
  };

  const openDetails = (habit: Habit) => {
    setExpandedHabitId(habit.id);
    setNotes(habit.todayLog?.notes || "");
    setMissedReason(habit.todayLog?.missedReason || "");
    setTimeCompleted(habit.todayLog?.timeCompleted || "");
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="space-y-4">
        {habits.map((habit) => {
          const isCompleted = habit.todayLog?.completed === true;
          const isMissed = habit.todayLog?.completed === false;
          const currentHabitLoading = loadingId === habit.id;

          return (
            <div key={habit.id} className="premium-card space-y-4 mb-4 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <span className="text-xl">{habit.icon || "✨"}</span>
                <h3 className="font-bold text-lg">{habit.name}</h3>
              </div>
              
              <div className="flex space-x-3">
                <button
                  disabled={currentHabitLoading}
                  onClick={() => handleLog(habit.id, true)}
                  className={`flex-1 h-12 rounded-lg font-bold transition-all ${
                    isCompleted ? "bg-[#71717a] text-white" : "bg-[#27272a] text-zinc-400"
                  }`}
                >
                  Yes
                </button>
                <button
                  disabled={currentHabitLoading}
                  onClick={() => {
                    openDetails(habit);
                  }}
                  className={`flex-1 h-12 rounded-lg font-bold transition-all ${
                    isMissed ? "bg-[#71717a] text-white" : "bg-[#27272a] text-zinc-400"
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-4">
        <button 
          className="w-full h-14 bg-secondary text-foreground font-bold rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
          onClick={() => {
            const firstActive = habits.find(h => h.todayLog !== null);
            if (firstActive) openDetails(firstActive);
          }}
        >
          <span>Add Note</span>
        </button>
      </div>

      {expandedHabitId && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end bg-black/80 backdrop-blur-sm">
          <div className="bg-background w-full max-w-md mx-auto rounded-t-[2rem] p-8 pb-12 shadow-2xl border-t border-zinc-800">
            <header className="flex justify-between items-center mb-8">
              <button 
                onClick={() => setExpandedHabitId(null)}
                className="text-muted-foreground"
              >
                <ChevronLeft size={28} />
              </button>
              <h3 className="text-xl font-bold">Log Your Day</h3>
              <button 
                onClick={() => setExpandedHabitId(null)}
                className="text-muted-foreground"
              >
                <X size={28} />
              </button>
            </header>

            <div className="space-y-8">
              <div>
                <h4 className="text-2xl font-bold mb-4">{habits.find(h => h.id === expandedHabitId)?.name}</h4>
                <p className="text-zinc-500 font-medium mb-4">Did you exercise?</p>
                <div className="flex space-x-3">
                  <div className={`flex-1 flex items-center justify-center h-12 rounded-lg font-bold transition-all ${habits.find(h => h.id === expandedHabitId)?.todayLog?.completed ? 'bg-[#71717a] text-white' : 'bg-[#27272a] text-zinc-500'}`}>Yes</div>
                  <div className={`flex-1 flex items-center justify-center h-12 rounded-lg font-bold transition-all ${!habits.find(h => h.id === expandedHabitId)?.todayLog?.completed ? 'bg-[#71717a] text-white' : 'bg-[#27272a] text-zinc-500'}`}>No</div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Time Completed</label>
                  <input 
                    type="text" 
                    value={timeCompleted}
                    onChange={(e) => setTimeCompleted(e.target.value)}
                    placeholder="e.g. 08:30"
                    className="w-full bg-transparent border border-zinc-800 rounded-lg h-12 px-4 focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Missed Reason</label>
                  <select
                    value={missedReason}
                    onChange={(e) => setMissedReason(e.target.value)}
                    className="w-full bg-[#27272a] border-none rounded-lg h-12 px-4 focus:outline-none appearance-none font-bold"
                  >
                    <option value="">Select a reason</option>
                    <option value="No time">No time</option>
                    <option value="Forgot">Forgot</option>
                    <option value="Tired">Tired</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Add Note (Optional)</label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-transparent border border-zinc-800 rounded-lg p-4 focus:outline-none focus:border-zinc-500 h-24 resize-none"
                  />
                </div>
              </div>

              <button
                onClick={() => handleSaveDetails(expandedHabitId!)}
                className="btn-primary"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

