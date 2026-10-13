import React from "react";

interface KeyboardProps {
  expectedKey: string;
  pressedKey: string | null;
}

const KEYBOARD_LAYOUT = [
  [
    "`",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "0",
    "-",
    "=",
    "Backspace",
  ],
  ["Tab", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
  ["Caps", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "Enter"],
  ["Shift", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/", "Shift"],
  ["Space"],
];

export function Keyboard({ expectedKey, pressedKey }: KeyboardProps) {
  const getKeyClass = (key: string) => {
    const isExpected =
      expectedKey.toLowerCase() === key.toLowerCase() ||
      (expectedKey === " " && key === "Space");
    const isPressed =
      pressedKey?.toLowerCase() === key.toLowerCase() ||
      (pressedKey === " " && key === "Space");

    let baseClass =
      "flex items-center justify-center rounded border-2 text-[10px] sm:text-xs md:text-sm font-medium transition-colors duration-100 ";

    if (isPressed && isExpected) {
      baseClass +=
        "bg-green-400 border-green-500 text-white shadow-[0_0_10px_rgba(74,222,128,0.5)]";
    } else if (isPressed && !isExpected) {
      baseClass +=
        "bg-red-400 border-red-500 text-white shadow-[0_0_10px_rgba(248,113,113,0.5)]";
    } else if (isExpected) {
      baseClass +=
        "bg-blue-400 border-blue-500 text-white animate-pulse shadow-[0_0_15px_rgba(96,165,250,0.6)]";
    } else {
      baseClass += "bg-slate-100 border-slate-300 text-slate-700 shadow-sm";
    }

    // Width adjustments for special keys
    if (key === "Backspace") return baseClass + " w-12 sm:w-16 md:w-24";
    if (key === "Tab") return baseClass + " w-10 sm:w-14 md:w-20";
    if (key === "\\") return baseClass + " w-10 sm:w-12 md:w-16";
    if (key === "Caps") return baseClass + " w-12 sm:w-16 md:w-24";
    if (key === "Enter") return baseClass + " w-12 sm:w-16 md:w-24";
    if (key === "Shift") return baseClass + " w-16 sm:w-20 md:w-28";
    if (key === "Space") return baseClass + " w-48 sm:w-64 md:w-96 h-8 sm:h-10 md:h-12";

    return baseClass + " w-7 sm:w-9 md:w-12 h-8 sm:h-10 md:h-12";
  };

  return (
    <div className="flex flex-col gap-1 sm:gap-2 p-2 sm:p-4 md:p-6 bg-slate-200 rounded-xl shadow-inner max-w-4xl mx-auto overflow-x-auto w-full">
      <div className="min-w-[400px] sm:min-w-fit mx-auto">
        {KEYBOARD_LAYOUT.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={`flex gap-1 sm:gap-2 justify-center ${rowIndex === 4 ? "mt-1 sm:mt-2" : ""}`}
          >
            {row.map((key, keyIndex) => (
              <div key={`${rowIndex}-${keyIndex}`} className={getKeyClass(key)}>
                {key === "Space" ? "" : key}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
