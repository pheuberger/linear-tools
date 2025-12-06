import { useMemo } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { GraphTransformer } from '../../lib/graph-transformer'
import { GraphLayout } from '../../lib/graph-layout'
import { CustomNode } from './CustomNode'
import type { GraphData } from '../../types/graph'

const nodeTypes = {
  default: CustomNode,
  epic: CustomNode,
  external: CustomNode,
}

interface GraphCanvasProps {
  data: GraphData
}

export function GraphCanvas({ data }: GraphCanvasProps) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => GraphTransformer.toReactFlow(data),
    [data],
  )

  const layoutedNodes = useMemo(() => {
    if (data.options.clusterBy && data.clusters.length > 0) {
      return GraphLayout.applyClusterLayout(
        initialNodes,
        initialEdges,
        data.clusters,
      )
    }
    return GraphLayout.applyDagreLayout(initialNodes, initialEdges)
  }, [initialNodes, initialEdges, data.options.clusterBy, data.clusters])

  const [nodes, , onNodesChange] = useNodesState(layoutedNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  return (
    <div className="flex-1">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  )
}
