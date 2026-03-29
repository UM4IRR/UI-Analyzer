import redis from "./redis";

export async function getCachedAnalysis(url: string) {
  const hash = Buffer.from(url).toString('base64');
  const cachedId = await redis.get(`analysis:v2:url:${hash}`);
  return cachedId;
}

export async function cacheAnalysis(url: string, analysisId: string) {
  const hash = Buffer.from(url).toString('base64');
  // Cache for 24 hours (86400 seconds)
  await redis.setex(`analysis:v2:url:${hash}`, 86400, analysisId);
}
export async function removeCachedAnalysis(url: string) {
  const hash = Buffer.from(url).toString('base64');
  await redis.del(`analysis:v2:url:${hash}`);
}
