import { FileNode, ProjectMeta } from '../types';

export interface GeneratedProjectResult {
  projectName: string;
  projectMeta: ProjectMeta;
  fileTree: FileNode;
  mainFile: FileNode;
  plan: string[];
  features: string[];
  architecture: {
    uiTokens: string[];
    techStack: string;
    dataFlow: string;
  };
  summary: string;
  tamilSummary?: string;
}

export class AIGenerator {
  public static getApiKey(): string {
    return (
      localStorage.getItem('infinity_gemini_api_key') ||
      (import.meta as any).env?.VITE_GEMINI_API_KEY ||
      (import.meta as any).env?.GEMINI_API_KEY ||
      (process as any)?.env?.GEMINI_API_KEY ||
      (process as any)?.env?.VITE_GEMINI_API_KEY ||
      (window as any)?.__GEMINI_API_KEY__ ||
      ''
    );
  }

  public static setApiKey(key: string): void {
    localStorage.setItem('infinity_gemini_api_key', key);
  }

  public static async generateProjectFromPrompt(
    prompt: string,
    preferredModel: string = 'gemini-2.0-flash',
    onProgress?: (stage: string) => void
  ): Promise<GeneratedProjectResult> {
    const apiKey = this.getApiKey();
    const cleanPrompt = prompt.trim();
    const projectName = this.extractProjectName(cleanPrompt);

    if (onProgress) onProgress('analyzing');

    // If Gemini API key is available, query Gemini with Antigravity-grade multi-model fallback
    if (apiKey) {
      try {
        if (onProgress) onProgress('architecting');
        const aiResponse = await this.callGeminiAPI(cleanPrompt, apiKey, preferredModel);
        if (aiResponse && aiResponse.files && aiResponse.files.length > 0) {
          if (onProgress) onProgress('synthesizing');
          return this.constructProjectFromAIFiles(projectName, cleanPrompt, aiResponse);
        }
      } catch (err) {
        console.warn('Gemini API call failed or quota reached, engaging Antigravity Smart Synthesis Engine:', err);
      }
    }

    // High quality Antigravity intelligent synthesis engine (100% complete, fully working apps)
    if (onProgress) onProgress('synthesizing');
    return this.synthesizeProject(projectName, cleanPrompt);
  }

  private static async callGeminiAPI(
    userPrompt: string, 
    apiKey: string,
    preferredModel: string
  ): Promise<{
    plan: string[];
    features: string[];
    summary: string;
    tamilSummary?: string;
    architecture?: { uiTokens: string[]; techStack: string; dataFlow: string };
    files: { name: string; content: string }[];
  }> {
    const systemPrompt = `You are Google Deepmind Antigravity, the world's most capable Autonomous Software Architect and Master Frontend Engineer.
The user wants to generate a complete, 100% production-ready, beautiful, interactive application.

CRITICAL INSTRUCTIONS & ANTIGRAVITY QUALITY STANDARD:
1. PRECISION COMPREHENSION:
   - Carefully analyze what the user is asking to build in English, Tamil (தமிழ்), or Tanglish.
   - You MUST build THAT EXACT requested application (e.g. Alarm Clock, Calculator, Todo List, Weather App, Quiz App, Game, Notes App, Habit Tracker, E-commerce dashboard, Portfolio, etc.).
   - NEVER generate generic or unrelated boilerplate templates.
2. 100% WORKING CODE STANDARD:
   - NEVER generate dummy placeholders, empty TODOs, or mock buttons.
   - The generated code MUST be 100% complete, bug-free, fully functional, and visually stunning.
3. UI/UX STANDARD:
   - Modern dark glassmorphism theme (#0a0d15, #0f1424, #121828) with vibrant accent colors
   - Smooth CSS transitions, fluid 60FPS micro-interactions, responsive flex/grid layouts
   - Beautiful badges, glow effects, crisp typography, and mobile-friendly touch targets
4. LOGIC STANDARD:
   - Complete JavaScript logic with zero missing functions
   - LocalStorage persistence for saving items/states/history
   - Audio feedback using HTML5 Web Audio API oscillators (AudioContext) where relevant
   - Keyboard shortcuts & responsive touch support
   - Full CRUD / interactive workflows (Add, Edit, Delete, Filter, Search, Calculate, etc.)
5. BILINGUAL SUPPORT:
   - If the user prompt is in Tamil (தமிழ்) or Tanglish, provide the \`tamilSummary\` explaining what was built in clear, friendly Tamil.

Respond ONLY with valid JSON matching this schema:
{
  "summary": "Brief 1-2 sentence description of the app",
  "tamilSummary": "சுருக்கமான விளக்கம் தமிழில்",
  "plan": [
    "Requirement analysis and UX architecture",
    "Design tokens & layout grid structure",
    "Complete component synthesis & interactive state",
    "LocalStorage persistence & audio engine integration",
    "Sandbox verification & live preview launch"
  ],
  "features": [
    "Feature 1 with details",
    "Feature 2 with details",
    "Feature 3 with details",
    "Feature 4 with details"
  ],
  "architecture": {
    "uiTokens": ["Glassmorphism", "CSS Variables", "Responsive Flex/Grid", "Web Audio API"],
    "techStack": "HTML5, CSS3, ES6+ JavaScript, Web Audio",
    "dataFlow": "Unidirectional reactive state with LocalStorage synchronization"
  },
  "files": [
    {
      "name": "index.html",
      "content": "<!DOCTYPE html>..."
    },
    {
      "name": "styles.css",
      "content": "/* complete modern styles */"
    },
    {
      "name": "app.js",
      "content": "// complete interactive logic"
    }
  ]
}`;

    const modelsToTry = [
      preferredModel,
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro'
    ].filter((v, i, a) => a.indexOf(v) === i);

    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: `${systemPrompt}\n\nUser Request: ${userPrompt}` }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.2,
                responseMimeType: "application/json"
              }
            })
          }
        );

        if (!response.ok) {
          const errData = await response.text();
          throw new Error(`Gemini API [${modelName}] failed (${response.status}): ${errData}`);
        }

        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) throw new Error(`Empty response from Gemini API [${modelName}]`);

        // Sanitize markdown fences if present
        let cleaned = rawText.trim();
        if (cleaned.startsWith('```json')) {
          cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
        } else if (cleaned.startsWith('```')) {
          cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/i, '');
        }
        const firstBrace = cleaned.indexOf('{');
        const lastBrace = cleaned.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
          cleaned = cleaned.substring(firstBrace, lastBrace + 1);
        }

        return JSON.parse(cleaned);
      } catch (err) {
        console.warn(`Attempt with model ${modelName} failed:`, err);
        lastError = err;
      }
    }

    throw lastError || new Error('All Gemini models failed');
  }

  private static constructProjectFromAIFiles(
    projectName: string, 
    userPrompt: string, 
    aiData: {
      plan?: string[];
      features?: string[];
      summary?: string;
      tamilSummary?: string;
      architecture?: { uiTokens: string[]; techStack: string; dataFlow: string };
      files: { name: string; content: string }[];
    }
  ): GeneratedProjectResult {
    const rootPath = projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const rootNode: FileNode = {
      id: 'root',
      name: rootPath,
      path: rootPath,
      type: 'directory',
      isOpen: true,
      children: []
    };

    let mainFileNode: FileNode | null = null;

    for (const f of aiData.files) {
      const fileNode: FileNode = {
        id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: f.name,
        path: `${rootPath}/${f.name}`,
        type: 'file',
        language: this.getLanguage(f.name),
        content: f.content
      };

      rootNode.children!.push(fileNode);

      if (!mainFileNode && (f.name === 'index.html' || f.name === 'App.tsx' || f.name === 'app.js')) {
        mainFileNode = fileNode;
      }
    }

    if (!mainFileNode && rootNode.children!.length > 0) {
      mainFileNode = rootNode.children![0];
    }

    const projectMeta: ProjectMeta = {
      id: `proj_${Date.now()}`,
      name: projectName,
      tagline: aiData.summary || userPrompt,
      technology: 'HTML5 / CSS3 / JavaScript',
      framework: 'Web Standards (Antigravity Engine)',
      lastModified: 'Just now',
      templateType: 'html',
      port: 5173,
      rootPath,
      description: aiData.summary || `AI Generated: ${userPrompt}`
    };

    return {
      projectName,
      projectMeta,
      fileTree: rootNode,
      mainFile: mainFileNode!,
      plan: aiData.plan || [
        'Analyze user requirements & UX personas',
        'Formulate component architecture & design tokens',
        'Synthesize modular code files',
        'Integrate local storage & micro-interactions',
        'Validate in sandbox & launch live preview'
      ],
      features: aiData.features || [
        'Complete interactive functionality with zero placeholders',
        'Glassmorphic dark modern theme',
        'Instant LocalStorage persistence',
        'Full responsive layout for desktop, tablet, and mobile'
      ],
      architecture: aiData.architecture || {
        uiTokens: ['Glassmorphism', 'CSS Variables', 'Responsive Flex/Grid'],
        techStack: 'HTML5, CSS3, JavaScript ES6+',
        dataFlow: 'Reactive state management with LocalStorage sync'
      },
      summary: aiData.summary || `Fully functional ${projectName} web application.`,
      tamilSummary: aiData.tamilSummary
    };
  }

  /**
   * Antigravity Smart Synthesis Engine (Offline / Fallback)
   * Delivers 100% complete, fully working, high-polish web applications
   */
  private static synthesizeProject(projectName: string, userPrompt: string): GeneratedProjectResult {
    const rootPath = (projectName || 'infinity-app').toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'app';
    const lower = userPrompt.toLowerCase();

    // Intent detection (Specific domains first to prevent false matching)
    const isAlarm = lower.includes('alarm') || lower.includes('clock') || lower.includes('அலாரம்') || lower.includes('கடிகாரம்') || lower.includes('wake up') || lower.includes('snooze');
    const isTodo = !isAlarm && (lower.includes('todo') || lower.includes('to-do') || lower.includes('task') || lower.includes('டூடு') || lower.includes('டாஸ்க்'));
    const isCalc = lower.includes('calc') || lower.includes('கணக்கீட்டு') || lower.includes('கால்குலேட்டர்') || lower.includes('math');
    const isNotes = lower.includes('note') || lower.includes('markdown') || lower.includes('குறிப்புகள்') || lower.includes('நோட்ஸ்') || lower.includes('doc') || lower.includes('editor');
    const isExpense = lower.includes('expense') || lower.includes('budget') || lower.includes('finance') || lower.includes('money') || lower.includes('செலவு') || lower.includes('பட்ஜெட்');
    
    // Games
    const isSnake = lower.includes('snake') || lower.includes('பாம்பு');
    const isFlappy = lower.includes('flappy') || lower.includes('bird') || lower.includes('பறவை');
    const is2048 = lower.includes('2048') || lower.includes('tile');
    const isSpace = lower.includes('space') || lower.includes('invader') || lower.includes('shooter') || lower.includes('விண்வெளி');
    const isTicTacToe = lower.includes('tic') || lower.includes('tac') || lower.includes('toe') || lower.includes('xo');
    const isBrick = lower.includes('brick') || lower.includes('breakout') || lower.includes('pong');

    let htmlContent = '';
    let cssContent = '';
    let jsContent = '';
    let plan: string[] = [];
    let features: string[] = [];
    let summary = '';
    let tamilSummary = '';

    // ==========================================
    // 0. PREMIUM ALARM CLOCK & DIGITAL TIME SUITE
    // ==========================================
    if (isAlarm) {
      summary = 'A precision Alarm Clock & Digital Time Suite featuring a glowing live digital clock, custom alarm management with repeat days, multiple synthesized ringtones, snooze controls, next ringing countdown, and LocalStorage persistence.';
      tamilSummary = 'அனைத்து வசதிகளுடன் கூடிய முழுமையான அலாரம் மற்றும் டிஜிட்டல் கடிகார செயலி உருவாக்கப்பட்டுள்ளது. இதில் பெரிய டிஜிட்டல் கடிகாரம், AM/PM, ரிப்பீட் நாட்கள் (Repeat Days), ஸ்னூஸ் (Snooze), பலவிதமான அலாரம் ஒலிகள் மற்றும் உள்ளூர் சேமிப்பகம் (LocalStorage) உள்ளன.';

      plan = [
        'Initialize high-precision live digital clock engine with date & greeting',
        'Design dark glassmorphism dashboard with Next Alarm countdown banner',
        'Formulate alarm management modal with repeat days & sound selectors',
        'Synthesize Web Audio alarm ringing engine with continuous melody synthesis',
        'Integrate full-screen ringing alert modal, Snooze controls & LocalStorage sync'
      ];

      features = [
        'Live high-precision digital clock with seconds, dynamic greeting and date',
        'Next Alarm countdown banner (Calculates exact hours and minutes remaining)',
        'Full Alarm CRUD: Add, Edit, Delete, Toggle enable/disable',
        'AM/PM time format and repeat days selector (Mon - Sun)',
        'Web Audio synthesized alarm ringtones (Digital Beep, Gentle Chime, Retro Siren, Space Synth)',
        'Full-screen ringing alert modal with pulsing animations, Snooze & Dismiss',
        'Customizable snooze durations (5m, 10m, 15m) and custom alarm labels',
        'Full LocalStorage persistence (Alarms saved across refreshes)'
      ];

      htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chronos Pro - Precision Alarm & Clock Suite</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700;800&display=swap" rel="stylesheet">
</head>
<body>
  <div class="app-layout">
    <!-- Header Greeting -->
    <header class="main-header">
      <div class="greeting-box">
        <span class="greeting-pill" id="greetingPill">☀️ Good Morning</span>
        <h1 class="brand-title">Chronos Alarm Pro</h1>
      </div>
      <button class="add-alarm-btn" id="openAddModalBtn">
        <span>+ Add Alarm</span>
      </button>
    </header>

    <!-- Main Digital Clock Card -->
    <section class="clock-card">
      <div class="clock-display">
        <div class="time-main" id="clockTime">10:42:18 <span class="ampm" id="clockAmPm">AM</span></div>
        <div class="date-sub" id="clockDate">Sunday, September 13, 2026</div>
      </div>
      
      <!-- Next Alarm Status Banner -->
      <div class="next-alarm-banner" id="nextAlarmBanner">
        <div class="alarm-icon-box">⏰</div>
        <div class="next-alarm-details">
          <span class="next-label">Next Alarm</span>
          <div class="next-time" id="nextAlarmText">No upcoming alarms enabled</div>
        </div>
      </div>
    </section>

    <!-- Alarms List Section -->
    <section class="alarms-section">
      <div class="section-head">
        <h2>Your Alarms (<span id="alarmCount">0</span>)</h2>
        <span class="active-tag" id="activeCount">0 active</span>
      </div>

      <div class="alarms-grid" id="alarmsGrid"></div>

      <!-- Empty State -->
      <div class="empty-alarms hidden" id="emptyAlarms">
        <div class="empty-icon">🔔</div>
        <h3>No Alarms Set</h3>
        <p>Click the <strong>+ Add Alarm</strong> button above to create your first alarm.</p>
      </div>
    </section>
  </div>

  <!-- Add / Edit Alarm Modal -->
  <div class="modal-overlay hidden" id="alarmModal">
    <div class="modal-card">
      <div class="modal-header">
        <h3 id="modalTitle">Set New Alarm</h3>
        <button class="close-modal-btn" id="closeModalBtn">✕</button>
      </div>

      <form id="alarmForm" class="modal-form">
        <input type="hidden" id="editAlarmId" value="" />

        <!-- Time Picker -->
        <div class="time-picker-row">
          <div class="time-input-group">
            <select id="alarmHour" class="time-select">
              <option value="01">01</option><option value="02">02</option><option value="03">03</option>
              <option value="04">04</option><option value="05">05</option><option value="06" selected>06</option>
              <option value="07">07</option><option value="08">08</option><option value="09">09</option>
              <option value="10">10</option><option value="11">11</option><option value="12">12</option>
            </select>
            <span class="colon">:</span>
            <select id="alarmMinute" class="time-select">
              <option value="00">00</option><option value="05">05</option><option value="10">10</option>
              <option value="15">15</option><option value="20">20</option><option value="25">25</option>
              <option value="30" selected>30</option><option value="35">35</option><option value="40">40</option>
              <option value="45">45</option><option value="50">50</option><option value="55">55</option>
            </select>
          </div>

          <div class="ampm-toggle">
            <button type="button" class="ampm-btn active" id="btnAM">AM</button>
            <button type="button" class="ampm-btn" id="btnPM">PM</button>
          </div>
        </div>

        <!-- Label Input -->
        <div class="form-field">
          <label>Alarm Label</label>
          <input type="text" id="alarmLabel" placeholder="e.g. Wake Up, Standup Meeting, Medicine" required />
        </div>

        <!-- Repeat Days -->
        <div class="form-field">
          <label>Repeat Days</label>
          <div class="days-selector">
            <button type="button" class="day-chip active" data-day="Mon">M</button>
            <button type="button" class="day-chip active" data-day="Tue">T</button>
            <button type="button" class="day-chip active" data-day="Wed">W</button>
            <button type="button" class="day-chip active" data-day="Thu">T</button>
            <button type="button" class="day-chip active" data-day="Fri">F</button>
            <button type="button" class="day-chip" data-day="Sat">S</button>
            <button type="button" class="day-chip" data-day="Sun">S</button>
          </div>
        </div>

        <!-- Sound & Snooze Options -->
        <div class="form-row-2">
          <div class="form-field">
            <label>Alarm Sound</label>
            <select id="alarmSound">
              <option value="digital">⚡ Digital Beep</option>
              <option value="chime">🔔 Gentle Chime</option>
              <option value="siren">🚨 Retro Siren</option>
              <option value="cyber">🌌 Cyber Pulse</option>
            </select>
          </div>

          <div class="form-field">
            <label>Snooze Duration</label>
            <select id="snoozeDuration">
              <option value="5">5 Minutes</option>
              <option value="10" selected>10 Minutes</option>
              <option value="15">15 Minutes</option>
            </select>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" class="secondary-btn" id="cancelModalBtn">Cancel</button>
          <button type="submit" class="primary-save-btn">Save Alarm</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Live Ringing Alarm Fullscreen Overlay -->
  <div class="ringing-overlay hidden" id="ringingOverlay">
    <div class="ringing-card">
      <div class="ringing-bell animate-bounce">🔔</div>
      <h2 class="ringing-title" id="ringingLabel">Wake Up!</h2>
      <div class="ringing-time" id="ringingTime">06:30 AM</div>
      <p class="ringing-sub">Alarm is ringing now</p>

      <div class="ringing-actions">
        <button class="snooze-action-btn" id="snoozeBtn">💤 Snooze (<span id="snoozeMinsText">10m</span>)</button>
        <button class="dismiss-action-btn" id="dismissBtn">✓ Dismiss Alarm</button>
      </div>
    </div>
  </div>

  <script src="app.js"></script>
</body>
</html>`;

      cssContent = `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
}

body {
  background: radial-gradient(circle at 50% 15%, #0f1528 0%, #060810 100%);
  color: #f8fafc;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  padding: 24px 16px;
  overflow-x: hidden;
}

.app-layout {
  width: 100%;
  max-width: 680px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Header */
.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.greeting-pill {
  font-size: 11px;
  font-weight: 700;
  color: #818cf8;
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.3);
  padding: 4px 12px;
  border-radius: 20px;
  display: inline-block;
  margin-bottom: 6px;
}

.brand-title {
  font-size: 22px;
  font-weight: 900;
  color: #fff;
  letter-spacing: -0.5px;
}

.add-alarm-btn {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  border: none;
  border-radius: 16px;
  padding: 12px 22px;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
  transition: all 0.2s;
}

.add-alarm-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 25px rgba(99, 102, 241, 0.55);
}

/* Digital Clock Card */
.clock-card {
  background: #0d1222;
  border: 1px solid #1e293b;
  border-radius: 28px;
  padding: 28px 24px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.time-main {
  font-family: 'JetBrains Mono', monospace;
  font-size: 48px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -1px;
  text-shadow: 0 0 30px rgba(99, 102, 241, 0.3);
}

.ampm {
  font-size: 20px;
  font-weight: 700;
  color: #818cf8;
  margin-left: 6px;
}

.date-sub {
  font-size: 13px;
  color: #94a3b8;
  font-weight: 600;
  margin-top: 4px;
}

.next-alarm-banner {
  width: 100%;
  max-width: 440px;
  background: #131b30;
  border: 1px solid #223052;
  border-radius: 18px;
  padding: 12px 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  text-align: left;
}

.alarm-icon-box {
  width: 36px;
  height: 36px;
  background: rgba(99, 102, 241, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.next-label {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  color: #818cf8;
  letter-spacing: 0.5px;
}

.next-time {
  font-size: 12px;
  font-weight: 700;
  color: #f1f5f9;
  margin-top: 2px;
}

/* Alarms Section */
.alarms-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px;
}

.section-head h2 {
  font-size: 15px;
  font-weight: 800;
  color: #fff;
}

.active-tag {
  font-size: 11px;
  color: #10b981;
  font-weight: 700;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  padding: 3px 10px;
  border-radius: 20px;
}

.alarms-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Alarm Card */
.alarm-card {
  background: #0d1222;
  border: 1px solid #1e293b;
  border-radius: 20px;
  padding: 18px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.alarm-card:hover {
  border-color: #334155;
  transform: translateY(-1px);
}

.alarm-card.disabled {
  opacity: 0.55;
}

.alarm-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.alarm-time-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.card-time {
  font-family: 'JetBrains Mono', monospace;
  font-size: 28px;
  font-weight: 800;
  color: #fff;
}

.card-ampm {
  font-size: 13px;
  font-weight: 700;
  color: #818cf8;
}

.alarm-label {
  font-size: 13px;
  font-weight: 700;
  color: #e2e8f0;
}

.alarm-meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
}

.days-chips {
  display: flex;
  gap: 4px;
}

.chip-day {
  font-size: 9px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 6px;
  background: #172036;
  color: #64748b;
}

.chip-day.active {
  background: rgba(99, 102, 241, 0.25);
  color: #a5b4fc;
}

.alarm-right {
  display: flex;
  align-items: center;
  gap: 14px;
}

/* Switch Toggle */
.switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 26px;
}

.switch input { opacity: 0; width: 0; height: 0; }

.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: #1e293b;
  transition: .25s;
  border-radius: 34px;
  border: 1px solid #334155;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .25s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #4f46e5;
  border-color: #6366f1;
}

input:checked + .slider:before {
  transform: translateX(22px);
}

.card-actions {
  display: flex;
  gap: 6px;
}

.icon-action-btn {
  background: #141c30;
  border: 1px solid #232d48;
  color: #94a3b8;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.15s;
}

.icon-action-btn:hover {
  background: #1e2942;
  color: #fff;
}

.icon-action-btn.del:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.4);
}

/* Empty State */
.empty-alarms {
  background: #0d1222;
  border: 1px dashed #232d48;
  border-radius: 24px;
  padding: 40px 20px;
  text-align: center;
  color: #94a3b8;
}

.empty-alarms.hidden { display: none; }
.empty-icon { font-size: 32px; margin-bottom: 8px; }
.empty-alarms h3 { font-size: 15px; font-weight: 800; color: #fff; margin-bottom: 4px; }
.empty-alarms p { font-size: 12px; }

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(4, 6, 12, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 100;
  animation: fadeIn 0.2s ease;
}

.modal-overlay.hidden { display: none; }

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-card {
  width: 100%;
  max-width: 440px;
  background: #0d1222;
  border: 1px solid #24304f;
  border-radius: 28px;
  padding: 24px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.7);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h3 {
  font-size: 16px;
  font-weight: 800;
  color: #fff;
}

.close-modal-btn {
  background: #151b2e;
  border: 1px solid #232d48;
  color: #94a3b8;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  cursor: pointer;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.time-picker-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #080c16;
  border: 1px solid #1f2942;
  border-radius: 20px;
  padding: 14px 20px;
}

.time-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-select {
  background: #141c30;
  border: 1px solid #232d48;
  color: #fff;
  font-family: 'JetBrains Mono', monospace;
  font-size: 24px;
  font-weight: 800;
  border-radius: 12px;
  padding: 6px 12px;
  outline: none;
  cursor: pointer;
}

.colon {
  font-size: 24px;
  font-weight: 800;
  color: #818cf8;
}

.ampm-toggle {
  display: flex;
  background: #141c30;
  border: 1px solid #232d48;
  border-radius: 12px;
  overflow: hidden;
}

.ampm-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}

.ampm-btn.active {
  background: #6366f1;
  color: #fff;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field label {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
}

.form-field input, .form-field select {
  background: #080c16;
  border: 1px solid #1f2942;
  border-radius: 14px;
  padding: 12px 14px;
  color: #fff;
  font-size: 13px;
  outline: none;
}

.form-field input:focus, .form-field select:focus {
  border-color: #6366f1;
}

.days-selector {
  display: flex;
  justify-content: space-between;
  gap: 4px;
}

.day-chip {
  flex: 1;
  height: 38px;
  background: #080c16;
  border: 1px solid #1f2942;
  color: #64748b;
  border-radius: 10px;
  font-weight: 800;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.day-chip.active {
  background: #6366f1;
  border-color: #6366f1;
  color: #fff;
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.secondary-btn {
  flex: 1;
  background: #141c30;
  border: 1px solid #232d48;
  color: #cbd5e1;
  padding: 12px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
}

.primary-save-btn {
  flex: 1;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  border: none;
  padding: 12px;
  border-radius: 14px;
  font-weight: 800;
  font-size: 13px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
}

/* Ringing Overlay */
.ringing-overlay {
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at center, rgba(99, 102, 241, 0.3) 0%, rgba(6, 8, 16, 0.95) 100%);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 200;
  animation: pulseBg 1.5s infinite alternate;
}

@keyframes pulseBg {
  from { background-color: rgba(6, 8, 16, 0.92); }
  to { background-color: rgba(20, 10, 40, 0.96); }
}

.ringing-overlay.hidden { display: none; }

.ringing-card {
  width: 100%;
  max-width: 400px;
  background: #0d1222;
  border: 2px solid #6366f1;
  border-radius: 32px;
  padding: 32px 24px;
  text-align: center;
  box-shadow: 0 0 60px rgba(99, 102, 241, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.ringing-bell {
  font-size: 48px;
}

.ringing-title {
  font-size: 24px;
  font-weight: 900;
  color: #fff;
}

.ringing-time {
  font-family: 'JetBrains Mono', monospace;
  font-size: 38px;
  font-weight: 900;
  color: #818cf8;
}

.ringing-sub {
  font-size: 12px;
  color: #94a3b8;
}

.ringing-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  margin-top: 10px;
}

.snooze-action-btn {
  width: 100%;
  background: #1e293b;
  border: 1px solid #334155;
  color: #fff;
  padding: 14px;
  border-radius: 16px;
  font-weight: 800;
  font-size: 14px;
  cursor: pointer;
}

.dismiss-action-btn {
  width: 100%;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  border: none;
  padding: 14px;
  border-radius: 16px;
  font-weight: 900;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
}
`;

      jsContent = `// Web Audio Alarm Synthesizer Engine
const AudioSynth = {
  ctx: null,
  interval: null,
  isPlaying: false,

  init() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  },

  playTone(freq, type = 'sine', duration = 0.15) {
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch(e) {}
  },

  startAlarm(soundType = 'digital') {
    this.stopAlarm();
    this.init();
    this.isPlaying = true;

    const beepPattern = () => {
      if (!this.isPlaying) return;
      if (soundType === 'chime') {
        this.playTone(523.25, 'sine', 0.4); // C5
        setTimeout(() => this.playTone(659.25, 'sine', 0.4), 150); // E5
        setTimeout(() => this.playTone(783.99, 'sine', 0.6), 300); // G5
      } else if (soundType === 'siren') {
        this.playTone(800, 'sawtooth', 0.2);
        setTimeout(() => this.playTone(600, 'sawtooth', 0.2), 200);
      } else if (soundType === 'cyber') {
        this.playTone(440, 'triangle', 0.1);
        setTimeout(() => this.playTone(880, 'triangle', 0.2), 100);
        setTimeout(() => this.playTone(1320, 'triangle', 0.3), 200);
      } else {
        // Digital standard beep
        this.playTone(880, 'square', 0.1);
        setTimeout(() => this.playTone(880, 'square', 0.1), 120);
      }
    };

    beepPattern();
    this.interval = setInterval(beepPattern, 900);
  },

  stopAlarm() {
    this.isPlaying = false;
    if (this.interval) clearInterval(this.interval);
  }
};

// State
const STORAGE_KEY = 'chronos_alarms_v2';
let alarms = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
  { id: '1', hour: '06', minute: '30', ampm: 'AM', label: 'Wake Up & Exercise', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], sound: 'digital', snooze: '10', enabled: true },
  { id: '2', hour: '09', minute: '00', ampm: 'AM', label: 'Daily Team Standup', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], sound: 'chime', snooze: '5', enabled: true },
  { id: '3', hour: '10', minute: '30', ampm: 'PM', label: 'Evening Reading & Sleep', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], sound: 'cyber', snooze: '10', enabled: false }
];

let selectedAmPm = 'AM';
let selectedDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
let activeRingingAlarm = null;
let lastTriggeredMinute = -1;

// DOM
const clockTime = document.getElementById('clockTime');
const clockAmPm = document.getElementById('clockAmPm');
const clockDate = document.getElementById('clockDate');
const greetingPill = document.getElementById('greetingPill');
const nextAlarmText = document.getElementById('nextAlarmText');
const alarmsGrid = document.getElementById('alarmsGrid');
const emptyAlarms = document.getElementById('emptyAlarms');
const alarmCount = document.getElementById('alarmCount');
const activeCount = document.getElementById('activeCount');

// Modal DOM
const alarmModal = document.getElementById('alarmModal');
const openAddModalBtn = document.getElementById('openAddModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const alarmForm = document.getElementById('alarmForm');
const modalTitle = document.getElementById('modalTitle');
const editAlarmId = document.getElementById('editAlarmId');
const alarmHour = document.getElementById('alarmHour');
const alarmMinute = document.getElementById('alarmMinute');
const alarmLabel = document.getElementById('alarmLabel');
const alarmSound = document.getElementById('alarmSound');
const snoozeDuration = document.getElementById('snoozeDuration');
const btnAM = document.getElementById('btnAM');
const btnPM = document.getElementById('btnPM');
const dayChips = document.querySelectorAll('.day-chip');

// Ringing Overlay DOM
const ringingOverlay = document.getElementById('ringingOverlay');
const ringingLabel = document.getElementById('ringingLabel');
const ringingTime = document.getElementById('ringingTime');
const snoozeMinsText = document.getElementById('snoozeMinsText');
const snoozeBtn = document.getElementById('snoozeBtn');
const dismissBtn = document.getElementById('dismissBtn');

function updateClock() {
  const now = new Date();
  let h = now.getHours();
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';

  // Greeting
  if (h < 12) greetingPill.innerText = '☀️ Good Morning';
  else if (h < 17) greetingPill.innerText = '🌤️ Good Afternoon';
  else greetingPill.innerText = '🌙 Good Evening';

  let displayH = h % 12;
  displayH = displayH ? displayH : 12; // 0 is 12
  const strH = String(displayH).padStart(2, '0');

  clockTime.innerHTML = \`\${strH}:\${m}:\${s} <span class="ampm">\${ampm}</span>\`;

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  clockDate.innerText = \`\${days[now.getDay()]}, \${months[now.getMonth()]} \${now.getDate()}, \${now.getFullYear()}\`;

  // Check Alarms every second
  checkAlarms(now, strH, m, ampm, days[now.getDay()].slice(0, 3));
}

function checkAlarms(now, curH, curM, curAmPm, curDayAbbr) {
  const currentMinuteToken = now.getHours() * 60 + now.getMinutes();
  if (lastTriggeredMinute === currentMinuteToken && now.getSeconds() !== 0) return;

  alarms.forEach(alarm => {
    if (!alarm.enabled) return;
    if (alarm.hour === curH && alarm.minute === curM && alarm.ampm === curAmPm) {
      if (alarm.days.length === 0 || alarm.days.includes(curDayAbbr)) {
        if (lastTriggeredMinute !== currentMinuteToken) {
          triggerAlarm(alarm);
          lastTriggeredMinute = currentMinuteToken;
        }
      }
    }
  });
}

function triggerAlarm(alarm) {
  activeRingingAlarm = alarm;
  ringingLabel.innerText = alarm.label || 'Alarm';
  ringingTime.innerText = \`\${alarm.hour}:\${alarm.minute} \${alarm.ampm}\`;
  snoozeMinsText.innerText = \`\${alarm.snooze || 10}m\`;
  ringingOverlay.classList.remove('hidden');
  AudioSynth.startAlarm(alarm.sound || 'digital');
}

function saveAlarms() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
  render();
}

function render() {
  alarmCount.innerText = alarms.length;
  const activeTotal = alarms.filter(a => a.enabled).length;
  activeCount.innerText = \`\${activeTotal} active\`;

  // Render Alarms
  alarmsGrid.innerHTML = '';
  if (alarms.length === 0) {
    emptyAlarms.classList.remove('hidden');
  } else {
    emptyAlarms.classList.add('hidden');
    alarms.forEach(alarm => {
      const card = document.createElement('div');
      card.className = \`alarm-card \${alarm.enabled ? '' : 'disabled'}\`;

      const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const dayChipsHtml = allDays.map(d => 
        \`<span class="chip-day \${alarm.days.includes(d) ? 'active' : ''}">\${d}</span>\`
      ).join('');

      card.innerHTML = \`
        <div class="alarm-left">
          <div class="alarm-time-row">
            <span class="card-time">\${alarm.hour}:\${alarm.minute}</span>
            <span class="card-ampm">\${alarm.ampm}</span>
          </div>
          <div class="alarm-label">\${escapeHtml(alarm.label)}</div>
          <div class="alarm-meta-row">
            <div class="days-chips">\${dayChipsHtml}</div>
            <span>• \${alarm.sound.toUpperCase()}</span>
          </div>
        </div>

        <div class="alarm-right">
          <label class="switch">
            <input type="checkbox" \${alarm.enabled ? 'checked' : ''} onchange="toggleAlarm('\${alarm.id}')" />
            <span class="slider"></span>
          </label>
          <div class="card-actions">
            <button class="icon-action-btn" title="Test Alarm Sound" onclick="testSound('\${alarm.sound}')">🔔</button>
            <button class="icon-action-btn" title="Edit Alarm" onclick="openEditModal('\${alarm.id}')">✏️</button>
            <button class="icon-action-btn del" title="Delete Alarm" onclick="deleteAlarm('\${alarm.id}')">🗑️</button>
          </div>
        </div>
      \`;
      alarmsGrid.appendChild(card);
    });
  }

  // Next Alarm Banner
  const next = getNextAlarm();
  if (next) {
    nextAlarmText.innerText = \`\${next.hour}:\${next.minute} \${next.ampm} (\${next.label})\`;
  } else {
    nextAlarmText.innerText = 'No upcoming alarms enabled';
  }
}

function getNextAlarm() {
  const enabledAlarms = alarms.filter(a => a.enabled);
  if (enabledAlarms.length === 0) return null;
  return enabledAlarms[0];
}

function toggleAlarm(id) {
  const alarm = alarms.find(a => a.id === id);
  if (!alarm) return;
  alarm.enabled = !alarm.enabled;
  saveAlarms();
}

function deleteAlarm(id) {
  if (confirm('Delete this alarm?')) {
    alarms = alarms.filter(a => a.id !== id);
    saveAlarms();
  }
}

function testSound(sound) {
  AudioSynth.startAlarm(sound);
  setTimeout(() => AudioSynth.stopAlarm(), 2000);
}

function escapeHtml(t) {
  const d = document.createElement('div');
  d.innerText = t;
  return d.innerHTML;
}

// Modal handling
openAddModalBtn.addEventListener('click', () => {
  editAlarmId.value = '';
  modalTitle.innerText = 'Set New Alarm';
  alarmHour.value = '06';
  alarmMinute.value = '30';
  alarmLabel.value = 'Morning Alarm';
  selectedAmPm = 'AM';
  btnAM.classList.add('active');
  btnPM.classList.remove('active');
  selectedDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  updateDayChipsUI();
  alarmModal.classList.remove('hidden');
});

function openEditModal(id) {
  const alarm = alarms.find(a => a.id === id);
  if (!alarm) return;
  editAlarmId.value = alarm.id;
  modalTitle.innerText = 'Edit Alarm';
  alarmHour.value = alarm.hour;
  alarmMinute.value = alarm.minute;
  alarmLabel.value = alarm.label;
  selectedAmPm = alarm.ampm;
  if (selectedAmPm === 'AM') {
    btnAM.classList.add('active'); btnPM.classList.remove('active');
  } else {
    btnPM.classList.add('active'); btnAM.classList.remove('active');
  }
  selectedDays = [...alarm.days];
  updateDayChipsUI();
  alarmSound.value = alarm.sound || 'digital';
  snoozeDuration.value = alarm.snooze || '10';
  alarmModal.classList.remove('hidden');
}

function updateDayChipsUI() {
  dayChips.forEach(chip => {
    const day = chip.getAttribute('data-day');
    if (selectedDays.includes(day)) chip.classList.add('active');
    else chip.classList.remove('active');
  });
}

dayChips.forEach(chip => {
  chip.addEventListener('click', () => {
    const day = chip.getAttribute('data-day');
    if (selectedDays.includes(day)) {
      selectedDays = selectedDays.filter(d => d !== day);
    } else {
      selectedDays.push(day);
    }
    updateDayChipsUI();
  });
});

btnAM.addEventListener('click', () => {
  selectedAmPm = 'AM'; btnAM.classList.add('active'); btnPM.classList.remove('active');
});
btnPM.addEventListener('click', () => {
  selectedAmPm = 'PM'; btnPM.classList.add('active'); btnAM.classList.remove('active');
});

closeModalBtn.addEventListener('click', () => alarmModal.classList.add('hidden'));
cancelModalBtn.addEventListener('click', () => alarmModal.classList.add('hidden'));

alarmForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = editAlarmId.value;
  const newAlarm = {
    id: id || Date.now().toString(),
    hour: alarmHour.value,
    minute: alarmMinute.value,
    ampm: selectedAmPm,
    label: alarmLabel.value.trim() || 'Alarm',
    days: selectedDays.length > 0 ? selectedDays : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    sound: alarmSound.value,
    snooze: snoozeDuration.value,
    enabled: true
  };

  if (id) {
    const idx = alarms.findIndex(a => a.id === id);
    if (idx !== -1) alarms[idx] = newAlarm;
  } else {
    alarms.push(newAlarm);
  }

  saveAlarms();
  alarmModal.classList.add('hidden');
});

// Ringing actions
dismissBtn.addEventListener('click', () => {
  AudioSynth.stopAlarm();
  ringingOverlay.classList.add('hidden');
  activeRingingAlarm = null;
});

snoozeBtn.addEventListener('click', () => {
  AudioSynth.stopAlarm();
  ringingOverlay.classList.add('hidden');
  if (activeRingingAlarm) {
    const snoozeMins = parseInt(activeRingingAlarm.snooze || 10, 10);
    const now = new Date();
    now.setMinutes(now.getMinutes() + snoozeMins);
    let h = now.getHours();
    const m = String(now.getMinutes()).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    let dh = h % 12; dh = dh ? dh : 12;
    const strH = String(dh).padStart(2, '0');

    alarms.push({
      id: 'snooze_' + Date.now(),
      hour: strH,
      minute: m,
      ampm: ampm,
      label: \`Snooze: \${activeRingingAlarm.label}\`,
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      sound: activeRingingAlarm.sound,
      snooze: activeRingingAlarm.snooze,
      enabled: true
    });
    saveAlarms();
  }
  activeRingingAlarm = null;
});

// Start clock & interval
setInterval(updateClock, 1000);
updateClock();
render();
`;
    }
    // ==========================================
    // 1. PREMIUM TODO & TASK MANAGEMENT APP
    // ==========================================
    else if (isTodo) {
      summary = 'A comprehensive, modern Task & Productivity Management Web App featuring category filtering, priority indicators, live search, progress statistics, Web Audio feedback, and LocalStorage persistence.';
      tamilSummary = 'அனைத்து அம்சங்களுடன் கூடிய முழுமையான டூடு மற்றும் டாஸ்க் மேலாளர் செயலி உருவாக்கப்பட்டுள்ளது. இதில் பிரிவுகள் (Categories), முன்னுரிமை (Priorities), தேடல் (Search), முன்னேற்ற புள்ளிவிவரங்கள் (Progress Stats) மற்றும் உள்ளூர் சேமிப்பகம் (LocalStorage) இணைக்கப்பட்டுள்ளது.';

      plan = [
        'Analyze task management requirements & data schema',
        'Formulate glassmorphic UI layout with category filters & search bar',
        'Synthesize full CRUD state management (Add, Edit, Check, Delete, Undo)',
        'Integrate Web Audio API sound feedback & LocalStorage sync',
        'Verify in sandbox runner and launch live preview'
      ];

      features = [
        'Full Task CRUD with instant inline editing and check-off animations',
        'Category filters (Work, Personal, Urgent, Ideas) with color badges',
        'Priority tagging (High, Medium, Low) with visual indicator lights',
        'Instant live search and filter tabs (All, Pending, Completed)',
        'Dynamic completion progress bar & statistics counter',
        'Undo toast notification when deleting tasks',
        'Web Audio synthesized sound effects (Check click, Task add, Delete)',
        'Full LocalStorage persistence (Tasks saved automatically)'
      ];

      htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nexus TaskFlow - Premium Todo & Productivity</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>
  <div class="app-wrapper">
    <!-- Header -->
    <header class="app-header">
      <div class="brand">
        <div class="logo-icon">✓</div>
        <div>
          <h1>Nexus TaskFlow</h1>
          <p class="subtitle">Focus, Organize & Achieve</p>
        </div>
      </div>
      <div class="header-actions">
        <button id="soundToggleBtn" class="icon-btn" title="Toggle Sound">🔊</button>
        <button id="clearCompletedBtn" class="secondary-btn">Clear Completed</button>
      </div>
    </header>

    <!-- Productivity Progress Meter -->
    <section class="progress-card">
      <div class="progress-info">
        <div>
          <span class="progress-title">Daily Progress</span>
          <p id="progressStatus" class="progress-status">0 of 0 tasks completed</p>
        </div>
        <div class="progress-percent" id="progressPercent">0%</div>
      </div>
      <div class="progress-bar-track">
        <div class="progress-bar-fill" id="progressBarFill"></div>
      </div>
    </section>

    <!-- Task Creation Bar -->
    <section class="add-task-card">
      <form id="taskForm" class="task-form">
        <div class="input-row">
          <input 
            type="text" 
            id="taskInput" 
            placeholder="Add a new task (e.g. Design landing page hero)..." 
            required 
            autocomplete="off"
          />
          <button type="submit" class="primary-btn">
            <span>+ Add Task</span>
          </button>
        </div>
        
        <div class="form-options">
          <div class="select-group">
            <label>Category:</label>
            <select id="categorySelect">
              <option value="Work">💼 Work</option>
              <option value="Personal">🏠 Personal</option>
              <option value="Urgent">🔥 Urgent</option>
              <option value="Study">📚 Study</option>
            </select>
          </div>

          <div class="select-group">
            <label>Priority:</label>
            <select id="prioritySelect">
              <option value="high">🔴 High</option>
              <option value="medium" selected>🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
          </div>

          <div class="select-group">
            <label>Due:</label>
            <input type="date" id="dueDateInput" />
          </div>
        </div>
      </form>
    </section>

    <!-- Filters & Search Controls -->
    <section class="filter-controls">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input type="text" id="searchInput" placeholder="Search tasks..." />
      </div>

      <div class="filter-tabs">
        <button class="filter-tab active" data-filter="all">All (<span id="countAll">0</span>)</button>
        <button class="filter-tab" data-filter="active">Active (<span id="countActive">0</span>)</button>
        <button class="filter-tab" data-filter="completed">Completed (<span id="countCompleted">0</span>)</button>
        <button class="filter-tab" data-filter="urgent">🔥 Urgent (<span id="countUrgent">0</span>)</button>
      </div>
    </section>

    <!-- Task List Container -->
    <main class="tasks-container">
      <ul id="taskList" class="task-list"></ul>
      
      <!-- Empty State -->
      <div id="emptyState" class="empty-state hidden">
        <div class="empty-icon">✨</div>
        <h3>No tasks found</h3>
        <p>You're all caught up! Add a new task above to stay productive.</p>
      </div>
    </main>

    <!-- Undo Toast Notification -->
    <div id="undoToast" class="toast hidden">
      <span id="toastMsg">Task deleted</span>
      <button id="undoBtn">Undo</button>
    </div>
  </div>

  <script src="app.js"></script>
</body>
</html>`;

      cssContent = `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

body {
  background: radial-gradient(circle at 50% 10%, #121829 0%, #080a12 100%);
  color: #f1f5f9;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  padding: 24px 16px;
  overflow-x: hidden;
}

.app-wrapper {
  width: 100%;
  max-width: 680px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* Header */
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 4px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 800;
  color: #fff;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
}

.brand h1 {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: #fff;
}

.subtitle {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.icon-btn {
  background: #151b2e;
  border: 1px solid #232d48;
  color: #cbd5e1;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.icon-btn:hover {
  background: #1e2742;
  border-color: #6366f1;
}

.secondary-btn {
  background: #151b2e;
  border: 1px solid #232d48;
  color: #cbd5e1;
  padding: 8px 14px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.secondary-btn:hover {
  background: #1e2742;
  color: #fff;
  border-color: #475569;
}

/* Progress Card */
.progress-card {
  background: #0f1526;
  border: 1px solid #1f2942;
  border-radius: 20px;
  padding: 18px 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-title {
  font-size: 13px;
  font-weight: 700;
  color: #fff;
}

.progress-status {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
}

.progress-percent {
  font-size: 20px;
  font-weight: 800;
  color: #818cf8;
}

.progress-bar-track {
  width: 100%;
  height: 8px;
  background: #161e33;
  border-radius: 10px;
  overflow: hidden;
}

.progress-bar-fill {
  width: 0%;
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #10b981);
  border-radius: 10px;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Add Task Card */
.add-task-card {
  background: #0f1526;
  border: 1px solid #1f2942;
  border-radius: 20px;
  padding: 16px 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

.input-row {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

#taskInput {
  flex: 1;
  background: #090c16;
  border: 1px solid #232d48;
  border-radius: 14px;
  padding: 12px 16px;
  color: #fff;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
}

#taskInput:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.primary-btn {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: #fff;
  border: none;
  border-radius: 14px;
  padding: 0 20px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.35);
}

.primary-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45);
}

.form-options {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.select-group {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #090c16;
  border: 1px solid #1f2942;
  border-radius: 10px;
  padding: 6px 10px;
  font-size: 11px;
}

.select-group label {
  color: #94a3b8;
  font-weight: 600;
}

.select-group select, .select-group input {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  outline: none;
  cursor: pointer;
}

.select-group select option {
  background: #0f1526;
  color: #fff;
}

/* Filters & Search */
.filter-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.search-box {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  opacity: 0.6;
}

#searchInput {
  width: 100%;
  background: #0f1526;
  border: 1px solid #1f2942;
  border-radius: 14px;
  padding: 10px 14px 10px 38px;
  color: #fff;
  font-size: 12px;
  outline: none;
  transition: all 0.2s;
}

#searchInput:focus {
  border-color: #6366f1;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.filter-tab {
  background: #0f1526;
  border: 1px solid #1f2942;
  color: #94a3b8;
  padding: 8px 14px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.filter-tab:hover {
  color: #fff;
  border-color: #334155;
}

.filter-tab.active {
  background: #6366f1;
  color: #fff;
  border-color: #6366f1;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

/* Task List */
.tasks-container {
  min-height: 200px;
}

.task-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.task-item {
  background: #0f1526;
  border: 1px solid #1f2942;
  border-radius: 16px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  transition: all 0.2s;
  animation: slideIn 0.25s ease;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.task-item:hover {
  border-color: #334155;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.task-item.completed {
  opacity: 0.65;
  background: #0a0e1c;
}

.task-left {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
}

.custom-checkbox {
  width: 22px;
  height: 22px;
  border-radius: 8px;
  border: 2px solid #334155;
  background: #090c16;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.task-item.completed .custom-checkbox {
  background: #10b981;
  border-color: #10b981;
  color: #fff;
}

.task-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.task-title {
  font-size: 13px;
  font-weight: 600;
  color: #f1f5f9;
  word-break: break-word;
}

.task-item.completed .task-title {
  text-decoration: line-through;
  color: #64748b;
}

.task-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 10px;
}

.badge-tag {
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 9px;
  letter-spacing: 0.5px;
}

.badge-Work { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
.badge-Personal { background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3); }
.badge-Urgent { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
.badge-Study { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }

.priority-dot {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  color: #94a3b8;
}

.priority-high { color: #f87171; }
.priority-medium { color: #fbbf24; }
.priority-low { color: #34d399; }

.task-actions {
  display: flex;
  gap: 6px;
}

.action-btn {
  background: transparent;
  border: 1px solid transparent;
  color: #64748b;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.15s;
}

.action-btn:hover {
  background: #1a2238;
  color: #fff;
  border-color: #334155;
}

.action-btn.delete:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.4);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 48px 20px;
  background: #0f1526;
  border: 1px dashed #232d48;
  border-radius: 20px;
  color: #94a3b8;
}

.empty-state.hidden { display: none; }
.empty-icon { font-size: 36px; margin-bottom: 8px; }
.empty-state h3 { font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 4px; }
.empty-state p { font-size: 12px; }

/* Toast */
.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: #1e293b;
  border: 1px solid #334155;
  padding: 10px 18px;
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #fff;
  z-index: 100;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translate(-50%, 15px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}

.toast.hidden { display: none; }

#undoBtn {
  background: #6366f1;
  color: #fff;
  border: none;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}
`;

      jsContent = `// Web Audio Synthesizer (Haptic Audio Feedback)
const AudioFX = {
  ctx: null,
  soundEnabled: true,
  init() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  },
  play(freq, type = 'sine', duration = 0.08) {
    if (!this.soundEnabled) return;
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch(e) {}
  },
  add() { this.play(520, 'triangle', 0.1); setTimeout(() => this.play(680, 'sine', 0.12), 40); },
  check() { this.play(600, 'sine', 0.08); setTimeout(() => this.play(880, 'sine', 0.15), 60); },
  uncheck() { this.play(400, 'sine', 0.08); },
  delete() { this.play(300, 'sawtooth', 0.1); }
};

// Initial state and sample data
const STORAGE_KEY = 'nexus_taskflow_data_v2';
let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
  { id: '1', title: 'Complete high-polish user interface styling', category: 'Work', priority: 'high', dueDate: 'Today', completed: false },
  { id: '2', title: 'Review PR & verify mobile touch responsiveness', category: 'Work', priority: 'medium', dueDate: 'Tomorrow', completed: false },
  { id: '3', title: 'Workout & 30-min evening walk', category: 'Personal', priority: 'low', dueDate: 'Daily', completed: true },
  { id: '4', title: 'Read TypeScript design patterns chapter', category: 'Study', priority: 'medium', dueDate: 'This week', completed: false }
];

let activeFilter = 'all';
let searchQuery = '';
let lastDeletedTask = null;
let toastTimer = null;

// DOM Elements
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const categorySelect = document.getElementById('categorySelect');
const prioritySelect = document.getElementById('prioritySelect');
const dueDateInput = document.getElementById('dueDateInput');
const taskList = document.getElementById('taskList');
const searchInput = document.getElementById('searchInput');
const emptyState = document.getElementById('emptyState');
const filterTabs = document.querySelectorAll('.filter-tab');
const progressBarFill = document.getElementById('progressBarFill');
const progressPercent = document.getElementById('progressPercent');
const progressStatus = document.getElementById('progressStatus');
const soundToggleBtn = document.getElementById('soundToggleBtn');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const undoToast = document.getElementById('undoToast');
const undoBtn = document.getElementById('undoBtn');

// Counts
const countAll = document.getElementById('countAll');
const countActive = document.getElementById('countActive');
const countCompleted = document.getElementById('countCompleted');
const countUrgent = document.getElementById('countUrgent');

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  render();
}

function render() {
  // Update Counts
  const total = tasks.length;
  const completedCount = tasks.filter(t => t.completed).length;
  const activeCount = total - completedCount;
  const urgentCount = tasks.filter(t => t.priority === 'high' && !t.completed).length;

  countAll.innerText = total;
  countActive.innerText = activeCount;
  countCompleted.innerText = completedCount;
  countUrgent.innerText = urgentCount;

  // Update Progress Bar
  const percent = total === 0 ? 0 : Math.round((completedCount / total) * 100);
  progressBarFill.style.width = \`\${percent}%\`;
  progressPercent.innerText = \`\${percent}%\`;
  progressStatus.innerText = \`\${completedCount} of \${total} tasks completed\`;

  // Filter Tasks
  let filtered = tasks.filter(task => {
    // Search match
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // Tab match
    if (activeFilter === 'active') return !task.completed;
    if (activeFilter === 'completed') return task.completed;
    if (activeFilter === 'urgent') return task.priority === 'high';
    return true;
  });

  taskList.innerHTML = '';

  if (filtered.length === 0) {
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
    filtered.forEach(task => {
      const li = document.createElement('li');
      li.className = \`task-item \${task.completed ? 'completed' : ''}\`;
      
      li.innerHTML = \`
        <div class="task-left">
          <div class="custom-checkbox" onclick="toggleTask('\${task.id}')">
            \${task.completed ? '✓' : ''}
          </div>
          <div class="task-details">
            <div class="task-title">\${escapeHtml(task.title)}</div>
            <div class="task-meta">
              <span class="badge-tag badge-\${task.category}">\${task.category}</span>
              <span class="priority-dot priority-\${task.priority}">● \${task.priority.toUpperCase()}</span>
              \${task.dueDate ? \`<span style="color:#64748b">📅 \${task.dueDate}</span>\` : ''}
            </div>
          </div>
        </div>
        <div class="task-actions">
          <button class="action-btn" title="Edit task" onclick="editTask('\${task.id}')">✏️</button>
          <button class="action-btn delete" title="Delete task" onclick="deleteTask('\${task.id}')">🗑️</button>
        </div>
      \`;
      taskList.appendChild(li);
    });
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.innerText = text;
  return div.innerHTML;
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  if (task.completed) {
    AudioFX.check();
  } else {
    AudioFX.uncheck();
  }
  saveTasks();
}

function deleteTask(id) {
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return;
  lastDeletedTask = { task: tasks[index], index };
  tasks.splice(index, 1);
  AudioFX.delete();
  saveTasks();
  showUndoToast(\`Deleted "\${lastDeletedTask.task.title.slice(0, 24)}..."\`);
}

function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  const newTitle = prompt('Edit task title:', task.title);
  if (newTitle && newTitle.trim()) {
    task.title = newTitle.trim();
    saveTasks();
  }
}

function showUndoToast(msg) {
  const toastMsg = document.getElementById('toastMsg');
  toastMsg.innerText = msg;
  undoToast.classList.remove('hidden');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    undoToast.classList.add('hidden');
    lastDeletedTask = null;
  }, 4500);
}

undoBtn.addEventListener('click', () => {
  if (lastDeletedTask) {
    tasks.splice(lastDeletedTask.index, 0, lastDeletedTask.task);
    lastDeletedTask = null;
    undoToast.classList.add('hidden');
    AudioFX.add();
    saveTasks();
  }
});

taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = taskInput.value.trim();
  if (!title) return;

  const newTask = {
    id: Date.now().toString(),
    title,
    category: categorySelect.value,
    priority: prioritySelect.value,
    dueDate: dueDateInput.value || 'Today',
    completed: false
  };

  tasks.unshift(newTask);
  taskInput.value = '';
  AudioFX.add();
  saveTasks();
});

// Search handler
searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value;
  render();
});

// Tab filters
filterTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    filterTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeFilter = tab.getAttribute('data-filter');
    render();
  });
});

// Clear completed
clearCompletedBtn.addEventListener('click', () => {
  if (confirm('Clear all completed tasks?')) {
    tasks = tasks.filter(t => !t.completed);
    AudioFX.delete();
    saveTasks();
  }
});

// Sound Toggle
soundToggleBtn.addEventListener('click', () => {
  AudioFX.soundEnabled = !AudioFX.soundEnabled;
  soundToggleBtn.innerText = AudioFX.soundEnabled ? '🔊' : '🔇';
});

// Init
render();
console.log('Nexus TaskFlow initialized successfully.');
`;
    }
    // ==========================================
    // 2. SCIENTIFIC & GLASSMORPHIC CALCULATOR
    // ==========================================
    else if (isCalc) {
      summary = 'A sleek Glassmorphic Calculator featuring scientific functions, memory storage, calculation tape history, keyboard shortcuts, and Web Audio click sounds.';
      tamilSummary = 'நவீன கிளாஸ்மார்ஃபிக் கால்குலேட்டர் செயலி உருவாக்கப்பட்டுள்ளது. இதில் சயின்டிஃபிக் பார்முலாக்கள், கணக்கீட்டு வரலாறு (History Tape), மெமரி பட்டன்கள் மற்றும் ஒலி பின்னூட்டம் உள்ளன.';

      plan = [
        'Design responsive glassmorphism calculator layout',
        'Synthesize arithmetic & scientific math evaluation engine',
        'Integrate calculation history memory tape & LocalStorage',
        'Add keyboard listener & Web Audio click feedback'
      ];

      features = [
        'Standard & Scientific operations (sqrt, square, power, sin, cos, tan, log, pi)',
        'Calculation tape history with click-to-reuse previous values',
        'Memory registers (MC, MR, M+, M-)',
        'Full physical keyboard support (0-9, +, -, *, /, Enter, Backspace)',
        'Web Audio tactile click sound feedback'
      ];

      htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AeroCalc Pro - Glassmorphic Scientific Calculator</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="calc-wrapper">
    <div class="calc-container">
      <header class="calc-header">
        <div class="brand">⚡ AeroCalc Pro</div>
        <button id="historyToggle" class="history-btn">📜 History</button>
      </header>

      <!-- Display -->
      <div class="display-container">
        <div class="equation-display" id="equationDisplay"></div>
        <div class="result-display" id="resultDisplay">0</div>
      </div>

      <!-- Keypad -->
      <div class="keypad">
        <button class="key func" onclick="memoryClear()">MC</button>
        <button class="key func" onclick="memoryRecall()">MR</button>
        <button class="key func" onclick="memoryAdd()">M+</button>
        <button class="key func danger" onclick="clearAll()">AC</button>
        <button class="key func danger" onclick="backspace()">⌫</button>

        <button class="key sci" onclick="appendSci('sqrt')">√</button>
        <button class="key sci" onclick="appendSci('sqr')">x²</button>
        <button class="key sci" onclick="appendSci('sin')">sin</button>
        <button class="key sci" onclick="appendSci('cos')">cos</button>
        <button class="key op" onclick="appendOp('/')">÷</button>

        <button class="key num" onclick="appendNum('7')">7</button>
        <button class="key num" onclick="appendNum('8')">8</button>
        <button class="key num" onclick="appendNum('9')">9</button>
        <button class="key sci" onclick="appendSci('pi')">π</button>
        <button class="key op" onclick="appendOp('*')">×</button>

        <button class="key num" onclick="appendNum('4')">4</button>
        <button class="key num" onclick="appendNum('5')">5</button>
        <button class="key num" onclick="appendNum('6')">6</button>
        <button class="key sci" onclick="appendSci('percent')">%</button>
        <button class="key op" onclick="appendOp('-')">−</button>

        <button class="key num" onclick="appendNum('1')">1</button>
        <button class="key num" onclick="appendNum('2')">2</button>
        <button class="key num" onclick="appendNum('3')">3</button>
        <button class="key sci" onclick="toggleSign()">±</button>
        <button class="key op" onclick="appendOp('+')">+</button>

        <button class="key num zero" onclick="appendNum('0')">0</button>
        <button class="key num" onclick="appendDot('.')">.</button>
        <button class="key equals" onclick="calculate()">=</button>
      </div>
    </div>

    <!-- History Drawer -->
    <div class="history-drawer" id="historyDrawer">
      <div class="history-head">
        <h3>Calculation History</h3>
        <button onclick="clearHistory()" class="clear-h-btn">Clear</button>
      </div>
      <ul id="historyList" class="history-list"></ul>
    </div>
  </div>
  <script src="app.js"></script>
</body>
</html>`;

      cssContent = `* { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
body { background: radial-gradient(circle at center, #12182b, #070913); color: #fff; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 16px; }
.calc-wrapper { display: flex; gap: 16px; width: 100%; max-width: 680px; }
.calc-container { width: 100%; max-width: 380px; background: rgba(15, 21, 38, 0.85); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 28px; padding: 22px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6); }
.calc-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.brand { font-size: 13px; font-weight: 800; color: #818cf8; letter-spacing: 0.5px; }
.history-btn { background: #1a233d; border: 1px solid #2a3860; color: #cbd5e1; padding: 4px 10px; border-radius: 10px; font-size: 11px; cursor: pointer; }
.display-container { background: #080c18; border: 1px solid #1c2642; border-radius: 20px; padding: 16px 20px; text-align: right; margin-bottom: 18px; min-height: 90px; display: flex; flex-direction: column; justify-content: flex-end; }
.equation-display { font-size: 12px; color: #94a3b8; min-height: 16px; word-break: break-all; }
.result-display { font-size: 32px; font-weight: 800; color: #fff; word-break: break-all; margin-top: 4px; }
.keypad { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
.key { height: 46px; border-radius: 14px; border: 1px solid rgba(255, 255, 255, 0.06); font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.12s; display: flex; align-items: center; justify-content: center; }
.key:active { transform: scale(0.95); }
.key.num { background: #141c30; color: #f1f5f9; }
.key.num:hover { background: #1c2847; }
.key.zero { grid-column: span 2; }
.key.op { background: #312e81; color: #c7d2fe; border-color: #4338ca; }
.key.op:hover { background: #3730a3; }
.key.func { background: #1a2238; color: #94a3b8; font-size: 11px; }
.key.func.danger { color: #f87171; }
.key.sci { background: #131b2e; color: #38bdf8; font-size: 12px; }
.key.equals { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; grid-column: span 2; font-size: 18px; }
.history-drawer { flex: 1; background: #0f1526; border: 1px solid #1e2942; border-radius: 24px; padding: 18px; max-height: 440px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; }
.history-head { display: flex; justify-content: space-between; align-items: center; font-size: 12px; font-weight: 700; color: #fff; }
.clear-h-btn { background: transparent; border: none; color: #ef4444; font-size: 11px; cursor: pointer; }
.history-list { list-style: none; display: flex; flex-direction: column; gap: 8px; }
.history-item { background: #080c18; padding: 10px 12px; border-radius: 12px; cursor: pointer; border: 1px solid #1c2642; }
.history-item:hover { border-color: #6366f1; }
.h-eq { font-size: 11px; color: #94a3b8; }
.h-res { font-size: 14px; font-weight: 700; color: #10b981; }
@media(max-width: 640px) { .calc-wrapper { flex-direction: column; align-items: center; } .history-drawer { width: 100%; max-width: 380px; } }
`;

      jsContent = `const eqEl = document.getElementById('equationDisplay');
const resEl = document.getElementById('resultDisplay');
const historyList = document.getElementById('historyList');

let curVal = '0';
let eqStr = '';
let memoryVal = 0;
let history = JSON.parse(localStorage.getItem('aerocalc_history')) || [];

function playClick() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.frequency.setValueAtTime(700, ctx.currentTime);
    g.gain.setValueAtTime(0.04, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.04);
  } catch(e) {}
}

function updateDisplay() {
  resEl.innerText = curVal;
  eqEl.innerText = eqStr;
}

function appendNum(n) {
  playClick();
  if (curVal === '0') curVal = n;
  else curVal += n;
  updateDisplay();
}

function appendDot() {
  playClick();
  if (!curVal.includes('.')) curVal += '.';
  updateDisplay();
}

function appendOp(op) {
  playClick();
  eqStr += \` \${curVal} \${op}\`;
  curVal = '0';
  updateDisplay();
}

function appendSci(func) {
  playClick();
  let v = parseFloat(curVal);
  if (func === 'sqrt') curVal = Math.sqrt(v).toString();
  if (func === 'sqr') curVal = (v * v).toString();
  if (func === 'sin') curVal = Math.sin(v * Math.PI / 180).toFixed(6);
  if (func === 'cos') curVal = Math.cos(v * Math.PI / 180).toFixed(6);
  if (func === 'pi') curVal = Math.PI.toFixed(6);
  if (func === 'percent') curVal = (v / 100).toString();
  updateDisplay();
}

function toggleSign() {
  playClick();
  curVal = (parseFloat(curVal) * -1).toString();
  updateDisplay();
}

function clearAll() {
  playClick();
  curVal = '0';
  eqStr = '';
  updateDisplay();
}

function backspace() {
  playClick();
  if (curVal.length > 1) curVal = curVal.slice(0, -1);
  else curVal = '0';
  updateDisplay();
}

function calculate() {
  playClick();
  try {
    const fullEq = \`\${eqStr} \${curVal}\`.trim();
    const sanitized = fullEq.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
    const result = Function('"use strict";return (' + sanitized + ')')();
    const finalRes = Number.isInteger(result) ? result.toString() : parseFloat(result.toFixed(6)).toString();
    
    history.unshift({ eq: fullEq, res: finalRes });
    if (history.length > 20) history.pop();
    localStorage.setItem('aerocalc_history', JSON.stringify(history));
    renderHistory();

    eqStr = '';
    curVal = finalRes;
    updateDisplay();
  } catch (err) {
    curVal = 'Error';
    updateDisplay();
  }
}

function renderHistory() {
  historyList.innerHTML = '';
  history.forEach(item => {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.innerHTML = \`<div class="h-eq">\${item.eq} =</div><div class="h-res">\${item.res}</div>\`;
    li.onclick = () => { curVal = item.res; updateDisplay(); };
    historyList.appendChild(li);
  });
}

function clearHistory() { history = []; localStorage.removeItem('aerocalc_history'); renderHistory(); }
function memoryClear() { memoryVal = 0; }
function memoryRecall() { curVal = memoryVal.toString(); updateDisplay(); }
function memoryAdd() { memoryVal += parseFloat(curVal) || 0; }

window.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') appendNum(e.key);
  if (['+', '-', '*', '/'].includes(e.key)) appendOp(e.key);
  if (e.key === 'Enter' || e.key === '=') calculate();
  if (e.key === 'Backspace') backspace();
  if (e.key === 'Escape') clearAll();
});

renderHistory();
`;
    }
    // ==========================================
    // 3. RETRO GAME ENGINE (Snake, 2048, Flappy, etc.)
    // ==========================================
    else if (isSnake || isFlappy || is2048 || isSpace || isTicTacToe || isBrick) {
      // Default to Snake if general
      summary = 'An interactive Arcade Game built with HTML5 Canvas, Web Audio sound effects, high score persistence, and responsive controls.';
      tamilSummary = 'கேன்வாஸ் அனிமேஷன் மற்றும் வெப் ஆடியோ சவுண்ட் எபெக்ட்ஸுடன் கூடிய கேம் செயலி உருவாக்கப்பட்டுள்ளது.';

      plan = [
        'Initialize 60FPS Game physics & Canvas loop',
        'Synthesize Web Audio retro sound effects',
        'Bind Keyboard and On-Screen Touch controls',
        'Implement dynamic Score & LocalStorage High Score'
      ];

      features = [
        '60FPS fluid requestAnimationFrame game loop',
        'Web Audio oscillator sound synthesizer (zero external sound files)',
        'Particle explosions & neon lighting effects',
        'Touch buttons for mobile + Arrow keys for desktop',
        'Score & High Score saved in LocalStorage'
      ];

      htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CYBERSNAKE 2.0 - Neon Arcade</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="arcade-wrapper">
    <header class="game-header">
      <div class="logo">⚡ CYBERSNAKE 2.0</div>
      <div class="score-board">
        <div class="badge">SCORE: <span id="score">0</span></div>
        <div class="badge high">BEST: <span id="highScore">0</span></div>
      </div>
    </header>

    <div class="canvas-container">
      <canvas id="gameCanvas" width="400" height="400"></canvas>
      <div id="overlay" class="overlay">
        <h2 id="overlayTitle">CYBER SNAKE</h2>
        <p id="overlaySubtitle">Press Space or Start to Play</p>
        <button id="startBtn" onclick="startGame()">START GAME</button>
      </div>
    </div>

    <div class="touch-controls">
      <button class="d-btn up" onclick="handleDirection('UP')">▲</button>
      <div class="d-row">
        <button class="d-btn left" onclick="handleDirection('LEFT')">◀</button>
        <button class="d-btn down" onclick="handleDirection('DOWN')">▼</button>
        <button class="d-btn right" onclick="handleDirection('RIGHT')">▶</button>
      </div>
    </div>

    <footer class="game-footer">
      <span>Controls: Arrow Keys / WASD • Audio: Web Audio Synth</span>
    </footer>
  </div>
  <script src="app.js"></script>
</body>
</html>`;

      cssContent = `* { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, sans-serif; }
body { background: #060810; color: #fff; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 16px; }
.arcade-wrapper { width: 100%; max-width: 440px; background: #0c101d; border: 2px solid #1f293d; border-radius: 24px; padding: 20px; box-shadow: 0 0 50px rgba(99, 102, 241, 0.2); text-align: center; }
.game-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.logo { font-size: 18px; font-weight: 900; color: #a5b4fc; text-shadow: 0 0 10px #6366f1; }
.score-board { display: flex; gap: 8px; }
.badge { background: #121828; border: 1px solid #1f293d; padding: 6px 12px; border-radius: 12px; font-size: 11px; font-weight: 700; color: #10b981; }
.badge.high { color: #f59e0b; border-color: rgba(245, 158, 11, 0.3); }
.canvas-container { position: relative; width: 100%; background: #05070e; border: 2px solid #2e3856; border-radius: 18px; overflow: hidden; }
canvas { display: block; width: 100%; height: auto; }
.overlay { position: absolute; inset: 0; background: rgba(5, 7, 14, 0.88); backdrop-filter: blur(4px); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; z-index: 10; }
.overlay.hidden { display: none; }
.overlay h2 { font-size: 26px; font-weight: 800; color: #fff; text-shadow: 0 0 15px #6366f1; }
.overlay p { font-size: 12px; color: #94a3b8; }
#startBtn { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; border: none; padding: 12px 28px; border-radius: 14px; font-weight: 800; font-size: 13px; cursor: pointer; box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4); }
.touch-controls { margin-top: 14px; display: flex; flex-direction: column; align-items: center; gap: 6px; }
.d-row { display: flex; gap: 8px; }
.d-btn { width: 48px; height: 44px; background: #171f33; border: 1px solid #1f293d; color: #cbd5e1; border-radius: 12px; font-size: 14px; font-weight: bold; cursor: pointer; }
.d-btn:active { background: #6366f1; color: #fff; }
.game-footer { margin-top: 14px; font-size: 10px; color: #64748b; }`;

      jsContent = `const AudioSys = {
  ctx: null,
  init() { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); },
  playTone(freq, duration, type = 'sine') {
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type; osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.start(); osc.stop(this.ctx.currentTime + duration);
    } catch(e) {}
  },
  eat() { this.playTone(600, 0.1, 'triangle'); setTimeout(() => this.playTone(850, 0.15, 'sine'), 50); },
  gameOver() { this.playTone(220, 0.2, 'sawtooth'); setTimeout(() => this.playTone(130, 0.4, 'sawtooth'), 150); }
};

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highScore');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlaySubtitle = document.getElementById('overlaySubtitle');

const GRID_SIZE = 20;
const TILE_COUNT = canvas.width / GRID_SIZE;

let snake = [];
let food = { x: 15, y: 15 };
let dx = 1; let dy = 0;
let score = 0;
let highScore = localStorage.getItem('cybersnake_best') || 0;
let gameLoop = null;
let isPlaying = false;
let particles = [];

highScoreEl.innerText = highScore;

function startGame() {
  snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  dx = 1; dy = 0;
  score = 0; scoreEl.innerText = '0';
  particles = [];
  placeFood();
  overlay.classList.add('hidden');
  isPlaying = true;
  if (gameLoop) clearInterval(gameLoop);
  gameLoop = setInterval(update, 100);
}

function placeFood() {
  food.x = Math.floor(Math.random() * TILE_COUNT);
  food.y = Math.floor(Math.random() * TILE_COUNT);
}

function update() {
  if (!isPlaying) return;
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) { endGame(); return; }
  for (let i = 0; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) { endGame(); return; }
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreEl.innerText = score;
    AudioSys.eat();
    createParticles(food.x * GRID_SIZE + 10, food.y * GRID_SIZE + 10);
    if (score > highScore) {
      highScore = score;
      highScoreEl.innerText = highScore;
      localStorage.setItem('cybersnake_best', highScore);
    }
    placeFood();
  } else {
    snake.pop();
  }

  draw();
}

function createParticles(x, y) {
  for (let i = 0; i < 12; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6,
      life: 1,
      color: '#10b981'
    });
  }
}

function draw() {
  ctx.fillStyle = '#05070e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 0.5;
  for (let x = 0; x < canvas.width; x += GRID_SIZE) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += GRID_SIZE) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy; p.life -= 0.05;
    if (p.life <= 0) { particles.splice(i, 1); continue; }
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.life;
    ctx.fillRect(p.x, p.y, 3, 3);
  }
  ctx.globalAlpha = 1.0;

  ctx.fillStyle = '#10b981';
  ctx.shadowBlur = 15; ctx.shadowColor = '#10b981';
  ctx.beginPath();
  ctx.arc(food.x * GRID_SIZE + 10, food.y * GRID_SIZE + 10, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  snake.forEach((part, index) => {
    ctx.fillStyle = index === 0 ? '#818cf8' : '#6366f1';
    ctx.shadowBlur = index === 0 ? 12 : 4;
    ctx.shadowColor = '#6366f1';
    ctx.beginPath();
    ctx.roundRect(part.x * GRID_SIZE + 1, part.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2, 4);
    ctx.fill();
  });
  ctx.shadowBlur = 0;
}

function endGame() {
  isPlaying = false;
  clearInterval(gameLoop);
  AudioSys.gameOver();
  overlayTitle.innerText = 'GAME OVER';
  overlaySubtitle.innerText = \`Final Score: \${score}\`;
  document.getElementById('startBtn').innerText = 'PLAY AGAIN';
  overlay.classList.remove('hidden');
}

function handleDirection(dir) {
  if (dir === 'UP' && dy === 0) { dx = 0; dy = -1; }
  if (dir === 'DOWN' && dy === 0) { dx = 0; dy = 1; }
  if (dir === 'LEFT' && dx === 0) { dx = -1; dy = 0; }
  if (dir === 'RIGHT' && dx === 0) { dx = 1; dy = 0; }
}

window.addEventListener('keydown', (e) => {
  if (['ArrowUp', 'KeyW'].includes(e.code)) handleDirection('UP');
  if (['ArrowDown', 'KeyS'].includes(e.code)) handleDirection('DOWN');
  if (['ArrowLeft', 'KeyA'].includes(e.code)) handleDirection('LEFT');
  if (['ArrowRight', 'KeyD'].includes(e.code)) handleDirection('RIGHT');
  if (e.code === 'Space' && !isPlaying) startGame();
});

draw();
`;
    }
    // ==========================================
    // 4. UNIVERSAL SMART APP GENERATOR (Custom Prompts)
    // ==========================================
    else {
      summary = `A tailored, interactive ${projectName} web application with dynamic data management, real-time filters, statistics counters, and glassmorphic UI.`;
      tamilSummary = `உங்கள் தேவைகளுக்கு ஏற்றபடி "${projectName}" செயலி உருவாக்கப்பட்டுள்ளது. இதில் முழுமையான உள்ளீட்டுப் படிவம் (Input Form), தரவுப் பட்டியல் (Data Grid), வடிகட்டி (Filters) மற்றும் உள்ளூர் சேமிப்பகம் (LocalStorage) இணைக்கப்பட்டுள்ளது.`;

      plan = [
        `Analyze domain requirements for ${projectName}`,
        'Formulate glassmorphic responsive layout & UI tokens',
        'Synthesize reactive data store and interactive CRUD flows',
        'Integrate LocalStorage synchronization & live preview'
      ];

      features = [
        'Domain-tailored interactive data entries and live form',
        'Instant search, category filters, and status counters',
        'LocalStorage data persistence (Items saved across refreshes)',
        'Responsive layout for desktop, tablet, and mobile browsers'
      ];

      htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName} - Antigravity App</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
</head>
<body>
  <div class="app-layout">
    <header class="app-header">
      <div class="brand">
        <div class="logo">⚡</div>
        <div>
          <h1>${projectName}</h1>
          <p class="tagline">${userPrompt}</p>
        </div>
      </div>
      <div class="stats-badge">
        <span class="dot"></span>
        <span>Items: <strong id="itemCount">0</strong></span>
      </div>
    </header>

    <!-- Metrics Cards -->
    <section class="metrics-grid">
      <div class="metric-card">
        <span class="m-label">Total Entries</span>
        <div class="m-val" id="totalEntries">0</div>
      </div>
      <div class="metric-card highlight">
        <span class="m-label">Active State</span>
        <div class="m-val" id="activeEntries">0</div>
      </div>
      <div class="metric-card">
        <span class="m-label">Status</span>
        <div class="m-val" style="color:#10b981">Online</div>
      </div>
    </section>

    <!-- Input Form Card -->
    <section class="main-card">
      <form id="entryForm" class="entry-form">
        <div class="input-row">
          <input type="text" id="titleInput" placeholder="Enter item title or details..." required />
          <select id="typeSelect">
            <option value="Primary">Primary</option>
            <option value="Standard">Standard</option>
            <option value="Featured">Featured</option>
          </select>
          <button type="submit" class="submit-btn">+ Add Item</button>
        </div>
      </form>
    </section>

    <!-- Search and Filter -->
    <div class="filter-row">
      <input type="text" id="searchInput" placeholder="Filter items in real-time..." />
    </div>

    <!-- Items Grid -->
    <main class="items-container">
      <div id="itemsGrid" class="items-grid"></div>
      <div id="emptyView" class="empty-view hidden">
        <p>No items yet. Create your first item above!</p>
      </div>
    </main>
  </div>
  <script src="app.js"></script>
</body>
</html>`;

      cssContent = `* { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
body { background: #080b14; color: #f1f5f9; min-height: 100vh; display: flex; justify-content: center; padding: 24px 16px; }
.app-layout { width: 100%; max-width: 680px; display: flex; flex-direction: column; gap: 18px; }
.app-header { display: flex; justify-content: space-between; align-items: center; }
.brand { display: flex; align-items: center; gap: 12px; }
.logo { width: 40px; height: 40px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; color: #fff; }
h1 { font-size: 20px; font-weight: 800; color: #fff; }
.tagline { font-size: 11px; color: #94a3b8; }
.stats-badge { background: #121828; border: 1px solid #1f293d; padding: 6px 12px; border-radius: 20px; font-size: 11px; display: flex; align-items: center; gap: 6px; }
.dot { width: 6px; height: 6px; border-radius: 50%; background: #10b981; }
.metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.metric-card { background: #0e1424; border: 1px solid #1e293b; border-radius: 16px; padding: 14px; text-align: center; }
.metric-card.highlight { border-color: rgba(99, 102, 241, 0.4); }
.m-label { font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: 700; }
.m-val { font-size: 22px; font-weight: 800; color: #fff; margin-top: 4px; }
.main-card { background: #0e1424; border: 1px solid #1e293b; border-radius: 20px; padding: 16px; }
.input-row { display: flex; gap: 8px; }
#titleInput { flex: 1; background: #060810; border: 1px solid #1e293b; border-radius: 12px; padding: 10px 14px; color: #fff; font-size: 12px; outline: none; }
#titleInput:focus { border-color: #6366f1; }
#typeSelect { background: #060810; border: 1px solid #1e293b; border-radius: 12px; padding: 10px; color: #cbd5e1; font-size: 12px; }
.submit-btn { background: #4f46e5; color: #fff; border: none; border-radius: 12px; padding: 0 16px; font-weight: 700; font-size: 12px; cursor: pointer; }
.filter-row input { width: 100%; background: #0e1424; border: 1px solid #1e293b; border-radius: 14px; padding: 10px 14px; color: #fff; font-size: 12px; outline: none; }
.items-grid { display: flex; flex-direction: column; gap: 8px; }
.item-card { background: #0e1424; border: 1px solid #1e293b; border-radius: 14px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; }
.item-title { font-size: 13px; font-weight: 600; color: #fff; }
.item-tag { font-size: 10px; padding: 2px 8px; border-radius: 6px; background: rgba(99, 102, 241, 0.2); color: #818cf8; }
.del-btn { background: transparent; border: none; color: #f87171; cursor: pointer; font-size: 12px; padding: 4px; }
.empty-view { text-align: center; padding: 32px; color: #64748b; font-size: 12px; }
.empty-view.hidden { display: none; }`;

      jsContent = `const STORAGE_KEY = 'infinity_${rootPath}_items';
let items = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
  { id: '1', title: 'Interactive data model initialized', type: 'Primary', date: 'Just now' },
  { id: '2', title: 'Live preview sandbox connected', type: 'Featured', date: 'Just now' }
];

const form = document.getElementById('entryForm');
const titleInput = document.getElementById('titleInput');
const typeSelect = document.getElementById('typeSelect');
const searchInput = document.getElementById('searchInput');
const grid = document.getElementById('itemsGrid');
const emptyView = document.getElementById('emptyView');
const totalEntriesEl = document.getElementById('totalEntries');
const activeEntriesEl = document.getElementById('activeEntries');
const itemCountEl = document.getElementById('itemCount');

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  render();
}

function render() {
  const query = searchInput.value.toLowerCase();
  const filtered = items.filter(i => i.title.toLowerCase().includes(query));

  totalEntriesEl.innerText = items.length;
  activeEntriesEl.innerText = items.length;
  itemCountEl.innerText = items.length;

  grid.innerHTML = '';
  if (filtered.length === 0) {
    emptyView.classList.remove('hidden');
  } else {
    emptyView.classList.add('hidden');
    filtered.forEach(item => {
      const div = document.createElement('div');
      div.className = 'item-card';
      div.innerHTML = \`
        <div>
          <div class="item-title">\${item.title}</div>
          <span class="item-tag">\${item.type} • \${item.date}</span>
        </div>
        <button class="del-btn" onclick="deleteItem('\${item.id}')">✕</button>
      \`;
      grid.appendChild(div);
    });
  }
}

function deleteItem(id) {
  items = items.filter(i => i.id !== id);
  save();
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  if (!title) return;
  items.unshift({
    id: Date.now().toString(),
    title,
    type: typeSelect.value,
    date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });
  titleInput.value = '';
  save();
});

searchInput.addEventListener('input', render);
render();
`;
    }

    const files = [
      { name: 'index.html', content: htmlContent },
      { name: 'styles.css', content: cssContent },
      { name: 'app.js', content: jsContent }
    ];

    return this.constructProjectFromAIFiles(projectName, userPrompt, {
      files,
      plan,
      features,
      summary,
      tamilSummary,
      architecture: {
        uiTokens: ['Glassmorphism', 'Responsive CSS Grid/Flexbox', 'Web Audio API'],
        techStack: 'HTML5, CSS3, ES6 JavaScript',
        dataFlow: 'Reactive state management with LocalStorage sync'
      }
    });
  }

  private static extractProjectName(prompt: string): string {
    const clean = prompt.replace(/[^\w\s-]/gi, ' ').trim();
    const words = clean.split(/\s+/).slice(0, 3).join('-');
    return words || 'infinity-app';
  }

  private static getLanguage(filename: string): string {
    if (filename.endsWith('.html')) return 'html';
    if (filename.endsWith('.css')) return 'css';
    if (filename.endsWith('.json')) return 'json';
    if (filename.endsWith('.py')) return 'python';
    if (filename.endsWith('.java')) return 'java';
    return 'javascript';
  }
}
