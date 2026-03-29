import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // @ts-ignore
    const userId = session.user.id;

    const history = await prisma.analysis.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        url: true,
        score: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ history });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
