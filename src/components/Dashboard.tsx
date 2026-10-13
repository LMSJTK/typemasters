import React from "react";
import { ViewState, TypingStats } from "../types";
import {
  BookOpen,
  Keyboard,
  Gamepad2,
  BarChart3,
  Edit3,
  Trophy,
  Clock,
  Target,
} from "lucide-react";

interface DashboardProps {
  onChangeView: (view: ViewState) => void;
  stats: TypingStats[];
}

export function Dashboard({ onChangeView, stats }: DashboardProps) {
  const recentStats = [...stats].sort((a, b) => b.date - a.date).slice(0, 3);
  const bestWpm = stats.length > 0 ? Math.max(...stats.map((s) => s.wpm)) : 0;
  const averageAccuracy =
    stats.length > 0
      ? Math.round(
          stats.reduce((acc, curr) => acc + curr.accuracy, 0) / stats.length,
        )
      : 0;

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Welcome back to TypeMaster
          </h1>
          <p className="text-indigo-100 text-base sm:text-lg max-w-2xl">
            Ready to improve your typing speed today? Choose a lesson, practice
            with real texts, or play a game to warm up.
          </p>
        </div>
        <div className="absolute right-0 top-0 w-64 h-full opacity-10 pointer-events-none hidden sm:block">
          <Keyboard
            size={256}
            className="absolute -right-12 -top-12 transform rotate-12"
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-3 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <div className="p-2 sm:p-4 bg-yellow-100 text-yellow-600 rounded-xl">
            <Trophy size={20} className="sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[10px] sm:text-sm font-medium text-slate-500">Best Speed</p>
            <p className="text-lg sm:text-2xl font-bold text-slate-800">{bestWpm} WPM</p>
          </div>
        </div>
        <div className="bg-white p-3 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <div className="p-2 sm:p-4 bg-emerald-100 text-emerald-600 rounded-xl">
            <Target size={20} className="sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[10px] sm:text-sm font-medium text-slate-500">Avg Accuracy</p>
            <p className="text-lg sm:text-2xl font-bold text-slate-800">
              {averageAccuracy}%
            </p>
          </div>
        </div>
        <div className="bg-white p-3 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 col-span-2 lg:col-span-1">
          <div className="p-2 sm:p-4 bg-blue-100 text-blue-600 rounded-xl">
            <Clock size={20} className="sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[10px] sm:text-sm font-medium text-slate-500">
              Sessions Completed
            </p>
            <p className="text-lg sm:text-2xl font-bold text-slate-800">{stats.length}</p>
          </div>
        </div>
      </div>

      {/* Main Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <button
          onClick={() => onChangeView("lessons")}
          className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group text-left flex flex-col gap-3 sm:gap-4"
        >
          <div className="p-3 sm:p-4 bg-indigo-50 text-indigo-600 rounded-xl w-fit group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <BookOpen size={28} className="sm:w-8 sm:h-8" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-1">Lessons</h3>
            <p className="text-slate-500 text-xs sm:text-sm">
              Structured exercises to build muscle memory from the ground up.
            </p>
          </div>
        </button>

        <button
          onClick={() => onChangeView("practice")}
          className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group text-left flex flex-col gap-3 sm:gap-4"
        >
          <div className="p-3 sm:p-4 bg-emerald-50 text-emerald-600 rounded-xl w-fit group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <Keyboard size={28} className="sm:w-8 sm:h-8" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-1">
              Practice Area
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm">
              Type real-world paragraphs to improve sustained speed.
            </p>
          </div>
        </button>

        <button
          onClick={() => onChangeView("games")}
          className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-rose-300 transition-all group text-left flex flex-col gap-3 sm:gap-4"
        >
          <div className="p-3 sm:p-4 bg-rose-50 text-rose-600 rounded-xl w-fit group-hover:bg-rose-600 group-hover:text-white transition-colors">
            <Gamepad2 size={28} className="sm:w-8 sm:h-8" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-1">
              Typing Games
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm">
              Have fun while improving your typing speed and reflexes.
            </p>
          </div>
        </button>

        <button
          onClick={() => onChangeView("reports")}
          className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group text-left flex flex-col gap-3 sm:gap-4"
        >
          <div className="p-3 sm:p-4 bg-blue-50 text-blue-600 rounded-xl w-fit group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <BarChart3 size={28} className="sm:w-8 sm:h-8" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-1">Reports</h3>
            <p className="text-slate-500 text-xs sm:text-sm">
              View detailed statistics and track your progress over time.
            </p>
          </div>
        </button>

        <button
          onClick={() => onChangeView("designer")}
          className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-300 transition-all group text-left flex flex-col gap-3 sm:gap-4 sm:col-span-2 lg:col-span-2"
        >
          <div className="p-3 sm:p-4 bg-purple-50 text-purple-600 rounded-xl w-fit group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <Edit3 size={28} className="sm:w-8 sm:h-8" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-1">
              Lesson Designer
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm">
              Create custom typing exercises for specific needs or students.
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
