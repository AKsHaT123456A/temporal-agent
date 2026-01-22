import { NextRequest, NextResponse } from 'next/server';
import { getWorkflowStatus } from '../../../../../lib/temporal';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { workflowId: string } }
) {
  try {
    const { workflowId } = params;
    
    if (!workflowId) {
      return NextResponse.json(
        { error: 'Workflow ID is required' },
        { status: 400 }
      );
    }

    const status = await getWorkflowStatus(workflowId);
    
    return NextResponse.json(status);
  } catch (error) {
    console.error('Failed to get workflow status:', error);
    return NextResponse.json(
      { error: 'Failed to get workflow status' },
      { status: 500 }
    );
  }
}