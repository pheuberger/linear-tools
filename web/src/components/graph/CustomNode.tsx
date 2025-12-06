import { memo } from 'react'
import { Handle, Position } from 'reactflow'
import type { NodeProps } from 'reactflow'

function getPriorityLabel(priority: number): string {
  const labels: Record<number, string> = {
    0: 'None',
    1: 'Urgent',
    2: 'High',
    3: 'Medium',
    4: 'Low',
  }
  return labels[priority] || 'Unknown'
}

export const CustomNode = memo(({ data }: NodeProps) => {
  // Simple box with colored border from data
  const borderColor = data.borderColor || '#555'
  const backgroundColor = data.backgroundColor || '#fff'
  const fontColor = data.fontColor || '#000'

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
        <div style={{ fontSize: '9px', opacity: 0.7, marginTop: '3px' }}>
          {data.assignee?.displayName || '??'} / C
          {data.cycle?.number || '-'} / E{data.estimate || '?'}
        </div>
      </a>

      <Handle type="source" position={Position.Bottom} />
    </div>
  )
})

function getTooltipText(data: any): string {
  const stateName = data.state?.name || 'Unknown'
  const priority = getPriorityLabel(data.priority)
  const cycle = data.cycle?.number || '-'
  const estimate = data.estimate || '?'
  const description = data.description || 'No description.'

  return `${stateName} • Priority: ${priority}
Cycle: ${cycle} • Estimate: ${estimate}

${description}`
}

CustomNode.displayName = 'CustomNode'
