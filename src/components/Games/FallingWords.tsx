import React, { useState, useEffect, useRef } from "react";
import { TypingStats } from "../../types";
import { ArrowLeft, Trophy, Heart } from "lucide-react";

interface FallingWordsProps {
  onSaveStats: (stats: Omit<TypingStats, "id">) => void;
  onExit: () => void;
}

const WORDS = [
  "apple",
  "banana",
  "cherry",
  "date",
  "elderberry",
  "fig",
  "grape",
  "honeydew",
  "kiwi",
  "lemon",
  "mango",
  "nectarine",
  "orange",
  "papaya",
  "quince",
  "raspberry",
  "strawberry",
  "tangerine",
  "ugli",
  "vanilla",
  "watermelon",
  "xigua",
  "yam",
  "zucchini",
  "computer",
  "keyboard",
  "monitor",
  "mouse",
  "software",
  "hardware",
  "internet",
  "network",
];

interface Word {
  id: number;
  text: string;
  x: number;
  y: number;
  speed: number;
}

export function FallingWords({ onSaveStats, onExit }: FallingWordsProps) {
  const [words, setWords] = useState<Word[]>([]);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [totalTyped, setTotalTyped] = useState(0);

  const requestRef = useRef<number>();
  const lastWordTimeRef = useRef<number>(0);
  const wordsRef = useRef<Word[]>([]);
  const livesRef = useRef(3);
  const scoreRef = useRef(0);

  // Sync refs with state for the animation loop
  useEffect(() => {
    wordsRef.current = words;
    livesRef.current = lives;
    scoreRef.current = score;
  }, [words, lives, score]);

  const spawnWord = (timestamp: number) => {
    // Spawn rate increases with score
    const spawnInterval = Math.max(1200, 2500 - scoreRef.current * 8);

    if (timestamp - lastWordTimeRef.current > spawnInterval) {
      const newWord: Word = {
        id: Math.random(),
        text: WORDS[Math.floor(Math.random() * WORDS.length)],
        x: Math.random() * 80 + 10, // 10% to 90% width
        y: -10,
        speed: Math.random() * 0.03 + 0.03 + scoreRef.current * 0.0005, // Speed increases with score
      };
      setWords((prev) => [...prev, newWord]);
      lastWordTimeRef.current = timestamp;
    }
  };

  const updatePositions = (timestamp: number) => {
    if (livesRef.current <= 0) {
      if (!gameOver) {
        setGameOver(true);
        const timeElapsed = (Date.now() - startTime) / 1000 / 60;
        const wpm = Math.round(totalTyped / 5 / timeElapsed) || 0;
        onSaveStats({
          date: Date.now(),
          wpm,
          accuracy: 100, // Hard to measure accuracy here, assume 100% for completed words
          type: "game",
          details: `Falling Words - Score: ${scoreRef.current}`,
        });
      }
      return;
    }

    setWords((prev) => {
      let lostLife = false;
      const nextWords = prev
        .map((w) => ({ ...w, y: w.y + w.speed }))
        .filter((w) => {
          if (w.y > 100) {
            lostLife = true;
            return false;
          }
          return true;
        });

      if (lostLife) {
        setLives((l) => l - 1);
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
  }, [gameOver]); // Re-run effect if gameOver changes

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameOver) return;

    const val = e.target.value.toLowerCase();
    setInput(val);

    // Check if input matches any word exactly
    const matchedWordIndex = words.findIndex((w) => w.text === val);
    if (matchedWordIndex !== -1) {
      const matchedWord = words[matchedWordIndex];
      setScore((s) => s + matchedWord.text.length * 10);
      setTotalTyped((t) => t + matchedWord.text.length);
      setWords((prev) => prev.filter((_, i) => i !== matchedWordIndex));
      setInput("");
    }
  };

  const restart = () => {
    setWords([]);
    setScore(0);
    setLives(3);
    setGameOver(false);
    setInput("");
    setStartTime(Date.now());
    setTotalTyped(0);
    lastWordTimeRef.current = 0;
  };

  return (
    <div className="flex flex-col h-[500px] sm:h-[600px] bg-slate-900 rounded-2xl overflow-hidden relative shadow-2xl border border-slate-700">
      {/* Header */}
      <div className="flex justify-between items-center p-3 sm:p-4 bg-slate-800/80 backdrop-blur-sm z-10 border-b border-slate-700">
        <button
          onClick={onExit}
          className="text-slate-300 hover:text-white flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
        >
          <ArrowLeft size={18} className="sm:w-5 sm:h-5" /> <span className="hidden sm:inline">Exit</span>
        </button>
        <div className="flex gap-4 sm:gap-8">
          <div className="flex items-center gap-1 sm:gap-2 text-yellow-400 font-bold text-lg sm:text-xl">
            <Trophy size={20} className="sm:w-6 sm:h-6" /> {score}
          </div>
          <div className="flex items-center gap-1 text-red-500">
            {[...Array(3)].map((_, i) => (
              <Heart
                key={i}
                size={20}
                className="sm:w-6 sm:h-6"
                fill={i < lives ? "currentColor" : "none"}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div
        className="flex-grow relative overflow-hidden"
        onClick={() => document.getElementById("game-input")?.focus()}
      >
        <input
          id="game-input"
          type="text"
          value={input}
          onChange={handleInput}
          disabled={gameOver}
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          className="absolute inset-0 w-full h-full opacity-0 cursor-text z-10"
        />
        {words.map((word) => {
          // Highlight matching prefix
          const isPrefix = input && word.text.startsWith(input);

          return (
            <div
              key={word.id}
              className={`absolute font-mono text-xl font-bold px-3 py-1 rounded shadow-lg transition-colors
                ${isPrefix ? "bg-indigo-500 text-white" : "bg-slate-800 text-emerald-400 border border-slate-700"}`}
              style={{
                left: `${word.x}%`,
                top: `${word.y}%`,
                transform: "translateX(-50%)",
              }}
            >
              {isPrefix ? (
                <>
                  <span className="text-white">{input}</span>
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

        {gameOver && (
          <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center z-20 p-4 text-center">
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-2 sm:mb-4">Game Over</h2>
            <p className="text-xl sm:text-2xl text-slate-300 mb-6 sm:mb-8">
              Final Score:{" "}
              <span className="text-yellow-400 font-bold">{score}</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              <button
                onClick={restart}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-500 transition-colors w-full sm:w-auto"
              >
                Play Again
              </button>
              <button
                onClick={onExit}
                className="px-6 py-3 bg-slate-700 text-white rounded-lg font-bold hover:bg-slate-600 transition-colors w-full sm:w-auto"
              >
                Back to Menu
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 sm:p-6 bg-slate-800 border-t border-slate-700 flex justify-center relative z-20">
        <div className="w-full max-w-md bg-slate-900 border-2 border-indigo-500 rounded-xl px-4 sm:px-6 py-3 sm:py-4 text-xl sm:text-2xl text-white font-mono text-center transition-all flex items-center justify-center min-h-[60px]">
          {input || <span className="text-slate-500">Type words here...</span>}
        </div>
      </div>
    </div>
  );
}
