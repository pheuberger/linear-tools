# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tools for Linear.app that provide functionality missing from the official UI:

### CLI Tool
- Generating visual dependency graphs for issues within projects
- Demoting workspace labels to team labels (creates team labels, migrates issues, removes old labels)

### Web Application (`web/`)
- Browser-based dependency graph visualization using ReactFlow
- Interactive graph with pan, zoom, and node selection
- Stored API key for convenient access (persisted in localStorage)
- Automatic project selection (auto-selects if only one project, shows selection UI for multiple)

**Warning**: This is an alpha-quality tool with no tests. The graph command is read-only and safe. The label demote command modifies workspace data and should be used cautiously.

## Development Commands

### CLI Tool (Root Directory)

#### Build & Compile
```bash
yarn build              # Clean and compile TypeScript
yarn compile            # Compile TypeScript only
yarn clean-build        # Remove build directory
```

#### Testing
```bash
yarn test              # Run all tests
yarn watch             # Run tests in watch mode
yarn snapupdate        # Update Jest snapshots
yarn coverage          # Generate coverage report
```

#### Code Quality
```bash
yarn format            # Run ESLint with --fix and Prettier
```

#### Running the CLI
```bash
yarn linear graph --project "Project Name" --svg output.svg
yarn linear label demote 'Label Name' 'Team Name'
```

### Web Application (`web/`)

#### Development
```bash
npm run dev            # Start Vite dev server on localhost:5173
npm run build          # Build for production
npm run preview        # Preview production build
npm run lint           # Run ESLint
```

## Environment Setup

### CLI Tool
Required environment variable:
```bash
export LINEAR_API_KEY=...
```

Dependencies:
- Node.js >= 15.14.0 (for String.prototype.replaceAll)
- Graphviz (for graph rendering): `brew install graphviz`

### Web Application
No environment variables needed - API key is entered and stored in the browser's localStorage.

Dependencies:
- Node.js >= 15.14.0

## Architecture

### CLI Tool Architecture

#### Entry Point
- `src/cli.ts` - Uses commander.js to define CLI structure and parse commands

#### Commands
- `src/commands/graph.ts` - Orchestrates graph generation (queries issues, builds graph, renders output)
- `src/commands/label/demote.ts` - Handles workspace label to team label migration with full lifecycle management

#### Core Libraries
- `src/lib/queries.ts` - Linear API interactions with pagination support (used by CLI, uses `@linear/sdk`)
  - `findRelatedIssues()` - Main entry point that fetches issues from multiple projects
  - `findProjectMatchingSubstring()` - Fuzzy project name matching
  - `findIssuesRelatedToProject()` - Paginated issue fetching with relationships

- `src/lib/graph-builder.ts` - Converts Linear issue data into Graphviz DOT format
  - `GraphBuilder` class handles node creation, edge management, and subgraph clustering
  - Supports clustering by cycle or project
  - Handles parent-child relationships and "blocks" relations
  - Visual encoding: node fill = state color, border color = priority, shape = issue type

#### Types
- `src/types/cli.ts` - Command option interfaces
- `src/types/data.ts` - Linear API data types and internal data structures

### Web Application Architecture (`web/`)

#### Entry Point
- `web/src/main.tsx` - React app entry point
- `web/src/App.tsx` - Main app component with routing logic (API key setup → project selection → loading → graph)

#### Components
- `web/src/components/ApiKeySetup.tsx` - API key input form
- `web/src/components/ProjectSelector.tsx` - Project selection UI (auto-selects if single project, shows checkboxes for multiple)
- `web/src/components/graph/GraphCanvas.tsx` - ReactFlow graph visualization
- `web/src/components/graph/CustomNode.tsx` - Custom node rendering with Linear issue styling

#### Hooks
- `web/src/hooks/useLinearApiKey.ts` - Manages API key in localStorage with save/clear functions
- `web/src/hooks/useGraphData.ts` - Fetches and transforms Linear data into graph format

#### Core Libraries
- `web/src/lib/graphql-client.ts` - **Direct GraphQL fetch client** for browser (replaces `@linear/sdk`)
  - Simple `fetch`-based client that calls `https://api.linear.app/graphql`
  - No Node.js dependencies, works natively in browser
- `web/src/lib/queries.ts` - Linear API GraphQL queries (shared query logic, adapted for browser)
  - `findAllProjects()` - Fetches all available projects (used by ProjectSelector)
  - `findRelatedIssues()` - Main entry point that fetches issues from multiple projects
- `web/src/lib/linear-service.ts` - Service layer that orchestrates data fetching
- `web/src/lib/graph-data-builder.ts` - Transforms Linear issues into graph nodes/edges
- `web/src/lib/graph-layout.ts` - Dagre layout engine for positioning nodes
- `web/src/lib/graph-transformer.ts` - Converts graph data to ReactFlow format

#### Types
- `web/src/types/graph.ts` - Graph data structures and options
- `web/src/types/issue.ts` - Linear API data types

## Key Technical Details

### Graph Generation Flow
1. Query Linear API for issues in specified project(s) with pagination
2. Build in-memory graph structure with nodes (issues) and edges (relationships)
3. Apply filtering (completed/cancelled/duplicates) and clustering options
4. Convert to DOT format using ts-graphviz
5. Spawn `dot` process to render to SVG/PNG

### Graph Visual Encoding
- **Node fill color**: Issue state color from Linear
- **Node border color**: Priority (red=urgent, orange=high, yellow=medium, blue=low, gray=none)
- **Node border style**: Double octagon = external issue not from queried project
- **Node shape**: Hexagon = epic (title contains "epic")
- **Node size**: Based on estimate value (0-8 story points)
- **Edge color**: Blue = parent-child, red = duplicate, black = blocks
- **URL**: Clicking node opens issue in Linear web UI
- **Tooltip**: Shows full description, assignee, cycle, estimate, priority

### Label Demotion Process
The `label demote` command is idempotent and works in these steps:
1. If workspace label has a parent label group, create corresponding team label group (with `(team name)` suffix)
2. Create team label matching workspace label (with suffix if in group)
3. Migrate all issues: add team label, remove workspace label
4. Delete workspace label
5. Rename team label to remove suffix

Note: If the workspace label is the last in its group, the parent group won't auto-delete and the team label group suffix won't be removed. Manual cleanup required.

### Linear API Integration

#### CLI Tool
- Uses `@linear/sdk` LinearClient for Node.js environment
- Raw GraphQL queries via `api.rawRequest()`
- Pagination handled with `after` cursor and `hasNextPage`
- Issue queries fetch: identifier, title, description, assignee, state, priority, estimate, cycle, children, relations
- Relations supported: "blocks" (shown by default), "duplicate" (shown with --dupes flag)

#### Web Application
- **Does NOT use `@linear/sdk`** (it has Node.js dependencies that don't work in browser)
- Uses direct GraphQL `fetch()` calls to `https://api.linear.app/graphql`
- Custom `GraphQLClient` class in `web/src/lib/graphql-client.ts`
- Same query structure and pagination logic as CLI
- Authorization via `Authorization: <API_KEY>` header (stored in localStorage)

## Code Style
- TypeScript with strict typing
- Prettier config: no semicolons, single quotes
- ESLint with TypeScript parser
- Husky pre-commit hook runs pretty-quick

## Development Philosophy

### Core Principles

**YAGNI (You Aren't Gonna Need It)**
- Only implement what is needed right now
- Don't add features for hypothetical future requirements
- Remove unused code without backwards-compatibility hacks

**KISS (Keep It Simple, Stupid)**
- Prefer simple, straightforward solutions
- Avoid premature abstractions
- Three similar lines of code is better than a premature helper function

**Low Cognitive Load**
- Write code that is easy to understand at a glance
- Minimize the amount of context needed to understand any piece of code
- Reduce mental effort required to reason about the code

**Avoid Deep Nesting**
- Keep nesting levels shallow (prefer early returns)
- Extract nested logic into well-named functions
- Use guard clauses to reduce indentation

### The Golden Rule: Separation of Procedural Code and Branching Logic

**A function should contain EITHER procedural code OR branching logic, but NEVER both.**

**Procedural functions** orchestrate a sequence of steps:
```typescript
// GOOD: Pure procedural orchestration
async function demoteLabel(labelName: string, teamName: string) {
  const label = await findWorkspaceLabel(labelName)
  const team = await findTeam(teamName)
  const teamLabel = await createTeamLabel(label, team)
  await migrateIssues(label, teamLabel)
  await deleteWorkspaceLabel(label)
  await renameTeamLabel(teamLabel)
}
```

**Branching functions** contain conditional logic:
```typescript
// GOOD: Pure branching logic
function shouldIncludeIssue(issue: Issue, options: FilterOptions): boolean {
  if (options.includeCompleted) return true
  if (issue.state.type === 'completed') return false
  if (issue.state.type === 'cancelled') return false
  return true
}
```

**AVOID mixing both** in the same function:
```typescript
// BAD: Mixed procedural and branching
async function processLabel(labelName: string, teamName: string) {
  const label = await findWorkspaceLabel(labelName)

  if (label.parent) {
    const group = await createLabelGroup(label.parent, teamName)
    const teamLabel = await createTeamLabel(label, team, group)
    await migrateIssues(label, teamLabel)
  } else {
    const teamLabel = await createTeamLabel(label, team)
    await migrateIssues(label, teamLabel)
  }

  await deleteWorkspaceLabel(label)
}
```

When you find yourself mixing procedural steps with branching logic, extract the branching into a separate function or use strategy pattern to keep concerns separated.
