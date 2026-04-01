import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { differenceInDays } from "date-fns";
import { Settings } from "lucide-react";
import Link from "next/link";

export default async function ChallengeTracker({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const challenge = await prisma.challenge.findUnique({
    where: { id: params.id },
  });

  if (!challenge) {
    redirect("/");
  }

  const today = new Date();
  const startDate = new Date(challenge.startDate);
  const daysPassed = differenceInDays(today, startDate);
  const totalDays = challenge.goalDays;
  const progressPercent = Math.round(Math.min(100, ((daysPassed + 1) / totalDays) * 100));

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 px-8 py-12 animate-slide-up pb-32 max-w-md mx-auto w-full">
      <header className="flex items-center justify-between mb-16 px-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase">{challenge.title}</h1>
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] italic">Progress {progressPercent}%</p>
        </div>
        <Link href={`/challenges/edit/${challenge.id}`} className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-500 hover:text-white transition-all">
          <Settings size={20} />
        </Link>
      </header>

      <main className="flex-1">
        <div className="grid grid-cols-10 gap-3">
          {Array.from({ length: totalDays }).map((_, i) => {
            const isPast = i <= daysPassed;
            const isToday = i === daysPassed;
            // In a real app, we would check if all habits were completed on this day
            const status = isPast ? (i % 7 === 6 ? "missed" : "success") : "incoming";
            
            return (
              <div 
                key={i}
                className={`relative aspect-square rounded-lg border flex items-center justify-center transition-all ${
                  isPast 
                    ? status === "success" 
                      ? "bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-500/20" 
                      : "bg-rose-500 border-rose-400 shadow-lg shadow-rose-500/20"
                    : "bg-zinc-950 border-zinc-800"
                } ${isToday ? 'scale-110 z-10 ring-2 ring-white/20' : ''}`}
              >
                <span className={`text-[8px] font-black italic ${isPast ? 'text-white' : 'text-zinc-800'}`}>{i + 1}</span>
                {isToday && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-zinc-950 animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-12 p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-[2rem] flex items-center justify-between">
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">Success Rate</span>
              <span className="text-2xl font-black italic text-emerald-500 mt-1">84%</span>
           </div>
           <div className="w-[1px] h-10 bg-zinc-800" />
           <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">Current Streak</span>
              <span className="text-2xl font-black italic text-white mt-1">12 <span className="text-xs text-emerald-500">days</span></span>
           </div>
        </div>
      </main>
    </div>
  );
}
