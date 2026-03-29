import type { Metadata } from "next";
import { Outfit, Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ModeToggle } from "@/components/ui/mode-toggle";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UXFlow — High-Fidelity UX Heuristic Audits",
  description:
    "Professional-grade AI audits for modern digital products. Get actionable accessibility and usability insights in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${inter.variable} ${geistMono.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="relative flex min-h-screen flex-col">
              {/* Subtle Noise Texture */}
              <div className="noise-overlay fixed inset-0 pointer-events-none z-[100]" />
              
              {children}
              
              {/* Persistent Theme Corner Toggle */}
              <div className="fixed bottom-6 right-6 z-[100] flex items-center justify-center p-1 rounded-2xl bg-background/40 backdrop-blur-xl border border-border/10 shadow-2xl">
                <ModeToggle />
              </div>
            </div>
            <Toaster richColors position="bottom-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
