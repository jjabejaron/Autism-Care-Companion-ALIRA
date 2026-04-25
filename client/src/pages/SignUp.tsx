import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { tokenStore } from "@/lib/tokenStore";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Eye, EyeOff, ArrowRight, Mail, Lock, User } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function SignUp() {
  const [, navigate] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { isAuthenticated, loading } = useAuth();

  // Redirect already-authenticated users to dashboard
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, loading, navigate]);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const utils = trpc.useUtils();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDuplicate, setIsDuplicate] = useState(false);

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: async (data) => {
      setErrorMsg(null);
      setIsDuplicate(false);
      // Store token in localStorage for Authorization header
      if (data.token) {
        tokenStore.set(data.token);
      }
      await utils.auth.me.invalidate();
      toast.success("Welcome to ALIRA! Let's set up your profile.");
      navigate("/onboarding");
    },
    onError: (err) => {
      const isDupe = err.message?.toLowerCase().includes("already exists") ||
        (err.data as { code?: string } | undefined)?.code === "CONFLICT";
      setIsDuplicate(isDupe);
      setErrorMsg(err.message || "Registration failed. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsDuplicate(false);
    if (form.password !== form.confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }
    registerMutation.mutate({
      fullName: form.fullName,
      email: form.email,
      password: form.password,
    });
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
            <div className="w-10 h-10 flex items-center justify-center">
              <img src="/manus-storage/alira_logo_983ee8e3.png" alt="ALIRA" className="w-10 h-10 object-contain" />
            </div>
            <span className="text-white text-xl font-semibold tracking-wide">ALIRA</span>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl font-normal text-white mb-6 leading-tight"
              style={{ fontFamily: "'DM Serif Display', serif" }}>
              Every child's journey<br />deserves the best<br />support.
            </h1>
            <p className="text-white/80 text-lg leading-relaxed">
              Be one of the Filipino families who support their children's growth and development through ALIRA.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { value: "0", label: "Families" },
            { value: "6", label: "Modules" },
            { value: "ALI", label: "AI Companion" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.15)" }}>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-white/70 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
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
            <div className="w-8 h-8 flex items-center justify-center">
              <img src="/manus-storage/alira_logo_983ee8e3.png" alt="ALIRA" className="w-8 h-8 object-contain" />
            </div>
            <span className="text-foreground font-semibold">ALIRA</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-normal text-foreground mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>
              Create your account
            </h2>
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <button onClick={() => navigate("/login")} className="font-medium hover:underline" style={{ color: "#0d7377" }}>
                Sign in
              </button>
            </p>
          </div>

          <Card className="border-border/50 shadow-lg shadow-black/5">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Inline error banner */}
                {errorMsg && (
                  <div className="rounded-xl p-3.5 text-sm" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
                    <p className="font-medium" style={{ color: "#dc2626" }}>
                      {isDuplicate ? "This email is already registered." : errorMsg}
                    </p>
                    {isDuplicate && (
                      <p className="mt-1" style={{ color: "#dc2626" }}>
                        <button
                          type="button"
                          onClick={() => navigate("/login")}
                          className="underline font-medium hover:opacity-80"
                        >
                          Sign in instead
                        </button>
                        {" "}or use a different email address.
                      </p>
                    )}
                  </div>
                )}

                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium text-foreground">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Maria Santos"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      className="pl-10 h-11 border-border/60 focus:border-teal-500 focus:ring-teal-500/20"
                      required
                    />
                  </div>
                </div>

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
                      className="pl-10 h-11 border-border/60 focus:border-teal-500 focus:ring-teal-500/20"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">You can use your Google email address.</p>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 8 characters"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="pl-10 pr-10 h-11 border-border/60"
                      required
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

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Re-enter your password"
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      className="pl-10 pr-10 h-11 border-border/60"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Password strength indicator */}
                {form.password.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className="h-1 flex-1 rounded-full transition-colors"
                          style={{
                            background: form.password.length >= level * 2
                              ? level <= 2 ? "#f59e0b" : "#10b981"
                              : "#e5e7eb"
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {form.password.length < 4 ? "Too short" :
                        form.password.length < 6 ? "Weak" :
                          form.password.length < 8 ? "Fair" : "Strong password"}
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 text-white font-medium gap-2"
                  style={{ background: "#0d7377" }}
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account...
                    </span>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-6">
            By creating an account, you agree to our{" "}
            <span className="underline cursor-pointer">Terms of Service</span>{" "}
            and{" "}
            <span className="underline cursor-pointer">Privacy Policy</span>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
