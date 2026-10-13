import React, { useState } from "react";
import { TypingStats } from "../types";
import { BarChart3, TrendingUp, Target, Clock, Calendar } from "lucide-react";

interface ReportsProps {
  stats: TypingStats[];
}

export function Reports({ stats }: ReportsProps) {
  const sortedStats = [...stats].sort((a, b) => b.date - a.date);

  const averageWpm =
    stats.length > 0
      ? Math.round(
          stats.reduce((acc, curr) => acc + curr.wpm, 0) / stats.length,
        )
      : 0;

  const averageAccuracy =
    stats.length > 0
      ? Math.round(
          stats.reduce((acc, curr) => acc + curr.accuracy, 0) / stats.length,
        )
      : 0;

  const bestWpm = stats.length > 0 ? Math.max(...stats.map((s) => s.wpm)) : 0;
  const totalTests = stats.length;

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
          Performance Reports
        </h2>
        <p className="text-slate-600 text-sm sm:text-base">
          Track your progress and see how your typing speed and accuracy improve
          over time.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-3 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <div className="p-2 sm:p-4 bg-indigo-50 text-indigo-600 rounded-xl">
            <TrendingUp size={20} className="sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[10px] sm:text-sm font-medium text-slate-500">Average WPM</p>
            <p className="text-lg sm:text-2xl font-bold text-slate-800">{averageWpm}</p>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <div className="p-2 sm:p-4 bg-emerald-50 text-emerald-600 rounded-xl">
            <Target size={20} className="sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[10px] sm:text-sm font-medium text-slate-500">Avg Accuracy</p>
            <p className="text-lg sm:text-2xl font-bold text-slate-800">
              {averageAccuracy}%
            </p>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <div className="p-2 sm:p-4 bg-amber-50 text-amber-600 rounded-xl">
            <TrophyIcon size={20} className="sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[10px] sm:text-sm font-medium text-slate-500">Best WPM</p>
            <p className="text-lg sm:text-2xl font-bold text-slate-800">{bestWpm}</p>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <div className="p-2 sm:p-4 bg-blue-50 text-blue-600 rounded-xl">
            <BarChart3 size={20} className="sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[10px] sm:text-sm font-medium text-slate-500">Total Sessions</p>
            <p className="text-lg sm:text-2xl font-bold text-slate-800">{totalTests}</p>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-base sm:text-lg font-bold text-slate-800">Recent Activity</h3>
        </div>

        {stats.length === 0 ? (
          <div className="p-8 sm:p-12 text-center text-slate-500 text-sm sm:text-base">
            No typing data yet. Complete a lesson or practice session to see
            your stats here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-white border-b border-slate-200 text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-4 sm:px-6 py-3 sm:py-4">Date</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4">Activity</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4">WPM</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4">Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedStats.map((stat) => (
                  <tr
                    key={stat.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-slate-600 flex items-center gap-1 sm:gap-2">
                      <Calendar size={14} className="text-slate-400 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">{new Date(stat.date).toLocaleDateString()}</span>
                      <span className="sm:hidden">{new Date(stat.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      {" "}
                      {new Date(stat.date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800 capitalize text-sm">
                          {stat.type}
                        </span>
                        {stat.details && (
                          <span className="text-[10px] sm:text-xs text-slate-500 line-clamp-1">
                            {stat.details}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-indigo-100 text-indigo-800">
                        {stat.wpm} WPM
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${
                          stat.accuracy >= 95
                            ? "bg-emerald-100 text-emerald-800"
                            : stat.accuracy >= 90
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {stat.accuracy}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper icon since Trophy isn't imported from lucide-react in this file
function TrophyIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}
