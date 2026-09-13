import JSZip from 'jszip';
import { FileNode } from '../types';

const IGNORED_DIRECTORY_NAMES = new Set([
  'node_modules',
  '.git',
  '.next',
  '.turbo',
  '.cache',
  '.vscode',
  '.idea',
  'dist',
  'build',
  'out',
  'vendor',
  'coverage',
  '.venv',
  'venv',
  '__pycache__',
  '.svn',
  '.hg',
  'bin',
  'obj'
]);

const BINARY_EXTENSIONS = new Set([
  'exe', 'dll', 'so', 'dylib', 'bin',
  'zip', 'tar', 'gz', '7z', 'rar', 'iso',
  'woff', 'woff2', 'ttf', 'eot', 'otf',
  'mp4', 'mp3', 'mov', 'avi', 'mkv', 'wav', 'ogg', 'webm',
  'pdf', 'docx', 'xlsx', 'pptx', 'pyc', 'class'
]);

const IMAGE_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'ico', 'svg'
]);

export class ProjectImporter {
  /**
   * Import files from an HTML5 directory input event (webkitdirectory)
   * High performance: safely skips node_modules, .git, binaries, and reads source files in parallel batches.
   */
  public static async importFromDirectoryInput(
    files: FileList,
    onProgress?: (processed: number, total: number) => void
  ): Promise<{ projectName: string; rootNode: FileNode; mainFile?: FileNode }> {
    if (!files || files.length === 0) {
      throw new Error('No files selected');
    }

    const firstPath = files[0].webkitRelativePath || files[0].name;
    const rootName = firstPath.split('/')[0] || 'imported-project';

    const rootNode: FileNode = {
      id: 'root',
      name: rootName,
      path: rootName,
      type: 'directory',
      isOpen: true,
      children: []
    };

    // Filter valid files in memory (< 10ms for 50,000 files)
    const validFileList: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const relPath = file.webkitRelativePath || file.name;
      const parts = relPath.split('/');

      // Check if any parent folder is in IGNORED_DIRECTORY_NAMES
      const hasIgnoredDir = parts.some(p => IGNORED_DIRECTORY_NAMES.has(p.toLowerCase()));
      if (hasIgnoredDir) continue;

      // Skip large files (> 2MB for source editor)
      if (file.size > 2 * 1024 * 1024) continue;

      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      if (BINARY_EXTENSIONS.has(ext)) continue;

      validFileList.push(file);
      // Safety limit: up to 600 top source files to keep IDE blazing fast
      if (validFileList.length >= 600) break;
    }

    let mainFileNode: FileNode | undefined;

    // Process files in batches of 25 for maximum speed and memory safety
    const batchSize = 25;
    for (let i = 0; i < validFileList.length; i += batchSize) {
      const chunk = validFileList.slice(i, i + batchSize);
      await Promise.all(
        chunk.map(async (file) => {
          try {
            const relPath = file.webkitRelativePath || file.name;
            const parts = relPath.split('/');
            const ext = file.name.split('.').pop()?.toLowerCase() || '';

            let content = '';
            if (IMAGE_EXTENSIONS.has(ext) && ext !== 'svg') {
              // Read small images as data URL
              content = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string || '');
                reader.onerror = () => resolve('');
                reader.readAsDataURL(file);
              });
            } else {
              content = await file.text();
            }

            const language = this.getLanguage(file.name);
            let currentNode = rootNode;

            for (let p = 1; p < parts.length; p++) {
              const partName = parts[p];
              const isFile = p === parts.length - 1;
              const currentPath = parts.slice(0, p + 1).join('/');

              if (isFile) {
                const fileNode: FileNode = {
                  id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                  name: partName,
                  path: currentPath,
                  type: 'file',
                  language,
                  content
                };
                if (!currentNode.children) currentNode.children = [];
                currentNode.children.push(fileNode);

                if (
                  !mainFileNode &&
                  (partName === 'index.html' ||
                    partName === 'App.tsx' ||
                    partName === 'main.tsx' ||
                    partName === 'index.js' ||
                    partName === 'app.js' ||
                    partName === 'main.py')
                ) {
                  mainFileNode = fileNode;
                }
              } else {
                if (!currentNode.children) currentNode.children = [];
                let dir = currentNode.children.find(c => c.name === partName && c.type === 'directory');
                if (!dir) {
                  dir = {
                    id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                    name: partName,
                    path: currentPath,
                    type: 'directory',
                    isOpen: p === 1,
                    children: []
                  };
                  currentNode.children.push(dir);
                }
                currentNode = dir;
              }
            }
          } catch (err) {
            console.warn('Failed to read file:', file.name, err);
          }
        })
      );

      if (onProgress) {
        onProgress(Math.min(i + batchSize, validFileList.length), validFileList.length);
      }
    }

    // Sort children: directories first, then files
    const sortTree = (node: FileNode) => {
      if (node.children) {
        node.children.sort((a, b) => {
          if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
          return a.name.localeCompare(b.name);
        });
        node.children.forEach(sortTree);
      }
    };
    sortTree(rootNode);

    return { projectName: rootName, rootNode, mainFile: mainFileNode };
  }

  /**
   * Import project from a ZIP file
   */
  public static async importFromZip(
    file: File
  ): Promise<{ projectName: string; rootNode: FileNode; mainFile?: FileNode }> {
    const zip = await JSZip.loadAsync(file);
    const rootName = file.name.replace(/\.zip$/i, '') || 'imported-project';

    const rootNode: FileNode = {
      id: 'root',
      name: rootName,
      path: rootName,
      type: 'directory',
      isOpen: true,
      children: []
    };

    let mainFileNode: FileNode | undefined;
    const fileEntries = Object.keys(zip.files);

    for (const relativePath of fileEntries) {
      const zipEntry = zip.files[relativePath];
      if (zipEntry.dir) continue;

      const parts = relativePath.split('/').filter(Boolean);
      const hasIgnoredDir = parts.some(p => IGNORED_DIRECTORY_NAMES.has(p.toLowerCase()));
      if (hasIgnoredDir) continue;

      const fileName = parts[parts.length - 1];
      const ext = fileName.split('.').pop()?.toLowerCase() || '';
      if (BINARY_EXTENSIONS.has(ext)) continue;

      try {
        let content = '';
        if (IMAGE_EXTENSIONS.has(ext) && ext !== 'svg') {
          const b64 = await zipEntry.async('base64');
          content = `data:image/${ext};base64,${b64}`;
        } else {
          content = await zipEntry.async('text');
        }

        const language = this.getLanguage(fileName);
        let currentNode = rootNode;

        for (let p = 0; p < parts.length; p++) {
          const partName = parts[p];
          const isFile = p === parts.length - 1;
          const currentPath = `${rootName}/${parts.slice(0, p + 1).join('/')}`;

          if (isFile) {
            const fileNode: FileNode = {
              id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              name: partName,
              path: currentPath,
              type: 'file',
              language,
              content
            };
            if (!currentNode.children) currentNode.children = [];
            currentNode.children.push(fileNode);

            if (
              !mainFileNode &&
              (partName === 'index.html' ||
                partName === 'App.tsx' ||
                partName === 'main.tsx' ||
                partName === 'index.js' ||
                partName === 'app.js')
            ) {
              mainFileNode = fileNode;
            }
          } else {
            if (!currentNode.children) currentNode.children = [];
            let dir = currentNode.children.find(c => c.name === partName && c.type === 'directory');
            if (!dir) {
              dir = {
                id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                name: partName,
                path: currentPath,
                type: 'directory',
                isOpen: p === 0,
                children: []
              };
              currentNode.children.push(dir);
            }
            currentNode = dir;
          }
        }
      } catch (err) {
        console.warn('Failed to parse zip entry:', relativePath, err);
      }
    }

    const sortTree = (node: FileNode) => {
      if (node.children) {
        node.children.sort((a, b) => {
          if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
          return a.name.localeCompare(b.name);
        });
        node.children.forEach(sortTree);
      }
    };
    sortTree(rootNode);

    return { projectName: rootName, rootNode, mainFile: mainFileNode };
  }

  /**
   * Export FileTree as a downloadable ZIP
   */
  public static async exportProjectToZip(rootNode: FileNode): Promise<Blob> {
    const zip = new JSZip();

    const addNodeToZip = (node: FileNode, currentZipFolder: JSZip) => {
      if (node.type === 'file') {
        currentZipFolder.file(node.name, node.content || '');
      } else if (node.type === 'directory' && node.children) {
        const folder = currentZipFolder.folder(node.name) || currentZipFolder;
        for (const child of node.children) {
          addNodeToZip(child, folder);
        }
      }
    };

    if (rootNode.children) {
      for (const child of rootNode.children) {
        addNodeToZip(child, zip);
      }
    } else {
      addNodeToZip(rootNode, zip);
    }

    return await zip.generateAsync({ type: 'blob' });
  }

  private static getLanguage(filename: string): string {
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
      case 'svg':
        return 'html';
      default:
        return 'plaintext';
    }
  }
}
