export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase() || "";
    const muscle = searchParams.get("muscle") || "";

    // Load static exercises from JSON
    const jsonPath = path.join(process.cwd(), "data", "exercises.json");
    const jsonContent = fs.readFileSync(jsonPath, "utf8");
    const builtInExercises = JSON.parse(jsonContent).map((ex: any, index: number) => ({
      ...ex,
      id: `builtin-${index}`,
      isCustom: false,
    }));

    // Load custom exercises from DB
    const customExercises = session?.user?.id ? await prisma.exercise.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          { userId: null } // Just in case some are added globally
        ]
      }
    }) : [];

    let allExercises = [...builtInExercises, ...customExercises];

    // Filter by search and muscle
    if (search) {
      allExercises = allExercises.filter(ex => 
        ex.name.toLowerCase().includes(search) || 
        ex.muscleGroup.toLowerCase().includes(search)
      );
    }
    if (muscle && muscle !== "All") {
      allExercises = allExercises.filter(ex => ex.muscleGroup === muscle);
    }

    // If logged in, get favorite IDs
    let favoriteIds: string[] = [];
    if (session?.user?.id) {
      const favorites = await prisma.exerciseFavorite.findMany({
        where: { userId: session.user.id },
        select: { exerciseId: true }
      });
      favoriteIds = favorites.map(f => f.exerciseId);
    }

    // Attach favorite status
    const exercisesWithFavorites = allExercises.map(ex => ({
      ...ex,
      isFavorite: favoriteIds.includes(ex.id)
    }));

    return NextResponse.json(exercisesWithFavorites);
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { name, muscleGroup, equipment, instructions } = body;

    if (!name || !muscleGroup) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const exercise = await prisma.exercise.create({
      data: {
        name,
        muscleGroup,
        equipment,
        instructions,
        isCustom: true,
        userId: session.user.id
      }
    });

    return NextResponse.json(exercise);
  } catch (error) {
    console.error("Error creating exercise:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
