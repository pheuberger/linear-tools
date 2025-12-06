import { GraphQLClient } from './graphql-client'
import { findRelatedIssues, getOrganization } from './queries'
import { GraphDataBuilder } from './graph-data-builder'
import type { GraphOptions, GraphData } from '../types/graph'

export class LinearService {
  private client: GraphQLClient

  constructor(apiKey: string) {
    this.client = new GraphQLClient(apiKey)
  }

  async fetchGraphData(options: GraphOptions): Promise<GraphData> {
    const [issues, projects] = await findRelatedIssues(
      this.client,
      options.project
    )

    const organization = await getOrganization(this.client)
    if (!organization) {
      throw new Error('Failed to fetch organization information')
    }

    const builder = new GraphDataBuilder(issues, projects, options, organization.urlKey)
    return builder.getGraphData()
  }
}
