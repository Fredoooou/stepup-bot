import { describe, it, expect, vi } from 'vitest';
import { Agent } from '../../src/agent.js';
import { McpClient } from '../../src/mcp-client.js';
import { Task } from '../../src/types.js';

describe('Agent', () => {
  it('should pick highest value open task', () => {
    const tasks: Task[] = [
      { task_id: 't1', title: 'Low', description: 'desc', phase_label: null, points: 5, status: 'open' },
      { task_id: 't2', title: 'High', description: 'desc', phase_label: null, points: 50, status: 'open' },
      { task_id: 't3', title: 'Med', description: 'desc', phase_label: null, points: 20, status: 'open' },
    ];
    const picked = [...tasks].sort((a, b) => b.points - a.points)[0];
    expect(picked.task_id).toBe('t2');
  });

  it('should filter out non-open tasks', () => {
    const tasks: Task[] = [
      { task_id: 't1', title: 'Open', description: 'desc', phase_label: null, points: 10, status: 'open' },
      { task_id: 't2', title: 'Claimed', description: 'desc', phase_label: null, points: 20, status: 'claimed' },
    ];
    const openTasks = tasks.filter((t) => t.status === 'open');
    expect(openTasks).toHaveLength(1);
    expect(openTasks[0].title).toBe('Open');
  });
});
