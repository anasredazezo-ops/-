import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, SkipBack, SkipForward, X, Music } from 'lucide-react';
import { Ayah, SurahMeta } from '../types/quran';

interface AudioPlayerBarProps {
  currentAyah: Ayah | null;
  currentSurah: SurahMeta | null;
  onClose: () => void;
  onNextAyah?: () => void;
  onPrevAyah?: () => void;
  autoPlay?: boolean;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  currentAyah,
  currentSurah,
  onClose,
  onNextAyah,
  onPrevAyah,
  autoPlay = false
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [repeatCount, setRepeatCount] = useState<number>(1);
  const [playedCount, setPlayedCount] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!currentAyah || !audioRef.current) return;

    setIsLoading(true);
    setCurrentTime(0);
    setPlayedCount(0);

    const audio = audioRef.current;
    if (currentAyah.audio) {
      audio.src = currentAyah.audio;
      audio.load();
    }

    if (autoPlay) {
      audio.play().then(() => {
        setIsPlaying(true);
        setIsLoading(false);
      }).catch((e) => {
        console.warn('Autoplay prevented or failed:', e);
        setIsPlaying(false);
        setIsLoading(false);
      });
    } else {
      setIsPlaying(false);
      setIsLoading(false);
    }
  }, [currentAyah, autoPlay]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(console.error);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
      setIsLoading(false);
    }
  };

  const handleEnded = () => {
    if (playedCount + 1 < repeatCount) {
      setPlayedCount((prev) => prev + 1);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.error);
      }
    } else {
      setIsPlaying(false);
      setPlayedCount(0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const cycleRepeat = () => {
    // 1 -> 2 -> 3 -> 1
    setRepeatCount((prev) => (prev >= 3 ? 1 : prev + 1));
  };

  const toggleRate = () => {
    const newRate = playbackRate === 1.0 ? 0.8 : 1.0;
    setPlaybackRate(newRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
    }
  };

  if (!currentAyah || !currentSurah) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed bottom-3 left-3 right-3 sm:left-6 sm:right-6 lg:left-8 lg:right-8 z-40 bg-slate-900/95 text-white rounded-3xl p-3.5 sm:p-4 shadow-2xl border-2 border-amber-400 backdrop-blur-md animate-slide-up font-['Cairo']">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={() => setIsLoading(false)}
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Reciter & Ayah details */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-amber-950 flex items-center justify-center font-bold text-lg shadow-inner flex-shrink-0">
            🎙️
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-extrabold text-sm sm:text-base">
                الشيخ محمد صديق المنشاوي
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                تلاوة تعليمية لتصحيح التلاوة
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium truncate mt-0.5">
              {currentSurah.name} • الآية رقم ﴿{currentAyah.numberInSurah}﴾
            </p>
          </div>
        </div>

        {/* Center: Controls + Timeline */}
        <div className="flex flex-col items-center gap-2 w-full max-w-lg">
          <div className="flex items-center gap-3">
            {/* Prev Ayah */}
            {onPrevAyah && (
              <button
                onClick={onPrevAyah}
                title="الآية السابقة"
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            )}

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              disabled={isLoading}
              className="w-11 h-11 rounded-2xl bg-amber-500 hover:bg-amber-400 text-amber-950 flex items-center justify-center shadow-lg transition transform active:scale-95 flex-shrink-0"
              title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل الاستماع للتصحيح'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            {/* Next Ayah */}
            {onNextAyah && (
              <button
                onClick={onNextAyah}
                title="الآية التالية"
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition"
              >
                <SkipBack className="w-4 h-4" />
              </button>
            )}

            {/* Repetition Mode (1x, 2x, 3x) */}
            <button
              onClick={cycleRepeat}
              title={`تكرار التلاوة التعليمية: ${repeatCount} مرات`}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                repeatCount > 1
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <RotateCcw className="w-3 h-3" />
              <span>{repeatCount}× تكرار</span>
            </button>

            {/* Educational Speed Control */}
            <button
              onClick={toggleRate}
              title="سرعة التلاوة (0.8 للتأني التعليمي)"
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition ${
                playbackRate < 1.0
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {playbackRate === 1.0 ? '1.0× طبيعي' : '0.8× تعليمي بطيء'}
            </button>
          </div>

          {/* Time Slider */}
          <div className="flex items-center gap-2 w-full text-[11px] text-slate-400">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 1}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Close Bar Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            title="إخفاء مشغل الصوت"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
