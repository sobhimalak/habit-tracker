"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Edit2, ChevronLeft, Menu, Plus } from "lucide-react";
import Link from "next/link";

type Habit = any; // simplified

export default function HabitManagerClient({ habits: initialHabits }: { habits: Habit[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const deleteHabit = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" and all its history?`)) return;
    setLoadingId(id);
    const res = await fetch(`/api/habits/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    setLoadingId(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="pt-12 pb-6 flex items-center justify-between px-2">
        <div className="w-10" />
        <h1 className="text-xl font-bold tracking-tight">My Habits</h1>
        <button className="text-muted-foreground hover:text-foreground">
          <Menu size={28} />
        </button>
      </header>

      <div className="space-y-4 flex-1">
        {initialHabits.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground font-medium">No habits yet.</p>
          </div>
        ) : (
          initialHabits.map((habit) => (
            <div key={habit.id} className="premium-card flex items-center justify-between border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <span className="text-xl">{habit.icon || "✨"}</span>
                <h3 className="font-bold text-lg text-foreground">{habit.name}</h3>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => router.push(`/habits/edit/${habit.id}`)}
                  className="px-3 py-1 rounded-md bg-[#27272a] text-foreground text-xs font-bold border border-zinc-700"
                >
                  Edit
                </button>
                <button
                  disabled={loadingId === habit.id}
                  onClick={() => deleteHabit(habit.id, habit.name)}
                  className="px-3 py-1 rounded-md bg-[#27272a] text-foreground text-xs font-bold border border-zinc-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}

        <div className="text-center pt-4">
          <Link 
            href="/add" 
            className="text-muted-foreground font-bold hover:text-foreground transition-colors"
          >
            + Add New Habit
          </Link>
        </div>
      </div>
    </div>
  );
}
