import { BotConfig } from '../types.js';
import { PlatformClient } from '../platform-client.js';
import { Agent } from '../agent.js';

export async function runEarnMode(config: BotConfig): Promise<void> {
  console.log('[Earn Mode] Starting continuous earn loop');

  const platform = new PlatformClient({
    platformUrl: config.platformUrl,
    apiKey: config.apiKey,
    participantId: config.participantId,
  });

  // earn mode needs a challenge ID - use env
  const challengeId = process.env.STEPUP_CHALLENGE_ID;
  if (!challengeId) {
    throw new Error('STEPUP_CHALLENGE_ID environment variable required for earn mode');
  }

  const agent = new Agent(platform, challengeId);
  await agent.earnPoints(Infinity);
}
