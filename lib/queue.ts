import { Queue } from "bullmq";
import redis from "./redis";

export const analysisQueue = new Queue("analysis-queue", {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  },
});
