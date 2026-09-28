import React from 'react';
import { Trophy, Crown, Flame, Medal, Sparkles } from 'lucide-react';
import { Student } from '../types/quran';

interface LeaderboardPanelProps {
  students: Student[];
  currentStudentId: string;
  onSelectStudent: (id: string) => void;
}

export const LeaderboardPanel: React.FC<LeaderboardPanelProps> = ({
  students,
  currentStudentId,
  onSelectStudent
}) => {
  // Sort students descending by coins (and then by totalAyahsRead)
  const sortedStudents = [...students].sort((a, b) => {
    if (b.coins !== a.coins) return b.coins - a.coins;
    return (b.totalAyahsRead || 0) - (a.totalAyahsRead || 0);
  });

  const getRankBadge = (rank: number) => {
    if (rank === 0) {
      return (
        <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 flex items-center justify-center font-black text-sm shadow-md border-2 border-white ring-2 ring-amber-400">
          🥇
        </span>
      );
    }
    if (rank === 1) {
      return (
        <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-slate-300 to-slate-100 text-slate-800 flex items-center justify-center font-black text-sm shadow-md border-2 border-white ring-2 ring-slate-300">
          🥈
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-600 to-amber-500 text-white flex items-center justify-center font-black text-sm shadow-md border-2 border-white ring-2 ring-amber-600">
          🥉
        </span>
      );
    }
    return (
      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-black text-xs border border-slate-200">
        {rank + 1}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border-2 border-amber-200 font-['Cairo']">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">
            لوحة صدارة أبطال القرآن
          </h3>
        </div>
        <span className="text-[11px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <Crown className="w-3 h-3 text-amber-600" />
          <span>تنافس الحفظ</span>
        </span>
      </div>

      <p className="text-xs text-slate-500 font-medium mb-3">
        ترتيب الأبطال بحسب مجموع الكوينز وإتقان التلاوة:
      </p>

      {/* Leaderboard Cards */}
      <div className="space-y-2">
        {sortedStudents.map((st, index) => {
          const isSelected = st.id === currentStudentId;
          const isTopThree = index < 3;

          return (
            <div
              key={st.id}
              onClick={() => onSelectStudent(st.id)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                isSelected
                  ? 'bg-gradient-to-r from-amber-100/90 to-yellow-50 border-amber-400 shadow-md ring-2 ring-amber-400/80 scale-[1.01]'
                  : isTopThree
                  ? 'bg-amber-50/40 hover:bg-amber-100/50 border-amber-200'
                  : 'bg-slate-50/60 hover:bg-slate-100/80 border-slate-200'
              }`}
            >
              {/* Rank and Student Info */}
              <div className="flex items-center gap-2.5">
                {getRankBadge(index)}
                <span className="text-2xl p-1 bg-white rounded-xl shadow-xs border border-amber-200">
                  {st.avatar}
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-slate-800 text-sm">
                      {st.name}
                    </span>
                    {index === 0 && (
                      <span className="text-xs" title="متصدر الترتيب!">
                        👑
                      </span>
                    )}
                    {isSelected && (
                      <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.2 rounded-full font-bold">
                        أنت
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                    <span>📖 {st.totalAyahsRead || 0} آية</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-orange-600 font-bold">
                      <Flame className="w-3 h-3 fill-current" />
                      <span>{st.streak || 0}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Coins Pill */}
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white shadow-2xs border border-amber-200 font-black text-amber-950 text-xs">
                <span>🪙</span>
                <span className="text-sm">{st.coins}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
