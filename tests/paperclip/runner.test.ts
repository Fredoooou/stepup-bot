import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PaperclipRunner } from '../../src/paperclip/runner.js';

describe('PaperclipRunner', () => {
  let runner: PaperclipRunner;

  afterEach(async () => {
    await runner.stop();
  });

  it('creates runner with default values', () => {
    runner = new PaperclipRunner();
    expect(runner).toBeDefined();
  });

  it('creates runner with custom pnpm path', () => {
    runner = new PaperclipRunner({ pnpmPath: 'pnpm', paperclipDir: '/tmp/paperclip' });
    expect(runner).toBeDefined();
  });
});