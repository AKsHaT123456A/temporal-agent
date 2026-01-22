import { TaskResult } from '../types/task';

export async function formatResult(processedData: any, taskId: string): Promise<TaskResult> {
  const startTime = Date.now();
  
  try {
    // Simulate result formatting - structure output for consumption
    await new Promise(resolve => setTimeout(resolve, 50));

    const formattedResult = {
      summary: {
        taskId,
        completedAt: new Date().toISOString(),
        success: true
      },
      data: processedData,
      metadata: {
        version: '1.0.0',
        format: 'json',
        size: JSON.stringify(processedData).length
      }
    };

    return {
      id: taskId,
      status: 'success',
      result: formattedResult,
      executionTime: Date.now() - startTime
    };
  } catch (error) {
    return {
      id: taskId,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Formatting failed',
      executionTime: Date.now() - startTime
    };
  }
}