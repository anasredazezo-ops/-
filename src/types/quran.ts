export type VerseStatus = 'normal' | 'reading' | 'completed' | 'mistake';

export interface Ayah {
  number: number; // Global ayah number (1 - 6236)
  numberInSurah: number;
  text: string;
  audio?: string;
  surahNumber: number;
}

export interface SurahMeta {
  number: number;
  name: string;
  englishName?: string;
  revelationType: 'مكية' | 'مدنية';
  numberOfAyahs: number;
  startAyahGlobal: number;
}

export interface StudentReward {
  id: string;
  type: string;
  name: string;
  icon: string;
  value: number;
  count: number;
  color: string;
}

export interface Student {
  id: string;
  name: string;
  avatar: string;
  coins: number;
  streak: number; // current consecutive correct verses
  totalAyahsRead: number;
  rewards: Record<string, number>; // rewardId -> count
  lastActiveSurah: number;
  lastActiveAyah: number;
  weeklyProgress?: { day: string; ayahs: number }[];
  monthlyProgress?: { week: string; ayahs: number }[];
  dailyChallenge?: {
    id: string;
    title: string;
    surahNumber: number;
    targetAyahs: number;
    currentAyahs: number;
    completed: boolean;
    rewardCoins: number;
  };
  historyLog: {
    text: string;
    timestamp: number;
    coinsDiff: number;
  }[];
}


export interface TeacherRewardItem {
  id: string;
  name: string;
  icon: string;
  coins: number;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}
