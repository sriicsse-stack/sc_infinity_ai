import React, { useState } from 'react';
import { 
  Database, 
  Table, 
  Plus, 
  Sparkles, 
  Play, 
  Key, 
  Columns, 
  CheckCircle2,
  RefreshCw,
  Search,
  Flame,
  Globe
} from 'lucide-react';
import { DBTable } from '../../types';
import { useAI } from '../../context/AIContext';

export const DatabaseView: React.FC = () => {
  const { sendMessage } = useAI();
  const [dbProvider, setDbProvider] = useState<'firebase' | 'supabase'>('firebase');

  const firebaseNodes = [
    {
      name: 'users',
      description: 'Firebase Auth synced profiles',
      rowCount: 1420,
      columns: [
        { name: 'uid', type: 'string', isPrimary: true },
        { name: 'email', type: 'string' },
        { name: 'displayName', type: 'string' },
        { name: 'role', type: 'string' },
        { name: 'createdAt', type: 'timestamp' }
      ],
      data: [
        { uid: 'usr_firebase_99812', email: 'student@university.edu', displayName: 'Alex Rivera', role: 'student', createdAt: '2026-09-11' },
        { uid: 'usr_google_123', email: 'sophia.c@university.edu', displayName: 'Sophia Chen', role: 'student', createdAt: '2026-09-12' },
        { uid: 'usr_github_456', email: 'm.vance@university.edu', displayName: 'Marcus Vance', role: 'student', createdAt: '2026-09-13' }
      ]
    },
    {
      name: 'attendance_records',
      description: 'Realtime check-in events',
      rowCount: 8520,
      columns: [
        { name: 'id', type: 'string', isPrimary: true },
        { name: 'studentId', type: 'string' },
        { name: 'courseCode', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'timestamp', type: 'timestamp' }
      ],
      data: [
        { id: 'rec_101', studentId: 'usr_firebase_99812', courseCode: 'CS 301', status: 'present', timestamp: '2026-09-13 09:00:00' },
        { id: 'rec_102', studentId: 'usr_google_123', courseCode: 'CS 301', status: 'present', timestamp: '2026-09-13 09:01:22' }
      ]
    },
    {
      name: 'courses',
      description: 'Active departmental courses',
      rowCount: 48,
      columns: [
        { name: 'id', type: 'string', isPrimary: true },
        { name: 'code', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'credits', type: 'number' }
      ],
      data: [
        { id: 'c1', code: 'CS 301', name: 'Distributed Systems', credits: 4 },
        { id: 'c2', code: 'CS 340', name: 'Database Architecture', credits: 3 },
        { id: 'c3', code: 'CS 450', name: 'Deep Learning & AI', credits: 4 }
      ]
    }
  ];

  const supabaseTables: DBTable[] = [
    {
      name: 'students',
      description: 'PostgreSQL student profiles',
      rowCount: 1420,
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true },
        { name: 'full_name', type: 'varchar' },
        { name: 'email', type: 'varchar' },
        { name: 'gpa', type: 'numeric' as any },
        { name: 'enrolled_at', type: 'timestamp' }
      ],
      data: [
        { id: '1a98e', full_name: 'Alex Rivera', email: 'student@university.edu', gpa: 3.88, enrolled_at: '2024-08-15' },
        { id: '2b73f', full_name: 'Sophia Chen', email: 'sophia.c@university.edu', gpa: 3.95, enrolled_at: '2024-08-15' }
      ]
    }
  ];

  const activeTables = dbProvider === 'firebase' ? firebaseNodes : supabaseTables;
  const [activeTableName, setActiveTableName] = useState<string>(activeTables[0].name);
  const [queryVal, setQueryVal] = useState<string>(
    dbProvider === 'firebase' 
      ? 'ref(database, "users").orderByChild("role").equalTo("student")'
      : 'SELECT * FROM students WHERE gpa > 3.8 ORDER BY gpa DESC;'
  );
  const [queryResult, setQueryResult] = useState<string | null>(null);

  const activeTable = activeTables.find(t => t.name === activeTableName) || activeTables[0];

  const handleExecuteQuery = () => {
    if (dbProvider === 'firebase') {
      setQueryResult('Firebase Realtime Database: Query resolved 3 snapshots from https://scmain-b2cde-default-rtdb.asia-southeast1.firebasedatabase.app in 28ms.');
    } else {
      setQueryResult('Supabase PostgreSQL: Query executed successfully (2 rows returned in 14ms).');
    }
  };

  return (
    <div className="w-80 h-full bg-[#0a0d15] dark:bg-[#0a0d15] light:bg-slate-50 border-r border-[#1f293d] dark:border-[#1f293d] light:border-slate-200 flex flex-col text-xs overflow-y-auto p-4 space-y-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          {dbProvider === 'firebase' ? (
            <Flame className="w-4 h-4 text-amber-500" />
          ) : (
            <Database className="w-4 h-4 text-emerald-400" />
          )}
          <span className="font-bold text-sm text-white dark:text-white light:text-slate-900">
            {dbProvider === 'firebase' ? 'Firebase Realtime DB' : 'Supabase PostgreSQL'}
          </span>
        </div>
        <button
          onClick={() => sendMessage('Generate a database schema & migration script for my project.')}
          className="p-1 rounded text-slate-400 hover:text-white"
          title="AI Schema Generator"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        </button>
      </div>

      {/* Provider Selector */}
      <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-slate-800">
        <button
          onClick={() => {
            setDbProvider('firebase');
            setActiveTableName('users');
            setQueryVal('ref(database, "users").orderByChild("role").equalTo("student")');
          }}
          className={`py-1.5 rounded-lg font-medium text-center transition-all flex items-center justify-center space-x-1.5 ${
            dbProvider === 'firebase'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-xs'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Firebase</span>
        </button>

        <button
          onClick={() => {
            setDbProvider('supabase');
            setActiveTableName('students');
            setQueryVal('SELECT * FROM students WHERE gpa > 3.8 ORDER BY gpa DESC;');
          }}
          className={`py-1.5 rounded-lg font-medium text-center transition-all flex items-center justify-center space-x-1.5 ${
            dbProvider === 'supabase'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-xs'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Supabase</span>
        </button>
      </div>

      {/* Endpoint Info */}
      <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 font-mono text-[10px] text-slate-400 truncate flex items-center space-x-1.5">
        <Globe className="w-3 h-3 text-indigo-400 shrink-0" />
        <span className="truncate">
          {dbProvider === 'firebase' 
            ? 'https://scmain-b2cde-default-rtdb.asia-southeast1.firebasedatabase.app'
            : 'https://scmain-b2cde.supabase.co'}
        </span>
      </div>

      {/* Tables / Nodes List */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
          {dbProvider === 'firebase' ? 'Database Nodes' : 'Tables'}
        </span>
        <div className="space-y-1">
          {activeTables.map((t) => (
            <button
              key={t.name}
              onClick={() => setActiveTableName(t.name)}
              className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                activeTableName === t.name
                  ? dbProvider === 'firebase'
                    ? 'bg-amber-950/20 border-amber-500/40 text-amber-300 font-semibold'
                    : 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300 font-semibold'
                  : 'bg-[#0f1422] dark:bg-[#0f1422] light:bg-white border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <Table className={`w-3.5 h-3.5 ${dbProvider === 'firebase' ? 'text-amber-400' : 'text-emerald-400'} shrink-0`} />
                <span className="truncate">{t.name}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">{t.rowCount} {dbProvider === 'firebase' ? 'nodes' : 'rows'}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Schema / Fields Preview */}
      <div className="p-3 rounded-2xl bg-[#0f1422] dark:bg-[#0f1422] light:bg-white border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs text-white dark:text-white light:text-slate-900 flex items-center space-x-1.5">
            <Columns className="w-3.5 h-3.5 text-indigo-400" />
            <span>Structure: /{activeTable.name}</span>
          </span>
        </div>
        <div className="space-y-1 font-mono text-[11px]">
          {activeTable.columns.map((col: any) => (
            <div key={col.name} className="flex items-center justify-between p-1.5 rounded bg-slate-900/60 border border-slate-800/80">
              <div className="flex items-center space-x-1.5">
                {col.isPrimary && <Key className="w-3 h-3 text-amber-400" />}
                <span className="text-slate-200">{col.name}</span>
              </div>
              <span className="text-slate-500 text-[10px]">{col.type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Query Console */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
          {dbProvider === 'firebase' ? 'Realtime DB Query' : 'SQL Query Runner'}
        </span>
        <textarea
          value={queryVal}
          onChange={(e) => setQueryVal(e.target.value)}
          rows={3}
          className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-indigo-300 focus:outline-none focus:border-indigo-500"
        />

        {queryResult && (
          <div className="p-2 rounded-lg bg-indigo-950/30 border border-indigo-500/30 text-indigo-300 text-[11px] font-mono leading-relaxed">
            {queryResult}
          </div>
        )}

        <button
          onClick={handleExecuteQuery}
          className={`w-full py-2 rounded-xl text-white font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors ${
            dbProvider === 'firebase'
              ? 'bg-amber-600 hover:bg-amber-500 shadow-md shadow-amber-600/30'
              : 'bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/30'
          }`}
        >
          <Play className="w-3 h-3 fill-white" />
          <span>Execute Query</span>
        </button>
      </div>
    </div>
  );
};
