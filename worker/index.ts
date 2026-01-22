import { Worker } from '@temporalio/worker';
import * as activities from '../activities';
import * as frontendActivities from '../activities/frontend';

async function run() {
  // Worker that connects to Temporal Server
  const worker = await Worker.create({
    workflowsPath: require.resolve('../workflows'),
    activities: {
      ...activities,
      ...frontendActivities,
    },
    taskQueue: 'task-queue',
    // Configure worker-level settings
    maxConcurrentActivityTaskExecutions: 10,
    maxConcurrentWorkflowTaskExecutions: 10,
  });

  console.log('Worker starting...');
  console.log('Task Queue: task-queue');
  console.log('Activities registered:', Object.keys({...activities, ...frontendActivities}).join(', '));
  
  // Start accepting tasks
  await worker.run();
}

run().catch((err) => {
  console.error('Worker failed to start:', err);
  process.exit(1);
});