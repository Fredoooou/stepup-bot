import { describe, it, expect } from 'vitest';
import { EvidenceAssembler } from '../../src/paperclip/evidence-assembler.js';
import { EvidenceStep } from '../../src/types.js';

describe('EvidenceAssembler', () => {
  it('assembles evidence package from steps', () => {
    const steps: EvidenceStep[] = [
      {
        timestamp: '2026-03-28T10:00:00Z',
        skill: 'skill-a',
        files: ['a.ts'],
        tools: ['tool-1'],
        prompt: 'prompt a',
        result: 'result a',
        reasoning: 'thought a',
      },
      {
        timestamp: '2026-03-28T10:01:00Z',
        skill: 'skill-b',
        files: ['b.ts'],
        tools: ['tool-2'],
        prompt: 'prompt b',
        result: 'result b',
      },
    ];

    const assembler = new EvidenceAssembler('challenge-1', 'issue-1', steps);
    const pkg = assembler.assemble();

    expect(pkg.challenge_id).toBe('challenge-1');
    expect(pkg.issue_id).toBe('issue-1');
    expect(pkg.steps).toHaveLength(2);
    expect(pkg.total_reasoning).toBe('thought a');
  });

  it('assembles total reasoning from all steps', () => {
    const steps: EvidenceStep[] = [
      { timestamp: '', skill: '', files: [], tools: [], prompt: '', result: '', reasoning: 'first' },
      { timestamp: '', skill: '', files: [], tools: [], prompt: '', result: '', reasoning: 'second' },
      { timestamp: '', skill: '', files: [], tools: [], prompt: '', result: '' },
    ];

    const assembler = new EvidenceAssembler('c', 'i', steps);
    const pkg = assembler.assemble();

    expect(pkg.total_reasoning).toBe('first\nsecond');
  });
});
