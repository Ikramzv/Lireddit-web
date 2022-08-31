import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { Box, Flex, IconButton } from '@chakra-ui/react';
import React from 'react';
import { PostSnippetFragment, useVoteMutation } from '../generated/graphql';

interface UpdootSectionProps { 
    post: PostSnippetFragment ;
}

export const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => { 
    const [{}, vote] = useVoteMutation()
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
                        await vote({postId: post.id , value: 1})
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
                        await vote({ postId: post.id,value: -1 })
                    }}
                    colorScheme={post.voteStatus === -1 ? 'red' : undefined}
                />
        </Box>
        </Flex>
    )
}