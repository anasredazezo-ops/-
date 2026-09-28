import React, { useState } from 'react';
import { X, UserPlus, Trash2, Download, Upload, Award } from 'lucide-react';
import { Student } from '../types/quran';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  currentStudentId: string;
  onSelectStudent: (id: string) => void;
  onAddStudent: (name: string, avatar: string) => void;
  onDeleteStudent: (id: string) => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AVATARS = ['👦🏻', '👧🏻', '🧒🏽', '🧕🏼', '👦🏽', '👧🏼', '⭐', '🦁', '👑', '🕊️'];

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  students,
  currentStudentId,
  onSelectStudent,
  onAddStudent,
  onDeleteStudent,
  onExportData,
  onImportData
}) => {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('يرجى كتابة اسم الطالب أولاً');
      return;
    }
    onAddStudent(name.trim(), selectedAvatar);
    setName('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border-4 border-amber-300 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-amber-100">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👥</span>
            <h2 className="text-xl font-bold text-slate-800">إدارة حسابات الطلاب</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto py-4 space-y-6 flex-1 pr-1 pl-1">
          {/* Add Student Form */}
          <form onSubmit={handleCreate} className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200">
            <h3 className="font-bold text-amber-900 text-sm mb-3 flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-amber-600" />
              <span>إضافة طالب جديد</span>
            </h3>

            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="اسم الطالب (مثال: عبد الرحمن، فاطمة...)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white font-medium text-slate-800 text-sm"
                />
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  اختر شخصية كرتونية مبهجة:
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVATARS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setSelectedAvatar(av)}
                      className={`w-10 h-10 text-xl rounded-xl flex items-center justify-center transition ${
                        selectedAvatar === av
                          ? 'bg-amber-400 scale-110 shadow-md ring-2 ring-amber-600'
                          : 'bg-white hover:bg-amber-100 border border-amber-200'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold rounded-xl shadow transition text-sm flex items-center justify-center gap-2"
              >
                <span>حفظ وإضافة الطالب</span>
              </button>
            </div>
          </form>

          {/* Existing Students List */}
          <div>
            <h3 className="font-bold text-slate-700 text-sm mb-2.5">
              قائمة الطلاب الحاليين ({students.length}):
            </h3>
            <div className="space-y-2">
              {students.map((student) => {
                const isSelected = student.id === currentStudentId;
                return (
                  <div
                    key={student.id}
                    onClick={() => {
                      onSelectStudent(student.id);
                    }}
                    className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition border ${
                      isSelected
                        ? 'bg-amber-100/90 border-amber-400 shadow-sm'
                        : 'bg-slate-50 hover:bg-amber-50/50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl p-1 bg-white rounded-xl shadow-xs border border-amber-200">
                        {student.avatar}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-base">{student.name}</span>
                          {isSelected && (
                            <span className="text-[11px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold">
                              الحالي
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-0.5">
                          <span className="text-amber-600 font-bold">🪙 {student.coins} كوينز</span>
                          <span>•</span>
                          <span>📖 {student.totalAyahsRead || 0} آية</span>
                          <span>•</span>
                          <span className="text-emerald-600 font-bold">⚡ سلسلة: {student.streak || 0}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {students.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`هل أنت متأكد من حذف ملف الطالب (${student.name})؟`)) {
                              onDeleteStudent(student.id);
                            }
                          }}
                          title="حذف الطالب"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Backup & Sync */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <button
              onClick={onExportData}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
              title="تصدير نسخة احتياطية من تقدم الطلاب"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تصدير نسخة</span>
            </button>
            <label className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer transition">
              <Upload className="w-3.5 h-3.5" />
              <span>استيراد نسخة</span>
              <input
                type="file"
                accept=".json"
                onChange={onImportData}
                className="hidden"
              />
            </label>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
