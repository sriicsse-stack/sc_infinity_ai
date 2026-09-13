import React, { useState, useRef } from 'react';
import { 
  Folder, 
  FolderOpen, 
  FileCode, 
  FileText, 
  File, 
  FilePlus, 
  FolderPlus, 
  RotateCw, 
  ChevronRight, 
  ChevronDown, 
  Sparkles,
  Trash2,
  Upload,
  Download,
  FolderInput,
  Plus
} from 'lucide-react';
import { FileNode } from '../../types';
import { useProject } from '../../context/ProjectContext';
import { useAI } from '../../context/AIContext';

export const ExplorerView: React.FC = () => {
  const { 
    fileTree, 
    openFile, 
    activeTab, 
    createFileOrFolder, 
    deleteNode, 
    renameNode, 
    currentProject,
    importProjectFromDirectory,
    importProjectFromZipFile,
    exportCurrentProjectZip
  } = useProject();

  const { sendMessage } = useAI();

  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newItemName, setNewItemName] = useState('');

  const folderInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (name: string) => {
    if (name.endsWith('.tsx') || name.endsWith('.jsx')) {
      return <span className="text-cyan-400 font-bold text-[11px]">⚛</span>;
    }
    if (name.endsWith('.ts') || name.endsWith('.js')) {
      return <span className="text-blue-400 font-bold text-[10px]">JS</span>;
    }
    if (name.endsWith('.json')) {
      return <span className="text-amber-400 font-bold text-[10px]">{}</span>;
    }
    if (name.endsWith('.css') || name.endsWith('.html')) {
      return <span className="text-pink-400 font-bold text-[10px]">#</span>;
    }
    if (name.endsWith('.md')) {
      return <FileText className="w-3.5 h-3.5 text-slate-400" />;
    }
    return <File className="w-3.5 h-3.5 text-slate-400" />;
  };

  const handleCreateSubmit = (type: 'file' | 'directory') => {
    if (newItemName.trim()) {
      createFileOrFolder(fileTree.path, newItemName.trim(), type);
      setNewItemName('');
      setIsCreatingFile(false);
      setIsCreatingFolder(false);
    }
  };

  const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      importProjectFromDirectory(e.target.files);
    }
  };

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      importProjectFromZipFile(e.target.files[0]);
    }
  };

  const renderTree = (node: FileNode, level = 0) => {
    const isFolder = node.type === 'directory';
    const isSelected = activeTab?.path === node.path;

    return (
      <div key={node.path} className="select-none">
        <div
          onClick={() => openFile(node)}
          className={`flex items-center justify-between py-1 px-2 rounded-md cursor-pointer transition-colors group text-xs ${
            isSelected
              ? 'bg-indigo-500/15 text-indigo-300 font-medium'
              : 'text-slate-300 hover:bg-slate-800/40 hover:text-white'
          }`}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
        >
          <div className="flex items-center space-x-1.5 truncate">
            {isFolder ? (
              <>
                {node.isOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
                {node.isOpen ? (
                  <FolderOpen className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/20" />
                ) : (
                  <Folder className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/20" />
                )}
              </>
            ) : (
              <span className="w-3.5 h-3.5 flex items-center justify-center ml-3.5">
                {getFileIcon(node.name)}
              </span>
            )}
            <span className="truncate">{node.name}</span>
          </div>

          {/* Hover Actions */}
          <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                sendMessage(`Please explain and analyze file \`${node.path}\``);
              }}
              title="Ask Infinity AI"
              className="p-0.5 hover:text-indigo-400"
            >
              <Sparkles className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete ${node.name}?`)) {
                  deleteNode(node.path);
                }
              }}
              title="Delete"
              className="p-0.5 hover:text-rose-400"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {isFolder && node.isOpen && node.children && (
          <div>
            {node.children.map((child) => renderTree(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-60 h-full bg-[#0a0d15] dark:bg-[#0a0d15] light:bg-slate-50 border-r border-[#1f293d] dark:border-[#1f293d] light:border-slate-200 flex flex-col text-xs select-none">
      {/* Hidden File Pickers for Real Project Import */}
      <input
        type="file"
        ref={folderInputRef}
        onChange={handleFolderChange}
        // @ts-ignore
        webkitdirectory="true"
        directory="true"
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={zipInputRef}
        onChange={handleZipChange}
        accept=".zip"
        className="hidden"
      />

      {/* Explorer Header */}
      <div className="h-9 px-3 border-b border-[#1f293d] dark:border-[#1f293d] light:border-slate-200 flex items-center justify-between text-slate-400">
        <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-300 dark:text-slate-300 light:text-slate-700">
          Explorer
        </span>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => folderInputRef.current?.click()}
            className="p-1 hover:text-white rounded hover:bg-slate-800/50 text-indigo-400"
            title="Import Folder from Computer"
          >
            <FolderInput className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => zipInputRef.current?.click()}
            className="p-1 hover:text-white rounded hover:bg-slate-800/50"
            title="Import ZIP Archive"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => exportCurrentProjectZip()}
            className="p-1 hover:text-white rounded hover:bg-slate-800/50"
            title="Export / Download ZIP"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setIsCreatingFile(true);
              setIsCreatingFolder(false);
            }}
            className="p-1 hover:text-white rounded hover:bg-slate-800/50"
            title="New File"
          >
            <FilePlus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setIsCreatingFolder(true);
              setIsCreatingFile(false);
            }}
            className="p-1 hover:text-white rounded hover:bg-slate-800/50"
            title="New Folder"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Project Root Bar */}
      <div className="px-3 py-1.5 bg-[#0f1422] dark:bg-[#0f1422] light:bg-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-300 dark:text-slate-300 light:text-slate-800">
        <div className="flex items-center space-x-1.5 truncate">
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="truncate">{currentProject.rootPath || currentProject.name}</span>
        </div>
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono">
          {currentProject.technology}
        </span>
      </div>

      {/* Inline Create Input */}
      {(isCreatingFile || isCreatingFolder) && (
        <div className="p-2 border-b border-slate-800 bg-slate-900/60">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateSubmit(isCreatingFile ? 'file' : 'directory');
              if (e.key === 'Escape') {
                setIsCreatingFile(false);
                setIsCreatingFolder(false);
              }
            }}
            placeholder={isCreatingFile ? 'filename.html' : 'folder-name'}
            autoFocus
            className="w-full px-2 py-1 bg-slate-800 rounded border border-indigo-500 text-xs text-white outline-none"
          />
        </div>
      )}

      {/* File Tree List */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
        {fileTree.children ? (
          fileTree.children.map((child) => renderTree(child, 0))
        ) : (
          renderTree(fileTree, 0)
        )}
      </div>

      {/* Ask Infinity AI Quick Banner at bottom of explorer */}
      <div className="p-2.5 border-t border-[#1f293d] bg-gradient-to-r from-indigo-950/30 to-violet-950/30 space-y-2">
        <button
          onClick={() => folderInputRef.current?.click()}
          className="w-full flex items-center justify-center space-x-1.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs font-medium"
        >
          <FolderInput className="w-3.5 h-3.5 text-indigo-400" />
          <span>Import Local Project</span>
        </button>

        <button
          onClick={() => sendMessage('Analyze my current project and recommend enhancements.')}
          className="w-full flex items-center justify-center space-x-2 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 hover:text-white transition-all text-xs font-medium"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Ask Infinity AI</span>
        </button>
      </div>
    </div>
  );
};
