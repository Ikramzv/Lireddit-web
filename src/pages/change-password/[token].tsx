import { Alert, AlertIcon, Button, Flex, Heading, Link  } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { NextPage } from 'next';
import InputField from '../../components/InputField';
import Wrapper from '../../components/Wrapper';
import { useChangePasswordMutation } from '../../generated/graphql';
import { toErrorMap } from '../../utils/toErrorMap';
import { useRouter } from 'next/router' 
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { useEffect, useState } from 'react';
import NavLink from 'next/link';


export const ChangePassword: NextPage = ({  }) => { 
    const [{} , changePassword] = useChangePasswordMutation()
    const router = useRouter()
    const [tokenErr, setTokenErr] = useState('')
    useEffect(() => {
        if(tokenErr) {
            setTimeout(() => {
                setTokenErr('')
            } , 6000)
        }
    } , [tokenErr])
    return (
        <Wrapper variant="small" >
            <Formik initialValues={{newPassword: '' , confirmPassword: ''}} onSubmit={async(values , {setErrors , setFieldError}) => {
                const response = await changePassword({
                    token: typeof router.query.token === 'string' ? router.query.token : '' , 
                    newPassword: values.newPassword
                })
                if(values.newPassword !== values.confirmPassword) {
                    return setFieldError('confirmPassword' , 'Must be equal to new password')
                }
                if(response.data?.changePassword.errors){
                    const errorMap = toErrorMap(response?.data.changePassword.errors)
                    if('token' in errorMap) {
                        return setTokenErr(errorMap.token)
                    }
                    return setErrors(errorMap)
                }
                return router.push('/')
            }}>
                {({ isSubmitting }) => (
                    <Form>
                        <Flex direction='column' gap={4} >
                            {tokenErr && (
                                <Alert status='error' borderRadius={6}>
                                    <AlertIcon />
                                    {tokenErr}
                                    <NavLink href={'/forgot-password'}>
                                        <Link ml={'auto'} borderRadius={4} p={2}  _hover={{bgColor: 'crimson' , color: 'white'}}>
                                            Forgot password ?
                                        </Link>
                                    </NavLink>
                                </Alert>
                            )}
                            <Heading as={'h2'} textAlign='center' mb={4} >Change password</Heading>
                            <InputField name='newPassword' label='New Password' placeholder='New password ..' type={'password'}  />
                            <InputField name='confirmPassword' label='Confirm New Password' placeholder='Confirm new password ..' type={'password'}  />
                            <Button type='submit' colorScheme='teal' w={'max-content'} isLoading={isSubmitting} >Change Password</Button>
                        </Flex>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    );
}

export default withUrqlClient(createUrqlClient)(ChangePassword)