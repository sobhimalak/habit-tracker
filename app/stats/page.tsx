import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ChevronLeft, Menu } from "lucide-react";
import { format, startOfWeek, startOfMonth, isWithinInterval } from "date-fns";

export default async function Stats() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const habits = await prisma.habit.findMany({
    where: { userId: session.user.id, isActive: true },
    include: { logs: true }
  });

  const allLogs = habits.flatMap(h => h.logs);
  
  // Calculate Streaks (Simplified)
  const currentStreak = 7; // Placeholder Logic
  const longestStreak = 15; // Placeholder Logic
  
  // Calculate Weekly/Monthly %
  const now = new Date();
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);
  
  const weeklyLogs = allLogs.filter(l => new Date(l.date) >= weekStart);
  const weeklyRate = weeklyLogs.length > 0 ? Math.round((weeklyLogs.filter(l => l.completed).length / weeklyLogs.length) * 100) : 0;
  
  const monthlyLogs = allLogs.filter(l => new Date(l.date) >= monthStart);
  const monthlyRate = monthlyLogs.length > 0 ? Math.round((monthlyLogs.filter(l => l.completed).length / monthlyLogs.length) * 100) : 0;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="pt-12 pb-6 flex items-center justify-between px-2">
        <div className="w-10" />
        <h1 className="text-xl font-bold tracking-tight">Statistics</h1>
        <button className="text-muted-foreground hover:text-foreground">
          <Menu size={28} />
        </button>
      </header>

      <div className="space-y-8 flex-1">
        <div className="grid grid-cols-2 gap-4">
          <div className="premium-card flex flex-col items-center justify-center border border-zinc-800 rounded-xl p-4 h-28 space-y-1">
            <span className="text-2xl font-bold italic">65%</span>
            <span className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest text-center">Daily average</span>
          </div>
          <div className="premium-card flex flex-col items-center justify-center border border-zinc-800 rounded-xl p-4 h-28 space-y-1">
            <span className="text-2xl font-bold italic">7</span>
            <span className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest text-center">Streak</span>
          </div>
          <div className="premium-card flex flex-col items-center justify-center border border-zinc-800 rounded-xl p-4 h-28 space-y-1">
            <span className="text-2xl font-bold italic">12</span>
            <span className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest text-center">Best streak</span>
          </div>
          <div className="premium-card flex flex-col items-center justify-center border border-zinc-800 rounded-xl p-4 h-28 space-y-1">
            <span className="text-2xl font-bold italic">82%</span>
            <span className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest text-center">Completion</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between px-1 text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-2">
            <span>Habit</span>
            <span>Score</span>
          </div>
          <div className="space-y-2">
            {habits.map(habit => {
              const score = habit.logs.length > 0 ? Math.round((habit.logs.filter(l => l.completed).length / habit.logs.length) * 100) : 0;
              return (
                <div key={habit.id} className="flex justify-between items-center py-2 px-1">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{habit.icon || "✨"}</span>
                    <span className="font-bold">{habit.name}</span>
                  </div>
                  <span className="font-bold text-zinc-400">{score}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

