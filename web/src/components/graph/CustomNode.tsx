import { memo } from 'react'
import { Handle, Position } from 'reactflow'
import type { NodeProps } from 'reactflow'
import '../../styles/node-shapes.css'

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

export const CustomNode = memo(({ data, type }: NodeProps) => {
  const shapeClass =
    type === 'epic' ? 'hexagon' : type === 'external' ? 'octagon' : 'rounded-lg'

  return (
    <div className={`custom-node ${shapeClass}`} title={getTooltipText(data)}>
      <Handle type="target" position={Position.Top} />

      <a href={data.url} target="_blank" rel="noopener noreferrer">
        <div className="node-identifier">{data.identifier}</div>
        <div className="node-title">{data.title}</div>
        <div className="node-info">
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
