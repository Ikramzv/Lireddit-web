import { useApolloClient } from '@apollo/client';
import { Box, Button, Flex, Heading, Link } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/isServer';

interface NavbarProps { 
    
}

const Navbar: React.FC<NavbarProps | any> = ({ }) => { 
    const { data , loading } = useMeQuery({
        skip: isServer() ,
    })
    const [logout ,{ loading: logoutFetching }] = useLogoutMutation()
    const apolloClient = useApolloClient()
    const router = useRouter()
    let body = null
    // If data is not undefined render the followings
    if(typeof data !== "undefined") {
        if(loading) {
            // data is loading
            body = 'Fetching ...'
        } else if (!data?.me) {
            // user not logged in
            body = (
                <>
                    <Link as={NextLink} href={'/login'} >Login</Link>
                    <Link as={NextLink} href={'/register'} >Register</Link>
                </>
            )
        } else {
            // user logged in and display user
            body = (
                <Flex display={'flex'} align={'center'} gap={4} >
                    <Heading as={'h2'} fontSize={'17px'} >{data?.me.username}</Heading>
                    <Button variant={'outline'} isLoading={logoutFetching} onClick={async() => {
                        await logout()
                        await apolloClient.cache.reset()
                    }} >Logout</Button>
                </Flex>
            )
        }
    }

    return (
        <Flex align={'center'} justifyContent={'center'} bg={'tan'} gap={6} position='sticky' top='0' zIndex={1000} >
            <Flex align={'center'} w={800} justifyContent={'space-around'} >
                <NextLink href={'/'} >
                    <Link href='/' ml={4} _hover={{textDecoration: 'none'}} >
                        <Heading>LiReddit</Heading>
                    </Link>
                </NextLink>
                <Box p={4} ml='auto' display={'flex'} gap={4} >
                    {body}
                </Box>
            </Flex>
        </Flex>
    );
}

export default Navbar