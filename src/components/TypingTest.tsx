import React, { useState, useEffect, useRef } from "react";
import { Keyboard } from "./Keyboard";
import { Play, RotateCcw } from "lucide-react";

interface TypingTestProps {
  text: string;
  onComplete: (wpm: number, accuracy: number) => void;
  key?: React.Key;
}

export function TypingTest({ text, onComplete }: TypingTestProps) {
  const [input, setInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [errors, setErrors] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.length === 1 || e.key === "Backspace" || e.key === " ") {
        setPressedKey(e.key);
      }
    };
    const handleKeyUp = () => setPressedKey(null);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFinished) return;

    const val = e.target.value;

    if (!startTime && val.length > 0) {
      setStartTime(Date.now());
    }

    // Check for errors on the newly typed character
    if (val.length > input.length) {
      const newChar = val[val.length - 1];
      const expectedChar = text[val.length - 1];
      if (newChar !== expectedChar) {
        setErrors((prev) => prev + 1);
      }
    }

    setInput(val);

    if (val === text) {
      setIsFinished(true);
      const timeElapsed = (Date.now() - (startTime || Date.now())) / 1000 / 60; // in minutes
      const words = text.length / 5;
      const wpm = Math.round(words / timeElapsed);
      const accuracy = Math.max(
        0,
        Math.round(((text.length - errors) / text.length) * 100),
      );
      onComplete(wpm, accuracy);
    }
  };

  const reset = () => {
    setInput("");
    setStartTime(null);
    setErrors(0);
    setIsFinished(false);
    inputRef.current?.focus();
  };

  const renderText = () => {
    return text.split("").map((char, index) => {
      let color = "text-slate-400";
      let bg = "";

      if (index < input.length) {
        color = input[index] === char ? "text-emerald-600" : "text-red-500";
        bg = input[index] !== char ? "bg-red-100" : "";
      } else if (index === input.length) {
        color = "text-slate-800";
        bg = "bg-blue-200 animate-pulse";
      }

      return (
        <span
          key={index}
          className={`${color} ${bg} rounded-sm transition-colors duration-100`}
        >
          {char}
        </span>
      );
    });
  };

  const expectedKey = input.length < text.length ? text[input.length] : "";

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto gap-4 sm:gap-8">
      <div className="w-full bg-white p-4 sm:p-8 rounded-2xl shadow-lg border border-slate-100 relative overflow-hidden flex flex-col min-h-[200px]">
        {/* Hidden input to capture typing */}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-text z-10"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          disabled={isFinished}
        />

        <div
          className="text-lg sm:text-2xl md:text-3xl font-mono leading-relaxed tracking-wide break-words select-none relative z-0 flex-grow"
          onClick={() => inputRef.current?.focus()}
        >
          {renderText()}
        </div>

        {isFinished && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-20">
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-800">
              Lesson Complete!
            </h3>
            <button
              onClick={reset}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors font-medium"
            >
              <RotateCcw size={20} />
              Try Again
            </button>
          </div>
        )}
      </div>

      <div className="w-full">
        <Keyboard expectedKey={expectedKey} pressedKey={pressedKey} />
      </div>
    </div>
  );
}
