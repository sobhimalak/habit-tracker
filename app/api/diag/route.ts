import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Try to count users to check connection
    const userCount = await prisma.user.count();
    return NextResponse.json({ 
      status: "connected", 
      userCount,
      database: process.env.DATABASE_URL?.split(":")[0], // Only log the protocol for security
    });
  } catch (error: any) {
    console.error("Database Diagnostic Error:", error);
    return NextResponse.json({ 
      status: "error", 
      message: error.message,
      code: error.code,
      meta: error.meta,
    }, { status: 500 });
  }
}
