import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Search,
  Volume2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  AlertCircle,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { Ayah, SurahMeta, VerseStatus } from '../types/quran';
import { SURAHS_LIST } from '../data/surahs';
import { fetchSurahAyahs } from '../utils/quranApi';

interface QuranViewProps {
  currentSurahNumber: number;
  onSelectSurah: (surahNumber: number) => void;
  onCorrectVerseRead: (ayahNumber: number) => void;
  onMistakeVerse: (ayahNumber: number) => void;
  onPlayCorrectionAudio: (ayah: Ayah, surah: SurahMeta) => void;
  currentReadingAyahNumber: number | null;
  verseStatuses: Record<number, VerseStatus>;
  onResetSurahStatuses: () => void;
}

export const QuranView: React.FC<QuranViewProps> = ({
  currentSurahNumber,
  onSelectSurah,
  onCorrectVerseRead,
  onMistakeVerse,
  onPlayCorrectionAudio,
  currentReadingAyahNumber,
  verseStatuses,
  onResetSurahStatuses
}) => {
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [fontSize, setFontSize] = useState<number>(27); // Natural Mushaf font size
  const [lastClickedAyah, setLastClickedAyah] = useState<{ number: number; time: number } | null>(null);

  const currentSurah = SURAHS_LIST.find((s) => s.number === currentSurahNumber) || SURAHS_LIST[0];

  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    fetchSurahAyahs(currentSurahNumber).then((data) => {
      if (!isCancelled) {
        setAyahs(data);
        setIsLoading(false);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [currentSurahNumber]);

  // Filter surahs for search dropdown
  const filteredSurahs = SURAHS_LIST.filter((s) => s.name.includes(searchQuery.trim()));

  const handlePrevSurah = () => {
    if (currentSurahNumber > 1) {
      onSelectSurah(currentSurahNumber - 1);
    }
  };

  const handleNextSurah = () => {
    if (currentSurahNumber < 114) {
      onSelectSurah(currentSurahNumber + 1);
    }
  };

  /**
   * Natural verse interaction:
   * Single click: Yellow highlight 🟡 (reading), previous becomes Green 🟢 (+5 coins).
   * Double click or click when reading: Red highlight 🔴 (mistake, -5 coins, plays Minshawi correction).
   */
  const handleAyahClick = (ayah: Ayah) => {
    const now = Date.now();
    const isDoubleTap = lastClickedAyah && lastClickedAyah.number === ayah.number && now - lastClickedAyah.time < 600;
    const currentStatus = verseStatuses[ayah.number] || 'normal';

    if (isDoubleTap || currentStatus === 'reading') {
      onMistakeVerse(ayah.number);
      onPlayCorrectionAudio(ayah, currentSurah);
      setLastClickedAyah(null);
    } else {
      onCorrectVerseRead(ayah.number);
      setLastClickedAyah({ number: ayah.number, time: now });
    }
  };

  const handleDirectListen = (e: React.MouseEvent, ayah: Ayah) => {
    e.stopPropagation();
    onPlayCorrectionAudio(ayah, currentSurah);
  };

  const handleMarkMistakeDirect = (e: React.MouseEvent, ayah: Ayah) => {
    e.stopPropagation();
    onMistakeVerse(ayah.number);
    onPlayCorrectionAudio(ayah, currentSurah);
  };

  return (
    <div className="flex-1 flex flex-col gap-3 font-['Cairo']">
      {/* 1. Surah Navigation & Toolset */}
      <div className="bg-white/95 rounded-2xl p-3 shadow-xs border-2 border-amber-200 flex flex-wrap items-center justify-between gap-2.5">
        {/* Previous / Next Surah */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrevSurah}
            disabled={currentSurahNumber <= 1}
            title="السورة السابقة"
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 disabled:opacity-30 text-amber-900 border border-amber-200 transition active:scale-95 flex items-center gap-1 text-xs font-bold"
          >
            <ChevronRight className="w-4 h-4" />
            <span className="hidden sm:inline">السابقة</span>
          </button>

          {/* Surah Dropdown */}
          <div className="relative">
            <select
              value={currentSurahNumber}
              onChange={(e) => onSelectSurah(Number(e.target.value))}
              className="appearance-none bg-amber-100/80 hover:bg-amber-100 border-2 border-amber-300 rounded-xl px-3 py-1.5 text-amber-950 font-black text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer pr-3 pl-7 text-center shadow-2xs"
            >
              {SURAHS_LIST.map((s) => (
                <option key={s.number} value={s.number}>
                  {s.number}. {s.name} ({s.numberOfAyahs} آية - {s.revelationType})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleNextSurah}
            disabled={currentSurahNumber >= 114}
            title="السورة التالية"
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 disabled:opacity-30 text-amber-900 border border-amber-200 transition active:scale-95 flex items-center gap-1 text-xs font-bold"
          >
            <span className="hidden sm:inline">التالية</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="ابحث عن سورة بالاسم..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-8 pl-2 py-1.5 rounded-xl border border-amber-200 bg-amber-50/50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          {searchQuery && (
            <div className="absolute top-full mt-1 right-0 left-0 bg-white rounded-xl shadow-xl border border-amber-200 z-30 max-h-44 overflow-y-auto p-1">
              {filteredSurahs.map((s) => (
                <button
                  key={s.number}
                  onClick={() => {
                    onSelectSurah(s.number);
                    setSearchQuery('');
                  }}
                  className="w-full text-right px-3 py-1.5 text-xs font-bold hover:bg-amber-50 rounded-lg flex items-center justify-between text-slate-800"
                >
                  <span>{s.number}. {s.name}</span>
                  <span className="text-[10px] text-slate-400">{s.numberOfAyahs} آية</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Font Zoom & Reset Statuses */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-amber-50 rounded-xl p-0.5 border border-amber-200">
            <button
              onClick={() => setFontSize((f) => Math.max(18, f - 2))}
              title="تصغير خط المصحف"
              className="p-1 rounded-lg hover:bg-white text-amber-900 transition"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-black px-1.5 text-amber-950 min-w-5 text-center">
              {fontSize}
            </span>
            <button
              onClick={() => setFontSize((f) => Math.min(46, f + 2))}
              title="تكبير خط المصحف"
              className="p-1 rounded-lg hover:bg-white text-amber-900 transition"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onResetSurahStatuses}
            title="إعادة ضبط تلوين الآيات للبدء من جديد"
            className="p-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Color Code Guide */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-xl px-3 py-1.5 flex flex-wrap items-center justify-between gap-1.5 text-xs font-bold text-amber-950">
        <span className="flex items-center gap-1 text-[11px] sm:text-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>تلوين القراءة:</span>
        </span>
        <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs">
          <span className="flex items-center gap-1 bg-yellow-100 px-2 py-0.5 rounded-lg border border-yellow-300 text-yellow-900">
            <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
            <span>قيد القراءة 🟡</span>
          </span>
          <span className="flex items-center gap-1 bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-300 text-emerald-900">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>صحيحة (+5 🪙) 🟢</span>
          </span>
          <span className="flex items-center gap-1 bg-rose-100 px-2 py-0.5 rounded-lg border border-rose-300 text-rose-900">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>خطأ وتصحيح 🔴</span>
          </span>
        </div>
      </div>

      {/* 3. The Natural Mushaf Page (صفحة المصحف الطبيعي الشريفة) */}
      <div className="relative rounded-3xl p-5 sm:p-8 md:p-10 shadow-lg border-4 border-amber-400/80 bg-[#fdfbf7] min-h-[520px] overflow-hidden">
        {/* Double Gold Frame of the Mushaf Page */}
        <div className="absolute inset-2 sm:inset-3 border-2 border-amber-600/30 rounded-2xl pointer-events-none"></div>
        <div className="absolute inset-3 sm:inset-4 border border-dashed border-amber-400/40 rounded-xl pointer-events-none"></div>

        {/* Traditional Mushaf Surah Header (برواز رأس السورة المزخرف) */}
        <div className="relative z-10 text-center pb-5 mb-5 border-b-2 border-amber-300/60">
          <div className="inline-block relative max-w-lg w-full">
            <div className="py-2.5 px-6 bg-gradient-to-r from-amber-200/50 via-amber-300/70 to-amber-200/50 rounded-2xl border-2 border-amber-500/60 shadow-sm flex items-center justify-between">
              <span className="text-xs font-black text-amber-900 bg-white/70 px-2 py-1 rounded-xl shadow-2xs">
                {currentSurah.revelationType}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-amber-950 font-['Amiri'] tracking-wide">
                {currentSurah.name}
              </h2>
              <span className="text-xs font-black text-amber-900 bg-white/70 px-2 py-1 rounded-xl shadow-2xs">
                {currentSurah.numberOfAyahs} آيات
              </span>
            </div>
          </div>

          {/* Bismillah (if not Surah 9 and not Surah 1) */}
          {currentSurah.number !== 9 && currentSurah.number !== 1 && (
            <div className="mt-4 font-['Amiri_Quran',_'Amiri',_serif] text-2xl sm:text-3xl text-amber-950 text-center font-bold tracking-wider select-none">
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </div>
          )}
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-amber-900 font-bold text-sm">
              جاري فتح صفحة {currentSurah.name} بالرسم العثماني المعتمد...
            </p>
          </div>
        ) : (
          /* Continuous Natural Mushaf Paragraph (نص قرآني متصل كالمصحف الطبيعي) */
          <div
            className="relative z-10 text-justify transition-all text-slate-900 select-none"
            dir="rtl"
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: 2.7,
              textAlign: 'justify',
              textJustify: 'inter-word',
              fontFamily: "'Amiri Quran', 'Amiri', 'Scheherazade New', serif"
            }}
          >
            {ayahs.map((ayah) => {
              const status: VerseStatus = verseStatuses[ayah.number] ?? 'normal';
              const isCurrentReading = currentReadingAyahNumber === ayah.number || status === 'reading';

              // Highlighter pen effect over natural Quranic sentence
              let highlightBg = 'hover:bg-amber-100/50';
              let textClass = 'text-slate-900';

              if (status === 'completed') {
                highlightBg = 'bg-emerald-100/90 text-emerald-950 shadow-xs ring-1 ring-emerald-300';
                textClass = 'text-emerald-950 font-bold';
              } else if (status === 'mistake') {
                highlightBg = 'bg-rose-100 text-rose-950 shadow-xs ring-1 ring-rose-400 animate-shake';
                textClass = 'text-rose-950 font-bold';
              } else if (isCurrentReading) {
                highlightBg = 'bg-yellow-200 text-yellow-950 shadow-sm ring-2 ring-yellow-400';
                textClass = 'text-yellow-950 font-black';
              }

              return (
                <span
                  key={ayah.number}
                  onClick={() => handleAyahClick(ayah)}
                  className={`inline px-1 py-0.5 rounded-lg transition-colors cursor-pointer group ${highlightBg} ${textClass}`}
                  title="اضغط للتلاوة والتقييم | اضغط مرتين لتسجيل خطأ وسماع المنشاوي"
                >
                  {/* Natural Verse Text */}
                  <span>{ayah.text}</span>

                  {/* Ornate End-of-Ayah Bracket Stop ﴿١﴾ */}
                  <span className="inline-block mx-1 font-['Amiri',_serif] text-amber-700 font-bold group-hover:text-amber-900 select-none">
                    ﴿{ayah.numberInSurah}﴾
                  </span>

                  {/* Floating Action mini-icons on hover without breaking flow */}
                  <span className="inline-flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity align-middle mr-0.5 not-sr-only">
                    <button
                      onClick={(e) => handleDirectListen(e, ayah)}
                      title="استماع لتصحيح الشيخ المنشاوي"
                      className="p-0.5 bg-white rounded-md text-amber-700 shadow-2xs hover:scale-110"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleMarkMistakeDirect(e, ayah)}
                      title="تسجيل خطأ"
                      className="p-0.5 bg-white rounded-md text-rose-600 shadow-2xs hover:scale-110"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                    </button>
                  </span>
                </span>
              );
            })}
          </div>
        )}

        {/* Mushaf Page Bottom Rosette Decoration */}
        <div className="mt-8 text-center text-amber-600 text-lg select-none">
          ۞
        </div>
      </div>
    </div>
  );
};
