import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, EffectFade } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import { getImageUrl } from "../utils/api";

const DEFAULT_HERO = {
  title: "Elevate Every Day",
  subtitle:
    "Jelajahi rangkaian mobil listrik BYD yang efisien, aman, dan menghadirkan pengalaman berkendara modern untuk setiap perjalanan.",
  linkUrl: "/produk"
};

export default function HeroHome({ heroBanners = [] }) {
  const swiperRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const slides =
    heroBanners.length > 0
      ? heroBanners.map((b) => ({
          title: b.title || DEFAULT_HERO.title,
          subtitle: b.subtitle || DEFAULT_HERO.subtitle,
          linkUrl: b.linkUrl || DEFAULT_HERO.linkUrl,
          imageUrl: b.imageUrl ? getImageUrl(b.imageUrl) : null
        }))
      : [{ ...DEFAULT_HERO, imageUrl: null }];

  return (
    <section
      id="home"
      className="relative bg-bydBlue text-white overflow-hidden min-h-screen flex flex-col"
    >
      {/* Background blur per-slide: pakai Swiper fade untuk transisi halus */}
      <div className="pointer-events-none absolute inset-0">
        {slides.map((slide, index) => (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className="absolute inset-0 transition-opacity duration-700"
            style={{
              opacity: activeIndex === index ? 1 : 0
            }}
          >
            {slide.imageUrl && (
              <>
                <img
                  src={slide.imageUrl}
                  alt={slide.title}
                  className="w-full h-full object-cover scale-105 blur-sm opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-bydBlue/80" />
              </>
            )}
          </div>
        ))}
      </div>
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_top,_#4f8bff,_transparent_60%)]" />
      <Swiper
        modules={[EffectFade, Pagination, Autoplay]}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onSlideChange={(swiper) => {
          setActiveIndex(swiper.realIndex ?? swiper.activeIndex ?? 0);
        }}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        className="hero-banner-swiper flex-1 w-full !overflow-hidden"
        slidesPerView={1}
        spaceBetween={0}
        loop={slides.length > 1}
        autoplay={
          slides.length > 1
            ? { delay: 5000, disableOnInteraction: false }
            : false
        }
        pagination={{
          clickable: true,
          el: ".hero-banner-pagination",
          bulletClass: "hero-banner-bullet",
          bulletActiveClass: "hero-banner-bullet-active"
        }}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="min-h-screen flex items-center py-12 md:py-16">
              <div className="container-xl relative z-10 w-full flex flex-col md:grid md:grid-cols-[0.85fr,1.15fr] gap-8 md:gap-10 items-center">
                {/* Mobile: gambar di atas (order-1), desktop: kiri (kolom 1) */}
                <div className="order-2 md:order-1 w-full">
                  <p className="text-xs uppercase tracking-[0.2em] text-bydLightBlue">
                    BYD Bipo GROUP
                  </p>
                  <h1 className="mt-3 text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold leading-tight">
                    {slide.title}
                  </h1>
                  <p className="mt-4 text-sm md:text-base lg:text-lg text-bydLightBlue max-w-lg">
                    {slide.subtitle}
                  </p>
                  <div className="mt-8 flex flex-wrap gap-4 text-sm">
                    <Link
                      to={slide.linkUrl}
                      className="px-6 py-3 rounded-full bg-white text-bydBlue font-semibold shadow-card hover:shadow-lg transition-shadow"
                    >
                      Lihat Produk
                    </Link>
                    <button
                      type="button"
                      className="px-6 py-3 rounded-full border-2 border-white/40 text-white hover:bg-white/10 transition-colors"
                    >
                      Booking Test Drive
                    </button>
                  </div>
                </div>
                {/* Mobile: gambar di atas (order-1), desktop: kanan (kolom 2) */}
                <div className="order-1 md:order-2 relative w-full">
                  <div className="w-full aspect-[16/10] md:aspect-[16/9] md:min-h-[320px] rounded-2xl md:rounded-3xl bg-gradient-to-br from-[#1f3da8] to-[#040c3a] shadow-card flex items-center justify-center overflow-hidden">
                    {slide.imageUrl ? (
                      <img
                        src={slide.imageUrl}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-[90%] max-w-md">
                        <div className="w-full h-44 md:h-56 bg-[linear-gradient(135deg,#b0becf,#ffffff)] rounded-3xl shadow-2xl flex items-center justify-center text-slate-400 text-sm text-center px-4">
                          Placeholder — atur gambar di Admin Banner (posisi Hero)
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Prev / Next — pakai ref agar klik berfungsi */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => swiperRef.current?.slidePrev()}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
            aria-label="Banner sebelumnya"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={() => swiperRef.current?.slideNext()}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
            aria-label="Banner berikutnya"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Pagination */}
      <div className="hero-banner-pagination absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-2" />
    </section>
  );
}
