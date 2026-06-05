/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Elegant Full-Stack Express Server for Aunt Esra's Magical Children Art Academy
 * Seamlessly integrates local SQLite fallback and cloud-native Supabase PostgreSQL.
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { dbAdapter, isSupabase } from './dbAdapter.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Configure larger limits for base64 artwork/attachment uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Initialize the unified Database Adapter (SQLite/Supabase based on process.env)
  try {
    await dbAdapter.initDatabase();
    console.log('Database initialization completed successfully.');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }

  // --- Authorization Middleware for Admin Operations ---
  const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = req.headers.authorization;
    if (token === 'Bearer session_token_child_art_academy') {
      next();
    } else {
      res.status(403).json({ error: 'دسترسی غیرمجاز. لطفا ابتدا وارد سیستم شوید.' });
    }
  };

  // --- PUBLIC APIs ---

  // Get artist profile settings (exclude sensitive credentials)
  app.get('/api/settings', async (req, res) => {
    try {
      const settings = await dbAdapter.getSettings();
      // Filter out sensitive data from public delivery
      const publicOutput: Record<string, any> = {};
      Object.keys(settings).forEach(key => {
        if (key === 'totpSecret' || key === 'adminPassword') return;
        if (key === 'totpEnabled') {
          publicOutput[key] = settings[key] === '1' || settings[key] === true;
        } else {
          publicOutput[key] = settings[key];
        }
      });
      res.json(publicOutput);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'خطا در واکشی تنظیمات سیستم' });
    }
  });

  // Get all children artworks
  app.get('/api/artworks', async (req, res) => {
    try {
      const artworks = await dbAdapter.getArtworks();
      res.json(artworks);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'خطا در دریافت نمونه کارهای کودکان' });
    }
  });

  // Get all illustrations for Aunt Esra
  app.get('/api/illustrations', async (req, res) => {
    try {
      const illustrations = await dbAdapter.getIllustrations();
      res.json(illustrations);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'خطا در دریافت آثار تصویرسازی مربی' });
    }
  });

  // Get all artistic courses
  app.get('/api/courses', async (req, res) => {
    try {
      const courses = await dbAdapter.getCourses();
      res.json(courses);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'خطا در دریافت دوره‌های فعال' });
    }
  });

  // Register parent/child for a selected class workshop
  app.post('/api/courses/:id/register', async (req, res) => {
    const courseId = parseInt(req.params.id);
    const { studentName, parentName, email, phone, paymentMethod, receiptImage } = req.body;

    if (!studentName || !parentName || !phone) {
      return res.status(400).json({ error: 'لطفاً نام هنرجو، نام والدین و شماره تماس را وارد کنید.' });
    }

    try {
      const course = await dbAdapter.getCourseById(courseId);
      if (!course) {
        return res.status(404).json({ error: 'دوره مورد نظر یافت نشد.' });
      }

      // Compute current confirmed registrations to safeguard capacity limits
      const currentConfirmed = await dbAdapter.getConfirmedRegistrationsCount(courseId);
      if (currentConfirmed >= Number(course.maxStudents)) {
        return res.status(400).json({ error: 'متاسفانه ظرفیت این دوره تکمیل شده است.' });
      }

      const info = await dbAdapter.addRegistration({
        courseId,
        studentName,
        parentName,
        email: email || '',
        phone,
        paymentMethod: paymentMethod || 'online',
        receiptImage: receiptImage || null
      });

      res.json({
        success: true,
        registrationId: info.lastInsertRowid,
        message: 'ثبت‌نام اولیه با موفقیت انجام شد. جهت پرداخت نهایی و تایید حضور با شما تماس گرفته می‌شود.',
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'خطا در عملیات ثبت‌نام کلاس ثبت گردید' });
    }
  });

  // Send a custom support message to Aunt Esra
  app.post('/api/messages', async (req, res) => {
    const { senderName, email, message } = req.body;
    if (!senderName || !email || !message) {
      return res.status(400).json({ error: 'پر کردن فیلدهای نام، ایمیل و پیام الزامی است.' });
    }

    try {
      await dbAdapter.addMessage({ senderName, email, message });
      res.json({ success: true, message: 'پیام شما نقاشی شد و به دست خانم هنر رسید! به زودی پاسخ می‌دهم.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'خطا در ارسال پیام به سیستم مرکزی' });
    }
  });

  // Submit a public canvas drawing artwork directly to the gallery listing
  app.post('/api/artworks/submit', async (req, res) => {
    const { title, description, imageUrl, studentName, studentAge } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ error: 'تصویر نقاشی وجود ندارد!' });
    }

    try {
      const info = await dbAdapter.addArtwork({
        title: title || 'نقاشی جادویی من',
        description: description || 'کشیده شده در بوم نقاشی جادویی خانم هنر ✨',
        category: '🎨 نقاشی جادویی کودکان',
        imageUrl,
        studentName: studentName || 'کودک خلاق',
        studentAge: studentAge || ''
      });

      res.json({
        success: true,
        id: info.lastInsertRowid,
        message: 'نقاشی قشنگت با موفقیت به دست خانم هنر (اسراء چاوشی) رسید و در گالری ثبت شد! 🎉'
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'خطا در ثبت و ارسال نقاشی خلاقانه کودک' });
    }
  });

  // --- PROTECTED ADMIN API ROUTES ---

  // Admin Verification Panel Login
  app.post('/api/admin/login', async (req, res) => {
    const { password } = req.body;

    try {
      const adminPassword = await dbAdapter.getAdminPassword();
      if (password !== adminPassword) {
        return res.status(401).json({ error: 'رمز عبور وارد شده نادرست است.' });
      }
      res.json({ success: true, token: 'session_token_child_art_academy', message: 'خوش آمدید خانم هنر عزیز!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'خطا در فرآیند احراز هویت ادمین' });
    }
  });

  // Calculate high-fidelity dashboard metrics
  app.get('/api/admin/stats', requireAdmin, async (req, res) => {
    try {
      const stats = await dbAdapter.getStats();
      res.json(stats);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'خطا در محاسبه آمارهای تحلیلی سیستم' });
    }
  });

  // --- Artworks Management ---
  app.post('/api/admin/artworks', requireAdmin, async (req, res) => {
    const { title, description, category, imageUrl, studentName, studentAge } = req.body;
    if (!title || !category || !imageUrl) {
      return res.status(400).json({ error: 'عنوان، دسته‌بندی و تصویر اثر الزامی هستند.' });
    }

    try {
      const info = await dbAdapter.addArtwork({
        title,
        description: description || '',
        category,
        imageUrl,
        studentName: studentName || 'هنرجوی عزیز',
        studentAge: studentAge || ''
      });
      res.json({ success: true, id: info.lastInsertRowid, message: 'اثر هنری جدید با موفقیت بارگذاری شد.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'خطا در ذخیره اثر هنری گالری خلاق' });
    }
  });

  app.put('/api/admin/artworks/:id', requireAdmin, async (req, res) => {
    const artId = parseInt(req.params.id);
    const { title, description, category, imageUrl, studentName, studentAge } = req.body;

    if (!title || !category) {
      return res.status(400).json({ error: 'عنوان و دسته‌بندی الزامی هستند.' });
    }

    try {
      await dbAdapter.updateArtwork(artId, {
        title,
        description: description || '',
        category,
        imageUrl,
        studentName: studentName || 'هنرجوی عزیز',
        studentAge: studentAge || ''
      });
      res.json({ success: true, message: 'اثر هنری با موفقیت ویرایش شد.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'خطا در اعمال ویرایش اثر هنری' });
    }
  });

  app.delete('/api/admin/artworks/:id', requireAdmin, async (req, res) => {
    const artId = parseInt(req.params.id);
    try {
      await dbAdapter.deleteArtwork(artId);
      res.json({ success: true, message: 'اثر هنری با موفقیت حذف شد.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'خطا در حذف اثر هنری مربوطه' });
    }
  });

  // --- Illustrations Management (Aunt Esra's original works) ---
  app.post('/api/admin/illustrations', requireAdmin, async (req, res) => {
    const { title, description, imageUrl } = req.body;
    if (!title || !imageUrl) {
      return res.status(400).json({ error: 'وارد کردن عنوان و تصویر اثر تصویرسازی مربی الزامی است.' });
    }

    try {
      const info = await dbAdapter.addIllustration({ title, description: description || '', imageUrl });
      res.json({ success: true, id: info.lastInsertRowid, message: 'اثر تصویرسازی جدید مربی با موفقیت ثبت شد.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'خطا در ذخیره‌سازی اثر تصویرسازی مربی' });
    }
  });

  app.put('/api/admin/illustrations/:id', requireAdmin, async (req, res) => {
    const illId = parseInt(req.params.id);
    const { title, description, imageUrl } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'عنوان الزامی است.' });
    }

    try {
      await dbAdapter.updateIllustration(illId, { title, description: description || '', imageUrl });
      res.json({ success: true, message: 'اثر تصویرسازی مربی با موفقیت ویرایش شد.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'خطا در ویرایش اثر تصویرسازی مربی' });
    }
  });

  app.delete('/api/admin/illustrations/:id', requireAdmin, async (req, res) => {
    const illId = parseInt(req.params.id);
    try {
      await dbAdapter.deleteIllustration(illId);
      res.json({ success: true, message: 'اثر تصویرسازی مربی با موفقیت حذف شد.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'خطا در حذف اثر تصویرسازی مربی' });
    }
  });

  // --- Courses Management ---
  app.post('/api/admin/courses', requireAdmin, async (req, res) => {
    const { title, description, ageGroup, price, startDate, maxStudents, imageUrl } = req.body;
    if (!title || !description || !ageGroup || isNaN(price) || !startDate || isNaN(maxStudents) || !imageUrl) {
      return res.status(400).json({ error: 'پر کردن تمامی اطلاعات فیلدهای دوره هنری الزامی است.' });
    }

    try {
      const info = await dbAdapter.addCourse({
        title,
        description,
        ageGroup,
        price: parseInt(price),
        startDate,
        maxStudents: parseInt(maxStudents),
        imageUrl
      });
      res.json({ success: true, id: info.lastInsertRowid, message: 'دوره کلاس خلاقانه جدید با موفقیت ایجاد شد.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'خطا در ایجاد دوره کارگاهی جدید' });
    }
  });

  app.put('/api/admin/courses/:id', requireAdmin, async (req, res) => {
    const courseId = parseInt(req.params.id);
    const { title, description, ageGroup, price, startDate, maxStudents, imageUrl, active } = req.body;

    try {
      await dbAdapter.updateCourse(courseId, {
        title,
        description,
        ageGroup,
        price: parseInt(price),
        startDate,
        maxStudents: parseInt(maxStudents),
        imageUrl,
        active: active !== undefined ? Number(active) : 1
      });
      res.json({ success: true, message: 'مشخصات دوره با موفقیت ویرایش گردید.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'خطا در ذخیره بروزرسانی‌های کلاس کارگاهی' });
    }
  });

  app.delete('/api/admin/courses/:id', requireAdmin, async (req, res) => {
    const courseId = parseInt(req.params.id);
    try {
      await dbAdapter.deleteCourse(courseId);
      res.json({ success: true, message: 'دوره کلاس با موفقیت حذف شد.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'خطا در حذف گالری کارگاهی کلاس' });
    }
  });

  // --- Registrations Management ---
  app.get('/api/admin/registrations', requireAdmin, async (req, res) => {
    try {
      const registrations = await dbAdapter.getRegistrations();
      res.json(registrations);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'خطا در واکشی لیست ثبت‌نام‌ها' });
    }
  });

  app.put('/api/admin/registrations/:id', requireAdmin, async (req, res) => {
    const regId = parseInt(req.params.id);
    const { status, amountPaid } = req.body;

    try {
      await dbAdapter.updateRegistration(regId, status, parseInt(amountPaid || 0));
      res.json({ success: true, message: 'وضعیت ثبت‌نام با موفقیت بروزرسانی شد.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'خطا در ثبت بروزرسانی فاکتور هنرجو' });
    }
  });

  // --- Messages & Support (with Send File Attachments) ---
  app.get('/api/admin/messages', requireAdmin, async (req, res) => {
    try {
      const messages = await dbAdapter.getMessages();
      res.json(messages);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'خطا در دریافت پیام‌ها از پایگاه داده' });
    }
  });

  app.post('/api/admin/messages/:id/reply', requireAdmin, async (req, res) => {
    const msgId = parseInt(req.params.id);
    const { reply, replyAttachment, replyAttachmentName } = req.body;

    if (!reply) {
      return res.status(400).json({ error: 'وارد کردن متن پاسخ الزامی است.' });
    }

    try {
      await dbAdapter.replyMessage(msgId, {
        reply,
        replyAttachment: replyAttachment || null,
        replyAttachmentName: replyAttachmentName || null
      });
      res.json({ success: true, message: 'پاسخ و فایل پیوست برای هنرجو ثبت و ارسال گردید.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'خطا در ثبت پاسخ به پیام هنرجو' });
    }
  });

  // --- Settings Update (Biography, Name, etc.) ---
  app.put('/api/admin/settings', requireAdmin, async (req, res) => {
    const { 
      artistName, artistTitle, biography, contactEmail, contactPhone, 
      profileImage, adminPassword, siteTitle, cardNo, cardHolder, bankName 
    } = req.body;

    try {
      const updatePayload: Record<string, any> = {};
      if (artistName !== undefined) updatePayload.artistName = artistName;
      if (artistTitle !== undefined) updatePayload.artistTitle = artistTitle;
      if (siteTitle !== undefined) updatePayload.siteTitle = siteTitle;
      if (biography !== undefined) updatePayload.biography = biography;
      if (contactEmail !== undefined) updatePayload.contactEmail = contactEmail;
      if (contactPhone !== undefined) updatePayload.contactPhone = contactPhone;
      if (profileImage !== undefined) updatePayload.profileImage = profileImage;
      if (adminPassword !== undefined) updatePayload.adminPassword = adminPassword;
      if (cardNo !== undefined) updatePayload.cardNo = cardNo;
      if (cardHolder !== undefined) updatePayload.cardHolder = cardHolder;
      if (bankName !== undefined) updatePayload.bankName = bankName;

      await dbAdapter.updateSettings(updatePayload);
      res.json({ success: true, message: 'تنظیمات پروفایل و بیوگرافی با موفقیت ذخیره گردید.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'خطا در ذخیره‌سازی داده‌های اصلی تنظیمات' });
    }
  });

  // --- SQLite/Supabase Backup & Restore Capabilities ---

  // Export database backup as complete database json structure
  app.get('/api/admin/database/backup', requireAdmin, async (req, res) => {
    try {
      const data = await dbAdapter.getBackupData();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=backup-children-art-${new Date().toISOString().split('T')[0]}.json`);
      res.send(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'خطا در ایجاد بک‌آپ اضطراری' });
    }
  });

  // Restore database backup from uploaded json structure
  app.post('/api/admin/database/restore', requireAdmin, async (req, res) => {
    const { backupData } = req.body;
    if (!backupData || typeof backupData !== 'object') {
      return res.status(400).json({ error: 'فایل بک‌آپ نامعتبر است.' });
    }

    try {
      await dbAdapter.restoreBackupData(backupData);
      res.json({ success: true, message: 'پایگاه داده با موفقیت با نسخه بک‌آپ بازنشانی شد.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'خطا در بازنشانی پایگاه داده. ساختار فایل همخوانی ندارد.' });
    }
  });


  // --- Vite & Client Hot Serving Middleware ---

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
