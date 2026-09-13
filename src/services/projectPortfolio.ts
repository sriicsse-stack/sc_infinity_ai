import { FileNode, ProjectMeta } from '../types';

export interface PortfolioSummary {
  projectName: string;
  tagline: string;
  readmeMarkdown: string;
  resumeBulletPoints: string[];
  skillsExtracted: string[];
  interviewQuestions: { question: string; answer: string }[];
  portfolioHtmlSnippet: string;
}

export class ProjectPortfolioGenerator {
  public static generatePortfolio(currentProject: ProjectMeta, fileTree: FileNode): PortfolioSummary {
    const projName = currentProject.name || 'My Web Project';
    const tech = currentProject.technology || 'HTML5, CSS3, JavaScript, Monaco API';

    const resumeBulletPoints = [
      `Engineered ${projName}, a responsive web application utilizing ${tech} with 60FPS fluid UI interactions and modular architecture.`,
      `Implemented real-time state management, sandbox code execution, and Web Audio synthesis with zero external dependencies.`,
      `Integrated automated cloud deployment pipeline and full GitHub version control workflows.`
    ];

    const skillsExtracted = [
      'JavaScript / TypeScript',
      'HTML5 & Modern CSS3',
      'Web APIs & Canvas Rendering',
      'UI/UX Design & Responsive Layouts',
      'Git Version Control & CI/CD',
      'Realtime State Management'
    ];

    const interviewQuestions = [
      {
        question: `How is the architecture structured in ${projName}?`,
        answer: `The project follows a component-driven pattern with clear separation of DOM layout, CSS styles, and isolated event-driven application logic.`
      },
      {
        question: `How did you optimize performance and animations?`,
        answer: `By utilizing requestAnimationFrame for hardware-accelerated 60FPS loops, debouncing input listeners, and avoiding heavy synchronous DOM blocking.`
      },
      {
        question: `How is data persisted in this application?`,
        answer: `State is cached locally via localStorage for instant offline access and synced asynchronously to backend cloud storage.`
      }
    ];

    const readmeMarkdown = `# ⚡ ${projName}

> ${currentProject.tagline || 'Built with SC INFINITY AI Development Platform'}

## 🚀 Overview
${projName} is a high-performance, interactive application developed and tested within the SC INFINITY IDE ecosystem.

## 🛠️ Tech Stack
- **Frontend**: ${tech}
- **Styling**: Responsive Grid & Flexbox, Dark Mode Palette
- **Audio/Canvas**: HTML5 Canvas 2D & Web Audio API
- **Deployment**: Vercel Global Edge Network

## 🌟 Key Features
- ✨ 100% Responsive UI across Mobile, Tablet, and Desktop viewports.
- ⚡ 60FPS hardware-accelerated animations and game physics.
- 🛡️ Zero runtime errors with structured error sandboxing.
- 🌐 1-Click cloud deployment on Vercel.

## 💻 Getting Started
\`\`\`bash
# Open directly in SC INFINITY IDE or run locally
npm install
npm run dev
\`\`\`
`;

    const portfolioHtmlSnippet = `
<div class="project-card">
  <div class="project-badge">FEATURED PROJECT</div>
  <h3>${projName}</h3>
  <p>${currentProject.tagline || 'Interactive modern web application'}</p>
  <div class="tech-tags">
    ${skillsExtracted.slice(0, 4).map(s => `<span class="tag">${s}</span>`).join('')}
  </div>
</div>
`;

    return {
      projectName: projName,
      tagline: currentProject.tagline || 'Interactive Web Application',
      readmeMarkdown,
      resumeBulletPoints,
      skillsExtracted,
      interviewQuestions,
      portfolioHtmlSnippet
    };
  }
}
