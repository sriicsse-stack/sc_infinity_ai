export type AgentRole = 'ARCHITECT' | 'DEVELOPER' | 'TESTER' | 'DEBUGGER' | 'SECURITY' | 'DEPLOYER';

export interface AgentTaskStep {
  id: string;
  role: AgentRole;
  name: string;
  desc: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  output?: string;
  durationMs?: number;
}

export class MultiAgentOrchestrator {
  public static createPipeline(userPrompt: string): AgentTaskStep[] {
    return [
      {
        id: 'step_architect',
        role: 'ARCHITECT',
        name: 'Architect Agent',
        desc: 'Analyzing user request, mapping component architecture and data flow schema...',
        status: 'pending'
      },
      {
        id: 'step_dev',
        role: 'DEVELOPER',
        name: 'Developer Agent',
        desc: 'Writing clean modular HTML, CSS, JavaScript and application logic...',
        status: 'pending'
      },
      {
        id: 'step_tester',
        role: 'TESTER',
        name: 'Testing Agent',
        desc: 'Running headless DOM sandbox tests, button click simulations and verifying events...',
        status: 'pending'
      },
      {
        id: 'step_debug',
        role: 'DEBUGGER',
        name: 'Auto-Debug Agent',
        desc: 'Scanning runtime console, catching potential exceptions and self-healing code...',
        status: 'pending'
      },
      {
        id: 'step_security',
        role: 'SECURITY',
        name: 'Security Guardian',
        desc: 'Auditing API key exposures, sanitizing inputs, and checking XSS vectors...',
        status: 'pending'
      },
      {
        id: 'step_deploy',
        role: 'DEPLOYER',
        name: 'Deployment Agent',
        desc: 'Bundling production assets and packaging for Vercel Global Edge CDN...',
        status: 'pending'
      }
    ];
  }
}
