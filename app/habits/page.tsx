import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import HabitManagerClient from "@/components/HabitManagerClient";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function HabitsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const rawHabits = await prisma.habit.findMany({
    where: {
      userId: session.user.id,
      isActive: true
    },
    include: {
      logs: {
        where: { completed: true },
        take: 100 // for streak calculation
      }
    }
  });

  const habits = (rawHabits as any[]).map(h => ({
    id: h.id,
    name: h.name,
    streak: h.logs?.length || 0,
    goalValue: h.goalValue || 1,
    goalUnit: h.goalUnit || "times",
    reminderTime: h.reminderTime || undefined,
    icon: h.icon || "✨"
  }));

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 px-8 py-12 animate-slide-up pb-32 max-w-md mx-auto w-full">
      <header className="flex items-center justify-between mb-5">
        <Link href="/" className="text-zinc-500 hover:text-zinc-300 transition-colors">
          <ChevronLeft size={28} />
        </Link>
        <h1 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500 italic">Manage Habits</h1>
        <div className="w-7" />
      </header>

      <main className="flex-1 space-y-12">
        <div className="space-y-4">
          <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase">Your Journey</h2>
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] pl-1 italic">Active goals and streaks</p>
        </div>

        <HabitManagerClient habits={habits} />
      </main>
    </div>
  );
}
