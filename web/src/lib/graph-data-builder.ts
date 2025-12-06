import Color from 'color'
import type { GraphOptions, GraphData, GraphNode, GraphEdge, GraphCluster } from '../types/graph'
import type { Issue, Projects } from '../types/issue'

const NO_CLUSTER = 'NO_CLUSTER'

const SIZES = {
  0: [0.25, 10.0],
  1: [0.5, 12.0],
  2: [0.75, 14.0],
  3: [1.0, 18.0],
  5: [1.25, 22.0],
  8: [1.5, 26.0],
}

const PRIORITIES = {
  0: ['#555555', 'No priority'],
  1: ['red', 'Urgent'],
  2: ['orange', 'High'],
  3: ['yellow', 'Medium'],
  4: ['blue', 'Low'],
}

export class GraphDataBuilder {
  private issuesById: Record<string, Issue> = {}
  private nodes: GraphNode[] = []
  private edges: GraphEdge[] = []
  private nodeMap: Map<string, GraphNode> = new Map()
  private clusterMap: Map<string, GraphCluster> = new Map()
  private idTitles: Record<string, string> = {}
  private projects: Projects = {}
  private options: GraphOptions
  private organizationUrlKey: string

  constructor(issues: Issue[], projects: Projects, options: GraphOptions, organizationUrlKey: string) {
    this.projects = projects
    this.options = options
    this.organizationUrlKey = organizationUrlKey
    this.build(issues)
  }

  build(issues: Issue[]): void {
    // Two-pass approach: register nodes first, then add relationships
    // Pass 1: Register all visible nodes
    for (const issue of issues) {
      this.issuesById[issue.identifier] = issue

      if (this.isNodeHidden(issue)) {
        continue
      }

      this.registerNode(issue)
    }
    console.log('Registered issues')

    // Pass 2: Build relationships
    for (const issue of issues) {
      if (this.isNodeHidden(issue)) {
        continue
      }

      console.log(
        this.idTitles[issue.identifier] + ' ' + this.getIssueInfo(issue),
      )
      this.addChildren(issue)
      this.addRelations(issue)
    }
  }

  private registerNode(issue: Issue): GraphNode {
    let node = this.nodeMap.get(issue.identifier)
    if (node) {
      return node
    }

    const idTitle = `${issue.identifier}: ${issue.title}`
    this.idTitles[issue.identifier] = idTitle

    const clusterId = this.getClusterId(issue)
    if (clusterId && !this.clusterMap.has(clusterId)) {
      const cluster = this.createCluster(issue)
      if (cluster) {
        this.clusterMap.set(clusterId, cluster)
      }
    }

    node = {
      id: issue.identifier,
      type: this.getNodeType(issue),
      data: {
        identifier: issue.identifier,
        title: issue.title,
        description: issue.description,
        state: issue.state,
        priority: issue.priority,
        estimate: issue.estimate,
        assignee: issue.assignee,
        cycle: issue.cycle,
        url: `https://linear.app/${this.organizationUrlKey}/issue/${issue.identifier}`,
      },
      style: this.getNodeStyle(issue),
      clusterId,
    }

    this.nodeMap.set(issue.identifier, node)
    this.nodes.push(node)
    return node
  }

  private getNodeType(issue: Issue): 'default' | 'epic' | 'external' {
    if (issue.title.match(/\bepic\b/i)) {
      return 'epic'
    }
    if (!issue.state) {
      return 'external'
    }
    return 'default'
  }

  private getNodeStyle(issue: Issue) {
    let estimate = issue.estimate
    if (issue.title.includes('EPIC')) {
      estimate = 5
    }

    const sizes = SIZES[estimate as keyof typeof SIZES] || [1.0, 18.0]
    const [width, fontSize] = sizes

    const fillColor = issue.state?.color || '#cccccc'
    const isDark = fillColor !== '#cccccc' && Color(fillColor).isDark()

    return {
      fillColor,
      borderColor: this.getPriorityColor(issue.priority),
      borderWidth: 5,
      width,
      fontSize,
      fontColor: isDark ? 'white' : 'black',
    }
  }

  private getPriorityColor(priority: number): string {
    return PRIORITIES[priority as keyof typeof PRIORITIES]?.[0] || '#555555'
  }

  private getIssueInfo(issue: Issue): string {
    const assignee = issue.assignee?.displayName || '??'
    const cycleLabel = issue.cycle?.number || '-'
    return `[${assignee} / C${cycleLabel} / E${issue.estimate || '?'}]`
  }

  private isNodeHidden(issue: Issue): boolean {
    if (issue.state?.type === 'canceled' && !this.options.cancelled) {
      return true
    }
    if (issue.state?.type === 'completed' && !this.options.completed) {
      return true
    }
    return false
  }

  private getClusterId(issue: Issue): string | undefined {
    if (!this.options.clusterBy) {
      return undefined
    }

    switch (this.options.clusterBy) {
      case 'cycle':
        return issue.cycle?.id || NO_CLUSTER
      case 'project':
        return issue.projectId
      default:
        return undefined
    }
  }

  private createCluster(issue: Issue): GraphCluster | null {
    if (!this.options.clusterBy) {
      return null
    }

    const clusterId = this.getClusterId(issue)
    if (!clusterId) {
      return null
    }

    let label: string
    switch (this.options.clusterBy) {
      case 'cycle':
        if (clusterId === NO_CLUSTER) {
          label = 'No cycle'
        } else {
          label = `Cycle ${issue.cycle?.number || clusterId}`
        }
        break
      case 'project':
        label = `Project ${this.projects[clusterId] || clusterId}`
        break
      default:
        label = clusterId
    }

    return {
      id: clusterId,
      label,
      type: this.options.clusterBy,
    }
  }

  private addChildren(issue: Issue) {
    if (!issue.children) {
      return
    }

    const children = issue.children.nodes
    for (const child of children) {
      if (this.isNodeHidden(child)) {
        continue
      }

      const childId = child.identifier
      let childNode = this.nodeMap.get(childId)
      if (!childNode) {
        // Child issue wasn't registered yet; must be outside this project
        childNode = this.registerNode(child)
      }

      this.addEdge('parent-child', childId, issue.identifier, 'has parent', 'blue')
      console.log(`  has child ${this.idTitles[childId]}`)
    }
  }

  private addRelations(issue: Issue) {
    if (!issue.relations) {
      return
    }

    const relations = issue.relations.nodes
    for (const rel of relations) {
      if (this.isNodeHidden(rel.relatedIssue)) {
        continue
      }

      const relatedId = rel.relatedIssue.identifier
      const relatedDescr = this.idTitles[relatedId] || relatedId

      if (this.ignoreRelation(rel.type)) {
        console.log(`  ignoring: ${rel.type} ${relatedDescr}`)
        continue
      }

      let relatedNode = this.nodeMap.get(relatedId)
      let external = false
      if (!relatedNode) {
        // Related issue wasn't registered yet; must be outside this project
        external = true
        if (!this.options.hideExternal) {
          relatedNode = this.registerNode(rel.relatedIssue)
        }
      }

      if (!external || !this.options.hideExternal) {
        if (rel.type === 'duplicate') {
          // Reverse direction for duplicates
          this.addEdge('duplicate', relatedId, issue.identifier, 'duplicate of', 'red')
        } else if (rel.type === 'blocks') {
          this.addEdge('blocks', issue.identifier, relatedId, 'blocks', 'black')
        }
        console.log(`  ${rel.type} ${relatedDescr}`)
      }
      if (external) {
        console.log(`  ${rel.type} ${relatedDescr} (hiding external issue)`)
      }
    }
  }

  private ignoreRelation(relType: string): boolean {
    if (relType === 'duplicate') {
      return !this.options.duplicates
    }
    if (relType === 'blocks') {
      return false
    }
    return true
  }

  private addEdge(
    type: 'blocks' | 'parent-child' | 'duplicate',
    source: string,
    target: string,
    label: string,
    color: string,
  ) {
    const edge: GraphEdge = {
      source,
      target,
      type,
      label,
      color,
    }
    this.edges.push(edge)
  }

  getGraphData(): GraphData {
    return {
      nodes: this.nodes,
      edges: this.edges,
      clusters: Array.from(this.clusterMap.values()),
      projects: this.projects,
      options: this.options,
    }
  }
}
