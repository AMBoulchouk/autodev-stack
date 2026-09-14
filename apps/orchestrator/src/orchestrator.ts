import { Phase, WorkflowRun, transitionWorkflow } from './workflow';

export type PhaseOutput = Partial<Record<Phase, string>>;

export type WorkflowCheckpoint = {
  workflow: WorkflowRun;
  outputs: PhaseOutput;
  status: 'running' | 'awaiting_approval' | 'completed';
};

export type PhaseExecutor = (
  phase: Exclude<Phase, 'intake' | 'approval' | 'completed'>,
  checkpoint: WorkflowCheckpoint,
) => Promise<string>;

const autonomousPhases = [
  'specification',
  'planning',
  'red',
  'green',
  'review',
] as const;

export async function executeUntilApproval(
  initial: WorkflowCheckpoint,
  execute: PhaseExecutor,
  persist: (checkpoint: WorkflowCheckpoint) => Promise<void>,
): Promise<WorkflowCheckpoint> {
  let checkpoint = initial;

  for (const phase of autonomousPhases) {
    if (checkpoint.workflow.history.some((entry) => entry.phase === phase)) {
      continue;
    }

    const workflow = transitionWorkflow(checkpoint.workflow, phase);
    checkpoint = { ...checkpoint, workflow, status: 'running' };
    const output = await execute(phase, checkpoint);
    checkpoint = {
      ...checkpoint,
      outputs: { ...checkpoint.outputs, [phase]: output },
    };
    await persist(checkpoint);
  }

  if (checkpoint.workflow.phase === 'review') {
    checkpoint = {
      ...checkpoint,
      workflow: transitionWorkflow(checkpoint.workflow, 'approval'),
      status: 'awaiting_approval',
    };
    await persist(checkpoint);
  }

  return checkpoint;
}

export async function approveAndDeliver(
  initial: WorkflowCheckpoint,
  execute: PhaseExecutor,
  persist: (checkpoint: WorkflowCheckpoint) => Promise<void>,
): Promise<WorkflowCheckpoint> {
  if (initial.workflow.phase !== 'approval') {
    throw new Error('Workflow is not awaiting approval');
  }

  let checkpoint: WorkflowCheckpoint = {
    ...initial,
    workflow: transitionWorkflow(initial.workflow, 'delivery'),
    status: 'running',
  };
  const output = await execute('delivery', checkpoint);
  checkpoint = {
    ...checkpoint,
    workflow: transitionWorkflow(checkpoint.workflow, 'completed'),
    outputs: { ...checkpoint.outputs, delivery: output },
    status: 'completed',
  };
  await persist(checkpoint);
  return checkpoint;
}
