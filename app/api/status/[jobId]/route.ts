import { NextResponse } from "next/server";
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

    // Since we now use direct serverless analysis, the record is only created once it is finished
    // or it is created and then immediately updated. 
    const dbRecord = await prisma.analysis.findUnique({
      where: { id: jobId },
    });

    if (dbRecord && dbRecord.score !== null) {
      // Successful or completed with error
      if (dbRecord.score > 0 && dbRecord.url) {
        await cacheAnalysis(dbRecord.url, dbRecord.id);
      }
      return NextResponse.json({ status: "completed", result: dbRecord });
    }

    // If it's in the DB but score is null, it's technically still processing (though rare in direct mode)
    if (dbRecord) {
      return NextResponse.json({ status: "processing" });
    }

    return NextResponse.json({ status: "not_found", message: "Intelligence cycle not found" }, { status: 404 });
  } catch (error) {
    console.error("Status API Error:", error);
    return NextResponse.json({ message: "Network synchronization failed" }, { status: 500 });
  }
}
