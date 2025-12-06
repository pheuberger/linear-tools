import dagre from 'dagre'
import type { Node, Edge } from 'reactflow'
import type { GraphCluster } from '../types/graph'

export class GraphLayout {
  static applyDagreLayout(
    nodes: Node[],
    edges: Edge[],
    direction: 'TB' | 'LR' = 'TB',
  ): Node[] {
    const dagreGraph = new dagre.graphlib.Graph()
    dagreGraph.setDefaultEdgeLabel(() => ({}))
    dagreGraph.setGraph({ rankdir: direction, ranksep: 150, nodesep: 100 })

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, {
        width: parseInt(node.style?.width as string || '150'),
        height: 80,
      })
    })

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target)
    })

    dagre.layout(dagreGraph)

    return nodes.map((node) => {
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
