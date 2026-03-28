import { BotConfig } from '../types.js';
import { McpClient } from '../mcp-client.js';
import { Agent } from '../agent.js';

export async function runEarnMode(config: BotConfig): Promise<void> {
  console.log('[Earn Mode] Starting continuous earn loop');
  const mcp = new McpClient(config);
  await mcp.connect();

  try {
    const agent = new Agent(mcp);
    await agent.earnPoints(Infinity);
  } finally {
    await mcp.disconnect();
  }
}
