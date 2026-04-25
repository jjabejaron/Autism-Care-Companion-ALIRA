import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Activity,
  Bell,
  BookOpen,
  Check,
  CheckCheck,
  Home,
  LogIn,
  MapPin,
  Menu,
  MessageCircle,
  Settings,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

function NotificationPanel({
  notifications,
  onMarkAllRead,
  onMarkRead,
  onClose,
}: {
  notifications: Array<{ id: number; title: string; message: string; isRead: boolean; createdAt: Date }>;
  onMarkAllRead: () => void;
  onMarkRead: (id: number) => void;
  onClose: () => void;
}) {
  const unread = notifications.filter((n) => !n.isRead);

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Progress Updates</span>
          {unread.length > 0 && (
            <span className="text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 font-medium">
              {unread.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unread.length > 0 && (
            <button
              onClick={onMarkAllRead}
              className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-primary/5 transition-colors"
            >
              <CheckCheck className="w-3 h-3" />
              All read
            </button>
          )}
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notification list */}
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
              <Bell className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">All caught up!</p>
            <p className="text-xs text-muted-foreground">Progress updates will appear here after completing modules.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.slice(0, 15).map((n) => (
              <div
                key={n.id}
                className={`flex gap-3 px-4 py-3 transition-colors ${
                  n.isRead ? "bg-card" : "bg-primary/4"
                }`}
              >
                <div className={`mt-0.5 w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${
                  n.isRead ? "bg-muted" : "bg-primary/10"
                }`}>
                  <TrendingUp className={`w-3.5 h-3.5 ${n.isRead ? "text-muted-foreground" : "text-primary"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-xs font-semibold leading-snug ${n.isRead ? "text-muted-foreground" : "text-foreground"}`}>
                      {n.title}
                    </p>
                    {!n.isRead && (
                      <button
                        onClick={() => onMarkRead(n.id)}
                        className="flex-shrink-0 text-primary hover:text-primary/70 mt-0.5"
                        title="Mark as read"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {new Date(n.createdAt).toLocaleDateString("en-PH", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [location, navigate] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const NAV_ITEMS = [
    { path: "/dashboard", icon: Home, label: t.nav.dashboard },
    { path: "/modules", icon: BookOpen, label: t.nav.modules },
    { path: "/progress", icon: Activity, label: t.nav.progress },
    { path: "/clinics", icon: MapPin, label: t.nav.clinics },
    { path: "/chat", icon: MessageCircle, label: t.nav.aliChat },
    { path: "/settings", icon: Settings, label: t.nav.settings },
  ];

  const { data: notifications = [] } = trpc.notifications.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const utils = trpc.useUtils();
  const markRead = trpc.notifications.markRead.useMutation({
    onSuccess: () => utils.notifications.list.invalidate(),
  });
  const markAllRead = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => utils.notifications.list.invalidate(),
  });

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifOpen]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center animate-pulse">
            <img src="/manus-storage/alira_logo_983ee8e3.png" alt="ALIRA" className="w-10 h-10 object-contain" />
          </div>
          <p className="text-sm text-muted-foreground">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <img src="/manus-storage/alira_logo_983ee8e3.png" alt="ALIRA" className="w-16 h-16 object-contain" />
          </div>
          <h2 className="text-2xl font-normal text-foreground mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Welcome to ALIRA
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Please sign in to access your autism care companion.
          </p>
          <div className="flex flex-col gap-3">
            <Button className="w-full" onClick={() => navigate("/login")}>
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate("/signup")}>
              Create Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border flex-shrink-0">
        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
          <img src="/manus-storage/alira_logo_983ee8e3.png" alt="ALIRA logo" className="w-8 h-8 object-contain" />
        </div>
        <div>
          <div className="font-bold text-foreground text-sm tracking-wide">ALIRA</div>
          <div className="text-xs text-muted-foreground leading-none">{t.nav.careCompanion}</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.path || location.startsWith(item.path + "/");
          return (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.path === "/chat" && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${isActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary"}`}>
                  ALI
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-border flex-shrink-0">
        <button
          onClick={() => { navigate("/settings"); setMobileOpen(false); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-primary">{initials}</span>
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-sm font-medium text-foreground truncate">{user?.name ?? "Parent"}</div>
            <div className="text-xs text-muted-foreground truncate">{user?.email ?? ""}</div>
          </div>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card fixed inset-y-0 left-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex flex-col w-64 bg-card border-r border-border z-10">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border h-14 flex items-center px-4 sm:px-6 gap-4 flex-shrink-0">
          <button
            className="lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <span className="text-sm font-medium text-muted-foreground">
              {NAV_ITEMS.find((n) => n.path === location)?.label ?? "ALIRA"}
            </span>
          </div>

          {/* Bell notification button with pop-up panel */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="relative text-muted-foreground hover:text-foreground p-1.5 rounded-xl hover:bg-muted transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold leading-none">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <NotificationPanel
                notifications={notifications}
                onMarkAllRead={() => markAllRead.mutate()}
                onMarkRead={(id) => markRead.mutate({ id })}
                onClose={() => setNotifOpen(false)}
              />
            )}
          </div>
        </header>

        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
