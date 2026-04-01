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
 
  return (
    <div className="space-y-6">
      {habits.map((habit) => (
        <div 
          key={habit.id} 
          className="group animate-slide-up"
        >
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
                onClick={() => handleDelete(habit.id)}
                className="p-2 text-rose-500/50 hover:text-rose-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      ))}
 
      {habits.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-3xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-700">
             <Target size={24} />
          </div>
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic text-center px-8">Your routine is currently empty.<br/>Start a challenge now.</p>
        </div>
      )}
 
      <div className="pt-8">
         <Link 
            href="/add" 
            className="btn-primary h-14 flex items-center justify-center space-x-3 text-[12px] tracking-[0.2em] italic"
         >
            <Plus size={16} />
            <span>CREATE NEW HABIT</span>
         </Link>
      </div>
    </div>
  );
}
