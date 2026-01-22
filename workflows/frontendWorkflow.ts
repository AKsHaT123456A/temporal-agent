import { proxyActivities } from '@temporalio/workflow';
import type * as frontendActivities from '../activities/frontend';

//frontend activities with retry policies
const { pollWorkflowStatus, startWorkflow } = proxyActivities<typeof frontendActivities>({
  startToCloseTimeout: '10s',
  retry: {
    initialInterval: '500ms',
    maximumInterval: '5s',
    backoffCoefficient: 2,
    maximumAttempts: 5,
  },
});

export interface FrontendWorkflowInput {
  taskInput: any;
  maxPollAttempts?: number;
}

export interface FrontendWorkflowResult {
  success: boolean;
  workflowId?: string;
  result?: any;
  error?: string;
}

export async function frontendWorkflow(input: FrontendWorkflowInput): Promise<FrontendWorkflowResult> {
  try {
    // Step 1: Start the task workflow with retry
    const startResult = await startWorkflow(input.taskInput);
    
    if (!startResult.success) {
      return {
        success: false,
        error: startResult.error || 'Failed to start workflow'
      };
    }

    const workflowId = startResult.workflowId;
    const maxAttempts = input.maxPollAttempts || 30;

    // Step 2: Poll for completion with retry
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const statusResult = await pollWorkflowStatus(workflowId);
      
      if (statusResult.status === 'completed') {
        return {
          success: true,
          workflowId,
          result: statusResult.result
        };
      }
      
      if (statusResult.status === 'failed' || statusResult.status === 'error') {
        return {
          success: false,
          workflowId,
          error: 'Workflow execution failed'
        };
      }

      // Wait 1 second before next poll (deterministic sleep)
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return {
      success: false,
      workflowId,
      error: 'Workflow polling timeout'
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}