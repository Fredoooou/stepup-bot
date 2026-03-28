export interface BotConfig {
  platformUrl: string;
  apiKey: string;
  mcpUrl: string;
  mode: 'claude-code' | 'agent';
}

export interface Task {
  task_id: string;
  title: string;
  description: string;
  phase_label: string | null;
  points: number;
  status: string;
}

export interface EvidenceStep {
  timestamp: string;        // ISO 8601
  skill: string;            // skill/tool name invoked
  files: string[];          // files touched
  tools: string[];           // MCP tools called
  prompt: string;           // prompt sent to model
  result: string;           // response/output
  reasoning?: string;       // trace of AI thinking
}

export interface PaperclipConfig {
  apiUrl: string;
  apiKey: string;
  projectId?: string;
}
