import initSqlJs, { Database } from 'sql.js';
import { SCHEMA_SQL } from './migrations/schema.sql';
import {
  DEFAULT_PROJECT_ID,
  INITIAL_PROJECT,
  INITIAL_PROFILE,
  INITIAL_PROMPTS,
  INITIAL_UI_PLAN,
  INITIAL_ARCHITECTURE,
  INITIAL_EXPORTS,
} from './seedData';

const DB_STORAGE_KEY = 'postgresql://layerbase:eoazfuO11NkgVu1AEZ52AKm9@mypersnol-like-root-pooler.ovh2.cloud.layerbase.dev/mypersnol?sslmode=require&application_name=layerbase-sqlite';

let dbInstance: Database | null = null;
let initPromise: Promise<Database> | null = null;

export async function getDatabase(): Promise<Database> {
  if (dbInstance) return dbInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    let sqlConfig: any = {};
    const electronApi = typeof window !== 'undefined' ? (window as any).electronAPI : undefined;

    if (electronApi && typeof electronApi.getWasmBinary === 'function') {
      try {
        const binary = await electronApi.getWasmBinary();
        if (binary) {
          sqlConfig.wasmBinary = binary instanceof Uint8Array ? binary : new Uint8Array(binary);
        }
      } catch (err) {
        console.warn('Failed to load wasm binary via IPC:', err);
      }
    }

    if (!sqlConfig.wasmBinary && typeof window === 'undefined' && typeof process !== 'undefined') {
      try {
        const fsName = 'fs';
        const pathName = 'path';
        const fs = await import(/* @vite-ignore */ fsName);
        const path = await import(/* @vite-ignore */ pathName);
        const p1 = path.resolve(process.cwd(), 'public/sql-wasm.wasm');
        const p2 = path.resolve(process.cwd(), 'dist/sql-wasm.wasm');
        if (fs.existsSync(p1)) {
          sqlConfig.wasmBinary = fs.readFileSync(p1);
        } else if (fs.existsSync(p2)) {
          sqlConfig.wasmBinary = fs.readFileSync(p2);
        }
      } catch {}
    }

    if (!sqlConfig.wasmBinary) {
      const isFile = typeof window !== 'undefined' && window.location.protocol === 'file:';
      sqlConfig.locateFile = (file: string) => (isFile ? `./${file}` : `/${file}`);
    }

    const SQL = await initSqlJs(sqlConfig);

    let savedData: Uint8Array | null = null;
    if (typeof localStorage !== 'undefined') {
      try {
        const storedBase64 = localStorage.getItem(DB_STORAGE_KEY);
        if (storedBase64) {
          const binaryString = atob(storedBase64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          savedData = bytes;
        }
      } catch (err) {
        console.warn('Failed to load saved SQLite database from localStorage, initializing fresh:', err);
      }
    }

    if (savedData && savedData.length > 0) {
      try {
        dbInstance = new SQL.Database(savedData);
      } catch (err) {
        console.warn('Corrupt SQLite data, creating fresh database:', err);
        dbInstance = new SQL.Database();
      }
    } else {
      dbInstance = new SQL.Database();
    }

    // Run schema migrations
    dbInstance.run(SCHEMA_SQL);

    // Check if projects table is empty, seed initial data
    const projectCheck = dbInstance.exec('SELECT COUNT(*) as count FROM projects');
    const projectCount = projectCheck[0]?.values[0]?.[0] as number;

    if (!projectCount || projectCount === 0) {
      seedDatabase(dbInstance);
      persistDatabase(dbInstance);
    }

    return dbInstance;
  })().catch((err) => {
    initPromise = null;
    throw err;
  });

  return initPromise;
}

export function persistDatabase(db: Database = dbInstance!): void {
  if (!db) return;
  try {
    const binary = db.export();
    // Convert binary to base64 for reliable localStorage persistence
    let binaryString = '';
    const chunk = 8192;
    for (let i = 0; i < binary.length; i += chunk) {
      const slice = binary.subarray(i, Math.min(i + chunk, binary.length));
      binaryString += String.fromCharCode.apply(null, Array.from(slice));
    }
    const base64 = btoa(binaryString);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(DB_STORAGE_KEY, base64);
    }
  } catch (err) {
    console.error('Failed to persist SQLite database:', err);
  }
}

function seedDatabase(db: Database): void {
  // Seed Project
  db.run(
    'INSERT INTO projects (id, name, description, project_type, stack, created_at, updated_at, archived_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      INITIAL_PROJECT.id,
      INITIAL_PROJECT.name,
      INITIAL_PROJECT.description,
      INITIAL_PROJECT.projectType,
      INITIAL_PROJECT.stack,
      INITIAL_PROJECT.createdAt,
      INITIAL_PROJECT.updatedAt,
      INITIAL_PROJECT.archivedAt,
    ]
  );

  // Seed Project Profile
  db.run(
    `INSERT INTO project_profiles (
      project_id, framework, language, runtime, database, validation_approach,
      state_conventions, folder_conventions, ui_rules, security_defaults,
      performance_rules, testing_defaults, forbidden_patterns, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      INITIAL_PROFILE.projectId,
      INITIAL_PROFILE.framework,
      INITIAL_PROFILE.language,
      INITIAL_PROFILE.runtime,
      INITIAL_PROFILE.database,
      INITIAL_PROFILE.validationApproach,
      INITIAL_PROFILE.stateConventions,
      INITIAL_PROFILE.folderConventions,
      INITIAL_PROFILE.uiRules,
      INITIAL_PROFILE.securityDefaults,
      INITIAL_PROFILE.performanceRules,
      INITIAL_PROFILE.testingDefaults,
      INITIAL_PROFILE.forbiddenPatterns,
      INITIAL_PROFILE.updatedAt,
    ]
  );

  // Seed Prompts
  for (const p of INITIAL_PROMPTS) {
    db.run(
      'INSERT INTO prompts (id, project_id, title, role, body, tags, scope, favorite, archived_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [p.id, p.projectId, p.title, p.role, p.body, p.tags, p.scope, p.favorite, p.archivedAt, p.createdAt, p.updatedAt]
    );
  }

  // Seed UI Plan
  db.run(
    'INSERT INTO ui_plans (id, project_id, name, blocks_json, settings_json, generated_text, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      INITIAL_UI_PLAN.id,
      INITIAL_UI_PLAN.projectId,
      INITIAL_UI_PLAN.name,
      INITIAL_UI_PLAN.blocks_json,
      INITIAL_UI_PLAN.settings_json,
      INITIAL_UI_PLAN.generated_text,
      INITIAL_UI_PLAN.createdAt,
      INITIAL_UI_PLAN.updatedAt,
    ]
  );

  // Seed Architecture
  db.run(
    'INSERT INTO architectures (id, project_id, name, nodes_json, edges_json, generated_text, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      INITIAL_ARCHITECTURE.id,
      INITIAL_ARCHITECTURE.projectId,
      INITIAL_ARCHITECTURE.name,
      INITIAL_ARCHITECTURE.nodes_json,
      INITIAL_ARCHITECTURE.edges_json,
      INITIAL_ARCHITECTURE.generated_text,
      INITIAL_ARCHITECTURE.createdAt,
      INITIAL_ARCHITECTURE.updatedAt,
    ]
  );

  // Seed Export Record
  for (const exp of INITIAL_EXPORTS) {
    db.run(
      'INSERT INTO export_records (id, project_id, source_type, format, path, title, content, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [exp.id, exp.projectId, exp.sourceType, exp.format, exp.path, exp.title, exp.content, exp.notes, exp.createdAt]
    );
  }

  // Seed App Settings
  db.run('INSERT INTO app_settings (key, value_json) VALUES (?, ?)', [
    'general',
    JSON.stringify({
      theme: 'light',
      defaultExportDirectory: 'downloads/devprompt',
      promptSeparator: '###',
      defaultGlobalRuleId: 'p-global-01',
      autoBackup: true,
    }),
  ]);
}

export async function executeQuery<T>(sql: string, params: any[] = []): Promise<T[]> {
  const db = await getDatabase();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results: T[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as unknown as T);
  }
  stmt.free();
  return results;
}

export async function executeRun(sql: string, params: any[] = []): Promise<void> {
  const db = await getDatabase();
  db.run(sql, params);
  persistDatabase(db);
}

export async function resetAndSeedDatabase(): Promise<void> {
  localStorage.removeItem(DB_STORAGE_KEY);
  dbInstance = null;
  initPromise = null;
  await getDatabase();
}

export async function exportDatabaseBinary(): Promise<Uint8Array> {
  const db = await getDatabase();
  return db.export();
}

export async function exportFullDatabaseJson(): Promise<Record<string, any>> {
  const db = await getDatabase();
  const tables = ['projects', 'project_profiles', 'prompts', 'prompt_templates', 'ui_plans', 'architectures', 'export_records', 'app_settings'];
  const fullBackup: Record<string, any[]> = {};

  for (const table of tables) {
    const rows = await executeQuery(`SELECT * FROM ${table}`);
    fullBackup[table] = rows;
  }

  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    data: fullBackup,
  };
}

export async function restoreDatabaseFromJson(backupJson: any): Promise<void> {
  if (!backupJson || !backupJson.data) throw new Error('Invalid backup format');
  const db = await getDatabase();

  db.run('BEGIN TRANSACTION;');
  try {
    const data = backupJson.data;
    if (data.projects) {
      db.run('DELETE FROM projects;');
      for (const row of data.projects) {
        db.run(
          'INSERT INTO projects (id, name, description, project_type, stack, created_at, updated_at, archived_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [row.id, row.name, row.description, row.project_type, row.stack, row.created_at, row.updated_at, row.archived_at]
        );
      }
    }
    if (data.project_profiles) {
      db.run('DELETE FROM project_profiles;');
      for (const row of data.project_profiles) {
        db.run(
          `INSERT INTO project_profiles (
            project_id, framework, language, runtime, database, validation_approach,
            state_conventions, folder_conventions, ui_rules, security_defaults,
            performance_rules, testing_defaults, forbidden_patterns, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            row.project_id, row.framework, row.language, row.runtime, row.database,
            row.validation_approach, row.state_conventions, row.folder_conventions,
            row.ui_rules, row.security_defaults, row.performance_rules,
            row.testing_defaults, row.forbidden_patterns, row.updated_at
          ]
        );
      }
    }
    if (data.prompts) {
      db.run('DELETE FROM prompts;');
      for (const row of data.prompts) {
        db.run(
          'INSERT INTO prompts (id, project_id, title, role, body, tags, scope, favorite, archived_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [row.id, row.project_id, row.title, row.role, row.body, row.tags, row.scope, row.favorite, row.archived_at, row.created_at, row.updated_at]
        );
      }
    }
    if (data.ui_plans) {
      db.run('DELETE FROM ui_plans;');
      for (const row of data.ui_plans) {
        db.run(
          'INSERT INTO ui_plans (id, project_id, name, blocks_json, settings_json, generated_text, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [row.id, row.project_id, row.name, row.blocks_json, row.settings_json, row.generated_text, row.created_at, row.updated_at]
        );
      }
    }
    if (data.architectures) {
      db.run('DELETE FROM architectures;');
      for (const row of data.architectures) {
        db.run(
          'INSERT INTO architectures (id, project_id, name, nodes_json, edges_json, generated_text, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [row.id, row.project_id, row.name, row.nodes_json, row.edges_json, row.generated_text, row.created_at, row.updated_at]
        );
      }
    }
    if (data.export_records) {
      db.run('DELETE FROM export_records;');
      for (const row of data.export_records) {
        db.run(
          'INSERT INTO export_records (id, project_id, source_type, format, path, title, content, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [row.id, row.project_id, row.source_type, row.format, row.path, row.title, row.content, row.notes, row.created_at]
        );
      }
    }
    db.run('COMMIT;');
    persistDatabase(db);
  } catch (err) {
    db.run('ROLLBACK;');
    throw err;
  }
}
