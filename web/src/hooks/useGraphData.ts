import { useState, useEffect } from 'react'
import { LinearService } from '../lib/linear-service'
import type { GraphData, GraphOptions } from '../types/graph'

export function useGraphData(apiKey: string | null, options: GraphOptions) {
  const [graphData, setGraphData] = useState<GraphData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!apiKey) return

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const service = new LinearService(apiKey)
        const data = await service.fetchGraphData(options)
        setGraphData(data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [apiKey, JSON.stringify(options)])

  return { graphData, loading, error }
}
