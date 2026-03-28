#!/usr/bin/env node
import 'dotenv/config';
import { McpClient } from './mcp-client.js';
import { Agent } from './agent.js';
import { BotConfig } from './types.js';
import { runClaudeCodeMode } from './modes/claude-code.js';
import { runGithubActionsMode } from './modes/github-actions.js';
import { runOneShotMode } from './modes/one-shot.js';
import { runEarnMode } from './modes/earn.js';
import { runInteractiveMode } from './modes/interactive.js';
import { PaperclipRunner } from './paperclip/runner.js';

function loadConfig(): BotConfig {
  const apiKey = process.env.STEPUP_API_KEY;
  if (!apiKey) {
    throw new Error('STEPUP_API_KEY environment variable is required');
  }
  return {
    platformUrl: process.env.STEPUP_PLATFORM_URL || 'http://localhost:8000',
    apiKey,
    mcpUrl: process.env.STEPUP_MCP_URL || 'http://localhost:3000',
    mode: (process.env.STEPUP_MODE as 'claude-code' | 'agent') || 'agent',
  };
}

async function startPaperclip(): Promise<PaperclipRunner> {
  const runner = new PaperclipRunner({
    paperclipDir: process.env.PAPERCLIP_DIR || undefined,
    port: parseInt(process.env.PAPERCLIP_PORT || '3100'),
  });
  await runner.start();
  await runner.waitForReady();
  return runner;
}

async function main() {
  const config = loadConfig();
  const args = process.argv.slice(2);

  // Determine mode
  const challengeArg = args.find((a) => a.startsWith('--challenge='));
  const isEarnMode = args.includes('--earn');

  let paperclipRunner: PaperclipRunner | null = null;

  try {
    // Start Paperclip for all modes
    if (!process.env.PAPERCLIP_SKIP_START) {
      paperclipRunner = await startPaperclip();
    }

    if (challengeArg) {
      const challengeId = challengeArg.split('=')[1];
      await runOneShotMode(config, challengeId);
    } else if (isEarnMode) {
      await runEarnMode(config);
    } else {
      await runInteractiveMode(config);
    }
  } finally {
    if (paperclipRunner) {
      await paperclipRunner.stop();
    }
  }
}

main().catch(console.error);
