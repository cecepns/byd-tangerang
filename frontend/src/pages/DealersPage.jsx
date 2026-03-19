import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, ChevronRight, ExternalLink } from "lucide-react";
import { fetchDealers } from "../utils/api";

export default function DealersPage() {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState("");

  useEffect(() => {
    const params = cityFilter ? { city: cityFilter, active: true } : { active: true };
    fetchDealers(params)
      .then(setDealers)
      .catch(() => setDealers([]))
      .finally(() => setLoading(false));
  }, [cityFilter]);

  return (
    <>
      <section className="bg-bydBlue text-white py-12">
        <div className="container-xl">
          <div className="flex items-center gap-2 text-sm text-bydLightBlue mb-3">
            <Link to="/" className="hover:text-white transition-colors">
              Beranda
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white">Jaringan Dealer</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">Jaringan Dealer</h1>
          <p className="mt-2 text-slate-200 text-sm max-w-xl">
            Temukan dealer BYD Bipo terdekat di kota Anda. Kunjungi showroom
            untuk informasi produk dan test drive.
          </p>
          <div className="mt-6">
            <input
              type="text"
              placeholder="Cari berdasarkan kota..."
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-300 text-sm w-full max-w-xs"
            />
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="container-xl">
          {loading ? (
            <div className="text-center py-16 text-slate-500">
              Memuat daftar dealer…
            </div>
          ) : dealers.length === 0 ? (
            <div className="text-center py-16 text-slate-500 rounded-2xl border border-slate-200">
              Tidak ada dealer yang ditemukan.
              {cityFilter && (
                <p className="mt-2 text-sm">
                  Coba ubah filter kota atau kosongkan pencarian.
                </p>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {dealers.map((d) => (
                <div
                  key={d.id}
                  className="p-6 rounded-2xl border border-slate-200 hover:border-bydBlue/30 hover:shadow-md transition-all"
                >
                  <h2 className="text-lg font-bold text-slate-900">{d.name}</h2>
                  {(d.city || d.province) && (
                    <p className="text-sm text-slate-500 mt-0.5">
                      {[d.city, d.province].filter(Boolean).join(", ")}
                    </p>
                  )}
                  {d.address && (
                    <div className="flex items-start gap-2 mt-3 text-sm text-slate-600">
                      <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{d.address}</span>
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap gap-4 text-sm">
                    {d.phone && (
                      <a
                        href={`tel:${d.phone}`}
                        className="flex items-center gap-1.5 text-bydBlue hover:underline"
                      >
                        <Phone className="h-4 w-4" />
                        {d.phone}
                      </a>
                    )}
                    {d.email && (
                      <a
                        href={`mailto:${d.email}`}
                        className="flex items-center gap-1.5 text-bydBlue hover:underline"
                      >
                        <Mail className="h-4 w-4" />
                        {d.email}
                      </a>
                    )}
                  </div>
                  {d.mapUrl && (
                    <a
                      href={d.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-4 text-sm text-bydBlue hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Lihat di Peta
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
