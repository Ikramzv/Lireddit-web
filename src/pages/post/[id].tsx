import { Box, Divider, Heading, Stack } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import React from 'react'
import { Layout } from '../../components/Layout'
import { usePostQuery } from '../../generated/graphql'

const Post: React.FC<{ post: any }> = ({ post }) => { 
    console.log(post)
    const router = useRouter()
    const { data , loading } = usePostQuery({
        variables: {id: router.query.id?.toString() as string}
    })
    if(loading) {
        return (
            <Layout variant='regular' >
                <div>Loading...</div>
            </Layout>
        )
    }
    return (
        <Layout variant='regular' >
            <Stack>
                <Heading>{data?.post?.title}</Heading>
                <Heading as={'p'} fontSize={18} >{data?.post?.creator.username}</Heading>
                <Divider as={'hr'} />
                <Box>
                    {data?.post?.text}
                </Box>
            </Stack>
        </Layout>
    )
}

export default Post