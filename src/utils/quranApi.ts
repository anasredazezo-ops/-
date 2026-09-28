import { Ayah } from '../types/quran';

// In-memory cache for loaded surahs
const surahCache = new Map<number, Ayah[]>();

// Pre-cached popular short surahs for instant offline / zero-latency experience
const PRECACHED_SURAHS: Record<number, { numberInSurah: number; text: string; globalOffset: number }[]> = {
  // Al-Fatihah
  1: [
    { numberInSurah: 1, text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', globalOffset: 1 },
    { numberInSurah: 2, text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', globalOffset: 2 },
    { numberInSurah: 3, text: 'الرَّحْمَٰنِ الرَّحِيمِ', globalOffset: 3 },
    { numberInSurah: 4, text: 'مَالِكِ يَوْمِ الدِّينِ', globalOffset: 4 },
    { numberInSurah: 5, text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', globalOffset: 5 },
    { numberInSurah: 6, text: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', globalOffset: 6 },
    { numberInSurah: 7, text: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ', globalOffset: 7 }
  ],
  // Al-Ikhlas
  112: [
    { numberInSurah: 1, text: 'قُلْ هُوَ اللَّهُ أَحَدٌ', globalOffset: 6222 },
    { numberInSurah: 2, text: 'اللَّهُ الصَّمَدُ', globalOffset: 6223 },
    { numberInSurah: 3, text: 'لَمْ يَلِدْ وَلَمْ يُولَدْ', globalOffset: 6224 },
    { numberInSurah: 4, text: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ', globalOffset: 6225 }
  ],
  // Al-Falaq
  113: [
    { numberInSurah: 1, text: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ', globalOffset: 6226 },
    { numberInSurah: 2, text: 'مِن شَرِّ مَا خَلَقَ', globalOffset: 6227 },
    { numberInSurah: 3, text: 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ', globalOffset: 6228 },
    { numberInSurah: 4, text: 'وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ', globalOffset: 6229 },
    { numberInSurah: 5, text: 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ', globalOffset: 6230 }
  ],
  // An-Nas
  114: [
    { numberInSurah: 1, text: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ', globalOffset: 6231 },
    { numberInSurah: 2, text: 'مَلِكِ النَّاسِ', globalOffset: 6232 },
    { numberInSurah: 3, text: 'إِلَٰهِ النَّاسِ', globalOffset: 6233 },
    { numberInSurah: 4, text: 'مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ', globalOffset: 6234 },
    { numberInSurah: 5, text: 'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ', globalOffset: 6235 },
    { numberInSurah: 6, text: 'مِنَ الْجِنَّةِ وَالنَّاسِ', globalOffset: 6236 }
  ],
  // Al-Kawthar
  108: [
    { numberInSurah: 1, text: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ', globalOffset: 6205 },
    { numberInSurah: 2, text: 'فَصَلِّ لِرَبِّكَ وَانْحَرْ', globalOffset: 6206 },
    { numberInSurah: 3, text: 'إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ', globalOffset: 6207 }
  ],
  // Al-Asr
  103: [
    { numberInSurah: 1, text: 'وَالْعَصْرِ', globalOffset: 6177 },
    { numberInSurah: 2, text: 'إِنَّ الْإِنسَانَ لَفِي خُسْرٍ', globalOffset: 6178 },
    { numberInSurah: 3, text: 'إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ', globalOffset: 6179 }
  ],
  // Al-Nasr
  110: [
    { numberInSurah: 1, text: 'إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ', globalOffset: 6214 },
    { numberInSurah: 2, text: 'وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللَّهِ أَفْوَاجًا', globalOffset: 6215 },
    { numberInSurah: 3, text: 'فَسَبِّحْ بِحَمْدِ رَبِّكَ وَاسْتَغْفِرْهُ ۚ إِنَّهُ كَانَ تَوَّابًا', globalOffset: 6216 }
  ]
};

/**
 * Returns direct CDN audio URL for Sheikh Mohamed Siddiq El-Minshawi for a given global ayah number.
 * Primary: Islamic Network CDN
 * Fallback: EveryAyah CDN
 */
export function getMinshawiAudioUrl(surahNumber: number, ayahInSurah: number, globalNumber?: number): string {
  if (globalNumber) {
    return `https://cdn.islamic.network/quran/audio/128/ar.minshawi/${globalNumber}.mp3`;
  }
  const sStr = String(surahNumber).padStart(3, '0');
  const aStr = String(ayahInSurah).padStart(3, '0');
  return `https://everyayah.com/data/Minshawy_Murattal_128kbps/${sStr}${aStr}.mp3`;
}

/**
 * Fetches surah text with Uthmani script and audio URLs.
 */
export async function fetchSurahAyahs(surahNumber: number): Promise<Ayah[]> {
  // Check memory cache
  if (surahCache.has(surahNumber)) {
    return surahCache.get(surahNumber)!;
  }

  // Check localStorage cache
  try {
    const local = localStorage.getItem(`surah_cache_${surahNumber}`);
    if (local) {
      const parsed: Ayah[] = JSON.parse(local);
      surahCache.set(surahNumber, parsed);
      return parsed;
    }
  } catch {
    // ignore
  }

  try {
    // Fetch text from Alquran.cloud API
    const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/quran-uthmani`);
    if (!response.ok) {
      throw new Error(`API error ${response.status}`);
    }

    const data = await response.json();
    if (data.code === 200 && data.data && Array.isArray(data.data.ayahs)) {
      const ayahs: Ayah[] = data.data.ayahs.map((item: { number: number; numberInSurah: number; text: string }) => {
        let text = item.text;
        // If surah is not Al-Fatihah (1) and not At-Tawbah (9), remove initial Bismillah if attached
        if (surahNumber !== 1 && surahNumber !== 9 && item.numberInSurah === 1) {
          const bismillahUthmani = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
          const bismillahSimple = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
          if (text.startsWith(bismillahUthmani)) {
            text = text.replace(bismillahUthmani, '').trim();
          } else if (text.startsWith(bismillahSimple)) {
            text = text.replace(bismillahSimple, '').trim();
          }
        }

        return {
          number: item.number,
          numberInSurah: item.numberInSurah,
          text: text,
          audio: getMinshawiAudioUrl(surahNumber, item.numberInSurah, item.number),
          surahNumber
        };
      });

      surahCache.set(surahNumber, ayahs);
      try {
        localStorage.setItem(`surah_cache_${surahNumber}`, JSON.stringify(ayahs));
      } catch {
        // storage quota might be tight
      }
      return ayahs;
    }
  } catch (error) {
    console.warn(`Error fetching Surah ${surahNumber} from API:`, error);
  }

  // Fallback to pre-cached data if available
  if (PRECACHED_SURAHS[surahNumber]) {
    const list = PRECACHED_SURAHS[surahNumber].map(v => ({
      number: v.globalOffset,
      numberInSurah: v.numberInSurah,
      text: v.text,
      audio: getMinshawiAudioUrl(surahNumber, v.numberInSurah, v.globalOffset),
      surahNumber
    }));
    surahCache.set(surahNumber, list);
    return list;
  }

  // Generic fallback if network fails
  const sStr = String(surahNumber).padStart(3, '0');
  const dummyList: Ayah[] = Array.from({ length: 5 }, (_, i) => ({
    number: i + 1,
    numberInSurah: i + 1,
    text: `آية رقم ${i + 1} من سورة رقم ${surahNumber} (يرجى التحقق من اتصال الإنترنت لجلب الرسم العثماني الكامل)`,
    audio: `https://everyayah.com/data/Minshawy_Murattal_128kbps/${sStr}${String(i + 1).padStart(3, '0')}.mp3`,
    surahNumber
  }));
  return dummyList;
}
