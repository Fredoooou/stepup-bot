import { McpClient } from '../mcp-client.js';
import { Agent } from '../agent.js';
import { BotConfig } from '../types.js';

export async function runGithubActionsMode(config: BotConfig): Promise<void> {
  console.log('[GitHub Actions Mode] Running autonomous loop');
  const mcp = new McpClient(config);
  await mcp.connect();

  try {
    const agent = new Agent(mcp);
    await agent.earnPoints(10);
    console.log('::notice::stepup-bot completed successfully');
  } catch (error) {
    console.error('::error::stepup-bot failed:', error);
    process.exit(1);
  } finally {
    await mcp.disconnect();
  }
}
