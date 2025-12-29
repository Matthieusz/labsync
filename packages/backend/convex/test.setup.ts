// Convex test setup - exports modules for convex-test
// This allows convex-test to find all the modules in the convex directory
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const modules = (import.meta as unknown as { glob: (pattern: string) => Record<string, () => Promise<any>> }).glob("./**/*.ts");
