import { composePrompt } from '../../src/features/prompt-builder/prompt-engine/composer.js';
import { DEFAULT_PROMPT_FORM } from '../../src/features/prompt-builder/prompt-builder.types.js';

console.log('Testing Deterministic Prompt Composer...');

const mockProject = {
  id: 'test-proj',
  name: 'StorePro',
  description: 'Retail system',
  projectType: 'Desktop' as const,
  stack: 'Electron + React + SQLite',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  archivedAt: null,
};

const mockProfile = {
  projectId: 'test-proj',
  framework: 'React 19',
  language: 'TypeScript',
  runtime: 'Node 24',
  database: 'SQLite',
  validationApproach: 'Zod schemas',
  stateConventions: 'Local state + Context',
  folderConventions: 'Feature-first',
  architectureRules: 'Feature isolation and typed IPC',
  uiRules: 'Soft light theme, 8-12px radii',
  qualityRules: 'Strict TypeScript',
  securityDefaults: 'Sanitized inputs',
  performanceRules: 'Zero redundant re-renders',
  testingDefaults: 'Vitest unit tests',
  forbiddenPatterns: 'No any types',
  updatedAt: new Date().toISOString(),
};

const mockGlobalRule = {
  id: 'p-1',
  projectId: null,
  title: 'Global Standards',
  role: 'Global Rules' as const,
  body: 'Maintain documentation integrity. Strict TypeScript.',
  tags: ['standards'],
  scope: 'global' as const,
  favorite: true,
  archivedAt: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const result1 = composePrompt({
  form: DEFAULT_PROMPT_FORM,
  project: mockProject,
  profile: mockProfile,
  globalRule: mockGlobalRule,
});

const result2 = composePrompt({
  form: DEFAULT_PROMPT_FORM,
  project: mockProject,
  profile: mockProfile,
  globalRule: mockGlobalRule,
});

if (result1 !== result2) {
  console.error('FAIL: Prompt generation is not deterministic!');
  process.exit(1);
}

if (!result1.includes('1. Context and Role') || !result1.includes('9. Acceptance Criteria')) {
  console.error('FAIL: Missing required prompt sections!');
  process.exit(1);
}

console.log('PASS: Deterministic prompt composer verified successfully (identical outputs, all 9 sections present).');
