export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
  clusters: GraphCluster[]
  projects: Record<string, string>
  options: GraphOptions
}

export interface GraphNode {
  id: string // issue.identifier
  type: 'default' | 'epic' | 'external'
  data: NodeData
  style: NodeStyle
  clusterId?: string
}

export interface NodeData {
  identifier: string
  title: string
  description: string
  state?: { name: string; color: string; type: string }
  priority: number
  estimate?: number
  assignee?: { displayName: string }
  cycle?: { id: string; number: number; name: string }
  url: string
  isSearchMatch?: boolean
}

export interface NodeStyle {
  fillColor: string
  borderColor: string
  borderWidth: number
  width: number
  fontSize: number
  fontColor: string
}

export interface GraphEdge {
  source: string
  target: string
  type: 'blocks' | 'parent-child' | 'duplicate'
  label?: string
  color: string
}

export interface GraphCluster {
  id: string
  label: string
  type: 'cycle' | 'project'
}

export interface GraphOptions {
  project: string[]
  completed?: boolean
  cancelled?: boolean
  duplicates?: boolean
  clusterBy?: 'cycle' | 'project'
  hideExternal?: boolean
}
