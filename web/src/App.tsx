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
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-white rounded-2xl shadow-2xl p-8 fade-in">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="text-lg font-medium text-gray-700">
              Loading graph data...
            </div>
            <div className="text-sm text-gray-500">
              Fetching issues and building dependencies
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full fade-in">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Error Loading Graph
            </h2>
            <p className="text-gray-600 mb-6">{error.message}</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setSelectedProjects(null)}
                className="w-full py-3 px-6 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-lg"
              >
                Back to Project Selection
              </button>
              <button
                onClick={clearApiKey}
                className="w-full py-3 px-6 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
              >
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
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-white rounded-2xl shadow-2xl p-8 fade-in">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="text-lg font-medium text-gray-700">No data</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Linear Dependency Graph
              </h1>
              <p className="text-sm text-gray-500">
                {selectedProjects?.join(', ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedProjects(null)}
            className="px-5 py-2.5 text-sm bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
          >
            Change Projects
          </button>
        </div>
      </header>
      <GraphCanvas data={graphData} />
    </div>
  )
}

export default App
