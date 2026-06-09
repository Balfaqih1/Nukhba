import React from "react";
import { Link, useLocation } from "wouter";
import { logout } from "@/lib/storage";
import { LayoutDashboard, Users, UserPlus, LogOut, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  const navItems = [
    { href: "/", label: "نظرة عامة", icon: LayoutDashboard },
    { href: "/participants", label: "المشتركون", icon: Users },
    { href: "/participants/new", label: "إضافة مشترك", icon: UserPlus },
  ];

  return (
    <div className="flex h-screen bg-background w-full overflow-hidden">
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col h-full shrink-0 relative">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-primary flex items-center justify-center shadow-md">
            <Shield className="w-6 h-6 text-sidebar-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-sidebar-foreground">نادي النخبة</h1>
            <p className="text-xs text-sidebar-primary/80 font-medium">الإدارة العامة</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? location === "/" || location === "/dashboard"
                : location.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            تسجيل الخروج
          </button>
          <div className="mt-4 p-4 rounded-lg bg-sidebar-accent/50 border border-sidebar-accent text-xs leading-relaxed text-sidebar-foreground/70">
            هذه البيانات خاصة بإدارة نادي النخبة ولا يجوز مشاركتها خارج الإدارة.
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
