import { NextResponse } from "next/server";
import { generatePDF } from "@/services/puppeteer";

export async function POST(req: Request) {
  try {
    const { url, score, issues, imageUrl } = await req.json();

    if (!url) {
      return NextResponse.json({ message: "URL is required" }, { status: 400 });
    }

    const dateStr = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' 
    });

    // Color mapping for score
    let scoreColor = "#ef4444"; // red-500
    let scoreText = "Critical Improvements Needed";
    if (score >= 80) {
        scoreColor = "#10b981"; // emerald-500
        scoreText = "Excellent UX Performance";
    } else if (score >= 60) {
        scoreColor = "#f59e0b"; // yellow-500
        scoreText = "Moderate UX Status";
    }

    // Wrap the extracted container in standard document structure with Tailwind setup
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
            body { 
              font-family: 'Inter', sans-serif;
              color: #1a1a1a;
              background-color: #ffffff;
            }
            @page {
              margin: 0;
            }
            .issue-card {
                page-break-inside: avoid;
            }
          </style>
        </head>
        <body class="p-12 max-w-4xl mx-auto">
          <div class="flex justify-between items-start border-b-2 border-zinc-100 pb-8 mb-8">
            <div>
              <h1 class="text-3xl font-extrabold tracking-tight text-zinc-900 mb-2">UX ANALYSIS REPORT</h1>
              <p class="text-zinc-500 font-medium">Generated for: <span class="text-indigo-600 underline">${url}</span></p>
            </div>
            <div class="text-right">
              <p class="text-xs uppercase tracking-widest text-zinc-400 font-bold mb-1">DATE ISSUED</p>
              <p class="text-sm font-semibold text-zinc-800">${dateStr}</p>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-8 mb-12">
            <div class="col-span-1 bg-zinc-50 rounded-2xl p-8 flex flex-col items-center justify-center border border-zinc-100 shadow-sm">
                <p class="text-xs uppercase tracking-widest text-zinc-400 font-bold mb-4">OVERALL SCORE</p>
                <div class="relative flex items-center justify-center mb-2">
                    <div class="text-6xl font-black" style="color: ${scoreColor}">${score}</div>
                    <div class="text-lg font-bold text-zinc-300 ml-1">/100</div>
                </div>
                <div class="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden mt-2">
                    <div class="h-full rounded-full transition-all duration-1000" style="width: ${score}%; background-color: ${scoreColor}"></div>
                </div>
                <p class="mt-4 text-xs font-bold text-zinc-500 text-center uppercase tracking-tight">${scoreText}</p>
            </div>
            
            <div class="col-span-2 space-y-4">
                <h2 class="text-lg font-bold text-zinc-800 flex items-center gap-2">
                    Executive Summary
                </h2>
                <p class="text-zinc-600 leading-relaxed text-sm">
                    This automated heuristic analysis identifies specific usability Friction Points and Accessibility violations according to industry standards. 
                    The total score of <strong>${score}/100</strong> represents the digital experience health for the analyzed URL.
                </p>
                <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex gap-4">
                    <div class="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
                        <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <div>
                        <p class="text-indigo-900 font-bold text-xs uppercase tracking-wide">Key Insight</p>
                        <p class="text-indigo-700 text-sm mt-0.5">${issues?.length || 0} critical issues were identified requires immediate attention to optimize the user journey.</p>
                    </div>
                </div>
            </div>
          </div>

          ${imageUrl ? `
            <div class="mb-12 border border-zinc-200 rounded-2xl overflow-hidden shadow-sm page-break-after-avoid">
                <div class="bg-zinc-50 px-6 py-3 border-b border-zinc-200">
                    <p class="text-xs font-bold text-zinc-500 uppercase tracking-widest">Viewport Capture (Static Baseline)</p>
                </div>
                <img src="${imageUrl}" alt="Analysis Screenshot" style="width: 100%; display: block; max-height: 400px; object-fit: contain;" />
            </div>
          ` : ''}

          <div class="space-y-6">
            <h2 class="text-xl font-extrabold text-zinc-900 mb-6 flex items-center gap-3">
                <span class="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center text-sm font-bold">#</span>
                Detailed Heuristic Recommendations
            </h2>
            
            <div class="space-y-6">
                ${(issues || []).map((issue: any, index: number) => {
                    let severityColor = "bg-blue-500/10 text-blue-600 border-blue-200";
                    let accentColor = "border-l-blue-500";
                    if (issue.severity === 'high') {
                        severityColor = "bg-red-500/10 text-red-600 border-red-200";
                        accentColor = "border-l-red-500";
                    } else if (issue.severity === 'medium') {
                        severityColor = "bg-orange-500/10 text-orange-600 border-orange-200";
                        accentColor = "border-l-orange-500";
                    }
                    
                    return `
                        <div class="issue-card bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.05)] ${accentColor} border-l-4">
                            <div class="p-6">
                                <div class="flex justify-between items-start mb-4">
                                    <h3 class="text-lg font-bold text-zinc-900">${issue.title}</h3>
                                    <span class="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${severityColor}">
                                        ${issue.severity}
                                    </span>
                                </div>
                                <p class="text-zinc-600 text-sm leading-relaxed mb-6 italic">"${issue.description}"</p>
                                
                                <div class="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
                                    <p class="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-2 flex items-center gap-1">
                                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                                        Actionable Suggestion
                                    </p>
                                    <p class="text-emerald-900 text-sm leading-relaxed font-medium">${issue.suggestion}</p>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
          </div>

          <div class="mt-20 pt-8 border-t border-zinc-100 flex justify-between items-center text-zinc-400">
            <p class="text-[10px] font-bold tracking-widest uppercase">Report Generated by AI UX Analyzer SDK</p>
            <p class="text-[10px]">&copy; ${new Date().getFullYear()} Internal Confidential</p>
          </div>
        </body>
      </html>
    `;

    // Generate high resolution PDF natively via headless Chrome
    const pdfBuffer = await generatePDF(fullHtml);

    // Return the binary data straight back to client for immediate download
    return new Response(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=AI_UX_Report.pdf",
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error("PDF Export failed:", error);
    return NextResponse.json({ message: "Failed to generate PDF" }, { status: 500 });
  }
}
