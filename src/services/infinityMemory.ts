export interface ProjectMemoryItem {
  id: string;
  category: 'architecture' | 'convention' | 'preference' | 'schema' | 'decision';
  content: string;
  timestamp: string;
}

export class InfinityMemory {
  private static STORAGE_KEY_PREFIX = 'infinity_memory_';

  public static getMemory(projectName: string): ProjectMemoryItem[] {
    const key = `${this.STORAGE_KEY_PREFIX}${projectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [
      {
        id: 'mem-1',
        category: 'architecture',
        content: 'Project utilizes reactive vanilla web standards with Monaco editor and in-browser sandboxing.',
        timestamp: new Date().toLocaleDateString()
      },
      {
        id: 'mem-2',
        category: 'convention',
        content: 'Use modern dark mode styling, responsive CSS flexbox/grid, and clean semantic elements.',
        timestamp: new Date().toLocaleDateString()
      }
    ];
  }

  public static addMemory(projectName: string, category: ProjectMemoryItem['category'], content: string): ProjectMemoryItem {
    const memories = this.getMemory(projectName);
    const newItem: ProjectMemoryItem = {
      id: `mem_${Date.now()}`,
      category,
      content,
      timestamp: new Date().toLocaleDateString()
    };
    memories.push(newItem);
    const key = `${this.STORAGE_KEY_PREFIX}${projectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    localStorage.setItem(key, JSON.stringify(memories));
    return newItem;
  }

  public static deleteMemory(projectName: string, id: string): void {
    const memories = this.getMemory(projectName).filter(m => m.id !== id);
    const key = `${this.STORAGE_KEY_PREFIX}${projectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    localStorage.setItem(key, JSON.stringify(memories));
  }

  public static getMemoryContextPrompt(projectName: string): string {
    const memories = this.getMemory(projectName);
    if (memories.length === 0) return '';
    return `\n[INFINITY PERMANENT PROJECT MEMORY]:\n` + memories.map(m => `- [${m.category.toUpperCase()}]: ${m.content}`).join('\n') + `\nAlways adhere strictly to these project conventions and past decisions.\n`;
  }
}
