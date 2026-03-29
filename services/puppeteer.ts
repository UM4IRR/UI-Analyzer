import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

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
  
  const isDev = process.env.NODE_ENV === "development";
  const browser = await puppeteer.launch({
    args: isDev ? ["--no-sandbox"] : chromium.args,
    defaultViewport: isDev ? { width: 1280, height: 1080 } : (chromium as any).defaultViewport,
    executablePath: isDev 
      ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" // Local path for Windows dev
      : await chromium.executablePath(),
    headless: isDev ? true : (chromium as any).headless,
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
    await page.goto(url, { waitUntil: "networkidle2", timeout: 8000 }); // Strict timeout for serverless
    
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
    const screenshotResult = await page.screenshot({ 
      type: "jpeg", 
      quality: 80,
      fullPage: false 
    });
    screenshot = Buffer.from(screenshotResult);
    
    return {
      screenshot,
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
  const isDev = process.env.NODE_ENV === "development";
  const browser = await puppeteer.launch({
    args: isDev ? ["--no-sandbox"] : [...chromium.args, "--font-render-hinting=none"],
    defaultViewport: isDev ? { width: 1280, height: 1080 } : (chromium as any).defaultViewport,
    executablePath: isDev 
      ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
      : await chromium.executablePath(),
    headless: isDev ? true : (chromium as any).headless,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0", timeout: 15000 });
    
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
