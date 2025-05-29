// Global utility types
type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T;
};

// Re-export commonly used types
declare global {
  type PartialRecord<K extends keyof any, T> = {
    [P in K]?: T;
  };
}
