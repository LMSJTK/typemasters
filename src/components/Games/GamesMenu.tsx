import React, { useState, useEffect } from "react";
import { FallingWords } from "./FallingWords";
import { RacingGame } from "./RacingGame";
import { SpaceGame } from "./SpaceGame";
import { TypingStats } from "../../types";
import { Gamepad2, Rocket, Car, Trophy, Sparkles } from "lucide-react";
import { getGameHighLevels } from "../../utils/gameLevels";

interface GamesMenuProps {
  onSaveStats: (stats: Omit<TypingStats, "id">) => void;
}

export function GamesMenu({ onSaveStats }: GamesMenuProps) {
  const [activeGame, setActiveGame] = useState<
    "falling" | "space" | "racing" | null
  >(null);
  const [highLevels, setHighLevels] = useState({ racing: 1, space: 1, falling: 1 });

  useEffect(() => {
    setHighLevels(getGameHighLevels());
  }, [activeGame]);

  if (activeGame === "falling") {
    return (
      <FallingWords
        onSaveStats={onSaveStats}
        onExit={() => setActiveGame(null)}
      />
    );
  }

  if (activeGame === "racing") {
    return (
      <RacingGame
        onSaveStats={onSaveStats}
        onExit={() => setActiveGame(null)}
      />
    );
  }

  if (activeGame === "space") {
    return (
      <SpaceGame onSaveStats={onSaveStats} onExit={() => setActiveGame(null)} />
    );
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
          Typing Games
        </h2>
        <p className="text-slate-600 text-sm sm:text-base">
          Level up your typing speed and reflexes with arcade-style progression.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Falling Words */}
        <div
          onClick={() => setActiveGame("falling")}
          className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col items-center text-center relative overflow-hidden"
        >
          {/* Level badge */}
          <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 bg-indigo-50 border border-indigo-200/60 rounded-full text-indigo-700 text-xs font-bold">
            <Trophy size={13} className="text-amber-500" />
            <span>Level {highLevels.falling}</span>
          </div>

          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-indigo-600 transition-colors">
            <Gamepad2
              size={32}
              className="sm:w-10 sm:h-10 text-indigo-600 group-hover:text-white transition-colors"
            />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2 sm:mb-3">
            Falling Words
          </h3>
          <p className="text-slate-600 text-sm sm:text-base mb-4 flex-grow">
            Type the falling words before they hit the ground. Starts slow and
            gentle, accelerating with each level you clear!
          </p>

          <div className="w-full pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Progress: Level {highLevels.falling}</span>
            <span className="text-indigo-600 group-hover:underline">Play Now →</span>
          </div>
        </div>

        {/* Space Game */}
        <div
          onClick={() => setActiveGame("space")}
          className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col items-center text-center relative overflow-hidden"
        >
          {/* Level badge */}
          <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 bg-purple-50 border border-purple-200/60 rounded-full text-purple-700 text-xs font-bold">
            <Trophy size={13} className="text-amber-500" />
            <span>Level {highLevels.space}</span>
          </div>

          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-100 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-purple-600 transition-colors">
            <Rocket
              size={32}
              className="sm:w-10 sm:h-10 text-purple-600 group-hover:text-white transition-colors"
            />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2 sm:mb-3">
            Space Defender
          </h3>
          <p className="text-slate-600 text-sm sm:text-base mb-4 flex-grow">
            Defend your starship by typing asteroid codes. Clear sector quotas
            to unlock faster asteroids and longer deep-space words.
          </p>

          <div className="w-full pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Sector: Level {highLevels.space}</span>
            <span className="text-purple-600 group-hover:underline">Play Now →</span>
          </div>
        </div>

        {/* Racing Game */}
        <div
          onClick={() => setActiveGame("racing")}
          className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col items-center text-center relative overflow-hidden sm:col-span-2 lg:col-span-1"
        >
          {/* Level badge */}
          <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 bg-rose-50 border border-rose-200/60 rounded-full text-rose-700 text-xs font-bold">
            <Trophy size={13} className="text-amber-500" />
            <span>Level {highLevels.racing}</span>
          </div>

          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-rose-100 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-rose-600 transition-colors">
            <Car
              size={32}
              className="sm:w-10 sm:h-10 text-rose-600 group-hover:text-white transition-colors"
            />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2 sm:mb-3">
            Type Racer
          </h3>
          <p className="text-slate-600 text-sm sm:text-base mb-4 flex-grow">
            Race against rival cars. Starts with short phrases against 18 WPM
            rookies, scaling up to full Grand Prix master paragraphs!
          </p>

          <div className="w-full pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Circuit: Level {highLevels.racing}</span>
            <span className="text-rose-600 group-hover:underline">Play Now →</span>
          </div>
        </div>
      </div>
    </div>
  );
}
