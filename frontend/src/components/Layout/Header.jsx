import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Search, User, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { fetchSettings, logout } from "../../utils/api";
import logoImage from "../../assets/logo.jpeg";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/produk", label: "Product" },
  { to: "#booking", label: "Booking Service" },
  // { to: "#about", label: "About Us" },
  // { to: "#promotion", label: "Promotion" }
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const { pathname } = useLocation();
  const { isAuthenticated, setToken } = useAuth();
  const navigate = useNavigate();
  const [whatsappNumber, setWhatsappNumber] = useState("");

  useEffect(() => {
    // Ambil nomor WhatsApp dari admin settings supaya redirect selalu sesuai data terbaru.
    fetchSettings()
      .then((data) => {
        setWhatsappNumber(data?.footer?.whatsappNumber || "");
      })
      .catch(() => {});
  }, []);

  const whatsappNumberSanitized = (whatsappNumber || "").replace(/\D/g, "");
  const bookingWaHref = whatsappNumberSanitized
    ? `https://wa.me/${whatsappNumberSanitized}?text=${encodeURIComponent(
        "Halo, saya ingin booking service untuk BYD."
      )}`
    : "#booking";

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // ignore
    }
    setToken(null);
    setAdminOpen(false);
    setMobileOpen(false);
    navigate("/");
  }

  return (
    <header className="bg-bydBlue text-white fixed top-0 left-0 right-0 z-30">
      <div className="container-xl flex items-center justify-between">
        {/* Logo — bg putih skew (parallelogram) seperti referensi */}
        <Link to="/" className="flex items-center">
          <div className="relative flex items-center">
            <div
              className="bg-white border-t-2 border-b-2 border-bydBlue w-44 py-2.5 px-4 overflow-hidden"
              style={{ transform: "skewX(30deg)" }}
              aria-hidden
            >
              <span
                className="inline-flex items-center justify-center"
                style={{ transform: "skewX(-30deg)" }}
              >
                <img
                  src={logoImage}
                  alt="BYD Auto"
                  className="h-12 w-auto object-contain"
                />
              </span>
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium">
          {NAV_LINKS.map((l) => {
            const isActive =
              l.to === "/"
                ? pathname === "/"
                : pathname.startsWith(l.to) && !l.to.startsWith("#");
            const linkClassName = `transition-colors ${
              isActive ? "text-yellow-400" : "hover:text-bydLightBlue"
            }`;

            if (l.to === "#booking") {
              return (
                <a
                  key={l.to}
                  href={bookingWaHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClassName}
                >
                  {l.label}
                </a>
              );
            }

            return (
              <Link
                key={l.to}
                to={l.to}
                className={linkClassName}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* {isAuthenticated ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setAdminOpen(!adminOpen)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium"
              >
                <LayoutDashboard className="h-4 w-4" />
                Admin
              </button>
              {adminOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setAdminOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 py-1 w-48 bg-white rounded-lg shadow-lg text-slate-800 z-50">
                    <Link
                      to="/admin/products"
                      onClick={() => setAdminOpen(false)}
                      className="block px-4 py-2.5 text-sm hover:bg-slate-50"
                    >
                      Manajemen Produk
                    </Link>
                    <Link
                      to="/admin/banners"
                      onClick={() => setAdminOpen(false)}
                      className="block px-4 py-2.5 text-sm hover:bg-slate-50"
                    >
                      Manajemen Banner
                    </Link>
                    <Link
                      to="/admin/testimonials"
                      onClick={() => setAdminOpen(false)}
                      className="block px-4 py-2.5 text-sm hover:bg-slate-50"
                    >
                      Manajemen Testimoni
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50 text-left text-red-600"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium"
            >
              <User className="h-4 w-4" />
              Login
            </Link>
          )} */}
          <Link
            to="/produk"
            aria-label="Cari produk"
            className="hidden md:inline-flex items-center justify-center h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <Search className="h-4 w-4" />
          </Link>
          {/* <div className="hidden md:block h-8 w-14 bg-white/10 rounded flex items-center justify-center text-[11px] font-bold tracking-wider">
            BYD
          </div> */}
          <button
            className="inline-flex lg:hidden items-center justify-center h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <nav className="lg:hidden border-t border-white/10 pb-4">
          <div className="container-xl flex flex-col gap-1 pt-2">
            {NAV_LINKS.map((l) => (
              l.to === "#booking" ? (
                <a
                  key={l.to}
                  href={bookingWaHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileOpen(false)}
                  className="py-2.5 text-sm hover:text-bydLightBlue transition-colors"
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMobileOpen(false)}
                  className="py-2.5 text-sm hover:text-bydLightBlue transition-colors"
                >
                  {l.label}
                </Link>
              )
            ))}
            {isAuthenticated ? (
              <>
                <Link
                  to="/admin/products"
                  onClick={() => setMobileOpen(false)}
                  className="py-2.5 text-sm hover:text-bydLightBlue transition-colors"
                >
                  Admin Produk
                </Link>
                <Link
                  to="/admin/banners"
                  onClick={() => setMobileOpen(false)}
                  className="py-2.5 text-sm hover:text-bydLightBlue transition-colors"
                >
                  Admin Banner
                </Link>
                <Link
                  to="/admin/testimonials"
                  onClick={() => setMobileOpen(false)}
                  className="py-2.5 text-sm hover:text-bydLightBlue transition-colors"
                >
                  Admin Testimoni
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="py-2.5 text-sm text-left hover:text-red-300 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="py-2.5 text-sm hover:text-bydLightBlue transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
