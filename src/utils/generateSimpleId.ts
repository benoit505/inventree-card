/**
 * Generates a simple, short, and reasonably unique ID.
 * This is not cryptographically secure and is intended for client-side instance tracking.
 * Example: "t3kg1z1k3c"
 */
export const generateSimpleId = (): string => {
  return Math.random().toString(36).substring(2, 15);
}; 