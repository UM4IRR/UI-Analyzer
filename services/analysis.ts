export interface AnalysisResult {
  score: number;
  issues: Issue[];
}

export interface Issue {
  title: string;
  description: string;
  severity: "low" | "medium" | "high";
  suggestion: string;
}

/**
 * Data-driven heuristics for UX analysis simulation.
 */
export async function analyzeUX(metrics: {
  buttonCount: number;
  imageCount: number;
  linkCount: number;
  hasAltTags: boolean;
  loadTime: number;
}, targetUrl?: string): Promise<AnalysisResult> {
  const issues: Issue[] = [];
  let score = 100;

  // 1. Zero-Signal Detection (Bot Blocking)
  if (metrics.buttonCount === 0 && metrics.linkCount === 0) {
    issues.push({
      title: "Intelligence Obfuscated",
      description: "Scanner detected zero interactive nodes. This host likely maintains aggressive bot-mitigation protocols or served an empty response.",
      severity: "high",
      suggestion: "Confirm the target URL is a public-facing web interface and not a landing gate or CAPTCHA provider.",
    });
    score = 30; // Critical signal failure
    return { score, issues };
  }

  // 2. Proportional Performance Penalty
  const baseLatency = 1200; // ms
  if (metrics.loadTime > baseLatency) {
     const excessiveTime = metrics.loadTime - baseLatency;
     const penalty = Math.min(25, Math.ceil(excessiveTime / 400)); // -1 point for every 400ms above base
     if (penalty > 5) {
        issues.push({
           title: "Interactivity Latency",
           description: `Deployment reached stability in ${(metrics.loadTime/1000).toFixed(2)}s, exceeding performance threshold.`,
           severity: penalty > 15 ? "high" : "medium",
           suggestion: "Optimize resource delivery (CDN) or compression schemas.",
        });
        score -= penalty;
     }
  }

  // 3. Link/Action Intensity
  if (metrics.linkCount > 60) {
    const intensityPenalty = Math.min(15, Math.floor((metrics.linkCount - 60) / 10)); // -1 point for every 10 links above 60
    issues.push({
      title: "Tactical Density Overload",
      description: `Target hosts ${metrics.linkCount} active links. High link-to-content ratio detected.`,
      severity: metrics.linkCount > 120 ? "high" : "medium",
      suggestion: "Consolidate navigation paths or implement lazy-loaded clusters.",
    });
    score -= intensityPenalty;
  }

  // 4. Accessibility Check
  if (!metrics.hasAltTags) {
     issues.push({
       title: "Accessibility Signal Loss",
       description: "Detected interface components missing descriptive text alternatives (Alt Tags).",
       severity: "high",
       suggestion: "Ensure all imagery maintains valid metadata for screen reader parity.",
     });
     score -= 15;
  }

  // 5. Semantic Signal
  if (metrics.buttonCount < 2 && metrics.linkCount < 5) {
     issues.push({
        title: "Weak Interactivity",
        description: "Very few interactive nodes detected. The UI may be under-designed or non-functional.",
        severity: "medium",
        suggestion: "Ensure core actions are clearly visible and semantically tagged.",
     });
     score -= 10;
  }

  // 6. Metadata Verification (SEO/UX)
  if (!targetUrl?.includes("https")) {
    issues.push({
      title: "Insecure Uplink Protocol",
      description: "Secure data transmission (TLS/SSL) was not detected for this domain.",
      severity: "high",
      suggestion: "Mandate TLS protocols across the host architecture.",
    });
    score -= 20;
  }

  // Jitter for high-score sites to ensure uniqueness
  const jitter = (metrics.linkCount % 5) + (metrics.buttonCount % 3);
  score -= jitter;

  score = Math.max(5, Math.min(99, score)); // Keep in realistic range

  return { score, issues };
}
