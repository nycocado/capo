const DURATION_PATTERN = /^(\d+)(s|m|h|d)$/;

const UNIT_TO_MS: Record<string, number> = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

/**
 * Converte uma duração em milissegundos.
 * @param value - duração no formato <número><s|m|h|d> (ex.: "8h", "30m", "7d")
 * @returns total em milissegundos
 * @throws se o formato for inválido
 */
export function durationToMs(value: string): number {
  const match = DURATION_PATTERN.exec(value.trim());
  if (!match) {
    throw new Error(
      `Invalid duration format: "${value}". Use e.g. "8h", "30m", "7d", "45s".`,
    );
  }
  const [, amount, unit] = match;
  return parseInt(amount, 10) * UNIT_TO_MS[unit];
}
