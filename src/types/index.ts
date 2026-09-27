export type ProjectType = 'Web' | 'Desktop' | 'Mobile' | 'Other';

export interface Project {
  id: string;
  name: string;
  description: string;
  projectType: ProjectType;
  stack: string;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export interface ProjectProfile {
  projectId: string;
  framework: string;
  language: string;
  runtime: string;
  database: string;
  validationApproach: string;
  stateConventions: string;
  folderConventions: string;
  architectureRules: string;
  uiRules: string;
  qualityRules: string;
  securityDefaults: string;
  performanceRules: string;
  testingDefaults: string;
  forbiddenPatterns: string;
  updatedAt: string;
}

export type PromptRole =
  | 'Global Rules'
  | 'Frontend'
  | 'Backend'
  | 'Database'
  | 'Full Stack'
  | 'UI/UX'
  | 'Testing'
  | 'Security'
  | 'Reviewer';

export interface Prompt {
  id: string;
  projectId: string | null;
  title: string;
  role: PromptRole;
  body: string;
  tags: string[];
  scope: 'project' | 'global';
  favorite: boolean;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  schemaJson: string;
  templateBody: string;
}

export interface UIBlock {
  id: string;
  type: 'header' | 'sidebar' | 'stats-grid' | 'table' | 'form' | 'card' | 'filter-bar' | 'tabs' | 'modal' | 'chart' | 'custom';
  title: string;
  width: 'full' | 'half' | 'third' | 'two-thirds';
  height: number;
  properties: Record<string, any>;
}

export interface UISettings {
  pageType: 'Dashboard' | 'Landing' | 'Form' | 'List' | 'Detail' | 'Settings' | 'Custom';
  layout: 'Sidebar + Topbar' | 'Topbar Only' | 'Split View' | 'Centered Card' | 'Grid' | 'Custom';
  theme: 'Light (Soft)' | 'Dark' | 'System' | 'Custom';
  accentColor: string;
  borderRadius: string;
  showBorders: boolean;
  responsiveBehavior: string;
  statesIncluded: string[];
}

export interface UIPlan {
  id: string;
  projectId: string;
  name: string;
  blocks: UIBlock[];
  settings: UISettings;
  generatedText: string;
  createdAt: string;
  updatedAt: string;
}

export type ArchitectureNodeType =
  | 'UI / Component'
  | 'Validation'
  | 'Local/Shared State'
  | 'API / Route Handler'
  | 'Authentication'
  | 'Authorization / RBAC'
  | 'Tenant / Boundary'
  | 'Controller'
  | 'Service / Logic'
  | 'Repository / Data Access'
  | 'Database / SQLite'
  | 'External Service'
  | 'Response / Error Handling';

export interface ArchitectureNode {
  id: string;
  type: ArchitectureNodeType;
  title: string;
  tier: 'Frontend' | 'API Gateway' | 'Backend / Core' | 'Storage / Data';
  description: string;
  tech: string;
  dataFlow: string;
  order: number;
}

export interface ArchitectureEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  label?: string;
}

export interface ArchitecturePlan {
  id: string;
  projectId: string;
  name: string;
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  generatedText: string;
  createdAt: string;
  updatedAt: string;
}

export type ExportSourceType = 'prompt-builder' | 'ui-builder' | 'architecture' | 'library';
export type ExportFormat = 'markdown' | 'text' | 'json' | 'png';

export interface ExportRecord {
  id: string;
  projectId: string;
  sourceType: ExportSourceType;
  format: ExportFormat;
  path: string;
  title: string;
  content: string;
  notes: string;
  createdAt: string;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  defaultExportDirectory: string;
  promptSeparator: string;
  defaultGlobalRuleId: string;
  autoBackup: boolean;
}
