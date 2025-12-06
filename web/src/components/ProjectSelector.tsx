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
      <div className="flex flex-col items-center justify-center min-h-screen scanlines">
        <div className="win-window p-6">
          <div className="flex flex-col items-center gap-3">
            <div className="text-2xl">⏳</div>
            <div className="text-xs font-bold" style={{ fontFamily: 'MS Sans Serif' }}>
              Loading projects...
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
                ⚠️ ERROR LOADING PROJECTS
              </p>
              <p className="text-xs" style={{ fontFamily: 'MS Sans Serif' }}>
                {error}
              </p>
            </div>
            <div className="flex justify-end">
              <button onClick={onClearApiKey} className="win-btn">
                Clear API Key
              </button>
            </div>
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
      <div className="flex flex-col items-center justify-center min-h-screen p-4 scanlines">
        <div className="win-window max-w-md w-full">
          <div className="win-titlebar">
            <span>Linear Graph - No Projects</span>
            <span>!</span>
          </div>
          <div className="p-4">
            <div className="mb-4 p-3 bg-white border-2" style={{
              borderColor: 'var(--win3-dark-gray) var(--win3-light-gray) var(--win3-light-gray) var(--win3-dark-gray)'
            }}>
              <p className="text-xs" style={{ fontFamily: 'MS Sans Serif' }}>
                No projects found in your workspace
              </p>
            </div>
            <div className="flex justify-end">
              <button onClick={onClearApiKey} className="win-btn">
                Clear API Key
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 scanlines">
      <div className="win-window max-w-2xl w-full" style={{ minWidth: '500px' }}>
        <div className="win-titlebar">
          <span>Linear Graph - Select Projects</span>
          <span>_</span>
        </div>

        <div className="p-4">
          <div className="mb-3 p-2 bg-white border-2" style={{
            borderColor: 'var(--win3-dark-gray) var(--win3-light-gray) var(--win3-light-gray) var(--win3-dark-gray)'
          }}>
            <p className="text-xs" style={{ fontFamily: 'MS Sans Serif' }}>
              Choose one or more projects to visualize their dependency graphs
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div
              className="bg-white border-2 max-h-80 overflow-y-auto mb-3"
              style={{
                borderColor: 'var(--win3-dark-gray) var(--win3-light-gray) var(--win3-light-gray) var(--win3-dark-gray)'
              }}
            >
              {projects.map((project) => (
                <label
                  key={project.id}
                  className="flex items-start gap-3 p-2 hover:bg-blue-100 cursor-pointer"
                  style={{ fontFamily: 'MS Sans Serif' }}
                >
                  <input
                    type="checkbox"
                    checked={selectedProjects.has(project.name)}
                    onChange={() => handleToggleProject(project.name)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="text-xs font-bold">
                      {project.name}
                    </div>
                    {project.description && (
                      <div className="text-xs text-gray-600 mt-0.5">
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
                className="win-btn"
              >
                Clear API Key
              </button>
              <button
                type="submit"
                disabled={selectedProjects.size === 0}
                className="win-btn"
              >
                OK ({selectedProjects.size} selected)
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
