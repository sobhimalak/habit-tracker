import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ChevronLeft, TrendingUp, Calendar, Zap } from "lucide-react";
import Link from "next/link";
 
export default async function StatsPage() {
  const session = await getServerSession(authOptions);
 
  if (!session) {
    redirect("/login");
  }
 
  // Simplified stats for now
  const habitsCount = await prisma.habit.count({ where: { userId: session.user.id, isActive: true } });
  const totalLogs = await prisma.habitLog.count({ where: { habit: { userId: session.user.id } } });
 
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 px-8 py-12 animate-slide-up pb-32 max-w-md mx-auto w-full">
      <header className="flex items-center justify-between mb-16">
        <Link href="/" className="text-zinc-500 hover:text-zinc-300 transition-colors">
          <ChevronLeft size={28} />
        </Link>
        <h1 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500 italic">Progress</h1>
        <div className="w-7" />
      </header>
 
      <main className="flex-1 space-y-12">
        <div className="space-y-4 text-center">
          <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase">Your Stats</h2>
           {/* Triple Ring Visualization (SVG) */}
           <div className="relative w-64 h-64 mx-auto flex items-center justify-center mt-8">
              {/* Outer Ring - Total Habits Progress */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                 <circle cx="128" cy="128" r="110" fill="transparent" stroke="#18181b" strokeWidth="12" />
                 <circle cx="128" cy="128" r="110" fill="transparent" stroke="#10b981" strokeWidth="12" strokeDasharray="691.15" strokeDashoffset="200" strokeLinecap="round" />
              </svg>
              {/* Middle Ring - Consistency */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                 <circle cx="128" cy="128" r="85" fill="transparent" stroke="#18181b" strokeWidth="12" />
                 <circle cx="128" cy="128" r="85" fill="transparent" stroke="#fbbf24" strokeWidth="12" strokeDasharray="534.07" strokeDashoffset="150" strokeLinecap="round" />
              </svg>
              {/* Inner Ring - Streak Intensity */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                 <circle cx="128" cy="128" r="60" fill="transparent" stroke="#18181b" strokeWidth="12" />
                 <circle cx="128" cy="128" r="60" fill="transparent" stroke="#f43f5e" strokeWidth="12" strokeDasharray="376.99" strokeDashoffset="80" strokeLinecap="round" />
              </svg>
              
              <div className="text-center z-10">
                 <span className="text-3xl font-black italic text-white">82%</span>
                 <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest italic mt-1">Average</p>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="premium-card bg-zinc-900/40 p-6 flex flex-col space-y-4">
              <TrendingUp className="text-emerald-500" size={20} />
              <div className="space-y-1">
                 <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">Growth</p>
                 <h4 className="text-xl font-black italic text-white">+12.4%</h4>
              </div>
           </div>
           <div className="premium-card bg-zinc-900/40 p-6 flex flex-col space-y-4">
              <Zap className="text-amber-500" size={20} />
              <div className="space-y-1">
                 <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">Best Streak</p>
                 <h4 className="text-xl font-black italic text-white">24 Days</h4>
              </div>
           </div>
        </div>

        <div className="premium-card bg-zinc-900/40 p-6 space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-white italic">Weekly Activity</h3>
              <Calendar className="text-zinc-700" size={16} />
           </div>
           <div className="flex justify-between items-end h-32 px-2">
              {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                 <div key={i} className="w-4 bg-zinc-800 rounded-lg relative group">
                    <div 
                       className="absolute bottom-0 left-0 w-full bg-emerald-500 rounded-lg shadow-lg shadow-emerald-500/10 transition-all duration-500 hover:bg-emerald-400" 
                       style={{ height: `${h}%` }}
                    />
                 </div>
              ))}
           </div>
           <div className="flex justify-between text-[8px] font-black text-zinc-700 uppercase tracking-widest px-2 italic">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
           </div>
        </div>
      </main>
    </div>
  );
}
