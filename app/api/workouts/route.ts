export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { syncExercisesToDB } from "@/lib/db-sync";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const templates = await prisma.workoutTemplate.findMany({
      where: { userId: session.user.id },
      include: {
        exercises: {
          orderBy: { order: 'asc' },
          include: { exercise: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    // Sync database with JSON before creating relations
    await syncExercisesToDB();

    const body = await req.json();
    const { name, exerciseIds } = body;

    if (!name || !exerciseIds || !Array.isArray(exerciseIds)) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const template = await prisma.workoutTemplate.create({
      data: {
        name,
        userId: session.user.id,
        exercises: {
          create: exerciseIds.map((id: string, index: number) => ({
            exerciseId: id,
            order: index
          }))
        }
      }
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error creating template:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
