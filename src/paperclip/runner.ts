import { spawn, ChildProcess } from 'child_process';
import { platform } from 'process';

export interface PaperclipRunnerOptions {
  pnpmPath?: string;
  paperclipDir?: string;
  port?: number;
  startupTimeoutMs?: number;
}

export class PaperclipRunner {
  private process: ChildProcess | null = null;
  private readonly pnpmPath: string;
  private readonly paperclipDir: string;
  private readonly port: number;
  private readonly startupTimeoutMs: number;

  constructor(options: PaperclipRunnerOptions = {}) {
    this.pnpmPath = options.pnpmPath ?? 'pnpm';
    this.paperclipDir = options.paperclipDir ?? this.defaultPaperclipDir();
    this.port = options.port ?? 3100;
    this.startupTimeoutMs = options.startupTimeoutMs ?? 120000;
  }

  private defaultPaperclipDir(): string {
    // Use platform-specific home dir
    const home = process.env.HOME ?? process.env.USERPROFILE ?? '~';
    return `${home}/.paperclip`;
  }

  async start(): Promise<void> {
    if (this.isRunning()) {
      console.log('[PaperclipRunner] Paperclip already running');
      return;
    }

    console.log(`[PaperclipRunner] Starting Paperclip from ${this.paperclipDir}`);

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Paperclip startup timed out after ${this.startupTimeoutMs}ms`));
      }, this.startupTimeoutMs);

      this.process = spawn(this.pnpmPath, ['dev'], {
        cwd: this.paperclipDir,
        stdio: 'pipe',
        shell: platform === 'win32',
      });

      this.process.stdout?.on('data', (data: Buffer) => {
        const line = data.toString();
        console.log(`[Paperclip] ${line.trim()}`);
        if (line.includes('3100') || line.includes('ready') || line.includes('started')) {
          clearTimeout(timeout);
          resolve();
        }
      });

      this.process.stderr?.on('data', (data: Buffer) => {
        console.warn(`[Paperclip stderr] ${data.toString().trim()}`);
      });

      this.process.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });

      this.process.on('exit', (code) => {
        clearTimeout(timeout);
        if (code !== 0 && code !== null) {
          reject(new Error(`Paperclip exited with code ${code}`));
        }
      });
    });
  }

  async stop(): Promise<void> {
    if (!this.process) return;
    console.log('[PaperclipRunner] Stopping Paperclip');
    this.process.kill('SIGTERM');
    await new Promise(resolve => {
      const proc = this.process;
      const timeout = setTimeout(() => resolve(undefined), 5000);
      if (proc) {
        proc.once('exit', () => {
          clearTimeout(timeout);
          resolve(undefined);
        });
      } else {
        clearTimeout(timeout);
        resolve(undefined);
      }
    });
    this.process = null;
  }

  isRunning(): boolean {
    return this.process !== null;
  }

  async isReady(): Promise<boolean> {
    try {
      const response = await fetch(`http://localhost:${this.port}/api/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async waitForReady(): Promise<void> {
    const maxAttempts = 60;
    for (let i = 0; i < maxAttempts; i++) {
      if (await this.isReady()) return;
      await new Promise((r) => setTimeout(r, 2000));
    }
    throw new Error('Paperclip did not become ready in time');
  }
}
