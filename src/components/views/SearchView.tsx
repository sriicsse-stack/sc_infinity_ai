import React, { useState } from 'react';
import { Search, FileCode, CaseSensitive, Regex, WholeWord } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

export const SearchView: React.FC = () => {
  const { openFile, findFileByPath } = useProject();
  const [query, setQuery] = useState('');

  const searchResults = query.trim() ? [
    { file: 'student-portal/src/pages/Login.tsx', line: 11, match: 'const handleLogin = async (e: React.FormEvent) => {' },
    { file: 'student-portal/src/pages/Login.tsx', line: 14, match: 'await signIn(email, password);' },
    { file: 'student-portal/src/services/authService.ts', line: 7, match: 'export async function signIn(email: string, password: string)' },
    { file: 'student-portal/src/components/Button.tsx', line: 8, match: 'export const Button: React.FC<ButtonProps> = ({' },
  ].filter(r => r.match.toLowerCase().includes(query.toLowerCase()) || r.file.toLowerCase().includes(query.toLowerCase())) : [];

  return (
    <div className="w-80 h-full bg-[#0a0d15] dark:bg-[#0a0d15] light:bg-slate-50 border-r border-[#1f293d] dark:border-[#1f293d] light:border-slate-200 flex flex-col text-xs overflow-y-auto p-4 space-y-4 select-none">
      <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
        <Search className="w-4 h-4 text-indigo-400" />
        <span className="font-bold text-sm text-white dark:text-white light:text-slate-900">Search Workspace</span>
      </div>

      <div className="space-y-2">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across all files..."
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
            autoFocus
          />
        </div>

        <div className="flex items-center space-x-1 text-slate-400">
          <button className="p-1 rounded hover:bg-slate-800 hover:text-white" title="Match Case">
            <CaseSensitive className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 rounded hover:bg-slate-800 hover:text-white" title="Match Whole Word">
            <WholeWord className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 rounded hover:bg-slate-800 hover:text-white" title="Use Regular Expression">
            <Regex className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
          Results {query ? `(${searchResults.length})` : ''}
        </span>

        <div className="space-y-1.5">
          {searchResults.map((res, i) => (
            <div
              key={i}
              onClick={() => {
                const node = findFileByPath(res.file);
                if (node) openFile(node);
              }}
              className="p-2.5 rounded-xl bg-[#0f1422] dark:bg-[#0f1422] light:bg-white border border-slate-800 hover:border-indigo-500/40 cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-1.5 text-indigo-300 font-medium mb-1">
                <FileCode className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="truncate">{res.file}</span>
                <span className="text-[10px] text-slate-500">:Ln {res.line}</span>
              </div>
              <div className="font-mono text-[11px] text-slate-300 bg-slate-900/80 p-1.5 rounded truncate">
                {res.match}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
