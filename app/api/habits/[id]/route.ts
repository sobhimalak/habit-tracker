import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, context: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await context.params;
    const body = await req.json();

    const habit = await prisma.habit.findUnique({ where: { id } });
    if (!habit || habit.userId !== session.user.id) {
      return new NextResponse("Not Found / Unauthorized", { status: 404 });
    }

    const updated = await prisma.habit.update({
      where: { id },
      data: { isActive: body.isActive }
    });

    return NextResponse.json(updated);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(req: Request, context: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await context.params;
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
