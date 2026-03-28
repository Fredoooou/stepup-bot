import { BotConfig } from '../types.js';
import { PlatformClient } from '../platform-client.js';
import { Agent } from '../agent.js';

export async function runOneShotMode(config: BotConfig, challengeId: string): Promise<void> {
  console.log(`[One-shot Mode] Completing challenge: ${challengeId}`);
  const platform = new PlatformClient({
    platformUrl: config.platformUrl,
    apiKey: config.apiKey,
    participantId: config.participantId,
  });

  const agent = new Agent(platform, challengeId);
  await agent.completeChallenge(challengeId);
  console.log(`[One-shot Mode] Challenge ${challengeId} completed`);
}
