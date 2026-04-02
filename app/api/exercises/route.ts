export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

import { syncExercisesToDB } from "@/lib/db-sync";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase() || "";
    const muscle = searchParams.get("muscle") || "";

    // IMPORTANT: Sync with JSON to ensure DB has all builtin IDs
    await syncExercisesToDB();

    // Now fetch everything from the DB
    let allExercises = await prisma.exercise.findMany({
      where: {
        OR: [
          { userId: session?.user?.id || null }, // User's custom or global built-ins
          { isCustom: false } // Built-ins
        ]
      }
    });

    // Filter by search and muscle
    if (search) {
      allExercises = allExercises.filter((ex: any) => 
        ex.name.toLowerCase().includes(search) || 
        ex.muscleGroup.toLowerCase().includes(search)
      );
    }
    if (muscle && muscle !== "All") {
      allExercises = allExercises.filter((ex: any) => ex.muscleGroup === muscle);
    }

    // If logged in, get favorite IDs
    let favoriteIds: string[] = [];
    if (session?.user?.id) {
      const favorites = await prisma.exerciseFavorite.findMany({
        where: { userId: session.user.id },
        select: { exerciseId: true }
      });
      favoriteIds = favorites.map((f: any) => f.exerciseId);
    }

    // Attach favorite status
    const exercisesWithFavorites = allExercises.map((ex: any) => ({
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
