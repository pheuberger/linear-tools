import { useState } from 'react'

interface ApiKeySetupProps {
  onSave: (key: string) => void
}

export function ApiKeySetup({ onSave }: ApiKeySetupProps) {
  const [key, setKey] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (key.trim()) {
      onSave(key.trim())
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 scanlines">
      <div className="win-window max-w-md w-full" style={{ minWidth: '400px' }}>
        <div className="win-titlebar">
          <span>Linear Graph - API Key Setup</span>
          <span>_</span>
        </div>

        <div className="p-4">
          <div className="mb-4 p-3 bg-white border-2" style={{
            borderColor: 'var(--win3-dark-gray) var(--win3-light-gray) var(--win3-light-gray) var(--win3-dark-gray)'
          }}>
            <p className="text-xs mb-2" style={{ fontFamily: 'MS Sans Serif' }}>
              ⚠️ WARNING: SYSTEM ACCESS REQUIRED
            </p>
            <p className="text-xs" style={{ fontFamily: 'MS Sans Serif' }}>
              Enter your Linear API key to access the graph visualization system.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label
                htmlFor="apiKey"
                className="block text-xs font-bold mb-1"
                style={{ fontFamily: 'MS Sans Serif' }}
              >
                API Key:
              </label>
              <input
                id="apiKey"
                type="password"
                placeholder="lin_api_..."
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="win-input w-full"
                autoFocus
              />
            </div>

            <div className="flex gap-2 justify-end mt-4">
              <button
                type="submit"
                disabled={!key.trim()}
                className="win-btn"
              >
                OK
              </button>
            </div>
          </form>

          <div className="mt-3 pt-3" style={{
            borderTop: '2px groove var(--win3-dark-gray)'
          }}>
            <p className="text-xs" style={{ fontFamily: 'MS Sans Serif' }}>
              Get API key from:{' '}
              <a
                href="https://linear.app/settings/api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                linear.app/settings/api
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
