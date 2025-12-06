import { useState } from 'react'

interface SearchFilterProps {
  value: string
  onChange: (value: string) => void
}

export function SearchFilter({ value, onChange }: SearchFilterProps) {
  const [input, setInput] = useState(value)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInput(newValue)
    onChange(newValue)
  }

  const handleClear = () => {
    setInput('')
    onChange('')
  }

  return (
    <div className="search-filter">
      <input
        type="text"
        value={input}
        onChange={handleChange}
        placeholder="Filter issues by title or description..."
        className="search-input"
      />
      {input && (
        <button onClick={handleClear} className="clear-button">
          ✕
        </button>
      )}
    </div>
  )
}
