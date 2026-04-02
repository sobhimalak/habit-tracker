export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { logId, exerciseIds, templateId } = body;

    if (!logId) return new NextResponse("Missing logId", { status: 400 });

    // Handle template cloning if templateId is provided
    let finalExerciseIds = exerciseIds || [];
    if (templateId) {
      const template = await prisma.workoutTemplate.findUnique({
        where: { id: templateId },
        include: { exercises: true }
      });
      if (template) {
        finalExerciseIds = template.exercises
          .sort((a, b) => a.order - b.order)
          .map(e => e.exerciseId);
      }
    }

    // Clear existing logged exercises for this log
    await prisma.habitLogExercise.deleteMany({
      where: { logId }
    });

    // Create new ones
    const created = await prisma.habitLogExercise.createMany({
      data: finalExerciseIds.map((id: string, index: number) => ({
        logId,
        exerciseId: id,
        order: index
      }))
    });

    return NextResponse.json(created);
  } catch (error) {
    console.error("Error logging workout exercises:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const logId = searchParams.get("logId");

    if (!logId) return new NextResponse("Missing logId", { status: 400 });

    const logged = await prisma.habitLogExercise.findMany({
      where: { logId },
      include: { exercise: true },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(logged.map(l => ({ ...l.exercise, completed: l.completed, logExerciseId: l.id })));
  } catch (error) {
    console.error("Error fetching logged exercises:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
