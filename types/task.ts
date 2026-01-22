export interface TaskInput {
  id: string;
  type: 'parse' | 'process' | 'format';
  payload: Record<string, any>;
}

export interface TaskResult {
  id: string;
  status: 'success' | 'failed';
  result?: any;
  error?: string;
  executionTime: number;
}

export interface WorkflowResult {
  taskId: string;
  results: TaskResult[];
  totalExecutionTime: number;
  status: 'completed' | 'failed';
}