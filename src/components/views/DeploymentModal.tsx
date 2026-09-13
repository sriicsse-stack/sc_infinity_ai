import React, { useState, useEffect } from 'react';
import { 
  X, 
  Rocket, 
  CheckCircle2, 
  Circle, 
  ExternalLink, 
  Share2, 
  Copy, 
  Check, 
  Sparkles, 
  Layers, 
  Globe, 
  Key, 
  Download, 
  AlertCircle,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useProject } from '../../context/ProjectContext';
import { useRuntime } from '../../context/RuntimeContext';
import { VercelService } from '../../services/vercelService';

interface DeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeploymentModal: React.FC<DeploymentModalProps> = ({
  isOpen,
  onClose
}) => {
  const { currentProject, exportCurrentProjectZip, fileTree } = useProject();
  const { openStandalonePreview } = useRuntime();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [stepMessage, setStepMessage] = useState<string>('');
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [deploymentUrl, setDeploymentUrl] = useState<string>('');
  const [inspectUrl, setInspectUrl] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [vercelToken, setVercelToken] = useState<string>(() => {
    return localStorage.getItem('infinity_vercel_token') || (import.meta as any).env?.VITE_VERCEL_TOKEN || '';
  });
  const [showTokenConfig, setShowTokenConfig] = useState<boolean>(false);

  const deploymentSlug = (currentProject.rootPath || currentProject.name || 'infinity-app').toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const steps = [
    { id: 1, title: 'Check & Prepare', desc: 'Validating HTML/JS/CSS assets & bundle trees' },
    { id: 2, title: 'Build & Optimize', desc: 'Bundling production static build for Edge CDN' },
    { id: 3, title: 'Deploy to Cloud', desc: 'Pushing to Vercel Global Edge Network...' },
    { id: 4, title: 'Live on Web', desc: 'Your application is live globally' },
  ];

  const handleStartDeploy = async () => {
    setIsDeploying(true);
    setCurrentStep(1);
    setErrorMessage(null);
    setDeploymentUrl('');

    try {
      const result = await VercelService.deployProject(
        vercelToken,
        deploymentSlug,
        fileTree,
        (stepNum, msg) => {
          setCurrentStep(stepNum);
          setStepMessage(msg);
        }
      );

      setIsDeploying(false);

      if (result.success) {
        setCurrentStep(4);
        setDeploymentUrl(result.deploymentUrl);
        setInspectUrl(result.inspectUrl);

        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } else {
        setErrorMessage(result.error || 'Deployment failed. Please verify your Vercel Token.');
      }
    } catch (err: any) {
      setIsDeploying(false);
      setErrorMessage(err.message || 'Network error during Vercel deployment.');
    }
  };

  useEffect(() => {
    if (isOpen && currentStep === 1 && !isDeploying && !deploymentUrl) {
      handleStartDeploy();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const copyUrl = () => {
    if (!deploymentUrl) return;
    navigator.clipboard.writeText(deploymentUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSaveToken = () => {
    localStorage.setItem('infinity_vercel_token', vercelToken);
    setShowTokenConfig(false);
    handleStartDeploy();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-md bg-[#0e1320] dark:bg-[#0e1320] light:bg-white rounded-3xl border border-indigo-500/30 dark:border-indigo-500/30 light:border-slate-300 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Rocket className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-base font-bold text-white dark:text-white light:text-slate-900">Vercel Cloud Deployment</h2>
              <p className="text-xs text-slate-400 mt-0.5">Real-time Automated Edge Pipeline</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps List */}
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            {steps.map((s) => {
              const isDone = currentStep > s.id || (currentStep === 4 && !!deploymentUrl);
              const isRunning = isDeploying && currentStep === s.id;

              return (
                <div 
                  key={s.id} 
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                    isRunning 
                      ? 'bg-indigo-600/10 border-indigo-500/40' 
                      : isDone 
                      ? 'bg-emerald-950/20 border-emerald-500/30' 
                      : 'bg-slate-900/30 border-slate-800/60 opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isDone 
                        ? 'bg-emerald-500 text-white' 
                        : isRunning 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {s.id}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white dark:text-white light:text-slate-900">{s.title}</div>
                      <div className="text-[10px] text-slate-400">
                        {isRunning && stepMessage ? stepMessage : s.desc}
                      </div>
                    </div>
                  </div>

                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isRunning ? (
                    <div className="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-600" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Error Box */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-950/50 border border-rose-500/50 text-rose-300 space-y-2 text-xs animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span>Deployment Error</span>
                </span>
                <button
                  onClick={() => setShowTokenConfig(!showTokenConfig)}
                  className="text-[10px] text-indigo-300 underline cursor-pointer"
                >
                  Configure Token
                </button>
              </div>
              <p className="text-[11px] text-rose-200/90 leading-relaxed">{errorMessage}</p>
              <button
                onClick={handleStartDeploy}
                className="w-full py-1.5 rounded-xl bg-rose-800 hover:bg-rose-700 text-white font-medium text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Deployment</span>
              </button>
            </div>
          )}

          {/* Success Box with Live URL */}
          {currentStep === 4 && deploymentUrl && (
            <div className="p-4 rounded-2xl bg-gradient-to-b from-emerald-950/40 to-slate-900/90 border border-emerald-500/40 text-center space-y-3 animate-in zoom-in-95">
              <div className="inline-flex p-3 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Application Deployed Successfully!</h3>
                <p className="text-xs text-slate-400 mt-0.5">Live globally on Vercel Global Edge CDN</p>
              </div>

              {/* URL Display */}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-emerald-400 truncate pr-2">{deploymentUrl}</span>
                <button
                  onClick={copyUrl}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Copy Live URL"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href={deploymentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <span>Open Live App</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => openStandalonePreview(fileTree)}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <span>In-App Preview</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Vercel Token Configuration Collapsible */}
          <div className="pt-2 border-t border-slate-800/80">
            <button
              onClick={() => setShowTokenConfig(!showTokenConfig)}
              className="text-[11px] text-slate-400 hover:text-indigo-400 flex items-center space-x-1.5 cursor-pointer"
            >
              <Key className="w-3 h-3 text-indigo-400" />
              <span>{showTokenConfig ? 'Hide Vercel Token Settings' : 'Configure Custom Vercel Token'}</span>
            </button>

            {showTokenConfig && (
              <div className="mt-2.5 p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Vercel API Token</span>
                  <a
                    href="https://vercel.com/account/tokens"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[9px] text-indigo-400 underline"
                  >
                    Get Token ↗
                  </a>
                </div>
                <input
                  type="password"
                  value={vercelToken}
                  onChange={(e) => setVercelToken(e.target.value)}
                  placeholder="vcp_..."
                  className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:border-indigo-500 outline-none"
                />
                <button
                  onClick={handleSaveToken}
                  className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Save & Re-deploy
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
