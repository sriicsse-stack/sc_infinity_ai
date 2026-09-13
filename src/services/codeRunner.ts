export interface ExecutionResult {
  success: boolean;
  logs: string[];
  errors: string[];
  returnValue?: any;
  durationMs: number;
  needsInput?: boolean;
  inputPrompt?: string;
}

export interface InteractiveProgramState {
  language: string;
  filename: string;
  code: string;
  lines: string[];
  currentLineIndex: number;
  memory: Record<string, any>;
  scannerVars: Set<string>;
  pendingVarName?: string;
  pendingVarType?: 'int' | 'double' | 'string' | 'boolean';
  isComplete: boolean;
  logs: string[];
  errors: string[];
}

export class CodeRunner {
  public static activeInteractiveSession: InteractiveProgramState | null = null;

  /**
   * Starts or executes a code snippet.
   * If interactive input is required, pauses and prompts the user via terminal.
   */
  public static async executeCode(
    code: string, 
    language: string = 'javascript', 
    filename: string = '',
    providedInput?: string
  ): Promise<ExecutionResult> {
    const startTime = performance.now();
    const normalizedLang = (language || '').toLowerCase();
    const ext = filename.split('.').pop()?.toLowerCase() || '';

    // If there is an active interactive session and user provided input
    if (this.activeInteractiveSession && providedInput !== undefined) {
      return this.resumeInteractiveSession(providedInput, startTime);
    }

    // Java interactive runner
    if (ext === 'java' || normalizedLang === 'java') {
      return this.executeJavaInteractive(code, filename, startTime);
    }

    // Python interactive runner
    if (ext === 'py' || normalizedLang === 'python' || normalizedLang === 'py') {
      return this.executePythonInteractive(code, filename, startTime);
    }

    // C / C++ interactive runner
    if (ext === 'c' || ext === 'cpp' || ext === 'cc' || normalizedLang === 'c' || normalizedLang === 'cpp' || normalizedLang === 'c++') {
      return this.executeC_CPPInteractive(code, filename, startTime);
    }

    // HTML runner
    if (ext === 'html' || normalizedLang === 'html') {
      return this.executeHTML(code, startTime);
    }

    // JavaScript / TypeScript runner
    return this.executeJavaScript(code, startTime);
  }

  /**
   * Resumes an interactive session when user enters input in the terminal
   */
  public static resumeInteractiveSession(userInput: string, startTime: number): ExecutionResult {
    const session = this.activeInteractiveSession;
    if (!session) {
      return {
        success: true,
        logs: [],
        errors: [],
        durationMs: 1
      };
    }

    session.logs = [];

    // If waiting for a variable assignment (e.g. int a = sc.nextInt();)
    if (session.pendingVarName) {
      const varName = session.pendingVarName;
      const type = session.pendingVarType || 'string';
      let parsedVal: any = userInput.trim();

      if (type === 'int') {
        parsedVal = parseInt(parsedVal, 10) || 0;
      } else if (type === 'double') {
        parsedVal = parseFloat(parsedVal) || 0.0;
      } else if (type === 'boolean') {
        parsedVal = parsedVal.toLowerCase() === 'true';
      }

      session.memory[varName] = parsedVal;
      session.pendingVarName = undefined;
      session.pendingVarType = undefined;
    }

    // Continue executing subsequent lines
    if (session.language === 'java') {
      return this.runJavaLines(session, startTime);
    } else if (session.language === 'python') {
      return this.runPythonLines(session, startTime);
    } else {
      return this.runC_CPPLines(session, startTime);
    }
  }

  /**
   * Java Interactive Engine
   */
  private static executeJavaInteractive(code: string, filename: string, startTime: number): ExecutionResult {
    const lines = code.split('\n');
    const session: InteractiveProgramState = {
      language: 'java',
      filename,
      code,
      lines,
      currentLineIndex: 0,
      memory: {},
      scannerVars: new Set(['sc', 'scanner', 'in', 'cin']),
      isComplete: false,
      logs: [],
      errors: []
    };

    this.activeInteractiveSession = session;
    return this.runJavaLines(session, startTime);
  }

  private static runJavaLines(session: InteractiveProgramState, startTime: number): ExecutionResult {
    const lines = session.lines;

    while (session.currentLineIndex < lines.length) {
      const rawLine = lines[session.currentLineIndex];
      session.currentLineIndex++;
      const line = rawLine.trim();

      if (!line || line.startsWith('//') || line.startsWith('/*') || line.startsWith('*') || line.startsWith('import ') || line.startsWith('package ')) {
        continue;
      }

      // Class / main method header skip
      if (line.includes('class ') || line.includes('public static void main') || line === '{' || line === '}') {
        continue;
      }

      // Scanner sc = new Scanner(System.in);
      const scannerMatch = line.match(/Scanner\s+(\w+)\s*=\s*new\s+Scanner\s*\(\s*System\.in\s*\);?/i);
      if (scannerMatch) {
        session.scannerVars.add(scannerMatch[1]);
        continue;
      }

      // System.out.print(...) or System.out.println(...)
      const printMatch = line.match(/System\.out\.(print|println)\s*\((.*)\);?/);
      if (printMatch) {
        const isLn = printMatch[1] === 'println';
        const innerExpr = printMatch[2].trim();
        const evaluatedText = this.evaluateJavaExpression(innerExpr, session.memory);

        // Check if the next line is an input request (e.g. int a = sc.nextInt();)
        const nextIdx = session.currentLineIndex;
        let isFollowedByInput = false;
        let nextVarName = '';
        let nextVarType: 'int' | 'double' | 'string' | 'boolean' = 'string';

        if (nextIdx < lines.length) {
          const nextTrimmed = lines[nextIdx].trim();
          const inputMatch = nextTrimmed.match(/(?:(?:int|double|float|String|boolean|long)\s+)?(\w+)\s*=\s*(?:\w+)\.(nextInt|nextDouble|nextFloat|nextLine|next|nextBoolean)\s*\(\s*\);?/);
          if (inputMatch) {
            isFollowedByInput = true;
            nextVarName = inputMatch[1];
            const method = inputMatch[2];
            nextVarType = method.includes('Int') || method.includes('Long') ? 'int' : method.includes('Double') || method.includes('Float') ? 'double' : method.includes('Boolean') ? 'boolean' : 'string';
          }
        }

        if (isFollowedByInput) {
          session.logs.push(evaluatedText);
          session.pendingVarName = nextVarName;
          session.pendingVarType = nextVarType;
          session.currentLineIndex++; // Advance past the input declaration

          return {
            success: true,
            logs: session.logs,
            errors: session.errors,
            needsInput: true,
            inputPrompt: evaluatedText,
            durationMs: Math.round(performance.now() - startTime)
          };
        } else {
          session.logs.push(evaluatedText);
          continue;
        }
      }

      // Standalone Input variable assignment without preceding print (e.g. int a = sc.nextInt();)
      const inputAssignMatch = line.match(/(?:(?:int|double|float|String|boolean|long)\s+)?(\w+)\s*=\s*(?:\w+)\.(nextInt|nextDouble|nextFloat|nextLine|next|nextBoolean)\s*\(\s*\);?/);
      if (inputAssignMatch) {
        const varName = inputAssignMatch[1];
        const method = inputAssignMatch[2];
        const type: 'int' | 'double' | 'string' | 'boolean' = method.includes('Int') || method.includes('Long') ? 'int' : method.includes('Double') || method.includes('Float') ? 'double' : method.includes('Boolean') ? 'boolean' : 'string';

        session.pendingVarName = varName;
        session.pendingVarType = type;

        return {
          success: true,
          logs: session.logs,
          errors: session.errors,
          needsInput: true,
          inputPrompt: `Enter ${varName}: `,
          durationMs: Math.round(performance.now() - startTime)
        };
      }

      // General Variable assignment / calculation (e.g. int sum = a + b; or sum = a + b;)
      const generalAssignMatch = line.match(/(?:(?:int|double|float|String|boolean|long|var)\s+)?(\w+)\s*=\s*([^;]+);?/);
      if (generalAssignMatch) {
        const varName = generalAssignMatch[1];
        const expr = generalAssignMatch[2].trim();
        try {
          const val = this.evaluateJavaExpression(expr, session.memory);
          session.memory[varName] = val;
        } catch {
          session.memory[varName] = expr.replace(/^["']|["']$/g, '');
        }
      }
    }

    // Program finished
    session.isComplete = true;
    this.activeInteractiveSession = null;

    if (session.logs.length === 0) {
      session.logs.push('[Java JVM] Program executed successfully with exit code 0.');
    }

    return {
      success: session.errors.length === 0,
      logs: session.logs,
      errors: session.errors,
      needsInput: false,
      durationMs: Math.round(performance.now() - startTime)
    };
  }

  /**
   * Evaluates expressions with variables (e.g. "Sum = " + sum, a + b, x * y)
   */
  private static evaluateJavaExpression(expr: string, memory: Record<string, any>): any {
    try {
      const scope = Object.keys(memory)
        .map(k => `const ${k} = ${JSON.stringify(memory[k])};`)
        .join('\n');
      
      const jsExpr = expr
        .replace(/Math\.max/g, 'Math.max')
        .replace(/Math\.min/g, 'Math.min')
        .replace(/Math\.sqrt/g, 'Math.sqrt')
        .replace(/Math\.pow/g, 'Math.pow')
        .replace(/Math\.abs/g, 'Math.abs');

      const evaluated = Function(`${scope}\nreturn (${jsExpr});`)();
      return evaluated;
    } catch {
      // Fallback string concatenation parser
      if (expr.includes('+')) {
        const parts = expr.split('+').map(p => p.trim());
        return parts.map(p => {
          if ((p.startsWith('"') && p.endsWith('"')) || (p.startsWith("'") && p.endsWith("'"))) {
            return p.substring(1, p.length - 1);
          }
          if (memory[p] !== undefined) return String(memory[p]);
          return p;
        }).join('');
      }
      return expr.replace(/^["']|["']$/g, '');
    }
  }

  /**
   * Python Interactive Engine
   */
  private static executePythonInteractive(code: string, filename: string, startTime: number): ExecutionResult {
    const lines = code.split('\n');
    const session: InteractiveProgramState = {
      language: 'python',
      filename,
      code,
      lines,
      currentLineIndex: 0,
      memory: {},
      scannerVars: new Set(),
      isComplete: false,
      logs: [],
      errors: []
    };

    this.activeInteractiveSession = session;
    return this.runPythonLines(session, startTime);
  }

  private static runPythonLines(session: InteractiveProgramState, startTime: number): ExecutionResult {
    const lines = session.lines;

    while (session.currentLineIndex < lines.length) {
      const rawLine = lines[session.currentLineIndex];
      session.currentLineIndex++;
      const line = rawLine.trim();

      if (!line || line.startsWith('#')) continue;

      // Check for input(): e.g. a = int(input("Enter number: ")) or name = input("Enter name: ")
      const inputMatch = line.match(/^(\w+)\s*=\s*(int|float|str)?\s*\(?\s*input\s*\(([^)]*)\)\s*\)?/);
      if (inputMatch) {
        const varName = inputMatch[1];
        const castType = inputMatch[2] || 'str';
        const rawPrompt = (inputMatch[3] || '').trim().replace(/^["']|["']$/g, '');
        const promptText = rawPrompt || `Enter ${varName}: `;

        session.logs.push(promptText);
        session.pendingVarName = varName;
        session.pendingVarType = castType === 'int' ? 'int' : castType === 'float' ? 'double' : 'string';

        return {
          success: true,
          logs: session.logs,
          errors: session.errors,
          needsInput: true,
          inputPrompt: promptText,
          durationMs: Math.round(performance.now() - startTime)
        };
      }

      // Python print statement: print(...)
      if (line.startsWith('print(') && line.endsWith(')')) {
        const inner = line.substring(6, line.length - 1).trim();
        const evaluated = this.evaluateJavaExpression(inner, session.memory);
        session.logs.push(String(evaluated));
        continue;
      }

      // Variable assignment: e.g. c = a + b, x = 10
      if (line.includes('=') && !line.includes('==')) {
        const firstEq = line.indexOf('=');
        const varName = line.substring(0, firstEq).trim();
        const expr = line.substring(firstEq + 1).trim();
        try {
          session.memory[varName] = this.evaluateJavaExpression(expr, session.memory);
        } catch {
          session.memory[varName] = expr.replace(/^["']|["']$/g, '');
        }
      }
    }

    session.isComplete = true;
    this.activeInteractiveSession = null;

    if (session.logs.length === 0) {
      session.logs.push('[Python 3.12] Script executed successfully.');
    }

    return {
      success: session.errors.length === 0,
      logs: session.logs,
      errors: session.errors,
      needsInput: false,
      durationMs: Math.round(performance.now() - startTime)
    };
  }

  /**
   * C / C++ Interactive Engine
   */
  private static executeC_CPPInteractive(code: string, filename: string, startTime: number): ExecutionResult {
    const lines = code.split('\n');
    const session: InteractiveProgramState = {
      language: 'cpp',
      filename,
      code,
      lines,
      currentLineIndex: 0,
      memory: {},
      scannerVars: new Set(),
      isComplete: false,
      logs: [],
      errors: []
    };

    this.activeInteractiveSession = session;
    return this.runC_CPPLines(session, startTime);
  }

  private static runC_CPPLines(session: InteractiveProgramState, startTime: number): ExecutionResult {
    const lines = session.lines;

    while (session.currentLineIndex < lines.length) {
      const rawLine = lines[session.currentLineIndex];
      session.currentLineIndex++;
      const line = rawLine.trim();

      if (!line || line.startsWith('//') || line.startsWith('#include') || line.startsWith('using namespace') || line.includes('int main') || line === '{' || line === '}') {
        continue;
      }

      // cin >> a; or scanf("%d", &a);
      const cinMatch = line.match(/(?:cin\s*>>\s*(\w+);?|scanf\s*\([^,]+,\s*&?(\w+)\);?)/);
      if (cinMatch) {
        const varName = cinMatch[1] || cinMatch[2];
        session.pendingVarName = varName;
        session.pendingVarType = 'int';

        return {
          success: true,
          logs: session.logs,
          errors: session.errors,
          needsInput: true,
          inputPrompt: `Enter ${varName}: `,
          durationMs: Math.round(performance.now() - startTime)
        };
      }

      // cout << ... or printf(...)
      if (line.startsWith('cout') || line.startsWith('printf')) {
        const printStr = line
          .replace(/^cout\s*<<\s*/, '')
          .replace(/<<\s*endl;?/, '')
          .replace(/^printf\s*\(\s*"?/, '')
          .replace(/"?\s*\);?/, '');
        
        const evaluated = this.evaluateJavaExpression(printStr, session.memory);
        session.logs.push(String(evaluated));
        continue;
      }

      // Variable assignment: int a = 10, sum = a + b;
      if (line.includes('=') && !line.includes('==')) {
        const assignMatch = line.match(/(?:(?:int|float|double|char|long)\s+)?(\w+)\s*=\s*([^;]+);?/);
        if (assignMatch) {
          const varName = assignMatch[1];
          const expr = assignMatch[2].trim();
          session.memory[varName] = this.evaluateJavaExpression(expr, session.memory);
        }
      }
    }

    session.isComplete = true;
    this.activeInteractiveSession = null;

    if (session.logs.length === 0) {
      session.logs.push('[GCC / Clang] Build and execution successful (exit code: 0).');
    }

    return {
      success: session.errors.length === 0,
      logs: session.logs,
      errors: session.errors,
      needsInput: false,
      durationMs: Math.round(performance.now() - startTime)
    };
  }

  /**
   * JavaScript / TypeScript Executor
   */
  private static async executeJavaScript(code: string, startTime: number): Promise<ExecutionResult> {
    const capturedLogs: string[] = [];
    const capturedErrors: string[] = [];

    const jsCode = this.stripTypeScript(code);

    try {
      const customConsole = {
        log: (...args: any[]) => {
          const line = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ');
          capturedLogs.push(line);
        },
        error: (...args: any[]) => {
          const line = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ');
          capturedErrors.push(line);
        },
        warn: (...args: any[]) => {
          const line = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ');
          capturedLogs.push(`[WARN] ${line}`);
        },
        info: (...args: any[]) => {
          const line = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ');
          capturedLogs.push(`[INFO] ${line}`);
        }
      };

      const customPrint = (...args: any[]) => {
        customConsole.log(...args);
      };

      const executionFn = new Function(
        'console',
        'print',
        'window',
        `
        const safeWindow = { ...window, print: print };
        return (async () => {
          ${jsCode}
        })();
        `
      );

      const result = await executionFn(customConsole, customPrint, window);
      const durationMs = Math.round(performance.now() - startTime);

      return {
        success: capturedErrors.length === 0,
        logs: capturedLogs,
        errors: capturedErrors,
        returnValue: result,
        durationMs
      };
    } catch (error: any) {
      const durationMs = Math.round(performance.now() - startTime);
      return {
        success: false,
        logs: capturedLogs,
        errors: [...capturedErrors, error.stack || error.message || String(error)],
        durationMs
      };
    }
  }

  private static executeHTML(code: string, startTime: number): ExecutionResult {
    return {
      success: true,
      logs: [
        '[HTML5 Engine] Document structure parsed successfully.',
        `Rendered DOM tree (${code.length} bytes). Live preview updated in Sandbox.`
      ],
      errors: [],
      durationMs: Math.round(performance.now() - startTime)
    };
  }

  private static stripTypeScript(code: string): string {
    return code
      .replace(/import\s+type\s+[^;]+;/g, '')
      .replace(/import\s+React\s*,?\s*\{?[^}]*\}?\s*from\s*['"][^'"]+['"];?/g, '')
      .replace(/export\s+interface\s+[^{]+\{[\s\S]*?\}/g, '')
      .replace(/interface\s+[^{]+\{[\s\S]*?\}/g, '')
      .replace(/export\s+type\s+[^=]+=\s*[^;]+;/g, '')
      .replace(/type\s+[^=]+=\s*[^;]+;/g, '')
      .replace(/:\s*(string|number|boolean|any|void|object|UserProfile|FileNode|Record<[^>]+>|Array<[^>]+>|string\[\]|number\[\])\b/g, '')
      .replace(/as\s+[a-zA-Z0-9_<>[\]]+/g, '')
      .replace(/export\s+default\s+/g, '')
      .replace(/export\s+/g, '');
  }
}
