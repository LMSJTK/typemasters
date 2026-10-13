import React, { useState } from "react";
import { TypingTest } from "./TypingTest";
import { TypingStats } from "../types";
import { RefreshCw } from "lucide-react";

interface PracticeProps {
  onSaveStats: (stats: Omit<TypingStats, "id">) => void;
}

const PRACTICE_TEXTS = [
  "The history of computing is longer than the history of computing hardware and modern computing technology and includes the history of methods intended for pen and paper or for chalk and slate, with or without the aid of tables.",
  "A computer is a machine that can be programmed to carry out sequences of arithmetic or logical operations automatically. Modern computers can perform generic sets of operations known as programs. These programs enable computers to perform a wide range of tasks.",
  "Space exploration is the use of astronomy and space technology to explore outer space. While the exploration of space is carried out mainly by astronomers with telescopes, its physical exploration though is conducted both by unmanned robotic space probes and human spaceflight.",
  "The ocean covers more than 70 percent of the surface of our planet. It's hard to imagine, but about 97 percent of the Earth's water can be found in our ocean. Of the tiny percentage that's not in the ocean, about two percent is frozen up in glaciers and ice caps.",
];

export function Practice({ onSaveStats }: PracticeProps) {
  const [textIndex, setTextIndex] = useState(0);
  const [key, setKey] = useState(0); // Used to force re-render of TypingTest

  const handleComplete = (wpm: number, accuracy: number) => {
    onSaveStats({
      date: Date.now(),
      wpm,
      accuracy,
      type: "practice",
      details: "Free Practice",
    });
  };

  const nextText = () => {
    setTextIndex((prev) => (prev + 1) % PRACTICE_TEXTS.length);
    setKey((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
            Practice Area
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Type real-world paragraphs to improve your sustained typing speed.
          </p>
        </div>
        <button
          onClick={nextText}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 text-slate-700 transition-colors w-full sm:w-auto text-sm sm:text-base"
        >
          <RefreshCw size={18} className="sm:w-5 sm:h-5" />
          New Text
        </button>
      </div>

      <TypingTest
        key={key}
        text={PRACTICE_TEXTS[textIndex]}
        onComplete={handleComplete}
      />
    </div>
  );
}
