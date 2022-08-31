import React, { useEffect } from 'react'
import { Form, Formik } from 'formik'
import { Box, Button, Flex } from '@chakra-ui/react';
import Wrapper from '../components/Wrapper';
import InputField from '../components/InputField';
import { useRouter } from 'next/router';
import { useMeQuery, useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { useIfLoggedIn } from '../utils/useIfLoggedIn';

interface registerProps { 

}


const Register: React.FC<registerProps> = ({}) => { 
    const router = useRouter()
    const [{} , register] = useRegisterMutation()
    useIfLoggedIn();
    
    return (
        <Wrapper variant='small' >
            <Formik initialValues={{username: '' , password: '' , email: ''}} onSubmit={async(values , {setErrors}) => {
                const { data } = await register({options: values})
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