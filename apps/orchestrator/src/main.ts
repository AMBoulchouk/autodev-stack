import { Agent, MCPServerStdio, run } from '@openai/agents';
import { createWorkflowRun, transitionWorkflow } from './workflow';

async function main() {
  const intent = process.argv.slice(2).join(' ').trim();
  const workflow = createWorkflowRun(intent);
  const engramCommand = process.env.ENGRAM_MCP_COMMAND?.trim();
  const engram = engramCommand
    ? new MCPServerStdio({
        name: 'Engram persistent project memory',
        fullCommand: engramCommand,
      })
    : undefined;

  if (engram) {
    await engram.connect();
  }

  try {
    const agent = new Agent({
      name: 'Autodev delivery orchestrator',
      instructions: [
        'Transform product intent into an executable software specification.',
        'Follow SDD and strict RED-GREEN-REFACTOR TDD.',
        'Never claim tests, reviews, deployments, or approvals that did not occur.',
        'Require human approval before production, destructive data changes, IAM changes, or material cost increases.',
        'Return a concise specification, acceptance scenarios, implementation tasks, test plan, risks, and approval gates.',
      ].join(' '),
      mcpServers: engram ? [engram] : [],
    });

    const specification = transitionWorkflow(workflow, 'specification');
    const result = await run(agent, specification.intent);

    process.stdout.write(
      JSON.stringify(
        {
          workflow: specification,
          output: result.finalOutput,
        },
        null,
        2,
      ),
    );
  } finally {
    await engram?.close();
  }
}

void main();
