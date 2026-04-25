import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";
import { Baby, CheckCircle2, ChevronRight, Plus, Sparkles, Trash2, User } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

type ChildForm = {
  name: string;
  age: string;
  birthdate: string;
  gender: "male" | "female" | "other" | "";
  isClinicallyDiagnosed: boolean | null;
  diagnosisDetails: string;
};

const emptyChild = (): ChildForm => ({
  name: "",
  age: "",
  birthdate: "",
  gender: "",
  isClinicallyDiagnosed: null,
  diagnosisDetails: "",
});

export default function Onboarding() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    fullName: user?.name ?? "",
    birthdate: "",
    address: "",
    phone: "",
    email: user?.email ?? "",
  });
  const [children, setChildren] = useState<ChildForm[]>([emptyChild()]);

  const completeReg = trpc.user.completeRegistration.useMutation();
  const createChild = trpc.children.create.useMutation();

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.fullName || !profile.address || !profile.phone || !profile.email) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await completeReg.mutateAsync({
        fullName: profile.fullName,
        birthdate: profile.birthdate || new Date().toISOString().split("T")[0],
        address: profile.address,
        phone: profile.phone,
        email: profile.email,
      });
      setStep(2);
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  const handleChildrenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    for (const child of children) {
      if (!child.name || !child.age || !child.birthdate || !child.gender || child.isClinicallyDiagnosed === null) {
        toast.error("Please fill in all required fields for each child");
        return;
      }
    }
    try {
      for (const child of children) {
        await createChild.mutateAsync({
          name: child.name,
          age: parseInt(child.age),
          birthdate: child.birthdate,
          gender: child.gender as "male" | "female" | "other",
          isClinicallyDiagnosed: child.isClinicallyDiagnosed!,
          diagnosisDetails: child.diagnosisDetails || undefined,
        });
      }
      setStep(3);
    } catch {
      toast.error("Failed to save children. Please try again.");
    }
  };

  const updateChild = (index: number, field: keyof ChildForm, value: string | boolean | null) => {
    setChildren((prev) => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)));
  };

  const addChild = () => setChildren((prev) => [...prev, emptyChild()]);
  const removeChild = (index: number) => {
    if (children.length > 1) setChildren((prev) => prev.filter((_, i) => i !== index));
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground">ALIRA</span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step > s
                    ? "bg-primary text-primary-foreground"
                    : step === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
              {s < 3 && <div className={`w-12 h-0.5 ${step > s ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Guardian Profile */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Your Information</CardTitle>
                  <CardDescription>Tell us about yourself as a parent or guardian.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="fullName">Full Name <span className="text-destructive">*</span></Label>
                      <Input
                        id="fullName"
                        placeholder="Juan dela Cruz"
                        value={profile.fullName}
                        onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="birthdate">Birthdate</Label>
                      <Input
                        id="birthdate"
                        type="date"
                        value={profile.birthdate}
                        onChange={(e) => setProfile((p) => ({ ...p, birthdate: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="address">Address <span className="text-destructive">*</span></Label>
                      <Input
                        id="address"
                        placeholder="Quezon City, Metro Manila"
                        value={profile.address}
                        onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone">Phone Number <span className="text-destructive">*</span></Label>
                      <Input
                        id="phone"
                        placeholder="+63 9XX XXX XXXX"
                        value={profile.phone}
                        onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="juan@example.com"
                        value={profile.email}
                        onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={completeReg.isPending}>
                      {completeReg.isPending ? "Saving..." : "Continue"}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Child Profiles */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <Baby className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Register Your Child</CardTitle>
                  <CardDescription>
                    How many children in your household have autism? Add each one below.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChildrenSubmit} className="space-y-6">
                    {children.map((child, index) => (
                      <div key={index} className="p-4 rounded-xl border border-border bg-muted/30 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">Child {index + 1}</span>
                          {children.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeChild(index)}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="col-span-2 space-y-1.5">
                            <Label>Name <span className="text-destructive">*</span></Label>
                            <Input
                              placeholder="Child's full name"
                              value={child.name}
                              onChange={(e) => updateChild(index, "name", e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Age <span className="text-destructive">*</span></Label>
                            <Input
                              type="number"
                              placeholder="Age"
                              min={0}
                              max={18}
                              value={child.age}
                              onChange={(e) => updateChild(index, "age", e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Birthdate <span className="text-destructive">*</span></Label>
                            <Input
                              type="date"
                              value={child.birthdate}
                              onChange={(e) => updateChild(index, "birthdate", e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Gender <span className="text-destructive">*</span></Label>
                            <Select
                              value={child.gender}
                              onValueChange={(v) => updateChild(index, "gender", v)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <Label>Clinically Diagnosed? <span className="text-destructive">*</span></Label>
                            <Select
                              value={child.isClinicallyDiagnosed === null ? "" : child.isClinicallyDiagnosed ? "yes" : "no"}
                              onValueChange={(v) => updateChild(index, "isClinicallyDiagnosed", v === "yes")}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Yes / No" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {child.isClinicallyDiagnosed && (
                            <div className="col-span-2 space-y-1.5">
                              <Label>Diagnosis Details</Label>
                              <Input
                                placeholder="e.g., ASD Level 2"
                                value={child.diagnosisDetails}
                                onChange={(e) => updateChild(index, "diagnosisDetails", e.target.value)}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addChild}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-primary/40 text-primary text-sm hover:bg-primary/5 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Another Child
                    </button>

                    <Button type="submit" className="w-full" disabled={createChild.isPending}>
                      {createChild.isPending ? "Saving..." : "Continue"}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="border-border shadow-sm text-center">
                <CardContent className="pt-8 pb-8">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-normal text-foreground mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
                    Welcome to ALIRA!
                  </h2>
                  <p className="text-muted-foreground mb-8 leading-relaxed">
                    Your profile and child information have been saved. You're ready to begin your care journey.
                  </p>
                  <Button className="w-full" onClick={() => navigate("/dashboard")}>
                    Go to Dashboard
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
