import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format, subDays } from "date-fns";
import { ChevronLeft, Menu, Check, X } from "lucide-react";

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Generate last 7 days including today
  const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i));
  
  const habits = await prisma.habit.findMany({
    where: { userId: session.user.id, isActive: true },
    include: {
      logs: {
        where: {
          date: {
            in: last7Days.map(d => format(d, "yyyy-MM-dd"))
          }
        }
      }
    }
  });

  return (
    <div className="flex flex-col min-h-screen bg-background pb-32">
      <header className="px-6 pt-12 pb-4 flex items-center justify-between">
        <div className="w-10 h-10 flex items-center justify-start text-muted-foreground">
          <ChevronLeft size={24} />
        </div>
        <h1 className="text-xl font-bold tracking-tight">Past Entries</h1>
        <div className="w-10 h-10 flex items-center justify-end text-muted-foreground">
          <Menu size={24} />
        </div>
      </header>

      <div className="px-6 py-4 space-y-4">
        {last7Days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const displayDay = format(day, "eee, MMM d");
          
          return (
            <div key={dateStr} className="premium-card p-4 flex items-center justify-between">
              <span className="font-bold text-foreground">{displayDay}</span>
              <div className="flex space-x-2">
                {habits.map((habit) => {
                  const log = habit.logs.find(l => l.date === dateStr);
                  const isCompleted = log?.completed === true;
                  const isMissed = log?.completed === false;

                  return (
                    <div 
                      key={habit.id} 
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                        isCompleted ? "bg-success/20 text-success" : 
                        isMissed ? "bg-destructive/20 text-destructive" : 
                        "bg-secondary/50 text-muted-foreground/30"
                      }`}
                    >
                      {isCompleted ? <Check size={16} strokeWidth={3} /> : 
                       isMissed ? <X size={16} strokeWidth={3} /> : 
                       <span className="text-[10px]">•</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
