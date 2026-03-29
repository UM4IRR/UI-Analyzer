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
    const { url, userId, imageData } = job.data;
    console.log(`Processing job ${job.id} for ${url === "Visual Frame" ? "Screenshot Frame" : `URL: ${url}`}`);

    try {
      let screenshotBuffer: Buffer;
      let analysisMetadata: any;

      if (imageData) {
        // 1a. Use Pasted Image Buffer (Vision Path)
        console.log(`[Job ${job.id}] Vision path detected. Decoding frame...`);
        screenshotBuffer = Buffer.from(imageData.split(",")[1], "base64");
        
        // Mock metrics for Vision analysis (since we can't crawl DOM on a static image)
        analysisMetadata = {
          buttonCount: 5,
          imageCount: 3,
          linkCount: 12,
          hasAltTags: true,
          loadTime: 450, // Rapid local handoff
        };
      } else {
        // 1b. Capture Screenshot (Crawler Path)
        console.log(`[Job ${job.id}] Crawler path detected. Capturing screenshot...`);
        const { screenshot, metadata } = await captureScreenshot(url);
        screenshotBuffer = screenshot;
        analysisMetadata = metadata;
      }

      // 2. Prepare Display Image
      const base64Image = imageData || `data:image/jpeg;base64,${screenshotBuffer.toString("base64")}`;

      // 3. Analyze UX
      console.log(`[Job ${job.id}] Running heuristics analysis...`);
      const { score, issues } = await analyzeUX(analysisMetadata, url === "Visual Frame" ? "https://vision.uxflow.ai" : url);

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
          url: url || "Visual Frame",
          score: score || 0,
          results: issues as any,
          imageUrl: base64Image,
        },
      });

      console.log(`[Job ${job.id}] Completed successfully. Score: ${score}`);
      return { success: true, score, issues };
    } catch (error: any) {
      console.error(`[Job ${job.id}] Failed:`, error.message);
      
      try {
        await prisma.analysis.upsert({
          where: { id: job.id },
          update: {
            score: 0,
            results: [{ title: "Intelligence Failure", description: error.message, severity: "high", suggestion: "Confirm network stability or frame format." }] as any,
          },
          create: {
            id: job.id,
            userId,
            url: url || "Visual Frame",
            score: 0,
            results: [{ title: "Intelligence Failure", description: error.message, severity: "high", suggestion: "Confirm network stability or frame format." }] as any,
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
    concurrency: 2,
  }
);

analysisWorker.on("completed", (job) => {
  console.log(`${job.id} has completed!`);
});

analysisWorker.on("failed", (job, err) => {
  console.log(`${job?.id} has failed with ${err.message}`);
});
