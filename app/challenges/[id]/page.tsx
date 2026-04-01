import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format, differenceInDays } from "date-fns";
import { ChevronLeft, Menu, Calendar } from "lucide-react";
import Link from "next/link";

export default async function ChallengeTracker({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const challenge = await prisma.challenge.findUnique({
    where: { id: params.id },
    include: {
      habit: {
        include: {
          logs: true
        }
      }
    }
  });

  if (!challenge || challenge.habit.userId !== session.user.id) {
    notFound();
  }

  const startDate = new Date(challenge.startDate);
  const totalDays = challenge.goalDays;
  const daysPassed = differenceInDays(new Date(), startDate);
  const daysCompleted = challenge.habit.logs.filter(l => l.completed && new Date(l.date) >= startDate).length;
  const daysLeft = Math.max(0, totalDays - daysPassed);
  const progressPercent = Math.min(100, Math.round((daysCompleted / totalDays) * 100));

  const endDay = new Date(startDate);
  endDay.setDate(endDay.getDate() + totalDays);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="pt-12 pb-6 flex items-center justify-between px-2">
        <Link href="/" className="text-muted-foreground hover:text-foreground">
          <ChevronLeft size={28} />
        </Link>
        <button className="text-muted-foreground hover:text-foreground">
          <Menu size={28} />
        </button>
      </header>

      <div className="space-y-8 flex-1">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">{challenge.title}</h1>
        </div>

        <div className="premium-card space-y-6 border border-zinc-800 rounded-xl p-6 bg-transparent">
          <div className="flex justify-between text-xs font-bold text-zinc-500 uppercase tracking-widest">
            <span>Days Completed: {daysCompleted}</span>
            <span>Days Left: {daysLeft}</span>
          </div>

          <div className="h-6 bg-[#27272a] rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-1000 ease-out" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex justify-between items-end">
            <div className="text-4xl font-bold tracking-tight">{daysCompleted} / {totalDays}</div>
            <div className="text-zinc-500 font-bold text-sm mb-1">
              {format(startDate, "MMM d")} - {format(endDay, "MMM d")}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button className="btn-secondary w-full">
            Reset Challenge
          </button>
          <Link href={`/challenges/edit/${challenge.id}`} className="btn-secondary w-full flex items-center justify-center">
            Edit Challenge
          </Link>
        </div>
      </div>
    </div>
  );
}
