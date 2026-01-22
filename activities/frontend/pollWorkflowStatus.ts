export interface PollStatusResult {
  status: string;
  result?: any;
  error?: string;
}

export async function pollWorkflowStatus(workflowId: string): Promise<PollStatusResult> {
  try {
    const response = await fetch(`http://localhost:3000/api/workflow/status/${workflowId}`);
    
    if (!response.ok) {
      return {
        status: 'error',
        error: 'Failed to get workflow status'
      };
    }
    
    const data = await response.json();
    
    return {
      status: data.status,
      result: data.result
    };
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}