import { BotConfig } from '../types.js';
import { PlatformClient } from '../platform-client.js';
import { Agent } from '../agent.js';

export async function runClaudeCodeMode(config: BotConfig): Promise<void> {
  console.log('[Claude Code Mode] Starting with Platform API');

  const platform = new PlatformClient({
    platformUrl: config.platformUrl,
    apiKey: config.apiKey,
    participantId: config.participantId,
  });

  const challengeId = process.env.STEPUP_CHALLENGE_ID || 'claude-code';
  const agent = new Agent(platform, challengeId);

  // In Claude Code mode, expose tools for Claude to orchestrate
  console.log('[Claude Code Mode] Platform API connected.');
  console.log('[Claude Code Mode] Say "earn points" to start earning, or provide a challenge ID.');

  // Keep alive
  await new Promise(() => {});
}
