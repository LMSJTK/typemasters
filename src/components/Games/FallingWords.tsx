import React, { useState, useEffect, useRef } from "react";
import { TypingStats } from "../../types";
import {
  ArrowLeft,
  Trophy,
  Heart,
  RotateCcw,
  FastForward,
} from "lucide-react";
import { getGameHighLevels, saveGameHighLevel } from "../../utils/gameLevels";

interface FallingWordsProps {
  onSaveStats: (stats: Omit<TypingStats, "id">) => void;
  onExit: () => void;
}

interface Word {
  id: number;
  text: string;
  x: number;
  y: number;
  speed: number;
}

const FALLING_LEVEL_WORDS: Record<number, string[]> = {
  1: ["cat", "dog", "sun", "cup", "pen", "box", "red", "run", "sky", "tree", "blue", "star", "hat"],
  2: ["apple", "grape", "lemon", "mango", "berry", "peach", "melon", "fruit", "water", "bread"],
  3: ["banana", "cherry", "orange", "papaya", "tomato", "potato", "carrot", "cheese", "butter"],
  4: ["computer", "keyboard", "monitor", "software", "network", "browser", "hardware", "desktop"],
  5: ["strawberry", "watermelon", "technology", "internet", "database", "security", "terminal"],
  6: ["programming", "development", "architecture", "engineering", "intelligence", "connection"],
};

export function FallingWords({ onSaveStats, onExit }: FallingWordsProps) {
  const [highLevel, setHighLevel] = useState(1);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [showLevelSelect, setShowLevelSelect] = useState(false);

  const [words, setWords] = useState<Word[]>([]);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [clearedInLevel, setClearedInLevel] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [levelComplete, setLevelComplete] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [totalTyped, setTotalTyped] = useState(0);

  const requestRef = useRef<number>();
  const lastWordTimeRef = useRef<number>(0);
  const wordsRef = useRef<Word[]>([]);
  const livesRef = useRef(3);
  const clearedRef = useRef(0);
  const gameOverRef = useRef(false);
  const levelCompleteRef = useRef(false);

  // Load high level on mount
  useEffect(() => {
    const levels = getGameHighLevels();
    setHighLevel(levels.falling);
    setCurrentLevel(levels.falling);
  }, []);

  // Sync refs
  useEffect(() => {
    wordsRef.current = words;
    livesRef.current = lives;
    clearedRef.current = clearedInLevel;
    gameOverRef.current = gameOver;
    levelCompleteRef.current = levelComplete;
  }, [words, lives, clearedInLevel, gameOver, levelComplete]);

  const getLevelParams = (lvl: number) => {
    const targetWords = Math.min(22, 5 + lvl * 2);
    const maxConcurrent = Math.min(4, 1 + Math.floor((lvl - 1) / 2));
    const spawnInterval = Math.max(1600, 4000 - (lvl - 1) * 450);
    const speed = 0.01 + (lvl - 1) * 0.005;

    const wordList =
      FALLING_LEVEL_WORDS[lvl] ||
      FALLING_LEVEL_WORDS[6].concat(FALLING_LEVEL_WORDS[5]);

    return { targetWords, maxConcurrent, spawnInterval, speed, wordList };
  };

  const startLevel = (lvl: number, keepScore = false) => {
    setCurrentLevel(lvl);
    setWords([]);
    setInput("");
    setLives(3);
    setClearedInLevel(0);
    setGameOver(false);
    setLevelComplete(false);
    setShowLevelSelect(false);
    setStartTime(Date.now());
    lastWordTimeRef.current = 0;
    if (!keepScore) {
      setScore(0);
      setTotalTyped(0);
    }

    setTimeout(() => {
      document.getElementById("falling-game-input")?.focus();
    }, 50);
  };

  useEffect(() => {
    startLevel(currentLevel);
  }, []);

  const spawnWord = (timestamp: number) => {
    const { targetWords, maxConcurrent, spawnInterval, speed, wordList } =
      getLevelParams(currentLevel);

    if (
      clearedRef.current >= targetWords ||
      wordsRef.current.length >= maxConcurrent
    ) {
      return;
    }

    if (timestamp - lastWordTimeRef.current > spawnInterval) {
      const newWord: Word = {
        id: Math.random(),
        text: wordList[Math.floor(Math.random() * wordList.length)],
        x: Math.random() * 70 + 15,
        y: -10,
        speed: speed * (Math.random() * 0.25 + 0.88),
      };
      setWords((prev) => [...prev, newWord]);
      lastWordTimeRef.current = timestamp;
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
        details: `Falling Words - Level ${currentLevel} (Failed)`,
      });
      return;
    }

    setWords((prev) => {
      let lostLife = false;
      const nextWords = prev
        .map((w) => ({
          ...w,
          y: w.y + w.speed * 2,
        }))
        .filter((w) => {
          if (w.y > 90) {
            lostLife = true;
            return false;
          }
          return true;
        });

      if (lostLife) {
        setLives((l) => Math.max(0, l - 1));
      }
      return nextWords;
    });

    spawnWord(timestamp);
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

    const matchedIndex = words.findIndex((w) => w.text === val);
    if (matchedIndex !== -1) {
      const matched = words[matchedIndex];
      const pts = matched.text.length * 10 * currentLevel;
      setScore((s) => s + pts);
      setTotalTyped((t) => t + matched.text.length);
      setWords((prev) => prev.filter((_, i) => i !== matchedIndex));
      setInput("");

      const nextCleared = clearedInLevel + 1;
      setClearedInLevel(nextCleared);

      const { targetWords } = getLevelParams(currentLevel);
      if (nextCleared >= targetWords) {
        // Level complete!
        setLevelComplete(true);
        const nextLvl = currentLevel + 1;
        if (nextLvl > highLevel) {
          setHighLevel(nextLvl);
          saveGameHighLevel("falling", nextLvl);
        }

        const timeElapsed = (Date.now() - startTime) / 1000 / 60;
        const wpm =
          Math.round((totalTyped + matched.text.length) / 5 / Math.max(0.01, timeElapsed)) || 0;

        onSaveStats({
          date: Date.now(),
          wpm,
          accuracy: 100,
          type: "game",
          details: `Falling Words - Level ${currentLevel} Cleared`,
        });
      }
    }
  };

  const { targetWords } = getLevelParams(currentLevel);
  const progressPercent = Math.min(
    100,
    Math.round((clearedInLevel / targetWords) * 100)
  );

  return (
    <div className="flex flex-col h-[530px] sm:h-[630px] bg-slate-900 rounded-2xl overflow-hidden relative shadow-2xl border border-slate-700 select-none">
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
            className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/50 rounded-lg text-indigo-300 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            title="Change Level"
          >
            <Trophy size={14} className="text-amber-400" />
            <span>Level {currentLevel}</span>
          </button>
        </div>

        {/* Target Words & Lives */}
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] sm:text-xs text-slate-400">
              Words: {clearedInLevel} / {targetWords}
            </span>
            <div className="w-20 sm:w-28 h-1.5 bg-slate-700 rounded-full overflow-hidden mt-0.5">
              <div
                className="h-full bg-indigo-500 transition-all duration-200"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 text-yellow-400 font-bold text-sm sm:text-lg font-mono">
            <Trophy size={18} /> {score}
          </div>

          <div className="flex items-center gap-1 text-red-500">
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
            <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Trophy size={24} className="text-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">
              Select Falling Words Level
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Your highest reached level is{" "}
              <strong className="text-amber-400">Level {highLevel}</strong>. You
              can practice any unlocked level or start from the beginning!
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
                          ? "bg-indigo-600 text-white font-bold ring-2 ring-indigo-400"
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
        onClick={() => document.getElementById("falling-game-input")?.focus()}
      >
        <input
          id="falling-game-input"
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

        {/* Falling Words */}
        {words.map((word) => {
          const isPrefix = input && word.text.startsWith(input);

          return (
            <div
              key={word.id}
              className={`absolute font-mono text-base sm:text-xl font-bold px-3 py-1 rounded shadow-lg transition-colors pointer-events-none ${
                isPrefix
                  ? "bg-indigo-500 text-white ring-2 ring-indigo-300"
                  : "bg-slate-800 text-emerald-400 border border-slate-700"
              }`}
              style={{
                left: `${word.x}%`,
                top: `${word.y}%`,
                transform: "translateX(-50%)",
              }}
            >
              {isPrefix ? (
                <>
                  <span className="text-white font-extrabold">{input}</span>
                  <span className="text-indigo-200">
                    {word.text.slice(input.length)}
                  </span>
                </>
              ) : (
                word.text
              )}
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
              Level {currentLevel} Cleared!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mb-4">
              Great accuracy and speed! Unlocked Level {currentLevel + 1}.
            </p>
            <div className="bg-slate-800/90 border border-slate-700 rounded-xl px-6 py-2.5 mb-5 flex items-center gap-6 shadow-md">
              <div>
                <span className="text-[10px] uppercase text-slate-400 block">
                  Total Score
                </span>
                <span className="text-2xl font-bold text-yellow-400 font-mono">
                  {score}
                </span>
              </div>
              <div className="w-px h-8 bg-slate-700"></div>
              <div>
                <span className="text-[10px] uppercase text-slate-400 block">
                  Words Typed
                </span>
                <span className="text-xl font-bold text-emerald-400 font-mono">
                  {targetWords}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-center w-full max-w-md">
              <button
                onClick={() => startLevel(currentLevel + 1, true)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30 text-sm sm:text-base flex-1 min-w-[150px]"
              >
                <FastForward size={18} /> Next Level ({currentLevel + 1})
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
              Level Failed!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mb-4">
              Words touched the ground in Level {currentLevel}.
            </p>
            <p className="text-base sm:text-lg text-slate-200 mb-5 font-mono">
              Final Score:{" "}
              <span className="text-yellow-400 font-bold">{score}</span>
            </p>
            <div className="flex flex-wrap gap-2 justify-center w-full max-w-md">
              <button
                onClick={() => startLevel(currentLevel, false)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30 text-sm sm:text-base flex-1 min-w-[150px]"
              >
                <RotateCcw size={18} /> Retry Level {currentLevel}
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
      <div className="p-3 sm:p-5 bg-slate-800 border-t border-slate-700 flex justify-center relative z-20">
        <div className="w-full max-w-md bg-slate-900 border-2 border-indigo-500 rounded-xl px-4 py-2 sm:py-3 text-lg sm:text-2xl text-white font-mono text-center transition-all flex items-center justify-center min-h-[50px] sm:min-h-[56px]">
          {input || <span className="text-slate-500">Type words here...</span>}
        </div>
      </div>
    </div>
  );
}
