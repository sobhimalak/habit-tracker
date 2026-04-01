import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import HabitListClient from "@/components/HabitListClient";
import { Menu, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const dayName = format(new Date(), "EEEE");
  const displayDate = format(new Date(), "MMMM do");

  // Fetch active habits
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

  const activeChallenge = habitsWithLogs.find(h => h.challenges.length > 0)?.challenges[0];
  let challengeSummary = null;

  if (activeChallenge) {
    const start = new Date(activeChallenge.startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const daysLeft = Math.max(0, activeChallenge.goalDays - diffDays);
    
    challengeSummary = {
      title: activeChallenge.title,
      daysLeft,
      goalDays: activeChallenge.goalDays
    };
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="pt-12 pb-6 flex items-center justify-between px-2">
        <button className="text-muted-foreground hover:text-foreground">
          <ChevronLeft size={28} />
        </button>
        <button className="text-muted-foreground hover:text-foreground">
          <Menu size={28} />
        </button>
      </header>

      <div className="space-y-8 flex-1">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Today is {dayName}</h1>
        </div>

        {challengeSummary && (
          <Link href={`/challenges/${activeChallenge?.id}`} className="premium-card block bg-transparent text-center py-4 border border-zinc-800 rounded-xl">
            <span className="font-medium text-foreground">{challengeSummary.title}: {challengeSummary.daysLeft} days left.</span>
          </Link>
        )}

        <section className="flex-1">
          {habitsWithLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <p className="text-muted-foreground">No habits yet.</p>
              <Link href="/add" className="btn-primary flex items-center justify-center">
                Add a Habit
              </Link>
            </div>
          ) : (
            <HabitListClient habits={habitsWithLogs} dateStr={todayStr} />
          )}
        </section>

        <div className="pb-12">
          <button className="btn-primary w-full">
            Add Note
          </button>
        </div>
      </div>
    </div>
  );
}

