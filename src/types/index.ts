export type ThemeMode = 'dark' | 'light' | 'system';

export type InfinityState = 
  | 'idle' 
  | 'ai_thinking' 
  | 'building' 
  | 'success' 
  | 'error' 
  | 'loading';

export type AIPermissionMode = 'safe' | 'ask' | 'auto';

export type AIModelType = 
  | 'gemini-1.5-pro' 
  | 'gemini-2.0-flash' 
  | 'gemini-1.5-flash' 
  | 'gemini-pro';

export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  content?: string;
  children?: FileNode[];
  isOpen?: boolean;
  isModified?: boolean;
  language?: string;
}

export interface EditorTab {
  id: string;
  name: string;
  path: string;
  language: string;
  isDirty?: boolean;
  content?: string;
}

export interface ProblemItem {
  id: string;
  message: string;
  file: string;
  line: number;
  column: number;
  severity: 'error' | 'warning' | 'info';
  codeSnippet?: string;
  suggestedFix?: string;
}

export interface ProjectMeta {
  id: string;
  name: string;
  tagline?: string;
  technology: string;
  framework: string;
  lastModified: string;
  icon?: string;
  templateType: 'react' | 'nextjs' | 'nodejs' | 'python' | 'java' | 'flutter' | 'html' | 'blank';
  description?: string;
  port?: number;
  rootPath?: string;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  type?: 'text' | 'plan' | 'code' | 'diff' | 'action_request' | 'error' | 'github_push' | 'deployment' | 'git_push_prompt';
  planSteps?: string[];
  diffData?: {
    filename: string;
    oldCode: string;
    newCode: string;
  };
  pendingApproval?: boolean;
  actionPayload?: {
    actionType: 'create_file' | 'edit_file' | 'delete_file' | 'run_command' | 'deploy' | 'git_push';
    target: string;
    details: string;
  };
  githubData?: {
    repoUrl: string;
    commitUrl: string;
    commitSha: string;
    pushedFilesCount: number;
    repoName?: string;
  };
  deploymentData?: {
    url: string;
    readyState: string;
    projectName?: string;
  };
}

export interface AgentStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  detail?: string;
  timestamp?: string;
  duration?: string;
  modifiedFiles?: string[];
  diffs?: { file: string; oldCode: string; newCode: string }[];
}

export interface AgentRun {
  id: string;
  prompt: string;
  status: 'idle' | 'planning' | 'running' | 'paused_for_approval' | 'completed' | 'failed';
  steps: AgentStep[];
  currentStepIndex: number;
  startTime: string;
  endTime?: string;
}

export interface DeploymentStep {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export interface DeploymentRecord {
  id: string;
  projectName: string;
  url: string;
  status: 'idle' | 'deploying' | 'live' | 'failed';
  timestamp: string;
  steps: DeploymentStep[];
  branch: string;
  commitHash: string;
}

export interface DBColumn {
  name: string;
  type: 'uuid' | 'text' | 'varchar' | 'integer' | 'boolean' | 'timestamp' | 'jsonb';
  isPrimary?: boolean;
  isNullable?: boolean;
  defaultValue?: string;
}

export interface DBTable {
  name: string;
  description?: string;
  columns: DBColumn[];
  rowCount: number;
  data: Record<string, any>[];
}

export interface TutorTopic {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  explanation: string;
  codeExample: {
    language: string;
    code: string;
  };
  practiceTask: {
    description: string;
    starterCode: string;
    solutionCode: string;
    hints: string[];
  };
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
  visualizerSteps?: {
    stepTitle: string;
    callStack: string[];
    variables: Record<string, any>;
    explanation: string;
  }[];
}

export type ActiveActivityTab = 
  | 'explorer' 
  | 'search' 
  | 'git' 
  | 'debug' 
  | 'extensions' 
  | 'marketplace'
  | 'database' 
  | 'deployment' 
  | 'tutor' 
  | 'terminal' 
  | 'settings';

export interface UserPersonalizationProfile {
  purpose: string; // 'learn' | 'projects' | 'products' | 'career' | 'professional'
  role: string; // 'student' | 'developer' | 'founder' | 'professional' | 'educator' | 'other'
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  techStacks: string[]; // e.g. ['React', 'Node.js', 'Java', 'Python', 'Web Apps']
  aiAssistanceStyles: string[]; // e.g. ['explain', 'build_features', 'fix_bugs', 'review', 'test', 'deploy', 'full_agent']
  primaryGoal: 'learn_faster' | 'build_faster' | 'career_ready' | 'ship_production' | string;
  recommendedPlan: 'free' | 'student' | 'plus' | 'pro' | 'team';
  onboardingCompleted: boolean;
  firstProjectIdea?: string;
  lastUpdated: string;
}
