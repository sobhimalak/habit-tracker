"use client";
 
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, ChevronRight, ChevronLeft, Zap, Target, Clock, AlertCircle, Dumbbell, Plus } from "lucide-react";
import WorkoutSelector from "./WorkoutSelector";
 
type Habit = {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  streak: number;
  goalValue: number;
  goalUnit: string;
  reminderTime?: string;
  todayLog?: {
    id?: string;
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
  const [showWorkoutSelector, setShowWorkoutSelector] = useState(false);
  const [loggedExercises, setLoggedExercises] = useState<any[]>([]);

  const fetchLoggedExercises = async (logId: string) => {
    const res = await fetch(`/api/logs/exercises?logId=${logId}`);
    if (res.ok) {
      const data = await res.json();
      setLoggedExercises(data);
    }
  };
 
  const toggleHabit = async (habitId: string, completed: boolean, reasonFlag?: string) => {
    setLoadingId(habitId);
    try {
      const res = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habitId,
          date: dateStr,
          completed,
          missedReason: reasonFlag || "",
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
        const isCompleted  = habit.todayLog?.completed === true;
        const isRest        = habit.todayLog?.completed === false && habit.todayLog?.missedReason === "REST";
        const isMissed      = habit.todayLog?.completed === false && habit.todayLog?.missedReason !== "REST";
        
        return (
          <div key={habit.id} className="relative group animate-slide-up">
            <div className={`premium-card p-5 bg-zinc-900/40 border border-zinc-800/80 rounded-3xl transition-all ${
              isCompleted ? 'border-emerald-500/30' : isMissed ? 'border-rose-500/30' : isRest ? 'border-blue-500/30' : ''
            }`}>
              {/* Top row: name + streak + chevron */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    {habit.icon && (
                      <span className="text-xl shrink-0">{habit.icon}</span>
                    )}
                    <h4 className={`text-base font-black italic tracking-tight transition-colors ${
                      isCompleted ? 'text-emerald-500' : isMissed ? 'text-rose-500' : isRest ? 'text-blue-400' : 'text-white'
                    }`}>{habit.name}</h4>
                    {habit.streak > 0 && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[8px] font-black uppercase text-emerald-500 tracking-widest italic shrink-0">
                        <Zap size={8} className="animate-pulse" />
                        STREAK {habit.streak}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">
                    <span className="flex items-center gap-1">
                      <Target size={10} />
                      Goal: {habit.goalValue} {habit.goalUnit}
                    </span>
                    {habit.reminderTime && (
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {habit.reminderTime}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    const habitData = habits.find(h => h.id === habit.id);
                    setSelectedHabitId(habit.id);
                    setNotes(habit.todayLog?.notes || "");
                    setTimeCompleted(habit.todayLog?.timeCompleted || "");
                    setMissedReason(habit.todayLog?.missedReason || "");
                    setShowWorkoutSelector(false);
                    if (habit.todayLog?.id || (habitData as any).todayLogId) {
                      // We need the actual log ID. If it's a new log, we might need to create it first or use habitId+date
                    }
                  }}
                  className="w-8 h-8 flex items-center justify-center text-zinc-700 hover:text-zinc-500 transition-colors shrink-0 ml-2"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
              {/* Bottom row: REST + MISS + DONE */}
              <div className="flex gap-2 mt-3">
                <button
                  disabled={loadingId === habit.id}
                  onClick={() => toggleHabit(habit.id, false, "REST")}
                  className={`flex-1 h-8 rounded-xl flex items-center justify-center text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                    isRest
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                      : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                  }`}
                >
                  REST
                </button>
                <button
                  disabled={loadingId === habit.id}
                  onClick={() => toggleHabit(habit.id, false)}
                  className={`flex-1 h-8 rounded-xl flex items-center justify-center text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                    isMissed
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                      : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                  }`}
                >
                  MISS
                </button>
                <button
                  disabled={loadingId === habit.id}
                  onClick={() => toggleHabit(habit.id, true)}
                  className={`flex-1 h-8 rounded-xl flex items-center justify-center text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                    isCompleted
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                  }`}
                >
                  DONE
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
 
                </div>

                {/* Workout/Exercise Integration Section */}
                <div className="pt-8 border-t border-zinc-900/50 space-y-6">
                  {showWorkoutSelector ? (
                    <WorkoutSelector 
                      logId={habits.find(h => h.id === selectedHabitId)?.todayLog?.id || ""} 
                      onClose={() => setShowWorkoutSelector(false)}
                      onSaved={() => {
                        const logId = habits.find(h => h.id === selectedHabitId)?.todayLog?.id;
                        if (logId) fetchLoggedExercises(logId);
                      }}
                    />
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center space-x-2">
                          <Dumbbell size={12} className="text-emerald-500" />
                          <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic tracking-widest">Movement Log</h3>
                        </div>
                        <button 
                          onClick={() => setShowWorkoutSelector(true)}
                          className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic"
                        >
                          {loggedExercises.length > 0 ? "Change Session" : "Add Session"}
                        </button>
                      </div>

                      {loggedExercises.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3">
                          {loggedExercises.map((ex, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-zinc-900/30 border border-zinc-900 rounded-2xl">
                              <div className="flex items-center space-x-3">
                                <div className="text-[10px] font-black text-zinc-800 italic">0{idx + 1}</div>
                                <p className="text-[10px] font-black text-white uppercase tracking-tight italic">{ex.name}</p>
                              </div>
                              <Check size={14} className="text-emerald-500/40" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <button 
                          onClick={() => setShowWorkoutSelector(true)}
                          className="w-full py-8 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-[2rem] flex flex-col items-center justify-center space-y-2 opacity-60 hover:opacity-100 transition-opacity"
                        >
                          <Plus size={20} className="text-zinc-600" />
                          <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest italic">No session assigned</p>
                        </button>
                      )}
                    </div>
                  )}
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
