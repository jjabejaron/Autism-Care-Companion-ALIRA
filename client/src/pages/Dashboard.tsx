import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import AppShell from "@/components/AppShell";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Baby,
  BookOpen,
  Calendar,
  ChevronRight,
  Heart,
  MapPin,
  MessageCircle,
  Settings,
  TrendingUp,
  X,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<number>>(new Set());

  const { data: children = [] } = trpc.children.list.useQuery();
  const selectedChild = children[selectedChildIndex];

  const { data: scores = [] } = trpc.progress.getByChild.useQuery(
    { childId: selectedChild?.id ?? 0 },
    { enabled: !!selectedChild }
  );

  const { data: appointments = [] } = trpc.appointments.list.useQuery();
  const { data: notifications = [] } = trpc.notifications.list.useQuery();

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const upcomingAppts = appointments.filter((a) => a.status !== "cancelled" && a.status !== "completed").slice(0, 3);
  const recentScores = scores.slice(0, 5);
  const avgScore = recentScores.length > 0 ? Math.round(recentScores.reduce((s, r) => s + r.score, 0) / recentScores.length) : 0;

  const showAlert = selectedChild && !selectedChild.isClinicallyDiagnosed && !dismissedAlerts.has(selectedChild.id);

  const dismissAlert = (id: number) => {
    setDismissedAlerts((s) => {
      const next = new Set(Array.from(s));
      next.add(id);
      return next;
    });
  };

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-normal text-foreground" style={{ fontFamily: "'DM Serif Display', serif" }}>
              Good day, {user?.name?.split(" ")[0] ?? "Parent"} 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Here's an overview of your child's care journey.</p>
          </div>
          {unreadCount > 0 && (
            <Badge className="bg-primary/10 text-primary border-primary/20">
              {unreadCount} new notification{unreadCount > 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        {/* Child tabs */}
        {children.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {children.map((child, i) => (
              <button
                key={child.id}
                onClick={() => setSelectedChildIndex(i)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  i === selectedChildIndex
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <Baby className="w-3.5 h-3.5" />
                {child.name}
                {!child.isClinicallyDiagnosed && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                )}
              </button>
            ))}
            <button
              onClick={() => navigate("/onboarding")}
              className="flex items-center gap-1 px-3 py-2 rounded-full text-xs text-muted-foreground hover:text-foreground border border-dashed border-border hover:border-primary/40 transition-colors"
            >
              + Add Child
            </button>
          </div>
        )}

        {/* Undiagnosed alert */}
        {showAlert && selectedChild && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-4 p-4 rounded-xl bg-amber-50 border border-amber-200"
          >
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900">
                {selectedChild.name} is not yet clinically diagnosed
              </p>
              <p className="text-sm text-amber-700 mt-1">
                We recommend scheduling an appointment with an autism specialist for a proper assessment.
              </p>
              <div className="flex gap-3 mt-3">
                <Button
                  size="sm"
                  className="bg-amber-600 text-white hover:bg-amber-700 h-8 text-xs"
                  onClick={() => navigate("/appointments")}
                >
                  Schedule Appointment
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs text-amber-700 hover:text-amber-900"
                  onClick={() => dismissAlert(selectedChild.id)}
                >
                  Not Now
                </Button>
              </div>
            </div>
            <button
              onClick={() => dismissAlert(selectedChild.id)}
              className="text-amber-400 hover:text-amber-600"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* No children state */}
        {children.length === 0 && (
          <Card className="border-border">
            <CardContent className="py-12 text-center">
              <Baby className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No child profiles yet</h3>
              <p className="text-muted-foreground text-sm mb-6">Add your child's profile to get started with ALIRA.</p>
              <Button onClick={() => navigate("/onboarding")}>Add Child Profile</Button>
            </CardContent>
          </Card>
        )}

        {/* Stats grid */}
        {selectedChild && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<Activity className="w-5 h-5 text-primary" />}
              label="Avg. Activity Score"
              value={avgScore > 0 ? `${avgScore}%` : "—"}
              sub={`${recentScores.length} activities completed`}
              color="bg-primary/8"
            />
            <StatCard
              icon={<BookOpen className="w-5 h-5 text-blue-600" />}
              label="Modules Available"
              value="6"
              sub="Across 2 age groups"
              color="bg-blue-50"
            />
            <StatCard
              icon={<Calendar className="w-5 h-5 text-purple-600" />}
              label="Upcoming Appointments"
              value={upcomingAppts.length.toString()}
              sub={upcomingAppts.length === 0 ? "None scheduled" : "Scheduled"}
              color="bg-purple-50"
            />
            <StatCard
              icon={<Heart className="w-5 h-5 text-rose-600" />}
              label="Child Profile"
              value={selectedChild.isClinicallyDiagnosed ? "Diagnosed" : "Undiagnosed"}
              sub={`Age ${selectedChild.age}`}
              color="bg-rose-50"
            />
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent activity */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
                <button
                  onClick={() => navigate("/progress")}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  View all <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {recentScores.length === 0 ? (
                <div className="text-center py-6">
                  <TrendingUp className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No activity scores yet</p>
                  <button
                    onClick={() => navigate("/modules")}
                    className="text-xs text-primary hover:underline mt-2"
                  >
                    Start a module →
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentScores.map((score) => (
                    <div key={score.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Activity className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground">Module #{score.moduleId}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(score.completedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className={`text-sm font-semibold ${score.score >= 70 ? "text-green-600" : score.score >= 40 ? "text-amber-600" : "text-red-500"}`}>
                        {score.score}%
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming appointments */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Upcoming Appointments</CardTitle>
                <button
                  onClick={() => navigate("/appointments")}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  View all <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {upcomingAppts.length === 0 ? (
                <div className="text-center py-6">
                  <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No upcoming appointments</p>
                  <button
                    onClick={() => navigate("/appointments")}
                    className="text-xs text-primary hover:underline mt-2"
                  >
                    Book an appointment →
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingAppts.map((appt) => (
                    <div key={appt.id} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">{appt.clinicName}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(appt.appointmentDate).toLocaleDateString()} at {appt.preferredTime}
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${appt.status === "confirmed" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}
                      >
                        {appt.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick nav cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { icon: BookOpen, label: "Modules", path: "/modules", color: "text-blue-600 bg-blue-50" },
            { icon: TrendingUp, label: "Progress", path: "/progress", color: "text-green-600 bg-green-50" },
            { icon: MapPin, label: "Clinics", path: "/clinics", color: "text-teal-600 bg-teal-50" },
            { icon: Calendar, label: "Appointments", path: "/appointments", color: "text-purple-600 bg-purple-50" },
            { icon: MessageCircle, label: "Talk to ALI", path: "/chat", color: "text-primary bg-primary/10" },
            { icon: Settings, label: "Settings", path: "/settings", color: "text-gray-600 bg-gray-50" },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border hover:shadow-sm transition-all hover:-translate-y-0.5 text-center"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-foreground">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <Card className="border-border">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
            {icon}
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{value}</div>
            <div className="text-xs font-medium text-foreground mt-0.5">{label}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
