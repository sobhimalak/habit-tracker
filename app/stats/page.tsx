import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ChevronLeft, TrendingUp, Calendar, Zap, Dumbbell, Target } from "lucide-react";
import Link from "next/link";
import { startOfWeek, endOfWeek, eachDayOfInterval, format, subDays } from "date-fns";

const MUSCLE_GROUPS = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"];

export default async function StatsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const userId = session.user.id;
  const today = new Date();

  // 1. Basic Counts
  const habits = await prisma.habit.findMany({
    where: { userId, isActive: true },
    include: { logs: { where: { completed: true } } }
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
    return habitsCount > 0 ? (count / habitsCount) * 100 : 0;
  });

  // 3. Muscle Focus Aggregation
  const loggedExercises = await prisma.habitLogExercise.findMany({
    where: {
      log: { habit: { userId } }
    },
    include: { exercise: true }
  });

  const muscleFocus = MUSCLE_GROUPS.map(muscle => {
    const count = loggedExercises.filter(le => le.exercise.muscleGroup === muscle).length;
    return { name: muscle, count };
  });

  const totalMovements = loggedExercises.length || 1;
  const muscleGroupsWithPercentage = muscleFocus.map(m => ({
    ...m,
    percentage: Math.min(100, (m.count / (totalMovements / 2)) * 100) // Weighted relative to variety
  })).sort((a, b) => b.count - a.count);

  // 4. Top Exercises
  const exerciseCounts: Record<string, { name: string, count: number }> = {};
  loggedExercises.forEach(le => {
    if (!exerciseCounts[le.exerciseId]) {
      exerciseCounts[le.exerciseId] = { name: le.exercise.name, count: 0 };
    }
    exerciseCounts[le.exerciseId].count += 1;
  });
  const topMovements = Object.values(exerciseCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // 5. Overall Consistency (Average over last 30 days)
  const totalLogs30Days = await prisma.habitLog.count({
    where: { habit: { userId }, completed: true, date: { gte: format(subDays(today, 30), "yyyy-MM-dd") } }
  });
  const totalPossible30Days = habitsCount * 30;
  const consistency = totalPossible30Days > 0 ? Math.round((totalLogs30Days / totalPossible30Days) * 100) : 0;

  // SVG Circle Helpers
  const circumference = 2 * Math.PI * 110;
  const consistencyCirc = 2 * Math.PI * 85;
  const fitnessCirc = 2 * Math.PI * 60;
  
  // Fitness consistency (% of days with at least one exercise logged)
  const daysWithWorkouts = new Set(loggedExercises.map(le => le.logId)).size;
  const fitnessConsistency = Math.min(100, (daysWithWorkouts / 30) * 100);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 px-8 py-12 animate-slide-up pb-32 max-w-md mx-auto w-full">
      <header className="flex items-center justify-between mb-16">
        <Link href="/" className="text-zinc-500 hover:text-zinc-300 transition-colors">
          <ChevronLeft size={28} />
        </Link>
        <h1 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500 italic">Evolution</h1>
        <div className="w-7" />
      </header>
 
      <main className="flex-1 space-y-16">
        {/* Consistency Aura */}
        <div className="space-y-4 text-center">
          <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="128" cy="128" r="110" fill="transparent" stroke="#18181b" strokeWidth="12" />
              <circle cx="128" cy="128" r="110" fill="transparent" stroke="#10b981" strokeWidth="12" strokeDasharray={circumference} strokeDashoffset={circumference - (consistency / 100) * circumference} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
            </svg>
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="128" cy="128" r="85" fill="transparent" stroke="#18181b" strokeWidth="12" />
              <circle cx="128" cy="128" r="85" fill="transparent" stroke="#fbbf24" strokeWidth="12" strokeDasharray={consistencyCirc} strokeDashoffset={consistencyCirc - 0.75 * consistencyCirc} strokeLinecap="round" />
            </svg>
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="128" cy="128" r="60" fill="transparent" stroke="#18181b" strokeWidth="12" />
              <circle cx="128" cy="128" r="60" fill="transparent" stroke="#f43f5e" strokeWidth="12" strokeDasharray={fitnessCirc} strokeDashoffset={fitnessCirc - (fitnessConsistency / 100) * fitnessCirc} strokeLinecap="round" />
            </svg>
            <div className="text-center z-10">
              <span className="text-3xl font-black italic text-white leading-none">{consistency}%</span>
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic mt-1">Average</p>
            </div>
          </div>
        </div>

        {/* Rapid Status Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="premium-card bg-[#111113] p-6 flex flex-col space-y-4 shadow-2xl shadow-black/40">
            <TrendingUp className="text-emerald-500" size={20} />
            <div className="space-y-1">
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">Habit Score</p>
              <h4 className="text-xl font-black italic text-white uppercase">{consistency}</h4>
            </div>
          </div>
          <div className="premium-card bg-[#111113] p-6 flex flex-col space-y-4 shadow-2xl shadow-black/40">
            <Dumbbell className="text-rose-500" size={20} />
            <div className="space-y-1">
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">Workouts</p>
              <h4 className="text-xl font-black italic text-white uppercase">{daysWithWorkouts} Sessions</h4>
            </div>
          </div>
        </div>

        {/* Muscle Group Focus (New) */}
        <div className="premium-card bg-[#111113] p-8 space-y-8 shadow-2xl shadow-black/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target size={14} className="text-emerald-500" />
              <h3 className="text-xs font-black uppercase tracking-widest text-white italic">Muscle Focus</h3>
            </div>
            <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest italic">Last 30 Days</span>
          </div>

          <div className="space-y-6">
            {muscleGroupsWithPercentage.map((muscle) => (
              <div key={muscle.name} className="space-y-2">
                <div className="flex justify-between text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">
                  <span>{muscle.name}</span>
                  <span className="text-zinc-700">{muscle.count} logged</span>
                </div>
                <div className="h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all duration-1000"
                    style={{ width: `${Math.max(5, muscle.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Movements Section (New) */}
        <div className="space-y-6 px-1">
          <div className="flex items-center space-x-3">
            <Zap size={14} className="text-amber-500" />
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">Most Performed</h3>
          </div>
          
          <div className="space-y-4">
            {topMovements.map((move, idx) => (
              <div key={idx} className="flex items-center justify-between p-5 bg-zinc-900/30 border border-zinc-900 rounded-[2rem] hover:border-emerald-500/20 transition-all active:scale-[0.98]">
                <div className="flex items-center space-x-4">
                  <div className="text-xl font-black italic opacity-20 text-zinc-500">0{idx + 1}</div>
                  <h4 className="text-xs font-black text-white uppercase italic tracking-wider leading-none">{move.name}</h4>
                </div>
                <div className="px-3 py-1 bg-zinc-950 rounded-full border border-zinc-800 text-[8px] font-black text-zinc-600 uppercase tracking-widest italic">
                  {move.count}x
                </div>
              </div>
            ))}
            {topMovements.length === 0 && (
               <div className="p-8 bg-zinc-900/10 border border-dashed border-zinc-900 rounded-[2rem] text-center">
                  <p className="text-[9px] font-black text-zinc-800 uppercase tracking-widest italic">No exercise data recorded yet.</p>
               </div>
            )}
          </div>
        </div>

        {/* Weekly Evolution (Refined) */}
        <div className="premium-card bg-[#111113] p-8 space-y-8 shadow-2xl shadow-black/40">
           <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-white italic">Activity Stream</h3>
              <Calendar className="text-zinc-700" size={16} />
           </div>
           <div className="flex justify-between items-end h-32 px-2 gap-4">
              {weeklyActivity.map((h, i) => (
                 <div key={i} className="flex-1 bg-zinc-950 rounded-xl relative group h-full">
                    <div 
                       className="absolute bottom-0 left-0 w-full bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/10 transition-all duration-500 hover:bg-emerald-400" 
                       style={{ height: `${Math.max(5, h)}%` }}
                    />
                 </div>
              ))}
           </div>
           <div className="flex justify-between text-[8px] font-black text-zinc-800 uppercase tracking-widest px-2 italic">
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
