import { ApolloCache, gql } from '@apollo/client';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { Box, Flex, IconButton } from '@chakra-ui/react';
import React from 'react';
import { PostSnippetFragment, useVoteMutation, VoteMutation } from '../generated/graphql';

interface UpdootSectionProps { 
    post: PostSnippetFragment ;
}

function updateAfterVote(value: number , cache: ApolloCache<VoteMutation> , postId: string) {
    const data = cache.readFragment<{ points: number , voteStatus: number | null , id: string }>({
        id: `Post:${postId}`,
        fragment: gql`
            fragment _ on Post {
                voteStatus
                points
                id
            }                
        `
    })
    if(data) {
        if(data.voteStatus === value) {
            return;
        }
        const newPoints = data.points as number + (!data.voteStatus ? 1 : 2) * value
        cache.writeFragment({ id: `Post:${postId}` , fragment: gql`
            fragment __ on Post {
                voteStatus
                points
            }            
        ` , data: { voteStatus: value , points: newPoints } })
    }
    
}

export const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => { 
    const [vote ,{  }] = useVoteMutation()
    return (
        <Flex mr={3} direction='column' alignItems={'center'} justifyContent='center' >
            <Box>
                <IconButton
                    aria-label="updoot post" 
                    icon={<ChevronUpIcon />} 
                    fontSize={20} 
                    _active={{transform: 'scale(0.6)' , transition: '200ms'}} 
                    onClick={async() => {
                        if(post.voteStatus === 1) {
                            return ;
                        }
                        await vote({
                            variables: { postId: post.id , value: 1 }, 
                            update: (cache) => updateAfterVote(1 , cache , post.id)
                        })
                    }}
                    colorScheme={post.voteStatus === 1 ? 'green' : undefined}
                />
            </Box>
            {post.points}
            <Box>
                <IconButton 
                    aria-label="downdoot post" 
                    icon={<ChevronDownIcon />} 
                    fontSize={20} 
                    _active={{transform: 'scale(0.6)' , transition: '200ms'}} 
                    onClick={async() => {
                        if(post.voteStatus === -1) {
                            return ;
                        }
                        await vote({variables: { postId: post.id,value: -1  } , update: (cache) => updateAfterVote(-1 , cache , post.id) })
                    }}
                    colorScheme={post.voteStatus === -1 ? 'red' : undefined}
                />
        </Box>
        </Flex>
    )
}