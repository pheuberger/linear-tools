# Linear Dependency Graph Web App

Interactive web application for visualizing Linear issue dependencies using React Flow.

## Features

- Interactive dependency graph visualization
- Visual encoding of issue metadata (state colors, priorities, estimates)
- Support for clustering by cycle or project
- Filtering options (completed, cancelled, duplicates, external issues)
- Clickable nodes linking to Linear issues
- Pan, zoom, and minimap controls

## Getting Started

### Prerequisites

- Node.js >= 15.14.0
- Linear API key (get from https://linear.app/settings/api)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Opens http://localhost:5173

On first load, you'll be prompted to enter your Linear API key, which will be saved in localStorage.

### Production Build

```bash
npm run build
```

Outputs to `dist/` directory - can be deployed to any static hosting service.

## Usage

1. Enter your Linear API key
2. The app will fetch issues from "My Project" (configurable in `App.tsx`)
3. Explore the interactive graph:
   - Click nodes to open issues in Linear
   - Use mouse wheel to zoom
   - Drag to pan
   - Hover over nodes for full details

## Configuration

Edit `App.tsx` to change the default options:

```typescript
const [options] = useState<GraphOptions>({
  project: ['Your Project Name'],  // Project to query
  completed: false,                 // Include completed issues
  cancelled: false,                 // Include cancelled issues
  duplicates: false,                // Show duplicate relationships
  clusterBy: 'cycle',              // or 'project', or undefined
})
```

## Visual Encoding

- **Node fill color**: Issue state (from Linear)
- **Node border color**: Priority (red=urgent, orange=high, yellow=medium, blue=low, gray=none)
- **Node size**: Estimate (story points)
- **Node shape**: Hexagon for epics, octagon for external issues
- **Font color**: White on dark backgrounds, black on light
- **Edge color**: Blue for parent-child, red for duplicates, black for blocks

## Deployment

The app is a static site and can be deployed to:

- **Vercel**: `vercel deploy`
- **Netlify**: Drop `dist/` folder
- **GitHub Pages**: Upload `dist/` contents

Note: Your Linear API key is stored only in your browser's localStorage and never sent to any server.

## Architecture

- **Frontend**: React + Vite + TypeScript
- **Graph**: React Flow with dagre layout algorithm
- **Styling**: Tailwind CSS
- **API**: Direct calls to Linear API from browser

## Project Structure

```
web/
├── src/
│   ├── components/         # React components
│   │   ├── graph/          # Graph-specific components
│   │   └── ApiKeySetup.tsx
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Core logic
│   │   ├── graph-data-builder.ts  # Converts Linear data to graph format
│   │   ├── graph-layout.ts        # Dagre layout engine
│   │   ├── graph-transformer.ts   # React Flow transformation
│   │   ├── linear-service.ts      # Linear API client
│   │   └── queries.ts             # GraphQL queries
│   ├── styles/             # CSS files
│   ├── types/              # TypeScript type definitions
│   └── App.tsx             # Main app component
└── package.json
```
