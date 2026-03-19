import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight } from "lucide-react";
import AOS from "aos";
import { fetchProducts, getImageUrl } from "../utils/api";

const fallbackProducts = [
  { id: 1, name: "BYD M6", slug: "byd-m6", price: 403000000, city: "Tenggarong", shortDescription: "MPV listrik keluarga." },
  { id: 2, name: "BYD Sealion 7", slug: "byd-sealion-7", price: 638500000, city: "Tangerang", shortDescription: "SUV listrik premium." },
  { id: 3, name: "BYD Seal", slug: "byd-seal", price: 650500000, city: "Jakarta", shortDescription: "Sedan listrik performa tinggi." },
  { id: 4, name: "BYD Atto 3", slug: "byd-atto-3", price: 410000000, city: "Surabaya", shortDescription: "SUV kompak listrik." },
  { id: 5, name: "BYD Atto 1", slug: "byd-atto-1", price: 214000000, city: "Tenggarong", shortDescription: "City car listrik." },
  { id: 6, name: "BYD Dolphin", slug: "byd-dolphin", price: 380500000, city: "Bandung", shortDescription: "Hatchback listrik modern." }
];

const cities = ["Semua Lokasi", "Jakarta", "Surabaya", "Tangerang", "Bandung", "Tenggarong"];

export default function ProductsPage() {
  const [products, setProducts] = useState(fallbackProducts);
  const [selectedCity, setSelectedCity] = useState("Semua Lokasi");

  useEffect(() => {
    AOS.init({
      once: true,
      duration: 800,
      easing: "ease-out-quart",
      disable: () => window.innerWidth < 768
    });
    window.scrollTo(0, 0);
    async function load() {
      try {
        const data = await fetchProducts();
        if (Array.isArray(data) && data.length) setProducts(data);
      } catch {
        // fallback
      }
    }
    load();
  }, []);

  const filtered =
    selectedCity === "Semua Lokasi"
      ? products
      : products.filter(
          (p) => p.city.toLowerCase() === selectedCity.toLowerCase()
        );

  return (
    <>
      {/* Hero banner */}
      <section className="bg-bydBlue text-white">
        <div className="container-xl py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl font-bold" data-aos="fade-right">
            Produk
          </h1>
          <div className="flex items-center gap-2 mt-3 text-sm text-bydLightBlue">
            <Link to="/" className="hover:text-white transition-colors">
              Beranda
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white">Produk</span>
          </div>
        </div>
      </section>

      {/* Filter & Grid */}
      <section className="bg-white py-10 md:py-14">
        <div className="container-xl">
          {/* Filter */}
          <div className="mb-8" data-aos="fade-up">
            <h2 className="text-lg font-bold text-slate-900">Pilih Lokasi</h2>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="mt-3 border border-slate-200 rounded-lg px-4 py-3 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-bydBlue/30 min-w-[200px]"
            >
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c === "Semua Lokasi" ? "- Pilih Lokasi -" : c}
                </option>
              ))}
            </select>
            {selectedCity !== "Semua Lokasi" && (
              <p className="mt-3 text-sm text-slate-600">
                Menampilkan Hasil Lokasi{" "}
                <span className="text-bydBlue font-semibold">
                  {selectedCity}
                </span>
              </p>
            )}
          </div>

          {/* Product Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((product) => (
              <article
                key={product.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-card transition-shadow overflow-hidden flex flex-col"
                data-aos="fade-up"
              >
                <div className="bg-bydGray aspect-[4/3] flex items-center justify-center">
                  {product.imageUrl ? (
                    <img
                      src={getImageUrl(product.imageUrl)}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-[75%] h-[65%] rounded-2xl bg-gradient-to-br from-slate-200 to-white flex items-center justify-center text-slate-400 text-xs text-center px-3">
                      Tidak ada gambar
                    </div>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-bydBlue">
                    <span className="w-1.5 h-1.5 rounded-full bg-bydBlue" />
                    {product.name}
                  </span>
                  <div className="mt-3 inline-flex max-w-fit items-center gap-1 rounded-full bg-red-50 px-3 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span className="text-[10px] font-semibold text-red-600">
                      Mulai dari
                    </span>
                  </div>
                  <p className="mt-2 text-lg font-bold text-red-600">
                    IDR {product.price.toLocaleString("id-ID")}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    * harga OTR {product.city || "Tangerang"}
                  </p>
                  <Link
                    to={`/produk/${product.slug}`}
                    className="mt-4 inline-flex items-center justify-center gap-2 text-xs font-semibold text-white bg-bydBlue rounded-full px-4 py-2.5 hover:bg-bydBlue/90 transition-colors"
                  >
                    Detail Produk
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-slate-400 text-sm py-16">
              Tidak ada produk ditemukan untuk lokasi ini.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
