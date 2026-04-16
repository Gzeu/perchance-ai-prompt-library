// src/utils/logger.ts — v4.0.0
import chalk from 'chalk';

export type LogLevel = 'info' | 'success' | 'warn' | 'error' | 'debug';

const ICONS: Record<LogLevel, string> = {
  info:    'ℹ',
  success: '✅',
  warn:    '⚠️',
  error:   '❌',
  debug:   '🔍',
};

const COLORS: Record<LogLevel, (s: string) => string> = {
  info:    chalk.cyan,
  success: chalk.green,
  warn:    chalk.yellow,
  error:   chalk.red,
  debug:   chalk.gray,
};

function log(level: LogLevel, message: string, ...args: unknown[]): void {
  if (process.env['NODE_ENV'] === 'test') return;
  const icon = ICONS[level];
  const color = COLORS[level];
  const prefix = color(`${icon} [${level.toUpperCase()}]`);
  console.log(`${prefix} ${message}`, ...args);
}

export const logger = {
  info:    (msg: string, ...a: unknown[]) => log('info', msg, ...a),
  success: (msg: string, ...a: unknown[]) => log('success', msg, ...a),
  warn:    (msg: string, ...a: unknown[]) => log('warn', msg, ...a),
  error:   (msg: string, ...a: unknown[]) => log('error', msg, ...a),
  debug:   (msg: string, ...a: unknown[]) => { if (process.env['DEBUG']) log('debug', msg, ...a); },
};
