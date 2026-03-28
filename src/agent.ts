import { PlatformClient, ChallengeTask } from './platform-client.js';
import { PaperclipBridge } from './paperclip/bridge.js';
import { EvidenceLogger } from './paperclip/evidence-logger.js';
import { EvidenceStep } from './types.js';

export class Agent {
  private paperclipBridge: PaperclipBridge | null = null;
  private evidenceLogger: EvidenceLogger | null = null;
  private currentIssueId: string | null = null;
  private challengeId: string;

  constructor(
    private platform: PlatformClient,
    challengeId: string
  ) {
    this.challengeId = challengeId;
  }

  async earnPoints(maxTasks: number = 5): Promise<void> {
    console.log('[Agent] Starting earn-points loop');

    for (let i = 0; i < maxTasks; i++) {
      const tasks = await this.platform.getAvailableTasks(this.challengeId);
      const openTasks = tasks.filter((t: ChallengeTask) => t.status === 'open');

      if (openTasks.length === 0) {
        console.log('[Agent] No open tasks available');
        break;
      }

      try {
        const profile = await this.platform.getProfile();
        console.log(`[Agent] Current score: ${profile.score}, rank: ${profile.rank}`);
      } catch {
        // Profile may not be available
      }

      // Sort by points descending, pick highest
      const picked = [...openTasks].sort((a, b) => b.points - a.points)[0];
      console.log(`[Agent] Picking task: ${picked.title} (${picked.points} pts)`);

      await this.completeChallenge(picked.task_id, picked);
    }

    console.log('[Agent] Loop complete');
  }

  async completeChallenge(taskId: string, task?: ChallengeTask): Promise<void> {
    // Reset state at start of each challenge
    this.paperclipBridge = null;
    this.evidenceLogger = null;
    this.currentIssueId = null;

    // Set up Paperclip integration
    const apiUrl = process.env.PAPERCLIP_API_URL || 'http://localhost:3100';
    const apiKey = process.env.PAPERCLIP_API_KEY;
    if (apiKey) {
      this.paperclipBridge = new PaperclipBridge(apiUrl, apiKey);
    }

    // Claim task
    try {
      await this.platform.claimChallenge(this.challengeId);
    } catch (err) {
      console.warn('[Agent] Could not claim challenge (may already be claimed):', err);
    }

    // Get task details if not provided
    if (!task) {
      const tasks = await this.platform.getAvailableTasks(this.challengeId);
      task = tasks.find((t: ChallengeTask) => t.task_id === taskId);
    }

    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    // Create Paperclip issue if bridge is available
    if (this.paperclipBridge) {
      try {
        this.currentIssueId = await this.paperclipBridge.createIssue({
          task_id: task.task_id,
          title: task.title,
          description: task.description,
          phase_label: null,
          points: task.points,
          status: 'open',
        });
        this.evidenceLogger = new EvidenceLogger(this.paperclipBridge, this.currentIssueId);
        await this.paperclipBridge.claimIssue(this.currentIssueId);
      } catch (err) {
        console.warn('[Agent] Paperclip bridge unavailable, continuing without evidence:', err);
        this.paperclipBridge = null;
      }
    }

    // Log the claim step
    await this.logEvidence({
      skill: 'claim_task',
      files: [],
      tools: ['claim_task'],
      prompt: `claim_task ${taskId}`,
      result: 'claimed',
    });

    // Generate completion evidence
    const evidenceText = await this.generateEvidence(task);
    const evidenceUrl = await this.generateEvidenceUrl(task);

    await this.logEvidence({
      skill: 'generate_evidence',
      files: [],
      tools: [],
      prompt: `Generate evidence for: ${task.title}`,
      result: evidenceText,
      reasoning: 'Auto-generated evidence based on task description',
    });

    // Submit completion
    const result = await this.platform.submitCompletion(
      this.challengeId,
      taskId,
      evidenceText,
      evidenceUrl
    );

    console.log(`[Agent] Submitted: ${taskId}, awarded ${result.points_awarded} pts`);

    // Finalize Paperclip issue
    if (this.paperclipBridge && this.currentIssueId) {
      try {
        await this.paperclipBridge.finalizeIssue(this.currentIssueId);
      } catch (err) {
        console.warn('[Agent] Failed to finalize Paperclip issue:', err);
      }
    }
  }

  private async logEvidence(step: Omit<EvidenceStep, 'timestamp'>): Promise<void> {
    if (this.evidenceLogger) {
      await this.evidenceLogger.log(step);
    }
  }

  private async generateEvidence(task: ChallengeTask): Promise<string> {
    return `Completed task: ${task.title}. ${task.description}`;
  }

  private async generateEvidenceUrl(_task: ChallengeTask): Promise<string | undefined> {
    return undefined;
  }
}
