import type { Node, Edge } from 'reactflow'
import type { GraphData } from '../types/graph'

export class GraphTransformer {
  static toReactFlow(graphData: GraphData): { nodes: Node[]; edges: Edge[] } {
    const nodes = graphData.nodes.map((node) => ({
      id: node.id,
      type: node.type,
      data: {
        ...node.data,
        // Pass style data to the custom node component
        backgroundColor: node.style.fillColor,
        borderColor: node.style.borderColor,
        fontColor: node.style.fontColor,
      },
      position: { x: 0, y: 0 }, // Will be computed by layout
      // Don't apply styles to ReactFlow wrapper - let CustomNode handle it
      style: {},
    }))

    const edges = graphData.edges.map((edge) => ({
      id: `${edge.source}-${edge.type}-${edge.target}`,
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
