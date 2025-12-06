import type { GraphData } from '../types/graph'

export class GraphFilter {
  /**
   * Filters graph data to include only issues matching the search text
   * and all issues connected to matching issues (via edges)
   */
  static filterBySearch(graphData: GraphData, searchText: string): GraphData {
    if (!searchText.trim()) {
      // Clear search match flags when no search text
      return {
        ...graphData,
        nodes: graphData.nodes.map((node) => ({
          ...node,
          data: {
            ...node.data,
            isSearchMatch: undefined,
          },
        })),
      }
    }

    const searchLower = searchText.toLowerCase()

    // Find all node IDs that match the search text
    const matchingNodeIds = new Set<string>()
    graphData.nodes.forEach((node) => {
      const titleMatch = node.data.title.toLowerCase().includes(searchLower)
      const descMatch = node.data.description?.toLowerCase().includes(searchLower)

      if (titleMatch || descMatch) {
        matchingNodeIds.add(node.id)
      }
    })

    // If no matches, return empty graph
    if (matchingNodeIds.size === 0) {
      return {
        ...graphData,
        nodes: [],
        edges: [],
        clusters: [],
      }
    }

    // Find all connected node IDs (nodes connected to matching nodes via edges)
    const connectedNodeIds = new Set<string>(matchingNodeIds)

    graphData.edges.forEach((edge) => {
      // If source matches, include target
      if (matchingNodeIds.has(edge.source)) {
        connectedNodeIds.add(edge.target)
      }
      // If target matches, include source
      if (matchingNodeIds.has(edge.target)) {
        connectedNodeIds.add(edge.source)
      }
    })

    // Filter nodes to only include matching + connected, and mark which are matches
    const filteredNodes = graphData.nodes
      .filter((node) => connectedNodeIds.has(node.id))
      .map((node) => ({
        ...node,
        data: {
          ...node.data,
          isSearchMatch: matchingNodeIds.has(node.id),
        },
      }))

    // Filter edges to only include those between remaining nodes
    const filteredEdges = graphData.edges.filter(
      (edge) =>
        connectedNodeIds.has(edge.source) && connectedNodeIds.has(edge.target),
    )

    // Filter clusters to only include those with remaining nodes
    const remainingClusterIds = new Set(
      filteredNodes.map((n) => n.clusterId).filter(Boolean),
    )
    const filteredClusters = graphData.clusters.filter((cluster) =>
      remainingClusterIds.has(cluster.id),
    )

    return {
      ...graphData,
      nodes: filteredNodes,
      edges: filteredEdges,
      clusters: filteredClusters,
    }
  }
}
