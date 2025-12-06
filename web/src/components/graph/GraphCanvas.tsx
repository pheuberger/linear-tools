import { useMemo, useState, useEffect } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from 'reactflow'
import 'reactflow/dist/style.css'
import '../../styles/graph-controls.css'
import { GraphTransformer } from '../../lib/graph-transformer'
import { GraphLayout } from '../../lib/graph-layout'
import { GraphFilter } from '../../lib/graph-filter'
import { CustomNode } from './CustomNode'
import { SearchFilter } from './SearchFilter'
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
  const [searchText, setSearchText] = useState('')

  const filteredData = useMemo(
    () => GraphFilter.filterBySearch(data, searchText),
    [data, searchText],
  )

  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => GraphTransformer.toReactFlow(filteredData),
    [filteredData],
  )

  const layoutedNodes = useMemo(() => {
    if (filteredData.options.clusterBy && filteredData.clusters.length > 0) {
      return GraphLayout.applyClusterLayout(
        initialNodes,
        initialEdges,
        filteredData.clusters,
      )
    }
    return GraphLayout.applyDagreLayout(initialNodes, initialEdges)
  }, [
    initialNodes,
    initialEdges,
    filteredData.options.clusterBy,
    filteredData.clusters,
  ])

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Update nodes and edges when the filtered data changes
  useEffect(() => {
    setNodes(layoutedNodes)
  }, [layoutedNodes, setNodes])

  useEffect(() => {
    setEdges(initialEdges)
  }, [initialEdges, setEdges])

  return (
    <div className="flex-1 relative">
      <div className="absolute top-4 left-4 z-10">
        <SearchFilter value={searchText} onChange={setSearchText} />
      </div>
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
