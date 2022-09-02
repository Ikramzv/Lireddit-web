import { DeleteIcon, EditIcon } from "@chakra-ui/icons"
import { Box, Button, CircularProgress, Divider, Flex, Heading, IconButton, Stack } from "@chakra-ui/react"
import NavLink from "next/link"
import { useRouter } from "next/router"
import { Layout } from "../components/Layout"
import { UpdootSection } from "../components/UpdootSection"
import { Post, useDeletePostMutation, useMeQuery, usePostsQuery } from "../generated/graphql"
import { isServer } from "../utils/isServer"

const Index = () => {
  const [deletePost , {}] = useDeletePostMutation()
  const router = useRouter()
  const {data: userData} = useMeQuery({
    skip: isServer(),
  })
  const handleClick = (id: Post['id']) => router.push(`/post/${id}`)
  // Posts query always results back before me query. Prevent from this complexity pause the posts query if hasn't existing user .
  // When me query response back then set pause property to false
  const {data , loading , fetchMore , variables , networkStatus } = usePostsQuery({ 
    variables: { limit: 10 , cursor: null as null | string },
    notifyOnNetworkStatusChange: true,
  })
  
  console.log(networkStatus)
  
  if(!loading && !data?.posts.posts) {
    return <div>You have no post yet</div>
  }
  return (
    <Layout variant="regular" >
      <Flex direction={'column'} >
        <Flex align={'center'} justifyContent={'center'} >
          {userData?.me?.username ? (
            <NavLink href={'/create_post'}>
              <Button colorScheme="teal" w={'max-content'} >
                Create post
              </Button>
            </NavLink>
          ) : ''}
        </Flex>
          <Stack wrap={'wrap'} direction='row' gap={5} mt={4} mb={10} justify={'center'} >
            {loading && !data?.posts ? (
              <div>
                <CircularProgress isIndeterminate color="orange" thickness='15px' />
              </div>
            ) : (
              data?.posts?.posts.map(p => {
                const postDate = new Date(parseInt(p.createdAt)).toLocaleString().replaceAll('/' , '-')
                return (
                  <Stack key={p.id} py={5} px={3} borderRadius={10} w={350} shadow={'0 0 5px 0 black'} cursor='pointer' position={'relative'}>
                    <Flex>
                      <UpdootSection post={p} />
                      <Box>
                        <Box onClick={() => handleClick(p.id)} >
                          <Heading as={'h3'} fontSize={18} color='black' pb={2} _selection={{color:'orange',bgColor:'black'}} >{p.title}</Heading>
                          <Heading as={'h3'} fontSize={16} color='gray' pb={2}>{p.creator.username}</Heading>
                        </Box>
                        <Divider mb={2} />
                        <Flex onClick={() => handleClick(p.id)}  alignItems={'start'} justify={'space-between'} direction={'column'} >
                          <p style={{color: 'black' ,}} >{p.textSnippet}</p>
                          <span style={{color: 'black' , fontSize: '13px' , marginLeft: 'auto'}} suppressHydrationWarning>
                            { postDate }
                          </span>
                        </Flex>
                        {
                          p.creator.id === userData?.me?.id ? (
                            <>
                              <IconButton aria-label="delete post" 
                                icon={<DeleteIcon />} 
                                position={'absolute'} 
                                right={'10px'} 
                                top={'10px'} 
                                fontSize={16}
                                w={8}
                                h={8}
                                colorScheme={'red'} 
                                _active={{ transform: 'scale(0.6)' , transition: '200ms' }} 
                                onClick={() => deletePost({ 
                                  variables: { id: p.id } ,
                                  update: (cache) => {
                                    cache.evict({ id: `Post:${p.id}` })
                                  }
                                })}
                              />
                              <IconButton aria-label="delete post" 
                                icon={<EditIcon />} 
                                position={'absolute'} 
                                right={'10px'} 
                                top={'50px'} 
                                fontSize={16}
                                w={8}
                                h={8}
                                colorScheme={'blue'} 
                                _active={{ transform: 'scale(0.6)' , transition: '200ms' }} 
                                onClick={() => router.push(`/post/edit/${p.id}`)}
                              />
                            </>
                          ) : ''
                        }
                      </Box>
                    </Flex>
                  </Stack>
                )
              })
            )}
          </Stack>
          {data?.posts && data.posts.hasMore && (
            <Flex justify={'center'} >
              <Button onClick={() => {
                fetchMore({ 
                  variables: {
                    limit: variables?.limit ,
                    cursor: data.posts.posts[data.posts.posts.length - 1]?.createdAt
                  }
                })
              }} my={8} >Load More</Button>
            </Flex>
          )}
      </Flex>
    </Layout>
  )
}

export default Index