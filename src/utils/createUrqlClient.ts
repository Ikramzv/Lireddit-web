import { Cache, cacheExchange, DataFields, Entity, ResolveInfo, Resolver, Variables } from "@urql/exchange-graphcache";
import Router from 'next/router';
import { composeExchanges, dedupExchange, errorExchange, fetchExchange, gql } from "urql";
import { DeletePostMutationVariables, LoginMutation, LogoutMutation, MeDocument, MeQuery, RegisterMutation, VoteMutationVariables } from '../generated/graphql';
import { betterUpdateQuery } from "./betterUpdateQuery";
import { isServer } from "./isServer";

const cursorPagination = (): Resolver => {
  return (_parent: DataFields, _args: Variables, cache: Cache , info: ResolveInfo) => {
    const { parentKey: entityKey , fieldName } = info
    const allFields = cache.inspectFields(cache.resolve('Query' , fieldName , _args) as Entity)
    const fieldInfos = allFields.filter(inf => inf.fieldName === fieldName) // selects posts fieldname that has arguments ( limit and cursor )
    const size = fieldInfos.length // if not exists some reason return undefined
    if(size === 0) {
      return undefined
    }
    // return posts field's key which is post({ 'limit': 10 }) by default
    const fieldKey = cache.keyOfField(fieldName , _args) as string 
    // select posts field that has array of Post objects and if it is in the cache return true otherwise false
    const isItInTheCache = !!cache.resolve(cache.resolve(entityKey , fieldKey) as Entity , 'posts')
    // if true info partial must be false because if it is true info partial will assume that there are uncached or missing data
    info.partial = !isItInTheCache
    const results: string[] = []
    let hasMore: boolean = true
    // select posts entity, it will refer to ( Query.posts({ 'limit': 10 }) )
    const entity = cache.resolve(entityKey , fieldKey) as Entity // Query.posts({ 'limit': 10 })
    // Select posts which has array of Post objects
    // it will be basically Post:"postId" because Graphcache cached data with their primary key ( id or _id ) after __typename
    const data = cache.resolve(entity , 'posts') as string[]
    const _hasMore = cache.resolve(entity , 'hasMore') as boolean
    if(!_hasMore) {
      hasMore = _hasMore
    }
    data !== null && results.push(...data)
    
    // return __typename PaginatedPosts because resolver itself from server return PaginatedPosts class 
    // and it must be the same in the client because Graphcache cached the fields that has a selection set with __typename
    // Then Graphcache looks for primary key and I have already set primary key to null in exchange's keys configuration
    return {
      hasMore,
      posts: results,
      __typename: 'PaginatedPosts'
    }
  }
}

const invalidateAllPosts = (cache: Cache) => {
  const allFields = cache.inspectFields('Query')
  const fieldInfos = allFields.filter((info) => info.fieldName === 'posts')
  fieldInfos.forEach((fi) => {
    cache.invalidate('Query' , 'posts' , fi.arguments || {})
  })
}

const composedExchanges = (ssrExchange: any) => {
  return composeExchanges([dedupExchange,
          errorExchange({
        onError: (error) => {
          if(error.message.includes('not authenticated')) {
            Router.replace('/login')
          }
        }
      }) 
      ,cacheExchange({
      keys: {
        PaginatedPosts: () => null 
      },
      resolvers: {
        Query: {
          posts: cursorPagination()
        },
      },
      updates: {
        Mutation : {
          // When user logged in update the me query
          login: (_result , _args , cache , _info) => {
            invalidateAllPosts(cache)
            betterUpdateQuery<LoginMutation , MeQuery>(cache, {query: MeDocument} , _result , (result , query) => {
              if(result.login.errors) {
                return query
              } else {
                return {
                  me: result.login.user
                }
              }
            })
          },
          // When User register update the me query
          register: (_result , _args , cache , _info) => {
            betterUpdateQuery<RegisterMutation , MeQuery>(cache, {query: MeDocument} , _result , (result , query) => {
              if(result.register.errors) {
                return query
              } else {
                return {
                  me: result.register.user
                }
              }
            })
          },
          logout: (_result , _args , cache , _info) => {
            betterUpdateQuery<LogoutMutation , MeQuery>(cache , {query: MeDocument} , _result , (result , query) => {
              if(result.logout) {
                return {
                  me: null
                }
              }else {
                return {
                  me: query.me
                }
              }
            })
          },
          createPost: (result, _args, cache, _info) => {
            invalidateAllPosts(cache)
          },
          deletePost: (result, args: DeletePostMutationVariables , cache, info) => {
            cache.invalidate({__typename: 'Post' , id: args.id})
          },
          vote: (result ,args: VoteMutationVariables, cache, info) => {
            const { postId , value } = args
            
            const data = cache.readFragment(gql`
              fragment _ on Post {
                id
                points
                voteStatus
              }
            ` , { __typename: 'Post',id: postId })
            if(data) {
              if(data.voteStatus === args.value) {
                return;
              }
              const newPoints = (data.points as number ) + (!data.voteStatus ? 1 : 2) * value
              
              cache.writeFragment(gql`
                fragment _ on Post {
                  points
                  voteStatus
                }
              ` , { id: postId , voteStatus: args.value ,points: newPoints })
            }
          }
        }
      }
    }),ssrExchange, fetchExchange])
}

export const createUrqlClient = (ssrExchange : any , ctx: any) => {
  let cookie: any;
  if(isServer()) {
    cookie = ctx?.req?.headers.cookie
  }

  return {
    url: 'http://localhost:4000/graphql' ,
    maskTypename: false,
    fetchOptions : {
      credentials: "include" as const ,
      headers:  cookie ? {
        cookie
      } : undefined
    },
    exchanges: [composedExchanges(ssrExchange)],
  }
}