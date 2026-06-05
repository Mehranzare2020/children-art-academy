/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Course } from '../types';
import { Sparkles, Calendar, Clock, Users, DollarSign, PenTool, CheckCircle, AlertCircle, Copy, Check, Upload, CreditCard } from 'lucide-react';

interface CoursesSectionProps {
  courses: Course[];
  onRegisterSuccess: () => void;
  settings?: any;
}

export default function CoursesSection({ courses, onRegisterSuccess, settings }: CoursesSectionProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    studentName: '',
    parentName: '',
    email: '',
    phone: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'card_to_card'>('online');
  const [receiptImage, setReceiptImage] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const activeCourses = courses.filter(c => c.active === 1);

  const handleCopyCard = () => {
    const card = settings?.cardNo || '۶۰۳۷۹۹۱۸۱۲۳۴۵۶۷۸';
    navigator.clipboard.writeText(card);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('حجم فیش انتخابی زیاد است. لطفاً تصویری با حجم کمتر از ۱۰ مگابایت بارگذاری فرمایید.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptImage(reader.result as string);
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    if (!formData.studentName || !formData.parentName || !formData.phone) {
      setErrorMsg('پر کردن نام هنرجو، نام والدین و شماره تماس الزامی است.');
      return;
    }

    if (paymentMethod === 'card_to_card' && !receiptImage) {
      setErrorMsg('از آنجا که روش کارت به کارت انتخاب شده است، لطفاً تصویر فیش یا رسید واریزی را آپلود نمایید.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const res = await fetch(`/api/courses/${selectedCourse.id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          paymentMethod,
          receiptImage: paymentMethod === 'card_to_card' ? receiptImage : null
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'خطا در فرآیند ثبت‌نام');
      }

      setSuccessMsg(data.message || 'ثبت‌نام اولیه با موفقیت انجام شد!');
      // Reset form
      setFormData({ studentName: '', parentName: '', email: '', phone: '' });
      setPaymentMethod('online');
      setReceiptImage('');
      onRegisterSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'مشکلی رخ داد، لطفا بعدا تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  const formattedPrice = (price: number) => {
    return price === 0 ? 'رایگان!' : `${price.toLocaleString('fa-IR')} تومان`;
  };

  return (
    <div className="py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {activeCourses.map((course, index) => {
          const regCount = course.registrationCount || 0;
          const isFull = regCount >= course.maxStudents;
          
          return (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-4xl overflow-hidden shadow-lg border-2 border-slate-100 flex flex-col justify-between hover:shadow-2xl transition-all relative"
            >
              {/* Image banner fallback */}
              <div className="w-full h-48 bg-gradient-to-r from-teal-400 to-emerald-400 flex flex-col items-center justify-center p-6 text-white text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-white/20 p-8 rounded-full blur-xl"></div>
                <div className="absolute bottom-0 left-0 bg-emerald-500/30 p-12 rounded-full blur-xl"></div>
                
                <span className="text-5xl mb-2 animate-bounce">
                  {index === 0 ? '🎪' : '🎨'}
                </span>
                <span className="font-black text-xl leading-tight text-white drop-shadow-md">{course.title}</span>
                <div className="absolute top-3 left-3 bg-white text-teal-800 font-bold px-3 py-1 rounded-full text-xs">
                  {course.ageGroup}
                </div>
              </div>

              {/* Course body content */}
              <div className="p-6 text-right flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    {course.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl text-xs text-slate-600 mb-6 font-medium">
                    <div className="flex items-center gap-2 justify-end">
                      <span>{course.startDate}</span>
                      <Calendar size={14} className="text-teal-500" />
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <span>گروه سنی: {course.ageGroup}</span>
                      <Users size={14} className="text-teal-500" />
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <span>{course.maxStudents} نفر</span>
                      <Clock size={14} className="text-teal-500" />
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <span className="font-bold text-slate-800">{formattedPrice(course.price)}</span>
                      <DollarSign size={14} className="text-teal-500" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                  <div className="text-right">
                    <span className="text-xs text-slate-400">ظرفیت کلاس:</span>
                    <div className="flex items-center gap-1 mt-1 justify-end">
                      <span className="font-bold text-sm text-slate-700">{course.maxStudents} / {regCount}</span>
                      <span className="text-xs text-slate-400 font-normal">ثبت‌نامی</span>
                    </div>
                  </div>

                  <button
                    id={`btn-reg-${course.id}`}
                    onClick={() => {
                      if (!isFull) {
                        setSelectedCourse(course);
                        setIsRegistering(true);
                        setSuccessMsg('');
                        setErrorMsg('');
                      }
                    }}
                    disabled={isFull}
                    className={`px-6 py-3.5 rounded-full font-bold cursor-pointer transition shadow-md hover:shadow-lg active:scale-95 ${
                      isFull
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    }`}
                  >
                    {isFull ? 'ظرفیت تکمیل' : 'ثبت نام در کارگاه  🥳'}
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

        {activeCourses.length === 0 && (
          <div className="col-span-full text-center py-16 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 max-w-xl mx-auto">
            <span className="text-5xl">🎒</span>
            <h3 className="font-bold text-slate-700 text-lg mt-4">در حال حاضر ثبت‌نام کارگاه جدیدی فعال نیست.</h3>
            <p className="text-slate-400 text-sm mt-1">به زودی دوره‌های شگفت‌انگیز جدیدی اعلام می‌شوند! گوش به زنگ باشید.</p>
          </div>
        )}

      {/* Course Registration Modal Popup */}
      <AnimatePresence>
        {isRegistering && selectedCourse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsRegistering(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
              className="bg-white rounded-4xl max-w-lg w-full p-6 relative border-4 border-emerald-300 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <button
                id="close-reg-modal-btn"
                onClick={() => setIsRegistering(false)}
                className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 h-8 w-8 rounded-full flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>

              <div className="text-center mb-6">
                <span className="text-4xl animate-bounce">🎈</span>
                <h3 className="font-black text-slate-800 text-xl mt-2">فرم شیرین ثبت‌نام کلاس</h3>
                <p className="text-xs text-orange-500 font-bold mt-1 max-w-sm mx-auto">{selectedCourse.title}</p>
              </div>

              {!successMsg ? (
                <form onSubmit={handleRegisterSubmit} className="space-y-4 text-right">
                  {errorMsg && (
                    <div className="bg-rose-50 text-rose-600 p-3 rounded-2xl flex items-center gap-2 text-xs border border-rose-100">
                      <AlertCircle size={16} />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1 justify-end">
                      <span>نام و نام خانوادگی کودک (هنرجو)</span>
                      <PenTool size={12} className="text-slate-400" />
                    </label>
                    <input
                      id="reg-student-name"
                      type="text"
                      dir="rtl"
                      required
                      placeholder="مثلا: آرتین رضایی"
                      value={formData.studentName}
                      onChange={e => setFormData({ ...formData, studentName: e.target.value })}
                      className="w-full p-3 border-2 border-slate-100 focus:border-emerald-300 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-150 transition-all bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">نام یکی از والدین (پدر یا مادر)</label>
                    <input
                      id="reg-parent-name"
                      type="text"
                      dir="rtl"
                      required
                      placeholder="مثلا: مریم سادات"
                      value={formData.parentName}
                      onChange={e => setFormData({ ...formData, parentName: e.target.value })}
                      className="w-full p-3 border-2 border-slate-100 focus:border-emerald-300 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-150 transition-all bg-slate-50/50"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">شماره تماس همراه</label>
                      <input
                        id="reg-phone"
                        type="tel"
                        required
                        placeholder="مثلا: ۰۹۱۲۳۴۵۶۷۸۹"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full p-3 border-2 border-slate-100 focus:border-emerald-300 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-150 transition-all bg-slate-50/50 text-right font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">آدرس ایمیل (اختیاری)</label>
                      <input
                        id="reg-email"
                        type="email"
                        placeholder="parent@example.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full p-3 border-2 border-slate-100 focus:border-emerald-300 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-150 transition-all bg-slate-50/50 text-right"
                      />
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-2 border-t pt-4">
                    <label className="block text-xs font-bold text-slate-700 mb-1">روش پرداخت شهریه</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('online')}
                        className={`p-3 rounded-2xl border-2 text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                          paymentMethod === 'online'
                            ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800'
                            : 'border-slate-100 hover:border-slate-200 text-slate-650 bg-slate-50/20'
                        }`}
                      >
                        <Sparkles size={16} className={paymentMethod === 'online' ? 'text-emerald-600' : 'text-slate-400'} />
                        <span>رزرو صندلی و پرداخت بعداً</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card_to_card')}
                        className={`p-3 rounded-2xl border-2 text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                          paymentMethod === 'card_to_card'
                            ? 'border-indigo-500 bg-indigo-50/50 text-indigo-800'
                            : 'border-slate-100 hover:border-slate-200 text-slate-600 bg-slate-50/20'
                        }`}
                      >
                        <CreditCard size={14} className={paymentMethod === 'card_to_card' ? 'text-indigo-600' : 'text-slate-400'} />
                        <span>کارت به کارت (بانکی)</span>
                      </button>
                    </div>
                  </div>

                  {/* If Card To Card is selected, show customizable bank card details & screenshot attachment */}
                  {paymentMethod === 'card_to_card' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-slate-50 p-4 rounded-3xl border border-slate-150 space-y-4 text-right"
                    >
                      <p className="text-[11px] text-slate-500 font-bold">لطفاً شهریه دوره را به شماره کارت زیر پرداخت نموده و تصویر فیش را بارگذاری فرمایید:</p>
                      
                      <div className="bg-gradient-to-l from-indigo-600 to-violet-600 p-4 rounded-2xl text-white shadow-md relative overflow-hidden font-sans">
                        <div className="absolute -top-3 -left-3 bg-white/10 w-16 h-16 rounded-full"></div>
                        <div className="relative z-10 space-y-2">
                          <div className="flex justify-between items-center text-[10px] opacity-80">
                            <span>{settings?.bankName || 'بانک ملی ایران'}</span>
                            <span className="font-bold">کارت عابربانک مربی</span>
                          </div>
                          <div className="text-center font-bold text-base tracking-widest my-2 flex items-center justify-center gap-2">
                            <span className="font-mono text-white/95">{settings?.cardNo || '۶۰۳۷۹۹۱۸۱۲۳۴۵۶۷۸'}</span>
                            <button
                              type="button"
                              onClick={handleCopyCard}
                              className="bg-white/20 hover:bg-white/30 p-1 rounded-lg transition-colors cursor-pointer"
                              title="کپی کردن شماره کارت"
                            >
                              {copied ? <Check size={12} className="text-emerald-300" /> : <Copy size={12} />}
                            </button>
                          </div>
                          <div className="flex justify-between items-center text-[10px] opacity-90">
                            <span>دارنده حساب: {settings?.cardHolder || 'اسراء چاوشی'}</span>
                            {copied && <span className="bg-emerald-500 text-white font-bold px-1.5 py-0.5 rounded text-[8px]">کپی شد!</span>}
                          </div>
                        </div>
                      </div>

                      {/* Receipt File Upload */}
                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold text-slate-700">بارگذاری تصویر رسید پرداخت (فیش واریزی) <span className="text-rose-500">*</span></label>
                        <div className="flex items-center gap-3">
                          <label className="flex-1 border-2 border-dashed border-slate-200 hover:border-indigo-400 p-4 rounded-2xl cursor-pointer transition-colors flex flex-col items-center justify-center bg-white">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleReceiptChange}
                              className="hidden"
                            />
                            <Upload size={18} className="text-slate-400 mb-1" />
                            <span className="text-[10px] text-slate-500 font-bold">انتخاب عکس رسید یا فیش پرداختی</span>
                            <span className="text-[8px] text-slate-400 mt-0.5">حجم مجاز تا ۱۰ مگابایت</span>
                          </label>

                          {receiptImage && (
                            <div className="w-18 h-18 rounded-xl overflow-hidden border border-slate-200 relative group bg-slate-100 flex items-center justify-center">
                              <img src={receiptImage} alt="Receipt Preview" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setReceiptImage('')}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity cursor-pointer"
                              >
                                حذف فیش
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="bg-slate-50 p-4 rounded-2xl text-xs text-slate-500 leading-relaxed border border-slate-100 mt-2">
                    <p className="font-bold text-slate-600 mb-1">شهریه پرداختی نهایی:</p>
                    <p className="text-sm font-black text-emerald-600">{formattedPrice(selectedCourse.price)}</p>
                    <p className="mt-2 text-[10px]">پس از ارسال فرم، بلافاصله جایگاه شما رزرو موقت خواهد شد و ثبت‌نام نهایی پس از هماهنگی یا تأیید رسید فیش بانکی فعال خواهد شد.</p>
                  </div>

                  <button
                    id="submit-reg-btn"
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-full cursor-pointer shadow-md hover:shadow-lg transition active:scale-95 text-center"
                  >
                    {loading ? 'در حال ثبت‌نام...' : 'ثبت حضور کودک خلاق من 🎈'}
                  </button>
                </form>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 rounded-full text-emerald-500">
                    <CheckCircle size={40} className="animate-bounce" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-lg">هورا! رزرو موقت با موفقیت انجام شد 🎉</h4>
                  <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                    {successMsg}
                  </p>
                  <button
                    id="finish-reg-btn"
                    onClick={() => {
                      setIsRegistering(false);
                      setSuccessMsg('');
                    }}
                    className="mt-4 px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-full cursor-pointer text-xs"
                  >
                    بسیار عالی، متشکرم
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
