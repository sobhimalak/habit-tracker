import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/route";
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
      }
    }
  });
 
  const logs = await prisma.habitLog.findMany({
    where: {
      habitId: { in: habits.map(h => h.id) },
      date: todayStr
    }
  });
 
  const habitsWithLogs = habits.map(habit => {
    const log = logs.find(l => l.habitId === habit.id);
    return {
      ...habit,
      todayLog: log || null
    };
  });
 
  const activeChallenge = habits.find(h => h.challenges.length > 0)?.challenges[0];
  const daysPassed = activeChallenge ? differenceInDays(today, new Date(activeChallenge.startDate)) : 0;
  const totalDays = activeChallenge?.goalDays ?? 100;
  const progressPercent = Math.min(100, ((daysPassed + 1) / totalDays) * 100);
 
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 px-8 pb-32 animate-slide-up max-w-md mx-auto w-full">
      <header className="pt-16 pb-12 flex flex-col items-center space-y-8 text-center shrink-0">
        <div className="flex items-center justify-between w-full px-4 mb-4">
           <button className="text-zinc-500 hover:text-zinc-300 transition-colors">
             <Menu size={24} />
           </button>
           <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">{activeChallenge?.title || "2022 Challenge"}</h2>
           <ShareButton title={`${daysPassed+1} Days of Habitify`} />
        </div>
 
        <div className="space-y-1">
          <h1 className="text-5xl font-black tracking-tighter italic text-white uppercase">Day {daysPassed + 1}</h1>
          <p className="text-zinc-500 font-bold text-sm tracking-wide uppercase">of {totalDays} Days</p>
        </div>
 
        <div className="w-full max-w-sm pt-4">
           <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all duration-1000 ease-out" 
                style={{ width: `${progressPercent}%` }}
              />
           </div>
           <div className="flex justify-between mt-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest pl-1 italic">
              <span>Progress {Math.round(progressPercent)}%</span>
              <span>{Math.max(0, totalDays - daysPassed - 1)} Days Left</span>
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
