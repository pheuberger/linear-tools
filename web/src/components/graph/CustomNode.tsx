import { memo } from 'react'
import { Handle, Position } from 'reactflow'
import type { NodeProps } from 'reactflow'

export const CustomNode = memo(({ data }: NodeProps) => {
  // Simple box with colored border from data
  const borderColor = data.borderColor || '#555'
  const backgroundColor = data.backgroundColor || '#fff'
  const fontColor = data.fontColor || '#000'

  // Fade non-matching nodes when search is active
  const isSearchMatch = data.isSearchMatch
  const isSearchActive = isSearchMatch !== undefined
  const opacity = isSearchActive && !isSearchMatch ? 0.35 : 1

  return (
    <div
      style={{
        padding: '8px 12px',
        minWidth: '140px',
        maxWidth: '220px',
        width: '100%',
        height: '100%',
        border: `5px solid ${borderColor}`,
        backgroundColor: backgroundColor,
        color: fontColor,
        textAlign: 'center',
        fontFamily: 'MS Sans Serif, sans-serif',
        boxShadow: '2px 2px 0 rgba(0, 0, 0, 0.3)',
        boxSizing: 'border-box',
        position: 'relative',
        opacity: opacity,
        transition: 'opacity 0.2s ease',
      }}
    >
      <Handle type="target" position={Position.Top} />

      <a
        href={data.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          textDecoration: 'none',
          color: 'inherit',
          display: 'block',
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '11px' }}>
          {data.identifier}
        </div>
        <div style={{ fontSize: '10px', marginBottom: '4px', lineHeight: '1.3' }}>
          {data.title}
        </div>
        <div
          style={{
            fontSize: '9px',
            opacity: 0.7,
            marginTop: '6px',
            fontStyle: data.assignee ? 'normal' : 'italic',
          }}
        >
          {data.assignee?.displayName || 'unassigned'}
        </div>
      </a>

      <Handle type="source" position={Position.Bottom} />
    </div>
  )
})

CustomNode.displayName = 'CustomNode'
