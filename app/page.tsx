'use client';

import { useState } from 'react';
import { TaskInput, WorkflowResult } from '../types/task';

export default function Home() {
  const [taskInput, setTaskInput] = useState<Partial<TaskInput>>({
    type: 'process',
    payload: { message: 'Hello, Temporal!' }
  });
  const [workflowId, setWorkflowId] = useState<string>('');
  const [result, setResult] = useState<WorkflowResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [useTemporalRetry, setUseTemporalRetry] = useState(false);

  const submitTask = async () => {
    if (!taskInput.type || !taskInput.payload) {
      setError('Please provide task type and payload');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const input: TaskInput = {
        id: `task-${Date.now()}`,
        type: taskInput.type as TaskInput['type'],
        payload: taskInput.payload
      };

      let response;
      if (useTemporalRetry) {
        // Use Temporal-based retry workflow
        response = await fetch('/api/frontend-workflow/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        });
      } else {
        // Use direct API call (original approach)
        response = await fetch('/api/workflow/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        });
      }

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.details || responseData.error || 'Failed to start workflow');
      }

      const workflowId = useTemporalRetry ? responseData.frontendWorkflowId : responseData.workflowId;
      setWorkflowId(workflowId);
      
      // Poll for result
      if (useTemporalRetry) {
        pollForFrontendResult(workflowId);
      } else {
        pollForResult(workflowId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  };

  const pollForFrontendResult = async (id: string) => {
    const maxAttempts = 60; // 60 seconds max for frontend workflow
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(`/api/frontend-workflow/status/${id}`);
        if (!response.ok) throw new Error('Failed to get status');
        
        const { status, result: workflowResult } = await response.json();
        
        if (status === 'completed') {
          // Frontend workflow completed, extract the actual result
          if (workflowResult?.success) {
            setResult(workflowResult.result);
          } else {
            setError(workflowResult?.error || 'Frontend workflow failed');
          }
          setLoading(false);
        } else if (status === 'failed' || status === 'error') {
          setError('Frontend workflow failed');
          setLoading(false);
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 1000);
        } else {
          setError('Frontend workflow timeout');
          setLoading(false);
        }
      } catch (err) {
        setError('Failed to poll frontend workflow status');
        setLoading(false);
      }
    };

    poll();
  };

  const pollForResult = async (id: string) => {
    const maxAttempts = 30; // 30 seconds max
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(`/api/workflow/status/${id}`);
        if (!response.ok) throw new Error('Failed to get status');
        
        const { status, result: workflowResult } = await response.json();
        
        if (status === 'completed') {
          setResult(workflowResult);
          setLoading(false);
        } else if (status === 'failed' || status === 'error') {
          setError('Workflow failed');
          setLoading(false);
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 1000);
        } else {
          setError('Workflow timeout');
          setLoading(false);
        }
      } catch (err) {
        setError('Failed to poll workflow status');
        setLoading(false);
      }
    };

    poll();
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1>Temporal Workflow Agent</h1>
      <p>Submit tasks and observe workflow execution through Temporal orchestration.</p>

      <div style={{ 
        backgroundColor: 'white', 
        padding: '2rem', 
        borderRadius: '8px',
        marginBottom: '2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2>Submit Task</h2>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Task Type:
          </label>
          <select 
            value={taskInput.type || ''} 
            onChange={(e) => setTaskInput(prev => ({ ...prev, type: e.target.value as TaskInput['type'] }))}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="parse">Parse</option>
            <option value="process">Process</option>
            <option value="format">Format</option>
          </select>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Payload (JSON):
          </label>
          <textarea
            value={JSON.stringify(taskInput.payload, null, 2)}
            onChange={(e) => {
              try {
                const payload = JSON.parse(e.target.value);
                setTaskInput(prev => ({ ...prev, payload }));
                setError('');
              } catch {
                setError('Invalid JSON in payload');
              }
            }}
            rows={6}
            style={{ 
              width: '100%', 
              padding: '0.5rem', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              fontFamily: 'monospace'
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
            <input
              type="checkbox"
              checked={useTemporalRetry}
              onChange={(e) => setUseTemporalRetry(e.target.checked)}
              style={{ marginRight: '0.5rem' }}
            />
            Use Temporal-based retry (recommended)
          </label>
          <small style={{ color: '#666', marginLeft: '1.5rem' }}>
            {useTemporalRetry 
              ? 'API calls will be retried automatically through Temporal workflows'
              : 'If not checked checkbox system uses direct API calls with manual retry logic'
            }
          </small>
        </div>

        <button 
          onClick={submitTask}
          disabled={loading}
          style={{
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem'
          }}
        >
          {loading ? 'Executing...' : 'Submit Task'}
        </button>
      </div>

      {error && (
        <div style={{ 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          padding: '1rem', 
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          Error: {error}
        </div>
      )}

      {workflowId && (
        <div style={{ 
          backgroundColor: 'white', 
          padding: '2rem', 
          borderRadius: '8px',
          marginBottom: '2rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3>Workflow Status</h3>
          <p><strong>Workflow ID:</strong> {workflowId}</p>
          <p><strong>Status:</strong> {loading ? 'Running...' : 'Completed'}</p>
        </div>
      )}

      {result && (
        <div style={{ 
          backgroundColor: 'white', 
          padding: '2rem', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3>Workflow Result</h3>
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '1rem', 
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            overflow: 'auto'
          }}>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}