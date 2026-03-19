import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import logoImage from "../../assets/logo.jpeg";
import { fetchSettings } from "../../utils/api";

const defaultFooter = {
  tagline:
    "Terbaik dan Terpercaya dalam layanan penjualan dan purna jual BYD di Indonesia.",
  address: "Jl. Raya Kalimalang No. 19\nDuren Sawit, Jakarta Timur 13440",
  phone: "021-86601111",
  email: "info@arista-group.co.id",
  jamKerjaHeadOffice: "Senin – Jumat: 08.00 – 17.00",
  jamKerjaCabang: "Senin – Minggu: 08.00 – 18.00",
  links: [
    { label: "Beranda", url: "/" },
    { label: "Produk", url: "/produk" },
    { label: "Jaringan Dealer", url: "/dealer" },
    { label: "Promo", url: "#promotion" },
    { label: "Konsultasi Pembelian", url: "#" },
    { label: "Servis", url: "#" },
    { label: "Tentang Kami", url: "#about" }
  ],
  socialMedia: [
    { label: "@aristagroup.id", url: "#" },
    { label: "Arista Group", url: "#" },
    { label: "@aristagroup.id", url: "#" }
  ],
  copyrightText: "Copyright {year} © Arista. All rights reserved.",
  footerRightText: "BYD Indonesia Dealer Network",
  whatsappNumber: "6282100000000"
};

export default function Footer() {
  const [footer, setFooter] = useState(defaultFooter);

  useEffect(() => {
    fetchSettings()
      .then((data) => {
        if (data?.footer) setFooter({ ...defaultFooter, ...data.footer });
      })
      .catch(() => {});
  }, []);

  const copyrightDisplay = (footer.copyrightText || "").replace(
    "{year}",
    String(new Date().getFullYear())
  );
  const whatsappHref = `https://wa.me/${(footer.whatsappNumber || "").replace(/\D/g, "")}`;

  return (
    <footer className="bg-bydDarkBlue text-white">
      <div className="container-xl py-12 grid gap-10 md:grid-cols-4 text-sm">
        {/* Brand */}
        <div>
          <Link to="/" className="inline-block mb-4">
            <img
              src={logoImage}
              alt="BYD BIPO logo"
              className="h-10 w-auto object-contain"
            />
          </Link>
          <p className="text-xs text-slate-300 leading-relaxed">
            {footer.tagline}
          </p>
          <div className="mt-4 space-y-2 text-xs text-slate-300">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="whitespace-pre-line">{footer.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0" />
              <span>{footer.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0" />
              <span>{footer.email}</span>
            </div>
          </div>
        </div>

        {/* Jam Kerja */}
        <div>
          <h4 className="font-semibold mb-3 text-xs uppercase tracking-wide text-slate-300">
            Jam Kerja
          </h4>
          <div className="text-xs text-slate-300 space-y-2">
            <div>
              <p className="font-medium text-white">Head Office</p>
              <p>{footer.jamKerjaHeadOffice}</p>
            </div>
            <div>
              <p className="font-medium text-white">Cabang</p>
              <p>{footer.jamKerjaCabang}</p>
            </div>
          </div>
        </div>

        {/* Links */}
        <div>
          <h4 className="font-semibold mb-3 text-xs uppercase tracking-wide text-slate-300">
            Links
          </h4>
          <ul className="space-y-2 text-xs text-slate-300">
            {(footer.links || []).map((item, i) => (
              <li key={i}>
                {item.url?.startsWith("/") ? (
                  <Link
                    to={item.url}
                    className="hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    href={item.url || "#"}
                    className="hover:text-white transition-colors"
                  >
                    {item.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h4 className="font-semibold mb-3 text-xs uppercase tracking-wide text-slate-300">
            Social Media
          </h4>
          <ul className="space-y-2 text-xs text-slate-300">
            {(footer.socialMedia || []).map((item, i) => (
              <li key={i}>
                <a
                  href={item.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-xl py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <span>{copyrightDisplay}</span>
          <span>{footer.footerRightText}</span>
        </div>
      </div>

      {/* Floating WhatsApp */}
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float fixed bottom-6 right-6 z-40 flex items-center justify-center h-14 w-14 rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#20bd5a] transition-colors"
        title="Chat WhatsApp"
      >
        <span className="whatsapp-float-pulse" aria-hidden />
        <MessageCircle className="h-7 w-7" strokeWidth={2} />
      </a>
    </footer>
  );
}
