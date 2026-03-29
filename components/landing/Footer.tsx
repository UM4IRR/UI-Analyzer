"use client";

import Link from "next/link";
import { Layout } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-border/10 bg-background pt-24 pb-12 overflow-hidden">
      <div className="absolute bottom-0 left-0 h-64 w-64 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 pt-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 group mb-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-all duration-300">
                <Layout className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xl font-bold tracking-tight font-heading">
                UXFlow
              </span>
            </Link>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-xs opacity-70">
              The high-fidelity heuristic engine for modern digital architects.
              Built for speed, baked with professional insight.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-foreground mb-6">Product</h4>
            <ul className="space-y-4 text-sm font-medium text-muted-foreground">
              <li><Link href="#features" className="hover:text-primary transition-colors">Heuristics</Link></li>
              <li><Link href="#process" className="hover:text-primary transition-colors">Methodology</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="/reports" className="hover:text-primary transition-colors">Sample Reports</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-foreground mb-6">Company</h4>
            <ul className="space-y-4 text-sm font-medium text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-foreground mb-6">Connectivity</h4>
            <ul className="space-y-4 text-sm font-medium text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Twitter (X)</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Discord Community</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">API Docs</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">GitHub</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-border/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/70">
            &copy; {new Date().getFullYear()} UXFlow Systems : UI-ANALYZER
          </p>
          <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/90">
            <span>v1.2.4</span>
            <span className="w-1 h-1 bg-muted rounded-full" />
            <span>COMPLIANT</span>
            <span className="w-1 h-1 bg-muted rounded-full" />
            <span>UM4IRR</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
