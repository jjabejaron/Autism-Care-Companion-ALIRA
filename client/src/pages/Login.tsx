import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { tokenStore } from "@/lib/tokenStore";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Eye, EyeOff, ArrowRight, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function Login() {
  const [, navigate] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const { isAuthenticated, loading } = useAuth();

  // Redirect already-authenticated users to dashboard
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, loading, navigate]);

  const utils = trpc.useUtils();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async (data) => {
      setErrorMsg(null);
      // Store token in localStorage for Authorization header
      if (data.token) {
        tokenStore.set(data.token);
      }
      await utils.auth.me.invalidate();
      toast.success("Welcome back to ALIRA!");
      navigate("/dashboard");
    },
    onError: (err) => {
      setErrorMsg("Invalid email or password. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    loginMutation.mutate({ email: form.email, password: form.password });
  };

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #f0f9f8 0%, #e8f5f3 50%, #f5f0ff 100%)" }}>
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0d7377 0%, #14a085 60%, #1a8a6e 100%)" }}>
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: "white", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: "white", transform: "translate(-30%, 30%)" }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)" }}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-white text-xl font-semibold tracking-wide">ALIRA</span>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl font-normal text-white mb-6 leading-tight"
              style={{ fontFamily: "'DM Serif Display', serif" }}>
              Welcome back.<br />Your child's journey<br />continues here.
            </h1>
            <p className="text-white/80 text-lg leading-relaxed">
              Sign in to access your child's progress, learning modules, and connect with ALI — your autism care companion.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10">
          <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.15)" }}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: "rgba(255,255,255,0.25)" }}>
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-medium text-sm mb-1">ALI, your AI companion</p>
                <p className="text-white/70 text-sm leading-relaxed">
                  "I'm here to help you navigate your child's autism care journey with evidence-based guidance and compassionate support."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#0d7377" }}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-foreground font-semibold">ALIRA</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-normal text-foreground mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>
              Sign in to ALIRA
            </h2>
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <button onClick={() => navigate("/signup")} className="font-medium hover:underline" style={{ color: "#0d7377" }}>
                Create one free
              </button>
            </p>
          </div>

          <Card className="border-border/50 shadow-lg shadow-black/5">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Inline error banner */}
                {errorMsg && (
                  <div className="rounded-xl p-3.5 text-sm" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
                    <p className="font-medium" style={{ color: "#dc2626" }}>{errorMsg}</p>
                  </div>
                )}

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="maria@gmail.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="pl-10 h-11 border-border/60"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
                    <button
                      type="button"
                      className="text-xs hover:underline"
                      style={{ color: "#0d7377" }}
                      onClick={() => toast.info("Password reset coming soon. Please contact support.")}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="pl-10 pr-10 h-11 border-border/60"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-white font-medium gap-2"
                  style={{ background: "#0d7377" }}
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Admin access note */}
          <div className="mt-6 p-4 rounded-xl border border-border/50 bg-white/60">
            <p className="text-xs text-muted-foreground text-center">
              <span className="font-medium text-foreground">Admin access?</span>{" "}
              <button onClick={() => navigate("/admin")} className="hover:underline" style={{ color: "#0d7377" }}>
                Go to Admin Panel
              </button>
            </p>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Protected by secure session encryption.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
