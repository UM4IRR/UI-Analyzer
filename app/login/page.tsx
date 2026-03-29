"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Cpu, Globe, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      toast.error("Invalid email or password.");
    } else {
      router.push("/dashboard");
      toast.success("Welcome back!");
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background px-4 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="glass-card border-white/10 rounded-[2.5rem] shadow-3xl overflow-hidden">
          <CardHeader className="pt-12 px-10 text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 glow-cyan animate-float">
               <Cpu className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-3xl font-black tracking-tighter mb-2 italic bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent underline decoration-primary/30 underline-offset-8">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm font-medium mt-4">
              Log in to your UXFlow account to continue.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-10 pb-12 pt-4">
            <form className="space-y-6" onSubmit={onSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-2">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      required
                      className="bg-black/40 border-white/5 h-14 pl-12 rounded-xl focus-visible:ring-primary/40 focus-visible:border-primary/50 transition-all font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" title="password" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-2">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="bg-black/40 border-white/5 h-14 pl-12 rounded-xl focus-visible:ring-primary/40 focus-visible:border-primary/50 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-primary hover:glow-cyan text-white font-black text-sm tracking-widest uppercase transition-all duration-300 active:scale-95 group rounded-xl"
              >
                {loading ? "Signing in..." : "Sign In"}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>

            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black">
                <span className="bg-[#12141d] px-4 text-muted-foreground italic">Secure Access</span>
              </div>
            </div>

            <Button
              variant="outline"
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full h-14 border-white/5 bg-white/2 text-foreground/80 hover:bg-white/5 hover:border-white/10 rounded-xl font-bold flex items-center justify-center gap-3 transition-colors text-xs tracking-wide"
            >
              <Globe className="h-4 w-4 text-primary" />
              Sign in with Google
            </Button>

            <div className="mt-8 text-center text-xs font-bold text-muted-foreground">
               No account?{" "}
              <Link href="/register" className="text-primary hover:text-primary underline decoration-primary/30 underline-offset-4 font-black uppercase tracking-tighter">
                Create Account
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
