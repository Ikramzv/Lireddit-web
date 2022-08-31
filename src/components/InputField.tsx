import { ComponentWithAs, FormControl, FormErrorMessage, FormLabel, Input, Textarea, TextareaProps } from '@chakra-ui/react'
import { useField } from 'formik'
import React, { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label: string ,
    name: string
    textarea?: boolean
}

const InputField : React.FC<InputFieldProps> = ({size: _, textarea ,...props}) => {
    let InputOrTextarea = Input as ComponentWithAs<"input">
    if(textarea) {
        InputOrTextarea = Textarea as ComponentWithAs<"textarea", TextareaProps>
    }
    const [field , meta] = useField(props)
    return (
        <FormControl isInvalid={!!meta.error} >
            <FormLabel htmlFor={field.name} >{props.label}</FormLabel>
            <InputOrTextarea {...field} id={field.name} {...props} />
            {meta.error && <FormErrorMessage>{meta.error}</FormErrorMessage>}
        </FormControl>
    )
}


export default InputField