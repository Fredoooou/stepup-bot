import { McpClient } from './mcp-client.js';
import { Task, EvidenceStep } from './types.js';
import { PaperclipBridge } from './paperclip/bridge.js';
import { EvidenceLogger } from './paperclip/evidence-logger.js';

export class Agent {
  private paperclipBridge: PaperclipBridge | null = null;
  private evidenceLogger: EvidenceLogger | null = null;
  private currentIssueId: string | null = null;

  constructor(private mcp: McpClient) {}

  async earnPoints(maxTasks: number = 5): Promise<void> {
    console.log('[Agent] Starting earn-points loop');

    for (let i = 0; i < maxTasks; i++) {
      const tasksResult = await this.mcp.callTool('get_available_tasks', {});
      const openTasks: Task[] = tasksResult.tasks?.filter((t: Task) => t.status === 'open') ?? [];

      if (openTasks.length === 0) {
        console.log('[Agent] No open tasks available');
        break;
      }

      const profile = await this.mcp.callTool('get_my_profile', {});
      console.log(`[Agent] Current score: ${profile.score}, rank: ${profile.rank}`);

      // Sort by points descending, pick highest
      const picked = [...openTasks].sort((a, b) => b.points - a.points)[0];
      console.log(`[Agent] Picking task: ${picked.title} (${picked.points} pts)`);

      await this.completeChallenge(picked.task_id);
    }

    console.log('[Agent] Loop complete');
  }

  async completeChallenge(challengeId: string): Promise<void> {
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
    await this.mcp.callTool('claim_task', { task_id: challengeId });

    // Get task details
    const tasksResult = await this.mcp.callTool('get_available_tasks', {});
    const allTasks: Task[] = tasksResult.tasks ?? [];
    const task = allTasks.find((t: Task) => t.task_id === challengeId);

    if (!task) {
      throw new Error(`Task ${challengeId} not found`);
    }

    // Create Paperclip issue if bridge is available
    if (this.paperclipBridge) {
      try {
        this.currentIssueId = await this.paperclipBridge.createIssue(task);
        this.evidenceLogger = new EvidenceLogger(this.paperclipBridge, this.currentIssueId);
        await this.paperclipBridge.claimIssue(this.currentIssueId);
      } catch (err) {
        console.warn('[Agent] Paperclip bridge unavailable, continuing without evidence:', err);
        this.paperclipBridge = null;
      }
    }

    // Log the claim step
    await this.logEvidence({ skill: 'claim_task', files: [], tools: ['claim_task'], prompt: `claim_task ${challengeId}`, result: 'claimed' });

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
    const result = await this.mcp.callTool('submit_completion', {
      task_id: challengeId,
      evidence_text: evidenceText,
      evidence_url: evidenceUrl,
    });

    console.log(`[Agent] Submitted: ${challengeId}, awarded ${result.points_awarded} pts`);

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

  private async generateEvidence(task: Task): Promise<string> {
    return `Completed task: ${task.title}. ${task.description}`;
  }

  private async generateEvidenceUrl(task: Task): Promise<string | undefined> {
    return undefined;
  }
}
