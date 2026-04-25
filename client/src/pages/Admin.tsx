import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Activity, Baby, Calendar, Lock, LogOut, Shield, Sparkles, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminToken, setAdminToken] = useState("");
  const [credentials, setCredentials] = useState({ username: "", password: "" });

  const loginMutation = trpc.admin.login.useMutation({
    onSuccess: (data) => {
      setAdminToken(data.token);
      setIsLoggedIn(true);
      toast.success("Welcome, Administrator");
    },
    onError: () => toast.error("Invalid admin credentials"),
  });

  const { data: usersData } = trpc.admin.getUsers.useQuery(
    { adminToken },
    { enabled: isLoggedIn && !!adminToken }
  );
  const { data: childrenData } = trpc.admin.getChildren.useQuery(
    { adminToken },
    { enabled: isLoggedIn && !!adminToken }
  );
  const { data: appointmentsData } = trpc.admin.getAppointments.useQuery(
    { adminToken },
    { enabled: isLoggedIn && !!adminToken }
  );
  const { data: scoresData } = trpc.admin.getActivityScores.useQuery(
    { adminToken },
    { enabled: isLoggedIn && !!adminToken }
  );
  const adminData = {
    users: usersData ?? [],
    children: childrenData ?? [],
    appointments: appointmentsData ?? [],
    scores: scoresData ?? [],
    stats: {
      totalUsers: usersData?.length ?? 0,
      totalChildren: childrenData?.length ?? 0,
      totalAppointments: appointmentsData?.length ?? 0,
      totalScores: scoresData?.length ?? 0,
    },
  };

  const utils = trpc.useUtils();
  const updateApptStatus = trpc.admin.updateAppointmentStatus.useMutation({
    onSuccess: () => {
      toast.success("Appointment status updated");
      utils.admin.getAppointments.invalidate();
    },
    onError: () => toast.error("Failed to update status"),
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({
      username: credentials.username,
      password: credentials.password,
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">ALIRA</span>
            <Badge variant="outline" className="ml-1 text-xs">Admin</Badge>
          </div>

          <Card className="border-border shadow-sm">
            <CardHeader className="pb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-xl">Admin Login</CardTitle>
              <p className="text-sm text-muted-foreground">Enter your administrator credentials to continue.</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Username</Label>
                  <Input
                    placeholder="admin"
                    value={credentials.username}
                    onChange={(e) => setCredentials((c) => ({ ...c, username: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={credentials.password}
                    onChange={(e) => setCredentials((c) => ({ ...c, password: e.target.value }))}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                  <Lock className="w-4 h-4 mr-2" />
                  {loginMutation.isPending ? "Signing in..." : "Sign In as Admin"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-4">
            This area is restricted to authorized administrators only.
          </p>
        </div>
      </div>
    );
  }

  const stats = [
    { icon: Users, label: "Total Users", value: adminData?.stats.totalUsers ?? 0, color: "bg-blue-50 text-blue-600" },
    { icon: Baby, label: "Child Profiles", value: adminData?.stats.totalChildren ?? 0, color: "bg-green-50 text-green-600" },
    { icon: Calendar, label: "Appointments", value: adminData?.stats.totalAppointments ?? 0, color: "bg-purple-50 text-purple-600" },
    { icon: Activity, label: "Activity Scores", value: adminData?.stats.totalScores ?? 0, color: "bg-amber-50 text-amber-600" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Admin header */}
      <header className="bg-primary text-primary-foreground py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold">ALIRA Admin Panel</span>
              <span className="text-xs text-primary-foreground/70 ml-2">Management Console</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary-foreground hover:bg-white/10"
            onClick={() => { setIsLoggedIn(false); setAdminToken(""); }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <Card key={i} className="border-border">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users">
          <TabsList className="mb-6">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="children">Children</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="scores">Activity Scores</TabsTrigger>
          </TabsList>

          {/* Users */}
          <TabsContent value="users">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base">Registered Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">ID</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Name</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Email</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Role</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(adminData?.users ?? []).map((u) => (
                        <tr key={u.id} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="py-2.5 px-3 text-muted-foreground">#{u.id}</td>
                          <td className="py-2.5 px-3 font-medium text-foreground">{u.name ?? "—"}</td>
                          <td className="py-2.5 px-3 text-muted-foreground">{u.email ?? "—"}</td>
                          <td className="py-2.5 px-3">
                            <Badge variant="outline" className={u.role === "admin" ? "text-primary border-primary/30" : ""}>
                              {u.role}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-3 text-muted-foreground">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(adminData?.users ?? []).length === 0 && (
                    <p className="text-center text-muted-foreground py-8 text-sm">No users found.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Children */}
          <TabsContent value="children">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base">Child Profiles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Name</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Age</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Gender</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Diagnosed</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Added</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(adminData?.children ?? []).map((c) => (
                        <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="py-2.5 px-3 font-medium text-foreground">{c.name}</td>
                          <td className="py-2.5 px-3 text-muted-foreground">{c.age}</td>
                          <td className="py-2.5 px-3 text-muted-foreground capitalize">{c.gender}</td>
                          <td className="py-2.5 px-3">
                            <Badge
                              variant="outline"
                              className={c.isClinicallyDiagnosed ? "text-green-600 border-green-200 bg-green-50" : "text-amber-600 border-amber-200 bg-amber-50"}
                            >
                              {c.isClinicallyDiagnosed ? "Yes" : "No"}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-3 text-muted-foreground">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(adminData?.children ?? []).length === 0 && (
                    <p className="text-center text-muted-foreground py-8 text-sm">No children found.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments */}
          <TabsContent value="appointments">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base">All Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Clinic</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Date</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Time</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Status</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(adminData?.appointments ?? []).map((a) => (
                        <tr key={a.id} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="py-2.5 px-3 font-medium text-foreground">{a.clinicName}</td>
                          <td className="py-2.5 px-3 text-muted-foreground">
                            {new Date(a.appointmentDate).toLocaleDateString()}
                          </td>
                          <td className="py-2.5 px-3 text-muted-foreground">{a.preferredTime}</td>
                          <td className="py-2.5 px-3">
                            <Badge
                              variant="outline"
                              className={
                                a.status === "confirmed" ? "text-green-600 border-green-200 bg-green-50" :
                                a.status === "pending" ? "text-amber-600 border-amber-200 bg-amber-50" :
                                a.status === "completed" ? "text-blue-600 border-blue-200 bg-blue-50" :
                                "text-red-600 border-red-200 bg-red-50"
                              }
                            >
                              {a.status}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-3">
                            <Select
                              value={a.status}
                              onValueChange={(v) => updateApptStatus.mutate({
                                adminToken,
                                id: a.id,
                                status: v as "pending" | "confirmed" | "completed" | "cancelled",
                              })}
                            >
                              <SelectTrigger className="h-7 text-xs w-28">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(adminData?.appointments ?? []).length === 0 && (
                    <p className="text-center text-muted-foreground py-8 text-sm">No appointments found.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scores */}
          <TabsContent value="scores">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base">Activity Scores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Child ID</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Module ID</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Score</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Notes</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(adminData?.scores ?? []).map((s: { id: number; childId: number; moduleId: number; score: number; notes?: string | null; completedAt: Date | string }) => (
                        <tr key={s.id} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="py-2.5 px-3 text-muted-foreground">#{s.childId}</td>
                          <td className="py-2.5 px-3 text-muted-foreground">#{s.moduleId}</td>
                          <td className="py-2.5 px-3">
                            <span className={`font-bold ${s.score >= 70 ? "text-green-600" : s.score >= 40 ? "text-amber-600" : "text-red-500"}`}>
                              {s.score}%
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-muted-foreground">{s.notes ?? "—"}</td>
                          <td className="py-2.5 px-3 text-muted-foreground">
                            {new Date(s.completedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(adminData?.scores ?? []).length === 0 && (
                    <p className="text-center text-muted-foreground py-8 text-sm">No scores found.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
