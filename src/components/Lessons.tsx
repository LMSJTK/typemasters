import React, { useState } from "react";
import { defaultLessons } from "../data/defaultLessons";
import { TypingTest } from "./TypingTest";
import { BookOpen, CheckCircle2, ArrowLeft } from "lucide-react";
import { TypingStats } from "../types";

interface LessonsProps {
  onSaveStats: (stats: Omit<TypingStats, "id">) => void;
}

export function Lessons({ onSaveStats }: LessonsProps) {
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<
    Record<string, { wpm: number; accuracy: number }>
  >({});

  const activeLesson = defaultLessons.find((l) => l.id === activeLessonId);

  const handleComplete = (wpm: number, accuracy: number) => {
    if (activeLessonId) {
      setCompletedLessons((prev) => ({
        ...prev,
        [activeLessonId]: { wpm, accuracy },
      }));
      onSaveStats({
        date: Date.now(),
        wpm,
        accuracy,
        type: "lesson",
        details: activeLesson?.title,
      });
    }
  };

  if (activeLesson) {
    return (
      <div className="flex flex-col gap-4 sm:gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
          <button
            onClick={() => setActiveLessonId(null)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
            Back to Lessons
          </button>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 text-center sm:text-left w-full sm:w-auto">
            {activeLesson.title}
          </h2>
          <div className="hidden sm:block w-24"></div> {/* Spacer for centering on larger screens */}
        </div>

        {completedLessons[activeLesson.id] && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 text-sm sm:text-base">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-emerald-500 w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium">Previous Best:</span>
            </div>
            <div className="flex gap-3 sm:gap-4 font-mono text-xs sm:text-sm">
              <span>{completedLessons[activeLesson.id].wpm} WPM</span>
              <span>{completedLessons[activeLesson.id].accuracy}% ACC</span>
            </div>
          </div>
        )}

        <TypingTest text={activeLesson.text} onComplete={handleComplete} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
          Typing Lessons
        </h2>
        <p className="text-slate-600 text-sm sm:text-base">
          Master the keyboard step by step. Start from the basics or jump to
          advanced exercises.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {defaultLessons.map((lesson) => {
          const isCompleted = !!completedLessons[lesson.id];
          const stats = completedLessons[lesson.id];

          return (
            <div
              key={lesson.id}
              onClick={() => setActiveLessonId(lesson.id)}
              className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div
                  className={`p-2 sm:p-3 rounded-lg ${isCompleted ? "bg-emerald-100 text-emerald-600" : "bg-indigo-50 text-indigo-600"}`}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={24} className="w-5 h-5 sm:w-6 sm:h-6" />
                  ) : (
                    <BookOpen size={24} className="w-5 h-5 sm:w-6 sm:h-6" />
                  )}
                </div>
                <span
                  className={`text-[10px] sm:text-xs font-semibold px-2 py-1 rounded-full uppercase tracking-wider
                  ${
                    lesson.difficulty === "beginner"
                      ? "bg-green-100 text-green-700"
                      : lesson.difficulty === "intermediate"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {lesson.difficulty}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
                {lesson.title}
              </h3>

              <p className="text-slate-500 text-xs sm:text-sm line-clamp-2 mb-4 flex-grow font-mono bg-slate-50 p-2 rounded">
                {lesson.text}
              </p>

              {isCompleted && stats && (
                <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-slate-100 text-xs sm:text-sm font-medium">
                  <span className="text-slate-600">Best Score:</span>
                  <div className="flex gap-2 sm:gap-3 text-emerald-600">
                    <span>{stats.wpm} WPM</span>
                    <span>{stats.accuracy}%</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
