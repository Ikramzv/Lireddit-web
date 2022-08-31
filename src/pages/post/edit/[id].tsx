import { Button, Flex } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import InputField from '../../../components/InputField';
import { Layout } from '../../../components/Layout';
import { usePostQuery, useUpdatePostMutation } from '../../../generated/graphql';
import { createUrqlClient } from '../../../utils/createUrqlClient';

const EditPost: React.FC = ({  }) => { 
    const router = useRouter()
    const [{ data , fetching }] = usePostQuery({ 
        variables: { id: router.query.id as string 
    }})
    const [{} , updatePost] = useUpdatePostMutation()
    if(fetching) {
        return (
            <Layout variant='small' >
                <div>Loading...</div>
            </Layout>
        )
    }
    if(!data?.post) {
        return (
            <Layout variant='small' >
                <div>Can not find post</div>
            </Layout>
        ) 
    }
    return (
        <Layout variant='small' >
            <Formik initialValues={{ title: data.post.title , text: data.post.text }} onSubmit={async (values) => {
                const updatedPost = await updatePost({ id: data.post?.id as string , ...values })
                if(updatedPost) {
                    router.back()
                } 
            }} >
                {({ isSubmitting }) => (
                    <Form>
                        <Flex direction={'column'} gap={4} >
                            <InputField name='title' placeholder='Post title..' label='Title' type={'text'} />
                            <InputField 
                                name='text' 
                                placeholder='Post text..' 
                                label='Text' type={'text'} 
                                textarea rows={7}
                                style={{ resize: 'none' }} 
                            />
                            <Button colorScheme='blue' type='submit' maxW={'max-content'} isLoading={isSubmitting} >Update Post</Button>
                        </Flex>
                    </Form>
                )}
            </Formik>
        </Layout>
    );
}

export default withUrqlClient(createUrqlClient)(EditPost)