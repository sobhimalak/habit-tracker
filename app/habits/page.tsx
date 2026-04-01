import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Settings, Trash2, Power } from "lucide-react";
import Link from "next/link";
import HabitManagerClient from "@/components/HabitManagerClient";

export default async function Habits() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const habits = await prisma.habit.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      challenges: true
    }
  });

  return (
    <div className="p-4 pt-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Habits</h1>
          <p className="text-muted-foreground mt-1">Manage your routines</p>
        </div>
        <Link href="/add" className="bg-secondary text-foreground px-4 py-2 rounded-xl text-sm font-medium active:scale-95 transition-transform">
          + Add
        </Link>
      </header>
      
      <div className="space-y-4">
        {habits.length === 0 ? (
           <p className="text-muted-foreground text-center py-12">No habits found. Create one to get started.</p>
        ) : (
          <HabitManagerClient habits={habits} />
        )}
      </div>
    </div>
  );
}
