import { Task } from './types.js';

export interface PlatformConfig {
  platformUrl: string;
  apiKey: string;
  participantId: string;
}

export interface ChallengeTask {
  task_id: string;
  title: string;
  description: string;
  status: string;
  points: number;
}

export class PlatformClient {
  private baseUrl: string;
  private apiKey: string;
  private participantId: string;

  constructor(config: PlatformConfig) {
    this.baseUrl = config.platformUrl;
    this.apiKey = config.apiKey;
    this.participantId = config.participantId;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        ...options.headers,
      },
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Platform API error: ${response.status} ${response.statusText} - ${text}`);
    }
    const text = await response.text();
    return text ? JSON.parse(text) : ({} as T);
  }

  async getAvailableTasks(challengeId: string): Promise<ChallengeTask[]> {
    const tasks = await this.request<ChallengeTask[]>(
      `/api/challenges/${challengeId}/tasks?participant_id=${this.participantId}`
    );
    return tasks || [];
  }

  async claimChallenge(challengeId: string): Promise<void> {
    await this.request(`/api/challenges/${challengeId}/claim?participant_id=${this.participantId}`, {
      method: 'POST',
    });
  }

  async submitCompletion(
    challengeId: string,
    taskId: string,
    evidenceText: string,
    evidenceUrl?: string
  ): Promise<{ points_awarded: number }> {
    return this.request<{ points_awarded: number }>(
      `/api/challenges/${challengeId}/tasks/${taskId}/complete?participant_id=${this.participantId}`,
      {
        method: 'POST',
        body: JSON.stringify({
          evidence_text: evidenceText,
          evidence_url: evidenceUrl,
        }),
      }
    );
  }

  async getProfile(): Promise<{ score: number; rank: number }> {
    return this.request<{ score: number; rank: number }>(
      `/api/participants/${this.participantId}/profile`
    );
  }
}
