import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getCachedAnalysis } from "@/lib/cache";
import { analysisQueue } from "@/lib/queue";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const analyzeSchema = z.object({
  urls: z.array(z.string().url()).min(1),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const { urls } = analyzeSchema.parse(json);
    // @ts-ignore
    const userId = session.user.id;
    const results = [];

    for (const url of urls) {
      // 1. Check Redis Cache
      const cachedId = await getCachedAnalysis(url);
      if (cachedId) {
        const existing = await prisma.analysis.findUnique({
          where: { id: cachedId }
        });

        if (existing) {
          if (existing.userId === userId) {
            results.push({ url, jobId: existing.id, status: "completed", cached: true });
            continue;
          } else {
            const clonedAnalysis = await prisma.analysis.create({
               data: {
                  userId,
                  url: existing.url,
                  score: existing.score,
                  results: existing.results ? JSON.parse(JSON.stringify(existing.results)) : [],
                  imageUrl: existing.imageUrl || null
               }
            });
            results.push({ url, jobId: clonedAnalysis.id, status: "completed", cached: true });
            continue;
          }
        }
      }

      // 2. Pre-create record for better Dashboard UX
      const analysisRecord = await prisma.analysis.create({
        data: {
          userId,
          url,
          score: null, // Indicates PENDING
        }
      });

      // 3. Enqueue Job with specific ID
      await analysisQueue.add("analyze", {
        url,
        userId,
      }, {
        jobId: analysisRecord.id,
      });

      results.push({ url, jobId: analysisRecord.id, status: "queued", cached: false });
    }

    return NextResponse.json({
      results,
      count: results.length,
      message: `${results.length} intelligence scans synchronized.`
    });
  } catch (error) {
    console.error("Analysis API Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid payload provided" }, { status: 400 });
    }
    return NextResponse.json({ message: "Network synchronization failed" }, { status: 500 });
  }
}
