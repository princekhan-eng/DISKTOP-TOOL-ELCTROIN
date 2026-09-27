import { PromptRole } from '../../types';

export interface PromptFormState {
  // 1. Task Title & Type
  taskTitle: string;
  taskType: string;

  // 2. Project context & Role
  targetRole: PromptRole;
  projectContext: string;

  // 3. Feature Goal & Outcome
  featureGoal: string;

  // 4. Scope & Existing Files
  existingFilesScope: string;

  // 5. Tech Stack
  stackTech: string;

  // 6. Data Model / Entities
  dataModel: string;

  // 7. UI / UX requirements
  uiRequirements: string;

  // 8. Validation rules
  validationRules: string;

  // 9. State Management
  stateManagement: string;

  // 10. API / Request flow
  apiFlow: string;

  // 11. Auth & Permissions
  authPermissions: string;

  // 12. Security boundaries
  securityBoundaries: string;

  // 13. Performance constraints
  performanceConstraints: string;

  // 14. SEO & Accessibility
  seoAccessibility: string;

  // 15. Error / Loading / Empty states
  errorLoadingStates: string;

  // 16. Testing requirements
  testingRequirements: string;

  // 17. Dependency restrictions
  dependencyRestrictions: string;

  // 18. Output format & depth
  outputFormat: string;

  // 19. Acceptance criteria
  acceptanceCriteria: string;

  // 20. Custom request / notes
  customNotes: string;

  // Toggles for Deterministic Composition
  includeGlobalRules: boolean;
  includeProjectProfile: boolean;
  selectedGlobalRuleId?: string;
  selectedUIPlanId?: string;
  selectedArchitectureId?: string;
}

export const DEFAULT_PROMPT_FORM: PromptFormState = {
  taskTitle: 'Implement New Feature',
  taskType: 'Create New Feature',
  targetRole: 'Full Stack',
  projectContext: '',
  featureGoal: 'Deliver end-to-end functionality following established architecture.',
  existingFilesScope: 'Create new feature files inside src/features/ without altering unrelated logic.',
  stackTech: 'Electron + React 19 + TypeScript + SQLite',
  dataModel: 'Typed interfaces with SQLite tables, migrations and repositories.',
  uiRequirements: 'Soft light theme, 8-12px radii, clean typography and responsive layout.',
  validationRules: 'Validate all inputs using Zod schemas at boundaries.',
  stateManagement: 'Local component state where possible, React Context for shared domain state.',
  apiFlow: 'Strictly typed IPC handlers / services, no direct database queries in components.',
  authPermissions: 'Single-user local environment with validated data boundaries.',
  securityBoundaries: 'Sanitize all user inputs; avoid raw untyped SQL strings.',
  performanceConstraints: 'Zero excessive re-renders, lightweight memory footprint, instant startup.',
  seoAccessibility: 'Accessible keyboard navigation, visible focus rings, semantic labels.',
  errorLoadingStates: 'Provide skeleton loading states, informative error alerts, and empty states.',
  testingRequirements: 'Vitest unit tests for validation and domain calculations.',
  dependencyRestrictions: 'Keep dependencies minimal; do not install large utility libraries without justification.',
  outputFormat: 'Clean, production-ready code with complete implementations (no placeholders).',
  acceptanceCriteria: '- All components render without errors.\n- Data persists cleanly to SQLite.\n- Strict TypeScript types with zero "any".\n- UI matches the soft-light visual design system.',
  customNotes: '',
  includeGlobalRules: true,
  includeProjectProfile: true,
};
