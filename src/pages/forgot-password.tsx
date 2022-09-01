import { Box, Button, Flex, Heading } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import NavLink from 'next/link';
import React, { useState } from 'react';
import InputField from '../components/InputField';
import Wrapper from '../components/Wrapper';
import { useForgotPasswordMutation } from '../generated/graphql';


export const ForgotPassword: React.FC<{}> = ({ }) => { 
    const [forgotPassword , {}] = useForgotPasswordMutation()
    const [complete , setComplete] = useState(false)
    
    return (
        <Wrapper variant='small'>
            <Flex direction={'column'} gap={6} >
            {complete ? (
                    <Box mx={'-10px'} >
                        <Heading as={'h1'} fontSize={20} mb={3} >
                            Link has been sent successfully to your mail
                        </Heading>
                        <NavLink href={'/'} >
                            <Button colorScheme='green' >
                                Go to home
                            </Button>
                        </NavLink>
                    </Box>           
                ) : (
                    <>
                        <Formik initialValues={{email: ''}} onSubmit={async(values, {}) => {
                            await forgotPassword({variables: { email: values.email }})
                            setComplete(true)

                        }} >
                            {() => (
                                <Form>
                                    <InputField name='email' label='Email' type={'email'} placeholder='Email...' />
                                    <Button mt={2} colorScheme='teal'  type='submit'>Send</Button>
                                </Form>
                            )}
                        </Formik>
                    </>
            )}
            </Flex>
        </Wrapper>
    )
}


export default ForgotPassword