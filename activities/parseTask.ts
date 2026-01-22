import { TaskInput, TaskResult } from '../types/task';

export async function parseTask(input: TaskInput): Promise<TaskResult> {
  const startTime = Date.now();
  
  try {
    // Simulate parsing logic - validate and structure the input
    if (!input.id || !input.type || !input.payload) {
      throw new Error('Invalid task input: missing required fields');
    }

    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 100));

    const parsedPayload = {
      ...input.payload,
      parsed: true,
      timestamp: new Date().toISOString()
    };

    return {
      id: input.id,
      status: 'success',
      result: parsedPayload,
      executionTime: Date.now() - startTime
    };
  } catch (error) {
    return {
      id: input.id,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      executionTime: Date.now() - startTime
    };
  }
}