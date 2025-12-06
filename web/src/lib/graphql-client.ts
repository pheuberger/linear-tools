const LINEAR_API_URL = 'https://api.linear.app/graphql'

export class GraphQLClient {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async request<T>(query: string, variables?: Record<string, any>): Promise<T> {
    const response = await fetch(LINEAR_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.apiKey,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'GraphQL error')
    }

    return result.data
  }
}
