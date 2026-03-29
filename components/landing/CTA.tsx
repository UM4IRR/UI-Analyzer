"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";

export function CTA() {
  return (
    <section className="relative z-10 py-32 px-6">
      <div className="mx-auto max-w-5xl text-center">
        <motion.div
           initial={{ opacity: 0, scale: 0.98 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           className="relative overflow-hidden rounded-[3rem] border border-primary/20 bg-primary/5 p-16 md:p-24 shadow-2xl shadow-primary/5"
        >
          <div className="absolute top-0 right-0 h-64 w-64 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
          
          <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-8 font-heading text-balance">
            Ready to <span className="text-primary italic">Elevate Your Product's UX?</span>
          </h2>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground mb-12 font-medium opacity-90 text-balance leading-relaxed">
            Join the next generation of designers building better digital experiences. 
            Start your first heuristic audit today for free.
          </p>
          
          <div className="flex flex-col items-center gap-6">
            <Link href="/register">
              <Button
                size="lg"
                className="h-16 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-12 text-xl tracking-tight shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 group border-none"
              >
                Get Started for Free
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-muted-foreground/80">
               NO CREDIT CARD REQUIRED • INSTANT SETUP
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
