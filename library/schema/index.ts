/**
 * The single source of truth — Zod schemas for every entity in the system.
 * Validating authored data, typing the app, and constraining AI output all read
 * from these definitions (docs/data-model.md, docs/architecture.md §3).
 */
export * from "./primitives";
export * from "./load";
export * from "./movement";
export * from "./goal";
export * from "./timer";
export * from "./blocks";
export * from "./session";
export * from "./program";
export * from "./readiness";
export * from "./log";
export * from "./nutrition";
export * from "./profile";
export * from "./gates";
