import { BotConfig } from '../types.js';
import { McpClient } from '../mcp-client.js';
import { Agent } from '../agent.js';

export async function runOneShotMode(config: BotConfig, challengeId: string): Promise<void> {
  console.log(`[One-shot Mode] Completing challenge: ${challengeId}`);
  const mcp = new McpClient(config);
  await mcp.connect();

  try {
    const agent = new Agent(mcp);
    await agent.completeChallenge(challengeId);
    console.log(`[One-shot Mode] Challenge ${challengeId} completed`);
  } finally {
    await mcp.disconnect();
  }
}
