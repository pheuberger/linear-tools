import { useState, useEffect } from 'react'
import { GraphQLClient } from '../lib/graphql-client'
import { findAllProjects } from '../lib/queries'
import type { Project } from '../types/issue'

interface ProjectSelectorProps {
  apiKey: string
  onSelect: (projectNames: string[]) => void
  onClearApiKey: () => void
}

export function ProjectSelector({
  apiKey,
  onSelect,
  onClearApiKey,
}: ProjectSelectorProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(
    new Set(),
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        setError(null)
        const client = new GraphQLClient(apiKey)
        const allProjects = await findAllProjects(client)
        setProjects(allProjects)

        // If there's only one project, auto-select it
        if (allProjects.length === 1) {
          onSelect([allProjects[0].name])
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch projects',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [apiKey, onSelect])

  const handleToggleProject = (projectName: string) => {
    const newSelected = new Set(selectedProjects)
    if (newSelected.has(projectName)) {
      newSelected.delete(projectName)
    } else {
      newSelected.add(projectName)
    }
    setSelectedProjects(newSelected)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedProjects.size > 0) {
      onSelect(Array.from(selectedProjects))
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-white rounded-2xl shadow-2xl p-8 fade-in">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="text-lg font-medium text-gray-700">
              Loading projects...
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
              Error Loading Projects
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={onClearApiKey}
              className="w-full py-3 px-6 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 shadow-lg"
            >
              Clear API Key
            </button>
          </div>
        </div>
      </div>
    )
  }

  // If only one project, we auto-selected it, so show nothing (will auto-proceed)
  if (projects.length === 1) {
    return null
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full fade-in">
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
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              No Projects Found
            </h2>
            <p className="text-gray-600 mb-6">
              No projects found in your workspace
            </p>
            <button
              onClick={onClearApiKey}
              className="w-full py-3 px-6 bg-gray-600 text-white font-medium rounded-xl hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 shadow-lg"
            >
              Clear API Key
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl w-full fade-in">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Select Projects
          </h1>
          <p className="text-gray-600">
            Choose one or more projects to visualize their dependency graphs
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-50 border-2 border-gray-200 rounded-xl max-h-96 overflow-y-auto">
            {projects.map((project, index) => (
              <label
                key={project.id}
                className={`flex items-start gap-4 p-4 hover:bg-indigo-50 cursor-pointer transition-colors duration-150 ${
                  index !== projects.length - 1 ? 'border-b border-gray-200' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedProjects.has(project.name)}
                  onChange={() => handleToggleProject(project.name)}
                  className="mt-1 w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-all"
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">
                    {project.name}
                  </div>
                  {project.description && (
                    <div className="text-sm text-gray-600 mt-1">
                      {project.description}
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>

          <div className="flex gap-3 justify-between">
            <button
              type="button"
              onClick={onClearApiKey}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
            >
              Clear API Key
            </button>
            <button
              type="submit"
              disabled={selectedProjects.size === 0}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              View Graph ({selectedProjects.size} selected)
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
