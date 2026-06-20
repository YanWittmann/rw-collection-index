declare module 'fast-levenshtein' {
    const levenshtein: { get(a: string, b: string): number };
    export default levenshtein;
}
