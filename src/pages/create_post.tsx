import { useApolloClient } from "@apollo/client";
import { Button, Flex } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import React from "react";
import InputField from "../components/InputField";
import { Layout } from "../components/Layout";
import { useCreatePostMutation } from "../generated/graphql";
import { useIsAuth } from "../utils/useIsAuth";

const CreatePost: React.FC<{}> = ({}) => {
    const [createPost] = useCreatePostMutation()
    const router = useRouter()
    const apolloClient = useApolloClient()
    useIsAuth()
    
    return (
        <Layout variant="small" >
            <Formik initialValues={{ title: '' , text: '' }} onSubmit={async(values , { setErrors , setValues }) => {
                const { data } = await createPost({variables: { input: values } , onError: (error) => {
                    const fixedErrorMsg = error.message
                    if(fixedErrorMsg?.includes('must be fulfilled')) {
                        if(fixedErrorMsg?.includes('and')) {
                            setErrors({
                                title: fixedErrorMsg,
                                text: fixedErrorMsg
                            })
                        } else if(fixedErrorMsg?.includes('text')) {
                            setErrors({
                                title: '',
                                text: fixedErrorMsg
                            })
                        } else if (fixedErrorMsg.includes('title')) {
                            setErrors({
                                title: fixedErrorMsg,
                                text: ''
                            })
                        }
                }}})
                if(data) {
                    apolloClient.cache.reset()
                    return router.push('/')
                }

                return
            }} >
                {({isSubmitting}) => (
                    <Form>
                        <Flex direction={'column'} gap={4} >
                            <InputField name="title" label="Title" placeholder="Post title..." type={'text'} />
                            <InputField name="text" label="Description" placeholder="Post description..." type={'text'} textarea rows={5} style={{resize: 'none'}} />
                        </Flex>
                        <Button type="submit" colorScheme="teal" mt={6} isLoading={isSubmitting} >Create</Button>
                    </Form>
                )}
            </Formik>
        </Layout>
    )
}

export default CreatePost