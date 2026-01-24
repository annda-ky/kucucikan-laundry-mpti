"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  WashingMachine,
  LogOut,
  Crown,
  History,
  Users,
  Package,
  Wallet,
  Boxes,
  BarChart3,
  Settings,
  Menu,
  X,
  Shield,
  Tag,
} from "lucide-react";
import { authService } from "@/services/auth.service";
import type { User } from "@/types";

interface MenuItem {
  label: string;
  href: string;
  icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
    className?: string;
  }>;
  divider?: boolean;
}

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = authService.getCurrentUser();

    if (!token) {
      router.push("/login");
    } else if (userData?.role !== "OWNER") {
      // Non-owners should use admin dashboard
      router.push("/dashboard");
    } else {
      setUser(userData);
      setIsReady(true);
    }
  }, [router]);

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1A1A1A]">
        <div className="animate-pulse text-[#C5A059]">
          <Crown size={32} strokeWidth={1} className="animate-bounce" />
        </div>
      </div>
    );
  }

  const menuItems: MenuItem[] = [
    { label: "DASHBOARD", href: "/owner", icon: LayoutDashboard },
    { label: "REPORTS", href: "/owner/reports", icon: BarChart3 },
    {
      label: "MACHINES",
      href: "/owner/machines",
      icon: WashingMachine,
      divider: true,
    },
    { label: "ORDERS", href: "/owner/orders", icon: History },
    { label: "CUSTOMERS", href: "/owner/customers", icon: Users },
    { label: "PROMOS", href: "/owner/promos", icon: Tag },
    {
      label: "SERVICES",
      href: "/owner/services",
      icon: Package,
      divider: true,
    },
    { label: "FINANCE", href: "/owner/finance", icon: Wallet },
    {
      label: "INVENTORY",
      href: "/owner/inventory",
      icon: Boxes,
      divider: true,
    },
    { label: "USERS", href: "/owner/users", icon: Shield },
    { label: "SETTINGS", href: "/owner/settings", icon: Settings },
  ];

  const handleLogout = () => {
    authService.logout();
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-[#0F0F0F] text-white antialiased">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm"
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 h-screen w-64 bg-[#1A1A1A] border-r border-[#2A2A2A] flex flex-col z-40
          transform transition-transform duration-300
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="py-8 px-6 flex flex-col items-center border-b border-[#2A2A2A]">
          <div className="flex items-center gap-2 mb-2">
            <Crown size={16} className="text-[#C5A059]" />
            <h1 className="text-lg font-light tracking-[0.25em] text-white">
              KUCUCIKAN
            </h1>
          </div>
          <p className="text-[8px] font-bold tracking-[0.3em] text-[#C5A059] uppercase">
            Owner Portal
          </p>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-0.5 overflow-y-auto">
          {menuItems.map((item, index) => {
            const isActive = pathname === item.href;
            const IconComponent = item.icon;
            return (
              <div key={item.href}>
                {item.divider && index > 0 && (
                  <div className="h-[1px] bg-[#2A2A2A] my-3" />
                )}
                <Link
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all duration-300 ${
                    isActive
                      ? "bg-[#C5A059]/10 text-[#C5A059]"
                      : "text-[#808080] hover:text-white hover:bg-white/5"
                  }`}
                >
                  <IconComponent size={15} strokeWidth={isActive ? 1.8 : 1.2} />
                  <span className="text-[9px] font-bold tracking-[0.12em]">
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="ml-auto w-1 h-1 rounded-full bg-[#C5A059]" />
                  )}
                </Link>
              </div>
            );
          })}
        </nav>

        <div className="p-4 space-y-3 border-t border-[#2A2A2A]">
          <div className="flex items-center gap-2 px-3 py-2.5 bg-[#C5A059]/10 rounded-sm">
            <Crown size={14} className="text-[#C5A059]" />
            <div className="truncate flex-1">
              <p className="text-[9px] font-bold tracking-wider text-white truncate">
                {user?.username?.toUpperCase() || "OWNER"}
              </p>
              <p className="text-[8px] font-medium text-[#C5A059] tracking-wider">
                OWNER
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2.5 text-[9px] font-bold tracking-[0.1em] text-[#808080] hover:text-red-400 hover:bg-red-400/10 rounded-sm transition-all"
          >
            <LogOut size={14} strokeWidth={1.2} />
            LOGOUT
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <header className="h-14 border-b border-[#2A2A2A] bg-[#1A1A1A]/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-2 ml-12 lg:ml-0">
            <Crown size={12} className="text-[#C5A059]" />
            <span className="text-[9px] font-bold tracking-[0.2em] text-[#C5A059] uppercase">
              Owner Mode
            </span>
          </div>
          <div className="text-[9px] font-medium text-[#808080] tracking-[0.1em]">
            {new Date()
              .toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })
              .toUpperCase()}
          </div>
        </header>
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
