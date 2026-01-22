import { NextRequest, NextResponse } from 'next/server';
import { startTaskWorkflow } from '../../../../lib/temporal';
import { TaskInput } from '../../../../types/task';

export async function POST(request: NextRequest) {
  try {
    const input: TaskInput = await request.json();
    
    // Validate input
    if (!input.id || !input.type || !input.payload) {
      return NextResponse.json(
        { error: 'Invalid input: missing required fields' },
        { status: 400 }
      );
    }

    // Start the workflow
    const handle = await startTaskWorkflow(input);
    
    return NextResponse.json({ 
      workflowId: handle.workflowId,
      status: 'started'
    });
  } catch (error: any) {
    console.error('Failed to start workflow:', error);
    
    // Check if it's a connection error
    if (error.code === 14 || error.message?.includes('ECONNREFUSED')) {
      return NextResponse.json(
        { 
          error: 'Cannot connect to Temporal server. Please ensure Temporal server is running on localhost:7233',
          details: 'Run: temporal server start-dev'
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to start workflow', details: error.message },
      { status: 500 }
    );
  }
}