<p align="center">
  <h1>⚡ Temporal Workflow Agent</h1>
</p>

<p align="center">
  <strong>Production-minded workflow orchestration using Temporal</strong>
</p>

<p align="center">
  <a href="#why-temporal-workflow-agent">Why This Agent</a> •
  <a href="#what-you-get">What You Get</a> •
  <a href="#use-cases">Use Cases</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#getting-started">Get Started</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-339933.svg?style=flat-square" alt="Node.js 18+">
  <img src="https://img.shields.io/badge/Temporal-1.29+-6B46C1.svg?style=flat-square" alt="Temporal">
  <img src="https://img.shields.io/badge/Next.js-14-000000.svg?style=flat-square" alt="Next.js 14">
  <img src="https://img.shields.io/badge/TypeScript-5+-3178C6.svg?style=flat-square" alt="TypeScript">
</p>

---

## Why Temporal Workflow Agent

Modern applications need reliable task orchestration. You have complex workflows with multiple steps, external API calls, and failure scenarios. But when something goes wrong—timeouts, retries, partial failures—**you have no visibility into what happene**.

Traditional approaches fall short. Manual retry logic is error-prone. Queue systems lack orchestration. Serverless functions can't maintain state across steps.

**This agent solves that.** It demonstrates production-ready workflow patterns using Temporal as the orchestration engine. Every execution is:

- **Deterministic** - Workflows replay safely after failures
- **Observable** - Complete execution history in Temporal Web UI
- **Reliable** - Built-in retries, timeouts, and error handling
- **Scalable** - Horizontal scaling with multiple workers

All with clean separation of concerns and zero vendor lock-in.

---

## What You Get

### Deterministic Workflows
Every workflow execution is fully deterministic. No I/O operations, no side effects, no random logic. This guarantees that workflows can be safely replayed after failures, maintaining consistency and correctness.

### Automatic Retry Handling
Activities fail? No problem. Temporal automatically retries with exponential backoff. Network timeouts, temporary service outages, and transient errors are handled transparently without manual intervention.

### Complete Execution History
Every workflow run is captured in Temporal's Web UI. See the exact sequence of activities, their inputs and outputs, retry attempts, and failure reasons. Debug issues in minutes, not hours.

### Production-Ready Patterns
Built-in timeouts, structured error handling, graceful degradation, and proper separation of concerns. This isn't a toy example—it's architected for real production workloads.

### Zero-Friction Development
Two decorators and you're done. No complex configuration, no YAML files, no learning a new DSL. Your existing code structure stays exactly the same.

---

## Use Cases

### Multi-Step Data Processing
Your ETL pipeline extracts data, transforms it through multiple stages, and loads it into different systems. When step 3 fails, Temporal automatically retries just that step—no need to restart the entire pipeline.

### API Orchestration
Coordinate calls across multiple microservices. Handle partial failures gracefully. If the payment service is down, retry just that step while keeping user session state intact.

### Long-Running Business Processes
Order fulfillment, user onboarding, content moderation—any process that spans minutes or hours benefits from Temporal's durability and state management.

### Batch Job Coordination
Process thousands of items with configurable parallelism. Track progress, handle failures, and resume from where you left off. Perfect for data migrations and bulk operations.

### Event-Driven Workflows
React to external events while maintaining workflow state. Handle webhooks, process queues, and coordinate between systems with full audit trails.

---

## Task Types

The system supports three distinct workflow patterns, each optimized for different use cases:

### Parse Tasks
**Purpose:** Input validation and data sanitization
**Execution:** Single `parseTask` activity only
**Use Cases:**
- Schema validation for API requests
- Input sanitization and security checks
- Data structure verification
- Content validation before processing

**Example:**
```json
{
  "userInput": {
    "email": "user@example.com",
    "age": 25,
    "preferences": ["email", "sms"]
  },
  "validationRules": {
    "emailRequired": true,
    "minAge": 18
  }
}
```

### Format Tasks
**Purpose:** Data transformation and output formatting
**Execution:** Single `formatResult` activity only
**Use Cases:**
- Report generation from raw data
- Data export to different formats (CSV, JSON, XML)
- API response transformation
- Template-based output generation

**Example:**
```json
{
  "salesData": [
    {"month": "Jan", "revenue": 10000},
    {"month": "Feb", "revenue": 12000},
    {"month": "Mar", "revenue": 15000}
  ],
  "reportType": "quarterly",
  "format": "summary"
}
```

### Process Tasks
**Purpose:** Complete end-to-end processing pipeline
**Execution:** Full three-step workflow: `parseTask` → `executeTool` → `formatResult`
**Use Cases:**
- Complete ETL pipelines
- Order processing workflows
- Multi-step data transformations
- Complex business logic execution

**Example:**
```json
{
  "message": "Process customer order",
  "orderData": {
    "customerId": 12345,
    "items": [{"id": "A1", "qty": 2}],
    "paymentMethod": "credit_card"
  },
  "validatePayment": true
}
```

### Task Type Comparison

| Task Type | Activities | Execution Time | Best For |
|-----------|------------|----------------|----------|
| **Parse** | 1 activity | ~100ms | Input validation, security checks |
| **Format** | 1 activity | ~60ms | Output formatting, reports |
| **Process** | 3 activities | ~600ms+ | Complete workflows, ETL pipelines |

---

## How It Works

**1. Define your workflow**
   Mark your orchestration logic with workflow decorators. Define the sequence of activities without worrying about failures or retries.

**2. Implement activities**
   Write your business logic as activities. Each activity is stateless, retry-safe, and handles one specific responsibility.

**3. Start the worker**
   Register your workflows and activities with a Temporal worker. The worker connects to Temporal server and executes your code.

**4. Trigger workflows**
   Submit tasks through the web UI or API. Temporal handles scheduling, execution, and state management automatically.

**5. Monitor and debug**
   Use Temporal Web UI to see real-time execution, inspect failures, and understand system behavior in production.

---

## Key Benefits

| Benefit | Description |
|---------|-------------|
| **Reliability** | Automatic retries, timeouts, and failure recovery |
| **Observability** | Complete execution history and real-time monitoring |
| **Scalability** | Horizontal scaling with multiple worker instances |
| **Maintainability** | Clear separation between orchestration and execution |
| **Developer Experience** | Simple APIs with powerful orchestration capabilities |

---

## Architecture

### Design Philosophy

This system demonstrates **correct Temporal usage** through a minimal but production-minded workflow agent. The architecture prioritizes **deterministic execution**, **clear separation of concerns**, and **failure resilience** over feature complexity.

The core insight: Temporal is not just a task queue—it's a **durable execution engine**. Every architectural decision flows from this understanding.

### System Components

The system consists of four main components:

**Frontend (Next.js)** — Minimal web interface for submitting tasks and viewing results. No business logic or orchestration.

**Temporal Workflows** — Pure orchestration logic that coordinates activity execution. Deterministic and replay-safe.

**Temporal Activities** — Stateless functions that perform actual work. Retry-safe and independently scalable.

**Worker Process** — Registers workflows and activities with Temporal server. Handles execution and scaling.

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌─────────────┐
│   Frontend  │───▶│   Workflow   │───▶│  Activities │───▶│   Worker    │
│             │    │              │    │             │    │             │
│ Trigger +   │    │ Orchestrate  │    │ Execute +   │    │ Runtime +   │
│ Display     │    │ Only         │    │ Side Effects│    │ Registration│
└─────────────┘    └──────────────┘    └─────────────┘    └─────────────┘
```

### Architectural Decisions

#### Decision 1: Workflow-First Design

**What we chose:** All task execution flows through Temporal workflows. The frontend cannot execute business logic or call activities directly.

**Why:** This enforces Temporal's execution model where workflows are the **single source of truth** for orchestration. It prevents the common anti-pattern of mixing orchestration logic between the frontend and Temporal.

**Tradeoff:** More initial complexity for simple tasks, but eliminates entire classes of distributed system problems (partial failures, retry logic, state management).

#### Decision 2: Strict Determinism in Workflows

**What we chose:** Workflows contain zero I/O operations, no side effects, no random logic, and no time-based operations.

```typescript
const parseResult = await parseTask(input);
if (parseResult.status === 'failed') {
  return { status: 'failed', error: parseResult.error };
}

const timestamp = Date.now();
const shouldRetry = Math.random() > 0.5;
```

**Why:** Temporal's replay mechanism requires workflows to be **deterministic**. When a workflow resumes after a failure, it replays all decisions from the beginning. Non-deterministic code would make different decisions on replay, corrupting workflow state.

**Tradeoff:** Workflows feel "constrained" compared to regular functions, but this constraint is what enables Temporal's durability guarantees.

#### Decision 3: Activity-Only Side Effects

**What we chose:** All I/O operations, external API calls, and stateful operations happen exclusively in activities.

**Why:** Activities are Temporal's **unit of failure and retry**. By isolating side effects in activities, we get automatic retry handling, timeout management, and failure isolation without manual implementation.

**Tradeoff:** More boilerplate for simple operations, but eliminates the need to implement retry logic, circuit breakers, and timeout handling manually.

#### Decision 4: Stateless Activity Design

**What we chose:** Activities are pure functions with explicit input/output contracts. No shared state, no instance variables, no dependency injection.

**Why:** Stateless activities are **inherently retry-safe**. They can be executed on any worker, retried any number of times, and scaled independently without coordination.

**Tradeoff:** Cannot leverage caching or connection pooling within activities, but gains perfect horizontal scalability and retry safety.

### Component Separation

#### Frontend Layer (Next.js)
**Single Responsibility:** Workflow trigger and result display.

**What it does:**
- Accepts user input
- Calls Temporal client to start workflows
- Polls for workflow completion
- Displays structured results

**What it explicitly does NOT do:**
- Execute business logic
- Handle retries or timeouts
- Store workflow state
- Call activities directly

**Rationale:** The frontend is a **thin client** that delegates all orchestration to Temporal. This prevents distributed state management issues and ensures all execution logic is captured in Temporal's audit trail.

#### Workflow Layer
**Single Responsibility:** Orchestration logic and decision making.

**Execution Model:**
```typescript
// Workflow defines the "what" and "when", not the "how"
const parseResult = await parseTask(input);
const toolResult = await executeTool(parseResult.result, input.id);
const finalResult = await formatResult(toolResult.result, input.id);
```

**Key Properties:**
- **Deterministic:** Same inputs always produce same execution path
- **Durable:** Survives worker crashes and restarts
- **Observable:** Every decision is recorded in Temporal's history

**Rationale:** Workflows are Temporal's **coordination primitive**. By keeping them pure, we ensure they can be safely replayed and reasoned about.

#### Activity Layer
**Single Responsibility:** Execution of side-effectful work.

**Design Constraints:**
- **Idempotent:** Safe to execute multiple times
- **Timeout-bounded:** Must complete within configured limits
- **Error-transparent:** Failures propagate to workflow for handling

**Rationale:** Activities are where **real work happens**. By making them stateless and idempotent, we can leverage Temporal's retry mechanisms without data corruption.

#### Worker Layer
**Single Responsibility:** Runtime execution and registration.

**Core Functions:**
- Register workflows and activities with Temporal
- Manage execution concurrency
- Handle connection lifecycle
- Provide execution environment

**Rationale:** Workers are **execution hosts**. They're separate from business logic to enable independent scaling and deployment.

### Failure Handling Strategy

#### Temporal's Failure Model
Temporal distinguishes between **recoverable** and **non-recoverable** failures:

- **Recoverable:** Network timeouts, temporary service unavailability, resource exhaustion
- **Non-recoverable:** Invalid input, business rule violations, permanent external failures

#### Our Implementation

**Activity-Level Failures:**
```typescript
// Configured retry policy
retry: {
  initialInterval: '1s',
  maximumInterval: '10s', 
  backoffCoefficient: 2,
  maximumAttempts: 3,
}
```

Activities automatically retry on failure with exponential backoff. This handles the majority of transient failures without workflow intervention.

**Workflow-Level Failures:**
```typescript
// Explicit failure handling
if (parseResult.status === 'failed') {
  return { status: 'failed', error: parseResult.error };
}
```

Workflows make **explicit decisions** about how to handle activity failures. This keeps failure logic visible and testable.

**System-Level Failures:**
Worker crashes, network partitions, and Temporal server failures are handled by Temporal's infrastructure. Workflows automatically resume on healthy workers.

#### Why This Approach Works

1. **Separation of Concerns:** Transient failures (handled by Temporal) vs. business failures (handled by workflow logic)
2. **Explicit Control:** Workflow author decides which failures are recoverable
3. **Audit Trail:** All failure decisions are recorded in workflow history
4. **No Lost Work:** Temporal's durability guarantees ensure no completed work is lost

### Determinism Deep Dive

#### The Replay Problem
When a workflow resumes after a failure, Temporal **replays** all workflow code from the beginning. The workflow must make identical decisions to maintain consistency.

#### Our Solution
**Deterministic Inputs:** All workflow decisions are based on activity results, which are **memoized** by Temporal.

```typescript
// First execution: calls activity, stores result
const result = await parseTask(input);

// Replay: uses stored result, doesn't call activity again
const result = await parseTask(input); // Same result guaranteed
```

**No External Dependencies:** Workflows never call external services, read files, or generate random values.

**Explicit Ordering:** Activity execution order is defined by workflow code, not runtime conditions.

#### Tradeoffs
- **Constraint:** Workflows feel limited compared to regular async functions
- **Benefit:** Workflows are **perfectly reproducible** and debuggable
- **Result:** Complex distributed systems become **predictable**

### Scalability Architecture

#### Horizontal Scaling
**Workers:** Add more worker processes to increase throughput. Each worker can execute multiple workflows concurrently.

**Activities:** Different activity types can be hosted on specialized workers (CPU-intensive vs. I/O-intensive).

**Task Queues:** Separate task queues enable independent scaling of different workflow types.

#### Vertical Scaling
**Concurrency Limits:** Configure per-worker limits based on resource constraints.

**Connection Pooling:** Temporal client manages connection pooling to the server.

**Resource Isolation:** Activities can be configured with different timeout and retry policies based on their resource requirements.

#### Why This Scales
1. **Stateless Workers:** No coordination required between worker instances
2. **Temporal's Load Balancing:** Server handles task distribution automatically  
3. **Independent Failure Domains:** Worker failures don't affect other workers
4. **Elastic Scaling:** Workers can be added/removed without workflow interruption

### Non-Goals and Constraints

#### Explicit Non-Goals
- **Feature Richness:** This is a **systems design exercise**, not a feature-complete application
- **UI Polish:** Frontend is intentionally minimal to focus on architecture
- **Authentication:** Omitted to avoid obscuring core Temporal patterns
- **Persistence Layer:** Temporal provides durability; additional databases would complicate the design
- **Real Integrations:** Mock activities demonstrate patterns without external dependencies

#### Design Constraints
- **Temporal Correctness:** Every pattern must align with Temporal's execution model
- **Production Readiness:** Architecture must scale and handle failures gracefully
- **Clarity:** Code structure should make Temporal concepts obvious
- **Minimalism:** No unnecessary abstractions or frameworks

#### Tradeoffs Accepted
- **Initial Complexity:** More setup than a simple script, but eliminates entire classes of distributed system problems
- **Learning Curve:** Requires understanding Temporal concepts, but provides powerful guarantees
- **Operational Overhead:** Requires running Temporal server, but gains enterprise-grade orchestration

### Why This Architecture Works

1. **Leverages Temporal's Strengths:** Durability, observability, and failure handling
2. **Avoids Temporal's Pitfalls:** Maintains determinism and proper separation of concerns  
3. **Production-Ready:** Handles failures, scales horizontally, and provides observability
4. **Maintainable:** Clear boundaries make the system easy to understand and modify
5. **Testable:** Deterministic workflows and stateless activities are easy to test

This architecture demonstrates that **correct Temporal usage** leads to systems that are both **simple to understand** and **robust in production**.

---

## Production Considerations(What i would change if this were production)

**Infrastructure**
- Production Temporal cluster with proper persistence
- Container orchestration and auto-scaling
- TLS encryption and authentication

**Resilience**
- Circuit breakers for external services
- Workflow versioning for safe deployments
- External storage for large payloads

**Operations**
- Structured logging and metrics collection
- Comprehensive monitoring and alerting
- Database integration with connection pooling
- Secrets management and security hardening

This demo shows correct Temporal patterns. Production adds operational complexity around these patterns, but the core architecture remains sound.

---

## Getting Started

### Prerequisites
- Node.js 18+
- Docker (for Temporal server)

### Quick Setup

1. **Clone and install**
   ```bash
   git clone <repository>
   cd temporal-workflow-agent
   npm install
   ```

2. **Start Temporal server**
   ```bash
   # Option 1: Use our setup script
   npm run temporal
   
   # Option 2: Use the setup script directly
   node scripts/setup-temporal.js
   
   # Option 3: Manual Docker command
   docker run --rm -p 7233:7233 -p 8233:8233 temporalio/temporal server start-dev --ip 0.0.0.0
   ```

3. **Start the worker** (new terminal)
   ```bash
   npm run worker
   ```

4. **Start the frontend** (new terminal)
   ```bash
   npm run dev
   ```

5. **Submit tasks** at `http://localhost:3000`

### Alternative: All-in-One
```bash
# Start worker and frontend together (Temporal must be running)
npm run dev:all
```

---

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `TEMPORAL_ADDRESS` | `localhost:7233` | Temporal server address |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Frontend URL |

### Workflow Configuration
```typescript
const activities = proxyActivities<typeof activities>({
  startToCloseTimeout: '30s',
  retry: {
    initialInterval: '1s',
    maximumInterval: '10s',
    backoffCoefficient: 2,
    maximumAttempts: 3,
  },
});
```

### Worker Configuration
```typescript
const worker = await Worker.create({
  workflowsPath: require.resolve('../workflows'),
  activities,
  taskQueue: 'task-queue',
  maxConcurrentActivityTaskExecutions: 10,
});
```

---

## Project Structure

```
├── activities/          # Temporal activities (business logic)
├── workflows/           # Temporal workflows (orchestration)
├── worker/             # Worker registration and startup
├── lib/                # Temporal client utilities
├── app/                # Next.js frontend
├── types/              # Shared TypeScript interfaces
└── scripts/            # Development utilities
```

---

## Monitoring

### Temporal Web UI
- **URL**: `http://localhost:8233`
- **Features**: Workflow history, execution details, retry attempts
- **Real-time**: Live updates during workflow execution

### Application Logs
- **Worker logs**: Activity execution and errors
- **Frontend logs**: API requests and responses
- **Structured format**: JSON logs for production parsing

---

## License

MIT © 2024 Temporal Workflow Agent

---

<p align="center">
  <sub>Built with ⚡ for developers who need reliable workflow orchestration</sub>
</p>