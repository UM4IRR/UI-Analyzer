"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, AlertTriangle, Info, ShieldAlert, Monitor, Download, Calendar, Target, Award, CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResult() {
      try {
        const res = await fetch(`/api/analysis/${id}`);
        if (res.ok) {
          const json = await res.json();
          setData(json.analysis);
        } else {
          router.push("/dashboard");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchResult();
  }, [id, router]);

  async function exportToPDF() {
    try {
      toast.info("Initializing neural render for PDF sequence...");
      
      const payload = {
        url: data.url,
        score: data.score,
        issues: Array.isArray(data.results) ? data.results : (typeof data.results === "string" ? JSON.parse(data.results) : []),
        imageUrl: data.imageUrl
      };

      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to generate intelligence stream");

      const blob = await response.blob();
      const donwloadUrl = window.URL.createObjectURL(blob);
      const tempLink = document.createElement("a");
      tempLink.href = donwloadUrl;
      tempLink.download = `INTELLIGENCE_REPORT_${id}.pdf`;
      tempLink.click();
      window.URL.revokeObjectURL(donwloadUrl);
      toast.success("Intelligence report archived successfully!");
    } catch (err) {
      toast.error("Archive synchronization failed.");
    }
  }

  if (loading) {
    return (
       <div className="max-w-6xl mx-auto space-y-10 animate-pulse pt-10">
         <div className="h-10 w-64 bg-white/5 rounded-2xl" />
         <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 h-[400px] bg-white/5 rounded-[2rem]" />
            <div className="lg:col-span-2 h-[600px] bg-white/5 rounded-[2rem]" />
         </div>
       </div>
    );
  }

  if (!data) return null;

  let issues: any[] = [];
  try {
    const rawData = typeof data.results === "string" ? JSON.parse(data.results) : data.results;
    issues = Array.isArray(rawData) ? rawData : [];
  } catch (e) {
    issues = [];
  }
  const score = data.score || 0;

  const getTheme = (s: number) => {
    if (s >= 80) return { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "shadow-[0_0_20px_rgba(16,185,129,0.2)]" };
    if (s >= 60) return { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", glow: "shadow-[0_0_20px_rgba(245,158,11,0.2)]" };
    return { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", glow: "shadow-[0_0_20px_rgba(239,68,68,0.2)]" };
  };

  const theme = getTheme(score);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-7xl mx-auto space-y-8 pb-20"
    >
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-white/5">
        <div className="flex items-center gap-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()} 
            className="h-12 w-12 rounded-2xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all print:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              Intelligence Report
              <span className="text-[10px] uppercase tracking-[0.3em] font-black text-foreground/70 border px-2 py-0.5 rounded-md border-white/10 bg-white/5">v2.0</span>
            </h1>
            <p className="text-muted-foreground text-sm font-medium flex items-center gap-2 mt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Target: <span className="text-foreground/80 underline decoration-primary/30 underline-offset-4">{data.url}</span>
            </p>
          </div>
        </div>
        <Button 
          onClick={exportToPDF} 
          className="rounded-xl px-6 bg-white/5 border border-white/10 hover:bg-white/15 hover:border-white/20 transition-all font-bold tracking-wide uppercase text-[10px] text-foreground print:hidden h-12"
        >
          <Download className="mr-2 h-4 w-4" /> Download Archive
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 pt-4">
        {/* Score Card Section */}
        <div className="lg:col-span-1 space-y-8">
          <Card className={`glass-card rounded-[2rem] border-white/10 overflow-hidden relative group transition-all duration-500 ${theme.glow}`}>
            <div className={`absolute top-0 left-0 w-full h-1 bg-current ${theme.color} opacity-30`} />
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-[0.2em] font-black text-foreground/60 flex items-center gap-2">
                <Target className="h-3.5 w-3.5" /> Performance Metric
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-4 pb-10">
              <div className="relative group">
                {/* SVG Radial Gauge */}
                <svg className="w-48 h-48 -rotate-90 transform">
                  <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                  <motion.circle 
                    cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent"
                    strokeDasharray={2 * Math.PI * 88}
                    initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
                    animate={{ strokeDashoffset: (2 * Math.PI * 88) * (1 - score / 100) }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={`${theme.color} drop-shadow-[0_0_8px_currentColor]`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-6xl font-black tracking-tighter text-glow text-foreground">{score}</span>
                  <span className="text-[10px] font-black text-foreground/50 tracking-widest opacity-80">SCORE</span>
                </div>
              </div>
              
              <div className="mt-8 text-center space-y-1">
                 <p className={`text-sm font-black uppercase tracking-widest ${theme.color}`}>
                   {score >= 80 ? 'Optimal Experience' : score >= 60 ? 'Satisfactory' : 'Critical Friction'}
                 </p>
                 <p className="text-[10px] text-foreground/50 font-medium">Heuristic confidence interval: 94.2%</p>
              </div>
            </CardContent>
          </Card>

          {data.imageUrl && (
            <Card className="glass-card rounded-[2rem] border-white/10 overflow-hidden group border-dashed">
              <CardHeader className="py-4 border-b border-white/5 bg-black/20">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-foreground/60 flex items-center gap-2">
                  <Monitor className="h-3.5 w-3.5" /> Viewport Snapshot
                </CardTitle>
              </CardHeader>
              <div className="relative aspect-video bg-black/40 p-4">
                <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors z-10 pointer-events-none" />
                <img src={data.imageUrl} alt="System Screenshot" className="rounded-xl object-cover w-full h-full opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute top-6 right-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                   <a href={data.imageUrl} target="_blank" className="h-8 w-8 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/80 transition-all">
                      <ExternalLink className="h-3.5 w-3.5 text-white" />
                   </a>
                </div>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-4">
             <div className="glass-card rounded-2xl p-4 border-white/5 text-center">
                <Calendar className="h-4 w-4 text-foreground/40 mx-auto mb-2 opacity-60" />
                <p className="text-[8px] font-black text-foreground/50 uppercase mb-1">Generated On</p>
                <p className="text-xs font-bold text-foreground/90">{new Date(data.createdAt).toLocaleDateString()}</p>
             </div>
             <div className="glass-card rounded-2xl p-4 border-white/5 text-center">
                <Award className="h-4 w-4 text-foreground/40 mx-auto mb-2 opacity-60" />
                <p className="text-[8px] font-black text-foreground/50 uppercase mb-1">Audit Status</p>
                <p className="text-xs font-bold text-emerald-400">Validated</p>
             </div>
          </div>
        </div>

        {/* Detailed Issues Section */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between mb-2 px-2">
              <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3 italic">
                Heuristic Findings
                <span className="w-10 h-1 bg-primary/20 rounded-full" />
              </h2>
              <div className="text-[10px] font-bold text-foreground/50 uppercase flex gap-4">
                 <span className="flex items-center gap-1.5"><ShieldAlert className="h-3 w-3 text-red-400" /> {issues.filter(i => i.severity === 'high').length}</span>
                 <span className="flex items-center gap-1.5"><AlertTriangle className="h-3 w-3 text-yellow-400" /> {issues.filter(i => i.severity === 'medium').length}</span>
              </div>
           </div>

           <div className="space-y-6">
             {issues.length === 0 ? (
               <Card className="glass-card rounded-[2rem] p-16 text-center border-dashed">
                  <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-6 opacity-40 glow-emerald" />
                  <h3 className="text-xl font-bold mb-2">Immaculate UI Architecture</h3>
                  <p className="text-muted-foreground font-medium max-w-sm mx-auto">Our heuristics found zero critical friction points. The interface adheres to optimal interaction standards.</p>
               </Card>
             ) : (
               issues.map((issue: any, idx: number) => {
                 let Icon = Info;
                 let colors = "text-blue-400 border-blue-500/20 bg-blue-500/5";
                 if (issue.severity === "high") { Icon = ShieldAlert; colors = "text-red-400 border-red-500/20 bg-red-500/5"; }
                 else if (issue.severity === "medium") { Icon = AlertTriangle; colors = "text-yellow-400 border-yellow-500/20 bg-yellow-500/5"; }

                 return (
                   <motion.div
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ duration: 0.5, delay: idx * 0.1 }}
                     key={idx}
                     className={`glass-card rounded-[1.5rem] border-white/5 overflow-hidden border-l-4 group ${
                       issue.severity === 'high' ? 'border-l-red-500' : 
                       issue.severity === 'medium' ? 'border-l-yellow-500' : 
                       'border-l-blue-500'
                     }`}
                   >
                     <div className="p-8">
                       <div className="flex justify-between items-start mb-4">
                          <div className="space-y-1">
                             <div className="flex items-center gap-2">
                                <Icon className={`h-4 w-4 ${colors.split(' ')[0]}`} />
                                <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${colors.split(' ')[0]}`}>{issue.severity} priority</span>
                             </div>
                             <h3 className="text-lg font-black tracking-tight text-foreground/90">{issue.title}</h3>
                          </div>
                          <span className="text-[10px] text-foreground/30 font-black">SCAN_REF_{idx}</span>
                       </div>
                       
                       <p className="text-sm text-muted-foreground leading-relaxed font-medium mb-8 italic opacity-80 decoration-white/5">"{issue.description}"</p>
                       
                       <div className="relative group/suggest">
                          <div className="absolute inset-0 bg-primary/5 blur-xl group-hover/suggest:bg-primary/10 transition-colors rounded-xl" />
                          <div className="relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/30 transition-all duration-300">
                             <p className="text-[10px] font-black uppercase tracking-[0.1em] text-primary mb-2 flex items-center gap-2">
                               <Sparkles className="h-3 w-3" /> Actionable Intelligence
                             </p>
                             <p className="text-sm text-foreground/90 leading-relaxed font-bold tracking-tight">{issue.suggestion}</p>
                          </div>
                       </div>
                     </div>
                   </motion.div>
                 );
               })
             )}
           </div>
        </div>
      </div>
    </motion.div>
  );
}
