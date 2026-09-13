import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Layers, 
  Code2, 
  Check, 
  ArrowRight, 
  FileCode2, 
  CheckCircle2, 
  ListChecks,
  ChevronRight
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { useAI } from '../../context/AIContext';

interface ProjectCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ProjectCreationModal: React.FC<ProjectCreationModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { createProject } = useProject();
  const { startAgentRun } = useAI();

  const [activeTab, setActiveTab] = useState<'templates' | 'ai_generate'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('react');
  const [projectName, setProjectName] = useState('');
  const [naturalPrompt, setNaturalPrompt] = useState('Build a college attendance system with React and Supabase');
  const [showPlanReview, setShowPlanReview] = useState(false);

  if (!isOpen) return null;

  const templates = [
    { id: 'react', name: 'React', category: 'Frontend', badge: '⚛', color: 'text-cyan-400' },
    { id: 'nextjs', name: 'Next.js', category: 'Full Stack', badge: 'N', color: 'text-white' },
    { id: 'nodejs', name: 'Node.js', category: 'Backend', badge: 'JS', color: 'text-emerald-400' },
    { id: 'python', name: 'Python', category: 'General', badge: '🐍', color: 'text-amber-400' },
    { id: 'flutter', name: 'Flutter', category: 'Mobile', badge: 'F', color: 'text-blue-400' },
    { id: 'html', name: 'HTML/CSS', category: 'Web', badge: '#', color: 'text-orange-400' },
    { id: 'java', name: 'Java', category: 'Application', badge: '☕', color: 'text-red-400' },
    { id: 'blank', name: 'Blank', category: 'Custom', badge: '✕', color: 'text-slate-400' },
  ];

  const generatedPlan = [
    '1. Create React frontend structure with Tailwind and Lucide icons',
    '2. Create Supabase authentication & user role permissions',
    '3. Create PostgreSQL database schema (Students, Courses, Attendance)',
    '4. Create student & instructor dashboard modules',
    '5. Create biometric & manual attendance logging APIs',
    '6. Implement analytics reports and export functionality',
    '7. Add responsive mobile & tablet viewports',
    '8. Add Vitest unit test suite and run verification',
    '9. Launch live development preview'
  ];

  const handleCreateFromTemplate = () => {
    const finalName = projectName.trim() || `${selectedTemplate.toUpperCase()} App`;
    createProject(finalName, selectedTemplate);
    onSuccess();
    onClose();
  };

  const handleStartAIGeneration = () => {
    setShowPlanReview(true);
  };

  const handleApproveAndBuild = () => {
    const name = naturalPrompt.split('with')[0].trim() || 'College Attendance System';
    createProject(name, 'react', naturalPrompt);
    startAgentRun(naturalPrompt);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-xl bg-[#0e1320] dark:bg-[#0e1320] light:bg-white rounded-3xl border border-slate-800 dark:border-slate-800 light:border-slate-300 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white dark:text-white light:text-slate-900">Create a New Project</h2>
            <p className="text-xs text-slate-400 mt-0.5">Choose a template or describe your idea</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {!showPlanReview ? (
            <>
              {/* Tab Selector matching screenshot */}
              <div className="flex items-center justify-center space-x-2 bg-[#080a10] dark:bg-[#080a10] light:bg-slate-100 p-1.5 rounded-2xl border border-slate-800 dark:border-slate-800 light:border-slate-300 w-fit mx-auto">
                <button
                  onClick={() => setActiveTab('templates')}
                  className={`px-6 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'templates'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Templates
                </button>
                <button
                  onClick={() => setActiveTab('ai_generate')}
                  className={`px-6 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                    activeTab === 'ai_generate'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                  <span>AI Generate</span>
                </button>
              </div>

              {activeTab === 'templates' ? (
                /* Templates Grid */
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-2.5">
                    {templates.map((tmpl) => (
                      <button
                        key={tmpl.id}
                        onClick={() => setSelectedTemplate(tmpl.id)}
                        className={`p-3 rounded-2xl border flex flex-col items-center justify-center space-y-1.5 transition-all text-center ${
                          selectedTemplate === tmpl.id
                            ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-sm'
                            : 'bg-[#121826] dark:bg-[#121826] light:bg-slate-50 border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span className={`text-lg font-bold ${tmpl.color}`}>{tmpl.badge}</span>
                        <span className="text-xs font-semibold text-white dark:text-white light:text-slate-900">{tmpl.name}</span>
                        <span className="text-[10px] text-slate-400">{tmpl.category}</span>
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-medium">Project Name (Optional)</label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="my-awesome-app"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <button
                    onClick={handleCreateFromTemplate}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all"
                  >
                    Create Project
                  </button>
                </div>
              ) : (
                /* Natural Language AI Prompt Box */
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-2 font-medium">
                      Or describe your project in natural language...
                    </label>
                    <textarea
                      value={naturalPrompt}
                      onChange={(e) => setNaturalPrompt(e.target.value)}
                      rows={3}
                      className="w-full p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>

                  <button
                    onClick={handleStartAIGeneration}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Create with Infinity AI</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Plan Review Stage */
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center space-x-2 text-indigo-400">
                <ListChecks className="w-5 h-5" />
                <h3 className="font-bold text-sm text-white dark:text-white light:text-slate-900">Generated Implementation Plan</h3>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 max-h-56 overflow-y-auto">
                {generatedPlan.map((step, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setShowPlanReview(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-800 hover:bg-slate-800/50 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Edit Prompt
                </button>
                <button
                  onClick={handleApproveAndBuild}
                  className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve & Build</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
