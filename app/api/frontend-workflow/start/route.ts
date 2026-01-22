import { NextRequest, NextResponse } from 'next/server';
import { startFrontendWorkflow } from '../../../../lib/temporal';

export async function POST(request: NextRequest) {
  try {
    const taskInput = await request.json();
    
    // Validate input
    if (!taskInput.type || !taskInput.payload) {
      return NextResponse.json(
        { error: 'Invalid input: missing type or payload' },
        { status: 400 }
      );
    }

    // Start the frontend workflow (which handles retries internally)
    const handle = await startFrontendWorkflow({
      taskInput,
      maxPollAttempts: 30
    });
    
    return NextResponse.json({ 
      frontendWorkflowId: handle.workflowId,
      status: 'started'
    });
  } catch (error: any) {
    console.error('Failed to start frontend workflow:', error);
    
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
      { error: 'Failed to start frontend workflow', details: error.message },
      { status: 500 }
    );
  }
}