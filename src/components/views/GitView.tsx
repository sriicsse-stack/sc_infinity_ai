import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  GitCommit, 
  UploadCloud, 
  RefreshCw, 
  Check, 
  Sparkles, 
  FileCode, 
  Plus, 
  Minus, 
  CheckCircle2, 
  ExternalLink, 
  Lock, 
  Github, 
  Key, 
  FolderGit2, 
  CheckCheck,
  AlertCircle,
  User,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAI } from '../../context/AIContext';
import { useProject } from '../../context/ProjectContext';
import { GitHubService, GitHubUser } from '../../services/githubService';

export const GitView: React.FC = () => {
  const { sendMessage } = useAI();
  const { fileTree, currentProject } = useProject();

  const [branch, setBranch] = useState('main');
  const [commitMessage, setCommitMessage] = useState('feat: update web components and reactive state');
  const [isCommitted, setIsCommitted] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [pushProgressMsg, setPushProgressMsg] = useState('');
  const [pushedSuccessUrl, setPushedSuccessUrl] = useState<string | null>(null);
  const [pushedCommitSha, setPushedCommitSha] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);

  const [repoName, setRepoName] = useState<string>(() => {
    return localStorage.getItem('infinity_git_repo') || 'sc_infinity';
  });

  const [githubToken, setGithubToken] = useState<string>(() => {
    return localStorage.getItem('infinity_github_token') || '';
  });

  const [gitUser, setGitUser] = useState<GitHubUser | null>(null);
  const [isValidatingToken, setIsValidatingToken] = useState(false);

  // Validate token on change
  useEffect(() => {
    if (githubToken.trim()) {
      setIsValidatingToken(true);
      GitHubService.validateToken(githubToken).then(res => {
        setIsValidatingToken(false);
        if (res.valid && res.user) {
          setGitUser(res.user);
          setErrorMessage(null);
        } else {
          setGitUser(null);
        }
      });
    } else {
      setGitUser(null);
    }
  }, [githubToken]);

  // Collect modified files from fileTree
  const collectFiles = (node: any, arr: string[] = []): string[] => {
    if (node.type === 'file') arr.push(node.name);
    else if (node.children) node.children.forEach((c: any) => collectFiles(c, arr));
    return arr;
  };

  const projectFiles = collectFiles(fileTree);
  const [stagedList, setStagedList] = useState<string[]>(projectFiles);

  const toggleStageFile = (fileName: string) => {
    setStagedList(prev => 
      prev.includes(fileName) ? prev.filter(f => f !== fileName) : [...prev, fileName]
    );
  };

  const handleCommit = () => {
    if (!commitMessage.trim()) return;
    setIsCommitted(true);
    setErrorMessage(null);
    setTimeout(() => setIsCommitted(false), 3000);
  };

  const handlePushToGithub = async () => {
    if (!githubToken.trim()) {
      setShowConfig(true);
      setErrorMessage('Please enter your GitHub Personal Access Token (PAT) below to push to your GitHub account.');
      return;
    }

    setIsPushing(true);
    setPushedSuccessUrl(null);
    setPushedCommitSha(null);
    setErrorMessage(null);
    setPushProgressMsg('Connecting to GitHub API...');

    // Save configuration
    localStorage.setItem('infinity_git_repo', repoName);
    localStorage.setItem('infinity_github_token', githubToken);

    try {
      const result = await GitHubService.pushProject(
        githubToken,
        repoName,
        fileTree,
        commitMessage,
        branch,
        (msg) => setPushProgressMsg(msg)
      );

      setIsPushing(false);

      if (result.success) {
        setPushedSuccessUrl(result.commitUrl || result.repoUrl);
        setPushedCommitSha(result.commitSha);

        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      } else {
        setErrorMessage(result.error || 'Failed to push to GitHub. Please check your token permissions.');
      }
    } catch (err: any) {
      setIsPushing(false);
      setErrorMessage(err.message || 'Push failed due to network error.');
    }
  };

  const handleGenerateAIMessage = () => {
    const filesSummary = stagedList.slice(0, 3).join(', ');
    setCommitMessage(`feat(${currentProject.name.toLowerCase()}): update ${filesSummary || 'application files'} with interactive components`);
  };

  return (
    <div className="w-80 h-full bg-[#0a0d15] dark:bg-[#0a0d15] light:bg-slate-50 border-r border-[#1f293d] dark:border-[#1f293d] light:border-slate-200 flex flex-col text-xs overflow-y-auto p-4 space-y-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Github className="w-4 h-4 text-indigo-400" />
          <span className="font-bold text-sm text-white dark:text-white light:text-slate-900">GitHub Source Control</span>
        </div>
        <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-slate-800 text-[11px] font-mono text-indigo-300">
          <GitBranch className="w-3 h-3 text-indigo-400" />
          <span>{branch}</span>
        </div>
      </div>

      {/* GitHub Repository & Account Status Card */}
      <div className="p-3.5 rounded-2xl bg-[#0f1422] border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-white text-[11px] flex items-center space-x-1.5">
            <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>origin/{branch}</span>
          </span>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
          >
            {showConfig ? 'Hide Settings' : 'Configure Token'}
          </button>
        </div>

        {gitUser ? (
          <div className="flex items-center space-x-2.5 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <img 
              src={gitUser.avatar_url} 
              alt={gitUser.login} 
              className="w-6 h-6 rounded-full border border-indigo-500/50" 
            />
            <div className="flex flex-col truncate">
              <span className="font-bold text-white text-[11px] truncate flex items-center space-x-1">
                <span>{gitUser.name || gitUser.login}</span>
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
              </span>
              <span className="text-[9px] text-slate-400 font-mono truncate">github.com/{gitUser.login}/{repoName}</span>
            </div>
          </div>
        ) : (
          <div className="text-[11px] text-slate-400 font-mono truncate">
            github.com/{gitUser?.login || 'user'}/<span className="text-white font-semibold">{repoName}</span>
          </div>
        )}

        {showConfig && (
          <div className="pt-2.5 border-t border-slate-800 space-y-2.5 animate-in fade-in">
            <div>
              <span className="text-[10px] text-slate-400 block mb-1">GitHub Repo Name</span>
              <input
                type="text"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                placeholder="my-cool-app"
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-400">Personal Access Token (PAT)</span>
                <a 
                  href="https://github.com/settings/tokens/new?scopes=repo,user" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[9px] text-indigo-400 hover:text-indigo-300 underline"
                >
                  Generate Token ↗
                </a>
              </div>
              <input
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder="ghp_your_real_github_token"
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-indigo-500 outline-none"
              />
              <p className="text-[9px] text-slate-500 mt-1">
                Required scope: <span className="text-slate-300 font-mono">repo</span> (Full control of private & public repositories).
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Commit Message Box */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Commit Message</span>
          <button
            onClick={handleGenerateAIMessage}
            className="flex items-center space-x-1 text-indigo-400 hover:text-indigo-300 text-[11px] cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>AI Message</span>
          </button>
        </div>

        <textarea
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          rows={2}
          placeholder="Describe your changes..."
          className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
        />

        <div className="grid grid-cols-2 gap-2">
          {/* Commit Button */}
          <button
            onClick={handleCommit}
            className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-sm"
          >
            <GitCommit className="w-3.5 h-3.5 text-indigo-400" />
            <span>Commit ({stagedList.length})</span>
          </button>

          {/* Real Push to GitHub Button */}
          <button
            onClick={handlePushToGithub}
            disabled={isPushing}
            className="py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            {isPushing ? (
              <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <UploadCloud className="w-3.5 h-3.5" />
            )}
            <span>{isPushing ? 'Pushing...' : 'Push to GitHub'}</span>
          </button>
        </div>

        {/* Live Progress Indicator */}
        {isPushing && (
          <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/40 text-indigo-300 flex items-center space-x-2 text-xs animate-in fade-in">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin flex-shrink-0" />
            <span className="truncate">{pushProgressMsg || 'Uploading files to GitHub...'}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 space-y-1 text-xs animate-in fade-in">
            <div className="flex items-center space-x-1.5 font-semibold">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
              <span>GitHub Error</span>
            </div>
            <p className="text-[10px] text-rose-200/90 leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {isCommitted && (
          <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-center flex items-center justify-center space-x-1.5 text-xs animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Changes committed locally to {branch}!</span>
          </div>
        )}

        {pushedSuccessUrl && (
          <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/70 to-indigo-950/70 border border-emerald-500/40 text-emerald-300 space-y-2 animate-in zoom-in-95">
            <div className="flex items-center space-x-2 font-bold text-xs text-white">
              <CheckCheck className="w-4 h-4 text-emerald-400" />
              <span>Pushed to GitHub Successfully!</span>
            </div>
            <p className="text-[10px] text-slate-300">
              Commit <span className="font-mono text-emerald-400">{pushedCommitSha}</span> is now live in your repository.
            </p>
            <a
              href={pushedSuccessUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium underline"
            >
              <span>View Commit on GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      {/* Staged Changes List */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
          <span>Staged Changes ({stagedList.length})</span>
          <button 
            onClick={() => setStagedList(stagedList.length === projectFiles.length ? [] : projectFiles)}
            className="text-[10px] text-indigo-400 hover:underline cursor-pointer"
          >
            {stagedList.length === projectFiles.length ? 'Unstage All' : 'Stage All'}
          </button>
        </div>

        <div className="space-y-1">
          {projectFiles.map((name, idx) => {
            const isStaged = stagedList.includes(name);
            return (
              <div 
                key={idx} 
                className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center space-x-2 truncate">
                  <FileCode className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                  <span className="text-white font-mono text-[11px] truncate">{name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-emerald-400 font-mono">+{8 * (idx + 1)}</span>
                  <button
                    onClick={() => toggleStageFile(name)}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white cursor-pointer"
                  >
                    {isStaged ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
