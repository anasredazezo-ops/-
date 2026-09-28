import React from 'react';
import { Sparkles, UserPlus, PartyPopper, CheckCircle2, ChevronDown } from 'lucide-react';
import { Student } from '../types/quran';
import { LeaderboardTicker } from './LeaderboardTicker';

interface HeaderProps {
  currentStudent: Student | null;
  students: Student[];
  onSelectStudent: (id: string) => void;
  onOpenStudentModal: () => void;
  onGrandCelebration: () => void;
  lastSavedTime: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentStudent,
  students,
  onSelectStudent,
  onOpenStudentModal,
  onGrandCelebration,
  lastSavedTime
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-amber-200 shadow-sm transition-all font-['Cairo']">
      {/* 1. Moving Top Leaderboard Ticker (الأول على المنصة، الثاني على المنصة، الثالث على المنصة) */}
      <LeaderboardTicker students={students} />

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Right side: Exactly requested brand name: "منصة تعليم القرآن - منصة الأستاذة جهاد" */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-white shadow-md shadow-amber-500/20 border-2 border-amber-200 group flex-shrink-0">
            <span className="text-2xl sm:text-3xl select-none group-hover:scale-110 transition-transform">
              📖
            </span>
            <span className="absolute -bottom-1 -right-1 text-xs bg-emerald-600 text-white rounded-full px-1 font-bold shadow-xs">
              ★
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-base sm:text-xl md:text-2xl font-black text-amber-950 tracking-tight flex items-center gap-1.5">
                <span>منصة تعليم القرآن</span>
                <span className="text-amber-500 text-sm sm:text-lg">•</span>
                <span className="text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-xl border border-amber-300/60 text-xs sm:text-base">
                  منصة الأستاذة جهاد
                </span>
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs text-amber-800/80 font-bold flex items-center gap-1.5 mt-0.5">
              <span>التحفيظ والتجويد التفاعلي للأبطال الصغار</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </p>
          </div>
        </div>

        {/* Left & Middle Controls: Auto-save + Student Selector + Celebration */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          {/* Auto-save status */}
          <div
            title="نظام الحفظ التلقائي الذكي يعمل باستمرار"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-2xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>حفظ تلقائي مفعل</span>
          </div>

          {/* Student Selector or Add Prompt */}
          {students.length > 0 && currentStudent ? (
            <div className="flex items-center gap-1 bg-amber-50/80 p-1 rounded-2xl border border-amber-200">
              <div className="relative flex items-center">
                <span className="text-xl sm:text-2xl mr-2 ml-1">{currentStudent.avatar}</span>
                <select
                  value={currentStudent.id}
                  onChange={(e) => onSelectStudent(e.target.value)}
                  className="appearance-none bg-transparent font-bold text-slate-800 text-xs sm:text-sm pl-7 pr-1 py-1 focus:outline-none cursor-pointer"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.coins} 🪙)
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute left-1 pointer-events-none" />
              </div>

              <button
                onClick={onOpenStudentModal}
                title="إدارة وحسابات الطلاب"
                className="p-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold text-xs transition shadow-xs flex items-center gap-1"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">طالب جديد</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenStudentModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs sm:text-sm shadow-md transition active:scale-95 animate-bounce"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ إضافة طالبك الأول</span>
            </button>
          )}

          {/* Grand Celebration Button */}
          <button
            onClick={onGrandCelebration}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:from-purple-700 hover:to-rose-600 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg active:scale-95 transition-all"
            title="إطلاق ألعاب نارية وأوراق احتفالية وتكبيرات لتشجيع البطل عند ختم الورد"
          >
            <PartyPopper className="w-4 h-4 animate-bounce" />
            <span>احتفال ختامي 🎉</span>
          </button>
        </div>
      </div>
    </header>
  );
};
