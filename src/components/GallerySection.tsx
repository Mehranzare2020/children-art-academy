/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Artwork } from '../types';
import { Palette, Eye, Smile, Calendar, Sparkles } from 'lucide-react';

interface GallerySectionProps {
  artworks: Artwork[];
}

const CATEGORIES = [
  { id: 'all', title: 'همه نقاشی‌ها 🌈', color: 'bg-rose-50 border-rose-200 text-rose-700' },
  { id: 'آبرنگ و گواش', title: 'آبرنگ و گواش 🎨', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
  { id: 'کلاژ و کاردستی', title: 'کلاژ و کاردستی ✂️', color: 'bg-emerald-50 border-emerald-250 text-emerald-700' },
  { id: 'مداد رنگی', title: 'مداد رنگی ✏️', color: 'bg-amber-50 border-amber-200 text-amber-700' },
  { id: 'خمیر هواخشک', title: 'خمیر هواخشک 🧸', color: 'bg-pink-50 border-pink-200 text-pink-700' },
  { id: 'حجم سازی با گِل', title: 'حجم‌سازی با گل 🏺', color: 'bg-yellow-50 border-yellow-250 text-yellow-800' },
  { id: 'مهرسازی', title: 'مهرسازی 🔲', color: 'bg-cyan-50 border-cyan-200 text-cyan-700' },
  { id: 'طراحی لباس', title: 'طراحی لباس 👗', color: 'bg-rose-50 border-rose-200 text-rose-700' },
  { id: 'طراحی و ساخت جلد کتاب و داستان نویسی', title: 'طراحی جلد و داستان‌نویسی 📖', color: 'bg-purple-50 border-purple-250 text-purple-700' },
  { id: 'طراحی کارت پستال', title: 'طراحی کارت پستال ✉️', color: 'bg-teal-50 border-teal-200 text-teal-700' },
  { id: 'طراحی تمبر', title: 'طراحی تمبر 🖼️', color: 'bg-orange-50 border-orange-200 text-orange-700' },
  { id: 'نمایش خلاق', title: 'نمایش خلاق 🎭', color: 'bg-violet-50 border-violet-200 text-violet-700' }
];

export default function GallerySection({ artworks }: GallerySectionProps) {
  const [filter, setFilter] = useState('all');
  const [selectedArt, setSelectedArt] = useState<Artwork | null>(null);

  const filteredArtworks = filter === 'all'
    ? artworks
    : artworks.filter(art => art.category === filter);

  // Helper for generating pretty pastel canvas placeholders in case base64 fails or isn't loaded
  const getArtPlaceholder = (imageUrl: string, title: string) => {
    if (imageUrl === 'placeholder-dino') {
      return (
        <div className="w-full h-56 bg-emerald-100 flex flex-col items-center justify-center relative p-4 border-b-4 border-emerald-300 text-center">
          <span className="text-6xl animate-bounce mb-2">🦖</span>
          <span className="font-bold text-emerald-800 text-lg">دایناسور تمشکی مهربان</span>
          <span className="text-emerald-600 text-xs mt-1">هنر آبرنگ و مدادرنگی زنده</span>
        </div>
      );
    }
    if (imageUrl === 'placeholder-caterpillar') {
      return (
        <div className="w-full h-56 bg-amber-100 flex flex-col items-center justify-center relative p-4 border-b-4 border-amber-300 text-center">
          <span className="text-6xl rotate-12 mb-2">🐛</span>
          <span className="font-bold text-amber-800 text-lg">کرم ابریشم در فضا</span>
          <span className="text-amber-600 text-xs mt-1">تکنیک زیبای کلاژ حبابی</span>
        </div>
      );
    }
    if (imageUrl === 'placeholder-fish') {
      return (
        <div className="w-full h-56 bg-sky-100 flex flex-col items-center justify-center relative p-4 border-b-4 border-sky-300 text-center">
          <span className="text-6xl animate-pulse mb-2">🐠</span>
          <span className="font-bold text-sky-800 text-lg">سرزمین آبزیان سخنگو</span>
          <span className="text-sky-600 text-xs mt-1">نقاشی خیال‌پردازانه با گواش</span>
        </div>
      );
    }
    
    // Custom uploaded base64 data
    if (imageUrl && imageUrl.startsWith('data:image')) {
      return (
        <img
          src={imageUrl}
          alt={title}
          referrerPolicy="no-referrer"
          className="w-full h-56 object-cover border-b-4 border-gray-100"
        />
      );
    }

    // Generic fallbacks
    return (
      <div className="w-full h-56 bg-rose-100 flex flex-col items-center justify-center relative p-4 border-b-4 border-rose-300 text-center">
        <span className="text-6xl mb-2">✨</span>
        <span className="font-bold text-rose-800 text-lg">{title}</span>
        <span className="text-rose-600 text-xs mt-1 font-bold">برای مشاهده جزییات ضربه بزنید</span>
      </div>
    );
  };

  return (
    <div className="py-2 text-right">
      
      {/* Category selector slider container */}
      <div className="mb-8">
        <div className="flex items-center gap-1.5 justify-end text-xs text-slate-400 font-bold mb-3 pr-2">
          <span>فیلتر بر اساس رشته‌های خلاقیت</span>
          <Palette size={14} className="text-amber-500" />
        </div>
        
        {/* Horizontal scroll rails */}
        <div className="flex gap-2 overflow-x-auto pb-4 scroll-smooth scrollbar-none flex-row-reverse" style={{ direction: 'rtl' }}>
          {CATEGORIES.map(cat => {
            const isActive = filter === cat.id;
            return (
              <button
                key={cat.id}
                id={`filter-btn-${cat.id}`}
                onClick={() => setFilter(cat.id)}
                className={`flex-none items-center gap-1.5 px-4.5 py-2.5 rounded-full cursor-pointer border-2 transition-all font-black text-xs ${
                  isActive
                    ? `${cat.color} scale-103 shadow-md ring-3 ring-amber-300/50`
                    : 'bg-white text-slate-600 border-slate-150 hover:bg-slate-50'
                }`}
              >
                <span>{cat.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Artworks grid */}
      <AnimatePresence mode="popLayout">
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredArtworks.map((art, index) => (
            <motion.div
              layout
              key={art.id}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 5 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.03, rotate: index % 2 === 0 ? 0.7 : -0.7 }}
              className="bg-white rounded-3xl overflow-hidden shadow-lg border-3 border-transparent hover:border-amber-300 cursor-pointer flex flex-col group relative"
              onClick={() => setSelectedArt(art)}
            >
              {/* Image box */}
              <div className="relative overflow-hidden">
                {getArtPlaceholder(art.imageUrl, art.title)}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <div className="bg-white text-slate-800 p-3 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                    <Eye size={20} className="text-amber-500" />
                  </div>
                </div>
                
                {/* Category badge */}
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-slate-800 px-3 py-1 rounded-full text-[10px] font-black shadow-sm flex items-center gap-1">
                  <Sparkles size={11} className="text-rose-500" />
                  <span>{art.category}</span>
                </div>
              </div>

              {/* Title & info representation */}
              <div className="p-5 flex-1 flex flex-col justify-between text-right">
                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-slate-800 text-lg group-hover:text-amber-600 transition-colors">
                    {art.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold line-clamp-2">
                    {art.description || 'یک نقاشی جادویی که با نظارت و مربی‌گری خانم هنر تکمیل شده است.'}
                  </p>
                </div>
                
                <div className="mt-5 pt-3.5 border-t border-slate-100 flex justify-between items-center text-xs">
                  {/* Student Full Name display as required */}
                  <div className="flex items-center gap-1 text-amber-700 font-extrabold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-250">
                    <Smile size={13} className="text-rose-500 animate-bounce" />
                    <span>هنرمند: {art.studentName || 'هنرجوی عزیز'} {art.studentAge ? `(${art.studentAge})` : ''}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 font-mono text-slate-400 font-bold text-[10px]">
                    <Calendar size={11} />
                    <span>{new Date(art.createdAt).toLocaleDateString('fa-IR')}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {filteredArtworks.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <span className="text-5xl">🎨</span>
          <h3 className="font-bold text-slate-700 text-lg mt-4">هنوز اثری در رشته "{filter}" در نمایشگاه بارگذاری نشده است.</h3>
          <p className="text-slate-400 text-sm mt-1">به زودی نقاشی‌های جذاب هنرجویان ما در این بخش قرار می‌گیرد.</p>
        </div>
      )}

      {/* Artwork detail full screen lightbox */}
      <AnimatePresence>
        {selectedArt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedArt(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white rounded-4xl max-w-2xl w-full overflow-hidden shadow-2xl relative border-4 border-amber-300"
              onClick={e => e.stopPropagation()}
            >
              {/* Big Image box */}
              <div className="relative bg-slate-100 flex items-center justify-center">
                {selectedArt.imageUrl.startsWith('placeholder') ? (
                  <div className="w-full h-80 flex items-center justify-center border-b-3 border-amber-200">
                    {getArtPlaceholder(selectedArt.imageUrl, selectedArt.title)}
                  </div>
                ) : (
                  <img
                    src={selectedArt.imageUrl}
                    alt={selectedArt.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-auto max-h-[450px] object-contain bg-slate-850 border-b-3 border-amber-250"
                  />
                )}
                
                <button
                  id="close-lightbox-btn"
                  onClick={() => setSelectedArt(null)}
                  className="absolute top-4 right-4 bg-rose-500 hover:bg-rose-600 text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-all"
                >
                  ✕
                </button>
              </div>

              {/* Text content details */}
              <div className="p-6 text-right">
                <div className="flex justify-between items-center flex-wrap gap-2 mb-3">
                  <h3 className="font-extrabold text-slate-900 text-2xl">{selectedArt.title}</h3>
                  <span className="bg-amber-100 text-amber-800 px-4 py-1.5 rounded-full text-xs font-black">
                    رشته: {selectedArt.category}
                  </span>
                </div>
                
                <p className="text-slate-650 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                  {selectedArt.description || 'یک اثر هنری به یادماندنی از کودکان آکادمی خلاق خانم هنر (اسراء چاوشی).'}
                </p>

                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
                  <span className="font-extrabold text-amber-600 bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200 flex items-center gap-1">
                    <Smile size={14} className="text-rose-500 animate-bounce" />
                    <span>هنرمند بااستعداد: {selectedArt.studentName || 'هنرجوی عزیز'} {selectedArt.studentAge ? `(${selectedArt.studentAge})` : ''}</span>
                  </span>
                  
                  <div className="flex items-center gap-1 font-mono text-slate-400 font-bold">
                    <Calendar size={12} />
                    <span>مربی راهنما: خانم هنر 🌸</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
