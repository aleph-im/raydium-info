import { GraphQLClient, gql } from 'graphql-request'

export const endpoint = "https://rayqltest.aleph.cloud/"
// export const endpoint = "http://localhost:8080"

export const client = new GraphQLClient(endpoint, {
})