/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Illustration } from '../types';
import { Award, Eye, Heart, Sparkles, Image as ImageIcon } from 'lucide-react';

interface IllustrationSectionProps {
  illustrations: Illustration[];
}

export default function IllustrationSection({ illustrations }: IllustrationSectionProps) {
  const [selectedIll, setSelectedIll] = useState<Illustration | null>(null);

  // Fallback beautiful presets for Esra's professional illustrations
  const getIllustrationPlaceholder = (imageUrl: string, title: string) => {
    if (imageUrl === 'placeholder-fly') {
      return (
        <div className="w-full h-64 bg-violet-100 flex flex-col items-center justify-center relative p-6 border-b-4 border-violet-300 text-center">
          <span className="text-7xl animate-pulse mb-3">🐦</span>
          <span className="font-extrabold text-violet-900 text-xl">پرواز بر فراز گل‌ها</span>
          <span className="text-violet-650 text-xs mt-2 font-bold bg-white/70 px-3 py-1 rounded-full">تصویرگری کتاب داستان شب</span>
        </div>
      );
    }
    if (imageUrl === 'placeholder-fox') {
      return (
        <div className="w-full h-64 bg-rose-50 flex flex-col items-center justify-center relative p-6 border-b-4 border-rose-300 text-center">
          <span className="text-7xl animate-bounce mb-3">🦊</span>
          <span className="font-extrabold text-rose-950 text-xl">دوستی روباه و ماه</span>
          <span className="text-rose-650 text-xs mt-2 font-bold bg-white/70 px-3 py-1 rounded-full">طرح منتخب جشنواره بین‌المللی</span>
        </div>
      );
    }

    // Direct base64 source image
    if (imageUrl && imageUrl.startsWith('data:image')) {
      return (
        <img
          src={imageUrl}
          alt={title}
          referrerPolicy="no-referrer"
          className="w-full h-64 object-cover border-b-4 border-slate-100"
        />
      );
    }

    // Default general template for Esra's arts
    return (
      <div className="w-full h-64 bg-gradient-to-tr from-amber-100 to-rose-100 flex flex-col items-center justify-center relative p-6 border-b-4 border-amber-300 text-center">
        <span className="text-7xl mb-3">✨</span>
        <span className="font-black text-rose-900 text-xl">{title}</span>
        <span className="text-rose-600 text-xs mt-2 font-bold bg-white/70 px-3 py-1 rounded-full">اثر تصویرگری خانم هنر</span>
      </div>
    );
  };

  return (
    <div className="py-6">
      {/* Introduction Banner header */}
      <div className="bg-gradient-to-r from-violet-500 to-fuchsia-600 rounded-4xl p-8 text-white mb-10 shadow-lg text-right relative overflow-hidden">
        <div className="absolute top-4 left-6 text-7xl opacity-15 select-none spinning-slow">🌸</div>
        <div className="absolute -bottom-6 right-1/4 text-8xl opacity-10 select-none">🖌️</div>
        
        <div className="max-w-2xl relative">
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-xs font-bold mb-4">
            <Award size={14} className="text-yellow-300" />
            <span>گالری آثار شخصی خانم هنر (اسراء چاوشی)</span>
          </div>
          <h3 className="font-black text-2xl md:text-3xl tracking-tight leading-tight">
            تصویرسازی‌ها و قاب‌های خیال‌ورزی مربی
          </h3>
          <p className="text-xs md:text-sm text-slate-100 mt-2 leading-relaxed leading-medium">
            در این بخش می‌توانید منتخبی از کارهای تصویرسازی کتاب کودک، طراحی تمبرها، کارت پستال‌ها و هنر آبرنگی خانم هنر را ببینید. هنر نقاشی راهی برای لمس جادوی خداست!
          </p>
        </div>
      </div>

      {illustrations.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <span className="text-5xl">🌸</span>
          <h3 className="font-bold text-slate-700 text-lg mt-4">هنوز اثری در نگارخانه تصویرسازی‌های خانم هنر ثبت نشده است.</h3>
          <p className="text-slate-400 text-sm mt-1">به زودی آثار زیبا و حرفه‌ای مربی در این بخش بارگذاری می‌شود.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {illustrations.map((ill, index) => (
            <motion.div
              layout
              key={ill.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.03, y: -4 }}
              onClick={() => setSelectedIll(ill)}
              className="bg-white rounded-3xl overflow-hidden shadow-lg border-3 border-transparent hover:border-violet-300 cursor-pointer flex flex-col group relative"
            >
              <div className="relative overflow-hidden bg-slate-50 text-center">
                {getIllustrationPlaceholder(ill.imageUrl, ill.title)}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-white text-slate-800 p-3 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                    <Eye size={20} className="text-violet-650" />
                  </div>
                </div>
                
                {/* Premium category tag */}
                <span className="absolute top-3 right-3 bg-violet-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                  <Sparkles size={10} className="animate-pulse" />
                  <span>تصویرگری اصلی</span>
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between text-right">
                <div className="space-y-2">
                  <h4 className="font-extrabold text-slate-800 text-lg group-hover:text-violet-600 transition-colors">
                    {ill.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-3">
                    {ill.description || 'توضیحات کوتاهی برای این اثر زیبا پیوست نشده است.'}
                  </p>
                </div>
                
                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-bold">
                  <span>اثری از اسراء چاوشی ✨</span>
                  <span>{new Date(ill.createdAt).toLocaleDateString('fa-IR')}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Lightbox popout for her professional work */}
      <AnimatePresence>
        {selectedIll && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedIll(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white rounded-4xl max-w-2xl w-full overflow-hidden shadow-2xl relative border-4 border-violet-400"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative bg-slate-900 flex items-center justify-center">
                {selectedIll.imageUrl.startsWith('placeholder') ? (
                  <div className="w-full h-80 flex items-center justify-center">
                    {getIllustrationPlaceholder(selectedIll.imageUrl, selectedIll.title)}
                  </div>
                ) : (
                  <img
                    src={selectedIll.imageUrl}
                    alt={selectedIll.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-auto max-h-[480px] object-contain bg-slate-805"
                  />
                )}
                
                <button
                  id="close-lightbox-ill-btn"
                  onClick={() => setSelectedIll(null)}
                  className="absolute top-4 right-4 bg-rose-500 hover:bg-rose-600 text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-all"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 text-right">
                <div className="flex justify-between items-center flex-wrap gap-2 mb-3">
                  <h4 className="font-extrabold text-slate-900 text-2xl">{selectedIll.title}</h4>
                  <span className="bg-violet-100 text-violet-800 px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-1">
                    <Heart size={12} className="text-rose-500 fill-rose-500 animate-pulse" />
                    <span>خلق شده توسط خانم هنر</span>
                  </span>
                </div>
                
                <p className="text-slate-650 text-xs md:text-sm leading-relaxed whitespace-pre-wrap font-medium">
                  {selectedIll.description || 'تخیل زیبای خانم هنر که روی بوم یا کاغذ دیجیتال زنده شده است.'}
                </p>

                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-400">
                  <span className="font-black text-violet-600">✍️ حق امتیاز و چاپ اثر محفوظ است.</span>
                  <span>تاریخ ثبت: {new Date(selectedIll.createdAt).toLocaleDateString('fa-IR')}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
