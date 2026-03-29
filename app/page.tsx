"use client";

import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Process } from "@/components/landing/Process";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

/**
 * Main Landing Page for UXFlow
 * Hand-assembled with a focus on premium typography and professional SaaS layout.
 */
export default function LandingPage() {
  return (
    <div className="relative min-h-screen selection:bg-primary/30">
      <Navbar />
      
      <main>
        <Hero />
        
        {/* Subtle Separator */}
        <div className="mx-auto max-w-7xl px-6 opacity-10">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>
        
        <Features />
        
        <Process />
        
        <CTA />
      </main>
      
      <Footer />
    </div>
  );
}
