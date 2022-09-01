import { Button, Flex } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import InputField from '../components/InputField';
import Wrapper from '../components/Wrapper';
import { MeDocument, MeQuery, useRegisterMutation } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { toErrorMap } from '../utils/toErrorMap';
import { useIfLoggedIn } from '../utils/useIfLoggedIn';

interface registerProps { 

}


const Register: React.FC<registerProps> = ({}) => { 
    const router = useRouter()
    const [register , {}] = useRegisterMutation()
    useIfLoggedIn();
    
    return (
        <Wrapper variant='small' >
            <Formik initialValues={{username: '' , password: '' , email: ''}} onSubmit={async(values , {setErrors}) => {
                const { data } = await register({variables: { options: values } , update: (cache , { data }) => {
                    cache.writeQuery<MeQuery>({
                        query: MeDocument,
                        data: {
                            __typename: 'Query',
                            me: data?.register.user
                        }
                    })
                }})
                if(data?.register.errors) {
                    return setErrors(toErrorMap(data.register.errors))
                } else if(data?.register.user) {
                    console.log(data?.register.user)
                    await router.push('/')
                }
            }} >
            {({ isSubmitting  }) => (
                <Form>
                    <Flex direction={'column'} gap={3}>
                        <InputField name='username' placeholder='Username..' label='Username' autoComplete='off' />
                        <InputField name='password' placeholder='Password...' label='Password' type={'password'}  />
                        <InputField name='email' placeholder='Email...' label='Email' type={'email'} autoComplete='off'  />
                    </Flex>
                    <Button type='submit' colorScheme={'teal'} mt={4} isLoading={isSubmitting} >Register</Button>
                </Form>
            )}
            </Formik>
        </Wrapper>
    );
}

export default withUrqlClient(createUrqlClient)(Register);