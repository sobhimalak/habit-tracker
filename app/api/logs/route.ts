import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const { habitId, date, completed, notes, timeCompleted, missedReason } = await req.json();

    // Upsert logic: if log exists for this date and habit, update it, else create it.
    const log = await prisma.habitLog.upsert({
      where: {
        habitId_date: {
          habitId,
          date,
        }
      },
      update: {
        completed,
        notes: notes !== undefined ? notes : undefined,
        timeCompleted: timeCompleted !== undefined ? timeCompleted : undefined,
        missedReason: missedReason !== undefined ? missedReason : undefined,
      },
      create: {
        habitId,
        date,
        completed,
        notes,
        timeCompleted,
        missedReason,
      }
    });

    return NextResponse.json(log);
  } catch (error) {
    console.error("Error saving log:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
