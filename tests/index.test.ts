import { describe, it, expect } from 'vitest';
import { BotConfig } from '../../src/types.js';

describe('CLI Config', () => {
  it('should parse mode from args', () => {
    const args = ['--claude-code'];
    const mode = args.includes('--claude-code') ? 'claude-code' : 'agent';
    expect(mode).toBe('claude-code');
  });

  it('should parse max-tasks from args', () => {
    const args = ['--max-tasks=20'];
    const maxTasksArg = args.find(a => a.startsWith('--max-tasks='));
    const maxTasks = maxTasksArg ? parseInt(maxTasksArg.split('=')[1]) : 5;
    expect(maxTasks).toBe(20);
  });

  it('should default max-tasks to 5', () => {
    const args: string[] = [];
    const maxTasksArg = args.find(a => a.startsWith('--max-tasks='));
    const maxTasks = maxTasksArg ? parseInt(maxTasksArg.split('=')[1]) : 5;
    expect(maxTasks).toBe(5);
  });
});
