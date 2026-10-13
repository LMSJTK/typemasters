export interface GameHighLevels {
  racing: number;
  space: number;
  falling: number;
}

const STORAGE_KEY = "typeMaster_game_high_levels";

export function getGameHighLevels(): GameHighLevels {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        racing: Math.max(1, Number(parsed.racing) || 1),
        space: Math.max(1, Number(parsed.space) || 1),
        falling: Math.max(1, Number(parsed.falling) || 1),
      };
    }
  } catch (e) {
    console.error("Failed to load high levels", e);
  }
  return { racing: 1, space: 1, falling: 1 };
}

export function saveGameHighLevel(
  game: "racing" | "space" | "falling",
  level: number
): void {
  try {
    const current = getGameHighLevels();
    if (level > current[game]) {
      const updated = {
        ...current,
        [game]: level,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    console.error("Failed to save high level", e);
  }
}

export function resetGameHighLevel(
  game: "racing" | "space" | "falling"
): void {
  try {
    const current = getGameHighLevels();
    const updated = {
      ...current,
      [game]: 1,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to reset high level", e);
  }
}
