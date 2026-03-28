import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PaperclipBridge } from '../../src/paperclip/bridge.js';

describe('PaperclipBridge', () => {
  let bridge: PaperclipBridge;

  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ id: 'issue-123' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );
    bridge = new PaperclipBridge('http://localhost:3100', 'test-api-key');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates bridge with correct config', () => {
    expect(bridge).toBeDefined();
  });

  it('createIssue returns issue ID string', async () => {
    const issueId = await bridge.createIssue({
      task_id: 'task-123',
      title: 'Test Challenge',
      description: 'Do the thing',
      phase_label: null,
      points: 10,
      status: 'open',
    });
    expect(typeof issueId).toBe('string');
  });

  it('emitEvidence does not throw', async () => {
    const step = {
      timestamp: new Date().toISOString(),
      skill: 'test',
      files: [],
      tools: [],
      prompt: 'test',
      result: 'done',
    };
    // Should not throw (may fail network but shouldn't error on call)
    await expect(bridge.emitEvidence('issue-123', step)).resolves.not.toThrow();
  });

  it('finalizeIssue does not throw on success', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(null, { status: 200 })
    );
    await expect(bridge.finalizeIssue('issue-123')).resolves.not.toThrow();
  });

  it('getPendingIssues returns array of issues', async () => {
    const mockIssues = [
      { id: 'issue-1', status: 'pending', title: 'Issue 1' },
      { id: 'issue-2', status: 'pending', title: 'Issue 2' },
    ];
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockIssues), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );
    const result = await bridge.getPendingIssues();
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('issue-1');
    expect(result[1].status).toBe('pending');
  });

  it('claimIssue does not throw on success', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(null, { status: 200 })
    );
    await expect(bridge.claimIssue('issue-123')).resolves.not.toThrow();
  });
});
