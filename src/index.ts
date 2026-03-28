#!/usr/bin/env node
import 'dotenv/config';
import { McpClient } from './mcp-client.js';
import { Agent } from './agent.js';
import { BotConfig } from './types.js';
import { runClaudeCodeMode } from './modes/claude-code.js';
import { runGithubActionsMode } from './modes/github-actions.js';

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

async function main() {
  const config = loadConfig();
  const args = process.argv.slice(2);
  const mode = args.includes('--claude-code') ? 'claude-code' : config.mode;
  const maxTasksArg = args.find(a => a.startsWith('--max-tasks='));
  const maxTasks = maxTasksArg ? parseInt(maxTasksArg.split('=')[1]) : 5;

  console.log(`[stepup-bot] Starting in ${mode} mode`);
  const mcp = new McpClient(config);
  await mcp.connect();

  try {
    const agent = new Agent(mcp);
    await agent.earnPoints(maxTasks);
  } finally {
    await mcp.disconnect();
  }
}

main().catch(console.error);
