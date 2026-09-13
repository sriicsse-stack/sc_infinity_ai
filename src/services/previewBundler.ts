import { FileNode } from '../types';

export class PreviewBundler {
  public static bundleProject(fileTree: FileNode): string {
    const allFiles: { name: string; path: string; content: string }[] = [];

    const collect = (node: FileNode) => {
      if (node.type === 'file') {
        allFiles.push({ name: node.name, path: node.path, content: node.content || '' });
      } else if (node.children) {
        for (const child of node.children) collect(child);
      }
    };

    collect(fileTree);

    // Find index.html or HTML file
    let htmlFile = allFiles.find(f => f.name.endsWith('.html'));
    const cssFiles = allFiles.filter(f => f.name.endsWith('.css'));
    const jsFiles = allFiles.filter(f => f.name.endsWith('.js') || f.name.endsWith('.ts'));

    if (!htmlFile) {
      // If no index.html (e.g. React/TSX or script only), generate a standard HTML shell
      const mainTsx = allFiles.find(f => f.name.endsWith('.tsx') || f.name.endsWith('.jsx'));
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background: #080a10; color: #fff; font-family: system-ui, sans-serif; padding: 24px; min-height: 100vh; }
    ${cssFiles.map(c => c.content).join('\n')}
  </style>
</head>
<body>
  <div id="root">
    <div class="max-w-md mx-auto p-6 rounded-2xl bg-[#0f1422] border border-slate-800 shadow-xl text-center space-y-4">
      <div class="inline-flex p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 font-bold text-xl">∞</div>
      <h2 class="text-xl font-bold text-white">${fileTree.name}</h2>
      <p class="text-xs text-slate-400">Workspace ready. Edit files in Monaco Editor to preview changes live.</p>
    </div>
  </div>
  <script>
    try {
      ${jsFiles.map(j => j.content).join('\n')}
    } catch(err) {
      console.error(err);
    }
  </script>
</body>
</html>`;
    }

    let rawHtml = htmlFile.content;

    // Inject CSS directly into <head>
    if (cssFiles.length > 0) {
      const combinedCss = cssFiles.map(c => `<style>/* ${c.name} */\n${c.content}</style>`).join('\n');
      if (rawHtml.includes('</head>')) {
        rawHtml = rawHtml.replace('</head>', `${combinedCss}\n</head>`);
      } else {
        rawHtml = `${combinedCss}\n${rawHtml}`;
      }
    }

    // Inject JS directly before </body>
    if (jsFiles.length > 0) {
      const combinedJs = jsFiles.map(j => `<script>/* ${j.name} */\ntry {\n${j.content}\n} catch(err) { console.error(err); }</script>`).join('\n');
      if (rawHtml.includes('</body>')) {
        rawHtml = rawHtml.replace('</body>', `${combinedJs}\n</body>`);
      } else {
        rawHtml = `${rawHtml}\n${combinedJs}`;
      }
    }

    return rawHtml;
  }
}
