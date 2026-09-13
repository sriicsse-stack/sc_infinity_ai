import { FileNode } from '../types';
import { GitHubService } from './githubService';

export interface VercelDeploymentResult {
  success: boolean;
  deploymentUrl: string;
  inspectUrl: string;
  readyState: 'BUILDING' | 'READY' | 'ERROR';
  id?: string;
  error?: string;
}

export class VercelService {
  private static BASE_URL = 'https://api.vercel.com';

  /**
   * Deploys project files to Vercel via real Vercel API v13
   */
  public static async deployProject(
    token: string,
    projectName: string,
    fileTree: FileNode,
    onProgress?: (step: number, message: string) => void
  ): Promise<VercelDeploymentResult> {
    const cleanToken = token.trim();
    const cleanProjectName = projectName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');

    if (!cleanToken) {
      return {
        success: false,
        deploymentUrl: '',
        inspectUrl: '',
        readyState: 'ERROR',
        error: 'Vercel API token is missing. Please configure your Vercel Token.'
      };
    }

    onProgress?.(1, 'Extracting workspace files and preparing payload...');
    const rawFiles = GitHubService.extractFiles(fileTree, fileTree.path);

    if (rawFiles.length === 0) {
      return {
        success: false,
        deploymentUrl: '',
        inspectUrl: '',
        readyState: 'ERROR',
        error: 'No files found in workspace to deploy.'
      };
    }

    // Ensure index.html exists
    const hasIndex = rawFiles.some(f => f.relativePath === 'index.html' || f.relativePath.endsWith('/index.html'));
    if (!hasIndex) {
      rawFiles.push({
        relativePath: 'index.html',
        content: '<!DOCTYPE html><html><head><title>' + cleanProjectName + '</title></head><body><h1>' + cleanProjectName + '</h1></body></html>'
      });
    }

    onProgress?.(2, 'Uploading files to Vercel Edge build system...');

    const vercelFiles = rawFiles.map(f => ({
      file: f.relativePath,
      data: f.content,
      encoding: 'utf-8'
    }));

    try {
      onProgress?.(3, 'Initiating deployment on Vercel Global Edge Network...');

      const response = await fetch(`${this.BASE_URL}/v13/deployments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cleanToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: cleanProjectName,
          files: vercelFiles,
          projectSettings: {
            framework: null
          },
          target: 'production'
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const message = errJson.error?.message || `Vercel API returned status ${response.status}: ${response.statusText}`;
        return {
          success: false,
          deploymentUrl: '',
          inspectUrl: '',
          readyState: 'ERROR',
          error: message
        };
      }

      const deployData = await response.json();
      const rawUrl = deployData.url || `${cleanProjectName}.vercel.app`;
      const finalDeploymentUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
      const inspectUrl = deployData.inspectorUrl || `https://vercel.com`;

      onProgress?.(4, 'Deployment live on Global CDN!');

      return {
        success: true,
        deploymentUrl: finalDeploymentUrl,
        inspectUrl: inspectUrl,
        readyState: deployData.readyState || 'READY',
        id: deployData.id
      };
    } catch (err: any) {
      return {
        success: false,
        deploymentUrl: '',
        inspectUrl: '',
        readyState: 'ERROR',
        error: `Network error deploying to Vercel: ${err.message}`
      };
    }
  }
}
