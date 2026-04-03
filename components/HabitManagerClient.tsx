"use client";
 
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Edit2, Zap, Target, Clock, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
 
type Habit = {
  id: string;
  name: string;
  streak: number;
  goalValue: number;
  goalUnit: string;
  reminderTime?: string;
  icon?: string;
  isActive: boolean;
};
 
interface HabitManagerClientProps {
  habits: Habit[];
}
 
export default function HabitManagerClient({ habits: initialHabits }: HabitManagerClientProps) {
  const router = useRouter();
  const [habits, setHabits] = useState(initialHabits);
  const [loadingId, setLoadingId] = useState<string | null>(null);
 
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this habit? All progress will be lost.")) return;
    
    setLoadingId(id);
    try {
      const res = await fetch(`/api/habits/${id}`, { method: "DELETE" });
      if (res.ok) {
        setHabits(habits.filter(h => h.id !== id));
        router.refresh();
      }
    } finally {
      setLoadingId(null);
    }
  };
 
  const activeHabits = habits.filter(h => h.isActive !== false);
  const archivedHabits = habits.filter(h => h.isActive === false);
 
  const toggleStatus = async (id: string, currentStatus: boolean) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/habits/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        setHabits(habits.map(h => 
          h.id === id ? { ...h, isActive: !currentStatus } : h
        ));
        router.refresh();
      }
    } finally {
      setLoadingId(null);
    }
  };
 
  return (
    <div className="space-y-12">
      {/* Active Habits */}
      <div className="space-y-6">
        {activeHabits.map((habit) => (
          <div key={habit.id} className="group animate-slide-up">
            <div className="premium-card flex items-center justify-between p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-3xl transition-all hover:border-emerald-500/30">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-3">
                  <h4 className="text-lg font-black italic tracking-tight text-white">{habit.name}</h4>
                  {habit.streak > 0 && (
                    <span className="flex items-center space-x-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[8px] font-black uppercase text-emerald-500 tracking-widest italic">
                      <Zap size={8} className="animate-pulse" />
                      <span>{habit.streak} DAY STREAK</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-3 text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">
                  <span className="flex items-center space-x-1">
                    <Target size={10} />
                    <span>{habit.goalValue} {habit.goalUnit} / Day</span>
                  </span>
                  {habit.reminderTime && (
                    <span className="flex items-center space-x-1">
                      <Clock size={10} />
                      <span>{habit.reminderTime}</span>
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Link 
                  href={`/habits/edit/${habit.id}`}
                  className="p-2 text-zinc-600 hover:text-white transition-colors"
                >
                  <Edit2 size={18} />
                </Link>
                <button
                  disabled={loadingId === habit.id}
                  onClick={() => toggleStatus(habit.id, true)}
                  className="p-2 text-zinc-600 hover:text-rose-500/50 transition-colors"
                  title="Archive Habit"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
 
        {activeHabits.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-700">
               <Target size={24} />
            </div>
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic text-center px-8">No active habits.<br/>Archive items are listed below.</p>
          </div>
        )}
      </div>
 
      {/* Archived Habits */}
      {archivedHabits.length > 0 && (
        <div className="space-y-6 pt-12 border-t border-zinc-900">
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-700 italic">Vault (Archived)</h3>
            <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] pl-1 italic">Reactivate your past routines</p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {archivedHabits.map((habit) => (
              <div key={habit.id} className="premium-card flex items-center justify-between p-5 bg-zinc-900/10 border border-zinc-900 rounded-[2rem] opacity-40 hover:opacity-100 transition-all group">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900/50 flex items-center justify-center text-lg">{habit.icon || "✨"}</div>
                  <div className="flex flex-col">
                    <h5 className="text-sm font-black italic tracking-tight text-white uppercase">{habit.name}</h5>
                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest italic">Personal Best Streak: {habit.streak} Days</span>
                  </div>
                </div>
                
                <button
                  disabled={loadingId === habit.id}
                  onClick={() => toggleStatus(habit.id, false)}
                  className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all active:scale-90"
                  title="Restore Habit"
                >
                  <Plus size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
 
      <div className="pt-8">
         <Link 
            href="/add" 
            className="btn-primary h-14 flex items-center justify-center space-x-3 text-[12px] tracking-[0.2em] italic shadow-xl shadow-emerald-500/10"
         >
            <Plus size={16} />
            <span>CREATE NEW HABIT</span>
         </Link>
      </div>
    </div>
  );
}
