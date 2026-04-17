"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar } from "lucide-react";

interface Article {
  slug: string;
  date: string;
  title: string;
  image: string;
  excerpt?: string;
}

const featured: Article = {
  slug: "panduan-beli-mobil-bekas-2025",
  date: "17 April 2026",
  title: "Panduan Lengkap Membeli Mobil Bekas Berkualitas",
  image: "/news/featured.jpg",
  excerpt:
    "Tips memilih mobil bekas yang aman, cek fisik mesin, dokumen, dan hal penting lain sebelum membeli.",
};

const articles: Article[] = [
  {
    slug: "cek-mesin-mobil-bekas",
    date: "12 April 2026",
    title: "Cara Cek Kondisi Mesin Sebelum Beli",
    image: "/news/news-1.jpg",
  },
  {
    slug: "dokumen-bpkb-stnk",
    date: "05 April 2026",
    title: "Pentingnya Verifikasi BPKB & STNK",
    image: "/news/news-2.jpg",
  },
  {
    slug: "merawat-mobil-harian",
    date: "28 Maret 2026",
    title: "Tips Merawat Mobil Bekas Harian",
    image: "/news/news-3.jpg",
  },
  {
    slug: "harga-pasar-mobil-2026",
    date: "20 Maret 2026",
    title: "Update Harga Pasar Mobil Bekas 2026",
    image: "/news/news-4.jpg",
  },
];

export default function NewsSection() {
  return (
    <section className="relative bg-kcunk-surface py-16 sm:py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-kcunk-red mb-3">
            Artikel Terbaru
          </p>
          <h2 className="kcunk-heading text-3xl sm:text-4xl md:text-5xl text-kcunk-ink mb-4">
            Our Recent News &amp; Articles
          </h2>
          <p className="text-sm sm:text-base text-kcunk-slate max-w-2xl mx-auto">
            Kumpulan tips, panduan, dan informasi terbaru seputar mobil bekas
            dari K-Cunk Motor untuk membantu keputusan pembelian Anda.
          </p>
        </div>

        {/* Grid — 1 featured + 4 list */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* FEATURED */}
          <Link
            href={`/blog/${featured.slug}`}
            className="group relative block rounded-sm overflow-hidden shadow-lg bg-kcunk-black aspect-[4/3] lg:aspect-auto lg:h-full"
          >
            <Image
              src={featured.image}
              alt={featured.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

            {/* Date badge */}
            <div className="absolute top-5 left-5 inline-flex items-center gap-2 px-3 py-1.5 bg-kcunk-red text-white rounded-sm">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                {featured.date}
              </span>
            </div>

            {/* Content */}
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight mb-3 group-hover:text-kcunk-red-light transition-colors">
                {featured.title}
              </h3>
              {featured.excerpt && (
                <p className="text-sm text-white/80 mb-4 line-clamp-2 max-w-lg">
                  {featured.excerpt}
                </p>
              )}
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-kcunk-red uppercase tracking-wider">
                Read More
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </Link>

          {/* LIST */}
          <div className="space-y-4 sm:space-y-5">
            {articles.map((a) => (
              <NewsListItem key={a.slug} article={a} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function NewsListItem({ article }: { article: Article }) {
  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group flex items-center gap-4 sm:gap-5 p-3 sm:p-4 bg-white rounded-sm shadow-sm hover:shadow-lg border border-transparent hover:border-kcunk-red/30 transition-all"
    >
      <div className="relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-sm overflow-hidden bg-kcunk-line">
        <Image
          src={article.image}
          alt={article.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="96px"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-kcunk-red uppercase tracking-wider mb-1">
          <Calendar className="w-3 h-3" />
          {article.date}
        </div>
        <h4 className="text-sm sm:text-base font-black text-kcunk-ink leading-snug mb-1.5 group-hover:text-kcunk-red transition-colors line-clamp-2">
          {article.title}
        </h4>
        <span className="inline-flex items-center gap-1 text-xs font-bold text-kcunk-slate group-hover:text-kcunk-red uppercase tracking-wider transition-colors">
          Read More
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </Link>
  );
}
