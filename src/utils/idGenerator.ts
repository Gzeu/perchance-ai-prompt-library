// src/utils/idGenerator.ts — v4.0.0
import { randomUUID } from 'crypto';

export function generateId(): string {
  return randomUUID();
}

export function generateShortId(length = 8): string {
  return randomUUID().replace(/-/g, '').slice(0, length);
}
