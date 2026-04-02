export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: "Email already registered" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
      },
    });

    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } }, { status: 201 });
  } catch (error: any) {
    console.error("DEBUG: Registration failed:", error);
    return NextResponse.json({ 
      message: "Registration failed", 
      error: error.message || "Unknown error",
      code: error.code || "NO_CODE",
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
