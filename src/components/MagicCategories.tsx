/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, HelpCircle } from 'lucide-react';

export interface CategoryItem {
  id: string;
  title: string;
  emoji: string;
  description: string;
  tip: string;
  color: string;
}

export const ACADEMY_CATEGORIES: CategoryItem[] = [
  {
    id: 'آبرنگ و گواش',
    title: 'آبرنگ و گواش',
    emoji: '🎨',
    description: 'پرواز رنگ‌ها در دریای شفاف آب! بازی تماشایی قلم‌مو با قطرات رنگ روی بوم نقاشی.',
    tip: 'ادغام زیبای رنگ‌های سرد و گرم جالب‌ترین کهکشان‌ها را روی کاغذ پدید می‌آورد.',
    color: 'from-sky-400 to-indigo-500 text-white bg-indigo-50 border-indigo-200'
  },
  {
    id: 'کلاژ و کاردستی',
    title: 'کلاژ و کاردستی',
    emoji: '✂️',
    description: 'بریدن، چسباندن و جان بخشیدن به رویاها با استفاده از کاغذهای بافت‌دار، پارچه دکمه و نخ.',
    tip: 'تندیس‌ها و کلاژهای سه‌بعدی را با خرده‌ریزه‌های هیجان‌انگیز بازیافتی زیباتر بسازید.',
    color: 'from-emerald-400 to-teal-650 text-white bg-emerald-50 border-emerald-250'
  },
  {
    id: 'مداد رنگی',
    title: 'مداد رنگی',
    emoji: '✏️',
    description: 'خلق سایه روشن‌های بسیار ظریف و عمیق، کشیدن جزئیات دقیق و زنده کردن طرح‌های کارتونی.',
    tip: 'با کم و زیاد کردن فشار دست روی مغز نرم مدادها، حجم و نور در نقاشی شکل می‌گیرند.',
    color: 'from-amber-400 to-orange-500 text-white bg-amber-50 border-amber-250'
  },
  {
    id: 'خمیر هواخشک',
    title: 'خمیر هواخشک',
    emoji: '🧸',
    description: 'ساخت عروسک‌های سه‌بعدی نرم و رنگارنگ که بدون نیاز به کوره، در دمای اتاق خشک و محکم می‌شوند.',
    tip: 'ابتدا قطعات را بسازید و کمی مرطوب کنید تا قطعات عروسک مثل چسبِ نامرئی به هم متصل شوند.',
    color: 'from-pink-400 to-rose-500 text-white bg-pink-50 border-pink-200'
  },
  {
    id: 'حجم سازی با گِل',
    title: 'حجم‌سازی با گل',
    emoji: '🏺',
    description: 'ورز دادن و لمس کردن بافت زنده خاک رس گرم و شکل دادن به کوزه‌ها و تندیس‌های تاریخی کودکانه.',
    tip: 'گل رس بوی دلنشین طراوت زمین باران‌خورده را به نوک دوان سرانگشتان شما هدیه می‌دهد.',
    color: 'from-yellow-600 to-amber-800 text-white bg-amber-100/40 border-amber-300'
  },
  {
    id: 'مهرسازی',
    title: 'مهرسازی',
    emoji: '🔲',
    description: 'طراحی نقش‌های مینیاتوری روی اسفنج، لاستیک یا سیب‌زمینی و ایجاد پس‌زمینه‌ها و بافت‌های تکراری.',
    tip: 'با مهرهای دست‌ساز اختصاصی خود، می‌توانید کاغذ کادو و آلبوم رویایی برای دوستان بسازید.',
    color: 'from-cyan-400 to-sky-600 text-white bg-cyan-50 border-cyan-200'
  },
  {
    id: 'طراحی لباس',
    title: 'طراحی لباس',
    emoji: '👗',
    description: 'ترسیم و ایده پردازی طرح‌های خلاقانه لباس برای شاهزاده‌ها، ابرقهرمانان باستانی و فضانوردان.',
    tip: 'نوع و طیف رنگ لباس قهرمان داستان خود را بر اساس خلق‌وخو و ویژگی‌های رفتاری او انتخاب کنید!',
    color: 'from-rose-450 to-pink-600 text-white bg-rose-50 border-rose-250'
  },
  {
    id: 'طراحی و ساخت جلد کتاب و داستان نویسی',
    title: 'طراحی جلد و داستان‌نویسی',
    emoji: '📖',
    description: 'قدم گذاشتن در نقش نویسنده و تصویرگر حرفه‌ای! ایده پردازی سناریوهای شیرین و طراحی جلد جذاب.',
    tip: 'یک داستان افسانه‌ای بزرگ همیشه با جرقه سوال کوتاه: "اگر یک روز..." در ذهن آغاز می‌شود.',
    color: 'from-purple-400 to-indigo-650 text-white bg-purple-50 border-purple-200'
  },
  {
    id: 'طراحی کارت پستال',
    title: 'طراحی کارت پستال',
    emoji: '✉️',
    description: 'خلق کارت و پاکت‌های هدیه تاشو، سه بعدی و دارای قفل‌های کاغذی جالب برای هم سن و سالان.',
    tip: 'استفاده از برگ‌های رنگی خشک پاییزی جلوه ۳بعدی ارگانیک فوق‌العاده‌ای به کارت می‌دهد.',
    color: 'from-teal-400 to-emerald-600 text-white bg-teal-50 border-teal-200'
  },
  {
    id: 'طراحی تمبر',
    title: 'طراحی تمبر',
    emoji: '🖼️',
    description: 'نقاشی در قاب‌های خیلی ریز با اطراف دندانه‌دار فانتزی که مینیاتوری از داستان‌های کشور هستند.',
    tip: 'اندازه فیزیکی کوچک تمبر یاد می‌دهد که چگونه بدون کشیدن موارد اضافی، اصل مطلب را نقاشی کنیم.',
    color: 'from-orange-400 to-red-500 text-white bg-orange-50 border-orange-200'
  },
  {
    id: 'نمایش خلاق',
    title: 'نمایش خلاق',
    emoji: '🎭',
    description: 'مکتب جان‌بخشی به اشیاء، بازی‌های کلامی تئاتر، ماسک‌گذاری و پرورش اعتماد به‌نفس کودکان.',
    tip: 'تغییر تن صدای خود به شخصیت باد، سنگ یا شیر بازیگوش راهی جادویی برای ابراز عواطف پنهان است.',
    color: 'from-violet-400 to-fuchsia-600 text-white bg-violet-50 border-violet-200'
  }
];

export default function MagicCategories() {
  const [selectedTip, setSelectedTip] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const displayTip = (tip: string, index: number) => {
    setSelectedTip(tip);
    setActiveIndex(index);
  };

  return (
    <div className="bg-gradient-to-r from-amber-50/50 via-rose-50/20 to-sky-50/50 rounded-4xl p-6 border-3 border-dashed border-amber-300 py-8 relative">
      <div className="text-center mb-8">
        <span className="text-4xl animate-bounce">🦄</span>
        <h3 className="font-black text-2xl text-slate-800 mt-2">رشته‌ها و کارگاه‌های تخصصی هنر خلاق</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-lg mx-auto leading-relaxed">
          خانم هنر (اسراء چاوشی) بچه‌ها را در ۱۱ حوزه هنری جادویی راهنمایی می‌کنه تا ذهن خلاقشون پروبال بگیره. برای دیدن فوت‌وفن جادویی هر رشته، روی کارت‌ها ضربه بزنید!
        </p>
      </div>

      {/* Grid representation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {ACADEMY_CATEGORIES.map((item, index) => {
          const isSelected = activeIndex === index;
          return (
            <motion.div
              layout
              key={item.id}
              whileHover={{ scale: 1.04, rotate: index % 2 === 0 ? 0.5 : -0.5 }}
              onClick={() => displayTip(item.tip, index)}
              className={`p-4 rounded-3xl cursor-pointer transition-all border-2 text-right relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-slate-900 text-white shadow-xl scale-103'
                  : 'bg-white hover:bg-slate-50 border-slate-100 shadow-md hover:shadow-lg'
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-3xl">{item.emoji}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isSelected ? 'bg-amber-400 text-slate-900' : 'bg-slate-150 text-slate-600'}`}>
                    {isSelected ? 'فوت جادو ✔️' : 'آموزش'}
                  </span>
                </div>
                <h4 className={`font-black text-sm ${isSelected ? 'text-amber-300' : 'text-slate-800'}`}>
                  {item.title}
                </h4>
                <p className={`text-[11px] mt-1.5 leading-relaxed leading-medium ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  {item.description}
                </p>
              </div>

              <div className="mt-4 pt-2.5 border-t border-dashed border-slate-100 flex items-center gap-1 text-[10px] text-amber-500 font-extrabold justify-end">
                <span>راز جادویی رشته</span>
                <Sparkles size={11} className="animate-pulse" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Display dynamic popup for the card tips */}
      {selectedTip && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-slate-900 text-white p-5 rounded-3xl border-3 border-amber-300 shadow-2xl flex items-start gap-4"
        >
          <div className="bg-amber-400 text-slate-900 p-2.5 rounded-full shrink-0">
            <Sparkles size={20} className="animate-spin" />
          </div>
          <div className="text-right space-y-1">
            <h5 className="font-extrabold text-amber-300 text-sm">راز جادویی {ACADEMY_CATEGORIES[activeIndex!].title} {ACADEMY_CATEGORIES[activeIndex!].emoji}</h5>
            <p className="text-slate-200 text-xs leading-relaxed leading-medium">{selectedTip}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
