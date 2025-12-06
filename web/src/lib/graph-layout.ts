import dagre from 'dagre'
import type { Node, Edge } from 'reactflow'
import type { GraphCluster } from '../types/graph'

export class GraphLayout {
  static applyDagreLayout(
    nodes: Node[],
    edges: Edge[],
    direction: 'TB' | 'LR' = 'TB',
  ): Node[] {
    // EXPERIMENT 2: Grid-Based Layout for Independent Nodes
    // Separate nodes with dependencies from independent nodes
    const nodesWithEdges = new Set<string>()
    edges.forEach((edge) => {
      nodesWithEdges.add(edge.source)
      nodesWithEdges.add(edge.target)
    })

    const dependentNodes = nodes.filter((n) => nodesWithEdges.has(n.id))
    const independentNodes = nodes.filter((n) => !nodesWithEdges.has(n.id))

    // Layout dependent nodes using dagre (hierarchical)
    let layoutedNodes: Node[] = []
    if (dependentNodes.length > 0) {
      const dagreGraph = new dagre.graphlib.Graph()
      dagreGraph.setDefaultEdgeLabel(() => ({}))
      dagreGraph.setGraph({ rankdir: direction, ranksep: 150, nodesep: 100 })

      dependentNodes.forEach((node) => {
        dagreGraph.setNode(node.id, {
          width: parseInt(node.style?.width as string || '150'),
          height: 80,
        })
      })

      edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target)
      })

      dagre.layout(dagreGraph)

      layoutedNodes = dependentNodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id)
        return {
          ...node,
          position: {
            x: nodeWithPosition.x - parseInt(node.style?.width as string || '150') / 2,
            y: nodeWithPosition.y - 40,
          },
        }
      })
    }

    // Layout independent nodes in a compact grid below/beside the hierarchy
    if (independentNodes.length > 0) {
      const GRID_COLUMNS = 8 // Number of columns in grid
      const NODE_WIDTH = 180
      const NODE_HEIGHT = 120
      const GRID_START_Y = layoutedNodes.length > 0 
        ? Math.max(...layoutedNodes.map((n) => n.position.y)) + 200 
        : 0

      const gridNodes = independentNodes.map((node, index) => {
        const col = index % GRID_COLUMNS
        const row = Math.floor(index / GRID_COLUMNS)
        return {
          ...node,
          position: {
            x: col * NODE_WIDTH,
            y: GRID_START_Y + row * NODE_HEIGHT,
          },
        }
      })

      layoutedNodes = [...layoutedNodes, ...gridNodes]
    }

    return layoutedNodes
  }

  static applyClusterLayout(
    nodes: Node[],
    edges: Edge[],
    _clusters: GraphCluster[],
  ): Node[] {
    // Group nodes by cluster
    const clusterMap = new Map<string, Node[]>()
    nodes.forEach((node) => {
      const clusterId = (node.data as any).clusterId || 'default'
      if (!clusterMap.has(clusterId)) {
        clusterMap.set(clusterId, [])
      }
      clusterMap.get(clusterId)!.push(node)
    })

    // Layout each cluster independently
    let offsetX = 0
    const layoutedNodes: Node[] = []

    clusterMap.forEach((clusterNodes) => {
      const clusterEdges = edges.filter(
        (edge) =>
          clusterNodes.find((n) => n.id === edge.source) &&
          clusterNodes.find((n) => n.id === edge.target),
      )

      const layouted = this.applyDagreLayout(clusterNodes, clusterEdges)
      layouted.forEach((node) => {
        node.position.x += offsetX
        layoutedNodes.push(node)
      })

      // Calculate cluster width for next offset
      const maxX = Math.max(...layouted.map((n) => n.position.x + 150))
      offsetX = maxX + 200 // Gap between clusters
    })

    return layoutedNodes
  }
}
