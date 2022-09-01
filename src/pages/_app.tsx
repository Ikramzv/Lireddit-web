import { ChakraProvider } from '@chakra-ui/react'

import { ApolloClient, ApolloLink, ApolloProvider, HttpLink, InMemoryCache } from '@apollo/client'
import { onError } from '@apollo/client/link/error'
import { AppProps } from 'next/app'
import Router from 'next/router'
import { PaginatedPosts } from '../generated/graphql'
import theme from '../theme'

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        posts: {
          keyArgs: [],
          merge(existing: PaginatedPosts | any = [] , incoming: PaginatedPosts ): PaginatedPosts {
            return {
              ...incoming ,
              posts: [...existing.posts || [], ...incoming?.posts]
            }
          },
        }
      }
    }
  }
})

const client = new ApolloClient({
  cache,
  queryDeduplication: true,
  link: ApolloLink.from([
    onError(({ graphQLErrors , networkError }) => {
        if(networkError) {
          return console.log(networkError.message)
        }
        if(graphQLErrors) {
          if (graphQLErrors.some(err => err.message === 'not authenticated')) Router.replace('/login')
          return
        }
    }),
    new HttpLink({ uri: 'http://localhost:4000/graphql' , credentials: 'include' })
  ])
  
})

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={client}>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </ApolloProvider>
  )
}

export default MyApp
