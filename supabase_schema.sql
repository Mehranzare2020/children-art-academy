-- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
-- SUPABASE POSTGRESQL DATABASE SCHEMA
-- Aunt Esra's Magical Children Art Academy (دنیای جادویی خانم هنر)
-- 
-- Copy and paste this complete SQL script into your Supabase Dashboard
-- inside the "SQL Editor" tab to build all tables and pre-fill settings.
-- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

-- 1. Create table 'settings'
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
);

-- 2. Create table 'artworks'
CREATE TABLE IF NOT EXISTS artworks (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    imageUrl TEXT NOT NULL,
    studentName TEXT DEFAULT 'هنرجوی عزیز',
    studentAge TEXT DEFAULT '',
    createdAt TEXT NOT NULL
);

-- 3. Create table 'illustrations'
CREATE TABLE IF NOT EXISTS illustrations (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    imageUrl TEXT NOT NULL,
    createdAt TEXT NOT NULL
);

-- 4. Create table 'courses'
CREATE TABLE IF NOT EXISTS courses (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    ageGroup TEXT NOT NULL,
    price BIGINT NOT NULL,
    startDate TEXT NOT NULL,
    maxStudents INTEGER NOT NULL,
    imageUrl TEXT NOT NULL,
    active INT DEFAULT 1
);

-- 5. Create table 'registrations'
CREATE TABLE IF NOT EXISTS registrations (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    courseId BIGINT REFERENCES courses(id) ON DELETE CASCADE,
    studentName TEXT NOT NULL,
    parentName TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    amountPaid BIGINT DEFAULT 0,
    paymentMethod TEXT DEFAULT 'online',
    receiptImage TEXT,
    createdAt TEXT NOT NULL
);

-- 6. Create table 'messages'
CREATE TABLE IF NOT EXISTS messages (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    senderName TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    reply TEXT DEFAULT NULL,
    replyAttachment TEXT DEFAULT NULL,
    replyAttachmentName TEXT DEFAULT NULL,
    status TEXT DEFAULT 'unread',
    createdAt TEXT NOT NULL,
    repliedAt TEXT DEFAULT NULL
);


-- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
-- SEED INITIAL MAGICAL DEFAULT DATA
-- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

-- Seed default settings
INSERT INTO settings (key, value) VALUES
('artistName', 'خانم هنر (اسراء چاوشی)'),
('artistTitle', 'تصویرگر و مربی هنر خلاق کودکان'),
('siteTitle', 'دنیای جادویی خانم هنر (اسراء چاوشی)'),
('biography', 'سلام به همه بچه‌های دنیای رنگارنگ! من خانم هنر (اسراء چاوشی) هستم، مربی هنری و نقاش عاشق دنیای شاد و تخیل زیبای شما کوچولوها. من سال‌هاست که در کنار کودکان با دست‌های قشنگشون نقاشی خلاق، آبرنگ، کار کلاژ و کاردستی آموزش می‌دم و بهشون کمک می‌کنم رویاهای خوشگلشون رو روی بوم زنده کنند. هنر زبان قلب بچه‌هاست و ما اینجا خلاقیتمون رو جشن می‌گیریم!'),
('profileImage', ''),
('contactEmail', 'Sayyedmehranzare@gmail.com'),
('contactPhone', '۰۹۱۲۳۴۵۶۷۸۹'),
('adminPassword', 'admin123'),
('totpSecret', ''),
('totpEnabled', '0'),
('cardNo', '۶۰۳۷۹۹۱۸۱۲۳۴۵۶۷۸'),
('cardHolder', 'اسراء چاوشی'),
('bankName', 'بانک ملی ایران')
ON CONFLICT (key) DO NOTHING;

-- Seed default courses
INSERT INTO courses (title, description, ageGroup, price, startDate, maxStudents, imageUrl, active) VALUES
(
    'کارگاه جادویی نقاشی خلاق و تخیل', 
    'در این دوره شاد، کودکان یاد می‌گیرند فراتر از الگوها فکر کنند. با بازی‌ها، قصه‌گویی و استفاده از انگشتان، کلاژ و گواش، ذهن خلاق خود را شکوفا می‌کنیم.', 
    '۴ تا ۷ سال', 
    450000, 
    '۱ تیر ۱۴۰۵', 
    12, 
    'course-creative', 
    1
),
(
    'آموزش تکنیک‌های فانتزی تصویرگری کتاب کودک', 
    'یک دوره شگفت‌انگیز برای کودکان بزرگ‌تر که دوست دارند داستان‌های خودشان را بنویسند و نقاشی کنند. آموزش کار با آبرنگ، روان‌نویس و رنگ‌آمیزی خلاق.', 
    '۸ تا ۱۲ سال', 
    680000, 
    '۵ تیر ۱۴۰۵', 
    10, 
    'course-illustration', 
    1
);

-- Seed default artworks
INSERT INTO artworks (title, description, category, imageUrl, studentName, studentAge, createdAt) VALUES
(
    'دایناسور مهربان و تنبل', 
    'یک نقاشی شاد کودکانه با تکنیک مدادرنگی و آبرنگ که داستان یک دایناسور دوست‌داشتنی را روایت می‌کند که عاشق تمشک است.', 
    'مداد رنگی', 
    'placeholder-dino', 
    'راستین کریمی', 
    '۶ ساله', 
    '2026-06-05T12:00:00Z'
),
(
    'سفر کرم ابریشم به ماه', 
    'یک اثر کلاژ خلاقانه با استفاده از کاغذهای رنگی بافت‌دار و خرده‌ریزه‌های پارچه که خلاقیت در تجسم داستان را نشان می‌دهد.', 
    'کلاژ و کاردستی', 
    'placeholder-caterpillar', 
    'نهال زارعی', 
    '۵ ساله', 
    '2026-06-05T12:05:00Z'
),
(
    'شهریار زیر دریا', 
    'تصویرگری آکواریوم خیالی بچه‌ها با تکنیک آبرنگ و گواش، پر از ماهی‌های سخنگو و ماهی طلایی جادویی.', 
    'آبرنگ و گواش', 
    'placeholder-fish', 
    'باران رضایی', 
    '۸ ساله', 
    '2026-06-05T12:10:00Z'
);

-- Seed default illustrations
INSERT INTO illustrations (title, description, imageUrl, createdAt) VALUES
(
    'پرواز بر فراز گل‌ها', 
    'تصویرگری فانتزی و رویایی با گنجشک‌های سخنگو کار شده در کتاب صوتی داستان‌های شب.', 
    'placeholder-fly', 
    '2026-06-05T12:00:00Z'
),
(
    'دوستی روباه و ماه', 
    'طراحی جلد کتاب مصور داستان شبرنگ با تکنیک ادغام جوهر و نقاشی دیجیتال.', 
    'placeholder-fox', 
    '2026-06-05T12:15:00Z'
);

-- Seed default registrations
INSERT INTO registrations (courseId, studentName, parentName, email, phone, status, amountPaid, paymentMethod, receiptImage, createdAt) VALUES
(
    1, 
    'آرتین کریمی', 
    'احسان کریمی', 
    'artin@gmail.com', 
    '۰۹۱۲۲۲۲۳۳۴۴', 
    'confirmed', 
    450000, 
    'online', 
    NULL, 
    '2026-06-05T12:30:00Z'
),
(
    2, 
    'نهال زارعی', 
    'مریم زارعی', 
    'nahal@gmail.com', 
    '۰۹۱۷۶۶۶۷۷۸۸', 
    'pending', 
    0, 
    'receipt', 
    NULL, 
    '2026-06-05T12:45:00Z'
);

-- Seed default messages
INSERT INTO messages (senderName, email, message, status, createdAt) VALUES
(
    'کیمیا رضایی', 
    'kimia@yahoo.com', 
    'سلام خانم هنر عزیز. وسایل مورد نیاز کلاس نقاشی خلاق چیا هستند؟ پسرم ۴ سالشه، آیا گواش حساسیت ایجاد نمی‌کنه برای پوستش؟ ممنون', 
    'unread', 
    '2026-06-05T13:00:00Z'
);
