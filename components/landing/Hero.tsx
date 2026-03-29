"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, CheckCircle } from "lucide-react";

export function Hero() {
  return (
    <section className="relative z-10 pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-accent/5 blur-[120px] rounded-full" />
      </div>

      <div className="mx-auto max-w-7xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-5 py-2 text-xs font-semibold text-primary mb-10 shadow-sm shadow-primary/5">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI-Powered Heuristic Audits</span>
          </div>
          
          {/* Main Title */}
          <h1 className="mx-auto max-w-4xl text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.05] text-balance font-heading">
            Audit your <span className="dark:text-foreground">UX</span> at the <br />
            <span className="text-primary italic tracking-tight">speed of thought.</span>
          </h1>
          
          {/* Subtitle */}
          <p className="mx-auto mt-8 max-w-2xl text-lg md:text-xl text-muted-foreground font-semibold leading-relaxed text-balance">
            Stop guessing and start optimizing. Get instant, high-fidelity UX audits, 
            accessibility checks, and actionable insights for your digital products in seconds.
          </p>
          
          {/* CTAs */}
          <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/register">
              <Button
                size="lg"
                className="h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg px-8 shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
              >
                Start Auditing Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button
                variant="outline"
                size="lg"
                className="h-14 rounded-full border-border/60 bg-background/50 backdrop-blur-sm px-8 font-bold text-lg hover:bg-muted/50"
              >
                See Features
              </Button>
            </Link>
          </div>
          
          {/* Trust Badges */}
          <div className="mt-20 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-60">
             <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Accessibility First</span>
             </div>
             <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Heuristic Expert Review</span>
             </div>
             <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>WCAG 2.1 Compliant</span>
             </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
