import { createClient } from '@supabase/supabase-js';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

export const isSupabase = !!(supabaseUrl && supabaseKey);

console.log(`Database Adapter: Running on ${isSupabase ? '☁️ Supabase Cloud (PostgreSQL)' : '💾 Local SQLite'} database.`);

// Initialize SQLite Client
let _sqliteDb: Database.Database | null = null;
function getSqliteDb() {
  if (!_sqliteDb) {
    _sqliteDb = new Database('database.sqlite');
  }
  return _sqliteDb;
}

// Initialize Supabase Client
const supabase = isSupabase ? createClient(supabaseUrl!, supabaseKey!) : null;

export const dbAdapter = {
  async initDatabase() {
    if (isSupabase) {
      console.log('Supabase DB Client initialized.');
      // Auto-check tables or assume pre-created by sql setup.
    } else {
      const db = getSqliteDb();
      db.exec(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT
        );

        CREATE TABLE IF NOT EXISTS artworks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          category TEXT NOT NULL,
          imageUrl TEXT NOT NULL,
          createdAt TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS illustrations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          imageUrl TEXT NOT NULL,
          createdAt TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS courses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          ageGroup TEXT NOT NULL,
          price INTEGER NOT NULL,
          startDate TEXT NOT NULL,
          maxStudents INTEGER NOT NULL,
          imageUrl TEXT NOT NULL,
          active INTEGER DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS registrations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          courseId INTEGER NOT NULL,
          studentName TEXT NOT NULL,
          parentName TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT NOT NULL,
          status TEXT DEFAULT 'pending',
          amountPaid INTEGER DEFAULT 0,
          createdAt TEXT NOT NULL,
          FOREIGN KEY (courseId) REFERENCES courses (id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          senderName TEXT NOT NULL,
          email TEXT NOT NULL,
          message TEXT NOT NULL,
          reply DEFAULT NULL,
          replyAttachment TEXT DEFAULT NULL,
          replyAttachmentName TEXT DEFAULT NULL,
          status TEXT DEFAULT 'unread',
          createdAt TEXT NOT NULL,
          repliedAt TEXT DEFAULT NULL
        );
      `);

      // Alter columns gracefully for SQLite
      try { db.exec(`ALTER TABLE artworks ADD COLUMN studentName TEXT DEFAULT 'هنرجوی عزیز'`); } catch (e) {}
      try { db.exec(`ALTER TABLE artworks ADD COLUMN studentAge TEXT DEFAULT ''`); } catch (e) {}
      try { db.exec(`ALTER TABLE registrations ADD COLUMN paymentMethod TEXT DEFAULT 'online'`); } catch (e) {}
      try { db.exec(`ALTER TABLE registrations ADD COLUMN receiptImage TEXT DEFAULT NULL`); } catch (e) {}

      // Seed if settings are empty
      const hasSettings = db.prepare('SELECT COUNT(*) as count FROM settings').get() as { count: number };
      if (hasSettings.count === 0) {
        const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
        stmt.run('artistName', 'خانم هنر (اسراء چاوشی)');
        stmt.run('artistTitle', 'تصویرگر و مربی هنر خلاق کودکان');
        stmt.run('siteTitle', 'دنیای جادویی خانم هنر (اسراء چاوشی)');
        stmt.run('biography', 'سلام به همه بچه‌های دنیای رنگارنگ! من خانم هنر (اسراء چاوشی) هستم، مربی هنری و نقاش عاشق دنیای شاد و تخیل زیبای شما کوچولوها. من سال‌هاست که در کنار کودکان با دست‌های قشنگشون نقاشی خلاق، آبرنگ، کار کلاژ و کاردستی آموزش می‌دم و بهشون کمک می‌کنم رویاهای خوشگلشون رو روی بوم زنده کنند. هنر زبان قلب بچه‌هاست و ما اینجا خلاقیتمون رو جشن می‌گیریم!');
        stmt.run('profileImage', '');
        stmt.run('contactEmail', 'Sayyedmehranzare@gmail.com');
        stmt.run('contactPhone', '۰۹۱۲۳۴۵۶۷۸۹');
        stmt.run('adminPassword', 'admin123');
        stmt.run('totpSecret', '');
        stmt.run('totpEnabled', '0');
        stmt.run('cardNo', '۶۰۳۷۹۹۱۸۱۲۳۴۵۶۷۸');
        stmt.run('cardHolder', 'اسراء چاوشی');
        stmt.run('bankName', 'بانک ملی ایران');

        // Artworks seed
        const insertArt = db.prepare('INSERT INTO artworks (title, description, category, imageUrl, studentName, studentAge, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)');
        insertArt.run('دایناسور مهربان و تنبل', 'یک نقاشی شاد کودکانه با تکنیک مدادرنگی و آبرنگ که داستان یک دایناسور دوست‌داشتنی را روایت می‌کند که عاشق تمشک است.', 'مداد رنگی', 'placeholder-dino', 'راستین کریمی', '۶ ساله', new Date().toISOString());
        insertArt.run('سفر کرم ابریشم به ماه', 'یک اثر کلاژ خلاقانه با استفاده از کاغذهای رنگی بافت‌دار و خرده‌ریزه‌های پارچه که خلاقیت در تجسم داستان را نشان می‌دهد.', 'کلاژ و کاردستی', 'placeholder-caterpillar', 'نهال زارعی', '۵ ساله', new Date().toISOString());

        // Illustrations seed
        const insertIll = db.prepare('INSERT INTO illustrations (title, description, imageUrl, createdAt) VALUES (?, ?, ?, ?)');
        insertIll.run('پرواز بر فراز گل‌ها', 'تصویرگری فانتزی و رویایی با گنجشک‌های سخنگو کار شده در کتاب صوتی داستان‌های شب.', 'placeholder-fly', new Date().toISOString());

        // Courses seed
        const insertCourse = db.prepare('INSERT INTO courses (title, description, ageGroup, price, startDate, maxStudents, imageUrl, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        insertCourse.run('کارگاه جادویی نقاشی خلاق و تخیل', 'در این دوره شاد، کودکان یاد می‌گیرند فراتر از الگوها فکر کنند. با بازی‌ها، قصه‌گویی و استفاده از انگشتان، کلاژ و گواش، ذهن خلاق خود را شکوفا می‌کنیم.', '۴ تا ۷ سال', 450000, '۱ تیر ۱۴۰۵', 12, 'course-creative', 1);
        insertCourse.run('آموزش تکنیک‌های فانتزی تصویرگری کتاب کودک', 'یک دوره شگفت‌انگیز برای کودکان بزرگ‌تر که دوست دارند داستان‌های خودشان را بنویسند و نقاشی کنند. آموزش کار با آبرنگ، روان‌نویس و رنگ‌آمیزی خلاق.', '۸ تا ۱۲ سال', 680000, '۵ تیر ۱۴۰۵', 10, 'course-illustration', 1);

        // Registrations seed
        db.prepare('INSERT INTO registrations (courseId, studentName, parentName, email, phone, status, amountPaid, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
          .run(1, 'آرتین کریمی', 'احسان کریمی', 'artin@gmail.com', '۰۹۱۲۲۲۲۳۳۴۴', 'confirmed', 450000, new Date().toISOString());

        // Messages seed
        db.prepare('INSERT INTO messages (senderName, email, message, createdAt) VALUES (?, ?, ?, ?)')
          .run('کیمیا رضایی', 'kimia@yahoo.com', 'سلام خانم هنر عزیز. وسایل مورد نیاز کلاس نقاشی خلاق چیا هستند؟ پسرم ۴ سالشه، آیا گواش حساسیت ایجاد نمی‌کنه برای پوستش؟ ممنون', new Date().toISOString());
      }
    }
  },

  // --- Settings ---
  async getSettings(): Promise<any> {
    if (isSupabase) {
      const { data, error } = await supabase!.from('settings').select('*');
      if (error) throw error;
      const profile: Record<string, any> = {};
      (data || []).forEach(r => {
        profile[r.key] = r.value;
      });
      return profile;
    } else {
      const db = getSqliteDb();
      const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
      const profile: Record<string, any> = {};
      rows.forEach(r => {
        profile[r.key] = r.value;
      });
      return profile;
    }
  },

  async getAdminPassword(): Promise<string> {
    if (isSupabase) {
      const { data, error } = await supabase!.from('settings').select('value').eq('key', 'adminPassword').single();
      if (error) {
        // Fallback default adminPassword
        return 'admin123';
      }
      return data?.value || 'admin123';
    } else {
      const db = getSqliteDb();
      try {
        const row = db.prepare("SELECT value FROM settings WHERE key = 'adminPassword'").get() as { value: string };
        return row?.value || 'admin123';
      } catch (e) {
        return 'admin123';
      }
    }
  },

  async updateSettings(settings: Record<string, any>): Promise<void> {
    if (isSupabase) {
      const upserts = Object.keys(settings).map(key => ({
        key,
        value: settings[key] !== null && settings[key] !== undefined ? String(settings[key]) : ''
      }));
      if (upserts.length > 0) {
        const { error } = await supabase!.from('settings').upsert(upserts, { onConflict: 'key' });
        if (error) throw error;
      }
    } else {
      const db = getSqliteDb();
      db.transaction(() => {
        const stmt = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
        Object.keys(settings).forEach(key => {
          if (settings[key] !== undefined) {
            stmt.run(key, settings[key] !== null ? String(settings[key]) : '');
          }
        });
      })();
    }
  },

  // --- Artworks ---
  async getArtworks(): Promise<any[]> {
    if (isSupabase) {
      const { data, error } = await supabase!.from('artworks').select('*').order('id', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      const db = getSqliteDb();
      return db.prepare('SELECT * FROM artworks ORDER BY id DESC').all() as any[];
    }
  },

  async addArtwork(art: { title: string; description: string; category: string; imageUrl: string; studentName?: string; studentAge?: string }): Promise<any> {
    const createdAt = new Date().toISOString();
    if (isSupabase) {
      const { data, error } = await supabase!.from('artworks').insert([{
        title: art.title,
        description: art.description,
        category: art.category,
        imageUrl: art.imageUrl,
        studentName: art.studentName || 'هنرجوی عزیز',
        studentAge: art.studentAge || '',
        createdAt
      }]).select();
      if (error) throw error;
      return { lastInsertRowid: data?.[0]?.id };
    } else {
      const db = getSqliteDb();
      const info = db.prepare(`
        INSERT INTO artworks (title, description, category, imageUrl, studentName, studentAge, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(art.title, art.description, art.category, art.imageUrl, art.studentName || 'هنرجوی عزیز', art.studentAge || '', createdAt);
      return { lastInsertRowid: info.lastInsertRowid };
    }
  },

  async updateArtwork(id: number, art: { title: string; description: string; category: string; imageUrl?: string; studentName?: string; studentAge?: string }): Promise<void> {
    if (isSupabase) {
      const updatePayload: any = {
        title: art.title,
        description: art.description,
        category: art.category,
        studentName: art.studentName,
        studentAge: art.studentAge,
      };
      if (art.imageUrl) {
        updatePayload.imageUrl = art.imageUrl;
      }
      const { error } = await supabase!.from('artworks').update(updatePayload).eq('id', id);
      if (error) throw error;
    } else {
      const db = getSqliteDb();
      if (art.imageUrl) {
        db.prepare(`
          UPDATE artworks SET title = ?, description = ?, category = ?, imageUrl = ?, studentName = ?, studentAge = ?
          WHERE id = ?
        `).run(art.title, art.description, art.category, art.imageUrl, art.studentName || 'هنرجوی عزیز', art.studentAge || '', id);
      } else {
        db.prepare(`
          UPDATE artworks SET title = ?, description = ?, category = ?, studentName = ?, studentAge = ?
          WHERE id = ?
        `).run(art.title, art.description, art.category, art.studentName || 'هنرجوی عزیز', art.studentAge || '', id);
      }
    }
  },

  async deleteArtwork(id: number): Promise<void> {
    if (isSupabase) {
      const { error } = await supabase!.from('artworks').delete().eq('id', id);
      if (error) throw error;
    } else {
      const db = getSqliteDb();
      db.prepare('DELETE FROM artworks WHERE id = ?').run(id);
    }
  },

  // --- Illustrations ---
  async getIllustrations(): Promise<any[]> {
    if (isSupabase) {
      const { data, error } = await supabase!.from('illustrations').select('*').order('id', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      const db = getSqliteDb();
      return db.prepare('SELECT * FROM illustrations ORDER BY id DESC').all() as any[];
    }
  },

  async addIllustration(ill: { title: string; description: string; imageUrl: string }): Promise<any> {
    const createdAt = new Date().toISOString();
    if (isSupabase) {
      const { data, error } = await supabase!.from('illustrations').insert([{
        title: ill.title,
        description: ill.description,
        imageUrl: ill.imageUrl,
        createdAt
      }]).select();
      if (error) throw error;
      return { lastInsertRowid: data?.[0]?.id };
    } else {
      const db = getSqliteDb();
      const info = db.prepare(`
        INSERT INTO illustrations (title, description, imageUrl, createdAt)
        VALUES (?, ?, ?, ?)
      `).run(ill.title, ill.description, ill.imageUrl, createdAt);
      return { lastInsertRowid: info.lastInsertRowid };
    }
  },

  async updateIllustration(id: number, ill: { title: string; description: string; imageUrl?: string }): Promise<void> {
    if (isSupabase) {
      const updatePayload: any = {
        title: ill.title,
        description: ill.description
      };
      if (ill.imageUrl) {
        updatePayload.imageUrl = ill.imageUrl;
      }
      const { error } = await supabase!.from('illustrations').update(updatePayload).eq('id', id);
      if (error) throw error;
    } else {
      const db = getSqliteDb();
      if (ill.imageUrl) {
        db.prepare(`
          UPDATE illustrations SET title = ?, description = ?, imageUrl = ?
          WHERE id = ?
        `).run(ill.title, ill.description, ill.imageUrl, id);
      } else {
        db.prepare(`
          UPDATE illustrations SET title = ?, description = ?
          WHERE id = ?
        `).run(ill.title, ill.description, id);
      }
    }
  },

  async deleteIllustration(id: number): Promise<void> {
    if (isSupabase) {
      const { error } = await supabase!.from('illustrations').delete().eq('id', id);
      if (error) throw error;
    } else {
      const db = getSqliteDb();
      db.prepare('DELETE FROM illustrations WHERE id = ?').run(id);
    }
  },

  // --- Courses ---
  async getCourses(): Promise<any[]> {
    if (isSupabase) {
      const { data: courses, error } = await supabase!.from('courses').select('*').order('id', { ascending: false });
      if (error) throw error;

      const { data: regs, error: regsError } = await supabase!.from('registrations').select('courseId').eq('status', 'confirmed');
      if (regsError) throw regsError;

      return (courses || []).map(course => {
        const count = (regs || []).filter(r => Number(r.courseId) === Number(course.id)).length;
        return {
          ...course,
          registrationCount: count
        };
      });
    } else {
      const db = getSqliteDb();
      return db.prepare(`
        SELECT c.*, COUNT(r.id) as registrationCount
        FROM courses c
        LEFT JOIN registrations r ON c.id = r.courseId AND r.status = 'confirmed'
        GROUP BY c.id
        ORDER BY c.id DESC
      `).all() as any[];
    }
  },

  async getCourseById(id: number): Promise<any> {
    if (isSupabase) {
      const { data, error } = await supabase!.from('courses').select('*').eq('id', id).single();
      if (error) return null;
      return data;
    } else {
      const db = getSqliteDb();
      return db.prepare('SELECT * FROM courses WHERE id = ?').get(id);
    }
  },

  async addCourse(course: { title: string; description: string; ageGroup: string; price: number; startDate: string; maxStudents: number; imageUrl: string }): Promise<any> {
    if (isSupabase) {
      const { data, error } = await supabase!.from('courses').insert([{
        title: course.title,
        description: course.description,
        ageGroup: course.ageGroup,
        price: course.price,
        startDate: course.startDate,
        maxStudents: course.maxStudents,
        imageUrl: course.imageUrl,
        active: 1
      }]).select();
      if (error) throw error;
      return { lastInsertRowid: data?.[0]?.id };
    } else {
      const db = getSqliteDb();
      const info = db.prepare(`
        INSERT INTO courses (title, description, ageGroup, price, startDate, maxStudents, imageUrl, active)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
      `).run(course.title, course.description, course.ageGroup, course.price, course.startDate, course.maxStudents, course.imageUrl);
      return { lastInsertRowid: info.lastInsertRowid };
    }
  },

  async updateCourse(id: number, course: { title: string; description: string; ageGroup: string; price: number; startDate: string; maxStudents: number; imageUrl?: string; active: number }): Promise<void> {
    if (isSupabase) {
      const updatePayload: any = {
        title: course.title,
        description: course.description,
        ageGroup: course.ageGroup,
        price: course.price,
        startDate: course.startDate,
        maxStudents: course.maxStudents,
        active: course.active
      };
      if (course.imageUrl) {
        updatePayload.imageUrl = course.imageUrl;
      }
      const { error } = await supabase!.from('courses').update(updatePayload).eq('id', id);
      if (error) throw error;
    } else {
      const db = getSqliteDb();
      if (course.imageUrl) {
        db.prepare(`
          UPDATE courses SET title = ?, description = ?, ageGroup = ?, price = ?, startDate = ?, maxStudents = ?, imageUrl = ?, active = ?
          WHERE id = ?
        `).run(course.title, course.description, course.ageGroup, course.price, course.startDate, course.maxStudents, course.imageUrl, course.active, id);
      } else {
        db.prepare(`
          UPDATE courses SET title = ?, description = ?, ageGroup = ?, price = ?, startDate = ?, maxStudents = ?, active = ?
          WHERE id = ?
        `).run(course.title, course.description, course.ageGroup, course.price, course.startDate, course.maxStudents, course.active, id);
      }
    }
  },

  async deleteCourse(id: number): Promise<void> {
    if (isSupabase) {
      const { error } = await supabase!.from('courses').delete().eq('id', id);
      if (error) throw error;
    } else {
      const db = getSqliteDb();
      db.prepare('DELETE FROM courses WHERE id = ?').run(id);
    }
  },

  // --- Registrations ---
  async getConfirmedRegistrationsCount(courseId: number): Promise<number> {
    if (isSupabase) {
      const { data, error } = await supabase!.from('registrations')
        .select('id')
        .eq('courseId', courseId)
        .eq('status', 'confirmed');
      if (error) throw error;
      return data?.length || 0;
    } else {
      const db = getSqliteDb();
      const row = db.prepare("SELECT COUNT(*) as count FROM registrations WHERE courseId = ? AND status = 'confirmed'").get(courseId) as { count: number };
      return row?.count || 0;
    }
  },

  async addRegistration(reg: { courseId: number; studentName: string; parentName: string; email: string; phone: string; paymentMethod: string; receiptImage: string | null }): Promise<any> {
    const createdAt = new Date().toISOString();
    if (isSupabase) {
      const { data, error } = await supabase!.from('registrations').insert([{
        courseId: reg.courseId,
        studentName: reg.studentName,
        parentName: reg.parentName,
        email: reg.email || '',
        phone: reg.phone,
        status: 'pending',
        amountPaid: 0,
        paymentMethod: reg.paymentMethod,
        receiptImage: reg.receiptImage,
        createdAt
      }]).select();
      if (error) throw error;
      return { lastInsertRowid: data?.[0]?.id };
    } else {
      const db = getSqliteDb();
      const info = db.prepare(`
        INSERT INTO registrations (courseId, studentName, parentName, email, phone, status, amountPaid, paymentMethod, receiptImage, createdAt)
        VALUES (?, ?, ?, ?, ?, 'pending', 0, ?, ?, ?)
      `).run(reg.courseId, reg.studentName, reg.parentName, reg.email, reg.phone, reg.paymentMethod, reg.receiptImage, createdAt);
      return { lastInsertRowid: info.lastInsertRowid };
    }
  },

  async getRegistrations(): Promise<any[]> {
    if (isSupabase) {
      // Fetch registrations and courses
      const { data: regs, error } = await supabase!.from('registrations').select('*').order('id', { ascending: false });
      if (error) throw error;
      const { data: courses, error: coursesError } = await supabase!.from('courses').select('id, title, price');
      if (coursesError) throw coursesError;

      return (regs || []).map(r => {
        const c = (courses || []).find(course => Number(course.id) === Number(r.courseId));
        return {
          ...r,
          courseTitle: c ? c.title : 'دوره نامشخص',
          coursePrice: c ? c.price : 0
        };
      });
    } else {
      const db = getSqliteDb();
      return db.prepare(`
        SELECT r.*, c.title as courseTitle, c.price as coursePrice
        FROM registrations r
        JOIN courses c ON r.courseId = c.id
        ORDER BY r.id DESC
      `).all() as any[];
    }
  },

  async updateRegistration(id: number, status: string, amountPaid: number): Promise<void> {
    if (isSupabase) {
      const { error } = await supabase!.from('registrations').update({
        status,
        amountPaid
      }).eq('id', id);
      if (error) throw error;
    } else {
      const db = getSqliteDb();
      db.prepare(`
        UPDATE registrations SET status = ?, amountPaid = ?
        WHERE id = ?
      `).run(status, amountPaid, id);
    }
  },

  // --- Messages ---
  async addMessage(msg: { senderName: string; email: string; message: string }): Promise<void> {
    const createdAt = new Date().toISOString();
    if (isSupabase) {
      const { error } = await supabase!.from('messages').insert([{
        senderName: msg.senderName,
        email: msg.email,
        message: msg.message,
        createdAt,
        status: 'unread'
      }]);
      if (error) throw error;
    } else {
      const db = getSqliteDb();
      db.prepare(`
        INSERT INTO messages (senderName, email, message, createdAt)
        VALUES (?, ?, ?, ?)
      `).run(msg.senderName, msg.email, msg.message, createdAt);
    }
  },

  async getMessages(): Promise<any[]> {
    if (isSupabase) {
      const { data, error } = await supabase!.from('messages').select('*').order('id', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      const db = getSqliteDb();
      return db.prepare('SELECT * FROM messages ORDER BY id DESC').all() as any[];
    }
  },

  async replyMessage(id: number, reply: { reply: string; replyAttachment: string | null; replyAttachmentName: string | null }): Promise<void> {
    const repliedAt = new Date().toISOString();
    if (isSupabase) {
      const { error } = await supabase!.from('messages').update({
        reply: reply.reply,
        replyAttachment: reply.replyAttachment,
        replyAttachmentName: reply.replyAttachmentName,
        status: 'replied',
        repliedAt
      }).eq('id', id);
      if (error) throw error;
    } else {
      const db = getSqliteDb();
      db.prepare(`
        UPDATE messages
        SET reply = ?, replyAttachment = ?, replyAttachmentName = ?, status = 'replied', repliedAt = ?
        WHERE id = ?
      `).run(reply.reply, reply.replyAttachment, reply.replyAttachmentName, repliedAt, id);
    }
  },

  // --- Admin Stats ---
  async getStats(): Promise<any> {
    if (isSupabase) {
      const { data: regs, error: regsError } = await supabase!.from('registrations').select('amountPaid, courseId');
      if (regsError) throw regsError;
      
      const { data: arts, error: artsError } = await supabase!.from('artworks').select('id');
      if (artsError) throw artsError;

      const { data: courses, error: coursesError } = await supabase!.from('courses').select('id, title');
      if (coursesError) throw coursesError;

      const totalRevenue = (regs || []).reduce((sum, r) => sum + (r.amountPaid || 0), 0);
      const totalRegistrations = (regs || []).length;
      const totalArtworks = (arts || []).length;
      const totalCourses = (courses || []).length;

      const revenueByCourse = (courses || []).map(c => {
        const matchingRegs = (regs || []).filter(r => Number(r.courseId) === Number(c.id));
        const revenue = matchingRegs.reduce((sum, r) => sum + (r.amountPaid || 0), 0);
        return {
          courseTitle: c.title,
          revenue,
          registrations: matchingRegs.length
        };
      });

      return {
        totalRevenue,
        totalRegistrations,
        totalArtworks,
        totalCourses,
        revenueByCourse
      };
    } else {
      const db = getSqliteDb();
      const revenueRow = db.prepare("SELECT SUM(amountPaid) as total FROM registrations").get() as { total: number | null };
      const totalRevenue = revenueRow.total || 0;

      const registrationsCount = db.prepare("SELECT COUNT(*) as count FROM registrations").get() as { count: number };
      const totalRegistrations = registrationsCount.count;

      const artworkCount = db.prepare("SELECT COUNT(*) as count FROM artworks").get() as { count: number };
      const courseCount = db.prepare("SELECT COUNT(*) as count FROM courses").get() as { count: number };

      const revenueByCourse = db.prepare(`
        SELECT c.title as courseTitle, SUM(r.amountPaid) as revenue, COUNT(r.id) as registrations
        FROM courses c
        LEFT JOIN registrations r ON c.id = r.courseId
        GROUP BY c.id
      `).all() as any[];

      return {
        totalRevenue,
        totalRegistrations,
        totalArtworks: artworkCount.count,
        totalCourses: courseCount.count,
        revenueByCourse: revenueByCourse.map(item => ({
          courseTitle: item.courseTitle,
          revenue: item.revenue || 0,
          registrations: item.registrations || 0,
        })),
      };
    }
  },

  // --- Backup & Restore ---
  async getBackupData(): Promise<any> {
    if (isSupabase) {
      const tables = ['settings', 'artworks', 'courses', 'registrations', 'messages'];
      const data: Record<string, any[]> = {};
      
      for (const table of tables) {
        const { data: rows, error } = await supabase!.from(table).select('*');
        if (error) throw error;
        data[table] = rows || [];
      }
      return data;
    } else {
      const db = getSqliteDb();
      const tables = ['settings', 'artworks', 'courses', 'registrations', 'messages'];
      const data: Record<string, any[]> = {};
      
      tables.forEach(table => {
        data[table] = db.prepare(`SELECT * FROM ${table}`).all();
      });
      return data;
    }
  },

  async restoreBackupData(backupData: any): Promise<void> {
    if (isSupabase) {
      // Wipe tables then bulk inserts
      if (backupData.settings) {
        await supabase!.from('settings').delete().gte('key', '');
        const { error } = await supabase!.from('settings').insert(backupData.settings);
        if (error) throw error;
      }
      if (backupData.artworks) {
        await supabase!.from('artworks').delete().gte('id', 0);
        const { error } = await supabase!.from('artworks').insert(backupData.artworks);
        if (error) throw error;
      }
      if (backupData.courses) {
        await supabase!.from('courses').delete().gte('id', 0);
        const { error } = await supabase!.from('courses').insert(backupData.courses);
        if (error) throw error;
      }
      if (backupData.registrations) {
        await supabase!.from('registrations').delete().gte('id', 0);
        const { error } = await supabase!.from('registrations').insert(backupData.registrations);
        if (error) throw error;
      }
      if (backupData.messages) {
        await supabase!.from('messages').delete().gte('id', 0);
        const { error } = await supabase!.from('messages').insert(backupData.messages);
        if (error) throw error;
      }
    } else {
      const db = getSqliteDb();
      db.transaction(() => {
        if (backupData.settings) {
          db.prepare('DELETE FROM settings').run();
          const stmt = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
          backupData.settings.forEach((row: any) => stmt.run(row.key, row.value));
        }
        if (backupData.artworks) {
          db.prepare('DELETE FROM artworks').run();
          const stmt = db.prepare('INSERT INTO artworks (id, title, description, category, imageUrl, studentName, studentAge, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
          backupData.artworks.forEach((row: any) => stmt.run(row.id, row.title, row.description, row.category, row.imageUrl, row.studentName || 'هنرجوی عزیز', row.studentAge || '', row.createdAt));
        }
        if (backupData.courses) {
          db.prepare('DELETE FROM courses').run();
          const stmt = db.prepare('INSERT INTO courses (id, title, description, ageGroup, price, startDate, maxStudents, imageUrl, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
          backupData.courses.forEach((row: any) => stmt.run(row.id, row.title, row.description, row.ageGroup, row.price, row.startDate, row.maxStudents, row.imageUrl, row.active));
        }
        if (backupData.registrations) {
          db.prepare('DELETE FROM registrations').run();
          const stmt = db.prepare('INSERT INTO registrations (id, courseId, studentName, parentName, email, phone, status, amountPaid, paymentMethod, receiptImage, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
          backupData.registrations.forEach((row: any) => stmt.run(row.id, row.courseId, row.studentName, row.parentName, row.email, row.phone, row.status, row.amountPaid || 0, row.paymentMethod || 'online', row.receiptImage || null, row.createdAt));
        }
        if (backupData.messages) {
          db.prepare('DELETE FROM messages').run();
          const stmt = db.prepare('INSERT INTO messages (id, senderName, email, message, reply, replyAttachment, replyAttachmentName, status, createdAt, repliedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
          backupData.messages.forEach((row: any) => stmt.run(row.id, row.senderName, row.email, row.message, row.reply, row.replyAttachment, row.replyAttachmentName, row.status, row.createdAt, row.repliedAt));
        }
      })();
    }
  }
};
