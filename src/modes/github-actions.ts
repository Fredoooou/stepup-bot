import { BotConfig } from '../types.js';
import { PlatformClient } from '../platform-client.js';
import { Agent } from '../agent.js';

export async function runGithubActionsMode(config: BotConfig): Promise<void> {
  console.log('[GitHub Actions Mode] Running autonomous loop');

  const platform = new PlatformClient({
    platformUrl: config.platformUrl,
    apiKey: config.apiKey,
    participantId: config.participantId,
  });

  const challengeId = process.env.STEPUP_CHALLENGE_ID;
  if (!challengeId) {
    throw new Error('STEPUP_CHALLENGE_ID environment variable required');
  }

  try {
    const agent = new Agent(platform, challengeId);
    await agent.earnPoints(10);
    console.log('::notice::stepup-bot completed successfully');
  } catch (error) {
    console.error('::error::stepup-bot failed:', error);
    process.exit(1);
  }
}
