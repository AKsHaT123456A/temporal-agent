import { TaskResult } from '../types/task';

export async function executeTool(parsedData: any, taskId: string): Promise<TaskResult> {
  const startTime = Date.now();
  
  try {
    // Simulate processing time based on task complexity
    const processingTime = Math.random() * 500 + 200; // 200-700ms
    await new Promise(resolve => setTimeout(resolve, processingTime));

    // Simulate different outcomes based on input
    if (parsedData.shouldFail || parsedData.payload?.shouldFail) {
      throw new Error('Simulated tool execution failure');
    }

    const processedResult = {
      ...parsedData,
      processed: true,
      toolOutput: `Processed ${taskId} successfully`,
      metrics: {
        itemsProcessed: Math.floor(Math.random() * 100) + 1,
        processingTime
      }
    };

    return {
      id: taskId,
      status: 'success',
      result: processedResult,
      executionTime: Date.now() - startTime
    };
  } catch (error) {
    return {
      id: taskId,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Tool execution failed',
      executionTime: Date.now() - startTime
    };
  }
}