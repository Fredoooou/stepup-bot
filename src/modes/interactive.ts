import * as readline from 'readline';
import { BotConfig } from '../types.js';
import { PlatformClient } from '../platform-client.js';
import { Agent } from '../agent.js';

export async function runInteractiveMode(config: BotConfig): Promise<void> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log('[Interactive Mode] Starting. Type a challenge ID to work on, or "earn" for continuous mode, "quit" to exit.');

  const platform = new PlatformClient({
    platformUrl: config.platformUrl,
    apiKey: config.apiKey,
    participantId: config.participantId,
  });

  try {
    while (true) {
      const answer = await new Promise<string>((resolve) => {
        rl.question('> ', resolve);
      });

      if (answer.toLowerCase() === 'quit' || answer.toLowerCase() === 'exit') {
        break;
      }

      if (answer.toLowerCase() === 'earn') {
        const challengeId = process.env.STEPUP_CHALLENGE_ID;
        if (!challengeId) {
          console.log('STEPUP_CHALLENGE_ID not set, cannot run earn mode');
          continue;
        }
        const agent = new Agent(platform, challengeId);
        await agent.earnPoints(Infinity);
        break;
      }

      if (answer.trim()) {
        const agent = new Agent(platform, answer.trim());
        await agent.completeChallenge(answer.trim());
      }
    }
  } finally {
    rl.close();
  }
}
