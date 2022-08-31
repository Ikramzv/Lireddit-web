import React, { ReactElement } from 'react'
import Navbar from './Navbar'
import Wrapper from './Wrapper'

interface LayoutProps { 
    variant: 'regular' | 'small'
    children: ReactElement
}

export const Layout: React.FC<LayoutProps> = ({ variant , children }) => { 
    return (
        <>
            <Navbar />
            <Wrapper variant={variant} >
                    { children }
            </Wrapper>
        </>
    )
}