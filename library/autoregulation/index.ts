/**
 * Deterministic, offline readiness autoregulation. The LLM plans across days; this
 * pure rule engine gates on the day (docs/architecture.md §7).
 */
export * from "./engine";
