import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EvidenceLogger } from '../../src/paperclip/evidence-logger.js';
import { PaperclipBridge } from '../../src/paperclip/bridge.js';

describe('EvidenceLogger', () => {
  let logger: EvidenceLogger;
  let mockBridge: PaperclipBridge;

  beforeEach(() => {
    mockBridge = {
      emitEvidence: vi.fn().mockResolvedValue(undefined),
    } as unknown as PaperclipBridge;
    logger = new EvidenceLogger(mockBridge, 'issue-123');
  });

  it('logs a step and emits to bridge', async () => {
    await logger.log({
      skill: 'test-skill',
      files: ['file.ts'],
      tools: ['tool-a'],
      prompt: 'do the thing',
      result: 'done',
    });

    expect(mockBridge.emitEvidence).toHaveBeenCalledTimes(1);
  });

  it('buffers multiple steps before flush', async () => {
    await logger.log({ skill: 'a', files: [], tools: [], prompt: '', result: '' });
    await logger.log({ skill: 'b', files: [], tools: [], prompt: '', result: '' });

    expect(mockBridge.emitEvidence).toHaveBeenCalledTimes(2);
  });

  it('getBufferedSteps returns all logged steps', () => {
    logger.log({ skill: 'x', files: [], tools: [], prompt: '', result: '' });
    const steps = logger.getBufferedSteps();
    expect(steps).toHaveLength(1);
    expect(steps[0].skill).toBe('x');
  });
});
