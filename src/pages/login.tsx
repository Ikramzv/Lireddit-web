import { Box, Button, Divider, Flex, Heading, Link } from '@chakra-ui/react'
import { Form, Formik } from 'formik'
import { useRouter } from 'next/router'
import React from 'react'
import InputField from '../components/InputField'
import Wrapper from '../components/Wrapper'
import { MeDocument, MeQuery, useLoginMutation } from '../generated/graphql'
import { toErrorMap } from '../utils/toErrorMap'
import { useIfLoggedIn } from '../utils/useIfLoggedIn'

interface loginProps { 

}

const Login: React.FC<loginProps> = ({  }) => { 
    const [login , {}] = useLoginMutation()
    const router = useRouter()
    useIfLoggedIn()
    return (
        <Wrapper variant='small' >
            <>
                <Heading as={'h1'} textAlign='center' color={'teal'} mb={4} >Login</Heading>
                <Divider my={3} bgColor='black' h={0.2} />
                <Formik initialValues={{usernameOrEmail: '' , password: '' }} onSubmit={async(values , { setErrors }) => {
                    const { data }  = await login({variables: values , update: (cache , { data }) => {
                        cache.evict({ fieldName: 'posts' })
                        cache.writeQuery<MeQuery>({ query: MeDocument , data: {
                            __typename: 'Query',
                            me: data?.login.user
                        } })
                    }})
                    if(data?.login.errors) {
                        return setErrors(toErrorMap(data?.login.errors))
                    } else if (data?.login.user) {
                        if(typeof router.query.next === 'string') {
                            return router.replace(router.query.next)
                        } else {
                            return router.replace('/')
                        }
                    }
                    
                }} >
                    {({ isSubmitting }) => (
                        <Form>
                            <InputField name='usernameOrEmail' placeholder='Username or email...' label='Username or Email' />
                            <Box mt={4} >
                                <InputField name='password' placeholder='Password...' label='Password' type={'password'} />
                            </Box>
                            <Flex alignItems={'center'} >
                                <Button type='submit' colorScheme='teal' mt={4} isLoading={isSubmitting}>Login</Button>
                                <Link href='/register' style={{textDecoration: 'none'}} >
                                    <Button type='button' colorScheme='teal' mt={4} ml={3} >Register</Button>
                                </Link>
                                <Link href='/forgot-password' as={'a'} ml={'auto'} mt='auto ' _hover={{textDecoration: 'none' , color: 'crimson'}} >
                                    <Heading as={'p'} fontSize={14} >Forgot password ?</Heading>
                                </Link>
                            </Flex>
                        </Form>
                    )}
                </Formik>
            </>
        </Wrapper>
    )
}



export default Login