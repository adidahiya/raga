/**
 * @returns generator of [key, value, path, parent] recursive traversal of an object
 */
export function* traverse(
    obj: Record<any, any>,
    path: string[] = [],
): Generator<[string, any, string[], any]> {
    for (var key of Object.keys(obj)) {
        const itemPath = path.concat(key);
        yield [key, obj[key], itemPath, obj];
        if (obj[key] !== null && typeof obj[key] == "object") {
            // going one step down in the object tree!!
            yield* traverse(obj[key], itemPath);
        }
    }
}
