import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ChevronLeft, X, MessageSquare, Clock } from "lucide-react";
import Link from "next/link";
import LogDetailClient from "@/components/LogDetailClient";

export default async function LogDetail({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const habit = await prisma.habit.findUnique({
    where: { id: params.id },
    include: {
      logs: {
        where: {
          date: new Date().toISOString().split('T')[0]
        }
      }
    }
  });

  if (!habit) {
    redirect("/");
  }

  const todayLog = habit.logs[0] || null;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 px-8 pb-24 animate-slide-up">
      <header className="pt-16 pb-12 flex items-center justify-between">
        <Link href="/" className="text-zinc-500 hover:text-zinc-300 transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Log Details</h2>
        <div className="w-6" /> {/* Spacer */}
      </header>

      <main className="flex-1 space-y-12">
        <div className="space-y-2 text-center">
           <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <span className="text-4xl">{habit.icon || "✨"}</span>
           </div>
           <h1 className="text-3xl font-black italic uppercase tracking-tight text-white">{habit.name}</h1>
           <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Status: {todayLog?.completed ? 'Completed' : 'Pending'}</p>
        </div>

        <LogDetailClient habit={habit} initialLog={todayLog} />
      </main>
    </div>
  );
}
