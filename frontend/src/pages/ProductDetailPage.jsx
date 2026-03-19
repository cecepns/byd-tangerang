import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import {
  ChevronRight,
  Zap,
  Battery,
  Gauge,
  ArrowRight
} from "lucide-react";
import AOS from "aos";
import "swiper/css";
import "swiper/css/navigation";
import {
  fetchProductBySlug,
  fetchProducts,
  fetchSettings,
  getImageUrl
} from "../utils/api";

const fallbackProducts = [
  { id: 1, name: "BYD M6", slug: "byd-m6", price: 403000000, city: "Tenggarong", shortDescription: "MPV listrik keluarga.", highlights: { power: "163 PS", battery: "55.4 kWh", range: "420 km" }, specs: [], colors: [], description: "" },
  { id: 2, name: "BYD Sealion 7", slug: "byd-sealion-7", price: 638500000, city: "Tangerang", shortDescription: "SUV listrik premium.", highlights: { power: "390 PS", battery: "82.5 kWh", range: "502 km" }, specs: [], colors: [], description: "" },
  { id: 3, name: "BYD Seal", slug: "byd-seal", price: 650500000, city: "Jakarta", shortDescription: "Sedan listrik performa tinggi.", highlights: { power: "313 PS", battery: "82.5 kWh", range: "570 km" }, specs: [], colors: [], description: "" },
  { id: 4, name: "BYD Atto 3", slug: "byd-atto-3", price: 410000000, city: "Surabaya", shortDescription: "SUV kompak listrik.", highlights: { power: "204 PS", battery: "60.48 kWh", range: "420 km" }, specs: [], colors: [], description: "" },
  { id: 5, name: "BYD Atto 1", slug: "byd-atto-1", price: 214000000, city: "Tenggarong", shortDescription: "City car listrik.", highlights: { power: "75 PS", battery: "44.9 kWh", range: "405 km" }, specs: [], colors: [], description: "" },
  { id: 6, name: "BYD Dolphin", slug: "byd-dolphin", price: 380500000, city: "Bandung", shortDescription: "Hatchback listrik modern.", highlights: { power: "177 PS", battery: "60.48 kWh", range: "490 km" }, specs: [], colors: [], description: "" }
];

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [others, setOthers] = useState([]);
  const [activeTab, setActiveTab] = useState("ringkasan");
  const [selectedColor, setSelectedColor] = useState(0);
  const [loading, setLoading] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState("");

  useEffect(() => {
    AOS.init({
      once: true,
      duration: 800,
      easing: "ease-out-quart",
      disable: () => window.innerWidth < 768
    });
    window.scrollTo(0, 0);
    setActiveTab("ringkasan");
    setSelectedColor(0);
    setLoading(true);
    async function load() {
      try {
        const [p, all, settings] = await Promise.all([
          fetchProductBySlug(slug),
          fetchProducts(),
          fetchSettings()
        ]);
        setProduct(p);
        setOthers(
          (Array.isArray(all) ? all : fallbackProducts).filter(
            (x) => x.slug !== slug
          )
        );
        if (settings?.footer?.whatsappNumber) {
          setWhatsappNumber(settings.footer.whatsappNumber);
        }
      } catch {
        const fb = fallbackProducts.find((x) => x.slug === slug);
        if (fb) setProduct(fb);
        setOthers(fallbackProducts.filter((x) => x.slug !== slug));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-10 w-10 border-4 border-bydBlue/30 border-t-bydBlue rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-32">
        <p className="text-slate-500">Produk tidak ditemukan.</p>
        <Link
          to="/produk"
          className="mt-4 inline-block text-bydBlue text-sm font-semibold"
        >
          Kembali ke Produk
        </Link>
      </div>
    );
  }

  const hasExterior = Array.isArray(product.exteriorMedia) && product.exteriorMedia.length > 0;
  const hasInterior = Array.isArray(product.interiorMedia) && product.interiorMedia.length > 0;
  const hasGallery = Array.isArray(product.galleryMedia) && product.galleryMedia.length > 0;

  const tabs = [
    { key: "ringkasan", label: "Ringkasan" },
    ...(hasExterior || hasInterior
      ? [{ key: "eksterior", label: "Eksterior & Interior" }]
      : []),
    { key: "spesifikasi", label: "Spesifikasi" }
  ];

  const activeColorImage =
    product.colors &&
    product.colors[selectedColor] &&
    product.colors[selectedColor].imageUrl
      ? getImageUrl(product.colors[selectedColor].imageUrl)
      : null;

  function openWhatsApp(context) {
    if (!whatsappNumber) return;
    const msg = `Halo, saya tertarik ${context} untuk ${product.name}.`;
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      msg
    )}`;
    window.open(url, "_blank");
  }

  return (
    <>
      {/* Hero + Main Image */}
      <section className="bg-bydBlue text-white">
        <div className="container-xl py-8 md:py-10">
          <div className="flex items-center gap-2 text-sm text-bydLightBlue mb-4">
            <Link to="/" className="hover:text-white transition-colors">
              Beranda
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to="/produk" className="hover:text-white transition-colors">
              Produk
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white">{product.name}</span>
          </div>
          <div className="grid md:grid-cols-[1.1fr,1fr] gap-8 items-start">
            <div data-aos="fade-right">
              <div className="w-full aspect-[16/9] md:aspect-[16/8] rounded-2xl bg-bydGray flex items-center justify-center overflow-hidden">
                {activeColorImage || product.imageUrl ? (
                  <img
                    src={activeColorImage || getImageUrl(product.imageUrl)}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-[80%] h-[70%] rounded-2xl bg-gradient-to-br from-slate-200 to-white flex items-center justify-center text-slate-200 text-xs text-center px-4">
                    Tidak ada gambar produk
                  </div>
                )}
              </div>
            </div>
            <div data-aos="fade-left" className="flex flex-col gap-4">
              <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>
              <div>
                <p className="text-xs text-slate-200">Harga mulai dari</p>
                <p className="text-2xl font-bold text-white">
                  IDR {product.price.toLocaleString("id-ID")}
                </p>
                <p className="text-[11px] text-slate-200/80">
                  * harga OTR {product.city}
                </p>
              </div>
              {product.highlights && (
                <div className="grid grid-cols-3 gap-3 max-w-md">
                  <div className="bg-white/10 rounded-xl p-3 text-center">
                    <Zap className="h-5 w-5 text-bydLightBlue mx-auto" />
                    <p className="mt-1 text-[11px] text-slate-100">Daya</p>
                    <p className="font-semibold text-sm text-white">
                      {product.highlights.power}
                    </p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 text-center">
                    <Battery className="h-5 w-5 text-bydLightBlue mx-auto" />
                    <p className="mt-1 text-[11px] text-slate-100">Baterai</p>
                    <p className="font-semibold text-sm text-white">
                      {product.highlights.battery}
                    </p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 text-center">
                    <Gauge className="h-5 w-5 text-bydLightBlue mx-auto" />
                    <p className="mt-1 text-[11px] text-slate-100">Jangkauan</p>
                    <p className="font-semibold text-sm text-white">
                      {product.highlights.range}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex gap-3 mt-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => openWhatsApp("membeli atau konsultasi")}
                  className="px-5 py-2.5 rounded-full bg-white text-bydBlue text-xs font-semibold hover:bg-slate-100 transition-colors"
                >
                  Hubungi Dealer
                </button>
                <button
                  type="button"
                  onClick={() => openWhatsApp("booking test drive")}
                  className="px-5 py-2.5 rounded-full border border-white/40 text-white text-xs font-semibold hover:bg-white/10 transition-colors"
                >
                  Booking Test Drive
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="container-xl flex">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-5 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === t.key
                  ? "border-bydBlue text-bydBlue"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <section className="bg-white py-10 md:py-14">
        <div className="container-xl">
          {/* ---- Ringkasan ---- */}
          {activeTab === "ringkasan" && (
            <div data-aos="fade-up">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Ringkasan
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
                {product.description || product.shortDescription}
              </p>

              {/* Highlight utama sudah ditampilkan di hero */}
            </div>
          )}

          {/* ---- Eksterior & Interior ---- */}
          {activeTab === "eksterior" && (hasExterior || hasInterior) && (
            <div data-aos="fade-up">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Eksterior &amp; Interior
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {hasExterior &&
                  product.exteriorMedia.map((m, idx) => (
                    <div
                      key={`ext-${idx}`}
                      className="aspect-[16/10] rounded-xl overflow-hidden bg-slate-100"
                    >
                      <img
                        src={getImageUrl(m.url)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                {hasInterior &&
                  product.interiorMedia.map((m, idx) => (
                    <div
                      key={`int-${idx}`}
                      className="aspect-[16/10] rounded-xl overflow-hidden bg-slate-100"
                    >
                      <img
                        src={getImageUrl(m.url)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ---- Spesifikasi ---- */}
          {activeTab === "spesifikasi" && (
            <div data-aos="fade-up">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                Spesifikasi
              </h2>
              {product.specs && product.specs.length > 0 ? (
                <div className="max-w-2xl divide-y divide-slate-100">
                  {product.specs.map((s, i) => (
                    <div
                      key={i}
                      className="flex justify-between py-3 text-sm"
                    >
                      <span className="text-slate-500">{s.label}</span>
                      <span className="font-medium text-slate-900 text-right">
                        {s.value}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  Spesifikasi belum tersedia.
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {hasGallery && (
        <section className="bg-bydGray py-10 md:py-14">
          <div className="container-xl">
            <h2
              className="text-xl font-bold text-slate-900 mb-6"
              data-aos="fade-up"
            >
              Media Gallery
            </h2>
            <div
              className="grid grid-cols-2 md:grid-cols-4 gap-3"
              data-aos="fade-up"
            >
              {product.galleryMedia.map((m, idx) => (
                <div
                  key={idx}
                  className="aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-slate-200 to-white"
                >
                  <img
                    src={getImageUrl(m.url)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Color Options */}
      {product.colors && product.colors.length > 0 && (
        <section className="bg-white py-10 md:py-14">
          <div className="container-xl" data-aos="fade-up">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              Pilihan Warna
            </h2>
            <div className="flex items-center gap-4">
              {product.colors.map((c, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedColor(i)}
                  className={`flex flex-col items-center gap-2 group`}
                >
                  <div
                    className={`w-12 h-12 rounded-full border-2 transition-all ${
                      i === selectedColor
                        ? "border-bydBlue scale-110 shadow-md"
                        : "border-slate-200 group-hover:border-slate-300"
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                  <span
                    className={`text-xs ${
                      i === selectedColor
                        ? "text-bydBlue font-semibold"
                        : "text-slate-500"
                    }`}
                  >
                    {c.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Price + CTA sudah berada di hero section */}

      {/* Produk Lainnya */}
      {others.length > 0 && (
        <section className="bg-white py-10 md:py-14">
          <div className="container-xl">
            <h2
              className="text-xl font-bold text-slate-900 mb-6"
              data-aos="fade-up"
            >
              Produk Lainnya
            </h2>
            <Swiper
              modules={[Navigation]}
              spaceBetween={16}
              slidesPerView={1.2}
              breakpoints={{
                640: { slidesPerView: 2.2 },
                1024: { slidesPerView: 3.2 }
              }}
              navigation={{
                nextEl: ".other-next",
                prevEl: ".other-prev"
              }}
              className="!overflow-visible"
            >
              {others.map((p) => (
                <SwiperSlide key={p.id}>
                  <Link
                    to={`/produk/${p.slug}`}
                    className="block bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-card transition-shadow"
                  >
                    <div className="bg-bydGray aspect-[4/3] flex items-center justify-center">
                      {p.imageUrl ? (
                        <img
                          src={getImageUrl(p.imageUrl)}
                          alt={p.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-[70%] h-[60%] rounded-xl bg-gradient-to-br from-slate-200 to-white flex items-center justify-center text-[11px] text-slate-400 text-center px-2">
                          Tidak ada gambar
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="font-semibold text-sm">{p.name}</p>
                      <p className="text-xs text-red-600 font-bold mt-1">
                        IDR {p.price.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
            {others.length > 1 && (
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  className="other-prev h-9 w-9 rounded-full bg-white text-slate-700 shadow-sm flex items-center justify-center hover:bg-bydBlue hover:text-white transition-colors"
                  aria-label="Produk sebelumnya"
                >
                  <ChevronRight className="-scale-x-100 h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="other-next h-9 w-9 rounded-full bg-white text-slate-700 shadow-sm flex items-center justify-center hover:bg-bydBlue hover:text-white transition-colors"
                  aria-label="Produk berikutnya"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
