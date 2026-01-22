import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';
import { TaskInput, WorkflowResult } from '../types/task';

// Configure activity options with explicit retry and timeout policies
const { parseTask, executeTool, formatResult } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30s',
  retry: {
    initialInterval: '1s',
    maximumInterval: '10s',
    backoffCoefficient: 2,
    maximumAttempts: 3,
  },
});

export async function taskWorkflow(input: TaskInput): Promise<WorkflowResult> {
  const workflowStartTime = Date.now();
  const results = [];

  try {
    // Different workflow paths based on task type
    switch (input.type) {
      case 'parse':
        // Parse-only workflow: just validate and structure input
        const parseResult = await parseTask(input);
        results.push(parseResult);
        break;

      case 'format':
        // Format-only workflow: take input and format it
        const formatOnlyResult = await formatResult(input.payload, input.id);
        results.push(formatOnlyResult);
        break;

      case 'process':
      default:
        // Full processing workflow (original behavior)
        // Step 1: Parse the task input
        const parseStep = await parseTask(input);
        results.push(parseStep);

        // Fail fast if parsing failed
        if (parseStep.status === 'failed') {
          return {
            taskId: input.id,
            results,
            totalExecutionTime: Date.now() - workflowStartTime,
            status: 'failed'
          };
        }

        // Step 2: Execute the tool with parsed data
        const toolResult = await executeTool(parseStep.result, input.id);
        results.push(toolResult);

        // Step 3: Format the result
        let finalResult;
        if (toolResult.status === 'success') {
          finalResult = await formatResult(toolResult.result, input.id);
        } else {
          finalResult = await formatResult({ error: toolResult.error }, input.id);
        }
        results.push(finalResult);
        break;
    }

    // Determine overall workflow status
    const hasFailures = results.some(r => r.status === 'failed');
    
    return {
      taskId: input.id,
      results,
      totalExecutionTime: Date.now() - workflowStartTime,
      status: hasFailures ? 'failed' : 'completed'
    };

  } catch (error) {
    return {
      taskId: input.id,
      results,
      totalExecutionTime: Date.now() - workflowStartTime,
      status: 'failed'
    };
  }
}