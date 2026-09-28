import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';
import { Calendar, TrendingUp, Sparkles, Award } from 'lucide-react';
import { Student } from '../types/quran';

interface StudentStatsChartProps {
  currentStudent: Student;
}

export const StudentStatsChart: React.FC<StudentStatsChartProps> = ({ currentStudent }) => {
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('weekly');

  const weeklyData = currentStudent.weeklyProgress || [
    { day: 'السبت', ayahs: 5 },
    { day: 'الأحد', ayahs: 8 },
    { day: 'الإثنين', ayahs: 6 },
    { day: 'الثلاثاء', ayahs: 7 },
    { day: 'الأربعاء', ayahs: 9 },
    { day: 'الخميس', ayahs: 4 },
    { day: 'الجمعة', ayahs: 3 }
  ];

  const monthlyData = currentStudent.monthlyProgress || [
    { week: 'الأسبوع 1', ayahs: 25 },
    { week: 'الأسبوع 2', ayahs: 32 },
    { week: 'الأسبوع 3', ayahs: 38 },
    { week: 'الأسبوع 4', ayahs: 45 }
  ];

  const totalWeeklyAyahs = weeklyData.reduce((acc, curr) => acc + curr.ayahs, 0);
  const totalMonthlyAyahs = monthlyData.reduce((acc, curr) => acc + curr.ayahs, 0);

  // Custom child-friendly Tooltip
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value?: number }[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/90 text-white px-3 py-2 rounded-xl text-xs shadow-xl border border-amber-400 font-bold backdrop-blur-xs font-['Cairo']">
          <p className="text-amber-300">{label}</p>
          <p className="text-sm flex items-center gap-1 mt-0.5">
            <span>📖</span>
            <span>{payload[0].value} آية مباركة</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border-2 border-amber-200 font-['Cairo']">
      {/* Header with Switcher */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-5 h-5 text-amber-500" />
          <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">
            إحصائيات إنجاز {currentStudent.name}
          </h3>
        </div>

        {/* Toggle Weekly / Monthly */}
        <div className="flex items-center bg-amber-50 p-1 rounded-xl border border-amber-200 text-xs font-bold">
          <button
            onClick={() => setTimeframe('weekly')}
            className={`px-2.5 py-1 rounded-lg transition ${
              timeframe === 'weekly'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-amber-900 hover:bg-amber-100'
            }`}
          >
            أسبوعي
          </button>
          <button
            onClick={() => setTimeframe('monthly')}
            className={`px-2.5 py-1 rounded-lg transition ${
              timeframe === 'monthly'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-amber-900 hover:bg-amber-100'
            }`}
          >
            شهري
          </button>
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-amber-50/70 p-2.5 rounded-2xl border border-amber-200 flex items-center gap-2">
          <span className="text-2xl">📖</span>
          <div>
            <div className="text-[11px] text-slate-500 font-bold">
              {timeframe === 'weekly' ? 'مجموع آيات الأسبوع' : 'مجموع آيات الشهر'}
            </div>
            <div className="text-base font-black text-amber-950">
              {timeframe === 'weekly' ? totalWeeklyAyahs : totalMonthlyAyahs} آية
            </div>
          </div>
        </div>

        <div className="bg-emerald-50/70 p-2.5 rounded-2xl border border-emerald-200 flex items-center gap-2">
          <span className="text-2xl">⭐</span>
          <div>
            <div className="text-[11px] text-slate-500 font-bold">إجمالي المحفوظ</div>
            <div className="text-base font-black text-emerald-900">
              {currentStudent.totalAyahsRead || 0} آية
            </div>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-44 w-full pt-1" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          {timeframe === 'weekly' ? (
            <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FEF3C7" />
              <XAxis
                dataKey="day"
                tick={{ fill: '#78350F', fontSize: 11, fontWeight: 'bold' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#92400E', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="ayahs"
                fill="#F59E0B"
                radius={[8, 8, 0, 0]}
                animationDuration={800}
              />
            </BarChart>
          ) : (
            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMonth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="week"
                tick={{ fill: '#065F46', fontSize: 11, fontWeight: 'bold' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#047857', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="ayahs"
                stroke="#059669"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorMonth)"
                animationDuration={800}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      <p className="mt-2 text-[11px] text-amber-900/70 font-bold text-center">
        {timeframe === 'weekly'
          ? '🌟 رسم بياني يوضح الآيات المحفوظة لكل يوم من أيام الأسبوع'
          : '🚀 معدل تصاعدي لحفظ الآيات القرآنية خلال أسابيع الشهر'}
      </p>
    </div>
  );
};
