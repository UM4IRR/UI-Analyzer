import { NextResponse } from "next/server";
import { analysisQueue } from "@/lib/queue";
import { getServerSession as getServerSessionNextAuth } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cacheAnalysis } from "@/lib/cache";

export async function GET(req: Request, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const { jobId } = await params;

    const session = await getServerSessionNextAuth(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 1. Check if job is in the DB (meaning it finished successfully or failed and saved)
    const dbRecord = await prisma.analysis.findUnique({
      where: { id: jobId },
    });

    if (dbRecord) {
      // If it has a score of 0 and "Error" in title, it might have failed.
      // We will cache successful ones.
      if (dbRecord.score && dbRecord.score > 0 && dbRecord.url) {
        await cacheAnalysis(dbRecord.url, dbRecord.id);
      }
      return NextResponse.json({ status: "completed", result: dbRecord });
    }

    // 2. If not in DB, check BullMQ for status
    const job = await analysisQueue.getJob(jobId);
    if (!job) {
      return NextResponse.json({ status: "not_found", message: "Job not found" }, { status: 404 });
    }

    const state = await job.getState();
    const progress = job.progress;

    if (state === "failed") {
      return NextResponse.json({ status: "failed", error: job.failedReason });
    }

    return NextResponse.json({ status: state, progress });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
