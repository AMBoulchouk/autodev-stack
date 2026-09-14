import { createWorkflowRun, transitionWorkflow } from './workflow';

describe('autonomous delivery workflow', () => {
  it('starts at intake and advances through the SDD/TDD path', () => {
    let workflow = createWorkflowRun('Add customer onboarding');

    for (const phase of [
      'specification',
      'planning',
      'red',
      'green',
      'review',
      'approval',
      'delivery',
      'completed',
    ] as const) {
      workflow = transitionWorkflow(workflow, phase);
    }

    expect(workflow.phase).toBe('completed');
    expect(workflow.history).toHaveLength(9);
  });

  it('rejects a transition that bypasses specification', () => {
    const workflow = createWorkflowRun('Unsafe shortcut');
    expect(() => transitionWorkflow(workflow, 'green')).toThrow(
      'Invalid workflow transition',
    );
  });

  it('requires a non-empty intent', () => {
    expect(() => createWorkflowRun('  ')).toThrow('Intent is required');
  });
});
