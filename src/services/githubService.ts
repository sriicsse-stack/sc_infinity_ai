import { FileNode } from '../types';

export interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  html_url: string;
}

export interface GitHubPushResult {
  success: boolean;
  repoUrl: string;
  commitUrl: string;
  commitSha: string;
  pushedFilesCount: number;
  error?: string;
}

export class GitHubService {
  private static BASE_URL = 'https://api.github.com';

  /**
   * Validates GitHub Token and returns user profile
   */
  public static async validateToken(token: string): Promise<{ valid: boolean; user?: GitHubUser; error?: string }> {
    if (!token || !token.trim()) {
      return { valid: false, error: 'Please provide a valid GitHub Personal Access Token (PAT).' };
    }

    try {
      const cleanToken = token.trim();
      const res = await fetch(`${this.BASE_URL}/user`, {
        headers: {
          'Authorization': `token ${cleanToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          return { valid: false, error: 'Invalid or expired GitHub token. Please verify permissions (repo scope required).' };
        }
        return { valid: false, error: `GitHub API error (${res.status}): ${res.statusText}` };
      }

      const data = await res.json();
      return {
        valid: true,
        user: {
          login: data.login,
          name: data.name || data.login,
          avatar_url: data.avatar_url,
          html_url: data.html_url
        }
      };
    } catch (err: any) {
      return { valid: false, error: `Network error connecting to GitHub: ${err.message}` };
    }
  }

  /**
   * Creates repository if it does not exist
   */
  public static async ensureRepository(token: string, repoName: string, isPrivate: boolean = false): Promise<{ success: boolean; repoUrl: string; owner: string; error?: string }> {
    const userRes = await this.validateToken(token);
    if (!userRes.valid || !userRes.user) {
      return { success: false, repoUrl: '', owner: '', error: userRes.error || 'Authentication failed' };
    }

    const owner = userRes.user.login;
    const cleanRepoName = repoName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const cleanToken = token.trim();

    try {
      // Check if repo exists
      const checkRes = await fetch(`${this.BASE_URL}/repos/${owner}/${cleanRepoName}`, {
        headers: {
          'Authorization': `token ${cleanToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (checkRes.ok) {
        const existingRepo = await checkRes.json();
        return { success: true, repoUrl: existingRepo.html_url, owner };
      }

      // Create new repo
      const createRes = await fetch(`${this.BASE_URL}/user/repos`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${cleanToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: cleanRepoName,
          description: 'Created and deployed with SC INFINITY IDE',
          private: isPrivate,
          auto_init: true
        })
      });

      if (!createRes.ok) {
        const errorData = await createRes.json().catch(() => ({}));
        return {
          success: false,
          repoUrl: '',
          owner,
          error: errorData.message || `Failed to create repository (${createRes.status})`
        };
      }

      const createdRepo = await createRes.json();
      return { success: true, repoUrl: createdRepo.html_url, owner };
    } catch (err: any) {
      return { success: false, repoUrl: '', owner, error: err.message };
    }
  }

  /**
   * Collects all flat files from fileTree
   */
  public static extractFiles(node: FileNode, rootPath: string = ''): { relativePath: string; content: string }[] {
    const results: { relativePath: string; content: string }[] = [];

    const traverse = (current: FileNode, prefix: string) => {
      if (current.type === 'file') {
        const relPath = prefix ? `${prefix}/${current.name}` : current.name;
        results.push({
          relativePath: relPath,
          content: current.content || ''
        });
      } else if (current.children) {
        const nextPrefix = prefix ? `${prefix}/${current.name}` : (current.path === rootPath ? '' : current.name);
        for (const child of current.children) {
          traverse(child, nextPrefix);
        }
      }
    };

    traverse(node, '');
    return results;
  }

  /**
   * Real Push: Uploads / updates each file to the GitHub repository
   */
  public static async pushProject(
    token: string, 
    repoName: string, 
    fileTree: FileNode, 
    commitMessage: string = 'feat: update workspace files via SC INFINITY IDE',
    branch: string = 'main',
    onProgress?: (msg: string, percent: number) => void
  ): Promise<GitHubPushResult> {
    onProgress?.('Authenticating with GitHub API...', 10);
    const repoRes = await this.ensureRepository(token, repoName);
    if (!repoRes.success) {
      return {
        success: false,
        repoUrl: '',
        commitUrl: '',
        commitSha: '',
        pushedFilesCount: 0,
        error: repoRes.error
      };
    }

    const { owner, repoUrl } = repoRes;
    const cleanRepoName = repoName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const cleanToken = token.trim();
    const files = this.extractFiles(fileTree, fileTree.path);

    if (files.length === 0) {
      return {
        success: false,
        repoUrl,
        commitUrl: repoUrl,
        commitSha: '',
        pushedFilesCount: 0,
        error: 'No files found in workspace to push.'
      };
    }

    let pushedCount = 0;
    let latestSha = '';

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const percent = Math.round(15 + ((i + 1) / files.length) * 80);
      onProgress?.(`Pushing ${file.relativePath} (${i + 1}/${files.length})...`, percent);

      try {
        // 1. Get existing file sha if already present
        let existingSha: string | undefined;
        const getFileRes = await fetch(
          `${this.BASE_URL}/repos/${owner}/${cleanRepoName}/contents/${encodeURIComponent(file.relativePath)}?ref=${branch}`,
          {
            headers: {
              'Authorization': `token ${cleanToken}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          }
        );

        if (getFileRes.ok) {
          const fileData = await getFileRes.json();
          existingSha = fileData.sha;
        }

        // 2. Put file contents (Base64 encoded UTF-8)
        const utf8Bytes = new TextEncoder().encode(file.content);
        let binary = '';
        for (let b = 0; b < utf8Bytes.length; b++) {
          binary += String.fromCharCode(utf8Bytes[b]);
        }
        const base64Content = btoa(binary);

        const putBody: any = {
          message: `${commitMessage} (${file.relativePath})`,
          content: base64Content,
          branch: branch
        };
        if (existingSha) {
          putBody.sha = existingSha;
        }

        const putRes = await fetch(
          `${this.BASE_URL}/repos/${owner}/${cleanRepoName}/contents/${encodeURIComponent(file.relativePath)}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `token ${cleanToken}`,
              'Accept': 'application/vnd.github.v3+json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(putBody)
          }
        );

        if (putRes.ok) {
          const putData = await putRes.json();
          latestSha = putData.commit?.sha || latestSha;
          pushedCount++;
        }
      } catch (e: any) {
        console.warn(`Failed to push file ${file.relativePath}:`, e);
      }
    }

    onProgress?.('Finalizing GitHub commit and tree...', 100);

    const commitShaDisplay = latestSha ? latestSha.substring(0, 7) : 'main';
    const commitUrl = latestSha ? `${repoUrl}/commit/${latestSha}` : `${repoUrl}/tree/${branch}`;

    return {
      success: pushedCount > 0,
      repoUrl,
      commitUrl,
      commitSha: commitShaDisplay,
      pushedFilesCount: pushedCount
    };
  }
}
