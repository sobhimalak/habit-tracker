export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = params;

    let exercise: any = null;

    if (id.startsWith("builtin-")) {
      const index = parseInt(id.replace("builtin-", ""));
      const jsonPath = path.join(process.cwd(), "data", "exercises.json");
      const jsonContent = fs.readFileSync(jsonPath, "utf8");
      const builtInExercises = JSON.parse(jsonContent);
      if (builtInExercises[index]) {
        exercise = { ...builtInExercises[index], id, isCustom: false };
      }
    } else {
      exercise = await prisma.exercise.findUnique({
        where: { id }
      });
    }

    if (!exercise) return new NextResponse("Not Found", { status: 404 });

    // Check if favorited
    let isFavorite = false;
    if (session?.user?.id) {
      const favorite = await prisma.exerciseFavorite.findUnique({
        where: {
          userId_exerciseId: {
            userId: session.user.id,
            exerciseId: id
          }
        }
      });
      isFavorite = !!favorite;
    }

    return NextResponse.json({ ...exercise, isFavorite });
  } catch (error) {
    console.error("Error fetching exercise detail:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = params;
    if (id.startsWith("builtin-")) return new NextResponse("Cannot delete built-in exercise", { status: 400 });

    const exercise = await prisma.exercise.findUnique({ where: { id } });
    if (!exercise || exercise.userId !== session.user.id) {
      return new NextResponse("Not Found", { status: 404 });
    }

    await prisma.exercise.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting exercise:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
