/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send, CheckCircle, Mail, User, BookOpen, MessageSquare } from 'lucide-react';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    senderName: '',
    email: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.senderName || !formData.email || !formData.message) {
      setError('لطفا تمامی اطلاعات فیلدها را به درستی وارد کنید.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'خطا در ارسال پیام');
      }

      setSuccess(true);
      setFormData({ senderName: '', email: '', message: '' });
    } catch (err: any) {
      setError(err.message || 'متاسفانه ارسال پیام ناموفق بود.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-10 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white rounded-4xl border-3 border-orange-200 p-6 md:p-10 shadow-lg overflow-hidden relative">
        <div className="absolute top-0 left-0 bg-orange-100 p-8 rounded-br-4xl blur-sm opacity-50"></div>
        
        {/* Left Side: Illustrative message box */}
        <div className="md:col-span-5 text-right space-y-4">
          <div className="text-6xl animate-bounce">💌</div>
          <h3 className="font-black text-slate-800 text-2xl">صندوقچه پیام برای ادمین</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            دوستان کوچولو و والدین مهربان، اگر برای ثبت نام سوالی دارید یا دوست دارید نقاشی قشنگتون رو به ادمین (خانم هنر) نشون بدین، برام بنویسین! 
          </p>
          <div className="space-y-2 pt-4">
            <div className="flex items-center gap-2 justify-end text-xs text-slate-600 font-medium">
              <span>Sayyedmehranzare@gmail.com</span>
              <Mail size={14} className="text-orange-500" />
            </div>
            <div className="flex items-center gap-2 justify-end text-xs text-slate-600 font-medium">
              <span>پاسخگویی سریع کمتر از ۲۴ ساعت</span>
              <MessageSquare size={14} className="text-orange-500" />
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:col-span-7 bg-orange-50/50 p-6 rounded-3xl border-2 border-orange-100">
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-right">
              {error && (
                <div className="p-3 bg-red-100 border border-red-200 text-red-700 text-xs rounded-xl font-bold">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1 justify-end">
                  <span>نام و نام خانوادگی گرانقدر شما</span>
                  <User size={13} className="text-orange-400" />
                </label>
                <input
                  id="contact-sender-name"
                  type="text"
                  dir="rtl"
                  required
                  placeholder="مثلا: مامان آرتین یا مهدی احمدی"
                  value={formData.senderName}
                  onChange={e => setFormData({ ...formData, senderName: e.target.value })}
                  className="w-full p-3 bg-white border-2 border-orange-100 focus:border-orange-300 rounded-2xl text-sm focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1 justify-end">
                  <span>آدرس ایمیل جهت پاسخگویی</span>
                  <Mail size={13} className="text-orange-400" />
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-3 bg-white border-2 border-orange-100 focus:border-orange-300 rounded-2xl text-sm focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1 justify-end">
                  <span>متن پیغام یا سوال شیرین شما</span>
                  <BookOpen size={13} className="text-orange-400" />
                </label>
                <textarea
                  id="contact-message"
                  dir="rtl"
                  required
                  rows={4}
                  placeholder="برامون از نقاشی، کلاژ و کلاس‌های قشنگمون بنویسید..."
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="w-full p-3 bg-white border-2 border-orange-100 focus:border-orange-300 rounded-2xl text-sm focus:outline-none transition-all resize-none"
                />
              </div>

              <button
                id="submit-contact-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send size={15} />
                <span>{loading ? 'در حال ارسال پیام...' : 'ارسال نامه جادویی من 📮'}</span>
              </button>
            </form>
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-orange-100 rounded-full text-orange-500">
                <CheckCircle size={32} className="animate-pulse" />
              </div>
              <h4 className="font-bold text-slate-800 text-lg">ارسال نامه با موفقیت انجام شد!</h4>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                پیام شیرین شما با خوشحالی تحویل خانم هنر (اسراء چاوشی) ثبت شد. به زودی صندوق پیام خود را متناظراً چک کنید!
              </p>
              <button
                id="reset-contact-btn"
                onClick={() => setSuccess(false)}
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl cursor-pointer text-xs"
              >
                فرستادن یک نامه دیگر
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
