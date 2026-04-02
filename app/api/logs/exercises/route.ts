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
    const { logId, exerciseIds, templateId, exercisesData } = body;

    if (!logId) return new NextResponse("Missing logId", { status: 400 });

    // Handle template cloning if templateId is provided
    let finalExercises: any[] = [];

    if (exercisesData && Array.isArray(exercisesData)) {
      // New way: full movement data
      finalExercises = exercisesData.map((ex: any, index: number) => ({
        logId,
        exerciseId: ex.exerciseId,
        order: index,
        completed: ex.completed ?? false,
        sets: ex.sets ? parseInt(ex.sets as string) : null,
        reps: ex.reps ? parseInt(ex.reps as string) : null,
        weight: ex.weight ? parseFloat(ex.weight as string) : null,
        notes: ex.notes || null,
      }));
    } else if (templateId) {
      // Template way
      const template = await (prisma as any).workoutTemplate.findUnique({
        where: { id: templateId },
        include: { exercises: true }
      });
      if (template) {
        finalExercises = template.exercises
          .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
          .map((e: any, index: number) => ({
            logId,
            exerciseId: e.exerciseId,
            order: index
          }));
      }
    } else if (exerciseIds) {
      // Old way: string ids
      finalExercises = exerciseIds.map((id: string, index: number) => ({
        logId,
        exerciseId: id,
        order: index
      }));
    }

    // Clear existing logged exercises for this log
    await (prisma as any).habitLogExercise.deleteMany({
      where: { logId }
    });

    // Create new ones
    if (finalExercises.length > 0) {
      const created = await (prisma as any).habitLogExercise.createMany({
        data: finalExercises
      });
      return NextResponse.json(created);
    }

    return NextResponse.json({ count: 0 });
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

    const logged = await (prisma as any).habitLogExercise.findMany({
      where: { logId },
      include: { exercise: true },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(logged.map((l: any) => ({ 
      ...l.exercise, 
      completed: l.completed, 
      logExerciseId: l.id,
      sets: l.sets,
      reps: l.reps,
      weight: l.weight,
      notes: l.notes
    })));
  } catch (error) {
    console.error("Error fetching logged exercises:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
