import type { Node, Edge } from 'reactflow'
import type { GraphData } from '../types/graph'

export class GraphTransformer {
  static toReactFlow(graphData: GraphData): { nodes: Node[]; edges: Edge[] } {
    const nodes = graphData.nodes.map((node) => ({
      id: node.id,
      type: node.type,
      data: node.data,
      position: { x: 0, y: 0 }, // Will be computed by layout
      style: {
        backgroundColor: node.style.fillColor,
        borderColor: node.style.borderColor,
        borderWidth: `${node.style.borderWidth}px`,
        borderStyle: 'solid',
        color: node.style.fontColor,
        width: `${node.style.width * 100}px`,
        fontSize: `${node.style.fontSize}px`,
      },
    }))

    const edges = graphData.edges.map((edge) => ({
      id: `${edge.source}-${edge.target}`,
      source: edge.source,
      target: edge.target,
      type: edge.type,
      label: edge.label,
      style: {
        stroke: edge.color,
        strokeWidth: 2,
      },
      labelStyle: {
        fill: edge.color,
      },
      animated: edge.type === 'duplicate',
    }))

    return { nodes, edges }
  }
}
