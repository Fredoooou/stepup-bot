import { describe, it, expect } from 'vitest';
import { McpClient } from '../src/mcp-client.js';
import { BotConfig } from '../src/types.js';

describe('McpClient', () => {
  const config: BotConfig = {
    platformUrl: 'http://localhost:8000',
    apiKey: 'test-key',
    mcpUrl: 'http://localhost:3000',
    mode: 'agent',
  };

  it('should accept config', () => {
    const mcp = new McpClient(config);
    expect(mcp).toBeDefined();
  });

  it('should create transport with correct env', () => {
    const mcp = new McpClient(config);
    const transport = (mcp as any).transport;
    expect(transport._serverParams.command).toBe('node');
    expect(transport._serverParams.args).toEqual(['dist/index.js']);
    expect(transport._serverParams.env?.STEPUP_API_KEY).toBe('test-key');
  });
});
