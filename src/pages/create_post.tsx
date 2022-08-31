import { Button, Flex } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import React from "react";
import InputField from "../components/InputField";
import { useCreatePostMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { Layout } from "../components/Layout";
import { useIsAuth } from "../utils/useIsAuth";
import { useRouter } from "next/router";

const CreatePost: React.FC<{}> = ({}) => {
    const [{} , createPost] = useCreatePostMutation()
    const router = useRouter()
    useIsAuth()
    
    return (
        <Layout variant="small" >
            <Formik initialValues={{ title: '' , text: '' }} onSubmit={async(values , { setValues, setErrors }) => {
                const { error } = await createPost({input: values})
                const fixedErrorMsg = error?.message.split('[GraphQL] ')[1]
                if(!error) {
                    router.push('/')
                    return setValues({title: '' , text: ''})
                }
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
                    return
                }
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

export default withUrqlClient(createUrqlClient)(CreatePost);