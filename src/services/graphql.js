import { GraphQLClient, gql } from 'graphql-request'

export const endpoint = "https://rayqltest.aleph.cloud/"

export const client = new GraphQLClient(endpoint, {
})