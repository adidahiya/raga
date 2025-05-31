/* eslint-disable @typescript-eslint/no-explicit-any */

// Global utility types
type PartialRecord<K extends keyof any, T> = Partial<Record<K, T>>;

// Re-export commonly used types
declare global {
  type PartialRecord<K extends keyof any, T> = Partial<Record<K, T>>;
}

/* eslint-enable @typescript-eslint/no-explicit-any */
