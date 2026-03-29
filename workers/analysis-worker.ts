import { Worker, Job } from "bullmq";
import redis from "../lib/redis";
import { captureScreenshot } from "../services/puppeteer";
import { analyzeUX } from "../services/analysis";
import { prisma } from "../lib/prisma";
// @ts-ignore
import dotenv from "dotenv";

dotenv.config();

console.log("Starting Analysis Background Worker...");

export const analysisWorker = new Worker(
  "analysis-queue",
  async (job: Job) => {
    const { url, userId } = job.data;
    console.log(`Processing job ${job.id} for URL: ${url}`);

    try {
      // 1. Capture Screenshot
      console.log(`[Job ${job.id}] Capturing screenshot...`);
      const { screenshot, metadata } = await captureScreenshot(url);

      // 2. Mock: Upload to Supabase Storage
      const base64Image = `data:image/jpeg;base64,${screenshot.toString("base64")}`;

      // 3. Analyze UX
      console.log(`[Job ${job.id}] Running heuristics analysis...`);
      const { score, issues } = await analyzeUX(metadata, url);

      // 4. Save to Database
      console.log(`[Job ${job.id}] Saving results to DB...`);
      await prisma.analysis.upsert({
        where: { id: job.id },
        update: {
          score: score || 0,
          results: issues as any,
          imageUrl: base64Image,
        },
        create: {
          id: job.id,
          userId,
          url,
          score: score || 0,
          results: issues as any,
          imageUrl: base64Image,
        },
      });

      console.log(`[Job ${job.id}] Completed successfully. Score: ${score}`);
      return { success: true, score, issues };
    } catch (error: any) {
      console.error(`[Job ${job.id}] Failed:`, error.message);
      
      // Attempt to save failed state to database
      try {
        await prisma.analysis.upsert({
          where: { id: job.id },
          update: {
            score: 0,
            results: [{ title: "Error", description: error.message, severity: "high", suggestion: "Try again" }] as any,
          },
          create: {
            id: job.id,
            userId,
            url,
            score: 0,
            results: [{ title: "Error", description: error.message, severity: "high", suggestion: "Try again" }] as any,
          },
        });
      } catch (dbError) {
         console.error("Also failed to save error state to DB", dbError);
      }

      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 2, // Limit concurrent Puppeteer instances
  }
);

analysisWorker.on("completed", (job) => {
  console.log(`${job.id} has completed!`);
});

analysisWorker.on("failed", (job, err) => {
  console.log(`${job?.id} has failed with ${err.message}`);
});
