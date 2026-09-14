export const phases = [
  'intake',
  'specification',
  'planning',
  'red',
  'green',
  'review',
  'approval',
  'delivery',
  'completed',
] as const;

export type Phase = (typeof phases)[number];

export type WorkflowRun = {
  id: string;
  intent: string;
  phase: Phase;
  history: Array<{ at: string; phase: Phase }>;
};

const transitions: Record<Phase, readonly Phase[]> = {
  intake: ['specification'],
  specification: ['planning'],
  planning: ['red'],
  red: ['green'],
  green: ['review'],
  review: ['green', 'approval'],
  approval: ['planning', 'delivery'],
  delivery: ['completed'],
  completed: [],
};

export function createWorkflowRun(intent: string): WorkflowRun {
  const normalizedIntent = intent.trim();
  if (!normalizedIntent) {
    throw new Error('Intent is required');
  }

  const at = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    intent: normalizedIntent,
    phase: 'intake',
    history: [{ at, phase: 'intake' }],
  };
}

export function transitionWorkflow(
  workflow: WorkflowRun,
  nextPhase: Phase,
): WorkflowRun {
  if (!transitions[workflow.phase].includes(nextPhase)) {
    throw new Error(
      `Invalid workflow transition: ${workflow.phase} -> ${nextPhase}`,
    );
  }

  return {
    ...workflow,
    phase: nextPhase,
    history: [
      ...workflow.history,
      { at: new Date().toISOString(), phase: nextPhase },
    ],
  };
}
