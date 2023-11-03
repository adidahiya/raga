export function formatStatNumber(n: number) {
    return new Intl.NumberFormat("en-US", {
        style: "decimal",
    }).format(n);
}
