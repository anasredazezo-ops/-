import React from 'react';
import { Crown, Sparkles, Trophy } from 'lucide-react';
import { Student } from '../types/quran';

interface LeaderboardTickerProps {
  students: Student[];
}

export const LeaderboardTicker: React.FC<LeaderboardTickerProps> = ({ students }) => {
  // Sort students descending by coins
  const sorted = [...students].sort((a, b) => b.coins - a.coins);

  const top1 = sorted[0];
  const top2 = sorted[1];
  const top3 = sorted[2];

  return (
    <div className="bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-700 text-white py-1.5 px-3 overflow-hidden border-b border-amber-400/40 relative shadow-inner select-none font-['Cairo']">
      <div className="flex items-center gap-3 animate-marquee whitespace-nowrap">
        {/* Ticker items duplicated to ensure smooth endless seamless loop */}
        {[1, 2].map((loop) => (
          <div key={loop} className="flex items-center gap-6 text-xs sm:text-sm font-black tracking-wide">
            <span className="flex items-center gap-1.5 bg-black/20 px-2.5 py-0.5 rounded-full border border-amber-300/30 text-yellow-200">
              <Trophy className="w-3.5 h-3.5 text-yellow-300 animate-bounce" />
              <span>لوحة صدارة الأبطال الحية</span>
            </span>

            {top1 ? (
              <span className="inline-flex items-center gap-1.5 bg-amber-900/60 px-3 py-0.5 rounded-full border border-yellow-400/50 shadow-xs">
                <span>🥇 الأول على المنصة:</span>
                <span className="text-yellow-300 font-extrabold">{top1.name}</span>
                <span className="text-xs bg-yellow-400 text-amber-950 px-1.5 rounded-md font-bold">
                  {top1.coins} 🪙
                </span>
                <span>👑</span>
              </span>
            ) : (
              <span className="text-yellow-100">
                ✨ أهلاً بكم في منصة الأستاذة جهاد! أضف أبطالك لبدء المنافسة والتتويج! ✨
              </span>
            )}

            {top2 && (
              <span className="inline-flex items-center gap-1.5 bg-amber-900/40 px-3 py-0.5 rounded-full border border-slate-300/40">
                <span>🥈 الثاني على المنصة:</span>
                <span className="text-slate-100 font-extrabold">{top2.name}</span>
                <span className="text-xs bg-slate-200 text-slate-800 px-1.5 rounded-md font-bold">
                  {top2.coins} 🪙
                </span>
                <span>⭐</span>
              </span>
            )}

            {top3 && (
              <span className="inline-flex items-center gap-1.5 bg-amber-900/40 px-3 py-0.5 rounded-full border border-amber-600/40">
                <span>🥉 الثالث على المنصة:</span>
                <span className="text-amber-200 font-extrabold">{top3.name}</span>
                <span className="text-xs bg-amber-500 text-white px-1.5 rounded-md font-bold">
                  {top3.coins} 🪙
                </span>
                <span>🏆</span>
              </span>
            )}

            <span className="text-yellow-200/80 font-bold flex items-center gap-1">
              <span>🌿 "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ"</span>
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
