// Auto-loads every feature plug. This file is the only place that knows plugs
// exist, and it never names one: adding `src/features/<name>/plug.ts` is the
// whole registration step.
//
// Eager on purpose - a plug must only call `register(...)` with lazy component
// loaders, so loading them all costs a few hundred bytes, not the feature code.
const plugs = import.meta.glob("../features/*/plug.ts", { eager: true });

export const loadedPlugs = Object.keys(plugs).length;

export * from "./registry";
