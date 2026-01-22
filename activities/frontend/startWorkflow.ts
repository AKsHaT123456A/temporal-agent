export interface StartWorkflowResult {
  success: boolean;
  workflowId?: string;
  error?: string;
}

export async function startWorkflow(taskInput: any): Promise<StartWorkflowResult> {
  try {
    const response = await fetch('http://localhost:3000/api/workflow/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskInput)
    });

    const responseData = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: responseData.details || responseData.error || 'Failed to start workflow'
      };
    }

    return {
      success: true,
      workflowId: responseData.workflowId
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}