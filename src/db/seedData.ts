export const DEFAULT_PROJECT_ID = 'proj-storepro-01';

export const INITIAL_PROJECT = {
  id: DEFAULT_PROJECT_ID,
  name: 'StorePro',
  description: 'Local-first retail inventory & sales management desktop system with offline resilience.',
  projectType: 'Desktop',
  stack: 'Electron + React + TypeScript + SQLite',
  createdAt: '2026-09-27T08:00:00.000Z',
  updatedAt: '2026-09-27T08:00:00.000Z',
  archivedAt: null,
};

export const INITIAL_PROFILE = {
  projectId: DEFAULT_PROJECT_ID,
  framework: 'React 19 + TypeScript',
  language: 'TypeScript (Strict)',
  runtime: 'Electron Desktop / Node.js 24',
  database: 'SQLite (sql.js / better-sqlite3)',
  validationApproach: 'Zod schemas at IPC boundaries and form inputs',
  stateConventions: 'Local component state by default; React Context for active project and session',
  folderConventions: 'Feature-first directory structure (features/*, db/*, components/*)',
  uiRules: 'Soft light theme (#F7F9FC bg, white surfaces, #2563EB accent), 8-12px radii, border-first definition',
  securityDefaults: 'Strict IPC validation; no direct filesystem/database calls from renderer; parameterized SQL queries',
  performanceRules: 'Zero unnecessary renders, lazy load non-critical builders, keep local bundle lightweight',
  testingDefaults: 'Vitest unit tests for business logic, repositories, and prompt composition engine',
  forbiddenPatterns: 'No any types, no large UI frameworks, no inline untyped SQL in UI components, no remote cloud dependencies',
  updatedAt: '2026-09-27T08:00:00.000Z',
};

export const INITIAL_PROMPTS = [
  {
    id: 'p-global-01',
    projectId: null,
    title: 'Global Code Quality & Safe Edits',
    role: 'Global Rules',
    body: `Follow these universal principles for all implementation tasks:
- Maintain documentation integrity. Preserve all existing comments and docstrings.
- Keep code simple, readable, lightweight and maintainable.
- Do not overengineer. Avoid unnecessary wrappers, hooks, utilities, and abstractions.
- Prefer the smallest correct implementation.
- Strict TypeScript: no any, strict null checks.
- Keep rendering logic separate from storage and data access.`,
    tags: JSON.stringify(['quality', 'standards', 'core']),
    scope: 'global',
    favorite: 1,
    archivedAt: null,
    createdAt: '2026-09-27T08:00:00.000Z',
    updatedAt: '2026-09-27T08:00:00.000Z',
  },
  {
    id: 'p-fe-01',
    projectId: DEFAULT_PROJECT_ID,
    title: 'React + TypeScript Feature Architecture',
    role: 'Frontend',
    body: `When creating frontend components:
- Build reusable, focused components within feature directories.
- Use explicit TypeScript interfaces for all props and state.
- Implement empty, loading, error, and success states for all asynchronous operations.
- Ensure all interactive elements have accessible labels and keyboard focus states.
- Follow the 8px spacing system and soft light color palette.`,
    tags: JSON.stringify(['react', 'frontend', 'ui']),
    scope: 'project',
    favorite: 1,
    archivedAt: null,
    createdAt: '2026-09-27T08:00:00.000Z',
    updatedAt: '2026-09-27T08:00:00.000Z',
  },
  {
    id: 'p-be-01',
    projectId: DEFAULT_PROJECT_ID,
    title: 'Service & Repository SQLite Pattern',
    role: 'Backend',
    body: `When implementing data-access logic:
- All database queries must live inside repository files in db/repositories/.
- Never write raw SQL inside UI components or route handlers.
- Validate all incoming parameters before executing database statements.
- Return typed plain JavaScript objects from repository methods.
- Handle database exceptions cleanly with meaningful domain errors.`,
    tags: JSON.stringify(['sqlite', 'repository', 'backend']),
    scope: 'project',
    favorite: 0,
    archivedAt: null,
    createdAt: '2026-09-27T08:00:00.000Z',
    updatedAt: '2026-09-27T08:00:00.000Z',
  },
  {
    id: 'p-db-01',
    projectId: null,
    title: 'SQLite Schema & Migration Safety',
    role: 'Database',
    body: `When changing database schemas:
- Never drop columns or tables containing user data without explicit migrations.
- Always use parameterized queries (?) to prevent injection vulnerabilities.
- Add indexes on foreign keys and columns frequently used in WHERE or ORDER BY clauses.
- Store ISO 8601 strings for date/time columns.
- Use soft-delete (archived_at TIMESTAMP) for valuable user entities.`,
    tags: JSON.stringify(['database', 'sqlite', 'migrations']),
    scope: 'global',
    favorite: 0,
    archivedAt: null,
    createdAt: '2026-09-27T08:00:00.000Z',
    updatedAt: '2026-09-27T08:00:00.000Z',
  },
  {
    id: 'p-fs-01',
    projectId: DEFAULT_PROJECT_ID,
    title: 'Full Stack Vertical Slice Delivery',
    role: 'Full Stack',
    body: `Implement new capabilities as vertical slices:
1. Define the TypeScript domain models and schemas.
2. Implement database migrations and repository methods.
3. Expose typed IPC handlers / service layer methods.
4. Implement UI components and connect them through service hooks.
5. Provide unit tests covering data persistence and edge cases.`,
    tags: JSON.stringify(['fullstack', 'architecture', 'slice']),
    scope: 'project',
    favorite: 1,
    archivedAt: null,
    createdAt: '2026-09-27T08:00:00.000Z',
    updatedAt: '2026-09-27T08:00:00.000Z',
  },
  {
    id: 'p-ui-01',
    projectId: null,
    title: 'UI/UX Visual Quality Guidelines',
    role: 'UI/UX',
    body: `Follow DevPrompt Studio visual system:
- Soft light theme with off-white background (#F7F9FC) and crisp white surface (#FFFFFF).
- Clean slate text (#0F172A primary, #64748B secondary).
- One primary accent color (#2563EB) for main interactive targets.
- Borders preferred before heavy shadows.
- Consistent 8-12px radii.
- Zero rainbow dashboards or oversized empty cards.`,
    tags: JSON.stringify(['ui', 'design-system', 'tokens']),
    scope: 'global',
    favorite: 0,
    archivedAt: null,
    createdAt: '2026-09-27T08:00:00.000Z',
    updatedAt: '2026-09-27T08:00:00.000Z',
  },
  {
    id: 'p-test-01',
    projectId: null,
    title: 'Unit & Regression Test Verification',
    role: 'Testing',
    body: `Write focused, meaningful tests:
- Test edge cases, null handling, empty lists, and boundary conditions.
- Mock external systems (filesystem, network) at repository boundaries.
- Ensure prompt composition produces deterministic, byte-identical strings for identical inputs.
- Keep tests fast and self-contained.`,
    tags: JSON.stringify(['testing', 'vitest', 'unit']),
    scope: 'global',
    favorite: 0,
    archivedAt: null,
    createdAt: '2026-09-27T08:00:00.000Z',
    updatedAt: '2026-09-27T08:00:00.000Z',
  },
  {
    id: 'p-sec-01',
    projectId: null,
    title: 'Electron Desktop & IPC Security Boundaries',
    role: 'Security',
    body: `Electron security checklist:
- Context isolation enabled, nodeIntegration disabled in renderer.
- All IPC messages must pass schema validation before touching filesystem or database.
- Never construct raw SQL strings with user inputs.
- Keep sensitive configuration and secrets out of renderer state.`,
    tags: JSON.stringify(['security', 'electron', 'ipc']),
    scope: 'global',
    favorite: 0,
    archivedAt: null,
    createdAt: '2026-09-27T08:00:00.000Z',
    updatedAt: '2026-09-27T08:00:00.000Z',
  },
  {
    id: 'p-rev-01',
    projectId: null,
    title: 'AI Code & Prompt Output Reviewer',
    role: 'Reviewer',
    body: `Review AI generated code against blueprint criteria:
1. Does it meet all acceptance criteria without skipping steps?
2. Are there any unnecessary libraries or dependencies introduced?
3. Does it adhere strictly to TypeScript without any types?
4. Are error and loading states properly handled?
5. Is the design visually calm, minimal, and aligned with soft-light standards?`,
    tags: JSON.stringify(['review', 'quality-assurance']),
    scope: 'global',
    favorite: 1,
    archivedAt: null,
    createdAt: '2026-09-27T08:00:00.000Z',
    updatedAt: '2026-09-27T08:00:00.000Z',
  },
];

export const INITIAL_UI_PLAN = {
  id: 'ui-storepro-pos-01',
  projectId: DEFAULT_PROJECT_ID,
  name: 'StorePro Sales & Inventory Wireframe',
  blocks_json: JSON.stringify([
    {
      id: 'b1',
      type: 'header',
      title: 'Top Navigation & Search Bar',
      width: 'full',
      height: 60,
      properties: { showSearch: true, showUserAvatar: true, actions: ['New Sale', 'Scan Barcode'] },
    },
    {
      id: 'b2',
      type: 'sidebar',
      title: 'Catalog Navigation',
      width: 'third',
      height: 240,
      properties: { categories: ['Hardware', 'Electronics', 'Peripherals', 'Cables'] },
    },
    {
      id: 'b3',
      type: 'stats-grid',
      title: 'Sales & Inventory Metrics',
      width: 'two-thirds',
      height: 110,
      properties: {
        stats: [
          { label: "Today's Sales", value: '$2,840.50' },
          { label: 'Active Items', value: '1,420' },
          { label: 'Low Stock Alerts', value: '3' },
        ],
      },
    },
    {
      id: 'b4',
      type: 'table',
      title: 'Recent Inventory Movements',
      width: 'two-thirds',
      height: 200,
      properties: { columns: ['SKU', 'Item Name', 'Quantity', 'Status', 'Updated'] },
    },
  ]),
  settings_json: JSON.stringify({
    pageType: 'Dashboard',
    layout: 'Sidebar + Topbar',
    theme: 'Light (Soft)',
    accentColor: '#2563EB',
    borderRadius: '8px',
    showBorders: true,
    responsiveBehavior: 'Sidebar collapses to hamburger on tablet; table scrolls horizontally',
    statesIncluded: ['Loading skeleton', 'Empty state on zero sales', 'Offline synchronization banner'],
  }),
  generated_text: `UI Specification for StorePro Sales & Inventory Wireframe:
- Layout: Sidebar + Topbar layout with clean border separation.
- Visual System: Soft light theme (#F7F9FC bg, white surfaces, #2563EB accent), 8px border radii.
- Key Components:
  1. Top Navigation & Search Bar: Full width, search input + quick actions ('New Sale', 'Scan Barcode').
  2. Catalog Navigation Sidebar: Left rail listing item categories with active highlight.
  3. Sales & Inventory Metrics Grid: Key metrics cards showing Today's Sales ($2,840.50), Active Items, and Low Stock Alerts.
  4. Recent Inventory Movements: Data table displaying SKU, Item Name, Quantity, Status, and Updated timestamp.
- Responsive Behavior: Sidebar collapses on narrow viewports; tables provide horizontal overflow scrolling.
- State Handling: Display loading skeleton during SQLite fetches, offline banner if connection is pending.`,
  createdAt: '2026-09-27T08:00:00.000Z',
  updatedAt: '2026-09-27T08:00:00.000Z',
};

export const INITIAL_ARCHITECTURE = {
  id: 'arch-storepro-01',
  projectId: DEFAULT_PROJECT_ID,
  name: 'Local-First IPC & SQLite Architecture Flow',
  nodes_json: JSON.stringify([
    {
      id: 'n-ui',
      type: 'UI / Component',
      title: 'POS Sales View',
      tier: 'Frontend',
      description: 'React components capturing barcode scans and cart additions',
      tech: 'React 19 + TypeScript',
      dataFlow: 'User input -> Local component state -> IPC dispatch',
      order: 1,
    },
    {
      id: 'n-val',
      type: 'Validation',
      title: 'Cart & SKU Validator',
      tier: 'Frontend',
      description: 'Zod schema validating item quantities, discount limits, and customer IDs',
      tech: 'Zod 3.x',
      dataFlow: 'Validates payload before IPC invoke',
      order: 2,
    },
    {
      id: 'n-ipc',
      type: 'API / Route Handler',
      title: 'Electron Typed IPC Channel',
      tier: 'API Gateway',
      description: 'Secure IPC invoke handler bridging renderer and main process',
      tech: 'Electron ipcRenderer / ipcMain with TypeScript signatures',
      dataFlow: 'renderer:invoke("pos:createSale", cartData)',
      order: 3,
    },
    {
      id: 'n-srv',
      type: 'Service / Logic',
      title: 'Sales & Inventory Service',
      tier: 'Backend / Core',
      description: 'Calculates taxes, checks inventory levels, and opens SQLite transaction',
      tech: 'Node.js 24 domain service',
      dataFlow: 'Deducts stock levels and generates receipt record',
      order: 4,
    },
    {
      id: 'n-repo',
      type: 'Repository / Data Access',
      title: 'Sales SQLite Repository',
      tier: 'Backend / Core',
      description: 'Executes parameterized queries within an atomic transaction',
      tech: 'SQLite / sql.js repository',
      dataFlow: 'INSERT INTO sales ...; UPDATE inventory ...',
      order: 5,
    },
    {
      id: 'n-db',
      type: 'Database / SQLite',
      title: 'Local SQLite Database File',
      tier: 'Storage / Data',
      description: 'Persistent local single-user database file stored in app user directory',
      tech: 'SQLite 3 (devprompt_studio.db)',
      dataFlow: 'Atomic commit to disk',
      order: 6,
    },
    {
      id: 'n-resp',
      type: 'Response / Error Handling',
      title: 'Structured IPC Result',
      tier: 'Frontend',
      description: 'Returns success confirmation or localized error back to POS UI',
      tech: 'TypeScript Result<Sale, DomainError>',
      dataFlow: 'UI updates cart and triggers receipt print',
      order: 7,
    },
  ]),
  edges_json: JSON.stringify([
    { id: 'e1', fromNodeId: 'n-ui', toNodeId: 'n-val', label: 'validates' },
    { id: 'e2', fromNodeId: 'n-val', toNodeId: 'n-ipc', label: 'sends IPC' },
    { id: 'e3', fromNodeId: 'n-ipc', toNodeId: 'n-srv', label: 'invokes service' },
    { id: 'e4', fromNodeId: 'n-srv', toNodeId: 'n-repo', label: 'executes SQL' },
    { id: 'e5', fromNodeId: 'n-repo', toNodeId: 'n-db', label: 'persists' },
    { id: 'e6', fromNodeId: 'n-db', toNodeId: 'n-resp', label: 'returns result' },
  ]),
  generated_text: `Architecture Flow: Local-First IPC & SQLite Architecture Flow
Pipeline Sequence:
1. [Frontend] POS Sales View: React components capture barcode scans and user input.
2. [Frontend] Cart & SKU Validator: Zod schema verifies item quantities, price integrity, and limits.
3. [API Gateway] Electron Typed IPC Channel: Secure typed IPC boundary bridges renderer and Electron main process.
4. [Backend / Core] Sales & Inventory Service: Domain logic validates stock availability and computes taxes inside an atomic transaction.
5. [Backend / Core] Sales SQLite Repository: Executes parameterized SQL queries with rollback guarantees.
6. [Storage / Data] Local SQLite Database File: Data commits to local persistent SQLite file on disk.
7. [Frontend] Structured IPC Result: Typed response delivered back to UI, showing receipt confirmation and instant cart reset.`,
  createdAt: '2026-09-27T08:00:00.000Z',
  updatedAt: '2026-09-27T08:00:00.000Z',
};

export const INITIAL_EXPORTS = [
  {
    id: 'exp-01',
    projectId: DEFAULT_PROJECT_ID,
    sourceType: 'prompt-builder',
    format: 'markdown',
    path: 'clipboard',
    title: 'POS Barcode Scanner Component Prompt',
    content: `# Task: Implement Barcode Scanner UI Component in StorePro
Target Role: Frontend Developer
Stack: Electron + React 19 + TypeScript + SQLite

## Requirements
- Render high-performance barcode scanning input with debounce and keyboard auto-detection.
- Follow DevPrompt Studio soft-light design tokens.
- Emit validated item payload to cart service.`,
    notes: 'Copied to clipboard for Antigravity AI pair programming',
    createdAt: '2026-09-27T08:30:00.000Z',
  },
];
