import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET a single habit (for the edit page)
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = params;
    const habit = await prisma.habit.findUnique({ where: { id } });

    if (!habit || habit.userId !== session.user.id) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json(habit);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// PATCH — update name, icon, color, or isActive
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = params;
    const body = await req.json();

    const habit = await prisma.habit.findUnique({ where: { id } });
    if (!habit || habit.userId !== session.user.id) {
      return new NextResponse("Not Found / Unauthorized", { status: 404 });
    }

    const updated = await prisma.habit.update({
      where: { id },
      data: {
        ...(body.name      !== undefined && { name:     body.name }),
        ...(body.icon      !== undefined && { icon:     body.icon }),
        ...(body.color     !== undefined && { color:    body.color }),
        ...(body.isActive  !== undefined && { isActive: body.isActive }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// DELETE a habit
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = params;
    const habit = await prisma.habit.findUnique({ where: { id } });
    if (!habit || habit.userId !== session.user.id) {
      return new NextResponse("Not Found / Unauthorized", { status: 404 });
    }

    await prisma.habit.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
