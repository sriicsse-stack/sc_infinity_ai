import React, { createContext, useContext, useState, useEffect } from 'react';
import { FileNode, EditorTab, ProblemItem, ProjectMeta } from '../types';
import { ProjectImporter } from '../services/projectImporter';
import { AIGenerator, GeneratedProjectResult } from '../services/aiGenerator';

const defaultStarterFiles: FileNode = {
  id: 'root',
  name: 'my-project',
  path: 'my-project',
  type: 'directory',
  isOpen: true,
  children: [
    {
      id: 'index-html',
      name: 'index.html',
      path: 'my-project/index.html',
      type: 'file',
      language: 'html',
      content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SC INFINITY Workspace</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <div class="hero">
      <div class="logo">∞</div>
      <h1>Welcome to SC INFINITY IDE</h1>
      <p class="subtitle">Think. Build. Debug. Deploy.</p>
    </div>

    <div class="card">
      <h2>Interactive Code Sandbox</h2>
      <p>Write HTML, CSS, JavaScript or TypeScript in Monaco Editor. Preview updates live in real time!</p>
      
      <div class="demo-box">
        <input type="number" id="numA" placeholder="Number A" value="15" />
        <span>+</span>
        <input type="number" id="numB" placeholder="Number B" value="27" />
        <button id="addBtn" onclick="runCalculation()">Calculate Sum</button>
      </div>

      <div class="result-badge" id="calcResult">Result: 42</div>
    </div>
  </div>

  <script src="app.js"></script>
</body>
</html>`
    },
    {
      id: 'styles-css',
      name: 'styles.css',
      path: 'my-project/styles.css',
      type: 'file',
      language: 'css',
      content: `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

body {
  background: #080a10;
  color: #e2e8f0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.container {
  width: 100%;
  max-width: 540px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.hero {
  text-align: center;
}

.logo {
  font-size: 42px;
  font-weight: 800;
  color: #6366f1;
  display: inline-block;
  margin-bottom: 8px;
}

h1 {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 4px;
}

.subtitle {
  font-size: 12px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #818cf8;
  font-weight: 600;
}

.card {
  background: #0f1422;
  border: 1px solid #1f293d;
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  text-align: center;
}

.card h2 {
  font-size: 18px;
  margin-bottom: 8px;
  color: #fff;
}

.card p {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 24px;
  line-height: 1.5;
}

.demo-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

input {
  width: 110px;
  padding: 10px 14px;
  background: #080a10;
  border: 1px solid #1f293d;
  border-radius: 12px;
  color: #fff;
  font-size: 14px;
  text-align: center;
  outline: none;
}

input:focus {
  border-color: #6366f1;
}

button {
  padding: 10px 18px;
  background: #4f46e5;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

button:hover {
  background: #4338ca;
  transform: translateY(-1px);
}

.result-badge {
  padding: 12px 20px;
  background: #171f33;
  border: 1px solid #1f293d;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
  color: #10b981;
}`
    },
    {
      id: 'app-js',
      name: 'app.js',
      path: 'my-project/app.js',
      type: 'file',
      language: 'javascript',
      content: `function add(a, b) {
  return a + b;
}

function runCalculation() {
  const valA = parseFloat(document.getElementById('numA').value) || 0;
  const valB = parseFloat(document.getElementById('numB').value) || 0;
  const sum = add(valA, valB);
  
  const resultElem = document.getElementById('calcResult');
  resultElem.innerText = \`Result: \${sum}\`;
  
  console.log(\`[Calculation]: \${valA} + \${valB} = \${sum}\`);
}

// Initial calculation
console.log("SC INFINITY Application Initialized successfully.");`
    },
    {
      id: 'readme-md',
      name: 'README.md',
      path: 'my-project/README.md',
      type: 'file',
      language: 'markdown',
      content: `# My Project\n\nBuilt with SC INFINITY IDE.\n\n## Features\n- Real-time Monaco Code Editing\n- Dynamic Live Preview\n- Gemini AI Assistant\n- Real In-browser Execution\n`
    }
  ]
};

const initialDefaultProjectMeta: ProjectMeta = {
  id: 'proj_default',
  name: 'My Project',
  tagline: 'Custom Web Application',
  technology: 'HTML5 / CSS / JS',
  framework: 'Web Standards',
  lastModified: 'Just now',
  templateType: 'html',
  port: 5173,
  rootPath: 'my-project',
  description: 'Clean workspace ready for coding, importing, or AI prompt generation.'
};

interface ProjectContextType {
  projects: ProjectMeta[];
  currentProject: ProjectMeta;
  setCurrentProject: (proj: ProjectMeta) => void;
  fileTree: FileNode;
  setFileTree: React.Dispatch<React.SetStateAction<FileNode>>;
  openTabs: EditorTab[];
  activeTabId: string | null;
  activeTab: EditorTab | null;
  problems: ProblemItem[];
  openFile: (file: FileNode) => void;
  closeTab: (tabId: string) => void;
  setActiveTabId: (id: string) => void;
  updateFileContent: (path: string, content: string) => void;
  createFileOrFolder: (parentPath: string, name: string, type: 'file' | 'directory') => void;
  deleteNode: (path: string) => void;
  renameNode: (path: string, newName: string) => void;
  findFileByPath: (path: string) => FileNode | null;
  saveCurrentFile: () => void;
  createProject: (name: string, templateType: any, description?: string) => ProjectMeta;
  importProjectFromDirectory: (files: FileList) => Promise<void>;
  importProjectFromZipFile: (file: File) => Promise<void>;
  exportCurrentProjectZip: () => Promise<void>;
  generateProjectWithAI: (prompt: string, preferredModel?: string, onProgress?: (stage: string) => void) => Promise<GeneratedProjectResult>;
  fixProblemWithAI: (problemId: string) => void;
  setProblems: React.Dispatch<React.SetStateAction<ProblemItem[]>>;
  isGeneratingProject: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<ProjectMeta[]>([initialDefaultProjectMeta]);
  const [currentProject, setCurrentProject] = useState<ProjectMeta>(initialDefaultProjectMeta);
  const [fileTree, setFileTree] = useState<FileNode>(defaultStarterFiles);
  const [isGeneratingProject, setIsGeneratingProject] = useState<boolean>(false);

  // Initial active tabs starting with index.html, styles.css, app.js
  const [openTabs, setOpenTabs] = useState<EditorTab[]>([
    {
      id: 'index-html',
      name: 'index.html',
      path: 'my-project/index.html',
      language: 'html',
      content: defaultStarterFiles.children![0].content
    },
    {
      id: 'styles-css',
      name: 'styles.css',
      path: 'my-project/styles.css',
      language: 'css',
      content: defaultStarterFiles.children![1].content
    },
    {
      id: 'app-js',
      name: 'app.js',
      path: 'my-project/app.js',
      language: 'javascript',
      content: defaultStarterFiles.children![2].content
    }
  ]);

  const [activeTabId, setActiveTabId] = useState<string | null>('index-html');
  const [problems, setProblems] = useState<ProblemItem[]>([]);

  const activeTab = openTabs.find((t) => t.id === activeTabId) || (openTabs.length > 0 ? openTabs[0] : null);

  const findNodeRecursive = (node: FileNode, path: string): FileNode | null => {
    if (node.path === path) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = findNodeRecursive(child, path);
        if (found) return found;
      }
    }
    return null;
  };

  const findFileByPath = (path: string): FileNode | null => {
    return findNodeRecursive(fileTree, path);
  };

  const openFile = (file: FileNode) => {
    if (file.type === 'directory') {
      const toggleRecursive = (node: FileNode): FileNode => {
        if (node.id === file.id) {
          return { ...node, isOpen: !node.isOpen };
        }
        if (node.children) {
          return { ...node, children: node.children.map(toggleRecursive) };
        }
        return node;
      };
      setFileTree(prev => toggleRecursive(prev));
      return;
    }

    const existing = openTabs.find(t => t.path === file.path);
    if (existing) {
      setActiveTabId(existing.id);
    } else {
      const newTab: EditorTab = {
        id: file.id || `tab_${Date.now()}`,
        name: file.name,
        path: file.path,
        language: file.language || getLanguageFromExt(file.name),
        content: file.content || ''
      };
      setOpenTabs(prev => [...prev, newTab]);
      setActiveTabId(newTab.id);
    }
  };

  const closeTab = (tabId: string) => {
    const remaining = openTabs.filter(t => t.id !== tabId);
    setOpenTabs(remaining);
    if (activeTabId === tabId) {
      if (remaining.length > 0) {
        setActiveTabId(remaining[remaining.length - 1].id);
      } else {
        setActiveTabId(null);
      }
    }
  };

  const updateFileContent = (path: string, content: string) => {
    setOpenTabs(prev => prev.map(tab => {
      if (tab.path === path) {
        return { ...tab, content, isDirty: true };
      }
      return tab;
    }));

    const updateRecursive = (node: FileNode): FileNode => {
      if (node.path === path) {
        return { ...node, content, isModified: true };
      }
      if (node.children) {
        return { ...node, children: node.children.map(updateRecursive) };
      }
      return node;
    };
    setFileTree(prev => updateRecursive(prev));
  };

  const saveCurrentFile = () => {
    if (!activeTab) return;
    setOpenTabs(prev => prev.map(tab => tab.id === activeTab.id ? { ...tab, isDirty: false } : tab));
  };

  const createFileOrFolder = (parentPath: string, name: string, type: 'file' | 'directory') => {
    const newNode: FileNode = {
      id: `node_${Date.now()}`,
      name,
      path: `${parentPath}/${name}`,
      type,
      language: type === 'file' ? getLanguageFromExt(name) : undefined,
      content: type === 'file' ? '' : undefined,
      isOpen: type === 'directory' ? true : undefined,
      children: type === 'directory' ? [] : undefined
    };

    const addRecursive = (node: FileNode): FileNode => {
      if (node.path === parentPath) {
        return {
          ...node,
          isOpen: true,
          children: [...(node.children || []), newNode]
        };
      }
      if (node.children) {
        return { ...node, children: node.children.map(addRecursive) };
      }
      return node;
    };

    setFileTree(prev => addRecursive(prev));
    if (type === 'file') {
      openFile(newNode);
    }
  };

  const deleteNode = (path: string) => {
    const deleteRecursive = (node: FileNode): FileNode => {
      if (!node.children) return node;
      return {
        ...node,
        children: node.children.filter(c => c.path !== path).map(deleteRecursive)
      };
    };
    setFileTree(prev => deleteRecursive(prev));
    setOpenTabs(prev => prev.filter(t => !t.path.startsWith(path)));
  };

  const renameNode = (path: string, newName: string) => {
    const renameRecursive = (node: FileNode): FileNode => {
      if (node.path === path) {
        const parts = node.path.split('/');
        parts[parts.length - 1] = newName;
        const newPath = parts.join('/');
        return {
          ...node,
          name: newName,
          path: newPath,
          language: node.type === 'file' ? getLanguageFromExt(newName) : undefined
        };
      }
      if (node.children) {
        return { ...node, children: node.children.map(renameRecursive) };
      }
      return node;
    };
    setFileTree(prev => renameRecursive(prev));
  };

  const createProject = (name: string, templateType: any, description?: string): ProjectMeta => {
    const rootPath = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newProj: ProjectMeta = {
      id: `proj_${Date.now()}`,
      name,
      tagline: description || 'New Application',
      technology: templateType === 'html' ? 'HTML / CSS / JS' : templateType === 'nextjs' ? 'Next.js' : 'React + Tailwind',
      framework: 'Web Standards',
      lastModified: 'Just now',
      templateType,
      port: 5173,
      rootPath,
      description: description || 'Created with SC INFINITY IDE'
    };

    const newRootNode: FileNode = {
      id: 'root',
      name: rootPath,
      path: rootPath,
      type: 'directory',
      isOpen: true,
      children: [
        {
          id: `index_${Date.now()}`,
          name: 'index.html',
          path: `${rootPath}/index.html`,
          type: 'file',
          language: 'html',
          content: `<!DOCTYPE html>\n<html>\n<head>\n  <title>${name}</title>\n  <style>body { background: #080a10; color: #fff; font-family: sans-serif; padding: 32px; }</style>\n</head>\n<body>\n  <h1>${name}</h1>\n  <p>${description || 'Project ready for development.'}</p>\n</body>\n</html>`
        }
      ]
    };

    setProjects(prev => [newProj, ...prev]);
    setCurrentProject(newProj);
    setFileTree(newRootNode);
    setOpenTabs([{
      id: newRootNode.children![0].id,
      name: newRootNode.children![0].name,
      path: newRootNode.children![0].path,
      language: 'html',
      content: newRootNode.children![0].content
    }]);
    setActiveTabId(newRootNode.children![0].id);

    return newProj;
  };

  const importProjectFromDirectory = async (files: FileList) => {
    const imported = await ProjectImporter.importFromDirectoryInput(files);
    const newProj: ProjectMeta = {
      id: `proj_import_${Date.now()}`,
      name: imported.projectName,
      tagline: 'Imported Local Project',
      technology: 'Imported Codebase',
      framework: 'Local Files',
      lastModified: 'Just now',
      templateType: 'blank',
      port: 5173,
      rootPath: imported.projectName
    };

    setProjects(prev => [newProj, ...prev]);
    setCurrentProject(newProj);
    setFileTree(imported.rootNode);

    if (imported.mainFile) {
      setOpenTabs([{
        id: imported.mainFile.id,
        name: imported.mainFile.name,
        path: imported.mainFile.path,
        language: imported.mainFile.language || 'plaintext',
        content: imported.mainFile.content || ''
      }]);
      setActiveTabId(imported.mainFile.id);
    } else if (imported.rootNode.children && imported.rootNode.children.length > 0) {
      const first = imported.rootNode.children[0];
      if (first.type === 'file') {
        setOpenTabs([{
          id: first.id,
          name: first.name,
          path: first.path,
          language: first.language || 'plaintext',
          content: first.content || ''
        }]);
        setActiveTabId(first.id);
      }
    }
  };

  const importProjectFromZipFile = async (file: File) => {
    const imported = await ProjectImporter.importFromZip(file);
    const newProj: ProjectMeta = {
      id: `proj_zip_${Date.now()}`,
      name: imported.projectName,
      tagline: 'Imported Zip Archive',
      technology: 'Extracted Project',
      framework: 'Zip Package',
      lastModified: 'Just now',
      templateType: 'blank',
      port: 5173,
      rootPath: imported.projectName
    };

    setProjects(prev => [newProj, ...prev]);
    setCurrentProject(newProj);
    setFileTree(imported.rootNode);

    if (imported.mainFile) {
      setOpenTabs([{
        id: imported.mainFile.id,
        name: imported.mainFile.name,
        path: imported.mainFile.path,
        language: imported.mainFile.language || 'plaintext',
        content: imported.mainFile.content || ''
      }]);
      setActiveTabId(imported.mainFile.id);
    }
  };

  const exportCurrentProjectZip = async () => {
    const blob = await ProjectImporter.exportProjectToZip(fileTree);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProject.rootPath || currentProject.name || 'sc-infinity-project'}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateProjectWithAI = async (
    prompt: string,
    preferredModel: string = 'gemini-2.0-flash',
    onProgress?: (stage: string) => void
  ): Promise<GeneratedProjectResult> => {
    setIsGeneratingProject(true);
    try {
      const generated = await AIGenerator.generateProjectFromPrompt(prompt, preferredModel, onProgress);
      setProjects(prev => [generated.projectMeta, ...prev]);
      setCurrentProject(generated.projectMeta);
      setFileTree(generated.fileTree);

      const newTabs: EditorTab[] = [];
      if (generated.fileTree.children) {
        for (const child of generated.fileTree.children.slice(0, 3)) {
          if (child.type === 'file') {
            newTabs.push({
              id: child.id,
              name: child.name,
              path: child.path,
              language: child.language || 'plaintext',
              content: child.content || ''
            });
          }
        }
      }

      setOpenTabs(newTabs);
      if (generated.mainFile) {
        setActiveTabId(generated.mainFile.id);
      } else if (newTabs.length > 0) {
        setActiveTabId(newTabs[0].id);
      }
      return generated;
    } finally {
      setIsGeneratingProject(false);
    }
  };

  const fixProblemWithAI = (problemId: string) => {
    setProblems(prev => prev.filter(p => p.id !== problemId));
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        setCurrentProject,
        fileTree,
        setFileTree,
        openTabs,
        activeTabId,
        activeTab,
        problems,
        openFile,
        closeTab,
        setActiveTabId,
        updateFileContent,
        createFileOrFolder,
        deleteNode,
        renameNode,
        findFileByPath,
        saveCurrentFile,
        createProject,
        importProjectFromDirectory,
        importProjectFromZipFile,
        exportCurrentProjectZip,
        generateProjectWithAI,
        fixProblemWithAI,
        setProblems,
        isGeneratingProject
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

function getLanguageFromExt(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'html':
      return 'html';
    case 'css':
      return 'css';
    case 'json':
      return 'json';
    case 'py':
      return 'python';
    case 'sql':
      return 'sql';
    case 'md':
      return 'markdown';
    default:
      return 'plaintext';
  }
}
