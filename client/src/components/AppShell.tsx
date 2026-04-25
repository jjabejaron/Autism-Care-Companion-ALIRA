import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Bell,
  BookOpen,
  Calendar,
  Home,
  LogIn,
  MapPin,
  Menu,
  MessageCircle,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

const NAV_ITEMS = [
  { path: "/dashboard", icon: Home, label: "Dashboard" },
  { path: "/modules", icon: BookOpen, label: "Modules" },
  { path: "/progress", icon: Activity, label: "Progress" },
  { path: "/clinics", icon: MapPin, label: "Clinics" },
  { path: "/appointments", icon: Calendar, label: "Appointments" },
  { path: "/chat", icon: MessageCircle, label: "ALI Chat" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [location, navigate] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: notifications = [] } = trpc.notifications.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Loading ALIRA...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-primary" />
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
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <div className="font-bold text-foreground text-sm tracking-wide">ALIRA</div>
          <div className="text-xs text-muted-foreground leading-none">Care Companion</div>
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
              {item.path === "/settings" && unreadCount > 0 && (
                <span className={`text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium ${isActive ? "bg-white/20 text-white" : "bg-primary text-primary-foreground"}`}>
                  {unreadCount}
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
          <button
            onClick={() => navigate("/settings")}
            className="relative text-muted-foreground hover:text-foreground"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </header>

        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
