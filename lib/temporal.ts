import { Client, WorkflowHandle, Connection } from '@temporalio/client';
import { TaskInput, WorkflowResult } from '../types/task';
import { taskWorkflow, frontendWorkflow } from '../workflows';
import type { FrontendWorkflowInput, FrontendWorkflowResult } from '../workflows/frontendWorkflow';

let client: Client | null = null;

export async function getTemporalClient(): Promise<Client> {
  if (!client) {
    // Create connection first
    const connection = await Connection.connect({
      address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
    });
    
    client = new Client({
      connection,
      namespace: 'default',
    });
  }
  return client;
}

export async function startTaskWorkflow(input: TaskInput): Promise<WorkflowHandle<typeof taskWorkflow>> {
  const client = await getTemporalClient();
  
  const handle = await client.workflow.start(taskWorkflow, {
    args: [input],
    taskQueue: 'task-queue',
    workflowId: `${input.id}`,
    //workflow-level timeouts
    workflowExecutionTimeout: '5m',
    workflowRunTimeout: '2m',
  });

  return handle;
}

export async function startFrontendWorkflow(input: FrontendWorkflowInput): Promise<WorkflowHandle<typeof frontendWorkflow>> {
  const client = await getTemporalClient();
  
  const handle = await client.workflow.start(frontendWorkflow, {
    args: [input],
    taskQueue: 'task-queue',
    workflowId: `frontend-${Date.now()}`,
    workflowExecutionTimeout: '10m',
    workflowRunTimeout: '5m',
  });

  return handle;
}

export async function getWorkflowResult(workflowId: string): Promise<WorkflowResult | null> {
  try {
    const client = await getTemporalClient();
    const handle = client.workflow.getHandle(workflowId);
    return await handle.result();
  } catch (error) {
    console.error('Failed to get workflow result:', error);
    return null;
  }
}

export async function getWorkflowStatus(workflowId: string): Promise<{
  status: string;
  result?: WorkflowResult;
}> {
  try {
    const client = await getTemporalClient();
    const handle = client.workflow.getHandle(workflowId);
    
    const description = await handle.describe();
    
    if (description.status.name === 'COMPLETED') {
      const result = await handle.result();
      return { status: 'completed', result };
    }
    
    return { status: description.status.name.toLowerCase() };
  } catch (error) {
    console.error('Failed to get workflow status:', error);
    return { status: 'error' };
  }
}