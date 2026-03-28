import { McpClient } from './mcp-client.js';
import { Task } from './types.js';

export class Agent {
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

      await this.mcp.callTool('claim_task', { task_id: picked.task_id });

      // Generate completion evidence (placeholder — Claude AI fills this in)
      const evidenceText = await this.generateEvidence(picked);
      const evidenceUrl = await this.generateEvidenceUrl(picked);

      const result = await this.mcp.callTool('submit_completion', {
        task_id: picked.task_id,
        evidence_text: evidenceText,
        evidence_url: evidenceUrl,
      });

      console.log(`[Agent] Submitted: ${picked.task_id}, awarded ${result.points_awarded} pts`);
    }

    console.log('[Agent] Loop complete');
  }

  private async generateEvidence(task: Task): Promise<string> {
    // Placeholder — actual implementation generates real work product
    return `Completed task: ${task.title}. ${task.description}`;
  }

  private async generateEvidenceUrl(task: Task): Promise<string | undefined> {
    return undefined;
  }
}
