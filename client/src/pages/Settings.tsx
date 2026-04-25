import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import AppShell from "@/components/AppShell";
import { Bell, Globe, Lock, LogOut, Save, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Settings() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [profile, setProfile] = useState({
    fullName: user?.name ?? "",
    email: user?.email ?? "",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  const [notifPrefs, setNotifPrefs] = useState({
    progressAlerts: true,
    moduleCompletion: true,
  });

  const { data: notifications = [] } = trpc.notifications.list.useQuery();
  const unreadNotifs = notifications.filter((n) => !n.isRead);
  const utils = trpc.useUtils();
  const markRead = trpc.notifications.markRead.useMutation({
    onSuccess: () => utils.notifications.list.invalidate(),
  });

  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: () => toast.success("Profile updated successfully"),
    onError: () => toast.error("Failed to update profile"),
  });

  const changePassword = trpc.user.changePassword.useMutation({
    onSuccess: () => {
      toast.success("Password updated successfully");
      setPasswords({ current: "", newPass: "", confirm: "" });
    },
    onError: (err) => toast.error(err.message || "Failed to update password"),
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({
      fullName: profile.fullName,
      email: profile.email,
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwords.newPass.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    changePassword.mutate({
      currentPassword: passwords.current,
      newPassword: passwords.newPass,
    });
  };

  return (
    <AppShell>
      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-normal text-foreground mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>
            {t.settings.title}
          </h1>
          <p className="text-muted-foreground">{t.settings.profileSub}</p>
        </div>

        <div className="space-y-6">
          {/* Profile */}
          <Card className="border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{t.settings.profile}</CardTitle>
                  <p className="text-xs text-muted-foreground">{t.settings.profileSub}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>{t.settings.fullName}</Label>
                    <Input
                      value={profile.fullName}
                      onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t.settings.email}</Label>
                    <Input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                    />
                  </div>
                </div>
                <Button type="submit" size="sm" disabled={updateProfile.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  {updateProfile.isPending ? t.settings.saving : t.settings.saveProfile}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <CardTitle className="text-base">{t.settings.security}</CardTitle>
                  <p className="text-xs text-muted-foreground">{t.settings.securitySub}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>{t.settings.currentPassword}</Label>
                  <Input
                    type="password"
                    value={passwords.current}
                    onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
                    placeholder="••••••••"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>{t.settings.newPassword}</Label>
                    <Input
                      type="password"
                      value={passwords.newPass}
                      onChange={(e) => setPasswords((p) => ({ ...p, newPass: e.target.value }))}
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t.settings.confirmPassword}</Label>
                    <Input
                      type="password"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <Button type="submit" size="sm" disabled={changePassword.isPending}>
                  {changePassword.isPending ? t.settings.saving : t.settings.updatePassword}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Language */}
          <Card className="border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-base">{t.settings.language}</CardTitle>
                  <p className="text-xs text-muted-foreground">{t.settings.languageSub}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <button
                  onClick={() => setLanguage("en")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                    language === "en"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border hover:bg-muted"
                  }`}
                >
                  🇺🇸 English
                </button>
                <button
                  onClick={() => setLanguage("fil")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                    language === "fil"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border hover:bg-muted"
                  }`}
                >
                  🇵🇭 Filipino
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                    <Bell className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{t.settings.notifications}</CardTitle>
                    <p className="text-xs text-muted-foreground">{t.settings.notificationsSub}</p>
                  </div>
                </div>
                {unreadNotifs.length > 0 && (
                  <Badge className="bg-primary/10 text-primary">{unreadNotifs.length} unread</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="text-sm font-medium text-foreground">{t.settings.progressAlerts}</div>
                  <div className="text-xs text-muted-foreground">{t.settings.progressAlertsSub}</div>
                </div>
                <Switch
                  checked={notifPrefs.progressAlerts}
                  onCheckedChange={(v) => setNotifPrefs((p) => ({ ...p, progressAlerts: v }))}
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="text-sm font-medium text-foreground">{t.settings.moduleCompletion}</div>
                  <div className="text-xs text-muted-foreground">{t.settings.moduleCompletionSub}</div>
                </div>
                <Switch
                  checked={notifPrefs.moduleCompletion}
                  onCheckedChange={(v) => setNotifPrefs((p) => ({ ...p, moduleCompletion: v }))}
                />
              </div>

              {/* Recent notifications */}
              {notifications.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent</span>
                    {unreadNotifs.length > 0 && (
                      <button
                        onClick={() => unreadNotifs.forEach((n) => markRead.mutate({ id: n.id }))}
                        className="text-xs text-primary hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {notifications.slice(0, 10).map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 rounded-lg text-xs ${n.isRead ? "bg-muted/50" : "bg-primary/5 border border-primary/15"}`}
                      >
                        <div className="font-medium text-foreground mb-0.5">{n.title}</div>
                        <div className="text-muted-foreground">{n.message}</div>
                        <div className="text-muted-foreground mt-1">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sign out */}
          <Card className="border-border border-destructive/20">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-foreground">{t.settings.signOut}</div>
                  <div className="text-xs text-muted-foreground">{t.settings.signOutSub}</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive border-destructive/30 hover:bg-destructive/5"
                  onClick={logout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t.settings.signOutBtn}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
