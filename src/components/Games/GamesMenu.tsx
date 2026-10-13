import React, { useState } from "react";
import { FallingWords } from "./FallingWords";
import { RacingGame } from "./RacingGame";
import { SpaceGame } from "./SpaceGame";
import { TypingStats } from "../../types";
import { Gamepad2, Rocket, Car } from "lucide-react";

interface GamesMenuProps {
  onSaveStats: (stats: Omit<TypingStats, "id">) => void;
}

export function GamesMenu({ onSaveStats }: GamesMenuProps) {
  const [activeGame, setActiveGame] = useState<
    "falling" | "space" | "racing" | null
  >(null);

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
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Typing Games</h2>
        <p className="text-slate-600 text-sm sm:text-base">
          Improve your typing speed and accuracy while having fun.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Falling Words */}
        <div
          onClick={() => setActiveGame("falling")}
          className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col items-center text-center"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-indigo-600 transition-colors">
            <Gamepad2
              size={32}
              className="sm:w-10 sm:h-10 text-indigo-600 group-hover:text-white transition-colors"
            />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2 sm:mb-3">
            Falling Words
          </h3>
          <p className="text-slate-600 text-sm sm:text-base">
            Type the words before they hit the ground. Speed increases as you
            score!
          </p>
        </div>

        {/* Space Game */}
        <div
          onClick={() => setActiveGame("space")}
          className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col items-center text-center relative overflow-hidden"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-purple-600 transition-colors">
            <Rocket
              size={32}
              className="sm:w-10 sm:h-10 text-purple-600 group-hover:text-white transition-colors"
            />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2 sm:mb-3">
            Space Defender
          </h3>
          <p className="text-slate-600 text-sm sm:text-base">
            Shoot down asteroids by typing the words attached to them.
          </p>
        </div>

        {/* Racing Game */}
        <div
          onClick={() => setActiveGame("racing")}
          className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col items-center text-center relative overflow-hidden sm:col-span-2 lg:col-span-1"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-rose-100 rounded-full flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-rose-600 transition-colors">
            <Car
              size={32}
              className="sm:w-10 sm:h-10 text-rose-600 group-hover:text-white transition-colors"
            />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2 sm:mb-3">Type Racer</h3>
          <p className="text-slate-600 text-sm sm:text-base">
            Race against the clock. The faster you type, the faster your car
            goes.
          </p>
        </div>
      </div>
    </div>
  );
}
