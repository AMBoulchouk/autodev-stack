import {
  WorkflowCheckpoint,
  approveAndDeliver,
  executeUntilApproval,
} from './orchestrator';
import { createWorkflowRun } from './workflow';

describe('resumable orchestrator', () => {
  const output = (phase: string) => ({
    summary: `${phase} output`,
    evidence: [],
    risks: [],
    nextInputs: [],
  });

  const createCheckpoint = (): WorkflowCheckpoint => ({
    workflow: createWorkflowRun('Add customer onboarding'),
    outputs: {},
    status: 'running',
  });

  it('executes SDD and TDD phases and pauses for approval', async () => {
    const executed: string[] = [];
    const checkpoint = await executeUntilApproval(
      createCheckpoint(),
      async (phase) => {
        executed.push(phase);
        return output(phase);
      },
      async () => undefined,
    );

    expect(executed).toEqual([
      'specification',
      'planning',
      'red',
      'green',
      'review',
    ]);
    expect(checkpoint.status).toBe('awaiting_approval');
    expect(checkpoint.workflow.phase).toBe('approval');
  });

  it('resumes an approved checkpoint and completes delivery', async () => {
    const awaitingApproval = await executeUntilApproval(
      createCheckpoint(),
      async (phase) => output(phase),
      async () => undefined,
    );
    const completed = await approveAndDeliver(
      awaitingApproval,
      async () => output('delivery'),
      async () => undefined,
    );

    expect(completed.status).toBe('completed');
    expect(completed.outputs.delivery?.summary).toBe('delivery output');
  });
});
