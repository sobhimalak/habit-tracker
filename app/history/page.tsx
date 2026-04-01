import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from "date-fns";
import { ChevronLeft, Calendar } from "lucide-react";
import Link from "next/link";
 
export default async function HistoryPage() {
  const session = await getServerSession(authOptions);
 
  if (!session) {
    redirect("/login");
  }
 
  const today = new Date();
  const logs = await prisma.habitLog.findMany({
    where: { habit: { userId: session.user.id } },
    orderBy: { date: "desc" },
    take: 100
  });

  // Group by month (simplified)
  const months = ["September", "August", "July"];

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 px-8 py-12 animate-slide-up pb-32 max-w-md mx-auto w-full">
      <header className="flex items-center justify-between mb-16 px-2">
        <Link href="/" className="text-zinc-500 hover:text-zinc-300 transition-colors">
          <ChevronLeft size={28} />
        </Link>
        <h1 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500 italic">History</h1>
        <div className="w-7" />
      </header>
 
      <main className="flex-1 space-y-12">
        <div className="space-y-4">
          <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase">Journal</h2>
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] pl-1 italic">Review your consistency</p>
        </div>

        {months.map((month, i) => (
           <div key={month} className="space-y-6">
              <div className="flex items-center space-x-4">
                 <span className="text-xs font-black uppercase tracking-[0.2em] text-white italic">{month} 2022</span>
                 <div className="h-[1px] bg-zinc-900 flex-1" />
              </div>

              <div className="space-y-4">
                 {[1, 2, 3].map(day => (
                    <div key={day} className="premium-card bg-zinc-900/30 p-5 flex items-center justify-between border-l-4 border-l-emerald-500">
                       <div className="space-y-1">
                          <p className="text-xs font-black text-white italic">{month} {25 - (i * 5) - day}, 2022</p>
                          <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest italic">8 Habits Tracked</p>
                       </div>
                       <div className="flex items-center -space-x-2">
                          {[1, 2, 3, 4].map(dot => (
                             <div key={dot} className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-zinc-950 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                             </div>
                          ))}
                          <div className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-zinc-950 flex items-center justify-center ml-2">
                             <span className="text-[8px] font-black text-zinc-500">+4</span>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        ))}
      </main>
    </div>
  );
}
