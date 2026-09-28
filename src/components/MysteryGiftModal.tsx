import React, { useState } from 'react';
import { Sparkles, X, Gift } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface MysteryGiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  onClaim: (coins: number, giftName: string) => void;
}

const SURPRISE_PRIZES = [
  { name: 'كنز القارئ الذهبي', icon: '👑', coins: 25, desc: 'تاج مرصع بالجواهر لحفظك المتقن!' },
  { name: 'نجمة التفوق الكبرى', icon: '🌟', coins: 30, desc: 'نجمة براقة تضيء سماء حلقتك!' },
  { name: 'صندوق الحلويات اللذيذة', icon: '🧁', coins: 20, desc: 'مجموعة حلويات وآيس كريم شهي!' },
  { name: 'كأس الشرف الماسي', icon: '🏆', coins: 35, desc: 'كأس المركز الأول لبطل القرآن!' },
  { name: 'أجنحة الحافظ الصغير', icon: '🪽', coins: 20, desc: 'همة عالية ترقى بك في درجات الجنة!' }
];

export const MysteryGiftModal: React.FC<MysteryGiftModalProps> = ({
  isOpen,
  onClose,
  studentName,
  onClaim
}) => {
  const [isOpened, setIsOpened] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<(typeof SURPRISE_PRIZES)[0] | null>(null);

  if (!isOpen) return null;

  const handleOpenGift = () => {
    if (isOpened) return;
    const prize = SURPRISE_PRIZES[Math.floor(Math.random() * SURPRISE_PRIZES.length)];
    setSelectedPrize(prize);
    setIsOpened(true);
    soundManager.playStreakBonus();
    setTimeout(() => {
      soundManager.playCoin();
    }, 400);
  };

  const handleAccept = () => {
    if (selectedPrize) {
      onClaim(selectedPrize.coins, selectedPrize.name);
    }
    setIsOpened(false);
    setSelectedPrize(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-amber-50 to-orange-50 rounded-3xl p-6 shadow-2xl border-4 border-amber-300 text-center">
        <button
          onClick={() => {
            setIsOpened(false);
            setSelectedPrize(null);
            onClose();
          }}
          className="absolute top-4 left-4 p-2 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center gap-2 mb-2 text-amber-800 font-bold text-lg">
          <Sparkles className="w-5 h-5 text-amber-500 animate-spin" />
          <span>مفاجأة المعلم لـ {studentName}</span>
          <Sparkles className="w-5 h-5 text-amber-500 animate-spin" />
        </div>

        {!isOpened ? (
          <div className="py-8 flex flex-col items-center">
            <div
              onClick={handleOpenGift}
              className="cursor-pointer group relative p-6 bg-gradient-to-br from-amber-400 via-amber-300 to-yellow-400 rounded-3xl shadow-xl hover:scale-105 active:scale-95 transition-transform duration-300 border-4 border-white"
            >
              <div className="text-8xl animate-bounce">🎁</div>
              <div className="absolute -bottom-3 bg-red-500 text-white font-black text-xs px-3 py-1 rounded-full shadow">
                اضغط للفتح!
              </div>
            </div>
            <p className="mt-8 text-amber-950 font-bold text-base">
              هناك هدية مميزة بانتظارك، اضغط على الصندوق لفتحه!
            </p>
          </div>
        ) : (
          <div className="py-6 flex flex-col items-center animate-scale-up">
            <div className="text-8xl mb-3 drop-shadow-md animate-pulse">
              {selectedPrize?.icon}
            </div>
            <h3 className="text-2xl font-black text-amber-900 mb-1">
              {selectedPrize?.name}
            </h3>
            <p className="text-amber-800 text-sm mb-4 px-4 font-medium">
              {selectedPrize?.desc}
            </p>
            <div className="inline-flex items-center gap-2 bg-amber-200/80 px-4 py-2 rounded-2xl text-amber-900 font-black text-lg mb-6 border border-amber-300">
              <span>🪙 +{selectedPrize?.coins} كوينز إضافية!</span>
            </div>
            <button
              onClick={handleAccept}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-lg rounded-2xl shadow-lg transition transform active:scale-95"
            >
              استلام الهدية وإضافتها للكنز 🌟
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
