import { Task } from '../types.js';
import { EvidenceStep } from '../types.js';

interface PaperclipIssueResponse {
  id: string;
}

export class PaperclipBridge {
  constructor(
    private baseUrl: string,
    private apiKey: string,
    private projectId?: string
  ) {}

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          ...options.headers,
        },
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error(`Paperclip API error: ${response.status} ${response.statusText}`);
      }
      const text = await response.text();
      if (!text) {
        return undefined as T;
      }
      return JSON.parse(text) as T;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Paperclip API error: Request timed out after 30 seconds');
      }
      throw new Error(`Paperclip API error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async createIssue(challenge: Task): Promise<string> {
    const body = {
      title: challenge.title,
      description: challenge.description,
      companyId: this.projectId ?? 'default',
      status: 'pending',
    };
    const result = await this.request<PaperclipIssueResponse>('/api/issues', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return result.id;
  }

  async emitEvidence(issueId: string, step: EvidenceStep): Promise<void> {
    await this.request(`/api/issues/${issueId}/evidence`, {
      method: 'POST',
      body: JSON.stringify(step),
    });
  }

  async finalizeIssue(issueId: string): Promise<void> {
    await this.request(`/api/issues/${issueId}/finalize`, {
      method: 'POST',
    });
  }

  async getPendingIssues(): Promise<Array<{ id: string; status: string; title: string }>> {
    return this.request('/api/issues', {
      method: 'GET',
    });
  }

  async claimIssue(issueId: string): Promise<void> {
    await this.request(`/api/issues/${issueId}/claim`, {
      method: 'POST',
    });
  }
}
