import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Brain, Calendar, Heart, MapPin, MessageCircle, QrCode, Shield, Sparkles, Users } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

const features = [
  {
    icon: Brain,
    title: "Evidence-Based Modules",
    description: "Structured learning activities grounded in proven therapeutic approaches like DIR/Floortime, TEACCH, and NDBI.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: MessageCircle,
    title: "ALI — Your AI Companion",
    description: "Chat with ALI, an AI companion trained to support parents and caregivers with autism-specific guidance, 24/7.",
    color: "bg-teal-50 text-teal-600",
  },
  {
    icon: MapPin,
    title: "Nearby Clinic Finder",
    description: "Discover autism-specialized clinics and therapy centers near you across the Philippines, with maps and details.",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: QrCode,
    title: "QR Demographics Card",
    description: "Generate a child referral QR code pre-loaded with demographics. Show it at clinic reception to skip lengthy intake forms and speed up registration.",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: Heart,
    title: "Progress Tracking",
    description: "Record activity scores and monitor your child's development journey with clear, visual progress reports.",
    color: "bg-rose-50 text-rose-600",
  },
  {
    icon: Users,
    title: "Multi-Child Profiles",
    description: "Manage profiles for multiple children in your household, each with their own progress, modules, and appointments.",
    color: "bg-amber-50 text-amber-600",
  },
];

const stats = [
  { value: "1 in 100", label: "Children in the Philippines have autism" },
  { value: "Early", label: "Intervention makes the biggest difference" },
  { value: "6", label: "Evidence-based modules across age groups" },
  { value: "24/7", label: "AI companion support for caregivers" },
];

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, loading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <img src="/manus-storage/alira_logo_983ee8e3.png" alt="ALIRA" className="w-8 h-8 object-contain" />
            </div>
            <span className="font-semibold text-foreground tracking-tight">
              ALIRA
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => navigate("/login")}>
              Sign In
            </Button>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => navigate("/signup")}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl translate-x-1/3 -translate-y-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-accent/20 blur-3xl -translate-x-1/4 translate-y-1/4" />
        </div>

        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
                <img src="/manus-storage/alira_logo_983ee8e3.png" alt="" className="w-4 h-4 object-contain" />
                Autism Care Companion for Filipino Families
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-normal text-foreground leading-tight mb-6"
                style={{ fontFamily: "'DM Serif Display', serif" }}>
                Supporting your child's{" "}
                <em className="text-primary not-italic">journey</em>{" "}
                with care
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
                ALIRA brings together evidence-based learning modules, AI-powered guidance, clinic discovery, and progress tracking — everything a parent or guardian needs in one compassionate platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-12 text-base" onClick={() => navigate("/signup")}>
                  Start Your Journey
                </Button>
                <Button size="lg" variant="outline" className="px-8 h-12 text-base border-border" onClick={() => navigate("/login")}>
                  Sign In
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-primary/5 border-y border-border">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-primary mb-1" style={{ fontFamily: "'DM Serif Display', serif" }}>
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-normal text-foreground mb-4" style={{ fontFamily: "'DM Serif Display', serif" }}>
              Everything you need, in one place
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              ALIRA is designed specifically for parents and guardians navigating autism care in the Philippines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl p-6 border border-border hover:shadow-md transition-shadow"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ALI Section */}
      <section className="py-24 bg-gradient-to-br from-primary/8 to-accent/15">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-sm font-medium mb-6">
                  <MessageCircle className="w-4 h-4" />
                  Meet ALI
                </div>
                <h2 className="text-4xl font-normal text-foreground mb-4" style={{ fontFamily: "'DM Serif Display', serif" }}>
                  Your AI companion for autism care
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  ALI is a compassionate AI trained specifically to support Filipino parents and guardians of children with autism. Ask questions about therapies, daily routines, behavior strategies, or simply get encouragement when you need it most.
                </p>
                <ul className="space-y-3">
                  {[
                    "Evidence-based autism care guidance",
                    "Culturally sensitive to Filipino families",
                    "Available 24/7 whenever you need support",
                    "Remembers your conversation history",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-foreground">
                      <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Chat preview */}
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">ALI</div>
                    <div className="text-xs text-muted-foreground">Autism Care Companion</div>
                  </div>
                  <div className="ml-auto w-2 h-2 rounded-full bg-green-500" />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm max-w-[80%]">
                      My child has a meltdown every time we leave the park. What can I do?
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-4 h-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm max-w-[80%] text-foreground">
                      Transitions are one of the most common challenges. Try giving a "2-minute warning" before leaving — this helps their brain prepare for the change rather than being surprised by it.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <Shield className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-4xl font-normal text-foreground mb-4" style={{ fontFamily: "'DM Serif Display', serif" }}>
              Begin your child's care journey today
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Join families across the Philippines who are using ALIRA to support their children's growth and development with confidence.
            </p>
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 h-12 text-base" onClick={() => navigate("/signup")}>
              Create Your Free Account
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground">ALIRA</span>
            <span className="text-sm text-muted-foreground">— Autism Care Companion</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Designed with care for Filipino families. © {new Date().getFullYear()} ALIRA.
          </p>
        </div>
      </footer>
    </div>
  );
}
