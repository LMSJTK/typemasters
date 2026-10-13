import React, { useState, useEffect, useRef } from "react";
import { TypingStats } from "../../types";
import { ArrowLeft, Car, Flag, Timer, RotateCcw } from "lucide-react";

interface RacingGameProps {
  onSaveStats: (stats: Omit<TypingStats, "id">) => void;
  onExit: () => void;
}

const RACING_TEXTS = [
  "The quick brown fox jumps over the lazy dog.",
  "A journey of a thousand miles begins with a single step.",
  "To be or not to be, that is the question.",
  "All that glitters is not gold.",
  "Where there is a will, there is a way.",
  "Speed is useful only if you are running in the right direction.",
  "Practice makes perfect, but precision beats speed every time.",
  "Keep your eyes on the road and your hands upon the wheel.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "The secret of getting ahead is getting started.",
];

export function RacingGame({ onSaveStats, onExit }: RacingGameProps) {
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
  const opponentSpeedRef = useRef(Math.random() * 18 + 38); // 38-56 WPM opponent
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Opponent state
  const [opponentProgress, setOpponentProgress] = useState(0);

  const startNewRace = () => {
    const selectedText =
      RACING_TEXTS[Math.floor(Math.random() * RACING_TEXTS.length)];
    setText(selectedText);
    setInput("");
    inputLengthRef.current = 0;
    setStartTime(null);
    setWpm(0);
    setIsFinished(false);
    setWinner(null);
    setOpponentProgress(0);
    setIsPlaying(false);
    setCountdown(3);
    opponentSpeedRef.current = Math.random() * 18 + 38;

    // Immediately focus the input so keyboard is ready
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

  useEffect(() => {
    startNewRace();
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  // Ensure focus whenever playing state changes
  useEffect(() => {
    if (isPlaying && !isFinished) {
      inputRef.current?.focus();
    }
  }, [isPlaying, isFinished]);

  // Window keydown listener to refocus input if focus was lost during active race
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
            text.length > 0
              ? Math.round((charsTyped / text.length) * 100)
              : 0;

          onSaveStats({
            date: now,
            wpm: finalWpm,
            accuracy: Math.max(50, accuracy),
            type: "game",
            details: `Type Racer - ${finalWpm} WPM (Opponent Won)`,
          });

          return text.length;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, isFinished, startTime, text.length, onSaveStats]);

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

    // Only allow correct prefix
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

        onSaveStats({
          date: now,
          wpm: finalWpm,
          accuracy: 100,
          type: "game",
          details: `Type Racer - ${finalWpm} WPM (Victory)`,
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

  const playerWon =
    winner === "player" ||
    (isFinished &&
      playerProgressPercent >= 100 &&
      opponentProgressPercent < 100);

  return (
    <div className="flex flex-col h-[520px] sm:h-[620px] bg-slate-900 rounded-2xl overflow-hidden relative shadow-2xl border border-slate-700 select-none">
      {/* Header */}
      <div className="flex justify-between items-center p-3 sm:p-4 bg-slate-800/80 backdrop-blur-sm z-10 border-b border-slate-700">
        <button
          onClick={onExit}
          className="text-slate-300 hover:text-white flex items-center gap-1 sm:gap-2 text-sm sm:text-base cursor-pointer"
        >
          <ArrowLeft size={18} className="sm:w-5 sm:h-5" />{" "}
          <span className="hidden sm:inline">Exit</span>
        </button>
        <div className="flex items-center gap-4 sm:gap-8">
          <div className="flex items-center gap-1 sm:gap-2 text-emerald-400 font-bold text-lg sm:text-xl">
            <Timer size={20} className="sm:w-6 sm:h-6" /> {wpm} WPM
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div
        className="flex-grow flex flex-col p-4 sm:p-8 gap-4 sm:gap-6 relative cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Race Tracks */}
        <div className="flex flex-col gap-3 sm:gap-5 bg-slate-800/90 p-4 sm:p-6 rounded-xl border border-slate-700 shadow-inner">
          {/* Opponent Track */}
          <div>
            <div className="flex justify-between text-[11px] sm:text-xs text-slate-400 mb-1 px-1">
              <span className="text-rose-400 font-medium">
                Rival Car (~{Math.round(opponentSpeedRef.current)} WPM)
              </span>
              <span>{Math.round(opponentProgressPercent)}%</span>
            </div>
            <div className="relative h-11 sm:h-14 bg-slate-950 rounded-lg overflow-hidden border border-slate-700/80 flex items-center px-2">
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
                <Car size={26} className="sm:w-8 sm:h-8 text-rose-500 drop-shadow" />
              </div>
            </div>
          </div>

          {/* Player Track */}
          <div>
            <div className="flex justify-between text-[11px] sm:text-xs text-slate-400 mb-1 px-1">
              <span className="text-emerald-400 font-semibold">Your Car</span>
              <span>{Math.round(playerProgressPercent)}%</span>
            </div>
            <div className="relative h-11 sm:h-14 bg-slate-950 rounded-lg overflow-hidden border border-emerald-500/40 flex items-center px-2">
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
                <Car size={26} className="sm:w-8 sm:h-8 text-emerald-400 drop-shadow" />
              </div>
            </div>
          </div>
        </div>

        {/* Typing Box */}
        <div
          className={`bg-slate-800 p-4 sm:p-7 rounded-xl border transition-all text-base sm:text-2xl font-mono leading-relaxed relative ${
            isFocused
              ? "border-emerald-500/80 ring-2 ring-emerald-500/20"
              : "border-slate-700"
          }`}
          onClick={() => inputRef.current?.focus()}
        >
          {/* Countdown Overlay */}
          {!isPlaying && !isFinished && (
            <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl z-30 pointer-events-none">
              <span className="text-5xl sm:text-7xl font-extrabold text-white animate-pulse tracking-wide">
                {countdown > 0 ? countdown : "GO!"}
              </span>
              <span className="text-xs sm:text-sm text-slate-400 mt-2">
                Keyboard is ready — start typing when green!
              </span>
            </div>
          )}

          {/* Finished Overlay */}
          {isFinished && (
            <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center rounded-xl z-40 p-4 sm:p-6 text-center">
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-3 ${
                  playerWon
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-rose-500/20 text-rose-400"
                }`}
              >
                {playerWon ? (
                  <Flag size={32} className="sm:w-8 sm:h-8" />
                ) : (
                  <Car size={32} className="sm:w-8 sm:h-8" />
                )}
              </div>
              <h2
                className={`text-2xl sm:text-4xl font-extrabold mb-1 ${
                  playerWon ? "text-emerald-400" : "text-rose-500"
                }`}
              >
                {playerWon ? "Victory! You Won!" : "Race Over"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mb-4">
                {playerWon
                  ? "Awesome typing! You beat the rival racer."
                  : "Good effort! The rival car reached the finish first."}
              </p>

              {/* Stats Card */}
              <div className="bg-slate-800/90 border border-slate-700 rounded-xl px-6 py-3 mb-6 flex items-center gap-6 shadow-md">
                <div>
                  <span className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 block">
                    Your Speed
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                    {wpm} WPM
                  </span>
                </div>
                <div className="w-px h-8 bg-slate-700"></div>
                <div>
                  <span className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 block">
                    Rival Speed
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-rose-400">
                    {Math.round(opponentSpeedRef.current)} WPM
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={startNewRace}
                  className="px-6 py-2.5 sm:py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30 text-sm sm:text-base"
                >
                  <RotateCcw size={18} /> Race Again
                </button>
                <button
                  onClick={onExit}
                  className="px-6 py-2.5 sm:py-3 bg-slate-700 text-slate-200 rounded-lg font-bold hover:bg-slate-600 transition-colors cursor-pointer text-sm sm:text-base"
                >
                  Back to Menu
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

          {/* Typing Focus Prompt indicator */}
          {isPlaying && !isFinished && !isFocused && (
            <div className="absolute bottom-2 right-3 text-xs text-amber-400 bg-amber-950/70 border border-amber-600/50 px-2 py-0.5 rounded pointer-events-none animate-pulse">
              Click or tap to focus keyboard
            </div>
          )}
        </div>

        {/* Hidden full-area input covering entire game area for easy touch / focus */}
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
