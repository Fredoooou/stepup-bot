import { EvidenceStep } from '../types.js';
import { PaperclipBridge } from './bridge.js';

export class EvidenceLogger {
  private steps: EvidenceStep[] = [];
  private readonly issueId: string;

  constructor(
    private bridge: PaperclipBridge,
    issueId: string
  ) {
    this.issueId = issueId;
  }

  async log(step: Omit<EvidenceStep, 'timestamp'>): Promise<void> {
    const fullStep: EvidenceStep = {
      ...step,
      timestamp: new Date().toISOString(),
    };
    this.steps.push(fullStep);
    await this.bridge.emitEvidence(this.issueId, fullStep);
  }

  getBufferedSteps(): EvidenceStep[] {
    return [...this.steps];
  }

  clear(): void {
    this.steps = [];
  }
}
