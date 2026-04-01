import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const { name, icon, color, type, isChallenge, challengeGoal, challengeStart } = await req.json();

    const habit = await prisma.habit.create({
      data: {
        userId: session.user.id,
        name,
        icon,
        color,
        type: type || "daily",
      }
    });

    if (isChallenge && challengeGoal) {
      await prisma.challenge.create({
        data: {
          habitId: habit.id,
          title: `${name} Challenge`,
          goalDays: parseInt(challengeGoal),
          startDate: challengeStart || new Date().toISOString().split('T')[0],
        }
      });
    }

    return NextResponse.json(habit);
  } catch (error) {
    console.error("Error creating habit:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const habits = await prisma.habit.findMany({
      where: { userId: session.user.id },
      include: { challenges: true }
    });

    return NextResponse.json(habits);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
