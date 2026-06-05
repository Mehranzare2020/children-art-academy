/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, KeyRound, BarChart3, Image, BookOpen, Users, Palette,
  MessageSquare, Settings, LogOut, Plus, Trash2, Edit3, CheckCircle, 
  XSquare, Download, Upload, Eye, FileUp, Paperclip, Coins, AlertTriangle 
} from 'lucide-react';
import { Artwork, Course, Registration, Message, AdminStats, AdminSettings, Illustration } from '../types';

interface AdminPanelProps {
  onDataChange: () => void;
  publicArtworks: Artwork[];
  publicCourses: Course[];
}

export default function AdminPanel({ onDataChange, publicArtworks, publicCourses }: AdminPanelProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState('');
  
  // Login form states
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Active admin tab state
  const [activeTab, setActiveTab] = useState<'stats' | 'artworks' | 'courses' | 'registrations' | 'messages' | 'security'>('stats');

  // Stats states
  const [stats, setStats] = useState<AdminStats | null>(null);

  // Settings states
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  
  // Data list states
  const [artworksList, setArtworksList] = useState<Artwork[]>([]);
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [illustrationsList, setIllustrationsList] = useState<Illustration[]>([]);
  const [registrationsList, setRegistrationsList] = useState<Registration[]>([]);
  const [messagesList, setMessagesList] = useState<Message[]>([]);

  // Modals / Form entries
  const [artForm, setArtForm] = useState<{ id?: number; title: string; description: string; category: string; imageUrl: string; studentName: string; studentAge: string }>({
    title: '', description: '', category: 'آبرنگ و گواش', imageUrl: '', studentName: '', studentAge: ''
  });
  const [illustrationForm, setIllustrationForm] = useState<{ id?: number; title: string; description: string; imageUrl: string }>({
    title: '', description: '', imageUrl: ''
  });
  const [courseForm, setCourseForm] = useState<{ id?: number; title: string; description: string; ageGroup: string; price: number; startDate: string; maxStudents: number; imageUrl: string; active: number }>({
    title: '', description: '', ageGroup: '۴ تا ۷ سال', price: 0, startDate: '', maxStudents: 10, imageUrl: 'course-creative', active: 1
  });
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [previewReceiptImage, setPreviewReceiptImage] = useState<string | null>(null);
  const [selectedMsg, setSelectedMsg] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyFile, setReplyFile] = useState<string | null>(null);
  const [replyFileName, setReplyFileName] = useState<string | null>(null);

  // Backup file state
  const [backupFileContent, setBackupFileContent] = useState<any>(null);

  // Load auth state from storage on init
  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    if (savedToken === 'session_token_child_art_academy') {
      setIsLoggedIn(true);
      setToken(savedToken);
      fetchAdminData(savedToken);
    }
  }, [publicArtworks, publicCourses]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setLoginError('کلمه عبور را وارد کنید.');
      return;
    }

    try {
      setLoginLoading(true);
      setLoginError('');
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'کلمه عبور نادرست است');
      }

      if (data.success && data.token) {
        localStorage.setItem('admin_token', data.token);
        setToken(data.token);
        setIsLoggedIn(true);
        setPassword('');
        fetchAdminData(data.token);
      }
    } catch (err: any) {
      setLoginError(err.message || 'مشکلی در اتصال به پایگاه داده رخ داده است.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsLoggedIn(false);
    setToken('');
  };

  // Fetch all secure stats and entity lists
  const fetchAdminData = async (authToken = token) => {
    try {
      const headers = { 'Authorization': `Bearer ${authToken}` };

      // Stats
      const sRes = await fetch('/api/admin/stats', { headers });
      if (sRes.ok) setStats(await sRes.json());

      // Settings
      const setRes = await fetch('/api/settings');
      if (setRes.ok) setSettings(await setRes.json());

      // Artworks
      const artRes = await fetch('/api/artworks');
      if (artRes.ok) setArtworksList(await artRes.json());

      // Illustrations
      const illRes = await fetch('/api/illustrations');
      if (illRes.ok) setIllustrationsList(await illRes.json());

      // Courses
      const cRes = await fetch('/api/courses');
      if (cRes.ok) setCoursesList(await cRes.json());

      // Registrations
      const rRes = await fetch('/api/admin/registrations', { headers });
      if (rRes.ok) setRegistrationsList(await rRes.json());

      // Messages
      const mRes = await fetch('/api/admin/messages', { headers });
      if (mRes.ok) setMessagesList(await mRes.json());

    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  // --- Image to Base64 utility ---
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'art' | 'course' | 'illustration') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (target === 'art') {
        setArtForm(prev => ({ ...prev, imageUrl: base64 }));
      } else if (target === 'course') {
        setCourseForm(prev => ({ ...prev, imageUrl: base64 }));
      } else if (target === 'illustration') {
        setIllustrationForm(prev => ({ ...prev, imageUrl: base64 }));
      }
    };
    reader.readAsDataURL(file);
  };

  // --- Attachments upload to Base64 utility ---
  const handleAttachmentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReplyFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setReplyFile(reader.result as string);
    };
    reader.readAsDataURL(file);
  };


  // --- Artworks Actions ---
  const handleArtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !!artForm.id;
    const url = isEdit ? `/api/admin/artworks/${artForm.id}` : '/api/admin/artworks';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(artForm),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'خطا در ثبت اثر');
      }

      setArtForm({ title: '', description: '', category: 'آبرنگ و گواش', imageUrl: '', studentName: '', studentAge: '' });
      fetchAdminData();
      onDataChange();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleArtDelete = async (id: number) => {
    if (!confirm('آیا مطمئن هستید که می‌خواهید این اثر هنری شاد را حذف کنید؟')) return;
    try {
      const res = await fetch(`/api/admin/artworks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('خطا در حذف اثر');
      fetchAdminData();
      onDataChange();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // --- Courses Actions ---
  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !!courseForm.id;
    const url = isEdit ? `/api/admin/courses/${courseForm.id}` : '/api/admin/courses';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(courseForm),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'خطا در ثبت تغییرات کلاس');
      }

      setCourseForm({ title: '', description: '', ageGroup: '۴ تا ۷ سال', price: 0, startDate: '', maxStudents: 10, imageUrl: 'course-creative', active: 1 });
      fetchAdminData();
      onDataChange();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCourseDelete = async (id: number) => {
    if (!confirm('با حذف این کلاس تمامی ثبت‌نام‌های مربوط به آن حذف خواهد شد. ادامه می‌دهید؟')) return;
    try {
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('خطا در حذف کلاس');
      fetchAdminData();
      onDataChange();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // --- Registration Management ---
  const handleRegStatusUpdate = async (regId: number, status: 'confirmed' | 'pending' | 'canceled', currentPaid: number) => {
    const amountPaid = status === 'confirmed' && currentPaid === 0
      ? registrationsList.find(r => r.id === regId)?.coursePrice || 0
      : currentPaid;

    try {
      const res = await fetch(`/api/admin/registrations/${regId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, amountPaid }),
      });

      if (!res.ok) throw new Error('بروزرسانی ثبت‌نام ناموفق بود');
      fetchAdminData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // --- Message Reply ---
  const handleMessageReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMsg) return;

    try {
      const res = await fetch(`/api/admin/messages/${selectedMsg.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reply: replyText,
          replyAttachment: replyFile,
          replyAttachmentName: replyFileName,
        }),
      });

      if (!res.ok) throw new Error('ثبت پاسخ ناموفق بود.');
      
      setSelectedMsg(null);
      setReplyText('');
      setReplyFile(null);
      setReplyFileName(null);
      fetchAdminData();
    } catch (err: any) {
      alert(err.message);
    }
  };


  // --- Biography / Settings Update ---
  const handleSettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error('ذخیره‌سازی تنظیمات ناموفق بود');
      fetchAdminData();
      alert('بیوگرافی و اطلاعات ادمین با موفقیت ذخیره شد.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // --- Illustrations Actions ---
  const handleIllustrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !!illustrationForm.id;
    const url = isEdit ? `/api/admin/illustrations/${illustrationForm.id}` : '/api/admin/illustrations';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(illustrationForm),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'خطا در ثبت تصویرسازی مربی');
      }

      setIllustrationForm({ title: '', description: '', imageUrl: '' });
      fetchAdminData();
      onDataChange();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleIllustrationDelete = async (id: number) => {
    if (!confirm('آیا مطمئن هستید که می‌خواهید این اثر تصویرسازی مربی را حذف کنید؟')) return;
    try {
      const res = await fetch(`/api/admin/illustrations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('خطا در حذف تصویرسازی مربی');
      fetchAdminData();
      onDataChange();
    } catch (err: any) {
      alert(err.message);
    }
  };



  // --- SQLite Backup & Restore Actions ---
  const downloadDatabaseBackup = () => {
    window.open(`/api/admin/database/backup?authorization=Bearer ${token}`);
    // Wait, let's trigger it through fetch authorization, so it doesn't fail due to browser authorization limits!
    fetch('/api/admin/database/backup', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-children-art-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    })
    .catch(err => alert('خطا در دانلود فایل پشتیبان دیتابیس'));
  };

  const handleBackupFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        setBackupFileContent(parsed);
      } catch (err) {
        alert('فایل وارد شده ساختار JSON معتبر دیتابیس ندارد.');
        setBackupFileContent(null);
      }
    };
    reader.readAsText(file);
  };

  const restoreDatabaseBackup = async () => {
    if (!backupFileContent) return;
    if (!confirm('توجه: بازنشانی بک‌آپ تمام اطلاعات فعلی دیتابیس شامل نقاشی‌ها، دوره‌ها، پیام‌ها و تراکنش‌ها را پاک کرده و با داده‌های فایل جایگزین می‌کند. آیا مطمئن هستید؟')) return;

    try {
      const res = await fetch('/api/admin/database/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ backupData: backupFileContent }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert(data.message || 'پایگاه داده با موفقیت بازنشانی شد!');
      setBackupFileContent(null);
      fetchAdminData();
      onDataChange();
    } catch (err: any) {
      alert(err.message);
    }
  };


  // Render Login Page if token is invalid or missing
  if (!isLoggedIn) {
    return (
      <div className="py-12 max-w-md mx-auto">
        <div className="bg-white rounded-4xl border-3 border-indigo-200 p-8 shadow-xl text-right space-y-6">
          <div className="text-center">
            <span className="text-5xl animate-pulse">🔐</span>
            <h3 className="font-black text-slate-800 text-xl mt-3">ورود به ادمین گالری ادمین</h3>
            <p className="text-xs text-indigo-500 font-bold mt-1">ویژه مدیریت هنر و کارگاه‌های خلاقیت مربیان</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs rounded-xl font-bold">
                {loginError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-750 mb-1 flex items-center gap-1 justify-end">
                <span>رمز عبور مدیریت</span>
                <KeyRound size={13} className="text-indigo-500" />
              </label>
              <input
                id="admin-pass-input"
                type="password"
                required
                placeholder="کلمه عبور ادمین را وارد کنید..."
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full p-3 bg-slate-50 border-2 border-slate-100 focus:border-indigo-300 rounded-2xl text-center focus:outline-none text-sm font-mono"
              />
              <span className="text-[10px] text-slate-400 block mt-1">نکته: رمز پیش‌فرض admin123 است. پس از ورود آن را تغییر دهید.</span>
            </div>

            <button
              id="admin-login-submit"
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-black rounded-2xl shadow-md transition active:scale-95 text-center cursor-pointer text-sm"
            >
              {loginLoading ? 'احراز هویت...' : 'تایید و ورود 🔑'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      {/* Upper header */}
      <div className="bg-slate-900 text-white p-4 rounded-3xl mb-8 flex justify-between items-center flex-wrap gap-4 text-right">
        <button
          id="admin-logout-btn"
          onClick={handleLogout}
          className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-xs flex items-center gap-1 cursor-pointer font-bold transition-all active:scale-95"
        >
          <LogOut size={14} />
          <span>خروج از پنل</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <h4 className="font-bold text-sm text-yellow-300">پنل مدیریت خانم هنر 🎨</h4>
            <span className="text-[10px] text-slate-400">امروز خوشحال‌تر از دیروز، اثر هنری خلق کنید!</span>
          </div>
          <span className="text-2xl bg-slate-800 p-2 rounded-2xl">👩‍🎨</span>
        </div>
      </div>

      {/* Grid tabs layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-right">
        
        {/* Right side menu */}
        <div className="lg:col-span-3 space-y-2">
          {[
            { id: 'stats', label: 'آمار و درآمدها', icon: BarChart3, color: 'hover:bg-cyan-50 hover:text-cyan-600 text-cyan-600' },
            { id: 'artworks', label: 'نمونه کارهای هنری هنرجویان', icon: Image, color: 'hover:bg-rose-50 hover:text-rose-600 text-rose-600' },
            { id: 'illustrations', label: 'آثار تصویرسازی خانم هنر', icon: Palette, color: 'hover:bg-purple-50 hover:text-purple-600 text-purple-600' },
            { id: 'courses', label: 'مدیریت کارگاه‌ها', icon: BookOpen, color: 'hover:bg-emerald-50 hover:text-emerald-300 text-emerald-600' },
            { id: 'registrations', label: 'ثبت‌نامی‌های دوره‌ها', icon: Users, color: 'hover:bg-yellow-50 hover:text-yellow-600 text-yellow-600' },
            { id: 'messages', label: 'پیام‌های والدین', icon: MessageSquare, color: 'hover:bg-orange-50 hover:text-orange-600 text-orange-600' },
            { id: 'security', label: 'امنیت و تنظیمات اصلی', icon: Settings, color: 'hover:bg-indigo-50 hover:text-indigo-600 text-indigo-600' },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`admin-tab-btn-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full p-3.5 rounded-2xl font-bold text-xs flex items-center justify-between gap-2 border-2 transition-all cursor-pointer ${
                  active 
                    ? 'bg-slate-900 border-slate-950 text-white shadow-md scale-102'
                    : 'bg-white border-slate-100 text-slate-600 hover:scale-101'
                }`}
              >
                <div className="bg-slate-100/10 p-1.5 rounded-lg">
                  <Icon size={16} className={active ? 'text-yellow-300' : ''} />
                </div>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Left side display workspace */}
        <div className="lg:col-span-9 bg-white p-6 rounded-4xl border-2 border-slate-100 min-h-[500px]">
          
          {/* TAB 1: Realtime Stats */}
          {activeTab === 'stats' && stats && (
            <div className="space-y-6">
              <h2 className="font-black text-slate-800 text-xl border-b pb-3 flex items-center gap-1 justify-end">
                <span>نمای آماری ثبت‌نام‌ها و درآمدهای لحظه‌ای</span>
                <BarChart3 className="text-cyan-500" />
              </h2>

              {/* Bento cards stack */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-3xl border border-emerald-100">
                  <span className="text-emerald-500 bg-white p-2 rounded-xl inline-block shadow-sm">💰</span>
                  <span className="block text-2xl font-black text-emerald-800 mt-2">
                    {stats.totalRevenue.toLocaleString('fa-IR')}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold block mt-1">کل درآمد حاصل از فروش (تومان)</span>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-3xl border border-indigo-100">
                  <span className="text-indigo-500 bg-white p-2 rounded-xl inline-block shadow-sm font-bold">🎒</span>
                  <span className="block text-2xl font-black text-indigo-800 mt-2">
                    {stats.totalRegistrations.toLocaleString('fa-IR')}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold block mt-1">تعداد کل درخواست‌های ثبت‌نام</span>
                </div>

                <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-4 rounded-3xl border border-rose-100">
                  <span className="text-rose-500 bg-white p-2 rounded-xl inline-block shadow-sm">🎨</span>
                  <span className="block text-2xl font-black text-rose-800 mt-2">
                    {stats.totalArtworks.toLocaleString('fa-IR')}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold block mt-1">کل نقاشی‌های بارگذاری شده</span>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-4 rounded-3xl border border-amber-100">
                  <span className="text-amber-500 bg-white p-2 rounded-xl inline-block shadow-sm font-bold">📚</span>
                  <span className="block text-2xl font-black text-amber-800 mt-2">
                    {stats.totalCourses.toLocaleString('fa-IR')}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold block mt-1">کل دوره‌های کلاس فعال</span>
                </div>
              </div>

              {/* Graphical Analysis of courses */}
              <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 mt-6 text-right">
                <h3 className="font-bold text-slate-700 text-sm mb-4">نمودار مقایسه‌ای درآمد و مشارکت ثبت‌نام دوره‌ها</h3>
                <div className="space-y-4">
                  {stats.revenueByCourse.map((c, i) => {
                    const maxRevenue = Math.max(...stats.revenueByCourse.map(item => item.revenue), 100000);
                    const percentage = (c.revenue / maxRevenue) * 100;
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between items-center text-xs text-slate-650">
                          <span className="font-mono text-emerald-600 font-bold">{c.revenue.toLocaleString('fa-IR')} تومان ({c.registrations} ثبت‌نام)</span>
                          <span className="font-black">{c.courseTitle}</span>
                        </div>
                        {/* Horizontal Custom Bar Chart */}
                        <div className="w-full h-3.5 bg-slate-200 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                            className="h-full bg-gradient-to-r from-teal-400 to-indigo-500 rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })}
                  {stats.revenueByCourse.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-6">هنوز هیچ تراکنشی ثبت نشده است.</p>
                  )}
                </div>
              </div>
            </div>
          )}


          {/* TAB 2: Artworks portfolio upload management */}
          {activeTab === 'artworks' && (
            <div className="space-y-6 text-right">
              <h2 className="font-black text-slate-800 text-xl border-b pb-3 flex items-center justify-between">
                <span className="text-xs bg-rose-50 text-rose-600 px-3 py-1 rounded-full animate-pulse">سیستم بارگذاری و ویرایش گالری شاد</span>
                <span className="flex items-center gap-1">
                  <span>مدیریت نمونه کارهای هنری هنرجویان</span>
                  <Image className="text-rose-500" />
                </span>
              </h2>

              {/* Dual Layout: Editor and List */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* Right side form */}
                <form onSubmit={handleArtSubmit} className="md:col-span-12 lg:col-span-5 bg-rose-50/35 p-5 rounded-3xl border border-rose-100 space-y-4">
                  <h3 className="font-bold text-slate-700 text-sm mb-3">
                    {artForm.id ? 'ویرایش اطلاعات اثر هنرجو' : 'بارگذاری اثر هنری جدید ثبت‌نامی'}
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-slate-655 mb-1">عنوان اثر نقاشی</label>
                    <input
                      id="art-title"
                      type="text"
                      required
                      placeholder="مثلا: نقاشی کروکودیل پرنده"
                      value={artForm.title}
                      onChange={e => setArtForm({ ...artForm, title: e.target.value })}
                      className="w-full p-2.5 bg-white border border-rose-200 focus:border-rose-450 rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  {/* Student Name and Age */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-655 mb-1">نام هنرجو</label>
                      <input
                        id="art-student-name"
                        type="text"
                        required
                        placeholder="نام و نام‌خانوادگی"
                        value={artForm.studentName || ''}
                        onChange={e => setArtForm({ ...artForm, studentName: e.target.value })}
                        className="w-full p-2.5 bg-white border border-rose-200 focus:border-rose-450 rounded-xl text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-655 mb-1">سن (مثلا: ۷ ساله)</label>
                      <input
                        id="art-student-age"
                        type="text"
                        placeholder="۷ ساله"
                        value={artForm.studentAge || ''}
                        onChange={e => setArtForm({ ...artForm, studentAge: e.target.value })}
                        className="w-full p-2.5 bg-white border border-rose-200 focus:border-rose-450 rounded-xl text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-655 mb-1">توضیحات اثر برای کودکان و والدین</label>
                    <textarea
                      id="art-desc"
                      rows={2}
                      placeholder="داستان اثر، ابزار رنگ‌آمیزی و تکنیک استفاده شده..."
                      value={artForm.description}
                      onChange={e => setArtForm({ ...artForm, description: e.target.value })}
                      className="w-full p-2.5 bg-white border border-rose-200 focus:border-rose-450 rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-655 mb-1 block">رشته آموزشی اثر</label>
                    <select
                      id="art-category"
                      value={artForm.category}
                      onChange={e => setArtForm({ ...artForm, category: e.target.value })}
                      className="w-full p-2.5 bg-white border border-rose-200 focus:border-rose-300 rounded-xl text-xs focus:outline-none"
                    >
                      <option value="آبرنگ و گواش">🎨 آبرنگ و گواش</option>
                      <option value="کلاژ و کاردستی">✂️ کلاژ و کاردستی</option>
                      <option value="مداد رنگی">✏️ مداد رنگی</option>
                      <option value="خمیر هواخشک">🧸 خمیر هواخشک</option>
                      <option value="حجم سازی با گِل">🏺 حجم‌سازی با گل</option>
                      <option value="مهرسازی">🔲 مهرسازی</option>
                      <option value="طراحی لباس">👗 طراحی لباس</option>
                      <option value="طراحی و ساخت جلد کتاب و داستان نویسی">📖 طراحی جلد و داستان‌نویسی</option>
                      <option value="طراحی کارت پستال">✉️ طراحی کارت پستال</option>
                      <option value="طراحی تمبر">🖼️ طراحی تمبر</option>
                      <option value="نمایش خلاق">🎭 نمایش خلاق</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-655 mb-1">انتخاب تصویر نقاشی هنرجو</label>
                    <div className="flex items-center gap-2">
                      <label className="flex-1 cursor-pointer bg-white border-2 border-dashed border-rose-200 hover:border-rose-400 rounded-xl p-3 text-center block text-xs font-bold text-slate-500">
                        <FileUp size={16} className="mx-auto text-rose-400 mb-1" />
                        <span>انتخاب فایل عکس</span>
                        <input
                          id="art-image-chooser"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => handleImageFileChange(e, 'art')}
                        />
                      </label>
                    </div>
                    {artForm.imageUrl && (
                      <div className="mt-3 relative border border-rose-200 rounded-xl overflow-hidden h-24 bg-slate-100">
                        {artForm.imageUrl.startsWith('placeholder') ? (
                          <div className="h-full flex items-center justify-center font-bold text-rose-500 text-xs">طرح پیش‌فرض ({artForm.imageUrl})</div>
                        ) : (
                          <img src={artForm.imageUrl} className="w-full h-full object-cover" />
                        )}
                        <button
                          id="clear-art-img-btn"
                          type="button"
                          onClick={() => setArtForm(prev => ({ ...prev, imageUrl: '' }))}
                          className="absolute -top-1 -left-1 bg-rose-500 text-white rounded-full p-1 text-[10px] w-6 h-6 flex items-center justify-center cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      id="art-submit-btn"
                      type="submit"
                      className="flex-1 py-2 px-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
                    >
                      {artForm.id ? 'ثبت ویرایش اثر' : 'بارگذاری نقاشی جدید'}
                    </button>
                    {artForm.id && (
                      <button
                        id="cancel-art-edit"
                        type="button"
                        onClick={() => setArtForm({ title: '', description: '', category: 'آبرنگ و گواش', imageUrl: '', studentName: '', studentAge: '' })}
                        className="py-2 px-3 bg-slate-200 text-slate-700 hover:bg-slate-350 font-bold rounded-xl text-xs transition cursor-pointer"
                      >
                        انصراف
                      </button>
                    )}
                  </div>
                </form>

                {/* Left side list of items */}
                <div className="md:col-span-7 space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {artworksList.map(art => (
                    <div key={art.id} className="bg-slate-50 p-3 rounded-2xl border border-slate-150 flex items-center justify-between gap-4">
                      <div className="flex gap-2">
                        <button
                          id={`art-edit-btn-${art.id}`}
                          onClick={() => setArtForm(art)}
                          className="bg-slate-200 text-slate-700 hover:bg-slate-300 p-2 rounded-xl text-[10px] transition cursor-pointer flex items-center gap-0.5"
                        >
                          <Edit3 size={11} />
                        </button>
                        <button
                          id={`art-del-btn-${art.id}`}
                          onClick={() => handleArtDelete(art.id)}
                          className="bg-rose-100 text-rose-600 hover:bg-rose-200 p-2 rounded-xl text-[10px] transition cursor-pointer"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <h4 className="font-bold text-xs text-slate-800">{art.title}</h4>
                          <span className="inline-block bg-rose-100 text-rose-700 text-[9px] px-2 py-0.5 mt-1 rounded-full">{art.category}</span>
                          {art.studentName && <span className="inline-block bg-amber-50 text-amber-800 border border-amber-250 text-[9px] px-2 py-0.5 mt-1 mr-1.5 rounded-full font-bold">هنرجو: {art.studentName} {art.studentAge ? `(${art.studentAge})` : ''}</span>}
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-slate-200 overflow-hidden border p-0.5">
                          {art.imageUrl.startsWith('placeholder') ? (
                            <span className="w-full h-full flex items-center justify-center text-lg bg-slate-300">🎨</span>
                          ) : (
                            <img src={art.imageUrl} className="w-full h-full object-cover rounded-lg" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {artworksList.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-10">هیچ اثری ثبت نشده است.</p>
                  )}
                </div>

              </div>
            </div>
          )}


          {/* TAB 2.5: Esra Chavoshi Illustrations portfolio upload management */}
          {activeTab === 'illustrations' && (
            <div className="space-y-6 text-right">
              <h2 className="font-black text-slate-800 text-xl border-b pb-3 flex items-center justify-between">
                <span className="text-xs bg-purple-50 text-purple-600 px-3 py-1 rounded-full animate-pulse">سیستم بارگذاری و ویرایش آثار مربی</span>
                <span className="flex items-center gap-1">
                  <span>مدیریت کارهای تصویرسازی اسرا چاوشی</span>
                  <Palette className="text-purple-500" />
                </span>
              </h2>

              {/* Dual Layout: Editor and List */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* Right side form */}
                <form onSubmit={handleIllustrationSubmit} className="md:col-span-12 lg:col-span-5 bg-purple-50/35 p-5 rounded-3xl border border-purple-100 space-y-4">
                  <h3 className="font-bold text-slate-700 text-sm mb-3">
                    {illustrationForm.id ? 'ویرایش اطلاعات تصویرسازی مربی' : 'بارگذاری تصویرسازی جدید خانم هنر'}
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">عنوان تصویرسازی</label>
                    <input
                      id="illustration-title"
                      type="text"
                      required
                      placeholder="مثلا: تصویرسازی روباه و کلاغ جلد کتاب"
                      value={illustrationForm.title}
                      onChange={e => setIllustrationForm({ ...illustrationForm, title: e.target.value })}
                      className="w-full p-2.5 bg-white border border-purple-200 focus:border-purple-450 rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">توضیحات و داستان پشت صحنه تصویرسازی</label>
                    <textarea
                      id="illustration-desc"
                      rows={4}
                      placeholder="درباره ایده خلاقانه این طراحی خلاقانه بنویسید..."
                      value={illustrationForm.description}
                      onChange={e => setIllustrationForm({ ...illustrationForm, description: e.target.value })}
                      className="w-full p-2.5 bg-white border border-purple-200 focus:border-purple-450 rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">انتخاب تصویر اثر مربی</label>
                    <div className="flex items-center gap-3">
                      <label className="flex-1 cursor-pointer bg-white border-2 border-dashed border-purple-200 hover:border-purple-400 rounded-xl p-3 text-center block text-xs font-bold text-slate-500">
                        <FileUp size={16} className="mx-auto text-purple-400 mb-1" />
                        <span>انتخاب فایل عکس</span>
                        <input
                          id="illustration-image-chooser"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => handleImageFileChange(e, 'illustration')}
                        />
                      </label>
                    </div>
                    {illustrationForm.imageUrl && (
                      <div className="mt-3 relative border border-purple-200 rounded-xl overflow-hidden h-24 bg-slate-100">
                        {illustrationForm.imageUrl.startsWith('placeholder') ? (
                          <div className="h-full flex items-center justify-center font-bold text-purple-500 text-xs">طرح پیش‌فرض ({illustrationForm.imageUrl})</div>
                        ) : (
                          <img src={illustrationForm.imageUrl} className="w-full h-full object-cover" />
                        )}
                        <button
                          id="clear-illustration-img-btn"
                          type="button"
                          onClick={() => setIllustrationForm(prev => ({ ...prev, imageUrl: '' }))}
                          className="absolute -top-1 -left-1 bg-purple-500 text-white rounded-full p-1 text-[10px] w-6 h-6 flex items-center justify-center cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      id="illustration-submit-btn"
                      type="submit"
                      className="flex-1 py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
                    >
                      {illustrationForm.id ? 'ثبت ویرایش اثر' : 'بارگذاری در آلبوم تصویرسازی'}
                    </button>
                    {illustrationForm.id && (
                      <button
                        id="cancel-illustration-edit"
                        type="button"
                        onClick={() => setIllustrationForm({ title: '', description: '', imageUrl: '' })}
                        className="py-2 px-3 bg-slate-200 text-slate-700 hover:bg-slate-350 font-bold rounded-xl text-xs transition cursor-pointer"
                      >
                        انصراف
                      </button>
                    )}
                  </div>
                </form>

                {/* Left side list of items */}
                <div className="md:col-span-12 lg:col-span-7 space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {illustrationsList.map(ill => (
                    <div key={ill.id} className="bg-slate-50 p-3 rounded-2xl border border-slate-150 flex items-center justify-between gap-4">
                      <div className="flex gap-2">
                        <button
                          id={`ill-edit-btn-${ill.id}`}
                          onClick={() => setIllustrationForm(ill)}
                          className="bg-slate-200 text-slate-700 hover:bg-slate-300 p-2 rounded-xl text-[10px] transition cursor-pointer flex items-center gap-0.5"
                        >
                          <Edit3 size={11} />
                        </button>
                        <button
                          id={`ill-del-btn-${ill.id}`}
                          onClick={() => handleIllustrationDelete(ill.id)}
                          className="bg-rose-100 text-rose-600 hover:bg-rose-200 p-1.5 rounded-xl text-[10px] transition cursor-pointer"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <h4 className="font-extrabold text-xs text-slate-800">{ill.title}</h4>
                          <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{ill.description || 'توضیحات کوتاه مربی...'}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-slate-200 overflow-hidden border p-0.5 flex-none">
                          {ill.imageUrl.startsWith('placeholder') ? (
                            <span className="w-full h-full flex items-center justify-center text-lg bg-slate-300">🌸</span>
                          ) : (
                            <img src={ill.imageUrl} className="w-full h-full object-cover rounded-lg" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {illustrationsList.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-10 font-bold">هنوز هیچ فایل تصویرسازی بارگذاری نشده است.</p>
                  )}
                </div>
              </div>
            </div>
          )}


          {/* TAB 3: Courses Management CRUD */}
          {activeTab === 'courses' && (
            <div className="space-y-6 text-right">
              <h2 className="font-black text-slate-800 text-xl border-b pb-3 flex items-center justify-between">
                <span className="text-xs bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full">سیستم ویرایش اطلاعات دوره‌های زنده</span>
                <span className="flex items-center gap-1">
                  <span>مدیریت کارگاه‌های آموزشی خلاق</span>
                  <BookOpen className="text-emerald-500" />
                </span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* Form Right side */}
                <form onSubmit={handleCourseSubmit} className="md:col-span-5 bg-emerald-50/35 p-5 rounded-3xl border border-emerald-100 space-y-3">
                  <h3 className="font-bold text-slate-700 text-sm mb-2">
                    {courseForm.id ? 'ویرایش اطلاعات کارگاه' : 'ایجاد کارگاه جدید'}
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">عنوان کارگاه</label>
                    <input
                      id="course-title"
                      type="text"
                      required
                      placeholder="کارگاه ۲ روزه سفالگری تخیل"
                      value={courseForm.title}
                      onChange={e => setCourseForm({ ...courseForm, title: e.target.value })}
                      className="w-full p-2 bg-white border border-emerald-250 focus:border-emerald-400 rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">توضیحات سرفصل‌ها</label>
                    <textarea
                      id="course-desc"
                      rows={3}
                      placeholder="توضیحات و بازی‌های دوره‌ای..."
                      value={courseForm.description}
                      onChange={e => setCourseForm({ ...courseForm, description: e.target.value })}
                      className="w-full p-2 bg-white border border-emerald-250 focus:border-emerald-400 rounded-xl text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">گروه سنی هدف</label>
                      <input
                        id="course-age-group"
                        type="text"
                        required
                        placeholder="۴ تا ۷ سال"
                        value={courseForm.ageGroup}
                        onChange={e => setCourseForm({ ...courseForm, ageGroup: e.target.value })}
                        className="w-full p-2 bg-white border rounded-xl text-xs text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">تاریخ شروع</label>
                      <input
                        id="course-start-date"
                        type="text"
                        required
                        placeholder="۱۵ مرداد ۱۴۰۵"
                        value={courseForm.startDate}
                        onChange={e => setCourseForm({ ...courseForm, startDate: e.target.value })}
                        className="w-full p-2 bg-white border rounded-xl text-xs text-center"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">حداکثر ظرفیت</label>
                      <input
                        id="course-max-students"
                        type="number"
                        required
                        min={1}
                        value={courseForm.maxStudents}
                        onChange={e => setCourseForm({ ...courseForm, maxStudents: parseInt(e.target.value) })}
                        className="w-full p-2 bg-white border rounded-xl text-xs text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">شهریه (تومان)</label>
                      <input
                        id="course-price"
                        type="number"
                        required
                        value={courseForm.price}
                        onChange={e => setCourseForm({ ...courseForm, price: parseInt(e.target.value) })}
                        className="w-full p-2 bg-white border rounded-xl text-xs text-center"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">دوره فعال است؟</label>
                      <select
                        id="course-active-select"
                        value={courseForm.active}
                        onChange={e => setCourseForm({ ...courseForm, active: parseInt(e.target.value) })}
                        className="w-full p-2 bg-white border border-emerald-200 text-xs rounded-xl"
                      >
                        <option value={1}>بله، نمایش در سایت</option>
                        <option value={0}>خیر، موقتاً مخفی</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">تصویر شاخص</label>
                      <input
                        id="course-img-input"
                        type="text"
                        required
                        value={courseForm.imageUrl}
                        onChange={e => setCourseForm({ ...courseForm, imageUrl: e.target.value })}
                        className="w-full p-2 bg-white border rounded-xl text-[10px] text-center font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      id="course-submit-btn"
                      type="submit"
                      className="flex-1 py-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
                    >
                      {courseForm.id ? 'بروزرسانی کلاس' : 'ایجاد کـلاس'}
                    </button>
                    {courseForm.id && (
                      <button
                        id="cancel-course-edit-btn"
                        type="button"
                        onClick={() => setCourseForm({ title: '', description: '', ageGroup: '۴ تا ۷ سال', price: 0, startDate: '', maxStudents: 10, imageUrl: 'course-creative', active: 1 })}
                        className="py-2 px-3 bg-slate-200 text-slate-700 hover:bg-slate-300 font-bold rounded-xl text-xs transition"
                      >
                        انصراف
                      </button>
                    )}
                  </div>
                </form>

                {/* List Left side */}
                <div className="md:col-span-7 space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {coursesList.map(course => (
                    <div key={course.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-150 flex items-center justify-between">
                      <div className="flex gap-2">
                        <button
                          id={`course-edit-btn-${course.id}`}
                          onClick={() => setCourseForm(course)}
                          className="bg-slate-200 text-slate-700 hover:bg-slate-300 p-2 rounded-xl text-[10px] transition cursor-pointer"
                        >
                          <Edit3 size={11} />
                        </button>
                        <button
                          id={`course-del-btn-${course.id}`}
                          onClick={() => handleCourseDelete(course.id)}
                          className="bg-rose-100 text-rose-600 hover:bg-rose-200 p-2 rounded-xl text-[10px] transition cursor-pointer"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>

                      <div className="text-right flex-1 mr-4">
                        <div className="flex items-center gap-1 justify-end flex-wrap">
                          {course.active === 0 && <span className="bg-slate-200 text-slate-600 text-[9px] px-1.5 py-0.5 rounded-full font-bold">غیرفعال</span>}
                          <h4 className="font-bold text-xs text-slate-900">{course.title}</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-1 text-[10px] text-slate-500 font-medium">
                          <span>گروه: {course.ageGroup}</span>
                          <span>شروع: {course.startDate}</span>
                          <span>ظرفیت: {course.maxStudents} نفر</span>
                          <span className="text-emerald-600 font-bold">{course.price.toLocaleString('fa-IR')} تومان</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {coursesList.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-10">هیچ دوره‌ای ایجاد نشده است.</p>
                  )}
                </div>

              </div>
            </div>
          )}


          {/* TAB 4: Course Registrations Status & confirm */}
          {activeTab === 'registrations' && (
            <div className="space-y-6 text-right">
              <h2 className="font-black text-slate-800 text-xl border-b pb-3 flex items-center justify-between">
                <span className="text-xs bg-yellow-50 text-yellow-600 px-3 py-1 rounded-full">کنترل شهریه‌ها و تایید حضور خلاق کودکان</span>
                <span className="flex items-center gap-1">
                  <span>ثبت‌نامی‌های کارگاه‌ها</span>
                  <Users className="text-yellow-600" />
                </span>
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b text-slate-700 font-bold">
                      <th className="p-3">کلاس درخواستی</th>
                      <th className="p-3">نام کودک (والدین)</th>
                      <th className="p-3">شماره تماس همراه</th>
                      <th className="p-3">نوع پرداخت و رسید فیش</th>
                      <th className="p-3">شهریه واریزی</th>
                      <th className="p-3">وضعیت رزرو</th>
                      <th className="p-3">عملیات ادمین</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {registrationsList.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-indigo-700 text-[11px] max-w-[120px] truncate" title={r.courseTitle}>
                          {r.courseTitle}
                        </td>
                        <td className="p-3 font-medium">
                          <div className="font-bold text-slate-800">{r.studentName}</div>
                          <div className="text-[10px] text-slate-400">والد: {r.parentName}</div>
                        </td>
                        <td className="p-3 font-mono text-slate-600">{r.phone}</td>
                        <td className="p-3">
                          {r.paymentMethod === 'card_to_card' ? (
                            <div className="space-y-1 block">
                              <span className="inline-block bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full text-[9px] font-black">💳 کارت به کارت</span>
                              {r.receiptImage ? (
                                <div className="flex items-center gap-1 mt-1 justify-end">
                                  <button
                                    onClick={() => setPreviewReceiptImage(r.receiptImage || null)}
                                    className="p-0.5 border border-indigo-200 rounded-lg hover:border-indigo-400 transition-colors cursor-zoom-in bg-white"
                                    title="مشاهده رسید پرداخت"
                                  >
                                    <img src={r.receiptImage} className="w-8 h-8 object-cover rounded-md" alt="Receipt Thumb" />
                                  </button>
                                  <span className="text-[9px] text-slate-400">کلیک برای زوم 🔎</span>
                                </div>
                              ) : (
                                <div className="text-[9px] text-amber-600 font-bold">❌ بدون فیش رسید</div>
                              )}
                            </div>
                          ) : (
                            <span className="inline-block bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[9px] font-black">⏳ رزرو موقت</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`${r.amountPaid > 0 ? 'text-emerald-600 font-bold' : 'text-rose-500'}`}>
                            {r.amountPaid > 0 ? `${r.amountPaid.toLocaleString('fa-IR')} تومان` : 'کامل پرداخت نشده'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-bold ${
                            r.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                            r.status === 'pending' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {r.status === 'confirmed' ? 'تایید نهایی حضور' :
                             r.status === 'pending' ? 'در انتظار بررسی' : 'لغو ثبت‌نام'}
                          </span>
                        </td>
                        <td className="p-3 flex items-center gap-1.5 flex-wrap">
                          {r.status !== 'confirmed' && (
                            <button
                              id={`btn-confirm-reg-${r.id}`}
                              onClick={() => handleRegStatusUpdate(r.id, 'confirmed', r.amountPaid)}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1 rounded-lg text-[9px] cursor-pointer"
                              title="تایید و ثبت پرداخت شهریه"
                            >
                              تایید نهایی حضور ✅
                            </button>
                          )}
                          {r.status !== 'canceled' && (
                            <button
                              id={`btn-cancel-reg-${r.id}`}
                              onClick={() => handleRegStatusUpdate(r.id, 'canceled', 0)}
                              className="bg-rose-100 text-rose-700 hover:bg-rose-200 px-2 py-1 rounded-lg text-[9px] cursor-pointer"
                            >
                              لغو رزرو
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {registrationsList.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-10 text-slate-400">هیچ درخواست رزرو کلاسی در پایگاه داده نیست.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Lightbox for Receipt Image */}
              {previewReceiptImage && (
                <div
                  className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[60] flex items-center justify-center p-4 cursor-zoom-out"
                  onClick={() => setPreviewReceiptImage(null)}
                >
                  <div className="relative max-w-lg w-full bg-white rounded-3xl p-3 border-4 border-indigo-200 shadow-2xl flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => setPreviewReceiptImage(null)}
                      className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold z-10 shadow-md cursor-pointer"
                    >
                      ✕
                    </button>
                    <img
                      src={previewReceiptImage}
                      alt="Receipt Screen Large Preview"
                      className="max-w-full max-h-[75vh] object-contain rounded-2xl"
                    />
                    <p className="text-[10px] text-slate-500 font-bold mt-2 font-sans">تصویر فیش / رسید واریزی بارگذاری شده توسط هنرجو</p>
                  </div>
                </div>
              )}
            </div>
          )}


          {/* TAB 5: Support Messages responses with dynamic file attachment support */}
          {activeTab === 'messages' && (
            <div className="space-y-6 text-right">
              <h2 className="font-black text-slate-800 text-xl border-b pb-3 flex items-center justify-between">
                <span className="text-xs bg-orange-50 text-orange-600 px-3 py-1 rounded-full">صندوق پاسخگویی پورتال هنر کودکان</span>
                <span className="flex items-center gap-1">
                  <span>صندوق نامه‌ها و سوالات والدین</span>
                  <MessageSquare className="text-orange-500" />
                </span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* List of Messages */}
                <div className="md:col-span-6 space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  {messagesList.map(msg => (
                    <div
                      key={msg.id}
                      onClick={() => {
                        setSelectedMsg(msg);
                        setReplyText(msg.reply || '');
                        setReplyFile(msg.replyAttachment || null);
                        setReplyFileName(msg.replyAttachmentName || null);
                      }}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-right flex flex-col justify-between hover:scale-[1.01] ${
                        selectedMsg?.id === msg.id 
                          ? 'bg-orange-50 border-orange-300' 
                          : msg.status === 'unread' 
                          ? 'bg-rose-50/50 border-rose-100 ring-2 ring-rose-300/10' 
                          : 'bg-slate-50 border-slate-100'
                      }`}
                    >
                      <div className="flex justify-between items-center text-xs mb-2">
                        <span className="text-[10px] text-slate-400 font-mono">{new Date(msg.createdAt).toLocaleDateString('fa-IR')}</span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {msg.status === 'unread' && <span className="bg-rose-500 text-white font-bold text-[8px] px-1.5 py-0.5 rounded-full animate-pulse">پیام جدید</span>}
                          <span className="font-bold text-slate-800">{msg.senderName}</span>
                        </div>
                      </div>
                      <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                      
                      {msg.reply && (
                        <div className="mt-2 pt-2 border-t border-slate-200/50 flex justify-between items-center text-[10px] text-emerald-600">
                          <span className="flex items-center gap-0.5">
                            {msg.replyAttachmentName && <Paperclip size={10} />}
                            <span>پاسخ داده شد</span>
                          </span>
                          <span className="font-medium text-slate-400">پاسخ خانم هنر</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {messagesList.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-10">صندوق نامه‌ها خالی است.</p>
                  )}
                </div>

                {/* Reply Form Box */}
                <div className="md:col-span-6 bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
                  {selectedMsg ? (
                    <form onSubmit={handleMessageReply} className="space-y-4">
                      <div className="bg-white p-3.5 rounded-2xl border text-xs">
                        <span className="font-bold text-indigo-600 block mb-1">سوال فرستاده شده از: {selectedMsg.senderName} ({selectedMsg.email})</span>
                        <p className="text-slate-650 leading-relaxed max-h-[100px] overflow-y-auto whitespace-pre-wrap">{selectedMsg.message}</p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">پاسخ شیرین و راهنمایی شما</label>
                        <textarea
                          id="reply-text-area"
                          rows={4}
                          required
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          placeholder="سلام مامان عزیز و مهربان..."
                          className="w-full p-2.5 bg-white border border-slate-300 focus:border-orange-400 rounded-xl text-xs focus:outline-none"
                        />
                      </div>

                      {/* Attachments Section */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          ارسال فایل پیوست به هنرجو (برنامه کلاسی، لیست وسایل مورد نیاز و ...)
                        </label>
                        <div className="flex items-center gap-2">
                          <label className="flex-1 cursor-pointer bg-white border border-dashed border-slate-300 hover:border-orange-400 rounded-xl p-2.5 text-center text-xs text-slate-500 font-bold block">
                            <Paperclip size={14} className="inline mr-1" />
                            <span>{replyFileName ? replyFileName : 'انتخاب فایل ضمیمه'}</span>
                            <input
                              id="attachment-file-chooser"
                              type="file"
                              className="hidden"
                              onChange={handleAttachmentFileChange}
                            />
                          </label>
                          {replyFile && (
                            <button
                              id="clear-attached-btn"
                              type="button"
                              onClick={() => {
                                setReplyFile(null);
                                setReplyFileName(null);
                              }}
                              className="bg-rose-100 text-rose-600 p-2.5 rounded-xl text-xs hover:bg-rose-200"
                            >
                              حذف فایل
                            </button>
                          )}
                        </div>
                      </div>

                      <button
                        id="send-reply-btn"
                        type="submit"
                        className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
                      >
                        ارسال پاسخ و پیوست به ایمیل 📮
                      </button>
                    </form>
                  ) : (
                    <div className="text-center py-16 text-slate-400 space-y-2">
                      <span className="text-4xl">📨</span>
                      <p className="text-xs font-bold">یکی از نامه‌ها را جهت تایپ پاسخ انتخاب کنید.</p>
                      <p className="text-[10px]">سیستم به صورت خودکار پاسخ را به ایمیل کاربر هدایت می‌کند.</p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}


          {/* TAB 6: Security profile settings, change admin pass, 2FA, backups */}
          {activeTab === 'security' && settings && (
            <div className="space-y-6 text-right">
              <h2 className="font-black text-slate-800 text-xl border-b pb-3 flex items-center gap-1 justify-end">
                <span>امنیت، مدیریت دو مرحله‌ای (2FA) و بک‌آپ دیتابیس</span>
                <Settings className="text-indigo-500" />
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                
                {/* Right Column: Profile details info */}
                <div className="md:col-span-6 space-y-6">
                  <form onSubmit={handleSettingsUpdate} className="bg-slate-50 p-5 rounded-3xl border border-slate-150 space-y-3">
                    <h3 className="font-bold text-indigo-900 text-sm border-b pb-2 mb-2">اطلاعات بیوگرافی و پروفایل وب‌سایت</h3>
                    
                    <div>
                      <label className="block text-xs font-bold text-rose-700 mb-1 font-black">عنوان سراسری وب‌سایت (هشتگ هدر اصلی)</label>
                      <input
                        id="setting-site-title"
                        type="text"
                        required
                        value={settings.siteTitle || ''}
                        onChange={e => setSettings({ ...settings, siteTitle: e.target.value })}
                        className="w-full p-2.5 bg-yellow-50/50 border-2 border-yellow-250 rounded-xl text-yellow-950 font-black text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">نام هنری مربی</label>
                      <input
                        id="setting-artist-name"
                        type="text"
                        required
                        value={settings.artistName}
                        onChange={e => setSettings({ ...settings, artistName: e.target.value })}
                        className="w-full p-2 bg-white border rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">عنوان تخصص مربی</label>
                      <input
                        id="setting-artist-title"
                        type="text"
                        required
                        value={settings.artistTitle || ''}
                        onChange={e => setSettings({ ...settings, artistTitle: e.target.value })}
                        className="w-full p-2 bg-white border rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">متن الهام‌بخش داستان و بیوگرافی</label>
                      <textarea
                        id="setting-biography"
                        rows={4}
                        required
                        value={settings.biography}
                        onChange={e => setSettings({...settings, biography: e.target.value})}
                        className="w-full p-2 bg-white border rounded-xl text-xs leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">ایمیل تماس</label>
                        <input
                          id="setting-email"
                          type="email"
                          required
                          value={settings.contactEmail}
                          onChange={e => setSettings({ ...settings, contactEmail: e.target.value })}
                          className="w-full p-2 bg-white border rounded-xl text-[10px] text-center font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">شماره تماس مربی</label>
                        <input
                          id="setting-phone"
                          type="text"
                          required
                          value={settings.contactPhone}
                          onChange={e => setSettings({ ...settings, contactPhone: e.target.value })}
                          className="w-full p-2 bg-white border rounded-xl text-[10px] text-center"
                        />
                      </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-2xl border border-indigo-100 space-y-3">
                      <h4 className="text-[11px] font-bold text-indigo-900 border-b pb-1.5 flex items-center gap-1">
                        <span>💳 تنظیمات کارت بانکی جهت ثبت‌نام شهریه‌ها</span>
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">نام بانک</label>
                          <input
                            id="setting-bank-name"
                            type="text"
                            required
                            placeholder="مثلا: بانک ملی ایران"
                            value={settings.bankName || ''}
                            onChange={e => setSettings({ ...settings, bankName: e.target.value })}
                            className="w-full p-2 bg-slate-50 border rounded-xl text-[10px] text-right font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">دارنده حساب</label>
                          <input
                            id="setting-card-holder"
                            type="text"
                            required
                            placeholder="مثلا: اسراء چاوشی"
                            value={settings.cardHolder || ''}
                            onChange={e => setSettings({ ...settings, cardHolder: e.target.value })}
                            className="w-full p-2 bg-slate-50 border rounded-xl text-[10px] text-right font-medium"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">شماره کارت (۱۶ رقمی)</label>
                        <input
                          id="setting-card-no"
                          type="text"
                          required
                          placeholder="۶۰۳۷۹۹۱۸۱۲۳۴۵۶۷۸"
                          value={settings.cardNo || ''}
                          onChange={e => setSettings({ ...settings, cardNo: e.target.value })}
                          className="w-full p-2 bg-slate-50 border rounded-xl text-xs text-center font-mono tracking-widest font-black"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">تغییر رمز عبور ورود ادمین</label>
                      <input
                        id="setting-admin-pass"
                        type="password"
                        placeholder="وارد کردن کلمه عبور جدید..."
                        onChange={e => {
                          if (e.target.value.trim().length > 0) {
                            setSettings({ ...settings, adminPassword: e.target.value.trim() });
                          }
                        }}
                        className="w-full p-2 bg-white border border-rose-100 rounded-xl text-xs text-center font-mono"
                      />
                    </div>

                    <button
                      id="save-settings-submit"
                      type="submit"
                      className="w-full py-2 bg-slate-900 hover:bg-slate-955 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
                    >
                      ذخیره بیوگرافی و اطلاعات پروفایل
                    </button>
                  </form>
                </div>

                {/* Left Column: 2FA + Backups */}
                <div className="md:col-span-6 space-y-6">
                  

                  {/* SQLite database JSON backups exporter/importer */}
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-3xl space-y-4">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1 justify-end">
                      <span>پشتیبان‌گیری منظم و بازنشانی دیتابیس سبک (SQLite)</span>
                      <Coins size={15} className="text-slate-600" />
                    </h3>

                    <p className="text-slate-600 text-xs leading-relaxed">
                      امنیت بالا به شما اجازه می‌دهد در هر زمان کل محتوای دیتابیس SQLite خود شامل تصاویر کدارت، فاکتورها و فمیلی‌بردها را در قالب یک فایل پشتیبان دانلود کنید.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        id="db-backup-download"
                        type="button"
                        onClick={downloadDatabaseBackup}
                        className="flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-900 text-white font-bold p-3 rounded-2xl text-xs shadow transition cursor-pointer active:scale-95"
                      >
                        <Download size={14} />
                        <span>دانلود نقشه کل دیتابیس</span>
                      </button>

                      <label className="flex items-center justify-center gap-1 bg-white border border-slate-300 hover:border-slate-500 text-slate-700 font-bold p-3 rounded-2xl text-xs shadow-sm cursor-pointer transition text-center">
                        <Upload size={14} />
                        <span>انتخاب فایل پشتیبان</span>
                        <input
                          id="backup-file-chooser"
                          type="file"
                          accept=".json"
                          className="hidden"
                          onChange={handleBackupFileSelect}
                        />
                      </label>
                    </div>

                    {backupFileContent && (
                      <div className="bg-amber-50 p-4 border border-amber-200 rounded-2xl text-xs">
                        <div className="flex items-center gap-1 text-amber-700 font-bold justify-end mb-2">
                          <span>فایل بک‌آپ تحلیل شد</span>
                          <AlertTriangle size={14} />
                        </div>
                        <p className="text-slate-600 text-[10px]">
                          اثرها: {backupFileContent.artworks?.length || 0} عدد | کلاس‌ها: {backupFileContent.courses?.length || 0} عدد | ثبت‌نامی‌ها: {backupFileContent.registrations?.length || 0} عدد
                        </p>
                        <button
                          id="restore-db-btn"
                          onClick={restoreDatabaseBackup}
                          className="w-full mt-3 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                        >
                          شروع بازنشانی دیتابیس سبک ⚡
                        </button>
                      </div>
                    )}
                  </div>

                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
