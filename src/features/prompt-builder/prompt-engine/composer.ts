import { PromptFormState } from '../prompt-builder.types';
import { Project, ProjectProfile, UIPlan, ArchitecturePlan, Prompt } from '../../../types';

export interface ComposeOptions {
  form: PromptFormState;
  project?: Project | null;
  profile?: ProjectProfile | null;
  globalRule?: Prompt | null;
  uiPlan?: UIPlan | null;
  architecturePlan?: ArchitecturePlan | null;
  separator?: string;
}

export function composePrompt({
  form,
  project,
  profile,
  globalRule,
  uiPlan,
  architecturePlan,
  separator = '###',
}: ComposeOptions): string {
  const sections: { title: string; lines: string[] }[] = [];

  // 1. Context and Role
  const contextLines: string[] = [];
  contextLines.push(`You are acting as an expert **${form.targetRole} Engineer**.`);
  if (project) {
    contextLines.push(`Project Name: **${project.name}** (${project.projectType} application).`);
    if (project.description) {
      contextLines.push(`Project Overview: ${project.description}`);
    }
  }
  if (form.projectContext && form.projectContext.trim()) {
    contextLines.push(`Context Details: ${form.projectContext.trim()}`);
  }
  sections.push({ title: '1. Context and Role', lines: contextLines });

  // 2. Exact Task
  const taskLines: string[] = [];
  taskLines.push(`**Task Title:** ${form.taskTitle}`);
  taskLines.push(`**Task Type:** ${form.taskType}`);
  taskLines.push(`**Primary Goal & Expected Outcome:**\n${form.featureGoal}`);
  if (form.existingFilesScope && form.existingFilesScope.trim()) {
    taskLines.push(`**Scope & Affected Files:**\n${form.existingFilesScope.trim()}`);
  }
  sections.push({ title: '2. Exact Task', lines: taskLines });

  // 3. Existing Project Constraints & Global Rules
  const constraintLines: string[] = [];
  if (form.includeGlobalRules && globalRule && globalRule.body) {
    constraintLines.push(`**Global Rules & Code Standards:**\n${globalRule.body.trim()}`);
  }
  if (form.includeProjectProfile && profile) {
    if (profile.framework || profile.language || profile.runtime || profile.database) {
      constraintLines.push(`**Tech Stack & Runtime:**`);
      if (profile.framework) constraintLines.push(`- Framework: ${profile.framework}`);
      if (profile.language) constraintLines.push(`- Language: ${profile.language}`);
      if (profile.runtime) constraintLines.push(`- Runtime: ${profile.runtime}`);
      if (profile.database) constraintLines.push(`- Database: ${profile.database}`);
    }
    if (profile.forbiddenPatterns && profile.forbiddenPatterns.trim()) {
      constraintLines.push(`**Forbidden Patterns & Restrictions:**\n${profile.forbiddenPatterns.trim()}`);
    }
  } else if (form.stackTech && form.stackTech.trim()) {
    constraintLines.push(`**Stack:** ${form.stackTech.trim()}`);
  }
  if (form.dependencyRestrictions && form.dependencyRestrictions.trim()) {
    constraintLines.push(`**Dependency Restrictions:**\n${form.dependencyRestrictions.trim()}`);
  }
  if (constraintLines.length > 0) {
    sections.push({ title: '3. Existing Project Constraints', lines: constraintLines });
  }

  // 4. Architecture and Layer Rules
  const archLines: string[] = [];
  if (profile && profile.architectureRules && form.includeProjectProfile) {
    archLines.push(`**Project Architecture Rules:**\n${profile.architectureRules.trim()}`);
  }
  if (form.dataModel && form.dataModel.trim()) {
    archLines.push(`**Data Model / Entities:**\n${form.dataModel.trim()}`);
  }
  if (form.stateManagement && form.stateManagement.trim()) {
    archLines.push(`**State Management:**\n${form.stateManagement.trim()}`);
  }
  if (form.apiFlow && form.apiFlow.trim()) {
    archLines.push(`**API & Request-Response Flow:**\n${form.apiFlow.trim()}`);
  }
  if (architecturePlan && architecturePlan.generatedText) {
    archLines.push(`**Visual Architecture Flow Specification (${architecturePlan.name}):**\n${architecturePlan.generatedText.trim()}`);
  }
  if (archLines.length > 0) {
    sections.push({ title: '4. Architecture and Layer Rules', lines: archLines });
  }

  // 5. UI / UX Requirements
  const uiLines: string[] = [];
  if (profile && profile.uiRules && form.includeProjectProfile) {
    uiLines.push(`**Project UI Design Standards:**\n${profile.uiRules.trim()}`);
  }
  if (form.uiRequirements && form.uiRequirements.trim()) {
    uiLines.push(`**UI Requirements & Layout:**\n${form.uiRequirements.trim()}`);
  }
  if (form.errorLoadingStates && form.errorLoadingStates.trim()) {
    uiLines.push(`**States (Loading, Empty, Error, Disabled):**\n${form.errorLoadingStates.trim()}`);
  }
  if (uiPlan && uiPlan.generatedText) {
    uiLines.push(`**Visual Wireframe & Component Plan (${uiPlan.name}):**\n${uiPlan.generatedText.trim()}`);
  }
  if (uiLines.length > 0) {
    sections.push({ title: '5. UI / UX Requirements', lines: uiLines });
  }

  // 6. Security, Performance and SEO Rules
  const secLines: string[] = [];
  if (form.validationRules && form.validationRules.trim()) {
    secLines.push(`**Validation Rules:**\n${form.validationRules.trim()}`);
  }
  if (form.authPermissions && form.authPermissions.trim()) {
    secLines.push(`**Authentication & Authorization:**\n${form.authPermissions.trim()}`);
  }
  if (form.securityBoundaries && form.securityBoundaries.trim()) {
    secLines.push(`**Security Boundaries:**\n${form.securityBoundaries.trim()}`);
  }
  if (form.performanceConstraints && form.performanceConstraints.trim()) {
    secLines.push(`**Performance Constraints:**\n${form.performanceConstraints.trim()}`);
  }
  if (form.seoAccessibility && form.seoAccessibility.trim()) {
    secLines.push(`**SEO & Accessibility:**\n${form.seoAccessibility.trim()}`);
  }
  if (secLines.length > 0) {
    sections.push({ title: '6. Security, Performance and SEO Rules', lines: secLines });
  }

  // 7. Custom Request & Required Implementation Steps
  const stepLines: string[] = [];
  if (form.customNotes && form.customNotes.trim()) {
    stepLines.push(`**Specific Instructions:**\n${form.customNotes.trim()}`);
  }
  if (form.outputFormat && form.outputFormat.trim()) {
    stepLines.push(`**Output Format & Delivery Depth:**\n${form.outputFormat.trim()}`);
  }
  stepLines.push('1. Review all schema and typing requirements before writing code.');
  stepLines.push('2. Implement domain logic and database repository functions.');
  stepLines.push('3. Build and test UI components with required states.');
  stepLines.push('4. Ensure complete, working code without placeholder comments or omitted blocks.');
  sections.push({ title: '7. Required Implementation Steps', lines: stepLines });

  // 8. Tests / Verification
  const testLines: string[] = [];
  if (profile && profile.testingDefaults && form.includeProjectProfile) {
    testLines.push(`**Project Testing Guidelines:**\n${profile.testingDefaults.trim()}`);
  }
  if (form.testingRequirements && form.testingRequirements.trim()) {
    testLines.push(`**Task Verification Requirements:**\n${form.testingRequirements.trim()}`);
  }
  sections.push({ title: '8. Tests / Verification', lines: testLines });

  // 9. Acceptance Criteria
  const acLines: string[] = [];
  if (form.acceptanceCriteria && form.acceptanceCriteria.trim()) {
    acLines.push(form.acceptanceCriteria.trim());
  } else {
    acLines.push('- Feature fulfills all specified functional and visual requirements.');
    acLines.push('- Types pass without errors, warnings, or any types.');
    acLines.push('- Unit tests verify edge cases and pass cleanly.');
  }
  sections.push({ title: '9. Acceptance Criteria', lines: acLines });

  // Build final composed prompt string
  const output = sections
    .map((s) => `${separator} ${s.title}\n\n${s.lines.join('\n\n')}`)
    .join('\n\n');

  return output;
}
