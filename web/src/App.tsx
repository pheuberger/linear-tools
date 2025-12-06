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
      <div className="flex flex-col items-center justify-center min-h-screen scanlines">
        <div className="win-window p-6">
          <div className="flex flex-col items-center gap-3">
            <div className="text-2xl">⌛</div>
            <div className="text-xs font-bold" style={{ fontFamily: 'MS Sans Serif' }}>
              Loading graph data...
            </div>
            <div className="text-xs" style={{ fontFamily: 'MS Sans Serif' }}>
              Fetching issues and building dependencies
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 scanlines">
        <div className="win-window max-w-md w-full">
          <div className="win-titlebar">
            <span>Error - Linear Graph</span>
            <span>X</span>
          </div>
          <div className="p-4">
            <div className="mb-4 p-3 bg-white border-2" style={{
              borderColor: 'var(--win3-dark-gray) var(--win3-light-gray) var(--win3-light-gray) var(--win3-dark-gray)'
            }}>
              <p className="text-xs mb-2 font-bold" style={{ fontFamily: 'MS Sans Serif' }}>
                ⚠️ ERROR LOADING GRAPH
              </p>
              <p className="text-xs" style={{ fontFamily: 'MS Sans Serif' }}>
                {error.message}
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setSelectedProjects(null)}
                className="win-btn"
              >
                Back
              </button>
              <button onClick={clearApiKey} className="win-btn">
                Clear API Key
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!graphData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen scanlines">
        <div className="win-window p-6">
          <div className="flex flex-col items-center gap-3">
            <div className="text-2xl">📁</div>
            <div className="text-xs font-bold" style={{ fontFamily: 'MS Sans Serif' }}>
              No data
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--win3-gray)' }}>
      <div className="win-titlebar">
        <div className="flex items-center gap-2">
          <span className="text-xs">📊</span>
          <span>Linear Graph - {selectedProjects?.join(', ')}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedProjects(null)}
            className="text-xs px-2 hover:bg-blue-800"
            style={{ fontFamily: 'MS Sans Serif' }}
          >
            Change
          </button>
          <span>_</span>
          <span>□</span>
          <span>X</span>
        </div>
      </div>
      <GraphCanvas data={graphData} />
    </div>
  )
}

export default App
