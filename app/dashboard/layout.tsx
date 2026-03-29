"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PlusCircle, LogOut, History as HistoryIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status === "loading") {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">Loading...</div>;
  }

  if (status === "unauthenticated") {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null;
  }

  const navItems = [
    { name: "Scan History", href: "/dashboard", icon: HistoryIcon },
    { name: "New Analysis", href: "/dashboard/new", icon: PlusCircle },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      {/* Sidebar - Floating Glass Effect */}
      <aside className="w-72 border-r border-white/5 bg-sidebar/40 backdrop-blur-2xl hidden md:flex flex-col print:hidden m-4 rounded-2xl shadow-2xl relative z-10">
        <Link href="/" className="h-20 flex items-center px-8 border-b border-white/5 font-extrabold tracking-tight text-xl bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent italic hover:opacity-80 transition-opacity">
          UXFLOW
        </Link>
        <div className="flex-1 py-8 px-6 space-y-4">
          <p className="text-[10px] uppercase tracking-widest text-foreground/60 font-black px-4 mb-2">Workspace</p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <span className={`group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden ${
                  isActive 
                    ? 'bg-primary/10 text-primary font-bold glow-cyan border border-primary/20' 
                    : 'text-foreground/70 hover:bg-white/5 hover:text-foreground'
                }`}>
                  <item.icon className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-primary' : 'text-foreground/60 group-hover:text-foreground'}`} />
                  <span className="text-sm">{item.name}</span>
                  {isActive && <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary rounded-l-full shadow-[0_0_10px_#2dd4bf]" />}
                </span>
              </Link>
            );
          })}
        </div>
        
        <div className="p-6 mt-auto border-t border-white/5 bg-black/10">
          <div className="flex items-center gap-4 mb-6 px-2 group cursor-default">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-black text-white shadow-lg group-hover:scale-110 transition-transform duration-300 border border-white/10">
              {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || "U"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold truncate text-foreground/90 leading-tight">{session?.user?.name || 'User'}</span>
              <span className="text-[10px] truncate text-foreground/50 font-medium tracking-tight">{session?.user?.email}</span>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full justify-start text-foreground/80 border-white/10 hover:bg-destructive/10 hover:text-white hover:border-destructive/30 transition-all duration-300 rounded-xl px-4" 
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            <LogOut className="mr-3 h-4 w-4" /> 
            <span className="text-xs font-black uppercase tracking-widest italic">Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative h-screen overflow-hidden">
        {/* Subtle Background Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <header className="h-20 border-b border-white/5 bg-background/50 backdrop-blur-md flex items-center justify-between px-6 md:hidden print:hidden shrink-0 z-20">
           <Link href="/" className="font-black italic bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent tracking-tighter hover:opacity-80 transition-opacity">
              UXFLOW
           </Link>
           
           <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-black text-primary">
                {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || "U"}
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 w-8 rounded-lg text-foreground/40 hover:text-red-400 hover:bg-red-400/5 transition-colors p-0" 
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                <LogOut className="h-4 w-4" />
              </Button>
           </div>
        </header>
        
        <div className="flex-1 overflow-auto p-8 md:p-12 relative">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
