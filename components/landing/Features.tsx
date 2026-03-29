"use client";

import { motion } from "framer-motion";
import { Eye, Shield, Zap, Layers, BarChart3, Activity } from "lucide-react";

const features = [
  {
    icon: Eye,
    title: "Visual Audit",
    desc: "Analyze hierarchy, contrast, and visual focus points to ensure your message is landing where you want it.",
    color: "emerald",
  },
  {
    icon: Zap,
    title: "Interaction Performance",
    desc: "Identify friction points and cognitive load issues that prevent users from converting.",
    color: "amber",
  },
  {
    icon: Shield,
    title: "Accessibility Guard",
    desc: "Automated verification against WCAG standards, ensuring your product is usable for everyone.",
    color: "blue",
  },
  {
    icon: Layers,
    title: "System Consistency",
    desc: "Check design pattern adherence across your entire interface for a cohesive user experience.",
    color: "purple",
  },
  {
    icon: BarChart3,
    title: "Expert Reports",
    desc: "Get high-fidelity PDF reports with prioritized heuristic insights ready for stakeholders.",
    color: "indigo",
  },
  {
    icon: Activity,
    title: "Reactive Insights",
    desc: "Our heuristic-driven engine provides immediate, actionable suggestions to improve your UX.",
    color: "rose",
  },
];

export function Features() {
  return (
    <section id="features" className="relative z-10 py-32 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
           <div className="max-w-xl text-left">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 font-heading">
                Pro-Grade Heuristic <br />
                <span className="text-primary italic">Intelligence</span>
              </h2>
              <p className="text-md text-muted-foreground font-medium leading-relaxed max-w-md">
                Our AI-driven engine simulates expert heuristic reviews, pinpointing 
                usability issues before they impact your growth.
              </p>
           </div>
           
           <div className="text-right hidden md:block">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/50 border-r-2 border-primary/20 pr-4">
                 Audit Module 1.0
              </span>
           </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              viewport={{ once: true }}
              key={feature.title}
              className="group premium-card"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 border border-primary/10 mb-8 group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-300">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 tracking-tight font-heading group-hover:text-primary transition-colors">
                 {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
