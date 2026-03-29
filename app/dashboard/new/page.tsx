"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Globe, Cpu, Zap, Search, ShieldCheck, Sparkles, AlertCircle, ListPlus, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NewAnalysisPage() {
  const router = useRouter();
  const [inputText, setInputText] = useState("");
  const [pastedImages, setPastedImages] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "submitting" | "tracking">("idle");
  const [detectedUrls, setDetectedUrls] = useState<string[]>([]);
  const [activeScans, setActiveScans] = useState<{ id: string, url: string, score: number | null, status: string }[]>([]);
  const [completedCount, setCompletedCount] = useState(0);

  // Robust URL extraction regex
  useEffect(() => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = inputText.match(urlRegex) || [];
    const uniqueUrls = Array.from(new Set(matches)).filter(url => {
      try { new URL(url); return true; } catch { return false; }
    });
    setDetectedUrls(uniqueUrls);
  }, [inputText]);

  // Handle Screenshot Pasting
  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    const imagePromises: Promise<string>[] = [];

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const promise = new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
              resolve(event.target?.result as string);
            };
            reader.readAsDataURL(file);
          });
          imagePromises.push(promise);
        }
      }
    }

    if (imagePromises.length > 0) {
      const newImages = await Promise.all(imagePromises);
      setPastedImages((prev) => [...prev, ...newImages]);
      toast.success(`${newImages.length} Visual Frame(s) intercepted!`);
    }
  };

  // Polling logic for active scans
  useEffect(() => {
    if (status !== "tracking" || activeScans.length === 0) return;

    const interval = setInterval(async () => {
      const pendingIndices = activeScans
        .map((scan, index) => (scan.score === null ? index : -1))
        .filter(index => index !== -1);

      if (pendingIndices.length === 0) {
        clearInterval(interval);
        return;
      }

      const updatedScans = [...activeScans];
      let newCompleted = 0;

      for (const index of pendingIndices) {
        try {
          const res = await fetch(`/api/analysis/${activeScans[index].id}`);
          if (res.ok) {
            const data = await res.json();
            if (data.analysis.score !== null) {
              updatedScans[index] = {
                ...updatedScans[index],
                score: data.analysis.score,
                status: "synchronized"
              };
              newCompleted++;
            }
          }
        } catch (e) {
          console.error("Polling error:", e);
        }
      }

      if (newCompleted > 0) {
        setActiveScans(updatedScans);
        setCompletedCount(prev => prev + newCompleted);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [status, activeScans]);

  async function onSubmit(e: React.FormEvent) {
    if (e) e.preventDefault();
    if (detectedUrls.length === 0 && pastedImages.length === 0) {
      toast.error("No valid satellite coordinates or visual frames detected.");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          urls: detectedUrls,
          images: pastedImages 
        }),
      });

      if (!res.ok) throw new Error("Failed to synchronize fleet");
      const data = await res.json();
      
      const initialScans = data.results.map((r: any) => ({
        id: r.jobId,
        url: r.url,
        score: r.status === "completed" ? 85 : null, 
        status: r.status === "completed" ? "synchronized" : "uplink_active"
      }));

      setActiveScans(initialScans);
      setStatus("tracking");
      toast.success(`${data.count} intelligence cycles initiated!`);
    } catch (err) {
      setStatus("idle");
      toast.error("Fleet synchronization failure.");
    }
  }

  return (
    <div className="max-w-6xl mx-auto pt-10 pb-20 px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Card className="glass-card rounded-[2.5rem] border-border bg-card/60 backdrop-blur-xl shadow-3xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
          
          <CardHeader className="pt-16 px-12 pb-10 text-center">
            <div className="mx-auto w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-8 glow-cyan animate-float">
              {status === "tracking" ? <Zap className="h-10 w-10 text-primary" /> : <Cpu className="h-10 w-10 text-primary" />}
            </div>
            <CardTitle className="text-5xl font-black tracking-tighter mb-4 italic uppercase">
              {status === "tracking" ? "Mission Control Active" : "Bulk Intelligence Deployment"}
            </CardTitle>
            <CardDescription className="text-foreground/70 text-lg font-medium max-w-2xl mx-auto leading-relaxed border-l-2 border-primary/30 pl-8 italic">
              {status === "tracking" 
                ? `Synchronizing ${activeScans.length} active autonomous heuristics. Real-time telemetry arriving via encrypted uplink.`
                : "Paste your documentation, lists, or raw URL data below. Our engines will isolate every link and begin simultaneous architectural audits."
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="px-12 pb-16">
            <AnimatePresence mode="wait">
              {status === "idle" || status === "submitting" ? (
                <motion.form 
                  key="form"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-10" 
                  onSubmit={onSubmit}
                >
                  <div className="space-y-5">
                    <div className="flex justify-between items-end px-4">
                      <Label htmlFor="urls" className="text-[11px] uppercase tracking-[0.4em] font-black text-foreground/40 group-focus-within:text-primary transition-colors">Target Coordinate Registry</Label>
                      <div className="flex gap-3">
                        {pastedImages.length > 0 && (
                          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-accent font-black text-[10px] uppercase tracking-widest bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
                            <Sparkles className="h-3 w-3" />
                            Visual Frames Intercepted
                            <button onClick={() => setPastedImages([])} className="ml-1 hover:text-white transition-colors">×</button>
                          </motion.div>
                        )}
                        {detectedUrls.length > 0 && (
                          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                            <CheckCircle2 className="h-3 w-3" />
                            Target Coordinates Locked
                          </motion.div>
                        )}
                      </div>
                    </div>
                    <div className="relative group/container">
                      <div className="flex flex-col bg-foreground/5 border-border rounded-[2.5rem] overflow-hidden focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary/50 transition-all border shadow-2xl backdrop-blur-md">
                        <AnimatePresence>
                          {pastedImages.length > 0 && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="w-full"
                            >
                              <div className="flex flex-nowrap gap-4 p-5 pb-2 overflow-x-auto no-scrollbar">
                                {pastedImages.map((img, idx) => (
                                  <motion.div 
                                    key={idx}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    whileHover={{ scale: 1.05 }}
                                    className="relative h-28 w-28 flex-shrink-0 rounded-2xl overflow-hidden border border-white/20 shadow-xl group/img"
                                  >
                                    <img src={img} alt="Pasted frame" className="h-full w-full object-cover" />
                                    <button 
                                      onClick={() => setPastedImages(prev => prev.filter((_, i) => i !== idx))}
                                      className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/80 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-red-500 shadow-lg"
                                    >
                                      <ListPlus className="h-3 w-3 rotate-45" />
                                    </button>
                                  </motion.div>
                                ))}
                                {pastedImages.length > 0 && <div className="w-1 flex-shrink-0" />} {/* Spacer for scroll end */}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        
                        <Textarea
                          id="urls"
                          placeholder="Paste links OR screenshots (Ctrl+V) here..."
                          required={detectedUrls.length === 0 && pastedImages.length === 0}
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          onPaste={handlePaste}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              onSubmit(e as any);
                            }
                          }}
                          className="bg-transparent border-none text-xl min-h-[140px] px-8 py-6 focus-visible:ring-0 transition-all font-medium leading-[1.6] resize-none placeholder:text-foreground/10"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    size="lg" 
                    disabled={(detectedUrls.length === 0 && pastedImages.length === 0) || status === "submitting"}
                    className="w-full h-20 rounded-3xl bg-primary hover:glow-cyan text-white font-black text-xl tracking-tight transition-all duration-300 active:scale-[0.98] group disabled:opacity-30"
                  >
                    {status === "submitting" ? "SYNCHRONIZING..." : (detectedUrls.length + pastedImages.length) > 0 ? "INITIATE FULL ANALYSIS" : "AWAITING COORDINATES"}
                    <Search className="ml-4 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.form>
              ) : (
                <motion.div 
                  key="tracking-grid"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-12"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeScans.map((scan) => (
                      <div key={scan.id} className="bg-card border border-border rounded-2xl p-6 flex items-center justify-between group hover:bg-foreground/5 transition-all">
                        <div className="flex flex-col gap-1 overflow-hidden">
                          <span className="text-[9px] uppercase tracking-[0.3em] font-black text-foreground/30 flex items-center gap-2">
                             {scan.score === null ? <Zap className="h-2.5 w-2.5 text-primary animate-pulse" /> : <ShieldCheck className="h-2.5 w-2.5 text-primary" />}
                             {scan.status.replace("_", " ")}
                          </span>
                          <span className="text-sm font-bold truncate text-foreground/80">
                            {scan.url === "Visual Frame" ? "Visual Frame (Screenshot)" : new URL(scan.url).hostname}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          {scan.score !== null ? (
                            <div className="px-4 py-2 bg-primary/20 rounded-xl border border-primary/30 text-primary font-black text-lg shadow-[0_0_15px_rgba(45,212,191,0.2)]">
                              {scan.score}
                            </div>
                          ) : (
                            <div className="h-8 w-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                          )}
                          <Button 
                             onClick={() => router.push(`/dashboard/result/${scan.id}`)} 
                             variant="ghost" 
                             size="sm"
                             disabled={scan.score === null}
                             className="text-primary hover:bg-primary/10 rounded-lg p-2 h-10 w-10"
                          >
                             <Search className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-8 border-t border-white/5 space-y-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                       <div className="space-y-4 w-full md:max-w-md text-center md:text-left">
                          <div className="flex justify-between items-end mb-2">
                             <p className="text-2xl font-black tracking-tight italic uppercase">
                               Operation Progress
                             </p>
                             <span className="text-primary font-black text-xl italic">{Math.round((activeScans.filter(s => s.score !== null).length / activeScans.length) * 100)}%</span>
                          </div>
                          
                          {/* Progress Bar Container */}
                          <div className="w-full bg-foreground/5 rounded-full h-3 border border-border relative overflow-hidden shadow-inner">
                             <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(activeScans.filter(s => s.score !== null).length / activeScans.length) * 100}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="absolute top-0 bottom-0 bg-gradient-to-r from-primary via-accent to-primary background-animate rounded-full shadow-[0_0_20px_#2dd4bf88]"
                             />
                          </div>
                          
                          <p className="text-[10px] text-foreground/40 uppercase tracking-[0.3em] font-black italic">Waiting for encrypted handoff from all heuristic nodes.</p>
                       </div>
                       
                       <Button 
                          size="lg" 
                          onClick={() => router.push("/dashboard")}
                          className="h-20 px-12 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold border border-white/10 group transition-all"
                       >
                          <span>SKIP TO FULL HISTORY</span>
                          <Search className="ml-4 h-5 w-5 group-hover:scale-110 transition-transform" />
                       </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function FeatureTip({ icon: Icon, text }: { icon: any, text: string }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/5 border border-white/10 group hover:bg-white/10 transition-colors">
      <Icon className="h-4 w-4 text-primary opacity-80 group-hover:opacity-100 transition-opacity" />
      <span className="text-[10px] uppercase tracking-widest font-black text-foreground/60 group-hover:text-foreground/90 transition-colors">{text}</span>
    </div>
  );
}
