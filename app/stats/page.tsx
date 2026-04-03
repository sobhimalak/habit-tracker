import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ChevronLeft, TrendingUp, Calendar, Zap, Dumbbell, Target, Weight } from "lucide-react";
import Link from "next/link";
import { startOfWeek, endOfWeek, eachDayOfInterval, format, subDays, startOfYesterday, endOfYesterday } from "date-fns";

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
  const startOfLastWeek = startOfWeek(subDays(startOfThisWeek, 1));

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

  // 3. Performance Aggregation (New: Volume Evolution)
  const loggedExercises = await (prisma as any).habitLogExercise.findMany({
    where: {
      log: { habit: { userId } }
    },
    include: { exercise: true }
  });

  // Total Volume (Tonnage)
  const totalVolume = loggedExercises.reduce((acc: number, le: any) => {
    return acc + ((le.sets || 0) * (le.reps || 0) * (le.weight || 0));
  }, 0);

  // Weekly Volume Comparison
  const thisWeekExercises = loggedExercises.filter((le: any) => le.createdAt >= startOfThisWeek);
  const lastWeekExercises = loggedExercises.filter((le: any) => le.createdAt >= startOfLastWeek && le.createdAt < startOfThisWeek);

  const thisWeekVol = thisWeekExercises.reduce((acc: number, le: any) => acc + ((le.sets || 0) * (le.reps || 0) * (le.weight || 0)), 0);
  const lastWeekVol = lastWeekExercises.reduce((acc: number, le: any) => acc + ((le.sets || 0) * (le.reps || 0) * (le.weight || 0)), 0);

  const volumeGrowth = lastWeekVol > 0 ? Math.round(((thisWeekVol - lastWeekVol) / lastWeekVol) * 100) : 0;

  // 4. Muscle Focus
  const muscleFocus = MUSCLE_GROUPS.map(muscle => {
    const count = loggedExercises.filter((le: any) => le.exercise.muscleGroup === muscle).length;
    return { name: muscle, count };
  });

  const totalMovements = loggedExercises.length || 1;
  const muscleGroupsWithPercentage = muscleFocus.map(m => ({
    ...m,
    percentage: Math.min(100, (m.count / (totalMovements / 2)) * 100)
  })).sort((a, b) => b.count - a.count);

  // 5. Top Exercises
  const exerciseCounts: Record<string, { name: string, count: number }> = {};
  loggedExercises.forEach((le: any) => {
    if (!exerciseCounts[le.exerciseId]) {
      exerciseCounts[le.exerciseId] = { name: le.exercise.name, count: 0 };
    }
    exerciseCounts[le.exerciseId].count += 1;
  });
  const topMovements = Object.values(exerciseCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // 6. Overall Consistency
  const totalLogs30Days = await prisma.habitLog.count({
    where: { habit: { userId }, completed: true, date: { gte: format(subDays(today, 30), "yyyy-MM-dd") } }
  });
  const totalPossible30Days = habitsCount * 30;
  const consistency = totalPossible30Days > 0 ? Math.round((totalLogs30Days / totalPossible30Days) * 100) : 0;

  // SVG Circle Helpers
  const circumference = 2 * Math.PI * 110;
  const consistencyCirc = 2 * Math.PI * 85;
  const fitnessCirc = 2 * Math.PI * 60;

  const daysWithWorkouts = new Set(loggedExercises.map((le: any) => le.logId)).size;
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
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic mt-1">Consistency</p>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="premium-card bg-[#111113] p-6 flex flex-col space-y-4 shadow-2xl shadow-black/40">
            <Weight className="text-emerald-500" size={20} />
            <div className="space-y-1">
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">Total Tonnage</p>
              <h4 className="text-xl font-black italic text-white uppercase">{(totalVolume / 1000).toFixed(1)}T</h4>
              {volumeGrowth !== 0 && (
                <p className={`text-[8px] font-black uppercase tracking-widest ${volumeGrowth > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {volumeGrowth > 0 ? '↑' : '↓'} {Math.abs(volumeGrowth)}% <span className="text-zinc-700">vs last week</span>
                </p>
              )}
            </div>
          </div>
          <div className="premium-card bg-[#111113] p-6 flex flex-col space-y-4 shadow-2xl shadow-black/40">
            <Dumbbell className="text-rose-500" size={20} />
            <div className="space-y-1">
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">Workouts</p>
              <h4 className="text-xl font-black italic text-white uppercase">{daysWithWorkouts}</h4>
              <p className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">Active Sessions</p>
            </div>
          </div>
        </div>

        {/* Muscle Group Focus */}
        <div className="premium-card bg-[#111113] p-8 space-y-8 shadow-2xl shadow-black/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target size={14} className="text-emerald-500" />
              <h3 className="text-xs font-black uppercase tracking-widest text-white italic">Muscle Focus</h3>
            </div>
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

        {/* Activity Stream */}
        <div className="premium-card bg-[#111113] p-8 space-y-8 shadow-2xl shadow-black/40">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-white italic">Activity Stream</h3>
            <Calendar className="text-zinc-700" size={16} />
          </div>
          <div className="flex justify-between items-end h-32 px-2 gap-4">
            {weeklyActivity.map((h, i) => (
              <div key={i} className="flex-1 bg-zinc-950 rounded-xl relative group h-full overflow-hidden">
                <div
                  className="absolute bottom-0 left-0 w-full bg-emerald-500 shadow-lg shadow-emerald-500/10 transition-all duration-500 hover:bg-emerald-400"
                  style={{ height: `${Math.max(2, h)}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[8px] font-black text-zinc-800 uppercase tracking-widest px-2 italic">
            <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
          </div>
        </div>
      </main>
    </div>
  );
}
