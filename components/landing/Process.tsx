"use client";

import { motion } from "framer-motion";
import { Search, Brain, FileText } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Search,
    title: "Project Intake",
    desc: "Connect your domains and start a baseline capture. Our engine maps your structural layout instantly.",
  },
  {
    step: "02",
    icon: Brain,
    title: "Expert Intelligence",
    desc: "Our heuristic engine runs over 1,400 checks against WCAG and modern UX standards.",
  },
  {
    step: "03",
    icon: FileText,
    title: "Actionable Insights",
    desc: "Download comprehensive reports with prioritized recommendations to improve your product.",
  },
];

export function Process() {
  return (
    <section id="process" className="relative z-10 py-32 px-6 border-y border-border/10 bg-white/[0.01] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.02)_0,transparent_100%)]" />
      
      <div className="mx-auto max-w-7xl relative">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight font-heading">
            Our <span className="text-primary italic">Process</span>
          </h2>
          <div className="h-1.5 w-16 bg-primary mx-auto mt-6 rounded-full" />
        </div>

        <div className="grid gap-16 md:grid-cols-3 max-w-5xl mx-auto">
          {steps.map((item, i) => (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              key={item.step}
              className="relative group flex flex-col items-center md:items-start text-center md:text-left"
            >
              <div className="h-16 w-16 flex items-center justify-center rounded-2xl bg-card border border-border shadow-md mb-8 group-hover:bg-primary/5 group-hover:border-primary/20 transition-all duration-300">
                <item.icon className="h-7 w-7 text-primary" />
              </div>
              <div className="text-[10px] font-bold text-primary tracking-[0.4em] mb-4">STEP {item.step}</div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight font-heading">{item.title}</h3>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed opacity-80 max-w-xs border-l-2 border-primary/10 pl-5">
                {item.desc}
              </p>
              
              {i < 2 && (
                <div className="hidden md:block absolute top-8 left-[calc(100%+40px)] w-[40%] h-px bg-gradient-to-r from-primary/20 to-transparent border-t border-dashed border-primary/10" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
