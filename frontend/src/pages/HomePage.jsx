import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import {
  Zap,
  Battery,
  Gauge,
  MapPin,
  Search,
  ChevronLeft,
  ChevronRight,
  Car,
  Wrench,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import AOS from "aos";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import {
  fetchProducts,
  fetchBanners,
  fetchTestimonials,
  fetchFacilities,
  fetchSettings,
  getImageUrl
} from "../utils/api";
import HeroHome from "../components/HeroHome";
import bydCarsImage from "../assets/mobil-testdrive.webp";
import AboutUsImage from "../assets/about-us.png";
import bgTestDrive from "../assets/bg-test-drive.webp";
import fasilitasServiceCenter from "../assets/fasilitas/service-center.jpg";
import fasilitasWaitingRoom from "../assets/fasilitas/waiting-room.webp";
import fasilitasWallCharger from "../assets/fasilitas/wall-charger.webp";
import dealerMapImage from "../assets/dealer.png";

const fallbackProducts = [
  {
    id: 1,
    name: "BYD M6",
    slug: "byd-m6",
    price: 403000000,
    city: "Tenggarong",
    shortDescription: "MPV listrik keluarga dengan kabin luas dan nyaman.",
    highlights: { power: "163 PS", battery: "55.4 kWh", range: "420 km" },
  },
  {
    id: 2,
    name: "BYD Sealion 7",
    slug: "byd-sealion-7",
    price: 638500000,
    city: "Tangerang",
    shortDescription: "SUV listrik dengan jarak tempuh jauh dan kabin luas.",
    highlights: { power: "390 PS", battery: "82.5 kWh", range: "502 km" },
  },
  {
    id: 3,
    name: "BYD Seal",
    slug: "byd-seal",
    price: 650500000,
    city: "Jakarta",
    shortDescription: "Sedan listrik premium dengan performa tinggi.",
    highlights: { power: "313 PS", battery: "82.5 kWh", range: "570 km" },
  },
  {
    id: 4,
    name: "BYD Atto 3",
    slug: "byd-atto-3",
    price: 410000000,
    city: "Surabaya",
    shortDescription: "SUV kompak listrik yang stylish dan efisien.",
    highlights: { power: "204 PS", battery: "60.48 kWh", range: "420 km" },
  },
  {
    id: 5,
    name: "BYD Atto 1",
    slug: "byd-atto-1",
    price: 214000000,
    city: "Tenggarong",
    shortDescription: "City car listrik praktis untuk aktivitas harian.",
    highlights: { power: "75 PS", battery: "44.9 kWh", range: "405 km" },
  },
  {
    id: 6,
    name: "BYD Dolphin",
    slug: "byd-dolphin",
    price: 380500000,
    city: "Bandung",
    shortDescription: "Hatchback listrik dengan desain unik dan modern.",
    highlights: { power: "177 PS", battery: "60.48 kWh", range: "490 km" },
  },
];

export default function HomePage() {
  const [products, setProducts] = useState(fallbackProducts);
  const [banners, setBanners] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(0);
  const [testimonials, setTestimonials] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [whatsappNumber, setWhatsappNumber] = useState("");

  useEffect(() => {
    AOS.init({
      once: true,
      duration: 800,
      easing: "ease-out-quart",
      disable: () => window.innerWidth < 768,
    });
    async function load() {
      try {
        const [prodData, bannerData, testiData, facilitiesData, settingsData] =
          await Promise.allSettled([
          fetchProducts(),
          fetchBanners({ active: "true" }),
          fetchTestimonials(),
            fetchFacilities(),
            fetchSettings()
        ]);
        if (prodData.status === "fulfilled" && prodData.value?.length) {
          setProducts(prodData.value);
        }
        if (bannerData.status === "fulfilled") {
          setBanners(bannerData.value);
        }
        if (testiData.status === "fulfilled") {
          setTestimonials(testiData.value || []);
        }
        if (facilitiesData.status === "fulfilled") {
          setFacilities(facilitiesData.value || []);
        }
        if (settingsData.status === "fulfilled") {
          setWhatsappNumber(
            settingsData.value?.footer?.whatsappNumber || ""
          );
        }
      } catch {
        // use fallbacks
      }
    }
    load();
  }, []);

  const current = products[selectedProduct] || products[0];
  const heroBanners = banners.filter((b) => b.position === "hero");
  const promoBanners = banners.filter((b) => b.position === "promo");

  const fasilitasTabsFromApi =
    facilities && facilities.length
      ? facilities.map((item, idx) => ({
          key: item.key || `fasilitas-${idx}`,
          label: item.label || `Fasilitas ${idx + 1}`,
          image: item.imageUrl ? getImageUrl(item.imageUrl) : null,
          description: item.description || ""
        }))
      : null;

  const fasilitasTabs =
    fasilitasTabsFromApi && fasilitasTabsFromApi.length
      ? fasilitasTabsFromApi
      : [
          {
            key: "fasilitas",
            label: "Fasilitas",
            image: fasilitasServiceCenter,
            description:
              "Area servis dan bengkel resmi BYD dengan teknisi terlatih dan peralatan lengkap untuk perawatan kendaraan listrik Anda."
          },
          {
            key: "waiting",
            label: "Waiting Room",
            image: fasilitasWaitingRoom,
            description:
              "Ruang tunggu nyaman dengan fasilitas lengkap sambil menunggu kendaraan Anda diservis."
          },
          {
            key: "charger",
            label: "Wall Charger",
            image: fasilitasWallCharger,
            description:
              "Stasiun pengisian daya untuk kendaraan listrik BYD, tersedia di area dealer untuk kebutuhan charging Anda."
          }
        ];

  function openWhatsApp(context) {
    if (!whatsappNumber) return;
    const msg = `Halo, saya ingin ${context} untuk BYD.`;
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      msg
    )}`;
    window.open(url, "_blank");
  }
  const [activeFasilitasTab, setActiveFasilitasTab] = useState("fasilitas");
  const activeFasilitas =
    fasilitasTabs.find((t) => t.key === activeFasilitasTab) || fasilitasTabs[0];
  const productThumbsSwiperRef = useRef(null);
  const [thumbsCanPrev, setThumbsCanPrev] = useState(false);
  const [thumbsCanNext, setThumbsCanNext] = useState(true);

  return (
    <>
      {/* ============ HERO BANNER (dikelola di Admin Banner, posisi Hero) ============ */}
      <HeroHome heroBanners={heroBanners} />

      {/* ============ TENTANG KAMI ============ */}
      <section className="bg-white py-14 md:py-20">
        <div className="container-xl grid md:grid-cols-2 gap-10 items-center">
          <div data-aos="fade-right">
            <p className="text-xs uppercase tracking-[0.25em] text-bydBlue font-semibold">
              Sales Consultant BYD
            </p>
            <h2 className="mt-3 text-2xl md:text-3xl font-bold text-slate-900">
              William Surya Darma
            </h2>
            <p className="mt-4 text-sm text-slate-600 leading-relaxed">
              William Surya Darma adalah seorang Sales Consultant yang berfokus
              pada pemasaran kendaraan listrik dari BYD. Dengan pemahaman yang
              baik mengenai teknologi kendaraan listrik, fitur kendaraan, serta
              kebutuhan pelanggan, William berkomitmen memberikan pelayanan
              profesional dan solusi mobilitas yang efisien, modern, dan ramah
              lingkungan.
            </p>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Sebagai bagian dari tim penjualan BYD, William aktif membantu
              pelanggan dalam memilih kendaraan listrik yang sesuai dengan
              kebutuhan mereka, memberikan edukasi mengenai teknologi EV, serta
              memastikan proses pembelian hingga pengiriman kendaraan berjalan
              dengan nyaman dan transparan
            </p>
          </div>
          <div
            data-aos="fade-left"
            className="relative min-h-[280px] flex justify-center items-end overflow-visible"
          >
            {/* Mobil tampak keluar dari bg: bagian bawah melewati tepi container */}
            <div className="relative h-96 md:h-[500px] max-w-lg">
              <img
                src={AboutUsImage}
                alt="BYD cars"
                className="w-full h-full object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONI CUSTOMER ============ */}
      <section className="bg-bydGray py-12 md:py-16">
        <div className="container-xl" data-aos="fade-up">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-bydBlue font-semibold">
                Testimoni
              </p>
              <h2 className="mt-2 text-xl md:text-2xl font-bold text-slate-900">
                Cerita Pelanggan BYD Bipo
              </h2>
              <p className="mt-2 text-sm text-slate-500 max-w-xl">
                Pengalaman nyata dari para pemilik BYD yang merasakan efisiensi,
                kenyamanan, dan layanan purna jual Arista Group.
              </p>
            </div>
          </div>

          <div className="mt-8">
            {testimonials.length === 0 ? (
              <div className="bg-white/80 border border-slate-200 rounded-2xl p-6 text-sm text-slate-500">
                Belum ada testimoni yang ditampilkan. Silakan tambahkan testimoni dari
                halaman Admin.
              </div>
            ) : (
              <Swiper
                modules={[Navigation, Autoplay, Pagination]}
                slidesPerView={1}
                spaceBetween={24}
                loop={testimonials.length > 1}
                autoplay={
                  testimonials.length > 1
                    ? { delay: 6000, disableOnInteraction: false }
                    : false
                }
                pagination={{
                  clickable: true,
                  el: ".testimonial-pagination",
                  bulletClass:
                    "hero-banner-bullet bg-bydBlue/30 hover:bg-bydBlue/60",
                  bulletActiveClass:
                    "hero-banner-bullet-active bg-bydBlue"
                }}
                navigation={{
                  nextEl: ".testimonial-next",
                  prevEl: ".testimonial-prev"
                }}
                className="!overflow-visible"
              >
                {testimonials.map((t) => (
                  <SwiperSlide key={t.id}>
                    <div className="bg-white rounded-2xl shadow-card p-6 md:p-8 grid md:grid-cols-[auto,1fr] gap-6 md:gap-8 items-center">
                      <div className="flex flex-col items-center gap-3">
                        {t.imageUrl ? (
                          <div className="h-44 w-44 rounded-2xl overflow-hidden bg-bydGray/30 shadow-md">
                            <img
                              src={getImageUrl(t.imageUrl)}
                              alt={t.customerName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-20 w-20 rounded-full bg-bydGray flex items-center justify-center text-bydBlue font-semibold text-lg">
                            {t.customerName?.charAt(0) || "C"}
                          </div>
                        )}
                        <div className="text-center text-xs text-slate-500">
                          <div className="font-semibold text-slate-800">
                            {t.customerName || "Customer BYD"}
                          </div>
                          {t.city && <div>{t.city}</div>}
                        </div>
                      </div>
                      <div>
                        {t.title && (
                          <h3 className="text-base md:text-lg font-semibold text-slate-900">
                            {t.title}
                          </h3>
                        )}
                        <p className="mt-3 text-sm md:text-base text-slate-600 leading-relaxed">
                          “{t.message}”
                        </p>
                        {typeof t.rating === "number" && t.rating > 0 && (
                          <div className="mt-4 flex items-center gap-1 text-amber-500 text-xs">
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <span key={idx}>{idx < t.rating ? "★" : "☆"}</span>
                            ))}
                            <span className="ml-2 text-slate-500">
                              {t.rating}/5
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </div>

          {testimonials.length > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="flex gap-3">
                <button
                  type="button"
                  className="testimonial-prev h-9 w-9 rounded-full bg-white text-slate-700 shadow-card flex items-center justify-center hover:bg-bydBlue hover:text-white transition-colors"
                  aria-label="Testimoni sebelumnya"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="testimonial-next h-9 w-9 rounded-full bg-white text-slate-700 shadow-card flex items-center justify-center hover:bg-bydBlue hover:text-white transition-colors"
                  aria-label="Testimoni berikutnya"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="testimonial-pagination flex gap-2" />
            </div>
          )}
        </div>
      </section>

      {/* ============ JELAJAHI PRODUK BYD ============ */}
      <section className="bg-white py-14 md:py-20">
        <div className="container-xl">
          <div className="text-center mb-10" data-aos="fade-up">
            <p className="text-xs uppercase tracking-[0.25em] text-bydBlue font-semibold">
              Produk
            </p>
            <h2 className="mt-2 text-2xl md:text-3xl font-bold text-slate-900">
              Jelajahi Produk BYD
            </h2>
            <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
              Temukan kendaraan listrik BYD yang sesuai dengan kebutuhan Anda
            </p>
          </div>

          <div
            className="grid md:grid-cols-[1fr,1.1fr] gap-8 items-start"
            data-aos="fade-up"
          >
            {/* Product image dari data products */}
            <div className="aspect-square">
              {current.imageUrl ? (
                <img
                  src={getImageUrl(current.imageUrl)}
                  alt={current.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                  <span className="text-slate-400 text-sm">
                    {current.name} — Tidak ada gambar
                  </span>
                </div>
              )}
            </div>

            {/* Product info */}
            <div>
              <span className="inline-block bg-bydBlue text-white text-[11px] font-semibold px-3 py-1 rounded-full">
                BYD
              </span>
              <h3 className="mt-3 text-2xl font-bold text-slate-900">
                {current.name}
              </h3>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                {current.shortDescription}
              </p>

              {current.highlights && (
                <div className="mt-5 grid grid-cols-3 gap-3">
                  <div className="bg-bydGray rounded-xl p-3 text-center">
                    <Zap className="h-5 w-5 text-bydBlue mx-auto" />
                    <p className="mt-1 text-xs text-slate-500">Daya</p>
                    <p className="font-semibold text-sm">
                      {current.highlights.power}
                    </p>
                  </div>
                  <div className="bg-bydGray rounded-xl p-3 text-center">
                    <Battery className="h-5 w-5 text-bydBlue mx-auto" />
                    <p className="mt-1 text-xs text-slate-500">Baterai</p>
                    <p className="font-semibold text-sm">
                      {current.highlights.battery}
                    </p>
                  </div>
                  <div className="bg-bydGray rounded-xl p-3 text-center">
                    <Gauge className="h-5 w-5 text-bydBlue mx-auto" />
                    <p className="mt-1 text-xs text-slate-500">Jangkauan</p>
                    <p className="font-semibold text-sm">
                      {current.highlights.range}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-5 flex items-baseline gap-2">
                <span className="text-xs text-slate-500">Mulai dari</span>
                <span className="text-xl font-bold text-bydBlue">
                  IDR {current.price.toLocaleString("id-ID")}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                * harga OTR {current.city}
              </p>

              <div className="mt-5 flex gap-3">
                <Link
                  to={`/produk/${current.slug}`}
                  className="px-5 py-2.5 rounded-full bg-bydBlue text-white text-sm font-semibold hover:bg-bydBlue/90 transition-colors inline-flex items-center gap-2"
                >
                  Lihat Detail
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button className="px-5 py-2.5 rounded-full border border-bydBlue/30 text-bydBlue text-sm font-semibold hover:bg-bydBlue/5 transition-colors">
                  Test Drive
                </button>
              </div>
            </div>
          </div>

          {/* Thumbnail strip — Swiper: mobile 1, desktop 4 cols */}
          <div className="mt-6 md:mt-0 product-thumbs-swiper-wrap relative">
            <button
              type="button"
              onClick={() => {
                setSelectedProduct((prev) => {
                  const nextIndex = Math.max(0, prev - 1);
                  const swiper = productThumbsSwiperRef.current;
                  if (swiper) {
                    const perView =
                      typeof swiper.params.slidesPerView === "number"
                        ? swiper.params.slidesPerView
                        : 1;
                    if (nextIndex < swiper.activeIndex) {
                      swiper.slideTo(Math.max(0, nextIndex));
                    }
                    setThumbsCanPrev(!swiper.isBeginning);
                    setThumbsCanNext(!swiper.isEnd);
                  }
                  return nextIndex;
                });
              }}
              disabled={!thumbsCanPrev}
              className="product-thumb-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 h-11 w-11 rounded-full bg-bydBlue text-white shadow-lg flex items-center justify-center hover:bg-bydBlue/90 transition-colors disabled:opacity-40 disabled:pointer-events-none"
              aria-label="Produk sebelumnya"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedProduct((prev) => {
                  const lastIndex = products.length - 1;
                  const nextIndex = Math.min(lastIndex, prev + 1);
                  const swiper = productThumbsSwiperRef.current;
                  if (swiper) {
                    const perView =
                      typeof swiper.params.slidesPerView === "number"
                        ? swiper.params.slidesPerView
                        : 1;
                    const endVisible = swiper.activeIndex + perView - 1;
                    if (nextIndex > endVisible) {
                      const target = nextIndex - perView + 1;
                      swiper.slideTo(Math.max(0, target));
                    }
                    setThumbsCanPrev(!swiper.isBeginning);
                    setThumbsCanNext(!swiper.isEnd);
                  }
                  return nextIndex;
                });
              }}
              disabled={!thumbsCanNext}
              className="product-thumb-next absolute right-0 top-1/2 -translate-y-1/2 z-10 h-11 w-11 rounded-full bg-bydBlue text-white shadow-lg flex items-center justify-center hover:bg-bydBlue/90 transition-colors disabled:opacity-40 disabled:pointer-events-none"
              aria-label="Produk berikutnya"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            <Swiper
              modules={[Navigation, Pagination]}
              onSwiper={(swiper) => {
                productThumbsSwiperRef.current = swiper;
                setThumbsCanPrev(!swiper.isBeginning);
                setThumbsCanNext(!swiper.isEnd);
              }}
              onSlideChange={(swiper) => {
                setThumbsCanPrev(!swiper.isBeginning);
                setThumbsCanNext(!swiper.isEnd);
              }}
              initialSlide={selectedProduct}
              spaceBetween={16}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 4 },
              }}
              navigation={false}
              pagination={{
                clickable: true,
                el: ".product-thumb-pagination",
                bulletClass: "product-thumb-bullet",
                bulletActiveClass: "product-thumb-bullet-active",
              }}
              className="!overflow-visible px-12"
            >
              {products.map((p, i) => (
                <SwiperSlide key={p.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProduct(i);
                      productThumbsSwiperRef.current?.slideTo(i);
                    }}
                    className={`w-full rounded-xl border-2 transition-all overflow-hidden text-left ${
                      i === selectedProduct
                        ? "border-bydBlue bg-bydLightBlue/30 shadow-md"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="h-20 w-full bg-slate-50 flex items-center justify-center">
                      {p.imageUrl ? (
                        <img
                          src={getImageUrl(p.imageUrl)}
                          alt={p.name}
                          className="max-w-full max-h-full object-contain p-0.5"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-400 text-center px-1">
                          {p.name}
                        </span>
                      )}
                    </div>
                    <p
                      className={`py-1.5 px-2 text-center text-xs font-semibold leading-tight line-clamp-2 ${
                        i === selectedProduct
                          ? "text-bydBlue"
                          : "text-slate-700"
                      }`}
                    >
                      {p.name}
                    </p>
                  </button>
                </SwiperSlide>
              ))}
            </Swiper>
            <div className="product-thumb-pagination flex justify-center gap-2 mt-4" />
          </div>
        </div>
      </section>

      {/* ============ FASILITAS DEALER ============ */}
      <section className="bg-bydGray py-14 md:py-20">
        <div className="container-xl">
          <div className="text-center mb-10" data-aos="fade-up">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              Fasilitas Dealer
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Nikmati fasilitas modern di setiap dealer BYD Bipo
            </p>
          </div>
          <div
            className="grid md:grid-cols-2 gap-8 md:gap-12 items-stretch"
            data-aos="fade-up"
          >
            {/* Kiri: gambar sesuai tab */}
            <div className="aspect-[4/3] md:aspect-auto md:min-h-[320px] rounded-2xl overflow-hidden shadow-lg bg-slate-100">
              <img
                src={activeFasilitas.image}
                alt={activeFasilitas.label}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Kanan: tab + deskripsi */}
            <div className="flex flex-col">
              <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
                {fasilitasTabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveFasilitasTab(tab.key)}
                    className={`px-4 py-2.5 rounded-t-xl text-sm font-medium transition-colors ${
                      activeFasilitasTab === tab.key
                        ? "bg-bydBlue text-white shadow-sm"
                        : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex-1 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900">
                  {activeFasilitas.label}
                </h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  {activeFasilitas.description}
                </p>
              </div>
            </div>
          </div>
          <div
            className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4"
            data-aos="fade-up"
          >
            {[
              { icon: Car, label: "Showroom Modern" },
              { icon: Wrench, label: "Workshop Terstandar" },
              { icon: ShieldCheck, label: "Garansi Resmi" },
              { icon: Zap, label: "Charging Station" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="bg-white rounded-xl p-5 flex items-center gap-3 shadow-sm"
              >
                <div className="h-10 w-10 rounded-full bg-bydBlue/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-bydBlue" />
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PROMO TERBARU ============ */}
      <section className="bg-bydBlue text-white py-14 md:py-20">
        <div className="container-xl">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div data-aos="fade-right">
              <p className="text-xs uppercase tracking-[0.25em] text-bydLightBlue font-semibold">
                Promo Terbaru
              </p>
              <h2 className="mt-2 text-2xl md:text-3xl font-bold">
                Nikmati Penawaran Menarik BYD
              </h2>
              <p className="mt-2 text-sm text-bydLightBlue max-w-md">
                Dapatkan promo spesial untuk pembelian perdana dan program test
                drive di dealer BYD Bipo terdekat.
              </p>
            </div>
            <Link
              to="/produk"
              className="text-sm text-bydLightBlue hover:text-white flex items-center gap-1"
            >
              Lihat semua <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {promoBanners.length > 0 ? (
            <Swiper
              modules={[Navigation, Autoplay]}
              spaceBetween={20}
              slidesPerView={1}
              navigation
              autoplay={{ delay: 4000 }}
            >
              {promoBanners.map((b) => (
                <SwiperSlide key={b.id}>
                  <div className="rounded-2xl overflow-hidden grid grid-cols-2 bg-white/10">
                    <div className="min-h-0">
                      {b.imageUrl ? (
                        <img
                          src={getImageUrl(b.imageUrl)}
                          alt={b.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/5" />
                      )}
                    </div>
                    <div className="flex flex-col justify-center items-end text-right p-6">
                      <p className="text-lg font-bold text-white">{b.title}</p>
                      <p className="mt-1 text-sm text-bydLightBlue">
                        {b.subtitle}
                      </p>
                      {!b.imageUrl && (
                        <span className="mt-3 text-xs text-slate-300">
                          Placeholder Banner
                        </span>
                      )}
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="grid md:grid-cols-2 gap-5" data-aos="fade-up">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="aspect-[16/8] rounded-2xl bg-white/10 flex items-center justify-center text-white/50 text-sm"
                >
                  Placeholder Promo Banner {i}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============ BOOK & TEST DRIVE ============ */}
      <section className="py-14 md:py-20 overflow-hidden">
        <div
          className="container-xl relative min-h-[320px] md:min-h-[400px] rounded-3xl overflow-hidden shadow-lg"
          data-aos="fade-up"
        >
          {/* Left: teks + tombol, background abu dengan diagonal kanan */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200"
            style={{
              clipPath: "polygon(0 0, 85% 0, 35% 100%, 0 100%)",
            }}
          />
          <div
            className="absolute inset-0 flex items-center"
            style={{
              clipPath: "polygon(0 0, 85% 0, 35% 100%, 0 100%)",
            }}
          >
            <div className="max-w-md pl-6 md:pl-12 pr-8 py-8">
              <p className="text-xs uppercase tracking-[0.25em] text-bydBlue font-semibold">
                Book &amp; Test Drive
              </p>
              <h2 className="mt-3 text-2xl md:text-3xl font-bold text-slate-900">
                Rasakan Pengalaman Berkendara BYD
              </h2>
              <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                Jadwalkan test drive di dealer BYD Bipo terdekat dan rasakan
                langsung kenyamanan serta performa kendaraan listrik BYD. Kami
                siap memberikan pengalaman terbaik untuk Anda.
              </p>
              <button className="mt-6 px-6 py-3 rounded-full bg-bydBlue text-white text-sm font-semibold hover:bg-bydBlue/90 transition-colors shadow-md">
                Book A Test Drive
              </button>
            </div>
          </div>

          {/* Kanan: background kota + mobil */}
          <div
            className="hidden lg:block absolute inset-0 bg-slate-300 bg-cover bg-center"
            style={{
              backgroundImage: `url(${bgTestDrive})`,
              clipPath: "polygon(85% 0, 100% 0, 100% 100%, 35% 100%)",
            }}
          />
          <div
            className="hidden lg:flex absolute inset-0 items-end justify-end pr-4 md:pr-10"
            style={{
              clipPath: "polygon(85% 0, 100% 0, 100% 100%, 35% 100%)",
            }}
          >
            <img
              src={bydCarsImage}
              alt="BYD Car"
              className="h-[180px] md:h-[260px] w-auto object-contain object-bottom-right md:object-center"
            />
          </div>
        </div>
      </section>

      {/* ============ JARINGAN DEALER MAP ============ */}
      {/* <section className="bg-white py-14 md:py-20">
        <div className="container-xl grid md:grid-cols-3 gap-8 md:gap-12 items-center">
          <div className="md:col-span-1" data-aos="fade-right">
            <h2 className="text-2xl md:text-3xl font-bold text-bydBlue">
              Jaringan Dealer
            </h2>
            <p className="mt-4 text-sm text-slate-600 leading-relaxed">
              Jaringan sales poin BYD Bipo berada di: DKI Jakarta, Tangerang,
              Depok, Bekasi, Bandung, Medan, Pekanbaru dan akan terus berkembang
              ke daerah lainnya.
            </p>
            <Link
              to="/dealer"
              className="inline-block mt-6 px-6 py-3 rounded-lg bg-bydBlue text-white text-sm font-semibold hover:bg-bydBlue/90 transition-colors"
            >
              Lihat Semua Dealer
            </Link>
          </div>
          <div className="md:col-span-2" data-aos="fade-left">
            <img
              src={dealerMapImage}
              alt="Peta Jaringan Dealer BYD Bipo Indonesia"
              className="w-full h-auto object-contain rounded-lg"
            />
          </div>
        </div>
      </section> */}
    </>
  );
}
