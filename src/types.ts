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
