import { FileNode } from '../types';

export class PreviewBundler {
  /**
   * Universal In-Browser Virtual Module Bundler & Sandbox Compiler
   * Fully compiles React (TSX/JSX), Vue, Vanilla JS, HTML5, CSS/Tailwind, and multi-file projects in real-time.
   */
  public static bundleProject(fileTree: FileNode): string {
    const fileMap: Record<string, string> = {};
    const allFiles: { name: string; path: string; relPath: string; content: string; ext: string }[] = [];

    const rootPrefix = fileTree.path ? fileTree.path.replace(/\\/g, '/') : fileTree.name;

    const collect = (node: FileNode) => {
      if (node.type === 'file') {
        const fullPath = (node.path || node.name).replace(/\\/g, '/');
        let relPath = fullPath;
        if (relPath.startsWith(rootPrefix + '/')) {
          relPath = relPath.substring(rootPrefix.length + 1);
        } else if (relPath.startsWith(rootPrefix)) {
          relPath = relPath.substring(rootPrefix.length);
        }
        relPath = relPath.replace(/^\/+/, '');

        const ext = node.name.split('.').pop()?.toLowerCase() || '';
        const content = node.content || '';

        allFiles.push({ name: node.name, path: fullPath, relPath, content, ext });
        fileMap[relPath] = content;
        fileMap['/' + relPath] = content;
        fileMap[node.name] = content;
        if (relPath.startsWith('src/')) {
          fileMap[relPath.substring(4)] = content;
          fileMap['./' + relPath.substring(4)] = content;
        }
      } else if (node.children) {
        for (const child of node.children) collect(child);
      }
    };

    collect(fileTree);

    // Parse .env environment variables if present
    const envVars: Record<string, string> = {};
    const envFile = allFiles.find(f => f.name === '.env' || f.name === '.env.local' || f.name === '.env.example');
    if (envFile) {
      const lines = envFile.content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const eqIdx = trimmed.indexOf('=');
          const k = trimmed.substring(0, eqIdx).trim();
          let v = trimmed.substring(eqIdx + 1).trim();
          if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
            v = v.substring(1, v.length - 1);
          }
          envVars[k] = v;
        }
      }
    }

    // Check project type
    const htmlFile = allFiles.find(f => f.name.endsWith('.html'));
    const hasReactOrTSX = allFiles.some(f => f.ext === 'tsx' || f.ext === 'jsx' || f.name === 'App.tsx' || f.name === 'main.tsx' || f.name === 'index.tsx');
    const cssFiles = allFiles.filter(f => f.ext === 'css');

    // Find main entry point file
    let entryPointRelPath = '';
    if (htmlFile) {
      // Look for <script type="module" src="/src/main.tsx"></script> inside index.html
      const srcMatch = htmlFile.content.match(/<script[^>]*src=["']([^"']+)["'][^>]*>/i);
      if (srcMatch && srcMatch[1]) {
        let srcPath = srcMatch[1].replace(/^\/+/, '');
        if (fileMap[srcPath]) {
          entryPointRelPath = srcPath;
        }
      }
    }

    if (!entryPointRelPath) {
      const candidates = [
        'src/main.tsx',
        'src/main.jsx',
        'src/index.tsx',
        'src/index.jsx',
        'src/App.tsx',
        'src/App.jsx',
        'main.tsx',
        'main.jsx',
        'index.tsx',
        'index.jsx',
        'App.tsx',
        'App.jsx',
        'src/index.js',
        'src/app.js',
        'index.js',
        'app.js',
        'script.js'
      ];
      for (const cand of candidates) {
        if (fileMap[cand]) {
          entryPointRelPath = cand;
          break;
        }
      }
    }

    // Collect all CSS contents
    const combinedCss = cssFiles.map(c => `/* ${c.name} */\n${c.content}`).join('\n');

    // Serialize all files into virtual files object for the sandbox
    const serializedFiles = JSON.stringify(fileMap);
    const serializedEnv = JSON.stringify(envVars);

    // Build the complete production sandbox container
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${fileTree.name || 'SC INFINITY Live Sandbox'}</title>

  <!-- Tailwind CSS CDN Engine -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: '#6366f1'
          }
        }
      }
    }
  </script>

  <!-- Babel Standalone for real-time TSX/JSX compilation -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.10/babel.min.js"></script>

  <!-- Google Fonts: Inter & JetBrains Mono -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">

  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background-color: #0d111a;
      color: #f8fafc;
      min-height: 100vh;
    }
    ${combinedCss}
  </style>

  <!-- ESM Import Map for modern React & popular packages -->
  <script type="importmap">
  {
    "imports": {
      "react": "https://esm.sh/react@18.3.1?dev",
      "react/": "https://esm.sh/react@18.3.1/",
      "react/jsx-runtime": "https://esm.sh/react@18.3.1/jsx-runtime?dev",
      "react-dom": "https://esm.sh/react-dom@18.3.1?dev",
      "react-dom/": "https://esm.sh/react-dom@18.3.1/",
      "react-dom/client": "https://esm.sh/react-dom@18.3.1/client?dev",
      "lucide-react": "https://esm.sh/lucide-react@0.344.0?dev",
      "@supabase/supabase-js": "https://esm.sh/@supabase/supabase-js@2.39.8?dev",
      "clsx": "https://esm.sh/clsx@2.1.0",
      "tailwind-merge": "https://esm.sh/tailwind-merge@2.2.1",
      "framer-motion": "https://esm.sh/framer-motion@11.0.8?dev",
      "canvas-confetti": "https://esm.sh/canvas-confetti@1.9.2",
      "react-router-dom": "https://esm.sh/react-router-dom@6.22.3?dev"
    }
  }
  </script>
</head>
<body>
  <!-- Standard Root Mount Point -->
  <div id="root">
    <div id="__sc_loader__" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh; font-family: system-ui; text-align: center; color: #94a3b8; gap: 12px;">
      <div style="width: 36px; height: 36px; border: 3px solid #3b82f6; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
      <div style="font-weight: 600; font-size: 14px; color: #f1f5f9;">Starting SC INFINITY Live Runtime...</div>
      <div style="font-size: 11px; opacity: 0.8;">Compiling React TypeScript modules & assets</div>
      <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
    </div>
  </div>

  <!-- Runtime Error & Diagnostic Display -->
  <div id="__sc_error_overlay__" style="display: none; position: fixed; inset: 16px; background: rgba(15, 23, 42, 0.96); border: 2px solid #ef4444; border-radius: 16px; padding: 20px; color: #fca5a5; font-family: 'JetBrains Mono', monospace; font-size: 12px; z-index: 999999; overflow: auto; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #7f1d1d; padding-bottom: 8px;">
      <div style="font-weight: bold; font-size: 14px; color: #fee2e2; display: flex; align-items: center; gap: 8px;">
        <span>⚠️ SC INFINITY Runtime Diagnostic</span>
      </div>
      <button onclick="document.getElementById('__sc_error_overlay__').style.display='none'" style="background: #ef4444; color: #fff; border: none; border-radius: 6px; padding: 4px 10px; font-weight: bold; cursor: pointer;">Dismiss</button>
    </div>
    <div id="__sc_error_msg__" style="white-space: pre-wrap; line-height: 1.6;"></div>
  </div>

  <script>
    // 1. Configure Environment Variables
    window.process = { env: ${serializedEnv} };
    window.importMetaEnv = ${serializedEnv};
    
    // 2. Load Virtual Files Registry
    window.__virtual_files__ = ${serializedFiles};
    window.__module_cache__ = {};

    function showRuntimeError(err, context = '') {
      console.error('[SC INFINITY Sandbox Error]:', err);
      const loader = document.getElementById('__sc_loader__');
      if (loader) loader.style.display = 'none';

      const overlay = document.getElementById('__sc_error_overlay__');
      const msgElem = document.getElementById('__sc_error_msg__');
      if (overlay && msgElem) {
        overlay.style.display = 'block';
        msgElem.textContent = (context ? 'Context: ' + context + '\\n\\n' : '') + (err.stack || err.message || String(err));
      }
    }

    window.addEventListener('error', function(e) {
      showRuntimeError(e.error || e.message);
    });

    window.addEventListener('unhandledrejection', function(e) {
      showRuntimeError(e.reason);
    });

    // 3. Virtual Module Resolver & Path Normalizer
    function resolveVirtualFilePath(specifier, currentFilePath) {
      if (!specifier.startsWith('.')) {
        return null; // External npm package
      }

      const currentDirParts = currentFilePath ? currentFilePath.split('/').slice(0, -1) : [];
      const specParts = specifier.split('/');

      const resolvedParts = [...currentDirParts];
      for (const p of specParts) {
        if (p === '.' || p === '') continue;
        if (p === '..') {
          if (resolvedParts.length > 0) resolvedParts.pop();
        } else {
          resolvedParts.push(p);
        }
      }

      const basePath = resolvedParts.join('/');
      const extensions = ['', '.tsx', '.ts', '.jsx', '.js', '.json', '.css', '/index.tsx', '/index.ts', '/index.jsx', '/index.js'];

      for (const ext of extensions) {
        const fullCandidate = basePath + ext;
        if (window.__virtual_files__[fullCandidate] !== undefined) {
          return fullCandidate;
        }
        if (window.__virtual_files__['/' + fullCandidate] !== undefined) {
          return '/' + fullCandidate;
        }
        if (window.__virtual_files__['src/' + fullCandidate] !== undefined) {
          return 'src/' + fullCandidate;
        }
      }

      return basePath;
    }

    // 4. In-Browser Dynamic Module Transpiler & Loader
    async function loadVirtualModule(filePath) {
      if (window.__module_cache__[filePath]) {
        return window.__module_cache__[filePath];
      }

      let sourceCode = window.__virtual_files__[filePath];
      if (sourceCode === undefined) {
        sourceCode = window.__virtual_files__['/' + filePath] || window.__virtual_files__['src/' + filePath];
      }

      if (sourceCode === undefined) {
        throw new Error('Module file not found: ' + filePath);
      }

      // If CSS, inject directly
      if (filePath.endsWith('.css')) {
        const style = document.createElement('style');
        style.setAttribute('data-file', filePath);
        style.textContent = sourceCode;
        document.head.appendChild(style);
        const cssModule = { default: {} };
        window.__module_cache__[filePath] = cssModule;
        return cssModule;
      }

      // If JSON, parse directly
      if (filePath.endsWith('.json')) {
        const jsonModule = { default: JSON.parse(sourceCode) };
        window.__module_cache__[filePath] = jsonModule;
        return jsonModule;
      }

      // Transpile TypeScript / JSX with Babel Standalone
      let transformedCode;
      try {
        const babelRes = Babel.transform(sourceCode, {
          presets: [
            ['react', { runtime: 'automatic' }],
            ['typescript', { isTSX: true, allExtensions: true }]
          ],
          filename: filePath
        });
        transformedCode = babelRes.code;
      } catch (transpileErr) {
        throw new Error('Transpilation error in ' + filePath + ': ' + transpileErr.message);
      }

      // Transform static ES imports/exports into virtual module execution
      const exports = {};
      const module = { exports };
      window.__module_cache__[filePath] = exports;

      // Extract all imports from the code
      const importRegex = /import\\s+(?:(?:([\\w\\d_$]+)(?:\\s*,\\s*\\{([^}]+)\\})?|\\{([^}]+)\\}|\\*\\s+as\\s+([\\w\\d_$]+))\\s+from\\s+)?['"]([^'"]+)['"];?/g;
      
      let match;
      const dependencies = [];
      while ((match = importRegex.exec(transformedCode)) !== null) {
        dependencies.push({
          fullMatch: match[0],
          defaultImport: match[1],
          namedImports: match[2] || match[3],
          namespaceImport: match[4],
          specifier: match[5]
        });
      }

      // Replace imports with dynamic loader calls
      let runnableCode = transformedCode;

      // Load all dependencies first
      const depModules = {};
      for (const dep of dependencies) {
        const resolvedLocal = resolveVirtualFilePath(dep.specifier, filePath);
        let depExports;

        if (resolvedLocal) {
          depExports = await loadVirtualModule(resolvedLocal);
        } else {
          // External npm package from esm.sh
          try {
            let pkgUrl = dep.specifier;
            if (!pkgUrl.startsWith('http') && !pkgUrl.startsWith('/')) {
              pkgUrl = 'https://esm.sh/' + dep.specifier + '?dev';
            }
            depExports = await import(pkgUrl);
          } catch (importErr) {
            console.warn('Fallback import for ' + dep.specifier, importErr);
            depExports = {};
          }
        }

        depModules[dep.specifier] = depExports;
      }

      // Convert exports into module assignments
      runnableCode = runnableCode
        .replace(/export\\s+default\\s+/g, 'module.exports.default = ')
        .replace(/export\\s+const\\s+([\\w\\d_$]+)\\s*=/g, 'const $1 = module.exports.$1 =')
        .replace(/export\\s+let\\s+([\\w\\d_$]+)\\s*=/g, 'let $1 = module.exports.$1 =')
        .replace(/export\\s+var\\s+([\\w\\d_$]+)\\s*=/g, 'var $1 = module.exports.$1 =')
        .replace(/export\\s+function\\s+([\\w\\d_$]+)/g, 'module.exports.$1 = function $1')
        .replace(/export\\s+class\\s+([\\w\\d_$]+)/g, 'module.exports.$1 = class $1')
        .replace(/export\\s+\\{([^}]+)\\};?/g, function(m, inner) {
          return inner.split(',').map(pair => {
            const parts = pair.trim().split(/\\s+as\\s+/);
            const localName = parts[0].trim();
            const exportName = (parts[1] || parts[0]).trim();
            if (!localName) return '';
            return 'module.exports.' + exportName + ' = ' + localName + ';';
          }).join('\\n');
        });

      // Inject custom require for local & external modules
      const customRequire = (specifier) => {
        const resolvedLocal = resolveVirtualFilePath(specifier, filePath);
        if (resolvedLocal && window.__module_cache__[resolvedLocal]) {
          return window.__module_cache__[resolvedLocal];
        }
        if (depModules[specifier]) {
          return depModules[specifier];
        }
        return {};
      };

      // Strip original import statements
      runnableCode = runnableCode.replace(/import\\s+[^;]+;/g, '');

      // Execute in isolated function context
      try {
        // Build scope for dependencies
        let headerScope = 'const import_meta = { env: window.importMetaEnv || {} };\\n';
        for (const dep of dependencies) {
          const mod = depModules[dep.specifier] || {};
          const varName = '__mod_' + dep.specifier.replace(/[^a-zA-Z0-9_]/g, '_');
          headerScope += 'const ' + varName + ' = depModules["' + dep.specifier + '"] || {};\\n';

          if (dep.defaultImport) {
            headerScope += 'const ' + dep.defaultImport + ' = ' + varName + '.default !== undefined ? ' + varName + '.default : ' + varName + ';\\n';
          }
          if (dep.namespaceImport) {
            headerScope += 'const ' + dep.namespaceImport + ' = ' + varName + ';\\n';
          }
          if (dep.namedImports) {
            dep.namedImports.split(',').forEach(item => {
              const parts = item.trim().split(/\\s+as\\s+/);
              const srcName = parts[0].trim();
              const destName = (parts[1] || parts[0]).trim();
              if (srcName) {
                headerScope += 'const ' + destName + ' = ' + varName + '["' + srcName + '"];\\n';
              }
            });
          }
        }

        const runner = new Function(
          'module',
          'exports',
          'require',
          'depModules',
          headerScope + '\\n' + runnableCode
        );

        runner(module, exports, customRequire, depModules);

        // Standardize default export
        if (module.exports.default !== undefined) {
          exports.default = module.exports.default;
        }

        return module.exports;
      } catch (execErr) {
        throw new Error('Execution error in ' + filePath + ': ' + execErr.message);
      }
    }

    // 5. Bootstrap Project Entry Point
    async function bootstrap() {
      try {
        const entryFile = ${JSON.stringify(entryPointRelPath)};

        if (!entryFile) {
          // No JS/TSX entry point found - check if index.html has static markup
          const loader = document.getElementById('__sc_loader__');
          if (loader) loader.style.display = 'none';
          return;
        }

        console.log('[SC INFINITY Sandbox] Bootstrapping entry:', entryFile);
        const entryModule = await loadVirtualModule(entryFile);

        // If the entry module exports a React Component and didn't auto-mount
        const rootElem = document.getElementById('root');
        const loader = document.getElementById('__sc_loader__');
        if (loader) loader.remove();

        const ExportedComponent = entryModule.default || entryModule.App || (typeof entryModule === 'function' ? entryModule : null);

        if (ExportedComponent && (!rootElem.children.length || rootElem.children[0]?.id === '__sc_loader__')) {
          console.log('[SC INFINITY Sandbox] Auto-mounting React component to #root');
          const React = (await import('https://esm.sh/react@18.3.1?dev')).default;
          const ReactDOM = (await import('https://esm.sh/react-dom@18.3.1/client?dev')).default;

          const root = ReactDOM.createRoot(rootElem);
          root.render(React.createElement(ExportedComponent));
        }
      } catch (bootErr) {
        showRuntimeError(bootErr, 'Bootstrap Phase');
      }
    }

    // Start Sandbox
    window.addEventListener('DOMContentLoaded', bootstrap);
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(bootstrap, 50);
    }
  </script>
</body>
</html>`;
  }
}
