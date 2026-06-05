/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Palette, Trash2, Sparkles, CircleDot, Info, Brush, 
  PenTool, Eraser, Wind, Send, Share2, Download, Check, HelpCircle
} from 'lucide-react';

const COLORS = [
  '#FF4B4B', // Red
  '#FF6B6B', // Light Red / Coral
  '#FF9F43', // Orange
  '#FFA801', // Bright Amber
  '#FFDB58', // Yellow
  '#FFEE58', // Light Yellow
  '#4CD137', // Green
  '#10AC84', // Mint / Teal
  '#48DBFB', // Sky Blue
  '#54A0FF', // Ocean Blue
  '#2E86DE', // Deep Blue
  '#9B5DE5', // Purple
  '#8C7AE6', // Pastel Purple
  '#FF85A2', // Bubblegum Pink
  '#F3A683', // Peach
  '#D2DAE2', // Light Gray
  '#84817A', // Dark Gray
  '#000000', // Black
];

type ToolType = 'classic' | 'bristle' | 'sparkle' | 'airbrush' | 'circle' | 'square' | 'triangle' | 'star' | 'eraser';

export default function MagicCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const [color, setColor] = useState('#FF85A2');
  const [brushSize, setBrushSize] = useState(14);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<ToolType>('bristle'); // Default is High-Quality Watercolor paintbrush
  const [canvasOrientation, setCanvasOrientation] = useState<'horizontal' | 'vertical'>('horizontal');

  // Child details state for submitting
  const [studentName, setStudentName] = useState('');
  const [studentAge, setStudentAge] = useState('');
  const [paintingTitle, setPaintingTitle] = useState('');
  const [paintingDesc, setPaintingDesc] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Sync canvas size and automatically load previous artwork from localStorage
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const targetHeight = canvasOrientation === 'horizontal' ? 350 : 500;

        // Skip resizing if width & height remain identical to prevent unnecessary blinks
        if (canvas.width === rect.width && canvas.height === targetHeight) {
          return;
        }

        // Apply new dimension bounds
        canvas.width = rect.width;
        canvas.height = targetHeight;

        // Draw solid background canvas
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Load the persistent saved drawing state
        const savedDrawing = localStorage.getItem('magic_canvas_drawing');
        if (savedDrawing) {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          };
          img.src = savedDrawing;
        }
        // Background has NO text as per user instructions
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [canvasOrientation]);

  const getCoordinates = (e: any) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    
    let clientX = 0;
    let clientY = 0;
    
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: any) => {
    e.preventDefault(); 
    const { x, y } = getCoordinates(e);
    lastPos.current = { x, y };
    setIsDrawing(true);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    // Single click / tap points drawing support
    ctx.save();
    if (tool === 'eraser') {
      ctx.beginPath();
      ctx.arc(x, y, brushSize, 0, 2 * Math.PI);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
    } else if (tool === 'classic') {
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
    } else if (tool === 'sparkle') {
      drawSparkle(x, y, color);
    } else if (tool === 'airbrush') {
      drawAirbrushSplatter(ctx, x, y, brushSize, color);
    } else if (tool === 'bristle') {
      drawPaintbrushDab(ctx, x, y, brushSize, color);
    } else if (tool === 'circle') {
      drawCircleShape(ctx, x, y, brushSize * 1.5, color);
    } else if (tool === 'square') {
      drawSquareShape(ctx, x, y, brushSize * 1.5, color);
    } else if (tool === 'triangle') {
      drawTriangleShape(ctx, x, y, brushSize * 1.5, color);
    } else if (tool === 'star') {
      drawStarShape(ctx, x, y, brushSize * 1.5, color);
    }
    ctx.restore();
  };

  const draw = (e: any) => {
    if (!isDrawing || !lastPos.current) return;
    e.preventDefault();
    
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const fromX = lastPos.current.x;
    const fromY = lastPos.current.y;

    const dx = x - fromX;
    const dy = y - fromY;
    const len = Math.sqrt(dx * dx + dy * dy);

    ctx.save();

    if (tool === 'eraser') {
      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(x, y);
      ctx.lineWidth = brushSize * 1.5;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();
    } else if (tool === 'classic') {
      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(x, y);
      ctx.lineWidth = brushSize;
      ctx.strokeStyle = color;
      ctx.stroke();
    } else if (tool === 'sparkle') {
      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(x, y);
      ctx.lineWidth = brushSize * 0.7;
      ctx.strokeStyle = color;
      ctx.stroke();

      if (len > 8) {
        const steps = Math.floor(len / 12);
        for (let s = 1; s <= steps; s++) {
          const ratio = s / (steps + 1);
          drawSparkle(fromX + dx * ratio, fromY + dy * ratio, color);
        }
      }
    } else if (tool === 'airbrush') {
      const steps = Math.max(1, Math.floor(len / 3));
      for (let s = 0; s < steps; s++) {
        const ratio = s / steps;
        drawAirbrushSplatter(ctx, fromX + dx * ratio, fromY + dy * ratio, brushSize, color);
      }
    } else if (tool === 'bristle') {
      const steps = Math.max(2, Math.floor(len / 2.5));
      for (let s = 0; s < steps; s++) {
        const ratio = s / steps;
        drawPaintbrushDab(ctx, fromX + dx * ratio, fromY + dy * ratio, brushSize, color);
      }
    } else if (tool === 'circle') {
      const steps = Math.max(1, Math.floor(len / (brushSize * 1.5 || 10)));
      for (let s = 0; s < steps; s++) {
        const ratio = s / steps;
        drawCircleShape(ctx, fromX + dx * ratio, fromY + dy * ratio, brushSize * 1.5, color);
      }
    } else if (tool === 'square') {
      const steps = Math.max(1, Math.floor(len / (brushSize * 1.5 || 10)));
      for (let s = 0; s < steps; s++) {
        const ratio = s / steps;
        drawSquareShape(ctx, fromX + dx * ratio, fromY + dy * ratio, brushSize * 1.5, color);
      }
    } else if (tool === 'triangle') {
      const steps = Math.max(1, Math.floor(len / (brushSize * 1.5 || 10)));
      for (let s = 0; s < steps; s++) {
        const ratio = s / steps;
        drawTriangleShape(ctx, fromX + dx * ratio, fromY + dy * ratio, brushSize * 1.5, color);
      }
    } else if (tool === 'star') {
      const steps = Math.max(1, Math.floor(len / (brushSize * 1.5 || 10)));
      for (let s = 0; s < steps; s++) {
        const ratio = s / steps;
        drawStarShape(ctx, fromX + dx * ratio, fromY + dy * ratio, brushSize * 1.5, color);
      }
    }

    ctx.restore();
    lastPos.current = { x, y };
  };

  // Shape drawing helper functions - drawing beautiful linear outlines rather than solid fills
  const drawCircleShape = (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, clr: string) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, size, 0, 2 * Math.PI);
    ctx.lineWidth = Math.max(2, brushSize / 4);
    ctx.strokeStyle = clr;
    ctx.stroke();
    ctx.restore();
  };

  const drawSquareShape = (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, clr: string) => {
    ctx.save();
    ctx.beginPath();
    ctx.rect(cx - size, cy - size, size * 2, size * 2);
    ctx.lineWidth = Math.max(2, brushSize / 4);
    ctx.strokeStyle = clr;
    ctx.stroke();
    ctx.restore();
  };

  const drawTriangleShape = (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, clr: string) => {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy - size * 1.2);
    ctx.lineTo(cx + size * 1.2, cy + size);
    ctx.lineTo(cx - size * 1.2, cy + size);
    ctx.closePath();
    ctx.lineWidth = Math.max(2, brushSize / 4);
    ctx.strokeStyle = clr;
    ctx.stroke();
    ctx.restore();
  };

  const drawStarShape = (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, clr: string) => {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = clr;
    ctx.lineWidth = Math.max(2, brushSize / 4);
    const points = 5;
    const inset = 0.5;
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const r = i % 2 === 0 ? size * 1.3 : size * 1.3 * inset;
      const currX = cx + r * Math.cos(angle);
      const currY = cy + r * Math.sin(angle);
      if (i === 0) {
        ctx.moveTo(currX, currY);
      } else {
        ctx.lineTo(currX, currY);
      }
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  };

  // Draws a beautiful physical paint bristle dab
  const drawPaintbrushDab = (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, clr: string) => {
    ctx.save();
    const bristleCount = Math.max(8, Math.floor(size * 1.3));
    
    for (let i = 0; i < bristleCount; i++) {
      const angle = (i / bristleCount) * 2 * Math.PI;
      const radiusOffset = Math.random() * (size / 2);
      const bx = cx + Math.cos(angle) * radiusOffset;
      const by = cy + Math.sin(angle) * radiusOffset;
      
      ctx.beginPath();
      ctx.arc(bx, by, 0.9 + Math.random() * 1.2, 0, 2 * Math.PI);
      
      const opacity = (0.23 + (1 - (radiusOffset / (size / 2))) * 0.45) * 0.55;
      ctx.fillStyle = clr;
      ctx.globalAlpha = opacity;
      ctx.fill();
    }
    ctx.restore();
  };

  // Draws a randomized airbrush spray color splash
  const drawAirbrushSplatter = (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, clr: string) => {
    ctx.save();
    ctx.fillStyle = clr;
    const density = Math.min(25, size * 1.1);
    for (let i = 0; i < density; i++) {
      const offsetRadius = Math.random() * (size * 1.1);
      const angle = Math.random() * 2 * Math.PI;
      ctx.beginPath();
      ctx.arc(
        cx + offsetRadius * Math.cos(angle),
        cy + offsetRadius * Math.sin(angle),
        0.5 + Math.random() * 1.0, 
        0, 
        2 * Math.PI
      );
      ctx.globalAlpha = 0.12 + Math.random() * 0.35;
      ctx.fill();
    }
    ctx.restore();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPos.current = null;

    if (canvasRef.current) {
      try {
        const urlData = canvasRef.current.toDataURL('image/png');
        localStorage.setItem('magic_canvas_drawing', urlData);
      } catch (err) {
        console.error('Failed to save canvas state', err);
      }
    }
  };

  const clearCanvas = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        localStorage.removeItem('magic_canvas_drawing');
      }
    }
  };

  const drawSparkle = (x: number, y: number, clr: string) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    
    ctx.save();
    ctx.fillStyle = clr;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    
    const size = Math.max(8, brushSize * 1.1);
    ctx.moveTo(x, y - size); 
    ctx.quadraticCurveTo(x, y, x + size, y); 
    ctx.quadraticCurveTo(x, y, x, y + size); 
    ctx.quadraticCurveTo(x, y, x - size, y); 
    ctx.quadraticCurveTo(x, y, x, y - size); 
    
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  const downloadCanvasImage = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${paintingTitle.trim() || 'نقاشی_جادویی_من'}.png`;
    link.href = dataUrl;
    link.click();
  };

  const submitPaintingToAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canvasRef.current) return;

    setLoading(true);
    setSuccessMsg('');

    try {
      const imageUrl = canvasRef.current.toDataURL('image/png');
      const response = await fetch('/api/artworks/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: paintingTitle.trim() || 'نقاشی دفتر خلاق زنده من',
          description: paintingDesc.trim() || 'طراحی شده بر روی بوم دیجیتال جادویی خانم هنر ✨',
          imageUrl,
          studentName: studentName.trim() || 'هنرمند کوچولو',
          studentAge: studentAge.trim() ? `${studentAge.trim()} ساله` : '',
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'خطا در برقراری ارتباط');
      }

      setSuccessMsg(data.message || 'نقاشی خوشگلت با موفقیت برای خانم هنر ارسال شد! 🎨🌷');
      // Reset inputs
      setStudentName('');
      setStudentAge('');
      setPaintingTitle('');
      setPaintingDesc('');
    } catch (err: any) {
      alert(err.message || 'اتصال برقرار نشد. لطفاً مجدداً امتحان نمایید.');
    } finally {
      setLoading(false);
    }
  };

  // Social Share helpers with local and global platform support
  const shareText = `من یک نقاشی دیجیتال جادویی و زیبا در سایت «دنیای جادویی خانم هنر (اسراء چاوشی)» کشیدم! تو هم بیا و نقاشی خودت را بکش و جادو کن! 🎨✨🧚‍♀️`;
  const shareUrl = window.location.origin;

  const shareTelegram = () => {
    const url = `https://telegram.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noreferrer,noopener');
  };

  const shareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' \n ' + shareUrl)}`;
    window.open(url, '_blank', 'noreferrer,noopener');
  };

  const shareBale = () => {
    const url = `https://ble.ir/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noreferrer,noopener');
  };

  const shareEitaa = () => {
    const url = `https://eitaa.com/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noreferrer,noopener');
  };

  const shareRubika = () => {
    const url = `https://rubika.ir/share?text=${encodeURIComponent(shareText + ' \n ' + shareUrl)}`;
    navigator.clipboard.writeText(shareText + ' \n ' + shareUrl);
    alert('پیوند دعوت و متن زیبای معرفی کپی شد! می‌توانید آن را در بخش پیام‌ها، گروه یا کانال روبیکای خود قرار دهید (Paste نمایید).');
    window.open(url, '_blank', 'noreferrer,noopener');
  };

  const shareInstagramStory = () => {
    navigator.clipboard.writeText(shareText + ' \n ' + shareUrl);
    alert('متن دعوت سایت کپی شد! کافی‌ست عکس نقاشی خلاقانه‌ات را دانلود کنی، در اینستاگرام دکمه Story را بزنی، عکست را انتخاب کرده و از استیکر لینک (Link Sticker) برای دعوت دوستان استفاده کنی و این متن را بنویسی! 🌷✨');
  };

  const shareAllNative = async () => {
    if (navigator.share) {
      try {
        if (canvasRef.current) {
          canvasRef.current.toBlob(async (blob) => {
            if (!blob) {
              await navigator.share({
                title: 'نقاشی خلاقانه جادویی من',
                text: `${shareText}\n${shareUrl}`,
              });
              return;
            }
            const file = new File([blob], 'painting.png', { type: 'image/png' });
            await navigator.share({
              title: 'نقاشی خلاقانه جادویی من',
              text: shareText,
              files: [file],
            });
          }, 'image/png');
        }
      } catch (err) {
        try {
          await navigator.share({
            title: 'نقاشی خلاقانه جادویی من',
            text: `${shareText}\n${shareUrl}`,
          });
        } catch (err2) {
          navigator.clipboard.writeText(shareText + ' \n ' + shareUrl);
          alert('لینک و متن کپی شد!');
        }
      }
    } else {
      navigator.clipboard.writeText(shareText + ' \n ' + shareUrl);
      alert('مرورگر شما از اشتراک‌گذاری مستقیم پشتیبانی نمی‌کند، اما نگران نباش! متن و آدرس سایت کپی شد؛ آن را به هر برنامه‌ای که دوست داری ارسال بفرست! 🎉🌷');
    }
  };

  return (
    <div className="bg-amber-50 p-6 rounded-3xl border-4 border-dashed border-amber-300 shadow-xl overflow-hidden relative">
      <div className="absolute top-2 right-3 flex items-center gap-1 text-xs text-amber-600 bg-amber-100 px-3 py-1 rounded-full font-medium">
        <Info size={14} className="text-amber-500" />
        <span>بوم جادویی نقاشی کودکان خانم هنر 🧚‍♀️</span>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6 items-stretch mt-4">
        {/* Left Side: Controls */}
        <div className="flex flex-col gap-4 bg-white p-4 rounded-2xl shadow-sm border-2 border-amber-200 lg:w-80 shrink-0">
          
          {/* Brushes / Tools Selector */}
          <div className="text-right">
            <h3 className="font-bold text-amber-700 text-xs flex items-center gap-1 justify-end">
              <span>انتخاب قلم‌مو و جادو</span>
              <Brush size={16} className="text-indigo-500" />
            </h3>
            
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                id="tool-btn-bristle"
                type="button"
                onClick={() => setTool('bristle')}
                className={`flex items-center gap-1.5 justify-end px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  tool === 'bristle' 
                    ? 'bg-amber-500 text-white shadow-md scale-102 border border-amber-600' 
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                <span>قلم‌موی آبرنگ 🖌️</span>
              </button>

              <button
                id="tool-btn-classic"
                type="button"
                onClick={() => setTool('classic')}
                className={`flex items-center gap-1.5 justify-end px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  tool === 'classic' 
                    ? 'bg-amber-500 text-white shadow-md scale-102 border border-amber-600' 
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                <span>مداد جادویی ✏️</span>
              </button>

              <button
                id="tool-btn-sparkle"
                type="button"
                onClick={() => setTool('sparkle')}
                className={`flex items-center gap-1.5 justify-end px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  tool === 'sparkle' 
                    ? 'bg-amber-500 text-white shadow-md scale-102 border border-amber-600' 
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                <span>ستاره‌باران ✨</span>
              </button>

              <button
                id="tool-btn-airbrush"
                type="button"
                onClick={() => setTool('airbrush')}
                className={`flex items-center gap-1.5 justify-end px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  tool === 'airbrush' 
                    ? 'bg-amber-500 text-white shadow-md scale-102 border border-amber-600' 
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                <span>اسپری رنگ ☁️</span>
              </button>
            </div>
          </div>

          {/* Geometric Shapes Selector */}
          <div className="text-right">
            <h3 className="font-bold text-emerald-700 text-xs flex items-center gap-1 justify-end">
              <span>مهر اشکال هندسی خلاق</span>
              <CircleDot size={15} className="text-emerald-500" />
            </h3>
            
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                id="tool-btn-circle"
                type="button"
                onClick={() => setTool('circle')}
                className={`flex items-center gap-1.5 justify-end px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  tool === 'circle' 
                    ? 'bg-emerald-500 text-white shadow-md scale-102 border border-emerald-600' 
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                <span>شکل دایره 🔴</span>
              </button>

              <button
                id="tool-btn-square"
                type="button"
                onClick={() => setTool('square')}
                className={`flex items-center gap-1.5 justify-end px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  tool === 'square' 
                    ? 'bg-emerald-500 text-white shadow-md scale-102 border border-emerald-600' 
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                <span>شکل مربع 🟥</span>
              </button>

              <button
                id="tool-btn-triangle"
                type="button"
                onClick={() => setTool('triangle')}
                className={`flex items-center gap-1.5 justify-end px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  tool === 'triangle' 
                    ? 'bg-emerald-500 text-white shadow-md scale-102 border border-emerald-600' 
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                <span>شکل مثلث 🔺</span>
              </button>

              <button
                id="tool-btn-star"
                type="button"
                onClick={() => setTool('star')}
                className={`flex items-center gap-1.5 justify-end px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  tool === 'star' 
                    ? 'bg-emerald-500 text-white shadow-md scale-102 border border-emerald-600' 
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                <span>شکل ستاره ⭐</span>
              </button>
            </div>
          </div>

          <button
            id="tool-btn-eraser"
            type="button"
            onClick={() => setTool('eraser')}
            className={`w-full flex items-center gap-1.5 justify-center py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              tool === 'eraser' 
                ? 'bg-indigo-600 text-white shadow-md border border-indigo-700' 
                : 'bg-indigo-50 text-indigo-750 hover:bg-indigo-100 border border-indigo-200'
            }`}
          >
            <Eraser size={14} />
            <span>پاک‌کن هوشمند نقاشی 🧹</span>
          </button>

          <hr className="border-amber-100" />

          {/* Color Palette (18 Colors) */}
          <div className="text-right">
            <h3 className="font-bold text-amber-700 text-xs flex items-center gap-1 justify-end">
              <span>مدادرنگی‌های شاد مربی (۱۸ رنگ)</span>
              <Palette size={16} />
            </h3>
            
            <div className="grid grid-cols-6 gap-1.5 mt-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  id={`btn-color-${c.replace('#', '')}`}
                  onClick={() => {
                    setColor(c);
                    if (
                      tool === 'eraser'
                    ) {
                      setTool('bristle'); // Default back to brush when choosing a new color
                    }
                  }}
                  className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer hover:scale-110 active:scale-95 ${
                    color === c && tool !== 'eraser' ? 'border-amber-400 scale-105 shadow-md' : 'border-slate-100'
                  }`}
                  style={{ backgroundColor: c }}
                  title="رنگ قلم‌مو"
                />
              ))}
            </div>
          </div>

          {/* Width selection */}
          <div className="text-right">
            <label className="text-[11px] font-bold text-amber-700 block mb-1">ضخامت و ابعاد قلم‌مو</label>
            <div className="flex items-center gap-2">
              <input
                id="brush-size-input"
                type="range"
                min="4"
                max="45"
                value={brushSize}
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="font-mono text-center w-8 text-[11px] text-amber-800 bg-amber-100 rounded px-1">{brushSize}px</span>
            </div>
          </div>

          <hr className="border-amber-100" />

          {/* Actions */}
          <div className="flex gap-2">
            <button
              id="clear-canvas-btn"
              onClick={clearCanvas}
              type="button"
              className="w-full flex justify-center items-center gap-1 cursor-pointer bg-rose-500 text-white font-bold py-2 px-3 rounded-xl hover:bg-rose-600 transition shadow-sm active:scale-95 text-xs"
            >
              <Trash2 size={15} />
              <span>پاک‌کردن بوم 🗑️</span>
            </button>
          </div>
        </div>

        {/* Right Side: Canvas AND Forms */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Orientation switcher bar */}
          <div className="bg-amber-100/60 p-2 text-right rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2 border border-amber-200">
            <span className="text-[11px] font-bold text-amber-800 pr-1">📐 جهت کادر نقاشی جادویی من را تغییر بده:</span>
            <div className="flex gap-2">
              <button
                id="orientation-btn-horizontal"
                type="button"
                onClick={() => setCanvasOrientation('horizontal')}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  canvasOrientation === 'horizontal'
                    ? 'bg-amber-500 text-white shadow-md border border-amber-600'
                    : 'bg-white text-slate-700 hover:bg-amber-50 border border-slate-200'
                }`}
              >
                <span>🌅 کادر افقی (منظره)</span>
              </button>
              <button
                id="orientation-btn-vertical"
                type="button"
                onClick={() => setCanvasOrientation('vertical')}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  canvasOrientation === 'vertical'
                    ? 'bg-amber-500 text-white shadow-md border border-amber-600'
                    : 'bg-white text-slate-700 hover:bg-amber-50 border border-slate-200'
                }`}
              >
                <span>📱 کادر عمودی (پرتره)</span>
              </button>
            </div>
          </div>

          {/* The Canvas itself */}
          <div ref={containerRef} className="relative bg-white border-4 border-amber-100 rounded-2xl overflow-hidden cursor-crosshair group shadow-inner">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full block bg-white"
              style={{ height: canvasOrientation === 'horizontal' ? '350px' : '500px' }}
            />
            <div className="absolute bottom-2 left-2 text-[10px] text-amber-600 bg-white/85 px-2 py-0.5 rounded shadow-sm opacity-100 transition-opacity">
              طراحی شده با عشق برای دنیای جادویی خانم هنر ❤️
            </div>
          </div>

          {/* Submission and Social Media sharing system */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch text-right">
            
            {/* Form: Submitting to Admin */}
            <form onSubmit={submitPaintingToAdmin} className="bg-white/85 p-5 rounded-2xl border border-amber-200/60 shadow-sm space-y-3">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1 justify-end border-b pb-1.5">
                <span>ارسال نقاشی قشنگت برای خانم هنر 💌</span>
                <Send size={15} className="text-amber-500" />
              </h4>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">نام هنرمند کوچولو</label>
                  <input 
                    type="text" 
                    placeholder="مثل: آرتین"
                    value={studentName}
                    onChange={e => setStudentName(e.target.value)}
                    required
                    className="w-full p-2 text-xs bg-slate-50 focus:bg-white border border-amber-100 focus:border-amber-400 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">سن (مثلا: ۶)</label>
                  <input 
                    type="text" 
                    placeholder="مثلا: ۶"
                    value={studentAge}
                    onChange={e => setStudentAge(e.target.value)}
                    className="w-full p-2 text-xs bg-slate-50 focus:bg-white border border-amber-100 focus:border-amber-400 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">عنوان نقاشی قشنگت چی باشه؟</label>
                <input 
                  type="text" 
                  placeholder="مثلا: هواپیمای جادویی من"
                  value={paintingTitle}
                  onChange={e => setPaintingTitle(e.target.value)}
                  className="w-full p-2 text-xs bg-slate-50 focus:bg-white border border-amber-100 focus:border-amber-400 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">داستان نقاشی‌ات یا ابزار رنگی که انتخاب کردی (اختیاری)</label>
                <textarea 
                  rows={2}
                  placeholder="داستان کوتاه یا پیامت برای خانم هنر..."
                  value={paintingDesc}
                  onChange={e => setPaintingDesc(e.target.value)}
                  className="w-full p-2 text-xs bg-slate-50 focus:bg-white border border-amber-100 focus:border-amber-400 rounded-lg outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50 cursor-pointer text-center block"
              >
                {loading ? 'در حال ارسال نقاشی...' : 'ارسال مستقیم نقاشی برای خانم هنر 🚀'}
              </button>

              <AnimatePresence>
                {successMsg && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] p-2.5 rounded-xl font-medium text-center"
                  >
                    {successMsg}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* Sharing block & download */}
            <div className="bg-white/85 p-5 rounded-2xl border border-amber-200/60 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1 justify-end border-b pb-1.5">
                  <span>دانلود و ارسال به همه شبکه‌های اجتماعی 🚀</span>
                  <Share2 size={15} className="text-indigo-500" />
                </h4>
                <p className="text-[10px] text-slate-500 leading-relaxed mt-2">
                  کوچولوی مهربون! می‌تونی نقاشی قشنگی رو که کشیدی همین حالا دانلود کنی یا مستقیماً تو شبکه‌های ایرانی (ایتا، روبیکا، بله) یا خارجی (واتساپ، اینستاگرام) به اشتراک بذاری!
                </p>
              </div>

              <div className="space-y-2 mt-2">
                <button
                  type="button"
                  onClick={downloadCanvasImage}
                  className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-bold shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download size={13} />
                  <span>دانلود نقاشی باکیفیت بالا 📥</span>
                </button>

                <button
                  type="button"
                  onClick={shareAllNative}
                  className="w-full py-1.5 bg-gradient-to-l from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-[11px] font-black shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
                  title="ارسال به ایتا، بله، روبیکا، شاد، اینستاگرام و غیره"
                >
                  <Share2 size={13} />
                  <span>🔗 ارسال به همه برنامه‌ها (روبیکا، شاد، بله، ایتا...)</span>
                </button>

                <div className="text-right pt-1">
                  <span className="text-[9px] font-bold text-slate-400 block mb-1">ارسال مستقیم سریع:</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={shareRubika}
                      className="py-1 bg-zinc-800 hover:bg-zinc-950 text-white rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>روبیکا 🧡</span>
                    </button>
                    <button
                      type="button"
                      onClick={shareBale}
                      className="py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>بله 🟢</span>
                    </button>
                    <button
                      type="button"
                      onClick={shareEitaa}
                      className="py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>ایتا 🟠</span>
                    </button>
                    <button
                      type="button"
                      onClick={shareInstagramStory}
                      className="py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>استوری اینستا 📸</span>
                    </button>
                    <button
                      type="button"
                      onClick={shareTelegram}
                      className="py-1 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>تلگرام ✈️</span>
                    </button>
                    <button
                      type="button"
                      onClick={shareWhatsApp}
                      className="py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>واتس‌اپ 💬</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
