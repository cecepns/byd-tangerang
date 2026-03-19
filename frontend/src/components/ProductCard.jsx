import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function ProductCard({ product }) {
  return (
    <article
      className="bg-white rounded-2xl shadow-card overflow-hidden flex flex-col"
      data-aos="fade-up"
    >
      <div className="bg-bydGray/60 aspect-[4/3] flex items-center justify-center">
        <div className="w-[80%] h-[70%] rounded-2xl bg-[linear-gradient(135deg,#b0becf,#ffffff)]" />
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <span className="text-[11px] uppercase tracking-[0.16em] text-bydBlue font-semibold">
          BYD
        </span>
        <h3 className="mt-1 font-semibold text-sm md:text-base">
          {product.name}
        </h3>
        <p className="mt-1 text-xs text-slate-500 line-clamp-2">
          {product.shortDescription}
        </p>
        <p className="mt-3 text-sm font-semibold text-bydBlue">
          IDR {product.price.toLocaleString("id-ID")}
        </p>
        <p className="text-[11px] text-slate-500">
          * harga OTR {product.city || "Tangerang"}
        </p>
        <Link
          to={`/produk/${product.slug || product.id}`}
          className="mt-4 inline-flex items-center justify-between text-xs font-semibold text-bydBlue border border-bydBlue/40 rounded-full px-4 py-2 hover:bg-bydBlue hover:text-white transition-colors"
        >
          <span>Detail Produk</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}
