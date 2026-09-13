import { TutorTopic } from '../types';

export const learningTopics: TutorTopic[] = [
  {
    id: 'recursion',
    title: 'Recursion',
    subtitle: 'A function that calls itself to solve smaller instances of a problem',
    category: 'Algorithms & Data Structures',
    difficulty: 'Intermediate',
    explanation: `Recursion is a programming technique where a function solves a problem by breaking it down into smaller, self-similar subproblems and calling itself. 

Every valid recursive algorithm consists of two fundamental components:
1. **Base Case**: The termination condition that returns a direct result without making further recursive calls, preventing infinite loops and stack overflow.
2. **Recursive Step**: The progression rule that modifies the inputs towards the base case and invokes the function again.

### The Call Stack
Each recursive call allocates a new stack frame in memory storing its local variables and return address. Once the base case is reached, the stack frames resolve in reverse order (LIFO - Last In, First Out).`,
    codeExample: {
      language: 'typescript',
      code: `// Classic Recursive Factorial
function factorial(n: number): number {
  // 1. Base Case: factorial of 0 or 1 is 1
  if (n <= 1) {
    return 1;
  }
  
  // 2. Recursive Step: n * factorial(n - 1)
  return n * factorial(n - 1);
}

console.log(factorial(4)); // Output: 24`
    },
    practiceTask: {
      description: 'Write a recursive function `fibonacci(n)` that returns the n-th Fibonacci number where `fib(0) = 0`, `fib(1) = 1`, and `fib(n) = fib(n-1) + fib(n-2)`.',
      starterCode: `function fibonacci(n: number): number {\n  // TODO: Add your base cases and recursive call here\n  \n  return 0;\n}`,
      solutionCode: `function fibonacci(n: number): number {\n  if (n <= 0) return 0;\n  if (n === 1) return 1;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}`,
      hints: [
        'Identify your two base cases: when n is 0 and when n is 1.',
        'For any n > 1, sum the results of fibonacci(n - 1) and fibonacci(n - 2).'
      ]
    },
    quiz: [
      {
        question: 'What happens if a recursive function does not define a valid base case?',
        options: [
          'It compiles with a warning and returns undefined',
          'It runs infinitely until a Stack Overflow error occurs',
          'The compiler automatically inserts a return 0',
          'It executes in constant O(1) time'
        ],
        correctIndex: 1,
        explanation: 'Without a base case, recursive calls continue allocating new stack frames until the system execution call stack limit is exceeded, throwing a RangeError: Maximum call stack size exceeded.'
      },
      {
        question: 'What is the time complexity of a naive recursive Fibonacci calculation fib(n)?',
        options: [
          'O(N)',
          'O(N log N)',
          'O(2^N)',
          'O(1)'
        ],
        correctIndex: 2,
        explanation: 'Each call branches into two recursive calls, creating a binary recursion tree of depth N, yielding O(2^N) exponential time complexity unless memoized.'
      }
    ],
    visualizerSteps: [
      {
        stepTitle: 'Initial Invocation: factorial(4)',
        callStack: ['factorial(4)'],
        variables: { n: 4, action: 'Calls factorial(3)' },
        explanation: 'factorial(4) checks n <= 1 (false). Computes 4 * factorial(3).'
      },
      {
        stepTitle: 'Second Frame: factorial(3)',
        callStack: ['factorial(4)', 'factorial(3)'],
        variables: { n: 3, action: 'Calls factorial(2)' },
        explanation: 'factorial(3) pushed onto stack. Computes 3 * factorial(2).'
      },
      {
        stepTitle: 'Third Frame: factorial(2)',
        callStack: ['factorial(4)', 'factorial(3)', 'factorial(2)'],
        variables: { n: 2, action: 'Calls factorial(1)' },
        explanation: 'factorial(2) pushed onto stack. Computes 2 * factorial(1).'
      },
      {
        stepTitle: 'Base Case Reached: factorial(1)',
        callStack: ['factorial(4)', 'factorial(3)', 'factorial(2)', 'factorial(1)'],
        variables: { n: 1, action: 'Returns 1 (Base Case)' },
        explanation: 'Base case satisfied: returns 1 immediately.'
      },
      {
        stepTitle: 'Unwinding Stack: factorial(2) resolves',
        callStack: ['factorial(4)', 'factorial(3)', 'factorial(2) -> 2'],
        variables: { result: '2 * 1 = 2' },
        explanation: 'factorial(2) multiplies 2 * 1 = 2 and pops off the stack.'
      },
      {
        stepTitle: 'Unwinding Stack: factorial(3) resolves',
        callStack: ['factorial(4)', 'factorial(3) -> 6'],
        variables: { result: '3 * 2 = 6' },
        explanation: 'factorial(3) multiplies 3 * 2 = 6 and pops off the stack.'
      },
      {
        stepTitle: 'Final Resolution: factorial(4) = 24',
        callStack: ['factorial(4) -> 24'],
        variables: { finalResult: 24 },
        explanation: 'factorial(4) multiplies 4 * 6 = 24. Computation complete!'
      }
    ]
  },
  {
    id: 'react-state',
    title: 'React State & Hooks',
    subtitle: 'Managing reactive component state with useState & useEffect',
    category: 'Frontend Engineering',
    difficulty: 'Beginner',
    explanation: `State represents data that changes over time in a React application. When state updates, React re-renders the component and updates the DOM efficiently.

Key Rules of Hooks:
1. Only call Hooks at the top level of your component.
2. Only call Hooks from React function components or custom Hooks.`,
    codeExample: {
      language: 'typescript',
      code: `import { useState, useEffect } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = \`Count: \${count}\`;
  }, [count]);

  return (
    <button onClick={() => setCount(prev => prev + 1)}>
      Clicked {count} times
    </button>
  );
}`
    },
    practiceTask: {
      description: 'Create a simple toggle switch hook that alternates between true and false.',
      starterCode: `function useToggle(initialValue = false) {\n  // TODO: implement toggle\n}`,
      solutionCode: `function useToggle(initialValue = false) {\n  const [state, setState] = useState(initialValue);\n  const toggle = () => setState(prev => !prev);\n  return [state, toggle] as const;\n}`,
      hints: ['Use useState with functional updater prev => !prev.']
    },
    quiz: [
      {
        question: 'Why should you never mutate state directly in React (e.g. state.count = 5)?',
        options: [
          'It causes a TypeScript compile error',
          'React will not know the state changed and won’t trigger a re-render',
          'It deletes the component from memory',
          'It breaks CSS animations'
        ],
        correctIndex: 1,
        explanation: 'React relies on immutable updates and reference equality comparison to detect changes and trigger UI reconciliation.'
      }
    ]
  },
  {
    id: 'supabase-auth',
    title: 'Supabase & Database Relations',
    subtitle: 'PostgreSQL row level security, foreign keys, and authentication',
    category: 'Backend & Database',
    difficulty: 'Intermediate',
    explanation: `Supabase provides an instant PostgreSQL backend with built-in JWT authentication, Row Level Security (RLS), and real-time WebSocket subscriptions.`,
    codeExample: {
      language: 'sql',
      code: `-- Create authenticated profiles table\ncreate table public.profiles (\n  id uuid references auth.users not null primary key,\n  username text unique,\n  full_name text,\n  avatar_url text,\n  created_at timestamp with time zone default timezone('utc'::text, now())\n);\n\n-- Enable Row Level Security (RLS)\nalter table public.profiles enable row level security;\n\ncreate policy "Public profiles are viewable by everyone."\n  on profiles for select using (true);\n\ncreate policy "Users can update own profile."\n  on profiles for update using (auth.uid() = id);`
    },
    practiceTask: {
      description: 'Write an SQL query to select all students who have enrolled in more than 3 courses.',
      starterCode: `-- Write SQL query here\nSELECT ...`,
      solutionCode: `SELECT student_id, COUNT(course_id) as enrolled_count\nFROM course_enrollments\nGROUP BY student_id\nHAVING COUNT(course_id) > 3;`,
      hints: ['Use GROUP BY student_id with HAVING COUNT(course_id) > 3.']
    },
    quiz: [
      {
        question: 'What is the purpose of Row Level Security (RLS) in PostgreSQL?',
        options: [
          'To encrypt database hard drives',
          'To restrict which database rows a user can query or modify based on security policies',
          'To speed up index lookup speeds',
          'To compress table row storage'
        ],
        correctIndex: 1,
        explanation: 'RLS policies ensure that queries automatically apply security filtering per-row based on the authenticated user context (auth.uid()).'
      }
    ]
  }
];
