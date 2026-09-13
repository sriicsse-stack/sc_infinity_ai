import { FileNode } from '../types';

export interface SecurityVulnerability {
  id: string;
  type: 'EXPOSED_SECRET' | 'XSS_RISK' | 'INSECURE_HTTP' | 'UNSAFE_EVAL';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  filePath: string;
  line?: number;
  message: string;
  suggestion: string;
}

export class SecurityGuardian {
  public static scanProject(fileTree: FileNode): SecurityVulnerability[] {
    const vulnerabilities: SecurityVulnerability[] = [];

    const scanNode = (node: FileNode) => {
      if (node.type === 'file' && node.content) {
        const lines = node.content.split('\n');

        lines.forEach((line, idx) => {
          // Check for hardcoded AWS / generic secret keys
          if (line.match(/(?:ak_live|sk_live|aws_secret|api_key|secret_key)\s*[:=]\s*["'][a-zA-Z0-9_-]{20,}["']/i)) {
            vulnerabilities.push({
              id: `vuln_${Date.now()}_${idx}`,
              type: 'EXPOSED_SECRET',
              severity: 'CRITICAL',
              filePath: node.name,
              line: idx + 1,
              message: `Potential hardcoded secret or API key exposed in line ${idx + 1}.`,
              suggestion: 'Move API keys to environment variables (.env) and access via process.env or import.meta.env.'
            });
          }

          // Check for innerHTML XSS risk
          if (line.includes('innerHTML =') && !line.includes('sanitize') && !line.includes('escape')) {
            vulnerabilities.push({
              id: `vuln_${Date.now()}_${idx}`,
              type: 'XSS_RISK',
              severity: 'MEDIUM',
              filePath: node.name,
              line: idx + 1,
              message: `Direct innerHTML assignment in line ${idx + 1} may introduce XSS vulnerabilities.`,
              suggestion: 'Use textContent, innerText, or sanitize inputs before DOM insertion.'
            });
          }

          // Check for raw eval()
          if (line.match(/\beval\s*\(/) && !line.includes('CodeRunner')) {
            vulnerabilities.push({
              id: `vuln_${Date.now()}_${idx}`,
              type: 'UNSAFE_EVAL',
              severity: 'HIGH',
              filePath: node.name,
              line: idx + 1,
              message: `Dangerous eval() usage detected in line ${idx + 1}.`,
              suggestion: 'Avoid eval() execution; use structured JSON.parse or Function constructors with safe sandboxing.'
            });
          }
        });
      } else if (node.children) {
        node.children.forEach(scanNode);
      }
    };

    scanNode(fileTree);
    return vulnerabilities;
  }
}
