import { McpClient } from '../mcp-client.js';
import { Agent } from '../agent.js';
import { BotConfig } from '../types.js';

export async function runClaudeCodeMode(config: BotConfig): Promise<void> {
  console.log('[Claude Code Mode] Connect MCP, then hand off to user');
  const mcp = new McpClient(config);
  await mcp.connect();

  const agent = new Agent(mcp);

  // In Claude Code mode, we expose tools directly for Claude to call
  // The user types "earn points" and Claude orchestrates
  console.log('[Claude Code Mode] MCP connected. Say "earn points" to Claude.');
  console.log('[Claude Code Mode] Available tools: get_available_tasks, get_my_profile, get_leaderboard, claim_task, submit_completion, get_my_completions');

  // Keep alive for Claude Code session
  await new Promise(() => {});
}
