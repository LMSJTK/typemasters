import React, { useState, useEffect, useRef } from "react";
import { TypingStats } from "../../types";
import { ArrowLeft, Rocket, Crosshair, Heart } from "lucide-react";

interface SpaceGameProps {
  onSaveStats: (stats: Omit<TypingStats, "id">) => void;
  onExit: () => void;
}

const ASTEROID_WORDS = [
  "nebula",
  "galaxy",
  "comet",
  "meteor",
  "planet",
  "orbit",
  "star",
  "quasar",
  "pulsar",
  "eclipse",
  "gravity",
  "vacuum",
  "cosmos",
  "apollo",
  "shuttle",
  "rocket",
  "satellite",
  "telescope",
  "astronaut",
  "universe",
  "starlight",
  "supernova",
];

interface Asteroid {
  id: number;
  text: string;
  x: number;
  y: number;
  speed: number;
  angle: number;
}

export function SpaceGame({ onSaveStats, onExit }: SpaceGameProps) {
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [totalTyped, setTotalTyped] = useState(0);

  const requestRef = useRef<number>();
  const lastAsteroidTimeRef = useRef<number>(0);
  const asteroidsRef = useRef<Asteroid[]>([]);
  const livesRef = useRef(3);
  const scoreRef = useRef(0);

  // Sync refs with state
  useEffect(() => {
    asteroidsRef.current = asteroids;
    livesRef.current = lives;
    scoreRef.current = score;
  }, [asteroids, lives, score]);

  const spawnAsteroid = (timestamp: number) => {
    const spawnInterval = Math.max(1500, 3000 - scoreRef.current * 10);

    if (timestamp - lastAsteroidTimeRef.current > spawnInterval) {
      // Spawn from top or sides, moving towards center bottom (player)
      const side = Math.floor(Math.random() * 3); // 0: top, 1: left, 2: right
      let startX, startY;

      if (side === 0) {
        startX = Math.random() * 80 + 10;
        startY = -10;
      } else if (side === 1) {
        startX = -10;
        startY = Math.random() * 40;
      } else {
        startX = 110;
        startY = Math.random() * 40;
      }

      // Target is roughly center bottom (50, 90)
      const targetX = 50 + (Math.random() * 20 - 10);
      const targetY = 90;

      const dx = targetX - startX;
      const dy = targetY - startY;
      const angle = Math.atan2(dy, dx);

      const newAsteroid: Asteroid = {
        id: Math.random(),
        text: ASTEROID_WORDS[Math.floor(Math.random() * ASTEROID_WORDS.length)],
        x: startX,
        y: startY,
        speed: Math.random() * 0.03 + 0.03 + scoreRef.current * 0.0005,
        angle: angle,
      };

      setAsteroids((prev) => [...prev, newAsteroid]);
      lastAsteroidTimeRef.current = timestamp;
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
          accuracy: 100,
          type: "game",
          details: `Space Defender - Score: ${scoreRef.current}`,
        });
      }
      return;
    }

    setAsteroids((prev) => {
      let lostLife = false;
      const nextAsteroids = prev
        .map((a) => ({
          ...a,
          x: a.x + Math.cos(a.angle) * a.speed * 2, // Multiply by 2 for aspect ratio adjustment roughly
          y: a.y + Math.sin(a.angle) * a.speed * 2,
        }))
        .filter((a) => {
          // Check collision with player area (roughly 40-60 x, 80-100 y)
          if (a.y > 80 && a.x > 40 && a.x < 60) {
            lostLife = true;
            return false;
          }
          // Remove if it goes off screen bottom
          if (a.y > 110) return false;
          return true;
        });

      if (lostLife) {
        setLives((l) => l - 1);
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
  }, [gameOver]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameOver) return;

    const val = e.target.value.toLowerCase();
    setInput(val);

    const matchedIndex = asteroids.findIndex((a) => a.text === val);
    if (matchedIndex !== -1) {
      const matched = asteroids[matchedIndex];
      setScore((s) => s + matched.text.length * 10);
      setTotalTyped((t) => t + matched.text.length);
      setAsteroids((prev) => prev.filter((_, i) => i !== matchedIndex));
      setInput("");

      // Visual feedback could be added here (e.g., laser beam animation)
    }
  };

  const restart = () => {
    setAsteroids([]);
    setScore(0);
    setLives(3);
    setGameOver(false);
    setInput("");
    setStartTime(Date.now());
    setTotalTyped(0);
    lastAsteroidTimeRef.current = 0;
  };

  return (
    <div className="flex flex-col h-[500px] sm:h-[600px] bg-slate-900 rounded-2xl overflow-hidden relative shadow-2xl border border-slate-700">
      {/* Starfield Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              width: Math.random() * 3 + "px",
              height: Math.random() * 3 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
              animationDuration: Math.random() * 3 + 1 + "s",
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="flex justify-between items-center p-3 sm:p-4 bg-slate-800/80 backdrop-blur-sm z-10 border-b border-slate-700">
        <button
          onClick={onExit}
          className="text-slate-300 hover:text-white flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
        >
          <ArrowLeft size={18} className="sm:w-5 sm:h-5" /> <span className="hidden sm:inline">Exit</span>
        </button>
        <div className="flex gap-4 sm:gap-8">
          <div className="flex items-center gap-1 sm:gap-2 text-purple-400 font-bold text-lg sm:text-xl">
            <Crosshair size={20} className="sm:w-6 sm:h-6" /> {score}
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
        onClick={() => document.getElementById("space-input")?.focus()}
      >
        <input
          id="space-input"
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
        {/* Player Ship */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
          <Rocket size={48} className="text-purple-500" />
          <div className="w-16 h-4 bg-purple-500/20 rounded-full mt-2 blur-sm"></div>
        </div>

        {/* Asteroids */}
        {asteroids.map((asteroid) => {
          const isPrefix = input && asteroid.text.startsWith(input);

          return (
            <div
              key={asteroid.id}
              className={`absolute flex flex-col items-center transition-colors`}
              style={{
                left: `${asteroid.x}%`,
                top: `${asteroid.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div
                className={`w-12 h-12 rounded-full mb-2 flex items-center justify-center border-2
                ${isPrefix ? "bg-purple-900/50 border-purple-400 animate-pulse" : "bg-slate-800 border-slate-600"}`}
              >
                <div className="w-8 h-8 bg-slate-700 rounded-full opacity-50"></div>
              </div>
              <div
                className={`font-mono text-sm font-bold px-2 py-1 rounded shadow-lg
                ${isPrefix ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-300 border border-slate-700"}`}
              >
                {isPrefix ? (
                  <>
                    <span className="text-white">{input}</span>
                    <span className="text-purple-300">
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

        {gameOver && (
          <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center z-20 p-4 text-center">
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-2 sm:mb-4">Hull Breach!</h2>
            <p className="text-xl sm:text-2xl text-slate-300 mb-6 sm:mb-8">
              Final Score:{" "}
              <span className="text-purple-400 font-bold">{score}</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              <button
                onClick={restart}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-500 transition-colors w-full sm:w-auto"
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
      <div className="p-4 sm:p-6 bg-slate-800 border-t border-slate-700 flex justify-center z-20 relative">
        <div className="w-full max-w-md bg-slate-900 border-2 border-purple-500 rounded-xl px-4 sm:px-6 py-3 sm:py-4 text-xl sm:text-2xl text-white font-mono text-center transition-all flex items-center justify-center min-h-[60px]">
          {input || <span className="text-slate-500">Target lock...</span>}
        </div>
      </div>
    </div>
  );
}
