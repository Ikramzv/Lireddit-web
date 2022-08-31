import { Box } from '@chakra-ui/react';
import React from 'react'

type WrapperVariants = 'small' | 'regular'

interface WrapperProps { 
    children: React.ReactElement
    variant?: WrapperVariants
}

const Wrapper: React.FC<WrapperProps> = ({ children ,variant }) => { 
    return (
        <Box maxW={variant === 'regular' ? '800px' : '400px'} w='100%' mt={8} mx={'auto'} >
            { children }
        </Box>
    )
}


export default Wrapper ;