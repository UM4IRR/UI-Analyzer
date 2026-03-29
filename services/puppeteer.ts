import puppeteer from "puppeteer";

export interface CaptureResult {
  screenshot: Buffer;
  metadata: {
    title: string;
    buttonCount: number;
    imageCount: number;
    linkCount: number;
    hasAltTags: boolean;
    loadTime: number;
  }
}

export async function captureScreenshot(url: string): Promise<CaptureResult> {
  const startTime = Date.now();
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox", 
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled", // Bypass automated-browser flags
    ],
  });

  try {
    const page = await browser.newPage();
    
    // 1. Spoof User Agent to mimic a real Windows desktop browser
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36");

    // 2. Clear webdriver flag early in the lifecycle
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });

    await page.setViewport({ width: 1280, height: 1080 });
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
    
    // Wait for body to ensure layout is initialized
    try {
      await page.waitForSelector('body', { timeout: 10000 });
    } catch (e) {
      console.warn("Body selector timeout, proceeding with current layout state.");
    }
    
    // Extract metadata
    const metadata = await page.evaluate(() => {
      const buttons = document.querySelectorAll("button, [role='button']");
      const images = document.querySelectorAll("img");
      const links = document.querySelectorAll("a");
      const imagesWithAlt = Array.from(images).filter(img => img.getAttribute("alt"));
      
      return {
        title: document.title || "Untitled Intelligence",
        buttonCount: buttons.length,
        imageCount: images.length,
        linkCount: links.length,
        hasAltTags: images.length > 0 ? imagesWithAlt.length / images.length > 0.8 : true,
      };
    });

    let screenshot: Buffer;
    try {
      // Manually calculate content height to avoid 0-width protocol errors in fullPage mode
      const scrollHeight = await page.evaluate(() => {
        return Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.offsetHeight,
          document.body.clientHeight,
          document.documentElement.clientHeight,
          2000 // Ensure a minimum height for analysis
        );
      });

      // Force a valid width and calculated height
      await page.setViewport({ width: 1280, height: Math.min(scrollHeight, 10000) }); // Cap at 10k to prevent resource crash
      
      const screenshotResult = await page.screenshot({ 
        type: "jpeg", 
        quality: 80,
        fullPage: false // We use our manual viewport sizing instead
      });
      screenshot = screenshotResult as Buffer;
    } catch (error) {
      console.error("Advanced manual capture failed, falling back to basic viewport:", error);
      // Ensure we have a valid viewport for the fallback
      await page.setViewport({ width: 1280, height: 1080 });
      const screenshotResult = await page.screenshot({ type: "jpeg", quality: 80, fullPage: false });
      screenshot = screenshotResult as Buffer;
    }
    
    return {
      screenshot: screenshot as Buffer,
      metadata: {
        ...metadata,
        loadTime: Date.now() - startTime
      }
    };
  } finally {
    await browser.close();
  }
}

export async function generatePDF(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--font-render-hinting=none"],
  });

  try {
    const page = await browser.newPage();
    
    // Set content and wait for network/styles to load completely
    await page.setContent(html, { waitUntil: "networkidle0", timeout: 30000 });
    
    // Optional: wait a moment for complex CSS to map down (Tailwind via CDN usually is instant at networkidle0)
    await new Promise(r => setTimeout(r, 500));

    // Generate PDF with minimal margins to match the UI perfectly
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true, // Must enforce backgrounds for dark mode UI
      margin: {
        top: '20px',
        bottom: '20px',
        left: '20px',
        right: '20px'
      }
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
