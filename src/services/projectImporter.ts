import JSZip from 'jszip';
import { FileNode } from '../types';

export class ProjectImporter {
  /**
   * Import files from an HTML5 directory input event (webkitdirectory)
   */
  public static async importFromDirectoryInput(files: FileList): Promise<{ projectName: string; rootNode: FileNode; mainFile?: FileNode }> {
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

    let mainFileNode: FileNode | undefined;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const relPath = file.webkitRelativePath || file.name;
      const parts = relPath.split('/');

      // Read file content
      const content = await file.text();
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
            (partName === 'index.html' || partName === 'App.tsx' || partName === 'main.tsx' || partName === 'index.js' || partName === 'main.py')
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
    }

    return { projectName: rootName, rootNode, mainFile: mainFileNode };
  }

  /**
   * Import project from a ZIP file
   */
  public static async importFromZip(file: File): Promise<{ projectName: string; rootNode: FileNode; mainFile?: FileNode }> {
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

      const content = await zipEntry.async('text');
      const parts = relativePath.split('/').filter(Boolean);
      const fileName = parts[parts.length - 1];
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
            (partName === 'index.html' || partName === 'App.tsx' || partName === 'main.tsx' || partName === 'index.js')
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
    }

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
      default:
        return 'plaintext';
    }
  }
}
