import { useState } from 'react'
import { useLinearApiKey } from './hooks/useLinearApiKey'
import { useGraphData } from './hooks/useGraphData'
import { ApiKeySetup } from './components/ApiKeySetup'
import { ProjectSelector } from './components/ProjectSelector'
import { GraphCanvas } from './components/graph/GraphCanvas'
import type { GraphOptions } from './types/graph'

function App() {
  const { apiKey, saveApiKey, clearApiKey } = useLinearApiKey()
  const [selectedProjects, setSelectedProjects] = useState<string[] | null>(
    null,
  )
  const [options, setOptions] = useState<GraphOptions>({
    project: [],
    completed: false,
    cancelled: false,
    duplicates: false,
  })

  const { graphData, loading, error } = useGraphData(
    apiKey && selectedProjects ? apiKey : null,
    options,
  )

  const handleProjectSelect = (projectNames: string[]) => {
    setSelectedProjects(projectNames)
    setOptions((prev) => ({
      ...prev,
      project: projectNames,
    }))
  }

  if (!apiKey) {
    return <ApiKeySetup onSave={saveApiKey} />
  }

  if (!selectedProjects) {
    return (
      <ProjectSelector
        apiKey={apiKey}
        onSelect={handleProjectSelect}
        onClearApiKey={clearApiKey}
      />
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading graph data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="text-xl text-red-600">Error: {error.message}</div>
        <button
          onClick={() => setSelectedProjects(null)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Back to Project Selection
        </button>
        <button
          onClick={clearApiKey}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Clear API Key
        </button>
      </div>
    )
  }

  if (!graphData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">No data</div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="p-4 border-b flex justify-between items-center">
        <h1 className="text-2xl font-bold">Linear Dependency Graph</h1>
        <button
          onClick={() => setSelectedProjects(null)}
          className="px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Change Projects
        </button>
      </header>
      <GraphCanvas data={graphData} />
    </div>
  )
}

export default App
