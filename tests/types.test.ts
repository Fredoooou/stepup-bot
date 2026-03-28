import { describe, it, expect } from 'vitest';
import { EvidenceStep, PaperclipConfig } from '../src/types.js';

describe('types', () => {
  it('EvidenceStep has required fields', () => {
    const step: EvidenceStep = {
      timestamp: new Date().toISOString(),
      skill: 'test',
      files: [],
      tools: [],
      prompt: 'test prompt',
      result: 'test result',
    };
    expect(step.skill).toBe('test');
  });

  it('PaperclipConfig has required fields', () => {
    const config: PaperclipConfig = {
      apiUrl: 'http://localhost:3100',
      apiKey: 'test-key',
    };
    expect(config.apiUrl).toBe('http://localhost:3100');
  });
});
