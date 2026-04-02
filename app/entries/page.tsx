import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { Menu, Search, Check, X } from "lucide-react";
import Link from "next/link";

export default async function PastEntries() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const logs = await prisma.habitLog.findMany({
    where: {
      habit: { userId: session.user.id }
    },
    orderBy: { date: 'desc' },
    include: { habit: true },
    take: 20
  });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="pt-12 pb-6 flex items-center justify-between px-2">
        <div className="w-10" />
        <h1 className="text-xl font-bold tracking-tight">Past Entries</h1>
        <button className="text-muted-foreground hover:text-foreground">
          <Menu size={28} />
        </button>
      </header>

      <div className="space-y-6 flex-1">
        <div className="flex items-center justify-between px-2 mb-4">
          <div className="w-10" />
          <div className="w-10" />
          <button className="text-muted-foreground">
            <Search size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="premium-card flex items-center justify-between border border-zinc-800 rounded-xl p-4 bg-transparent">
              <div className="space-y-1">
                <h3 className="font-bold text-lg">{format(new Date(log.date), "MMMM dd, yyyy")}</h3>
                <p className="text-zinc-500 text-sm font-medium">at {log.timeCompleted || "--:--"}</p>
                <p className="text-zinc-400 text-xs">{log.habit.name}</p>
              </div>
              
              <div className="flex items-center">
                {log.completed ? (
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-green-500">
                    <Check size={24} strokeWidth={3} />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-red-500">
                    <X size={24} strokeWidth={3} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
