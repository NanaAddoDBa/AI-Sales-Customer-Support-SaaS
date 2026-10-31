export const CONTRACT_VERSION = 1 as const;

/** Intentionally contains no rejected values, secrets or provider details. */
export class ContractValidationError extends Error {
  constructor() {
    super("Payload does not match the supported contract");
    this.name = "ContractValidationError";
  }
}

export function invalid(): never {
  throw new ContractValidationError();
}

export function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) invalid();
  const prototype: unknown = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) invalid();
  return value as Record<string, unknown>;
}

export function onlyKeys(
  value: Record<string, unknown>,
  keys: readonly string[],
): void {
  if (Object.keys(value).some((key) => !keys.includes(key))) invalid();
}

export function text(value: unknown, max: number, min = 1): string {
  if (typeof value !== "string" || value.length < min || value.length > max)
    invalid();
  return value;
}

export function identifier(value: unknown): string {
  const result = text(value, 128);
  if (!/^[A-Za-z0-9][A-Za-z0-9_:-]*$/.test(result)) invalid();
  return result;
}

export function integer(value: unknown, max = Number.MAX_SAFE_INTEGER): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0 || value > max)
    invalid();
  return value;
}

export function member<T extends string>(value: unknown, allowed: readonly T[]): T {
  if (typeof value !== "string" || !allowed.includes(value as T)) invalid();
  return value as T;
}

export function timestamp(value: unknown): string {
  const result = text(value, 24);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(result)) invalid();
  const date = new Date(result);
  if (!Number.isFinite(date.getTime()) || date.toISOString() !== result) invalid();
  return result;
}

export function version(value: unknown): 1 {
  if (value !== CONTRACT_VERSION) invalid();
  return CONTRACT_VERSION;
}
