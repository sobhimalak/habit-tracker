import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format, differenceInDays } from "date-fns";
import HabitListClient from "@/components/HabitListClient";
import { Menu } from "lucide-react";
import Link from "next/link";
import ShareButton from "@/components/ShareButton";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");

  // Fetch active habits and their challenges
  const habits = await prisma.habit.findMany({
    where: {
      userId: session.user.id,
      isActive: true
    },
    include: {
      challenges: {
        where: { isActive: true }
      },
      logs: {
        where: { completed: true },
        orderBy: { date: 'desc' }
      }
    }
  });

  const logs = await prisma.habitLog.findMany({
    where: {
      habitId: { in: habits.map(h => h.id) },
      date: todayStr
    }
  });

  const habitsWithLogs = (habits as any[]).map(habit => {
    const log = logs.find(l => l.habitId === habit.id);
    return {
      ...habit,
      streak: habit.logs?.length || 0,
      icon: habit.icon || "✨",
      color: habit.color || "#10b981",
      goalValue: habit.goalValue || 1,
      goalUnit: habit.goalUnit || "times",
      reminderTime: habit.reminderTime || undefined,
      todayLog: log || null
    };
  });

  const activeChallenge = habits
    .filter(h => h.challenges.length > 0)
    .flatMap(h => h.challenges)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  // Dynamic progress based on actual activity
  const completedCount = activeChallenge ? await prisma.habitLog.count({
    where: {
      habitId: activeChallenge.habitId,
      completed: true,
      date: { gte: activeChallenge.startDate }
    }
  }) : 0;

  const totalDays = activeChallenge?.goalDays ?? 100;
  const progressPercent = Math.min(100, (completedCount / totalDays) * 100);
  const displayDay = completedCount + 1;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 px-8 pb-32 animate-slide-up max-w-md mx-auto w-full">
      <header className="pt-12 pb-8 flex flex-col items-center text-center shrink-0">
        <div className="flex items-center justify-between w-full px-4 relative">
          <div className="w-10" /> {/* Spacer for symmetry */}
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 italic flex-1 text-center truncate px-2">
            {activeChallenge?.title || "My Progress"}
          </h2>
          <div className="w-10 flex justify-end">
            <ShareButton title={`${displayDay} Days of Forme Habits`} />
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-5xl font-black tracking-tighter italic text-white uppercase">Day {displayDay}</h1>
          <p className="text-zinc-500 font-bold text-sm tracking-wide uppercase">of {totalDays} Days</p>
        </div>

        <div className="w-full max-w-sm pt-8">
          <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all duration-1000 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest pl-1 italic">
            <span>Progress {Math.round(progressPercent)}%</span>
            <span>{Math.max(0, totalDays - completedCount)} Days Left</span>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="flex items-center justify-between mb-8 px-1">
          <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">{format(today, "EEEE, MMMM do")}</h3>
          <Link href="/habits" className="text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:text-emerald-400 transition-colors italic">Manage All</Link>
        </div>

        {habits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-3xl space-y-6">
            <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">⚡️</span>
            </div>
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest text-center px-8">No habits active for today.</p>
            <Link href="/add" className="btn-primary max-w-[200px] h-12 text-[10px] tracking-widest italic">
              ADD A HABIT
            </Link>
          </div>
        ) : (
          <HabitListClient habits={habitsWithLogs} dateStr={todayStr} />
        )}
      </main>
    </div>
  );
}
