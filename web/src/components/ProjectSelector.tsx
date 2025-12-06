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
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading projects...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="text-xl text-red-600">Error: {error}</div>
        <button
          onClick={onClearApiKey}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Clear API Key
        </button>
      </div>
    )
  }

  // If only one project, we auto-selected it, so show nothing (will auto-proceed)
  if (projects.length === 1) {
    return null
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="text-xl">No projects found in your workspace</div>
        <button
          onClick={onClearApiKey}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Clear API Key
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-4">
      <div className="max-w-2xl w-full">
        <h1 className="text-2xl font-bold mb-2">Select Projects</h1>
        <p className="text-gray-600 mb-6">
          Choose one or more projects to visualize their dependency graphs
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border border-gray-300 rounded-lg max-h-96 overflow-y-auto">
            {projects.map((project) => (
              <label
                key={project.id}
                className="flex items-start gap-3 p-4 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
              >
                <input
                  type="checkbox"
                  checked={selectedProjects.has(project.name)}
                  onChange={() => handleToggleProject(project.name)}
                  className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <div className="font-medium">{project.name}</div>
                  {project.description && (
                    <div className="text-sm text-gray-600 mt-1">
                      {project.description}
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>

          <div className="flex gap-2 justify-between">
            <button
              type="button"
              onClick={onClearApiKey}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Clear API Key
            </button>
            <button
              type="submit"
              disabled={selectedProjects.size === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              View Graph ({selectedProjects.size} selected)
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
