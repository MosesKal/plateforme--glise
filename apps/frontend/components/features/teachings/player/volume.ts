export const DEFAULT_PLAYER_VOLUME = 0.8;

export function normalizePlayerVolume(
  value: number,
  fallback = DEFAULT_PLAYER_VOLUME,
): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(Math.max(value, 0), 1);
}

export function readStoredPlayerVolume(value: string | null): number {
  if (value === null || value.trim() === "") return DEFAULT_PLAYER_VOLUME;
  return normalizePlayerVolume(Number(value));
}

export function playerVolumePercent(volume: number): number {
  return Math.round(normalizePlayerVolume(volume) * 100);
}

export function playerVolumeLevel(volume: number): "muted" | "low" | "high" {
  const normalized = normalizePlayerVolume(volume, 0);
  if (normalized === 0) return "muted";
  return normalized < 0.5 ? "low" : "high";
}
