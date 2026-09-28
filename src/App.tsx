import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { RewardsPanel } from './components/RewardsPanel';
import { QuranView } from './components/QuranView';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { ConfettiCanvas } from './components/ConfettiCanvas';
import { StudentModal } from './components/StudentModal';
import { MysteryGiftModal } from './components/MysteryGiftModal';
import { Student, TeacherRewardItem, Ayah, SurahMeta, VerseStatus } from './types/quran';
import { soundManager } from './utils/audio';
import { UserPlus, Sparkles, BookOpen } from 'lucide-react';

const STORAGE_KEY_STUDENTS = 'jihad_academy_students_v2';
const STORAGE_KEY_ACTIVE_STUDENT = 'jihad_academy_active_student_v2';

export default function App() {
  // 1. Students State & Persistence (Fresh start without old dummy students)
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STUDENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse local students:', e);
    }
    return [];
  });

  const [currentStudentId, setCurrentStudentId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_STUDENT);
      if (saved) return saved;
    } catch {}
    return '';
  });

  // Current active student
  const currentStudent = students.find((s) => s.id === currentStudentId) || (students.length > 0 ? students[0] : null);

  // 2. Surah & Reading State
  const [currentSurahNumber, setCurrentSurahNumber] = useState<number>(() => {
    return currentStudent?.lastActiveSurah || 1;
  });

  const [verseStatuses, setVerseStatuses] = useState<Record<number, VerseStatus>>({});
  const [currentReadingAyahNumber, setCurrentReadingAyahNumber] = useState<number | null>(null);

  // 3. Audio & Recitation State
  const [activeAudioAyah, setActiveAudioAyah] = useState<Ayah | null>(null);
  const [activeAudioSurah, setActiveAudioSurah] = useState<SurahMeta | null>(null);
  const [autoPlayAudio, setAutoPlayAudio] = useState(false);

  // 4. Modals & Celebrations
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isMysteryModalOpen, setIsMysteryModalOpen] = useState(false);
  const [celebrationTrigger, setCelebrationTrigger] = useState(0);
  const [celebrationMode, setCelebrationMode] = useState<'confetti' | 'fireworks'>('confetti');
  const [lastSavedTime, setLastSavedTime] = useState<number>(Date.now());

  // Toast notification
  const [toastMessage, setToastMessage] = useState<{ text: string; icon: string; id: number } | null>(null);

  const showToast = (text: string, icon = '🎉') => {
    const id = Date.now();
    setToastMessage({ text, icon, id });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.id === id ? null : prev));
    }, 3800);
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
      if (currentStudentId) {
        localStorage.setItem(STORAGE_KEY_ACTIVE_STUDENT, currentStudentId);
      }
      setLastSavedTime(Date.now());
    } catch (e) {
      console.error('Local save error', e);
    }
  }, [students, currentStudentId]);

  // When switching student, switch current surah to student's last active surah
  const handleSelectStudent = (id: string) => {
    setCurrentStudentId(id);
    const target = students.find((s) => s.id === id);
    if (target && target.lastActiveSurah) {
      setCurrentSurahNumber(target.lastActiveSurah);
      setVerseStatuses({});
      setCurrentReadingAyahNumber(null);
    }
  };

  // Add new student
  const handleAddStudent = (name: string, avatar: string) => {
    const newStudent: Student = {
      id: `student-${Date.now()}`,
      name,
      avatar,
      coins: 0,
      streak: 0,
      totalAyahsRead: 0,
      rewards: {},
      lastActiveSurah: 1,
      lastActiveAyah: 1,
      weeklyProgress: [
        { day: 'السبت', ayahs: 0 },
        { day: 'الأحد', ayahs: 0 },
        { day: 'الإثنين', ayahs: 0 },
        { day: 'الثلاثاء', ayahs: 0 },
        { day: 'الأربعاء', ayahs: 0 },
        { day: 'الخميس', ayahs: 0 },
        { day: 'الجمعة', ayahs: 0 }
      ],
      monthlyProgress: [
        { week: 'الأسبوع 1', ayahs: 0 },
        { week: 'الأسبوع 2', ayahs: 0 },
        { week: 'الأسبوع 3', ayahs: 0 },
        { week: 'الأسبوع 4', ayahs: 0 }
      ],
      dailyChallenge: {
        id: `dc-${Date.now()}`,
        title: 'قراءة وإتقان 5 آيات مباركة',
        surahNumber: 1,
        targetAyahs: 5,
        currentAyahs: 0,
        completed: false,
        rewardCoins: 50
      },
      historyLog: [
        { text: 'انضمام مبارك لمنصة الأستاذة جهاد', timestamp: Date.now(), coinsDiff: 0 }
      ]
    };

    setStudents((prev) => [...prev, newStudent]);
    setCurrentStudentId(newStudent.id);
    soundManager.playStreakBonus();
    showToast(`مرحباً بالبطل الجديد: ${name}! 🎉`, '🌟');
  };

  // Delete student
  const handleDeleteStudent = (id: string) => {
    setStudents((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      if (filtered.length > 0 && currentStudentId === id) {
        setCurrentStudentId(filtered[0].id);
      } else if (filtered.length === 0) {
        setCurrentStudentId('');
      }
      return filtered;
    });
  };

  const handleResetSurahStatuses = () => {
    setVerseStatuses({});
    setCurrentReadingAyahNumber(null);
    showToast('تمت إعادة ضبط تلوين الآيات 🔄', '✨');
  };

  /**
   * Gamification logic for verses
   */
  const handleCorrectVerseRead = (ayahNumber: number) => {
    if (currentReadingAyahNumber !== null && currentReadingAyahNumber !== ayahNumber) {
      setVerseStatuses((prev) => ({
        ...prev,
        [currentReadingAyahNumber]: 'completed',
        [ayahNumber]: 'reading'
      }));

      soundManager.playCoin();

      if (currentStudent) {
        setStudents((prevList) =>
          prevList.map((st) => {
            if (st.id !== currentStudent.id) return st;

            const newStreak = st.streak + 1;
            const newCoins = st.coins + 5;
            const newRewards = { ...st.rewards };

            // Streak milestone (every 3 consecutive correct readings: 3, 6, 9...)
            const isStreakMilestone = newStreak > 0 && newStreak % 3 === 0;

            if (isStreakMilestone) {
              newRewards['icecream'] = (newRewards['icecream'] || 0) + 1;
              setTimeout(() => {
                soundManager.playStreakBonus();
                soundManager.playMumtazCheer(st.name);
                setCelebrationMode('confetti');
                setCelebrationTrigger((c) => c + 1);
                showToast(`🍦 مكافأة السلسلة (${newStreak} متتالية)! حصل ${st.name} على آيس كريم و+10 كوينز!`, '🍦');
              }, 300);
            }

            // Update daily challenge progress if matching
            let updatedChallenge = st.dailyChallenge;
            if (updatedChallenge && !updatedChallenge.completed) {
              const nextAyahs = updatedChallenge.currentAyahs + 1;
              const isDone = nextAyahs >= updatedChallenge.targetAyahs;
              updatedChallenge = {
                ...updatedChallenge,
                currentAyahs: nextAyahs,
                completed: isDone
              };
              if (isDone) {
                setTimeout(() => {
                  soundManager.playGrandCelebration();
                  showToast(`🎉 تم إكمال تحدي اليوم! حصل البطل ${st.name} على +${updatedChallenge?.rewardCoins} 🪙 وكأس الشرف!`, '🏆');
                  setCelebrationMode('fireworks');
                  setCelebrationTrigger((c) => c + 1);
                }, 600);
              }
            }

            return {
              ...st,
              coins: isStreakMilestone ? newCoins + 10 : newCoins,
              streak: newStreak,
              totalAyahsRead: (st.totalAyahsRead || 0) + 1,
              rewards: newRewards,
              dailyChallenge: updatedChallenge,
              lastActiveSurah: currentSurahNumber,
              lastActiveAyah: ayahNumber
            };
          })
        );
      }
    } else {
      setVerseStatuses((prev) => ({
        ...prev,
        [ayahNumber]: 'reading'
      }));
    }

    setCurrentReadingAyahNumber(ayahNumber);
  };

  /**
   * Register mistake
   */
  const handleMistakeVerse = (ayahNumber: number) => {
    setVerseStatuses((prev) => ({
      ...prev,
      [ayahNumber]: 'mistake'
    }));

    if (currentReadingAyahNumber === ayahNumber) {
      setCurrentReadingAyahNumber(null);
    }

    soundManager.playMistake();

    if (currentStudent) {
      setStudents((prevList) =>
        prevList.map((st) => {
          if (st.id !== currentStudent.id) return st;
          return {
            ...st,
            coins: Math.max(0, st.coins - 5),
            streak: 0
          };
        })
      );
    }

    showToast('🔴 خطأ في القراءة! استمع الآن لتصحيح الشيخ المنشاوي', '⚠️');
  };

  const handlePlayCorrectionAudio = (ayah: Ayah, surah: SurahMeta) => {
    setActiveAudioAyah(ayah);
    setActiveAudioSurah(surah);
    setAutoPlayAudio(true);
  };

  const handleAwardReward = (reward: TeacherRewardItem) => {
    if (!currentStudent) {
      setIsStudentModalOpen(true);
      return;
    }

    soundManager.playCoin();
    soundManager.playStreakBonus();

    setStudents((prevList) =>
      prevList.map((st) => {
        if (st.id !== currentStudent.id) return st;
        const currentCount = st.rewards?.[reward.id] || 0;
        return {
          ...st,
          coins: st.coins + reward.coins,
          rewards: {
            ...st.rewards,
            [reward.id]: currentCount + 1
          }
        };
      })
    );

    showToast(`تم منح البطل ${currentStudent.name}: ${reward.name} (+${reward.coins} 🪙)!`, reward.icon);
    setCelebrationMode('confetti');
    setCelebrationTrigger((c) => c + 1);
  };

  const handleClaimMysteryGift = (coins: number, giftName: string) => {
    if (!currentStudent) return;
    setStudents((prevList) =>
      prevList.map((st) => {
        if (st.id !== currentStudent.id) return st;
        const currentCount = st.rewards?.['gift'] || 0;
        return {
          ...st,
          coins: st.coins + coins,
          rewards: {
            ...st.rewards,
            gift: currentCount + 1
          }
        };
      })
    );
    showToast(`مبارك! حصلت على ${giftName} (+${coins} 🪙)!`, '🎁');
    setCelebrationMode('confetti');
    setCelebrationTrigger((c) => c + 1);
  };

  const handleGrandCelebration = () => {
    setCelebrationMode('fireworks');
    setCelebrationTrigger((c) => c + 1);
    soundManager.playGrandCelebration();
    soundManager.playMumtazCheer(currentStudent?.name);
    showToast(`🎉 مبارك للأبطال ختم هذا الورد المبارك في منصة الأستاذة جهاد!`, '👑');
  };

  const handleCompleteChallenge = (studentId: string, rewardCoins: number) => {
    setStudents((prevList) =>
      prevList.map((st) => {
        if (st.id !== studentId) return st;
        const currentCount = st.rewards?.['trophy'] || 0;
        return {
          ...st,
          coins: st.coins + rewardCoins,
          rewards: {
            ...st.rewards,
            trophy: currentCount + 1
          },
          dailyChallenge: st.dailyChallenge
            ? { ...st.dailyChallenge, currentAyahs: st.dailyChallenge.targetAyahs, completed: true }
            : undefined
        };
      })
    );
    showToast(`مبارك! تم إنجاز تحدي اليوم واستلام +${rewardCoins} 🪙!`, '🌟');
    setCelebrationMode('fireworks');
    setCelebrationTrigger((c) => c + 1);
  };

  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(students, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `jihad_academy_students_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('تم تصدير ملف النسخة الاحتياطية بنجاح 💾', '✅');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setStudents(parsed);
          setCurrentStudentId(parsed[0].id);
          showToast('تم استيراد بيانات الطلاب بنجاح! 📥', '🎉');
          setIsStudentModalOpen(false);
        } else {
          alert('ملف غير صالح');
        }
      } catch {
        alert('حدث خطأ أثناء قراءة الملف');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/70 via-orange-50/30 to-amber-100/40 text-slate-800 flex flex-col font-['Cairo'] pb-28">
      {/* Celebration Canvas */}
      <ConfettiCanvas triggerCelebration={celebrationTrigger} mode={celebrationMode} />

      {/* Floating Animated Toast */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="flex items-center gap-2.5 bg-slate-900/90 text-white px-5 py-2.5 rounded-2xl shadow-2xl border-2 border-amber-400 backdrop-blur-md text-sm font-bold">
            <span className="text-xl">{toastMessage.icon}</span>
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Header with moving top ticker and exact title: "منصة تعليم القرآن - منصة الأستاذة جهاد" */}
      <Header
        currentStudent={currentStudent}
        students={students}
        onSelectStudent={handleSelectStudent}
        onOpenStudentModal={() => setIsStudentModalOpen(true)}
        onGrandCelebration={handleGrandCelebration}
        lastSavedTime={lastSavedTime}
      />

      {/* Main Content Area - Optimized specifically for Phone Landscape & Desktop:
          RTL layout:
          - First child: Right side (Quran Mushaf page with natural continuous verses)
          - Second child: Left side (Student Name -> Collected Rewards -> Add Teacher Rewards)
      */}
      <main className="max-w-7xl mx-auto w-full px-3 sm:px-6 py-4 flex flex-col lg:flex-row landscape:flex-row gap-4 flex-1 items-start">
        {/* RIGHT SIDE (Right in RTL): Natural Quran Mushaf View */}
        <QuranView
          currentSurahNumber={currentSurahNumber}
          onSelectSurah={(num) => {
            setCurrentSurahNumber(num);
            setVerseStatuses({});
            setCurrentReadingAyahNumber(null);
            if (currentStudent) {
              setStudents((prev) =>
                prev.map((s) => (s.id === currentStudent.id ? { ...s, lastActiveSurah: num } : s))
              );
            }
          }}
          onCorrectVerseRead={handleCorrectVerseRead}
          onMistakeVerse={handleMistakeVerse}
          onPlayCorrectionAudio={handlePlayCorrectionAudio}
          currentReadingAyahNumber={currentReadingAyahNumber}
          verseStatuses={verseStatuses}
          onResetSurahStatuses={handleResetSurahStatuses}
        />

        {/* LEFT SIDE (Left in RTL): Student Name -> Collected Rewards -> Teacher Rewards Add */}
        <RewardsPanel
          currentStudent={currentStudent}
          students={students}
          onSelectStudent={handleSelectStudent}
          onOpenStudentModal={() => setIsStudentModalOpen(true)}
          onAwardReward={handleAwardReward}
          onOpenMysteryModal={() => setIsMysteryModalOpen(true)}
          onGoToSurah={(surahNum) => {
            setCurrentSurahNumber(surahNum);
            setVerseStatuses({});
            setCurrentReadingAyahNumber(null);
          }}
          onCompleteChallenge={handleCompleteChallenge}
        />
      </main>

      {/* Sheikh Minshawi Correction Audio Player Bar */}
      <AudioPlayerBar
        currentAyah={activeAudioAyah}
        currentSurah={activeAudioSurah}
        onClose={() => setActiveAudioAyah(null)}
        autoPlay={autoPlayAudio}
      />

      {/* Student Management & Add First Student Modal */}
      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        students={students}
        currentStudentId={currentStudentId}
        onSelectStudent={handleSelectStudent}
        onAddStudent={handleAddStudent}
        onDeleteStudent={handleDeleteStudent}
        onExportData={handleExportData}
        onImportData={handleImportData}
      />

      {/* Mystery Gift Modal */}
      <MysteryGiftModal
        isOpen={isMysteryModalOpen}
        onClose={() => setIsMysteryModalOpen(false)}
        studentName={currentStudent?.name || 'البطل'}
        onClaim={handleClaimMysteryGift}
      />
    </div>
  );
}
