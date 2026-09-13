import React, { useState, useEffect } from 'react';
import { 
  RotateCw, 
  ArrowLeft, 
  ArrowRight, 
  ExternalLink, 
  Monitor, 
  Tablet, 
  Smartphone, 
  ShieldCheck,
  Maximize2,
  Minimize2,
  Lock,
  Mail,
  User,
  Sparkles,
  BookOpen,
  Award,
  Clock,
  CheckCircle,
  LogOut,
  AlertCircle,
  Code
} from 'lucide-react';
import { useRuntime } from '../../context/RuntimeContext';
import { useProject } from '../../context/ProjectContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { PreviewBundler } from '../../services/previewBundler';

interface PreviewViewProps {
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

export const PreviewView: React.FC<PreviewViewProps> = ({
  isMaximized: externalMaximized,
  onToggleMaximize: externalToggleMaximize
}) => {
  const { 
    previewUrl, 
    setPreviewUrl, 
    viewportMode, 
    setViewportMode, 
    refreshPreview, 
    previewKey 
  } = useRuntime();

  const { fileTree, currentProject } = useProject();
  const { theme } = useTheme();
  const { user } = useAuth();

  const [bundledHtml, setBundledHtml] = useState<string>('');
  const [internalMaximized, setInternalMaximized] = useState(false);

  const isMaximized = externalMaximized !== undefined ? externalMaximized : internalMaximized;
  const toggleMaximize = externalToggleMaximize || (() => setInternalMaximized(!internalMaximized));

  useEffect(() => {
    try {
      const html = PreviewBundler.bundleProject(fileTree);
      setBundledHtml(html);
    } catch (e) {
      console.error('Preview bundling error:', e);
    }
  }, [fileTree, previewKey]);

  const getViewportWidth = () => {
    switch (viewportMode) {
      case 'mobile':
        return 'w-[375px]';
      case 'tablet':
        return 'w-[768px]';
      case 'desktop':
      default:
        return 'w-full';
    }
  };

  const handleOpenNewTab = () => {
    const blob = new Blob([bundledHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div 
      className={`h-full bg-[#080a10] dark:bg-[#080a10] light:bg-slate-100 flex flex-col border-r border-[#1f293d] dark:border-[#1f293d] light:border-slate-200 overflow-hidden transition-all ${
        isMaximized ? 'fixed inset-0 z-40' : 'flex-1'
      }`}
    >
      {/* Browser Toolbar matching reference screenshot */}
      <div className="h-9 px-3 bg-[#0a0d15] dark:bg-[#0a0d15] light:bg-slate-200/80 border-b border-[#1f293d] dark:border-[#1f293d] light:border-slate-300 flex items-center justify-between text-xs select-none">
        {/* Navigation & Address */}
        <div className="flex items-center space-x-2 flex-1 max-w-md">
          <div className="flex items-center space-x-1 text-slate-400">
            <button 
              onClick={refreshPreview}
              className="p-1 hover:text-white rounded hover:bg-slate-800/40 cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={refreshPreview}
              className="p-1 hover:text-white rounded hover:bg-slate-800/40 cursor-pointer"
              title="Forward"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={refreshPreview}
              className="p-1 hover:text-white rounded hover:bg-slate-800/40 cursor-pointer"
              title="Refresh Preview"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* URL Bar */}
          <div className="flex-1 flex items-center space-x-1.5 px-2.5 py-1 bg-[#121826] dark:bg-[#121826] light:bg-white rounded-lg border border-slate-700/60 dark:border-slate-800 light:border-slate-300 text-slate-300 dark:text-slate-300 light:text-slate-700 font-mono text-[11px]">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span className="truncate">{previewUrl}</span>
          </div>
        </div>

        {/* Viewport Mode Controls & Maximize */}
        <div className="flex items-center space-x-1">
          <div className="flex items-center bg-[#121826] dark:bg-[#121826] light:bg-slate-300 p-0.5 rounded-lg border border-slate-800 dark:border-slate-800 light:border-slate-300">
            <button
              onClick={() => setViewportMode('desktop')}
              className={`p-1 rounded cursor-pointer ${viewportMode === 'desktop' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
              title="Desktop View (100%)"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewportMode('tablet')}
              className={`p-1 rounded cursor-pointer ${viewportMode === 'tablet' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewportMode('mobile')}
              className={`p-1 rounded cursor-pointer ${viewportMode === 'mobile' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
              title="Mobile View (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Maximize / Full Screen Button */}
          <button
            onClick={toggleMaximize}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              isMaximized 
                ? 'bg-indigo-600 text-white' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
            title={isMaximized ? "Exit Full Screen Preview" : "Full Screen Preview (Maximize)"}
          >
            {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Open in Standalone Tab */}
          <button
            onClick={handleOpenNewTab}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/40 rounded cursor-pointer"
            title="Open Live Preview in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="flex-1 w-full bg-[#05070e] flex items-center justify-center p-0 relative overflow-hidden">
        <div className={`h-full transition-all duration-300 flex items-center justify-center ${getViewportWidth()}`}>
          <iframe
            key={previewKey}
            srcDoc={bundledHtml}
            title="SC INFINITY Live Sandbox Preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
            className="w-full h-full bg-white border-0 shadow-2xl"
          />
        </div>
      </div>
    </div>
  );
};
