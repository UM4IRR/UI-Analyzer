import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { removeCachedAnalysis } from "@/lib/cache";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // @ts-ignore
    const userId = session.user.id;

    const analysis = await prisma.analysis.findUnique({
      where: { id },
    });

    if (!analysis) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    if (analysis.userId !== userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // @ts-ignore
    const userId = session.user.id;

    const analysis = await prisma.analysis.findUnique({
      where: { id },
    });

    if (!analysis) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    if (analysis.userId !== userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await prisma.analysis.delete({
      where: { id },
    });

    if (analysis.url) {
      await removeCachedAnalysis(analysis.url);
    }

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
