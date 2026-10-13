import React, { useState, useEffect, useRef } from "react";
import { TypingStats } from "../../types";
import {
  ArrowLeft,
  Car,
  Flag,
  Timer,
  RotateCcw,
  Trophy,
  FastForward,
  ChevronRight,
} from "lucide-react";
import { getGameHighLevels, saveGameHighLevel } from "../../utils/gameLevels";

interface RacingGameProps {
  onSaveStats: (stats: Omit<TypingStats, "id">) => void;
  onExit: () => void;
}

const RACING_LEVEL_DATA: Record<
  number,
  { opponentWpm: number; title: string; texts: string[] }
> = {
  1: {
    opponentWpm: 18,
    title: "Rookie Warmup",
    texts: [
      "The red car zooms fast.",
      "Ready, set, go! Speed ahead.",
      "Green flag waves right now.",
    ],
  },
  2: {
    opponentWpm: 25,
    title: "Club Circuit",
    texts: [
      "A quick fox jumps over lazy dogs.",
      "Shift into high gear and accelerate.",
      "Keep your eyes focused on the asphalt track.",
    ],
  },
  3: {
    opponentWpm: 32,
    title: "Regional Sprint",
    texts: [
      "A journey of a thousand miles begins with a single step.",
      "Where there is a will, there is a clear way to victory.",
      "Practice makes perfect, but precision beats raw speed every single time.",
    ],
  },
  4: {
    opponentWpm: 40,
    title: "Semi-Pro Dash",
    texts: [
      "Speed is useful only if you are running in the right direction toward your destination.",
      "Every turn on the racetrack demands steady concentration and rhythmic keystrokes from your fingertips.",
      "Keep both hands firmly upon the steering wheel and stay locked into your rhythm.",
    ],
  },
  5: {
    opponentWpm: 48,
    title: "Pro Championship",
    texts: [
      "Success is not final, failure is not fatal: it is the courage to continue racing that separates champions from contenders on the asphalt.",
      "Trust your muscle memory as the engine roars. Maintain your focus and let each word flow naturally without any hesitation.",
    ],
  },
  6: {
    opponentWpm: 58,
    title: "Turbo Endurance",
    texts: [
      "The secret of champions is staying cool under intense pressure. When rival racers draft behind your bumper, double down on your accuracy and never let small mistakes interrupt your cadence on the track.",
      "Confidence builds through repetitive practice. Let your eyes scan ahead to the upcoming words so your fingers are already prepared to execute.",
    ],
  },
  7: {
    opponentWpm: 68,
    title: "Apex Masters",
    texts: [
      "High velocity racing pushes both driver and machine to the outermost boundaries of control. Every keystroke is a spark plug firing in unison; slip up for a second and the rival racer will eagerly seize the inside lane.",
      "When the rain falls and the turns grow slick, the disciplined driver shines brightest. Flow through the punctuation with composure and surge forward down the open straightaway.",
    ],
  },
  8: {
    opponentWpm: 78,
    title: "Supercar League",
    texts: [
      "Mastery is not about hitting the keyboard with brute force, but about cultivating effortless harmony between mind, vision, and fingers. As the speedometer climbs and the grandstand cheers blur into the background, smooth transitions around hairpin turns decide who takes the podium.",
    ],
  },
  9: {
    opponentWpm: 88,
    title: "Hypercar Invitational",
    texts: [
      "At this elite tier of competitive motorsport, fractions of a second define the thin line between triumph and heartbreak. The checkered banner looms in the distance beyond the final chicane. Breathe deep, silence the roaring noise in your ears, and execute flawless keystrokes all the way through the finish line.",
    ],
  },
  10: {
    opponentWpm: 98,
    title: "Grand Prix Legend",
    texts: [
      "You have arrived at the Grand Prix Championship! The greatest drivers in history made their mark here on this sacred asphalt. Feel the raw torque vibrating through your fingertips. No room for second thoughts or hesitation remains. Drive with relentless courage, push your RPM past the redline, and claim your place in the legendary racing hall of fame!",
    ],
  },
};

export function RacingGame({ onSaveStats, onExit }: RacingGameProps) {
  const [highLevel, setHighLevel] = useState(1);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [showLevelSelect, setShowLevelSelect] = useState(false);

  const [text, setText] = useState("");
  const [input, setInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [winner, setWinner] = useState<"player" | "opponent" | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFocused, setIsFocused] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);
  const inputLengthRef = useRef(0);
  const opponentSpeedRef = useRef(18);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Opponent state
  const [opponentProgress, setOpponentProgress] = useState(0);

  // Load high level on mount
  useEffect(() => {
    const levels = getGameHighLevels();
    setHighLevel(levels.racing);
    setCurrentLevel(levels.racing);
  }, []);

  const getLevelConfig = (lvl: number) => {
    if (RACING_LEVEL_DATA[lvl]) {
      return RACING_LEVEL_DATA[lvl];
    }
    // Infinite scaling beyond level 10
    return {
      opponentWpm: 98 + (lvl - 10) * 8,
      title: `Grand Prix Master +${lvl - 10}`,
      texts: RACING_LEVEL_DATA[10].texts,
    };
  };

  const startRaceForLevel = (lvl: number) => {
    const config = getLevelConfig(lvl);
    const chosenText =
      config.texts[Math.floor(Math.random() * config.texts.length)];

    setCurrentLevel(lvl);
    setText(chosenText);
    setInput("");
    inputLengthRef.current = 0;
    setStartTime(null);
    setWpm(0);
    setIsFinished(false);
    setWinner(null);
    setOpponentProgress(0);
    setIsPlaying(false);
    setCountdown(3);
    setShowLevelSelect(false);
    opponentSpeedRef.current = config.opponentWpm;

    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }

    let count = 3;
    countdownTimerRef.current = setInterval(() => {
      count--;
      setCountdown(count);
      if (count === 0) {
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
        }
        setIsPlaying(true);
        const now = Date.now();
        setStartTime(now);
        setTimeout(() => {
          inputRef.current?.focus();
        }, 10);
      }
    }, 1000);
  };

  // Start initial race once currentLevel is set or loaded
  useEffect(() => {
    startRaceForLevel(currentLevel);
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  // Autofocus when playing state activates
  useEffect(() => {
    if (isPlaying && !isFinished) {
      inputRef.current?.focus();
    }
  }, [isPlaying, isFinished]);

  // Keydown listener to refocus input if focus was lost during active race
  useEffect(() => {
    const handleWindowKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || isFinished) return;
      if (
        document.activeElement !== inputRef.current &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        e.key.length === 1
      ) {
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleWindowKeyDown);
    return () => window.removeEventListener("keydown", handleWindowKeyDown);
  }, [isPlaying, isFinished]);

  // Opponent movement
  useEffect(() => {
    if (!isPlaying || isFinished || !startTime || !text.length) return;

    const interval = setInterval(() => {
      setOpponentProgress((prev) => {
        const charsPerSecond = (opponentSpeedRef.current * 5) / 60;
        const newProgress = prev + charsPerSecond / 10; // Update every 100ms

        if (newProgress >= text.length) {
          clearInterval(interval);
          setIsFinished(true);
          setIsPlaying(false);
          setWinner("opponent");

          const now = Date.now();
          const elapsedMinutes = Math.max(
            (now - startTime) / 1000 / 60,
            0.005
          );
          const finalWpm = Math.round(
            inputLengthRef.current / 5 / elapsedMinutes
          );
          setWpm(finalWpm);

          const charsTyped = inputLengthRef.current;
          const accuracy =
            text.length > 0 ? Math.round((charsTyped / text.length) * 100) : 0;

          onSaveStats({
            date: now,
            wpm: finalWpm,
            accuracy: Math.max(50, accuracy),
            type: "game",
            details: `Type Racer - Level ${currentLevel} (${finalWpm} WPM)`,
          });

          return text.length;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, isFinished, startTime, text.length, currentLevel, onSaveStats]);

  // Player continuous WPM timer calculation
  useEffect(() => {
    if (!isPlaying || isFinished || !startTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedMinutes = Math.max((now - startTime) / 1000 / 60, 0.005);
      const wordsTyped = inputLengthRef.current / 5;
      const currentWpm = Math.round(wordsTyped / elapsedMinutes);
      setWpm(currentWpm);
    }, 250);

    return () => clearInterval(interval);
  }, [isPlaying, isFinished, startTime]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPlaying || isFinished) return;

    const val = e.target.value;

    if (text.startsWith(val)) {
      setInput(val);
      inputLengthRef.current = val.length;

      const now = Date.now();
      const raceStartTime = startTime || now;
      const elapsedMinutes = Math.max(
        (now - raceStartTime) / 1000 / 60,
        0.005
      );

      if (val === text) {
        // Player wins!
        setIsFinished(true);
        setIsPlaying(false);
        setWinner("player");

        const finalWpm = Math.max(
          1,
          Math.round(text.length / 5 / elapsedMinutes)
        );
        setWpm(finalWpm);

        // Advance level!
        const nextLvl = currentLevel + 1;
        if (nextLvl > highLevel) {
          setHighLevel(nextLvl);
          saveGameHighLevel("racing", nextLvl);
        }

        onSaveStats({
          date: now,
          wpm: finalWpm,
          accuracy: 100,
          type: "game",
          details: `Type Racer - Level ${currentLevel} Cleared (${finalWpm} WPM)`,
        });
      } else {
        const liveWpm = Math.round(val.length / 5 / elapsedMinutes);
        setWpm(liveWpm);
      }
    }
  };

  const playerProgressPercent =
    text.length > 0 ? Math.min(100, (input.length / text.length) * 100) : 0;
  const opponentProgressPercent =
    text.length > 0
      ? Math.min(100, (opponentProgress / text.length) * 100)
      : 0;

  const playerWon = winner === "player";
  const currentConfig = getLevelConfig(currentLevel);

  return (
    <div className="flex flex-col h-[530px] sm:h-[630px] bg-slate-900 rounded-2xl overflow-hidden relative shadow-2xl border border-slate-700 select-none">
      {/* Header */}
      <div className="flex justify-between items-center p-3 sm:p-4 bg-slate-800/90 backdrop-blur-sm z-10 border-b border-slate-700">
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
            title="Choose level or restart"
          >
            <Trophy size={14} className="text-amber-400" />
            <span>Level {currentLevel}</span>
            <span className="text-[10px] text-indigo-400 hidden md:inline">
              ({currentConfig.title})
            </span>
          </button>
        </div>

        <div className="flex items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-1 text-xs sm:text-sm text-slate-400">
            <span>Rival:</span>
            <span className="text-rose-400 font-bold">
              {currentConfig.opponentWpm} WPM
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 text-emerald-400 font-bold text-base sm:text-xl font-mono">
            <Timer size={18} className="sm:w-5 sm:h-5" /> {wpm} WPM
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
              Select Racing Level
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Your highest reached level is{" "}
              <strong className="text-amber-400">Level {highLevel}</strong>. You
              can practice any unlocked level or start from the beginning!
            </p>

            {/* Level Quick Grid */}
            <div className="grid grid-cols-5 gap-2 mb-6 max-h-48 overflow-y-auto p-1">
              {Array.from({ length: Math.max(highLevel, 10) }, (_, i) => i + 1)
                .slice(0, Math.max(highLevel, 5))
                .map((lvl) => {
                  const isUnlocked = lvl <= highLevel;
                  const isSelected = lvl === currentLevel;
                  const cfg = getLevelConfig(lvl);
                  return (
                    <button
                      key={lvl}
                      disabled={!isUnlocked}
                      onClick={() => startRaceForLevel(lvl)}
                      className={`p-2 rounded-xl text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? "bg-indigo-600 text-white font-bold ring-2 ring-indigo-400"
                          : isUnlocked
                            ? "bg-slate-700 hover:bg-slate-600 text-slate-200"
                            : "bg-slate-800/50 text-slate-600 cursor-not-allowed border border-slate-700/40"
                      }`}
                    >
                      <span className="text-sm font-bold">{lvl}</span>
                      <span className="text-[9px] opacity-75">{cfg.opponentWpm}w</span>
                    </button>
                  );
                })}
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => startRaceForLevel(1)}
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
        className="flex-grow flex flex-col p-3 sm:p-6 gap-3 sm:gap-5 relative cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Race Tracks */}
        <div className="flex flex-col gap-2.5 sm:gap-4 bg-slate-800/90 p-3 sm:p-5 rounded-xl border border-slate-700 shadow-inner">
          {/* Opponent Track */}
          <div>
            <div className="flex justify-between text-[11px] sm:text-xs text-slate-400 mb-1 px-1">
              <span className="text-rose-400 font-medium">
                Rival Car ({currentConfig.opponentWpm} WPM)
              </span>
              <span>{Math.round(opponentProgressPercent)}%</span>
            </div>
            <div className="relative h-10 sm:h-12 bg-slate-950 rounded-lg overflow-hidden border border-slate-700/80 flex items-center px-2">
              {/* Checkered Finish Line */}
              <div className="absolute right-2 top-0 bottom-0 w-3 bg-white/20 flex flex-col justify-between py-0.5">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-full h-1 sm:h-1.5 ${
                      i % 2 === 0 ? "bg-white/70" : "bg-black/60"
                    }`}
                  />
                ))}
              </div>
              {/* Opponent Car */}
              <div
                className="absolute transition-all duration-100 ease-linear flex items-center"
                style={{
                  left: `calc(${opponentProgressPercent * 0.88}% + 4px)`,
                }}
              >
                <Car size={24} className="sm:w-7 sm:h-7 text-rose-500 drop-shadow" />
              </div>
            </div>
          </div>

          {/* Player Track */}
          <div>
            <div className="flex justify-between text-[11px] sm:text-xs text-slate-400 mb-1 px-1">
              <span className="text-emerald-400 font-semibold">
                Your Car (Level {currentLevel})
              </span>
              <span>{Math.round(playerProgressPercent)}%</span>
            </div>
            <div className="relative h-10 sm:h-12 bg-slate-950 rounded-lg overflow-hidden border border-emerald-500/40 flex items-center px-2">
              {/* Checkered Finish Line */}
              <div className="absolute right-2 top-0 bottom-0 w-3 bg-white/20 flex flex-col justify-between py-0.5">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-full h-1 sm:h-1.5 ${
                      i % 2 === 0 ? "bg-white/70" : "bg-black/60"
                    }`}
                  />
                ))}
              </div>
              {/* Player Car */}
              <div
                className="absolute transition-all duration-75 ease-out flex items-center"
                style={{
                  left: `calc(${playerProgressPercent * 0.88}% + 4px)`,
                }}
              >
                <Car size={24} className="sm:w-7 sm:h-7 text-emerald-400 drop-shadow" />
              </div>
            </div>
          </div>
        </div>

        {/* Typing Box */}
        <div
          className={`flex-grow bg-slate-800 p-4 sm:p-6 rounded-xl border transition-all text-sm sm:text-xl font-mono leading-relaxed relative overflow-y-auto max-h-[220px] sm:max-h-[260px] ${
            isFocused
              ? "border-emerald-500/80 ring-2 ring-emerald-500/20"
              : "border-slate-700"
          }`}
          onClick={() => inputRef.current?.focus()}
        >
          {/* Countdown Overlay */}
          {!isPlaying && !isFinished && (
            <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl z-30 pointer-events-none p-4 text-center">
              <span className="text-5xl sm:text-7xl font-extrabold text-white animate-pulse tracking-wide">
                {countdown > 0 ? countdown : "GO!"}
              </span>
              <span className="text-xs sm:text-sm text-indigo-300 font-sans mt-2">
                Level {currentLevel}: {currentConfig.title}
              </span>
              <span className="text-[11px] text-slate-400 font-sans">
                Beat the {currentConfig.opponentWpm} WPM rival to unlock next level!
              </span>
            </div>
          )}

          {/* Finished Overlay */}
          {isFinished && (
            <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center rounded-xl z-40 p-4 sm:p-6 text-center animate-in fade-in duration-200">
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-2 sm:mb-3 ${
                  playerWon
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-rose-500/20 text-rose-400"
                }`}
              >
                {playerWon ? (
                  <Trophy size={32} className="sm:w-8 sm:h-8 text-amber-400" />
                ) : (
                  <Car size={32} className="sm:w-8 sm:h-8" />
                )}
              </div>
              <h2
                className={`text-2xl sm:text-3xl font-extrabold mb-1 ${
                  playerWon ? "text-emerald-400" : "text-rose-500"
                }`}
              >
                {playerWon ? `Level ${currentLevel} Cleared!` : "Rival Crossed First!"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mb-3">
                {playerWon
                  ? `Awesome driving! You unlocked Level ${currentLevel + 1}.`
                  : `Good run! The ${currentConfig.opponentWpm} WPM rival was just a bit faster.`}
              </p>

              {/* Stats Card */}
              <div className="bg-slate-800/90 border border-slate-700 rounded-xl px-5 py-2.5 mb-4 flex items-center gap-6 shadow-md">
                <div>
                  <span className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 block">
                    Your Speed
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
                    {wpm} WPM
                  </span>
                </div>
                <div className="w-px h-8 bg-slate-700"></div>
                <div>
                  <span className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 block">
                    Rival Speed
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-rose-400 font-mono">
                    {currentConfig.opponentWpm} WPM
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 justify-center w-full max-w-md">
                {playerWon ? (
                  <button
                    onClick={() => startRaceForLevel(currentLevel + 1)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30 text-sm sm:text-base flex-1 min-w-[150px]"
                  >
                    <FastForward size={18} /> Next Level ({currentLevel + 1})
                  </button>
                ) : (
                  <button
                    onClick={() => startRaceForLevel(currentLevel)}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30 text-sm sm:text-base flex-1 min-w-[150px]"
                  >
                    <RotateCcw size={18} /> Retry Level {currentLevel}
                  </button>
                )}

                <button
                  onClick={() => startRaceForLevel(1)}
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

          {/* Text Display */}
          <div className="text-slate-500 break-words pointer-events-none">
            <span className="text-emerald-400 bg-emerald-400/10 rounded px-0.5">
              {input}
            </span>
            <span className="text-white bg-slate-700 animate-pulse px-0.5 rounded">
              {text.charAt(input.length)}
            </span>
            <span>{text.slice(input.length + 1)}</span>
          </div>

          {/* Focus indicator */}
          {isPlaying && !isFinished && !isFocused && (
            <div className="absolute bottom-2 right-3 text-xs text-amber-400 bg-amber-950/70 border border-amber-600/50 px-2 py-0.5 rounded pointer-events-none animate-pulse">
              Click or tap to focus keyboard
            </div>
          )}
        </div>

        {/* Hidden full-area input */}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={isFinished}
          autoFocus
          className="absolute inset-0 w-full h-full opacity-0 cursor-text z-20"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
      </div>
    </div>
  );
}
