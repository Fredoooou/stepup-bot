import * as readline from 'readline';
import { BotConfig } from '../types.js';
import { McpClient } from '../mcp-client.js';
import { Agent } from '../agent.js';

export async function runInteractiveMode(config: BotConfig): Promise<void> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log('[Interactive Mode] Starting. Type a challenge ID to work on, or "earn" for continuous mode, "quit" to exit.');

  const mcp = new McpClient(config);
  await mcp.connect();

  try {
    while (true) {
      const answer = await new Promise<string>((resolve) => {
        rl.question('> ', resolve);
      });

      if (answer.toLowerCase() === 'quit' || answer.toLowerCase() === 'exit') {
        break;
      }

      if (answer.toLowerCase() === 'earn') {
        const agent = new Agent(mcp);
        await agent.earnPoints(Infinity);
        break;
      }

      if (answer.trim()) {
        const agent = new Agent(mcp);
        await agent.completeChallenge(answer.trim());
      }
    }
  } finally {
    rl.close();
    await mcp.disconnect();
  }
}
