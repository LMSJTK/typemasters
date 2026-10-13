import React, { useState, useEffect } from "react";
import { defaultLessons } from "../data/defaultLessons";
import { TypingTest } from "./TypingTest";
import {
  BookOpen,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Plus,
  Filter,
} from "lucide-react";
import { TypingStats, Lesson } from "../types";

interface LessonsProps {
  customLessons?: Lesson[];
  initialLessonId?: string | null;
  onSaveStats: (stats: Omit<TypingStats, "id">) => void;
  onNavigateToDesigner?: () => void;
}

export function Lessons({
  customLessons = [],
  initialLessonId = null,
  onSaveStats,
  onNavigateToDesigner,
}: LessonsProps) {
  const [activeLessonId, setActiveLessonId] = useState<string | null>(
    initialLessonId
  );

  useEffect(() => {
    if (initialLessonId) {
      setActiveLessonId(initialLessonId);
    }
  }, [initialLessonId]);
  const [filterCategory, setFilterCategory] = useState<
    "all" | "builtin" | "custom"
  >("all");
  const [filterDifficulty, setFilterDifficulty] = useState<
    "all" | "beginner" | "intermediate" | "advanced"
  >("all");

  const [completedLessons, setCompletedLessons] = useState<
    Record<string, { wpm: number; accuracy: number }>
  >(() => {
    try {
      const saved = localStorage.getItem("typeMasterCompletedLessons");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "typeMasterCompletedLessons",
      JSON.stringify(completedLessons)
    );
  }, [completedLessons]);

  const allLessons = [...defaultLessons, ...customLessons];
  const activeLesson = allLessons.find((l) => l.id === activeLessonId);

  const handleComplete = (wpm: number, accuracy: number) => {
    if (activeLessonId) {
      setCompletedLessons((prev) => {
        const existing = prev[activeLessonId];
        const isBetter = !existing || wpm > existing.wpm;
        return {
          ...prev,
          [activeLessonId]: isBetter ? { wpm, accuracy } : existing,
        };
      });

      onSaveStats({
        date: Date.now(),
        wpm,
        accuracy,
        type: "lesson",
        details: activeLesson?.title,
      });
    }
  };

  const filteredLessons = allLessons.filter((lesson) => {
    const isCustom = customLessons.some((c) => c.id === lesson.id);
    if (filterCategory === "builtin" && isCustom) return false;
    if (filterCategory === "custom" && !isCustom) return false;
    if (
      filterDifficulty !== "all" &&
      lesson.difficulty !== filterDifficulty
    ) {
      return false;
    }
    return true;
  });

  if (activeLesson) {
    const isCustom = customLessons.some((c) => c.id === activeLesson.id);

    return (
      <div className="flex flex-col gap-4 sm:gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <button
            onClick={() => setActiveLessonId(null)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-sm sm:text-base cursor-pointer"
          >
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
            Back to Lessons
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
              {activeLesson.title}
            </h2>
            <div className="flex items-center gap-2">
              {isCustom && (
                <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles size={12} /> Custom
                </span>
              )}
              <span
                className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  activeLesson.difficulty === "beginner"
                    ? "bg-green-100 text-green-700"
                    : activeLesson.difficulty === "intermediate"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                }`}
              >
                {activeLesson.difficulty}
              </span>
            </div>
          </div>
          <div className="hidden sm:block w-24"></div>
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
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1 sm:mb-2">
            Typing Lessons
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Master the keyboard step by step with built-in exercises and custom
            lessons.
          </p>
        </div>
        {onNavigateToDesigner && (
          <button
            onClick={onNavigateToDesigner}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl shadow-sm hover:bg-indigo-700 transition-colors w-full sm:w-auto text-sm font-semibold cursor-pointer"
          >
            <Plus size={18} />
            Create Custom Lesson
          </button>
        )}
      </div>

      {/* Filter and Category Tabs */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-sm">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setFilterCategory("all")}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              filterCategory === "all"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            All Lessons ({allLessons.length})
          </button>
          <button
            onClick={() => setFilterCategory("builtin")}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              filterCategory === "builtin"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Built-in ({defaultLessons.length})
          </button>
          <button
            onClick={() => setFilterCategory("custom")}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              filterCategory === "custom"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Sparkles size={14} />
            Custom ({customLessons.length})
          </button>
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-2 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
          <Filter size={16} className="text-slate-400 hidden sm:block" />
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value as any)}
            className="w-full md:w-auto px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Empty State when no custom lessons match */}
      {filteredLessons.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
            <Sparkles size={32} />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-2">
            {filterCategory === "custom"
              ? "No Custom Lessons Found"
              : "No Lessons Match Filters"}
          </h3>
          <p className="text-slate-500 text-sm max-w-md mb-6">
            {filterCategory === "custom"
              ? "You haven't created any custom lessons yet. Use the Lesson Designer to create custom typing drills for your students or personal practice."
              : "Try switching filters to view other lessons."}
          </p>
          {filterCategory === "custom" && onNavigateToDesigner && (
            <button
              onClick={onNavigateToDesigner}
              className="px-5 py-2.5 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-sm cursor-pointer"
            >
              Go to Lesson Designer
            </button>
          )}
        </div>
      ) : (
        /* Lessons Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredLessons.map((lesson) => {
            const isCompleted = !!completedLessons[lesson.id];
            const stats = completedLessons[lesson.id];
            const isCustom = customLessons.some((c) => c.id === lesson.id);

            return (
              <div
                key={lesson.id}
                onClick={() => setActiveLessonId(lesson.id)}
                className={`bg-white rounded-2xl p-4 sm:p-6 border shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col h-full relative ${
                  isCustom
                    ? "border-purple-200 hover:border-purple-400"
                    : "border-slate-200 hover:border-indigo-300"
                }`}
              >
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div
                    className={`p-2.5 sm:p-3 rounded-xl ${
                      isCompleted
                        ? "bg-emerald-100 text-emerald-600"
                        : isCustom
                          ? "bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors"
                          : "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2
                        size={24}
                        className="w-5 h-5 sm:w-6 sm:h-6"
                      />
                    ) : isCustom ? (
                      <Sparkles size={24} className="w-5 h-5 sm:w-6 sm:h-6" />
                    ) : (
                      <BookOpen size={24} className="w-5 h-5 sm:w-6 sm:h-6" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isCustom && (
                      <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                        Custom
                      </span>
                    )}
                    <span
                      className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
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
                </div>

                <h3
                  className={`text-lg sm:text-xl font-bold text-slate-800 mb-2 transition-colors ${
                    isCustom
                      ? "group-hover:text-purple-600"
                      : "group-hover:text-indigo-600"
                  }`}
                >
                  {lesson.title}
                </h3>

                <p className="text-slate-500 text-xs sm:text-sm line-clamp-3 mb-4 flex-grow font-mono bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {lesson.text}
                </p>

                {isCompleted && stats && (
                  <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-slate-100 text-xs sm:text-sm font-medium">
                    <span className="text-slate-600">Best Score:</span>
                    <div className="flex gap-2 sm:gap-3 text-emerald-600 font-mono font-bold">
                      <span>{stats.wpm} WPM</span>
                      <span>{stats.accuracy}%</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
