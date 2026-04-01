"use client";
 
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, ChevronRight, ChevronLeft, Zap, Target, Clock, AlertCircle } from "lucide-react";
 
type Habit = {
  id: string;
  name: string;
  streak: number;
  goalValue: number;
  goalUnit: string;
  reminderTime?: string;
  todayLog?: {
    completed: boolean;
    notes?: string;
    timeCompleted?: string;
    missedReason?: string;
  } | null;
};
 
interface HabitListClientProps {
  habits: Habit[];
  dateStr: string;
}
 
export default function HabitListClient({ habits: initialHabits, dateStr }: HabitListClientProps) {
  const router = useRouter();
  const [habits, setHabits] = useState(initialHabits);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [expandedHabitId, setExpandedHabitId] = useState<string | null>(null);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null); // For the log detail view
 
  // Detailed log states
  const [notes, setNotes] = useState("");
  const [timeCompleted, setTimeCompleted] = useState("");
  const [missedReason, setMissedReason] = useState("");
 
  const toggleHabit = async (habitId: string, completed: boolean) => {
    setLoadingId(habitId);
    try {
      const res = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habitId,
          date: dateStr,
          completed,
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
      const res = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habitId,
          date: dateStr,
          completed: habits.find(h => h.id === habitId)?.todayLog?.completed ?? true,
          notes,
          timeCompleted,
          missedReason,
        }),
      });
 
      if (res.ok) {
        const updatedLog = await res.json();
        setHabits(habits.map(h => 
          h.id === habitId ? { ...h, todayLog: updatedLog } : h
        ));
        setSelectedHabitId(null);
      }
    } finally {
      setLoadingId(null);
    }
  };
 
  return (
    <div className="space-y-6">
      {habits.map((habit) => {
        const isCompleted = habit.todayLog?.completed === true;
        const isMissed = habit.todayLog?.completed === false;
        
        return (
          <div key={habit.id} className="relative group animate-slide-up">
            <div className={`premium-card flex items-center justify-between p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-3xl transition-all ${isCompleted ? 'border-emerald-500/30' : (isMissed ? 'border-rose-500/30' : '')}`}>
              <div className="flex flex-col space-y-2">
                 <div className="flex items-center space-x-3">
                    <h4 className={`text-lg font-black italic tracking-tight transition-colors ${isCompleted ? 'text-emerald-500' : 'text-white'}`}>{habit.name}</h4>
                    {habit.streak > 0 && (
                       <span className="flex items-center space-x-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[8px] font-black uppercase text-emerald-500 tracking-widest italic">
                          <Zap size={8} className="animate-pulse" />
                          <span>STREAK {habit.streak}</span>
                       </span>
                    )}
                 </div>
                 <div className="flex items-center space-x-3 text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">
                    <span className="flex items-center space-x-1">
                       <Target size={10} />
                       <span>Goal: {habit.goalValue} {habit.goalUnit}</span>
                    </span>
                    {habit.reminderTime && (
                       <span className="flex items-center space-x-1">
                          <Clock size={10} />
                          <span>{habit.reminderTime}</span>
                       </span>
                    )}
                 </div>
              </div>
 
              <div className="flex items-center space-x-3">
                <button
                  disabled={loadingId === habit.id}
                  onClick={() => toggleHabit(habit.id, false)}
                  className={`h-12 w-12 rounded-2xl flex items-center justify-center text-[11px] font-black uppercase tracking-widest transition-all ${isMissed ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/20' : 'bg-zinc-100/10 text-zinc-600 border border-zinc-800'}`}
                >
                  NO
                </button>
                <button
                  disabled={loadingId === habit.id}
                  onClick={() => toggleHabit(habit.id, true)}
                  className={`h-12 w-12 rounded-2xl flex items-center justify-center text-[11px] font-black uppercase tracking-widest transition-all ${isCompleted ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20' : 'bg-zinc-100/10 text-zinc-600 border border-zinc-800'}`}
                >
                  YES
                </button>
                <button 
                  onClick={() => {
                    setSelectedHabitId(habit.id);
                    setNotes(habit.todayLog?.notes || "");
                    setTimeCompleted(habit.todayLog?.timeCompleted || "");
                    setMissedReason(habit.todayLog?.missedReason || "");
                  }}
                  className="w-10 h-12 flex items-center justify-center text-zinc-700 hover:text-zinc-500 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
 
      {/* Log Detail Modal (Screen 6) */}
      {selectedHabitId && (
        <div className="fixed inset-0 z-[200] flex flex-col justify-end bg-black/80 backdrop-blur-md p-6">
          <div className="bg-zinc-950 w-full max-w-md mx-auto rounded-[3rem] p-10 pb-12 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] border border-zinc-800/50 animate-slide-up">
            <header className="flex justify-between items-center mb-10">
              <button onClick={() => setSelectedHabitId(null)} className="text-zinc-600 hover:text-white transition-colors">
                <ChevronLeft size={28} />
              </button>
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 italic">Entry Details</h3>
              <button onClick={() => setSelectedHabitId(null)} className="text-zinc-600 hover:text-white transition-colors">
                <X size={28} />
              </button>
            </header>
 
            <div className="space-y-10">
              <div className="space-y-2">
                <h4 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                  {habits.find(h => h.id === selectedHabitId)?.name}
                </h4>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic animate-pulse">Update your progress</p>
              </div>
 
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] pl-1">Execution Time</label>
                  <div className="relative group">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={18} />
                    <input 
                      type="text" 
                      value={timeCompleted}
                      onChange={(e) => setTimeCompleted(e.target.value)}
                      placeholder="e.g. 08:30"
                      className="input-premium h-14 pl-12 bg-zinc-900/40 text-sm font-black italic"
                    />
                  </div>
                </div>
 
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] pl-1">Daily Notes</label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-zinc-900/40 border border-zinc-800 rounded-3xl p-5 focus:outline-none focus:border-emerald-500/50 h-32 resize-none text-white text-sm font-black italic placeholder:text-zinc-800"
                    placeholder="Reflect on today's discipline..."
                  />
                </div>
              </div>
 
              <div className="pt-4">
                <button
                  disabled={loadingId === selectedHabitId}
                  onClick={() => handleSaveDetails(selectedHabitId!)}
                  className="btn-primary h-14 text-[12px] tracking-[0.2em] italic"
                >
                  {loadingId === selectedHabitId ? "..." : "CONFIRM LOG"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
