import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { BotConfig } from './types.js';

export class McpClient {
  private client: Client;
  private transport: StdioClientTransport;

  constructor(private config: BotConfig) {
    this.transport = new StdioClientTransport({
      command: 'node',
      args: ['dist/index.js'],
      env: {
        STEPUP_API_KEY: config.apiKey,
        STEPUP_PLATFORM_URL: config.platformUrl,
      },
    });
    this.client = new Client(
      { name: 'stepup-bot', version: '0.1.0' },
      { capabilities: {} }
    );
  }

  async connect() {
    await this.client.connect(this.transport);
  }

  async disconnect() {
    await this.client.close();
  }

  async callTool(name: string, args: Record<string, unknown>) {
    const result = await this.client.request(
      { method: 'tools/call', params: { name, arguments: args } },
      { tools: {} } as any
    );
    const text = (result as any).content?.[0]?.text;
    return text ? JSON.parse(text) : result;
  }
}
