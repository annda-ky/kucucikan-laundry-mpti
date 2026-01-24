"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  WashingMachine,
  LogOut,
  UserCircle,
  History,
  Users,
  Package,
  Wallet,
  Boxes,
  Menu,
  X,
  ShoppingCart,
  Activity,
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
}

export default function DashboardLayout({
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
    } else if (userData?.role === "OWNER") {
      // Owner should use owner dashboard
      router.push("/owner");
    } else {
      setUser(userData);
      setIsReady(true);
    }
  }, [router]);

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6]">
        <div className="animate-pulse text-[#C5A059]">
          <WashingMachine size={32} strokeWidth={1} className="animate-spin" />
        </div>
      </div>
    );
  }

  const menuItems: MenuItem[] = [
    { label: "OVERVIEW", href: "/dashboard", icon: LayoutDashboard },
    { label: "KASIR / POS", href: "/dashboard/pos", icon: ShoppingCart },
    { label: "MACHINES", href: "/dashboard/machines", icon: WashingMachine },
    { label: "OPERATIONS", href: "/dashboard/operations", icon: Activity },
    { label: "ORDERS", href: "/dashboard/orders", icon: History },
    { label: "CUSTOMERS", href: "/dashboard/customers", icon: Users },
    { label: "SERVICES", href: "/dashboard/services", icon: Package },
    { label: "SHIFT", href: "/dashboard/shift", icon: Wallet },
    { label: "INVENTORY", href: "/dashboard/inventory", icon: Boxes },
  ];

  const handleLogout = () => {
    authService.logout();
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-[#FAF9F6] text-[#1A1A1A] antialiased">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-[#E5E2D9] rounded-sm shadow-sm"
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 h-screen w-72 bg-white border-r border-[#E5E2D9] flex flex-col z-40
          transform transition-transform duration-300
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="py-10 px-8 flex flex-col items-center border-b border-[#F0EDE4]">
          <div className="mb-2">
            <h1 className="text-xl font-light tracking-[0.3em] text-[#1A1A1A]">
              KUCUCIKAN
            </h1>
          </div>
          <div className="h-[1px] w-10 bg-[#C5A059]" />
          <p className="mt-3 text-[8px] font-bold tracking-[0.4em] text-[#C5A059] uppercase">
            Laundry Atelier
          </p>
        </div>

        <nav className="flex-1 px-6 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const IconComponent = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-300 group ${
                  isActive
                    ? "bg-[#FAF9F6] text-[#1A1A1A]"
                    : "text-[#A19E95] hover:text-[#1A1A1A] hover:bg-[#FAF9F6]/50"
                }`}
              >
                <IconComponent
                  size={16}
                  strokeWidth={isActive ? 1.5 : 1.2}
                  className={
                    isActive
                      ? "text-[#C5A059]"
                      : "text-[#A19E95] group-hover:text-[#C5A059] transition-colors"
                  }
                />
                <span className="text-[10px] font-bold tracking-[0.15em]">
                  {item.label}
                </span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 space-y-4 border-t border-[#F0EDE4]">
          <div className="flex items-center gap-3 px-4 py-3 bg-[#FAF9F6] rounded-sm">
            <UserCircle
              size={18}
              strokeWidth={1.2}
              className="text-[#C5A059]"
            />
            <div className="truncate flex-1">
              <p className="text-[10px] font-bold tracking-wider text-[#1A1A1A] truncate">
                {user?.username?.toUpperCase() || "ADMIN"}
              </p>
              <p className="text-[8px] font-medium text-[#A19E95] tracking-wider">
                KASIR / ADMIN
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-[10px] font-bold tracking-[0.15em] text-[#A19E95] hover:text-red-600 hover:bg-red-50 rounded-sm transition-all"
          >
            <LogOut size={16} strokeWidth={1.2} />
            LOGOUT
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <header className="h-16 border-b border-[#F0EDE4] bg-white/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-6 lg:px-10">
          <div className="flex items-center gap-2 ml-12 lg:ml-0">
            <div className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
            <span className="text-[9px] font-bold tracking-[0.2em] text-[#1A1A1A] uppercase">
              Admin Mode
            </span>
          </div>
          <div className="text-[10px] font-medium text-[#A19E95] tracking-[0.15em]">
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
        <div className="p-6 lg:p-10 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
