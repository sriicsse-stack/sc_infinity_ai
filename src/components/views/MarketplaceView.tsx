import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Sparkles, 
  Play, 
  ExternalLink, 
  Star, 
  Download, 
  Upload, 
  Check, 
  Zap, 
  Lock,
  Layers,
  Code
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { useRuntime } from '../../context/RuntimeContext';
import { useAuth } from '../../context/AuthContext';
import { useCredits } from '../../context/CreditsContext';

export interface MarketplaceApp {
  id: string;
  name: string;
  tagline: string;
  category: string;
  author: string;
  rating: number;
  downloads: number;
  files: { name: string; content: string }[];
}

export const initialMarketplaceApps: MarketplaceApp[] = [
  {
    id: 'm-calc',
    name: 'Neo Calculator',
    tagline: 'Sleek dark-mode calculator with responsive buttons and history',
    category: 'Utilities',
    author: 'Infinity Community',
    rating: 4.9,
    downloads: 1240,
    files: [
      {
        name: 'index.html',
        content: `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Neo Calculator</title><link rel="stylesheet" href="styles.css"></head><body><div class="calc"><div class="screen" id="disp">0</div><div class="grid"><button onclick="clr()">C</button><button onclick="del()">⌫</button><button onclick="op('%')">%</button><button class="op" onclick="op('/')">÷</button><button onclick="num('7')">7</button><button onclick="num('8')">8</button><button onclick="num('9')">9</button><button class="op" onclick="op('*')">×</button><button onclick="num('4')">4</button><button onclick="num('5')">5</button><button onclick="num('6')">6</button><button class="op" onclick="op('-')">−</button><button onclick="num('1')">1</button><button onclick="num('2')">2</button><button onclick="num('3')">3</button><button class="op" onclick="op('+')">+</button><button class="zero" onclick="num('0')">0</button><button onclick="num('.')">.</button><button class="eq" onclick="eq()">=</button></div></div><script src="app.js"></script></body></html>`
      },
      {
        name: 'styles.css',
        content: `* { box-sizing: border-box; margin: 0; padding: 0; font-family: sans-serif; } body { background: #080a10; min-height: 100vh; display: flex; align-items: center; justify-content: center; color: #fff; } .calc { background: #0f1422; border: 1px solid #1f293d; border-radius: 24px; padding: 24px; width: 320px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); } .screen { background: #080a10; border: 1px solid #1f293d; border-radius: 16px; padding: 20px; font-size: 32px; color: #6366f1; text-align: right; font-weight: 700; margin-bottom: 20px; min-height: 75px; } .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; } button { background: #171f33; border: 1px solid #1f293d; color: #fff; padding: 16px; font-size: 16px; font-weight: 600; border-radius: 12px; cursor: pointer; transition: all 0.15s; } button:hover { background: #1f2a44; transform: scale(1.04); } .op { background: #312e81; color: #a5b4fc; } .eq { background: #4f46e5; color: #fff; grid-column: span 2; } .zero { grid-column: span 1; }`
      },
      {
        name: 'app.js',
        content: `let curr='0', prev='', opt=null; const d=document.getElementById('disp'); function upd(){d.innerText=curr;} function num(n){if(curr==='0'&&n!=='.')curr=n; else {if(n==='.'&&curr.includes('.'))return; curr+=n;} upd();} function op(o){if(curr==='')return; if(prev!=='')eq(); opt=o; prev=curr; curr='';} function eq(){let r, p=parseFloat(prev), c=parseFloat(curr); if(isNaN(p)||isNaN(c))return; if(opt==='+')r=p+c; else if(opt==='-')r=p-c; else if(opt==='*')r=p*c; else if(opt==='/')r=c===0?'Err':p/c; else if(opt==='%')r=p%c; curr=String(r); opt=null; prev=''; upd();} function clr(){curr='0'; prev=''; opt=null; upd();} function del(){curr=curr.slice(0,-1); if(!curr)curr='0'; upd();}`
      }
    ]
  },
  {
    id: 'm-todo',
    name: 'Task Flow Pro',
    tagline: 'Modern productivity suite with categories, local persistence, and filtering',
    category: 'Productivity',
    author: 'Alex Rivera',
    rating: 4.8,
    downloads: 890,
    files: [
      {
        name: 'index.html',
        content: `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Task Flow Pro</title><link rel="stylesheet" href="styles.css"></head><body><div class="box"><h1>Task Flow Pro</h1><div class="inp"><input id="ti" placeholder="What to accomplish?" /><button onclick="add()">Add</button></div><ul id="tl"></ul></div><script src="app.js"></script></body></html>`
      },
      {
        name: 'styles.css',
        content: `* { box-sizing: border-box; margin: 0; padding: 0; font-family: sans-serif; } body { background: #080a10; min-height: 100vh; display: flex; align-items: center; justify-content: center; color: #fff; padding: 20px; } .box { width: 100%; max-width: 440px; background: #0f1422; border: 1px solid #1f293d; border-radius: 20px; padding: 24px; } h1 { margin-bottom: 16px; font-size: 20px; color: #818cf8; } .inp { display: flex; gap: 8px; margin-bottom: 16px; } input { flex: 1; padding: 10px 14px; background: #080a10; border: 1px solid #1f293d; border-radius: 10px; color: #fff; outline: none; } button { padding: 10px 16px; background: #6366f1; border: none; border-radius: 10px; color: #fff; font-weight: 600; cursor: pointer; } ul { list-style: none; display: flex; flex-direction: column; gap: 8px; } li { padding: 10px 14px; background: #171f33; border: 1px solid #1f293d; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; } li button { background: #e11d48; padding: 4px 8px; font-size: 11px; }`
      },
      {
        name: 'app.js',
        content: `let list = [{id: 1, txt: 'Deploy SC INFINITY IDE'}]; function ren(){const el=document.getElementById('tl'); el.innerHTML=list.map(t=>\`<li><span>\${t.txt}</span><button onclick="del(\${t.id})">Done</button></li>\`).join('');} function add(){const i=document.getElementById('ti'); if(!i.value.trim())return; list.push({id:Date.now(), txt:i.value.trim()}); i.value=''; ren();} function del(id){list=list.filter(t=>t.id!==id); ren();} ren();`
      }
    ]
  },
  {
    id: 'm-weather',
    name: 'Aero Weather Radar',
    tagline: 'Hyperlocal weather forecasts and animated atmospheric visuals',
    category: 'Dashboard',
    author: 'Sri CS',
    rating: 5.0,
    downloads: 2150,
    files: [
      {
        name: 'index.html',
        content: `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Aero Weather</title><link rel="stylesheet" href="styles.css"></head><body><div class="card"><div class="city">Chennai, IN</div><div class="temp">29°C</div><div class="status">☀️ Sunny & Clear</div><div class="details"><div class="d">Humidity: 65%</div><div class="d">Wind: 14 km/h</div><div class="d">AQI: 42 (Good)</div></div></div></body></html>`
      },
      {
        name: 'styles.css',
        content: `* { box-sizing: border-box; margin: 0; padding: 0; font-family: sans-serif; } body { background: #080a10; min-height: 100vh; display: flex; align-items: center; justify-content: center; color: #fff; } .card { background: linear-gradient(145deg, #1e1b4b, #0f1422); border: 1px solid #3730a3; border-radius: 28px; padding: 32px; width: 340px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.5); } .city { font-size: 18px; color: #a5b4fc; margin-bottom: 8px; font-weight: 600; } .temp { font-size: 54px; font-weight: 800; color: #fff; margin-bottom: 4px; } .status { font-size: 14px; color: #fbbf24; margin-bottom: 24px; } .details { display: grid; grid-template-columns: 1fr; gap: 8px; background: rgba(0,0,0,0.3); padding: 14px; border-radius: 14px; text-align: left; font-size: 12px; color: #cbd5e1; }`
      }
    ]
  }
];

export const MarketplaceView: React.FC = () => {
  const { createProject, setFileTree, openFile, fileTree, currentProject } = useProject();
  const { openStandalonePreview } = useRuntime();
  const { user } = useAuth();
  const { currentPlan, creditsRemaining, totalCredits, setIsPricingModalOpen } = useCredits();

  const [apps, setApps] = useState<MarketplaceApp[]>(initialMarketplaceApps);
  const [publishedSuccess, setPublishedSuccess] = useState(false);

  const handleInstallApp = (app: MarketplaceApp) => {
    const rootPath = app.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newRootNode = {
      id: 'root',
      name: rootPath,
      path: rootPath,
      type: 'directory' as const,
      isOpen: true,
      children: app.files.map(f => ({
        id: `node_${f.name}`,
        name: f.name,
        path: `${rootPath}/${f.name}`,
        type: 'file' as const,
        content: f.content,
        language: f.name.endsWith('.html') ? 'html' : f.name.endsWith('.css') ? 'css' : 'javascript'
      }))
    };

    createProject(app.name, 'html', app.tagline);
    setFileTree(newRootNode);
    if (newRootNode.children.length > 0) {
      openFile(newRootNode.children[0]);
    }
  };

  const handlePublishCurrentApp = () => {
    const files: { name: string; content: string }[] = [];
    const collect = (n: any) => {
      if (n.type === 'file') files.push({ name: n.name, content: n.content || '' });
      else if (n.children) n.children.forEach(collect);
    };
    collect(fileTree);

    const newApp: MarketplaceApp = {
      id: `m_${Date.now()}`,
      name: currentProject.name || 'My Published App',
      tagline: currentProject.tagline || 'Interactive web application built with SC INFINITY IDE',
      category: 'Web App',
      author: user?.displayName || 'Community Dev',
      rating: 5.0,
      downloads: 1,
      files
    };

    setApps(prev => [newApp, ...prev]);
    setPublishedSuccess(true);
    setTimeout(() => setPublishedSuccess(false), 3000);
  };

  return (
    <div className="w-80 h-full bg-[#0a0d15] dark:bg-[#0a0d15] light:bg-slate-50 border-r border-[#1f293d] dark:border-[#1f293d] light:border-slate-200 flex flex-col text-xs overflow-y-auto p-4 space-y-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <ShoppingBag className="w-4 h-4 text-indigo-400" />
          <span className="font-bold text-sm text-white dark:text-white light:text-slate-900">App Marketplace</span>
        </div>
        <button
          onClick={handlePublishCurrentApp}
          className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] flex items-center space-x-1 shadow-sm transition-all"
          title="Publish current workspace app to community"
        >
          <Upload className="w-3 h-3" />
          <span>Publish App</span>
        </button>
      </div>

      {publishedSuccess && (
        <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-[11px] flex items-center space-x-2">
          <Check className="w-4 h-4" />
          <span>Application published to Marketplace successfully!</span>
        </div>
      )}

      {/* Subscription & Infinity Credits Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950/70 to-violet-950/70 border border-indigo-500/30 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs text-white flex items-center space-x-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="capitalize">{currentPlan} Plan</span>
          </span>
          <span className="text-[10px] text-indigo-300 font-mono font-semibold">
            {creditsRemaining.toLocaleString()} / {totalCredits.toLocaleString()} Credits
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
            style={{ width: `${Math.min(100, (creditsRemaining / Math.max(1, totalCredits)) * 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-slate-400">Local projects: 100% Free ♾️</span>
          <button
            onClick={() => setIsPricingModalOpen(true)}
            className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2"
          >
            Manage Plan
          </button>
        </div>
      </div>

      {/* Marketplace Apps List */}
      <div className="space-y-3">
        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
          Community & Published Apps ({apps.length})
        </span>

        {apps.map((app) => (
          <div
            key={app.id}
            className="p-3.5 rounded-2xl bg-[#0f1422] dark:bg-[#0f1422] light:bg-white border border-slate-800 space-y-2.5 hover:border-indigo-500/40 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-xs text-white dark:text-white light:text-slate-900">{app.name}</h4>
                <p className="text-[10px] text-slate-400">{app.author} • {app.category}</p>
              </div>
              <div className="flex items-center space-x-1 text-amber-400 text-[10px]">
                <Star className="w-3 h-3 fill-amber-400" />
                <span>{app.rating}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">{app.tagline}</p>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] text-slate-400">
              <span>{app.downloads} installs</span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleInstallApp(app)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center space-x-1 shadow-xs"
                >
                  <Code className="w-3 h-3" />
                  <span>Open in IDE</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
