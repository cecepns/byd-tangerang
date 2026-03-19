import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ImageIcon,
  Settings,
  MapPin,
  Building2,
  MessageCircle,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { logout } from "../../utils/api";

const SIDEBAR_LINKS = [
  { to: "/admin/products", label: "Manajemen Produk", icon: Package },
  { to: "/admin/banners", label: "Manajemen Banner", icon: ImageIcon },
  { to: "/admin/dealers", label: "Manajemen Dealer", icon: MapPin },
  { to: "/admin/facilities", label: "Fasilitas Dealer", icon: Building2 },
  { to: "/admin/testimonials", label: "Manajemen Testimoni", icon: MessageCircle },
  { to: "/admin/settings", label: "Pengaturan", icon: Settings }
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const { setToken } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // ignore
    }
    setToken(null);
    setSidebarOpen(false);
    navigate("/login");
  }

  return (
    <div className="min-h-screen flex bg-slate-100 overflow-x-hidden">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-bydDarkBlue text-white">
        <div className="flex items-center gap-3 p-5 border-b border-white/10">
          <div className="h-9 w-9 rounded-lg bg-bydBlue flex items-center justify-center">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg">Admin</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {SIDEBAR_LINKS.map(({ to, label, icon: Icon }) => {
            const isActive = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-bydBlue text-white"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-red-500/20 hover:text-red-300 transition-colors"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar — mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-bydDarkBlue text-white transform transition-transform duration-200 ease-out lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <span className="font-bold text-lg">Admin</span>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {SIDEBAR_LINKS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                pathname === to ? "bg-bydBlue text-white" : "text-slate-300 hover:bg-white/10"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-red-500/20 hover:text-red-300"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 shadow-sm">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-100"
          >
            <Menu className="h-6 w-6 text-slate-600" />
          </button>
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-bydBlue" />
            <span className="font-semibold text-slate-800">Admin BYD</span>
          </div>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
