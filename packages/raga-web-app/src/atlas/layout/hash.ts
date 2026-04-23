/**
 * Stable, fast non-cryptographic hash (FNV-1a 32-bit) over a feature matrix + algo + params,
 * for use as a layout cache key. Not collision-resistant, but more than sufficient to detect
 * "did anything meaningful change?".
 */
export function hashFeatureSet(input: {
  matrix: readonly (readonly number[])[];
  ids: readonly string[];
  algo: string;
  params?: Record<string, unknown>;
}): string {
  let hash = 0x811c9dc5;
  const update = (n: number) => {
    // mix in the bytes of a 32-bit float
    const buf = new ArrayBuffer(4);
    new Float32Array(buf)[0] = n;
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < 4; i++) {
      hash ^= bytes[i];
      hash = Math.imul(hash, 0x01000193) >>> 0;
    }
  };
  const updateString = (s: string) => {
    for (let i = 0; i < s.length; i++) {
      hash ^= s.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193) >>> 0;
    }
  };

  updateString(input.algo);
  updateString(JSON.stringify(input.params ?? {}));
  for (const id of input.ids) updateString(id);
  for (const row of input.matrix) {
    for (const v of row) update(v);
  }
  return hash.toString(16).padStart(8, "0");
}
