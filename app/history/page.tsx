import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ChevronLeft, Calendar } from "lucide-react";
import Link from "next/link";

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Fetch real logs with habit info, newest first
  const logs = await prisma.habitLog.findMany({
    where: { habit: { userId: session.user.id } },
    orderBy: { date: "desc" },
    take: 200,
    include: { habit: { select: { name: true, icon: true, color: true } } },
  });

  // Group logs by date string
  const grouped: Record<string, typeof logs> = {};
  for (const log of logs) {
    if (!grouped[log.date]) grouped[log.date] = [];
    grouped[log.date].push(log);
  }
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 px-6 py-12 animate-slide-up pb-36 max-w-md mx-auto w-full">
      <header className="flex items-center justify-between mb-10 px-2">
        <Link href="/" className="text-zinc-500 hover:text-zinc-300 transition-colors">
          <ChevronLeft size={28} />
        </Link>
        <h1 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500 italic">History</h1>
        <div className="w-7" />
      </header>

      <main className="flex-1 space-y-10">
        <div className="space-y-2">
          <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase">Journal</h2>
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] pl-1 italic">Review your consistency</p>
        </div>

        {sortedDates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-6">
            <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-3xl flex items-center justify-center">
              <Calendar size={28} className="text-zinc-700" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-[11px] font-black text-zinc-600 uppercase tracking-widest italic">No history yet</p>
              <p className="text-[10px] text-zinc-700 italic">Start logging your habits and your journey will appear here</p>
            </div>
            <Link href="/" className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic hover:text-emerald-400 transition-colors">
              Go to Today →
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedDates.map((date) => {
              const dayLogs = grouped[date];
              const done   = dayLogs.filter(l => l.completed).length;
              const missed = dayLogs.filter(l => !l.completed && l.missedReason !== "REST").length;
              const rest   = dayLogs.filter(l => l.missedReason === "REST").length;
              const total  = dayLogs.length;

              const borderColor = done === total
                ? "border-l-emerald-500"
                : missed > 0
                  ? "border-l-rose-500"
                  : "border-l-blue-500";

              return (
                <div
                  key={date}
                  className={`bg-zinc-900/40 border border-zinc-800/60 border-l-4 ${borderColor} rounded-3xl p-5 space-y-4`}
                >
                  {/* Date header */}
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black text-white italic">
                      {format(new Date(date + "T00:00:00"), "EEEE, MMMM do")}
                    </p>
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest italic">
                      {done}/{total} done
                    </p>
                  </div>

                  {/* Individual habits */}
                  <div className="space-y-2">
                    {dayLogs.map((log) => {
                      const isRest   = log.missedReason === "REST";
                      const isDone   = log.completed;
                      const isMissed = !log.completed && !isRest;

                      return (
                        <div key={log.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {log.habit.icon && <span className="text-base">{log.habit.icon}</span>}
                            <span className={`text-xs font-black italic tracking-tight ${
                              isDone ? "text-emerald-400" : isMissed ? "text-rose-400" : "text-blue-400"
                            }`}>
                              {log.habit.name}
                            </span>
                          </div>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                            isDone
                              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                              : isMissed
                                ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                                : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          }`}>
                            {isDone ? "DONE" : isRest ? "REST" : "MISS"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
