import React, { useState, useEffect, useRef } from "react";
import { TypingStats } from "../../types";
import {
  ArrowLeft,
  Rocket,
  Crosshair,
  Heart,
  Trophy,
  RotateCcw,
  FastForward,
} from "lucide-react";
import { getGameHighLevels, saveGameHighLevel } from "../../utils/gameLevels";

interface SpaceGameProps {
  onSaveStats: (stats: Omit<TypingStats, "id">) => void;
  onExit: () => void;
}

interface Asteroid {
  id: number;
  text: string;
  x: number;
  y: number;
  speed: number;
  angle: number;
}

const SPACE_LEVEL_WORDS: Record<number, string[]> = {
  1: ["sun", "moon", "star", "mars", "sky", "beam", "ray", "orb", "nova", "glow"],
  2: ["orbit", "comet", "space", "earth", "venus", "solar", "probe", "alien", "pluto"],
  3: ["rocket", "planet", "quasar", "pulsar", "nebula", "meteor", "apollo", "cosmos"],
  4: ["gravity", "shuttle", "station", "eclipse", "starlight", "jupiter", "booster"],
  5: ["asteroid", "universe", "satellite", "telescope", "astronaut", "deepspace"],
  6: ["supernova", "interstellar", "constellation", "blackhole", "propulsion", "astronomy"],
};

export function SpaceGame({ onSaveStats, onExit }: SpaceGameProps) {
  const [highLevel, setHighLevel] = useState(1);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [showLevelSelect, setShowLevelSelect] = useState(false);

  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [destroyedInLevel, setDestroyedInLevel] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [levelComplete, setLevelComplete] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [totalTyped, setTotalTyped] = useState(0);

  const requestRef = useRef<number>();
  const lastAsteroidTimeRef = useRef<number>(0);
  const asteroidsRef = useRef<Asteroid[]>([]);
  const livesRef = useRef(3);
  const destroyedRef = useRef(0);
  const gameOverRef = useRef(false);
  const levelCompleteRef = useRef(false);

  // Load high level on mount
  useEffect(() => {
    const levels = getGameHighLevels();
    setHighLevel(levels.space);
    setCurrentLevel(levels.space);
  }, []);

  // Sync refs
  useEffect(() => {
    asteroidsRef.current = asteroids;
    livesRef.current = lives;
    destroyedRef.current = destroyedInLevel;
    gameOverRef.current = gameOver;
    levelCompleteRef.current = levelComplete;
  }, [asteroids, lives, destroyedInLevel, gameOver, levelComplete]);

  const getLevelParams = (lvl: number) => {
    const targetAsteroids = Math.min(20, 5 + lvl * 2);
    const maxConcurrent = Math.min(4, 1 + Math.floor((lvl - 1) / 2));
    const spawnInterval = Math.max(1600, 4200 - (lvl - 1) * 450);
    const speed = 0.012 + (lvl - 1) * 0.005;

    const wordList =
      SPACE_LEVEL_WORDS[lvl] ||
      SPACE_LEVEL_WORDS[6].concat(SPACE_LEVEL_WORDS[5]);

    return { targetAsteroids, maxConcurrent, spawnInterval, speed, wordList };
  };

  const startLevel = (lvl: number, keepScore = false) => {
    setCurrentLevel(lvl);
    setAsteroids([]);
    setInput("");
    setLives(3);
    setDestroyedInLevel(0);
    setGameOver(false);
    setLevelComplete(false);
    setShowLevelSelect(false);
    setStartTime(Date.now());
    lastAsteroidTimeRef.current = 0;
    if (!keepScore) {
      setScore(0);
      setTotalTyped(0);
    }

    setTimeout(() => {
      document.getElementById("space-input")?.focus();
    }, 50);
  };

  useEffect(() => {
    startLevel(currentLevel);
  }, []);

  const spawnAsteroid = (timestamp: number) => {
    const { targetAsteroids, maxConcurrent, spawnInterval, speed, wordList } =
      getLevelParams(currentLevel);

    // Stop spawning if we reached target or max on screen
    if (
      destroyedRef.current >= targetAsteroids ||
      asteroidsRef.current.length >= maxConcurrent
    ) {
      return;
    }

    if (timestamp - lastAsteroidTimeRef.current > spawnInterval) {
      const side = Math.floor(Math.random() * 3);
      let startX: number, startY: number;

      if (side === 0) {
        startX = Math.random() * 70 + 15;
        startY = -10;
      } else if (side === 1) {
        startX = -10;
        startY = Math.random() * 35;
      } else {
        startX = 110;
        startY = Math.random() * 35;
      }

      const targetX = 50 + (Math.random() * 20 - 10);
      const targetY = 90;
      const dx = targetX - startX;
      const dy = targetY - startY;
      const angle = Math.atan2(dy, dx);

      const newAsteroid: Asteroid = {
        id: Math.random(),
        text: wordList[Math.floor(Math.random() * wordList.length)],
        x: startX,
        y: startY,
        speed: speed * (Math.random() * 0.3 + 0.85),
        angle: angle,
      };

      setAsteroids((prev) => [...prev, newAsteroid]);
      lastAsteroidTimeRef.current = timestamp;
    }
  };

  const updatePositions = (timestamp: number) => {
    if (gameOverRef.current || levelCompleteRef.current) return;

    if (livesRef.current <= 0) {
      setGameOver(true);
      const timeElapsed = (Date.now() - startTime) / 1000 / 60;
      const wpm = Math.round(totalTyped / 5 / Math.max(0.01, timeElapsed)) || 0;
      onSaveStats({
        date: Date.now(),
        wpm,
        accuracy: 100,
        type: "game",
        details: `Space Defender - Level ${currentLevel} (Failed)`,
      });
      return;
    }

    setAsteroids((prev) => {
      let lostLife = false;
      const nextAsteroids = prev
        .map((a) => ({
          ...a,
          x: a.x + Math.cos(a.angle) * a.speed * 1.8,
          y: a.y + Math.sin(a.angle) * a.speed * 1.8,
        }))
        .filter((a) => {
          // Check collision with ship near bottom center
          if (a.y > 80 && a.x > 38 && a.x < 62) {
            lostLife = true;
            return false;
          }
          if (a.y > 110) return false;
          return true;
        });

      if (lostLife) {
        setLives((l) => Math.max(0, l - 1));
      }
      return nextAsteroids;
    });

    spawnAsteroid(timestamp);
    requestRef.current = requestAnimationFrame(updatePositions);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updatePositions);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameOver, levelComplete, currentLevel]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameOver || levelComplete) return;

    const val = e.target.value.toLowerCase();
    setInput(val);

    const matchedIndex = asteroids.findIndex((a) => a.text === val);
    if (matchedIndex !== -1) {
      const matched = asteroids[matchedIndex];
      const pts = matched.text.length * 10 * currentLevel;
      setScore((s) => s + pts);
      setTotalTyped((t) => t + matched.text.length);
      setAsteroids((prev) => prev.filter((_, i) => i !== matchedIndex));
      setInput("");

      const nextDestroyed = destroyedInLevel + 1;
      setDestroyedInLevel(nextDestroyed);

      const { targetAsteroids } = getLevelParams(currentLevel);
      if (nextDestroyed >= targetAsteroids) {
        // Level cleared!
        setLevelComplete(true);
        const nextLvl = currentLevel + 1;
        if (nextLvl > highLevel) {
          setHighLevel(nextLvl);
          saveGameHighLevel("space", nextLvl);
        }

        const timeElapsed = (Date.now() - startTime) / 1000 / 60;
        const wpm =
          Math.round((totalTyped + matched.text.length) / 5 / Math.max(0.01, timeElapsed)) || 0;

        onSaveStats({
          date: Date.now(),
          wpm,
          accuracy: 100,
          type: "game",
          details: `Space Defender - Level ${currentLevel} Cleared`,
        });
      }
    }
  };

  const { targetAsteroids } = getLevelParams(currentLevel);
  const progressPercent = Math.min(
    100,
    Math.round((destroyedInLevel / targetAsteroids) * 100)
  );

  return (
    <div className="flex flex-col h-[530px] sm:h-[630px] bg-slate-900 rounded-2xl overflow-hidden relative shadow-2xl border border-slate-700 select-none">
      {/* Starfield Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              width: (i % 3) + 1 + "px",
              height: (i % 3) + 1 + "px",
              left: ((i * 17) % 100) + "%",
              top: ((i * 23) % 100) + "%",
              animationDuration: (i % 3) + 2 + "s",
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="flex justify-between items-center p-3 sm:p-4 bg-slate-800/80 backdrop-blur-sm z-10 border-b border-slate-700">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onExit}
            className="text-slate-300 hover:text-white flex items-center gap-1 sm:gap-2 text-sm sm:text-base cursor-pointer"
          >
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />{" "}
            <span className="hidden sm:inline">Exit</span>
          </button>

          {/* Level Badge with Selector */}
          <button
            onClick={() => setShowLevelSelect(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 rounded-lg text-purple-300 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            title="Change Sector Level"
          >
            <Trophy size={14} className="text-amber-400" />
            <span>Level {currentLevel}</span>
          </button>
        </div>

        {/* Progress & Lives */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Target Progress */}
          <div className="flex flex-col items-end">
            <span className="text-[10px] sm:text-xs text-slate-400">
              Asteroids: {destroyedInLevel} / {targetAsteroids}
            </span>
            <div className="w-20 sm:w-28 h-1.5 bg-slate-700 rounded-full overflow-hidden mt-0.5">
              <div
                className="h-full bg-purple-500 transition-all duration-200"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1 text-purple-400 font-bold text-sm sm:text-lg font-mono">
            <Crosshair size={18} /> {score}
          </div>

          <div className="flex items-center gap-1 text-rose-500">
            {[...Array(3)].map((_, i) => (
              <Heart
                key={i}
                size={18}
                className="sm:w-5 sm:h-5"
                fill={i < lives ? "currentColor" : "none"}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Level Select Modal */}
      {showLevelSelect && (
        <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md z-50 p-6 flex flex-col items-center justify-center animate-in fade-in duration-150">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Trophy size={24} className="text-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">
              Select Asteroid Sector
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Your highest reached sector is{" "}
              <strong className="text-amber-400">Level {highLevel}</strong>. You
              can practice any unlocked sector or start over from the beginning!
            </p>

            <div className="grid grid-cols-4 gap-2 mb-6 max-h-48 overflow-y-auto p-1">
              {Array.from({ length: Math.max(highLevel, 8) }, (_, i) => i + 1)
                .slice(0, Math.max(highLevel, 4))
                .map((lvl) => {
                  const isUnlocked = lvl <= highLevel;
                  const isSelected = lvl === currentLevel;
                  return (
                    <button
                      key={lvl}
                      disabled={!isUnlocked}
                      onClick={() => startLevel(lvl, false)}
                      className={`p-2.5 rounded-xl text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? "bg-purple-600 text-white font-bold ring-2 ring-purple-400"
                          : isUnlocked
                            ? "bg-slate-700 hover:bg-slate-600 text-slate-200"
                            : "bg-slate-800/50 text-slate-600 cursor-not-allowed border border-slate-700/40"
                      }`}
                    >
                      <span className="text-sm font-bold">Level {lvl}</span>
                    </button>
                  );
                })}
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => startLevel(1, false)}
                className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer"
              >
                Restart from Level 1
              </button>
              <button
                onClick={() => setShowLevelSelect(false)}
                className="w-full py-2 text-slate-400 hover:text-white text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Area */}
      <div
        className="flex-grow relative overflow-hidden"
        onClick={() => document.getElementById("space-input")?.focus()}
      >
        <input
          id="space-input"
          type="text"
          value={input}
          onChange={handleInput}
          disabled={gameOver || levelComplete}
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          className="absolute inset-0 w-full h-full opacity-0 cursor-text z-10"
        />

        {/* Player Ship */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center pointer-events-none">
          <Rocket size={44} className="text-purple-400" />
          <div className="w-12 h-3 bg-purple-500/30 rounded-full mt-1 blur-sm animate-pulse"></div>
        </div>

        {/* Asteroids */}
        {asteroids.map((asteroid) => {
          const isPrefix = input && asteroid.text.startsWith(input);

          return (
            <div
              key={asteroid.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-transform pointer-events-none"
              style={{
                left: `${asteroid.x}%`,
                top: `${asteroid.y}%`,
              }}
            >
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full mb-1 flex items-center justify-center border-2
                ${
                  isPrefix
                    ? "bg-purple-900/60 border-purple-400 animate-pulse"
                    : "bg-slate-800 border-slate-600"
                }`}
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-slate-700 rounded-full opacity-60"></div>
              </div>
              <div
                className={`font-mono text-xs sm:text-sm font-bold px-2 py-0.5 rounded shadow-lg
                ${
                  isPrefix
                    ? "bg-purple-600 text-white"
                    : "bg-slate-800 text-slate-300 border border-slate-700"
                }`}
              >
                {isPrefix ? (
                  <>
                    <span className="text-white font-extrabold">{input}</span>
                    <span className="text-purple-200">
                      {asteroid.text.slice(input.length)}
                    </span>
                  </>
                ) : (
                  asteroid.text
                )}
              </div>
            </div>
          );
        })}

        {/* Level Complete Overlay */}
        {levelComplete && (
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center z-40 p-4 text-center animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <Trophy size={32} className="text-amber-400" />
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-emerald-400 mb-1">
              Sector {currentLevel} Cleared!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mb-4">
              All asteroid threats eliminated! Unlocked Sector {currentLevel + 1}.
            </p>
            <div className="bg-slate-800/90 border border-slate-700 rounded-xl px-6 py-2.5 mb-5 flex items-center gap-6 shadow-md">
              <div>
                <span className="text-[10px] uppercase text-slate-400 block">
                  Total Score
                </span>
                <span className="text-2xl font-bold text-purple-400 font-mono">
                  {score}
                </span>
              </div>
              <div className="w-px h-8 bg-slate-700"></div>
              <div>
                <span className="text-[10px] uppercase text-slate-400 block">
                  Destroyed
                </span>
                <span className="text-xl font-bold text-emerald-400 font-mono">
                  {targetAsteroids} Asteroids
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-center w-full max-w-md">
              <button
                onClick={() => startLevel(currentLevel + 1, true)}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-600/30 text-sm sm:text-base flex-1 min-w-[150px]"
              >
                <FastForward size={18} /> Next Sector ({currentLevel + 1})
              </button>
              <button
                onClick={() => startLevel(1, false)}
                className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-semibold transition-colors cursor-pointer text-xs sm:text-sm"
              >
                Restart Level 1
              </button>
              <button
                onClick={onExit}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-colors cursor-pointer text-xs sm:text-sm"
              >
                Exit
              </button>
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center z-40 p-4 text-center animate-in fade-in duration-200">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-rose-500 mb-1">
              Hull Breached!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mb-4">
              Your ship sustained critical damage in Sector {currentLevel}.
            </p>
            <p className="text-base sm:text-lg text-slate-200 mb-5 font-mono">
              Final Score:{" "}
              <span className="text-purple-400 font-bold">{score}</span>
            </p>
            <div className="flex flex-wrap gap-2 justify-center w-full max-w-md">
              <button
                onClick={() => startLevel(currentLevel, false)}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-600/30 text-sm sm:text-base flex-1 min-w-[150px]"
              >
                <RotateCcw size={18} /> Retry Sector {currentLevel}
              </button>
              <button
                onClick={() => startLevel(1, false)}
                className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-semibold transition-colors cursor-pointer text-xs sm:text-sm"
              >
                Restart Level 1
              </button>
              <button
                onClick={onExit}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-colors cursor-pointer text-xs sm:text-sm"
              >
                Exit
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-5 bg-slate-800 border-t border-slate-700 flex justify-center z-20 relative">
        <div className="w-full max-w-md bg-slate-900 border-2 border-purple-500 rounded-xl px-4 py-2 sm:py-3 text-lg sm:text-2xl text-white font-mono text-center transition-all flex items-center justify-center min-h-[50px] sm:min-h-[56px]">
          {input || <span className="text-slate-500">Target lock...</span>}
        </div>
      </div>
    </div>
  );
}
