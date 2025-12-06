import { useState } from 'react'

export function useLinearApiKey() {
  const [apiKey, setApiKey] = useState<string | null>(
    localStorage.getItem('LINEAR_API_KEY'),
  )

  const saveApiKey = (key: string) => {
    localStorage.setItem('LINEAR_API_KEY', key)
    setApiKey(key)
  }

  const clearApiKey = () => {
    localStorage.removeItem('LINEAR_API_KEY')
    setApiKey(null)
  }

  return { apiKey, saveApiKey, clearApiKey }
}
