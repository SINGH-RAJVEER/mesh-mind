import type { Context } from "hono";

export interface AuthContext extends Context {
  set(key: string, value: unknown): void;
  get(key: string): unknown;
}
