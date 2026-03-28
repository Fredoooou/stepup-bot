import { EvidenceStep } from '../types.js';

export interface EvidencePackage {
  challenge_id: string;
  issue_id: string;
  steps: EvidenceStep[];
  total_reasoning: string;
}

export class EvidenceAssembler {
  constructor(
    private challengeId: string,
    private issueId: string,
    private steps: EvidenceStep[]
  ) {}

  assemble(): EvidencePackage {
    return {
      challenge_id: this.challengeId,
      issue_id: this.issueId,
      steps: this.steps,
      total_reasoning: this.steps
        .filter((s) => s.reasoning)
        .map((s) => s.reasoning)
        .join('\n'),
    };
  }
}
