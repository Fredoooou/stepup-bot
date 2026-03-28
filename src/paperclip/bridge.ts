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
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        ...options.headers,
      },
    });
    if (!response.ok) {
      throw new Error(`Paperclip API error: ${response.status} ${response.statusText}`);
    }
    return response.json() as T;
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
