// Convex test setup - exports modules for convex-test
// This allows convex-test to find all the modules in the convex directory
export const modules = import.meta.glob("./**/*.ts");
