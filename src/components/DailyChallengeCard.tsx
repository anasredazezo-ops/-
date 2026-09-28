import React from 'react';
import { Target, CheckCircle2, Sparkles, Trophy, ArrowRight, Flame, Star } from 'lucide-react';
import { Student } from '../types/quran';
import { SURAHS_LIST } from '../data/surahs';
import { soundManager } from '../utils/audio';

interface DailyChallengeCardProps {
  currentStudent: Student;
  students: Student[];
  onSelectStudent: (id: string) => void;
  onGoToSurah: (surahNumber: number) => void;
  onCompleteChallenge: (studentId: string, rewardCoins: number) => void;
}

export const DailyChallengeCard: React.FC<DailyChallengeCardProps> = ({
  currentStudent,
  students,
  onSelectStudent,
  onGoToSurah,
  onCompleteChallenge
}) => {
  const challenge = currentStudent.dailyChallenge || {
    id: 'default',
    title: `تحدي سورة ${SURAHS_LIST.find((s) => s.number === (currentStudent.lastActiveSurah || 1))?.name || 'الفاتحة'}`,
    surahNumber: currentStudent.lastActiveSurah || 1,
    targetAyahs: 5,
    currentAyahs: Math.min(5, currentStudent.streak || 0),
    completed: (currentStudent.streak || 0) >= 5,
    rewardCoins: 50
  };

  const targetSurah = SURAHS_LIST.find((s) => s.number === challenge.surahNumber) || SURAHS_LIST[0];
  const progressPercent = Math.min(100, Math.round((challenge.currentAyahs / challenge.targetAyahs) * 100));

  const handleClaim = () => {
    if (challenge.completed) return;
    onCompleteChallenge(currentStudent.id, challenge.rewardCoins);
    soundManager.playGrandCelebration();
  };

  return (
    <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-4 sm:p-5 text-white shadow-lg border-2 border-amber-300 font-['Cairo'] relative overflow-hidden">
      {/* Decorative stars */}
      <div className="absolute top-2 left-2 text-2xl opacity-20 pointer-events-none">⭐</div>
      <div className="absolute bottom-2 right-2 text-3xl opacity-20 pointer-events-none">🏆</div>

      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-lg">
            🎯
          </div>
          <div>
            <h3 className="font-black text-base leading-tight">
              تحدي اليوم القرآني
            </h3>
            <span className="text-[11px] text-amber-100 font-medium">
              للبطل {currentStudent.name}
            </span>
          </div>
        </div>

        {/* Reward badge */}
        <div className="flex items-center gap-1 bg-white/20 backdrop-blur-xs px-2.5 py-1 rounded-xl text-xs font-black border border-white/30">
          <span>+{challenge.rewardCoins} 🪙</span>
          <span>🏆</span>
        </div>
      </div>

      {/* Challenge Title & Surah Info */}
      <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/20 mb-3">
        <div className="font-extrabold text-sm mb-1 text-white flex items-center gap-1.5">
          <span>{challenge.title}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-amber-100 font-bold mt-2">
          <button
            onClick={() => onGoToSurah(challenge.surahNumber)}
            className="inline-flex items-center gap-1 bg-white text-amber-900 px-2.5 py-1 rounded-xl font-black text-[11px] hover:bg-amber-100 transition shadow-xs"
          >
            <span>انتقل إلى {targetSurah.name}</span>
            <ArrowRight className="w-3 h-3 rotate-180" />
          </button>
          <span>
            الهدف: {challenge.currentAyahs} / {challenge.targetAyahs} آيات
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 relative w-full h-3 bg-black/20 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-yellow-300 to-amber-200 rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <div className="flex justify-between items-center text-[10px] text-amber-100 mt-1 font-bold">
          <span>نسبة الإنجاز: {progressPercent}%</span>
          {challenge.completed ? (
            <span className="text-emerald-200 flex items-center gap-0.5 font-black">
              <CheckCircle2 className="w-3 h-3 inline" /> مكتمل
            </span>
          ) : (
            <span>متبقي {Math.max(0, challenge.targetAyahs - challenge.currentAyahs)} آيات</span>
          )}
        </div>
      </div>

      {/* Claim or Status Button */}
      {challenge.completed ? (
        <div className="w-full py-2 bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 border border-emerald-300">
          <CheckCircle2 className="w-4 h-4" />
          <span>تم إنجاز التحدي واستلام الجائزة بنجاح! 🌟</span>
        </div>
      ) : challenge.currentAyahs >= challenge.targetAyahs ? (
        <button
          onClick={handleClaim}
          className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 text-amber-950 font-black text-xs rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-1.5 animate-pulse"
        >
          <Trophy className="w-4 h-4" />
          <span>استلم جائزة التحدي الآن (+{challenge.rewardCoins} 🪙)!</span>
        </button>
      ) : (
        <div className="text-center text-[11px] text-amber-100 font-bold bg-white/10 py-1.5 rounded-xl border border-white/15">
          <span>اقرأ السورة الآن في المصحف لإكمال التحدي تلقائياً! 📖</span>
        </div>
      )}

      {/* Hero Switcher Bar (ويتحول كل طالب فيهم) */}
      <div className="mt-3 pt-3 border-t border-white/20">
        <div className="text-[11px] text-amber-100 font-bold mb-1.5 flex items-center justify-between">
          <span>تحديات باقي الأبطال:</span>
          <span className="text-[10px] opacity-80">اضغط للتحويل للبطل</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {students.map((st) => {
            const isCurrent = st.id === currentStudent.id;
            const stChallenge = st.dailyChallenge;
            const isDone = stChallenge?.completed;

            return (
              <button
                key={st.id}
                onClick={() => onSelectStudent(st.id)}
                className={`flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-bold transition flex-shrink-0 border ${
                  isCurrent
                    ? 'bg-white text-amber-950 border-white shadow-md ring-2 ring-yellow-300'
                    : 'bg-white/15 hover:bg-white/25 text-white border-white/20'
                }`}
                title={`التحويل إلى ملف ${st.name}`}
              >
                <span>{st.avatar}</span>
                <span className="text-[11px]">{st.name}</span>
                {isDone && <span className="text-[10px] text-emerald-300">✓</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
