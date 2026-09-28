import React, { useState } from 'react';
import {
  Sparkles,
  Volume2,
  Trophy,
  Gift,
  Flame,
  UserPlus,
  PlusCircle,
  BarChart3,
  ChevronDown
} from 'lucide-react';
import { Student, TeacherRewardItem } from '../types/quran';
import { TEACHER_REWARDS } from '../data/surahs';
import { soundManager } from '../utils/audio';
import { StudentStatsChart } from './StudentStatsChart';
import { LeaderboardPanel } from './LeaderboardPanel';
import { DailyChallengeCard } from './DailyChallengeCard';

interface RewardsPanelProps {
  currentStudent: Student | null;
  students: Student[];
  onSelectStudent: (id: string) => void;
  onOpenStudentModal: () => void;
  onAwardReward: (reward: TeacherRewardItem) => void;
  onOpenMysteryModal: () => void;
  onGoToSurah: (surahNumber: number) => void;
  onCompleteChallenge: (studentId: string, rewardCoins: number) => void;
}

export const RewardsPanel: React.FC<RewardsPanelProps> = ({
  currentStudent,
  students,
  onSelectStudent,
  onOpenStudentModal,
  onAwardReward,
  onOpenMysteryModal,
  onGoToSurah,
  onCompleteChallenge
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [chestJiggle, setChestJiggle] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);

  // If no student is added yet
  if (!currentStudent || students.length === 0) {
    return (
      <aside className="w-full lg:w-80 xl:w-96 flex flex-col gap-3 font-['Cairo']">
        <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-amber-200 text-center flex flex-col items-center justify-center min-h-[300px]">
          <div className="text-6xl mb-3 animate-bounce">🧒🏻</div>
          <h3 className="font-extrabold text-amber-950 text-base mb-1">
            لا يوجد طلاب مضافين بعد
          </h3>
          <p className="text-xs text-slate-500 font-medium mb-4">
            أهلاً بك أستاذة جهاد! ابدئي بإضافة أول بطل لبدء رحلة الحفظ والمكافآت
          </p>
          <button
            onClick={onOpenStudentModal}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-sm rounded-2xl shadow-md transition active:scale-95 flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ إضافة طالب جديد</span>
          </button>
        </div>
      </aside>
    );
  }

  // Handle Drag & Drop
  const handleDragStart = (e: React.DragEvent, reward: TeacherRewardItem) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(reward));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    try {
      const dataStr = e.dataTransfer.getData('text/plain');
      if (dataStr) {
        const reward: TeacherRewardItem = JSON.parse(dataStr);
        triggerRewardAward(reward);
      }
    } catch (err) {
      console.error('Drop error', err);
    }
  };

  const triggerRewardAward = (reward: TeacherRewardItem) => {
    setChestJiggle(true);
    setTimeout(() => setChestJiggle(false), 600);

    if (reward.id === 'gift') {
      onOpenMysteryModal();
    } else {
      onAwardReward(reward);
    }
  };

  const handleSoundCheer = (type: 'applause' | 'takbeer' | 'mumtaz') => {
    if (type === 'applause') {
      soundManager.playApplause();
    } else if (type === 'takbeer') {
      soundManager.playTakbeerFanfare();
    } else if (type === 'mumtaz') {
      soundManager.playMumtazCheer(currentStudent.name);
    }
  };

  const totalGiftsCount = Object.values(currentStudent.rewards || {}).reduce((acc, curr) => acc + curr, 0);

  return (
    <aside className="w-full lg:w-80 xl:w-96 flex flex-col gap-3 font-['Cairo']">
      {/* 1. TOP: اسم الطالب (Student Header Card) */}
      <section className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 rounded-3xl p-4 shadow-md border-2 border-amber-300 relative text-amber-950">
        <div className="flex items-center justify-between gap-2">
          {/* Avatar and Name */}
          <div className="flex items-center gap-3">
            <span className="text-3xl bg-white/70 p-1.5 rounded-2xl shadow-xs border border-white">
              {currentStudent.avatar}
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs bg-amber-900/10 text-amber-950 font-black px-2 py-0.5 rounded-full">
                  الطالب الحالي
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <h2 className="text-xl font-black text-amber-950 leading-tight">
                {currentStudent.name}
              </h2>
            </div>
          </div>

          {/* Quick coins badge */}
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 bg-white/90 px-3 py-1 rounded-2xl shadow-xs font-black text-amber-950 text-sm border border-amber-300">
              <span>🪙</span>
              <span className="text-base">{currentStudent.coins}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-900 mt-1">
              <Flame className="w-3 h-3 text-orange-600 fill-current" />
              <span>سلسلة: {currentStudent.streak}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. UNDER STUDENT NAME: المكافآت اللي هو خدها (Collected Rewards Basket) */}
      <section
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`bg-white rounded-3xl p-4 shadow-sm border-2 transition-all ${
          isDragOver
            ? 'bg-amber-100 border-amber-500 ring-4 ring-amber-300 scale-102'
            : 'border-amber-200'
        } ${chestJiggle ? 'animate-wiggle' : ''}`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-600" />
            <h3 className="font-extrabold text-slate-800 text-sm">
              المكافآت التي جمعها ({totalGiftsCount}):
            </h3>
          </div>
          <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full font-bold">
            صندوق الكنز 💎
          </span>
        </div>

        {totalGiftsCount === 0 ? (
          <div className="p-3 bg-amber-50/50 rounded-2xl border border-dashed border-amber-300 text-center text-xs text-amber-900 font-medium">
            لم يجمع مكافآت بعد! اضغط على أي هدية بالأسفل لإضافتها فوراً للبطل.
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {TEACHER_REWARDS.map((r) => {
              const count = currentStudent.rewards?.[r.id] || 0;
              if (count === 0) return null;
              return (
                <div
                  key={r.id}
                  title={`${r.name}: ${count} مرات`}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-orange-50 px-2.5 py-1 rounded-xl border border-amber-200 shadow-2xs"
                >
                  <span className="text-lg">{r.icon}</span>
                  <span className="text-xs font-black text-amber-950">×{count}</span>
                  <span className="text-[10px] font-bold text-slate-600 hidden sm:inline">
                    {r.name}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. UNDER COLLECTED: إضافة مكافآت له من عندي (Teacher Rewards Palette) */}
      <section className="bg-white rounded-3xl p-4 shadow-sm border-2 border-amber-200">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <Gift className="w-4 h-4 text-amber-500" />
            <h3 className="font-extrabold text-slate-800 text-sm">
              إضافة مكافآت للطالب من عندي:
            </h3>
          </div>
          <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
            اضغط لإرسال الهدية
          </span>
        </div>

        <p className="text-[11px] text-slate-500 font-medium mb-2.5">
          انقر مباشرة لمنح الهدية أو اسحبها إلى صندوق الكنز:
        </p>

        {/* 8 Teacher Rewards Grid */}
        <div className="grid grid-cols-2 gap-2">
          {TEACHER_REWARDS.map((reward) => (
            <button
              key={reward.id}
              draggable
              onDragStart={(e) => handleDragStart(e, reward)}
              onClick={() => triggerRewardAward(reward)}
              className={`p-2 rounded-2xl border text-right transition-all flex flex-col justify-between cursor-pointer active:scale-95 hover:shadow-md ${reward.bgColor} ${reward.borderColor} group`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xl group-hover:scale-125 transition-transform duration-200">
                  {reward.icon}
                </span>
                <span className="text-[11px] font-black px-1.5 py-0.5 rounded-lg bg-white/90 shadow-2xs text-amber-900">
                  +{reward.coins} 🪙
                </span>
              </div>
              <div>
                <div className="font-extrabold text-slate-800 text-xs line-clamp-1">
                  {reward.name}
                </div>
                <div className="text-[10px] text-slate-500 font-medium line-clamp-1">
                  {reward.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 4. Instant Cheering Audio Buttons */}
      <section className="bg-gradient-to-br from-indigo-50/70 via-purple-50/70 to-pink-50/70 rounded-3xl p-3.5 shadow-sm border-2 border-indigo-100">
        <div className="flex items-center gap-1.5 mb-2">
          <Volume2 className="w-4 h-4 text-indigo-600" />
          <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm">
            المؤثرات الصوتية والتشجيعية:
          </h4>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => handleSoundCheer('applause')}
            className="flex items-center justify-center gap-1 py-2 px-1 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 border-2 border-emerald-200 font-extrabold text-xs shadow-xs hover:shadow transition active:scale-95"
          >
            <span>👏</span>
            <span>تصفيق</span>
          </button>
          <button
            onClick={() => handleSoundCheer('takbeer')}
            className="flex items-center justify-center gap-1 py-2 px-1 rounded-xl bg-white hover:bg-amber-50 text-amber-900 border-2 border-amber-200 font-extrabold text-xs shadow-xs hover:shadow transition active:scale-95"
          >
            <span>🎺</span>
            <span>تكبيرات</span>
          </button>
          <button
            onClick={() => handleSoundCheer('mumtaz')}
            className="flex items-center justify-center gap-1 py-2 px-1 rounded-xl bg-white hover:bg-purple-50 text-purple-900 border-2 border-purple-200 font-extrabold text-xs shadow-xs hover:shadow transition active:scale-95"
          >
            <span>✨</span>
            <span>ممتاز</span>
          </button>
        </div>
      </section>

      {/* 5. Quick Toggle for Recharts Stats & Leaderboard */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowStatsModal(!showStatsModal)}
          className="flex-1 py-2 px-3 bg-amber-100/80 hover:bg-amber-200 text-amber-950 font-black text-xs rounded-2xl border border-amber-300 transition flex items-center justify-center gap-1.5 shadow-2xs"
        >
          <BarChart3 className="w-3.5 h-3.5 text-amber-700" />
          <span>{showStatsModal ? 'إخفاء الرسوم البيانية' : 'عرض إحصائيات Recharts 📊'}</span>
        </button>
      </div>

      {showStatsModal && (
        <div className="animate-fade-in flex flex-col gap-3">
          <StudentStatsChart currentStudent={currentStudent} />
          <LeaderboardPanel
            students={students}
            currentStudentId={currentStudent.id}
            onSelectStudent={onSelectStudent}
          />
        </div>
      )}
    </aside>
  );
};
