/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Palette, BookOpen, Brush, Smile, Phone, Mail, Award, 
  ChevronLeft, Sparkles, MessageSquare, ShieldCheck, Heart 
} from 'lucide-react';
import { Artwork, Course, Illustration } from './types';
import GallerySection from './components/GallerySection';
import IllustrationSection from './components/IllustrationSection';
import MagicCategories from './components/MagicCategories';
import CoursesSection from './components/CoursesSection';
import MagicCanvas from './components/MagicCanvas';
import ContactSection from './components/ContactSection';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [activeTab, setActiveTab] = useState<'gallery' | 'illustrations' | 'courses' | 'canvas' | 'biography' | 'contact' | 'admin'>('gallery');
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [illustrations, setIllustrations] = useState<Illustration[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [settings, setSettings] = useState<any>({
    artistName: 'خانم هنر (اسراء چاوشی)',
    artistTitle: 'تصویرگر و مربی هنر خلاق کودکان',
    siteTitle: 'دنیای جادویی خانم هنر (اسراء چاوشی)',
    biography: 'سلام به همه بچه‌های دنیای رنگارنگ! من خانم هنر (اسراء چاوشی) هستم، مربی هنری و نقاش عاشق دنیای شاد و تخیل زیبای شما کوچولوها. من سال‌هاست که در کنار کودکان با دست‌های قشنگشون نقاشی خلاق، آبرنگ، کار کلاژ و کاردستی آموزش می‌دم و بهشون کمک می‌کنم رویاهای خوشگلشون رو روی بوم زنده کنند. هنر زبان قلب بچه‌هاست و ما اینجا خلاقیتمون رو جشن می‌گیریم!',
    contactEmail: 'Sayyedmehranzare@gmail.com',
    contactPhone: '۰۹۱۲۳۴۵۶۷۸۹',
  });
  const [loading, setLoading] = useState(true);

  // Fetch initial public data
  const fetchPublicData = async () => {
    try {
      setLoading(true);
      const [artRes, courseRes, settingsRes, illRes] = await Promise.all([
        fetch('/api/artworks'),
        fetch('/api/courses'),
        fetch('/api/settings'),
        fetch('/api/illustrations')
      ]);

      if (artRes.ok) setArtworks(await artRes.json());
      if (courseRes.ok) setCourses(await courseRes.json());
      if (settingsRes.ok) setSettings(await settingsRes.json());
      if (illRes.ok) setIllustrations(await illRes.json());
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans" dir="rtl">
      
      {/* Top playful glowing sky banner */}
      <div className="bg-gradient-to-b from-sky-300 via-sky-200 to-amber-50/20 pt-6 pb-12 px-4 relative overflow-hidden text-center">
        {/* Floating background clouds */}
        <div className="absolute top-4 left-10 text-6xl opacity-30 select-none animate-pulse">☁️</div>
        <div className="absolute top-12 right-12 text-5xl opacity-45 select-none animate-bounce">☁️</div>
        <div className="absolute -bottom-8 left-1/4 text-7xl opacity-20 select-none">🎈</div>
        <div className="absolute top-1/3 left-12 text-4xl opacity-25 select-none cute-wiggle">🌈</div>
        <div className="absolute top-4 right-1/3 text-4xl opacity-30 select-none cute-wiggle">⭐</div>

        {/* Brand identity */}
        <div className="max-w-4xl mx-auto relative">
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-2.5 rounded-full shadow-md border-2 border-sky-300 text-sky-800 text-xs font-bold mb-6"
          >
            <Sparkles size={14} className="text-amber-500 animate-spin" />
            <span>آموزشگاه خلاقیت، نقاشی و صنایع دستی کودکان</span>
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight leading-tight">
            <span className="text-amber-500 underline decoration-wavy decoration-rose-400 decoration-3">{settings.siteTitle || `دنیای جادویی خانم هنر`}</span> 🎨
          </h1>
          
          <p className="text-sm font-bold text-slate-500 mt-4 max-w-xl mx-auto leading-relaxed">
            {settings.artistTitle || 'تصویرساز کودک و مربی کارگاه‌های پرورش قوه خلاقه و ساخت کارهای دستی'}
          </p>

          <div className="flex justify-center gap-4 mt-6">
            <div className="text-xs font-bold bg-rose-100 text-rose-700 px-4 py-2 rounded-full border border-rose-200 shadow-sm">
              بوم نقاشی تعاملی 🖌️
            </div>
            <div className="text-xs font-bold bg-amber-100 text-amber-700 px-4 py-2 rounded-full border border-amber-200 shadow-sm">
              رنگ‌های شاد و زنده 🌈
            </div>
            <div className="text-xs font-bold bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full border border-emerald-200 shadow-sm">
              ظرفیت محدود کلاس‌ها 🎒
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation bento bar for kids */}
      <div className="max-w-6xl mx-auto w-full px-4 -mt-6 z-10">
        <div className="bg-white p-3 rounded-3xl md:rounded-full shadow-xl border-3 border-amber-200/60 flex flex-wrap justify-center gap-2 md:gap-4">
          {[
            { id: 'gallery', label: '🎨 نگارخانه هنرجویان', color: 'bg-rose-500 text-white hover:bg-rose-600' },
            { id: 'illustrations', label: '🌸 نقاشی‌های خانم هنر', color: 'bg-violet-500 text-white hover:bg-violet-600' },
            { id: 'courses', label: '🎒 کلاس‌ها و ثبت‌نام', color: 'bg-emerald-500 text-white hover:bg-emerald-600' },
            { id: 'canvas', label: '✨ نقاشی جادویی من', color: 'bg-indigo-500 text-white hover:bg-indigo-600' },
            { id: 'biography', label: '👩‍🎨 درباره خانم هنر', color: 'bg-amber-500 text-white hover:bg-amber-600' },
            { id: 'contact', label: '📮 فرستادن نامه', color: 'bg-orange-500 text-white hover:bg-orange-600' },
            { id: 'admin', label: '🔐 پنل مدیریت مربی', color: 'bg-slate-800 text-white hover:bg-slate-900' },
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-btn-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-3 rounded-full font-bold text-xs md:text-sm cursor-pointer transition-all shadow-sm active:scale-95 flex items-center gap-1 hover:shadow-md ${
                  isActive 
                    ? `${tab.color} scale-103 ring-4 ring-amber-300` 
                    : 'bg-slate-50 text-slate-650 hover:bg-slate-100'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary content area */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 relative">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-24 space-y-3"
            >
              <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="font-bold text-slate-500 text-sm">در حال بارگذاری دنیای فانتزی...</p>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              {/* TAB 1: Art Gallery */}
              {activeTab === 'gallery' && (
                <div className="space-y-12">
                  <div className="text-center max-w-xl mx-auto mb-6">
                    <span className="text-4xl animate-pulse">🦄</span>
                    <h2 className="font-black text-slate-800 text-2xl mt-1">نگارخانه بزرگ هنرجویان خلاق</h2>
                    <p className="text-slate-400 text-xs mt-1">نمایشگاه جذاب و رنگارنگ هنرنمایی کودکان مستعد به همراه نام و سن شادشان</p>
                  </div>
                  
                  {/* Interactive 11 Disciplines of the Academy */}
                  <MagicCategories />

                  <div className="border-t-3 border-dashed border-slate-100 my-8 pt-4">
                    <h3 className="font-black text-xl text-slate-800 text-right mb-1">🖼️ آلبوم گالری کارهای هنرجویان خلاق</h3>
                    <p className="text-xs text-slate-400 text-right leading-relaxed mb-4">می‌توانید کارهای دستی، طراحی‌های لباس، نقاشی‌ها و کلاژهای کشیده شده توسط شاگردهای بااستعداد خانم هنر (اسراء چاوشی) را بر اساس رشته‌های مختلف فیلتر و تماشا نمایید.</p>
                    <GallerySection artworks={artworks} />
                  </div>
                </div>
              )}

              {/* TAB 1.5: Illustrations Gallery */}
              {activeTab === 'illustrations' && (
                <div>
                  <IllustrationSection illustrations={illustrations} />
                </div>
              )}

              {/* TAB 2: Courses */}
              {activeTab === 'courses' && (
                <div>
                  <div className="text-center max-w-xl mx-auto mb-6">
                    <span className="text-4xl">🎡</span>
                    <h2 className="font-black text-slate-800 text-2xl mt-1">دوره‌ها و کارگاه‌های آموزشی خلاقانه</h2>
                    <p className="text-slate-400 text-xs mt-1">فرصتی بی‌نظیر برای ابراز احساسات، تخیل، ساخت رویاها و بازی با رنگ‌ها</p>
                  </div>
                  <CoursesSection 
                    courses={courses} 
                    onRegisterSuccess={fetchPublicData} 
                    settings={settings}
                  />
                </div>
              )}

              {/* TAB 3: Interactive drawing workspace */}
              {activeTab === 'canvas' && (
                <div className="max-w-4xl mx-auto">
                  <div className="text-center max-w-xl mx-auto mb-6">
                    <span className="text-4xl">🪄</span>
                    <h2 className="font-black text-slate-800 text-2xl mt-1">دفتر نقاشی جادویی من</h2>
                    <p className="text-slate-400 text-xs mt-1">بچه‌ها! قلم‌مو خودتون رو انتخاب کنید و نقاشی‌ها و کارهاتون رو جادویی کنید.</p>
                  </div>
                  <MagicCanvas />
                </div>
              )}

              {/* TAB 4: Biography of mahsa */}
              {activeTab === 'biography' && (
                <div className="max-w-4xl mx-auto bg-white p-8 rounded-4xl border-3 border-amber-250 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-amber-100 p-8 rounded-bl-4xl blur-sm opacity-50"></div>
                  
                  <div className="flex flex-col md:flex-row-reverse gap-8 items-center relative">
                    {/* Portrait drawing illustration or flower */}
                    <div className="w-48 h-48 rounded-full bg-amber-150 border-4 border-amber-300 overflow-hidden flex items-center justify-center shadow-lg relative">
                      <span className="text-8xl">👩‍🎨</span>
                      <div className="absolute bottom-2 bg-amber-500 text-white font-bold text-[10px] px-3 py-1 rounded-full shadow-sm">
                        مربی باسابقه هنر کودک
                      </div>
                    </div>

                    <div className="flex-1 text-right space-y-4">
                      <div className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-600 font-bold px-4 py-1.5 rounded-full text-xs">
                        <Award size={14} />
                        <span>من مربی رویاها هستم! ✨</span>
                      </div>
                      
                      <h3 className="font-black text-slate-800 text-3xl">درباره {settings.artistName}</h3>
                      <h4 className="font-bold text-slate-650 text-sm leading-relaxed text-amber-600">{settings.artistTitle}</h4>
                      
                      <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line text-justify">
                        {settings.biography}
                      </p>

                      <hr className="border-slate-100" />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-slate-600 pt-2">
                        <div className="flex items-center gap-2 justify-end">
                          <span>{settings.contactPhone}</span>
                          <span className="bg-sky-100 text-sky-700 p-2 rounded-xl">📞</span>
                        </div>
                        <div className="flex items-center gap-2 justify-end">
                          <span>{settings.contactEmail}</span>
                          <span className="bg-rose-100 text-rose-700 p-2 rounded-xl">📩</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: Contact messages */}
              {activeTab === 'contact' && (
                <ContactSection />
              )}

              {/* TAB 6: Secure admin panel */}
              {activeTab === 'admin' && (
                <AdminPanel 
                  onDataChange={fetchPublicData} 
                  publicArtworks={artworks}
                  publicCourses={courses}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer support */}
      <footer className="bg-slate-900 text-slate-400 py-6 text-center border-t border-slate-800 text-xs relative max-w-full">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-1.5 font-bold">
            <Heart size={12} className="text-rose-500 fill-rose-500" />
            <span>طراحی شده برای شکوفایی خلاقیت پاک کودکان سرزمینمان</span>
          </div>
          <div>
            <span>© ۲۰۲۶ - تمامی حقوق و گالری آثار محفوظ برای {settings.artistName} می باشد.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
