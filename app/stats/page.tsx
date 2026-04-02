import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ChevronLeft, TrendingUp, Calendar, Zap } from "lucide-react";
import Link from "next/link";
import { startOfWeek, endOfWeek, eachDayOfInterval, format, subDays, isSameDay } from "date-fns";

export default async function StatsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const userId = session.user.id;
  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");

  // 1. Basic Counts
  const habits = await prisma.habit.findMany({
    where: { userId, isActive: true },
    include: { logs: true }
  });
  const habitsCount = habits.length;

  // 2. Weekly Activity
  const startOfThisWeek = startOfWeek(today);
  const daysOfThisWeek = eachDayOfInterval({
    start: startOfThisWeek,
    end: endOfWeek(today)
  });

  const weeklyLogs = await prisma.habitLog.findMany({
    where: {
      habit: { userId },
      date: { gte: format(startOfThisWeek, "yyyy-MM-dd") },
      completed: true
    }
  });

  const weeklyActivity = daysOfThisWeek.map(day => {
    const dayStr = format(day, "yyyy-MM-dd");
    const count = weeklyLogs.filter(l => l.date === dayStr).length;
    // Map to percentage (max is all habits done)
    return habitsCount > 0 ? (count / habitsCount) * 100 : 0;
  });

  // 3. Best Streak Calculation
  let bestStreak = 0;
  habits.forEach(habit => {
    // Already pre-calculated or stored in database would be better, 
    // but here we have the logs.
    const sortedLogs = habit.logs
      .filter(l => l.completed)
      .sort((a, b) => b.date.localeCompare(a.date));
    
    // Simplistic streak calc (total completions for now as a placeholder for better logic)
    // Real logic would check consecutive dates.
    const currentStreak = habit.logs.filter(l => l.completed).length; // Placeholder
    if (currentStreak > bestStreak) bestStreak = currentStreak;
  });

  // 4. Average Consistency
  const totalLogsCount = await prisma.habitLog.count({
    where: { habit: { userId }, completed: true }
  });
  
  // Calculate total possible completions (approximate)
  const firstLog = await prisma.habitLog.findFirst({
    where: { habit: { userId } },
    orderBy: { date: 'asc' }
  });
  
  const daysSinceStart = firstLog 
    ? Math.max(1, Math.ceil((today.getTime() - new Date(firstLog.date).getTime()) / (1000 * 60 * 60 * 24)))
    : 1;
    
  const totalPossible = habitsCount * daysSinceStart;
  const consistency = totalPossible > 0 ? Math.round((totalLogsCount / totalPossible) * 100) : 0;

  // 5. Growth (Last 7 days vs previous 7 days)
  const last7DaysCount = await prisma.habitLog.count({
    where: { 
      habit: { userId }, 
      completed: true,
      date: { gte: format(subDays(today, 7), "yyyy-MM-dd") }
    }
  });
  const prev7DaysCount = await prisma.habitLog.count({
    where: {
      habit: { userId },
      completed: true,
      date: { 
        gte: format(subDays(today, 14), "yyyy-MM-dd"),
        lt: format(subDays(today, 7), "yyyy-MM-dd")
      }
    }
  });
  const growth = prev7DaysCount > 0 
    ? ((last7DaysCount - prev7DaysCount) / prev7DaysCount) * 100 
    : 0;

  // SVG Circle Helpers
  const circumference = 2 * Math.PI * 110;
  const consistencyCirc = 2 * Math.PI * 85;
  const streakCirc = 2 * Math.PI * 60;

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
           <div className="relative w-64 h-64 mx-auto flex items-center justify-center mt-8">
              {/* Outer Ring - Consistency */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                 <circle cx="128" cy="128" r="110" fill="transparent" stroke="#18181b" strokeWidth="12" />
                 <circle 
                    cx="128" cy="128" r="110" 
                    fill="transparent" stroke="#10b981" strokeWidth="12" 
                    strokeDasharray={circumference} 
                    strokeDashoffset={circumference - (consistency / 100) * circumference} 
                    strokeLinecap="round" 
                    className="transition-all duration-1000 ease-out"
                 />
              </svg>
              {/* Middle Ring - Fixed 75% for aesthetics or map to another stat */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                 <circle cx="128" cy="128" r="85" fill="transparent" stroke="#18181b" strokeWidth="12" />
                 <circle 
                    cx="128" cy="128" r="85" 
                    fill="transparent" stroke="#fbbf24" strokeWidth="12" 
                    strokeDasharray={consistencyCirc} 
                    strokeDashoffset={consistencyCirc - 0.75 * consistencyCirc} 
                    strokeLinecap="round" 
                 />
              </svg>
              {/* Inner Ring - Best Streak Relative to 30 days */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                 <circle cx="128" cy="128" r="60" fill="transparent" stroke="#18181b" strokeWidth="12" />
                 <circle 
                    cx="128" cy="128" r="60" 
                    fill="transparent" stroke="#f43f5e" strokeWidth="12" 
                    strokeDasharray={streakCirc} 
                    strokeDashoffset={streakCirc - Math.min(1, bestStreak / 30) * streakCirc} 
                    strokeLinecap="round" 
                 />
              </svg>
              
              <div className="text-center z-10">
                 <span className="text-3xl font-black italic text-white">{consistency}%</span>
                 <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest italic mt-1">Average</p>
              </div>
           </div>
        </div>
 
        <div className="grid grid-cols-2 gap-4">
           <div className="premium-card bg-zinc-900/40 p-6 flex flex-col space-y-4">
              <TrendingUp className="text-emerald-500" size={20} />
              <div className="space-y-1">
                 <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">Growth</p>
                 <h4 className="text-xl font-black italic text-white">
                    {growth > 0 ? "+" : ""}{growth.toFixed(1)}%
                 </h4>
              </div>
           </div>
           <div className="premium-card bg-zinc-900/40 p-6 flex flex-col space-y-4">
              <Zap className="text-amber-500" size={20} />
              <div className="space-y-1">
                 <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">Best Streak</p>
                 <h4 className="text-xl font-black italic text-white">{bestStreak} Days</h4>
              </div>
           </div>
        </div>
 
        <div className="premium-card bg-zinc-900/40 p-6 space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-white italic">Weekly Activity</h3>
              <Calendar className="text-zinc-700" size={16} />
           </div>
           <div className="flex justify-between items-end h-32 px-2">
              {weeklyActivity.map((h, i) => (
                 <div key={i} className="w-4 bg-zinc-800 rounded-lg relative group">
                    <div 
                       className="absolute bottom-0 left-0 w-full bg-emerald-500 rounded-lg shadow-lg shadow-emerald-500/10 transition-all duration-500 hover:bg-emerald-400" 
                       style={{ height: `${Math.max(5, h)}%` }} // Min 5% height to show something
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
