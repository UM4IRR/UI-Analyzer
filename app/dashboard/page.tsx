"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, ExternalLink, Activity, Search, Sparkles, TrendingUp, History } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchHistory() {
    try {
      const res = await fetch("/api/analysis");
      const data = await res.json();
      if (res.ok) {
        setHistory(data.history);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchHistory();
    
    // Auto-refresh interval if there are pending items
    const hasPending = history.some(h => h.score === null);
    if (!hasPending) {
       console.log("No pending scans detected. Frequency modulation stabilized.");
       return;
    }

    console.log("Pending scans detected. Pulsing sync sequence...");
    const interval = setInterval(fetchHistory, 4000);
    return () => clearInterval(interval);
  }, [JSON.stringify(history.map(h => h.id + h.score))]); // Trigger when any score changes or item added

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to permanently erase this analysis?")) return;
    try {
      const res = await fetch(`/api/analysis/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Analysis purged from registry");
        setHistory(history.filter(h => h.id !== id));
      }
    } catch {
      toast.error("Failed to delete analysis data");
    }
  }

  const averageScore = history.length > 0 
    ? Math.round(history.reduce((acc, curr) => acc + (curr.score || 0), 0) / history.length) 
    : 0;
  
  const highScored = history.filter(h => (h.score || 0) >= 80).length;

  return (
    <div className="space-y-12">
      {/* Header & Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/80 to-foreground/40 bg-clip-text text-transparent italic uppercase">
            Intelligence Pool
          </h1>
          <p className="text-foreground/50 mt-2 font-medium flex items-center gap-2 italic uppercase tracking-widest text-[10px]">
            <Activity className="h-3 w-3 text-primary animate-pulse" /> Autonomous heuristic network synchronized
          </p>
        </motion.div>
        
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Link href="/dashboard/new">
            <Button size="lg" className="rounded-xl px-10 font-black glow-cyan transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 uppercase tracking-tight italic">
              <Sparkles className="h-4 w-4" /> Deploy New Scan
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={History} label="Node Population" value={history.length} sub="Total units in registry" color="primary" />
        <StatCard icon={TrendingUp} label="Aggregate Health" value={`${averageScore}%`} sub="Mean UX performance" color="accent" />
        <StatCard icon={Sparkles} label="Optimum Signals" value={highScored} sub="Units exceeding 80% parity" color="emerald" />
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-20 text-center border-dashed relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 glow-cyan">
            <Search className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-500" />
          </div>
          <h2 className="text-2xl font-bold mb-3 uppercase tracking-tighter italic">No scans detected</h2>
          <p className="text-foreground/80 max-w-md mx-auto font-medium leading-relaxed italic border-l border-primary/20 pl-4">Your intelligence registry is currently empty. Initiate your first heuristic scan to populate the dashboard.</p>
          <div className="mt-8">
            <Link href="/dashboard/new">
              <Button variant="outline" className="rounded-xl border-white/10 hover:bg-white/5 px-8 font-black tracking-widest uppercase text-xs italic">Begin Sequence</Button>
            </Link>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          layout
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence>
            {history.map((item, idx) => (
              <HistoryCard key={item.id} item={item} idx={idx} onDelete={() => handleDelete(item.id)} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass-card rounded-2xl p-6 border border-border bg-card/50 backdrop-blur-md relative group overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      <div className="flex items-center gap-4 mb-3">
        <div className={`p-2 rounded-lg bg-${color}/10 border border-${color}/20`}>
          <Icon className={`h-5 w-5 text-${color === 'emerald' ? 'emerald-400' : 'inherit'}`} />
        </div>
        <span className="text-[10px] uppercase tracking-[0.3em] font-black text-foreground/40">{label}</span>
      </div>
      <p className="text-3xl font-black mb-1 text-foreground italic">{value}</p>
      <p className="text-xs text-foreground/40 font-medium italic opacity-60">{sub}</p>
    </motion.div>
  );
}

function HistoryCard({ item, idx, onDelete }: any) {
  const isPending = item.score === null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, delay: idx * 0.05 }}
      className="glass-card rounded-2xl overflow-hidden border border-border group flex flex-col h-full bg-card/40 backdrop-blur-md"
    >
      <div className="p-6 pb-4 border-b border-border flex-1">
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-col min-w-0">
             <div className="flex items-center gap-2 mb-1">
               <div className={`h-1.5 w-1.5 rounded-full shrink-0 shadow-[0_0_5px_currentColor] ${isPending ? 'bg-primary animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
               <p className="text-[10px] font-black uppercase tracking-widest text-foreground/50">{isPending ? 'UPLINK ACTIVE' : 'URL REGISTRY'}</p>
             </div>
             <p className="text-sm font-bold truncate text-foreground/90 leading-tight pr-4 font-mono opacity-80" title={item.url}>{item.url}</p>
          </div>
          
          <div className={`shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-xl relative overflow-hidden border transition-all duration-500 ${
            isPending ? 'border-primary/40 bg-primary/20' :
            item.score >= 80 ? 'border-emerald-500/20 bg-emerald-500/10' :
            item.score >= 60 ? 'border-yellow-500/20 bg-yellow-500/10' :
            'border-red-500/20 bg-red-500/10'
          }`}>
             {isPending ? (
               <Activity className="h-5 w-5 text-primary animate-spin-slow" />
             ) : (
               <>
                 <span className={`text-base font-black italic ${
                   item.score >= 80 ? 'text-emerald-400' :
                   item.score >= 60 ? 'text-yellow-400' :
                   'text-red-400'
                 }`}>{item.score}</span>
                 <span className="text-[8px] font-bold text-foreground/30 tracking-widest">SCORE</span>
               </>
             )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-foreground/40 tracking-widest italic uppercase opacity-50">
          <History className="h-3 w-3" />
          {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          {isPending && <span className="ml-auto text-primary animate-pulse">Scanning...</span>}
        </div>
      </div>
      
      <div className="px-6 py-4 bg-foreground/5 flex items-center justify-between gap-3">
        <Link href={isPending ? '#' : `/dashboard/result/${item.id}`} className={`flex-1 ${isPending ? 'cursor-not-allowed opacity-40' : ''}`}>
          <Button 
            variant="ghost" 
            disabled={isPending}
            className="w-full justify-start rounded-lg text-xs font-black uppercase tracking-widest text-primary/80 hover:text-primary hover:bg-primary/10 transition-colors italic"
          >
            {isPending ? 'Access Locked' : 'Full Intelligence'} <ExternalLink className="ml-2 h-3 w-3" />
          </Button>
        </Link>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-lg text-foreground/20 hover:text-red-400 hover:bg-red-400/5 h-8 w-8 transition-colors" 
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </motion.div>
  );
}
