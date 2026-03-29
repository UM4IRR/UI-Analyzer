"use client";

import * as React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Layout, LogOut, Menu, X, ArrowRight } from "lucide-react";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Close mobile menu on escape or resize
  React.useEffect(() => {
    const handleClose = () => setIsMobileMenuOpen(false);
    window.addEventListener("resize", handleClose);
    return () => window.removeEventListener("resize", handleClose);
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[60] border-b border-border/10 bg-background/60 backdrop-blur-xl transition-all duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-all duration-300">
              <Layout className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-black tracking-tighter font-heading italic uppercase">
              UXFLOW
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8 mr-4 text-sm font-medium text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors font-bold uppercase tracking-[0.2em] text-[10px]">Heuristics</a>
              <a href="#process" className="hover:text-foreground transition-colors font-bold uppercase tracking-[0.2em] text-[10px]">Process</a>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:flex items-center gap-4">
                {session ? (
                  <div className="flex items-center gap-3">
                    <Link href="/dashboard">
                      <Button variant="ghost" className="text-sm font-bold uppercase tracking-widest px-4 hover:bg-primary/10 hover:text-primary transition-all">
                        Dashboard
                      </Button>
                    </Link>
                    <Button 
                      variant="default" 
                      size="sm"
                      className="rounded-xl px-6 font-black uppercase tracking-widest text-[10px] glow-cyan transition-all hover:scale-105 active:scale-95"
                      onClick={() => signOut({ callbackUrl: '/' })}
                    >
                      <LogOut className="mr-2 h-3.5 w-3.5" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <>
                    <Link href="/login" className="hidden lg:block">
                      <Button variant="ghost" className="text-[10px] font-black uppercase tracking-[0.2em] px-4">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button className="rounded-xl px-8 font-black uppercase tracking-widest text-[10px] glow-cyan shadow-lg shadow-primary/10 transition-all hover:scale-105 active:scale-95">
                        Jump In
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden h-10 w-10 rounded-xl"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[55] bg-background/95 backdrop-blur-2xl pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col gap-6">
               <a 
                 href="#features" 
                 onClick={() => setIsMobileMenuOpen(false)}
                 className="text-4xl font-black tracking-tighter uppercase italic text-foreground/40 hover:text-primary transition-colors flex items-center justify-between group"
               >
                 Heuristics
                 <ArrowRight className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" />
               </a>
               <a 
                 href="#process" 
                 onClick={() => setIsMobileMenuOpen(false)}
                 className="text-4xl font-black tracking-tighter uppercase italic text-foreground/40 hover:text-primary transition-colors flex items-center justify-between group"
               >
                 Process
                 <ArrowRight className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" />
               </a>
               
               <div className="h-[2px] w-12 bg-primary/20 my-4" />
               
               {session ? (
                 <>
                   <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-bold">Dashboard</Link>
                   <Button 
                      variant="outline" 
                      className="h-16 rounded-2xl text-lg font-bold border-primary/20"
                      onClick={() => signOut({ callbackUrl: '/' })}
                   >
                     Sign Out
                   </Button>
                 </>
               ) : (
                 <div className="grid grid-cols-2 gap-4 pt-4">
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full h-16 rounded-2xl text-lg font-bold border-border/50">Login</Button>
                    </Link>
                    <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full h-16 rounded-2xl text-lg font-bold bg-primary glow-cyan">Join Us</Button>
                    </Link>
                 </div>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
