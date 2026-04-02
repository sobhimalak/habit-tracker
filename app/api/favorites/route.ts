export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { exerciseId } = await req.json();
    if (!exerciseId) return new NextResponse("Missing exerciseId", { status: 400 });

    const existing = await prisma.exerciseFavorite.findUnique({
      where: {
        userId_exerciseId: {
          userId: session.user.id,
          exerciseId
        }
      }
    });

    if (existing) {
      await prisma.exerciseFavorite.delete({
        where: { id: existing.id }
      });
      return NextResponse.json({ favorited: false });
    } else {
      await prisma.exerciseFavorite.create({
        data: {
          userId: session.user.id,
          exerciseId
        }
      });
      return NextResponse.json({ favorited: true });
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
