import { ArchitectureNodeType, ArchitectureNode } from '../../../types';

export interface NodeTypeDefinition {
  type: ArchitectureNodeType;
  label: string;
  defaultTier: ArchitectureNode['tier'];
  iconColor: string;
  description: string;
}

export const AVAILABLE_NODE_TYPES: NodeTypeDefinition[] = [
  {
    type: 'UI / Component',
    label: 'UI / Page / Component',
    defaultTier: 'Frontend',
    iconColor: '#3B82F6',
    description: 'User-facing components, views, forms, or pages',
  },
  {
    type: 'Validation',
    label: 'Validation Layer',
    defaultTier: 'Frontend',
    iconColor: '#10B981',
    description: 'Schema verification, Zod parsing, input validation',
  },
  {
    type: 'Local/Shared State',
    label: 'Local / Shared State',
    defaultTier: 'Frontend',
    iconColor: '#6366F1',
    description: 'React Context, Zustand, Redux, local component state',
  },
  {
    type: 'API / Route Handler',
    label: 'API / Route / IPC Handler',
    defaultTier: 'API Gateway',
    iconColor: '#8B5CF6',
    description: 'Electron typed IPC channel, REST endpoint, or router',
  },
  {
    type: 'Authentication',
    label: 'Authentication Guard',
    defaultTier: 'API Gateway',
    iconColor: '#EC4899',
    description: 'Token verification, session verification, user identity',
  },
  {
    type: 'Authorization / RBAC',
    label: 'Authorization / RBAC',
    defaultTier: 'API Gateway',
    iconColor: '#F43F5E',
    description: 'Role-based access control and privilege verification',
  },
  {
    type: 'Tenant / Boundary',
    label: 'Tenant / Project Boundary',
    defaultTier: 'API Gateway',
    iconColor: '#D97706',
    description: 'Project isolation, workspace boundaries, multi-tenancy',
  },
  {
    type: 'Controller',
    label: 'Controller / Dispatcher',
    defaultTier: 'Backend / Core',
    iconColor: '#059669',
    description: 'Request orchestration and response formatting',
  },
  {
    type: 'Service / Logic',
    label: 'Service / Business Logic',
    defaultTier: 'Backend / Core',
    iconColor: '#2563EB',
    description: 'Domain calculations, workflow execution, transaction boundaries',
  },
  {
    type: 'Repository / Data Access',
    label: 'Repository / Data Access',
    defaultTier: 'Backend / Core',
    iconColor: '#4F46E5',
    description: 'Database queries, parameterized statements, ORM calls',
  },
  {
    type: 'Database / SQLite',
    label: 'Database / SQLite / Store',
    defaultTier: 'Storage / Data',
    iconColor: '#0284C7',
    description: 'Local SQLite database, file tables, or persistence engine',
  },
  {
    type: 'External Service',
    label: 'External Service / API',
    defaultTier: 'Storage / Data',
    iconColor: '#7C3AED',
    description: 'Third-party APIs, webhooks, or hardware interfaces',
  },
  {
    type: 'Response / Error Handling',
    label: 'Response & Error Handling',
    defaultTier: 'Frontend',
    iconColor: '#10B981',
    description: 'Structured result contracts, localized toasts, error alerts',
  },
];
