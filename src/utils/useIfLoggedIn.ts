import { useRouter } from "next/router"
import { useEffect } from "react"
import { useMeQuery } from "../generated/graphql"

export const useIfLoggedIn = () => {
    const router = useRouter()
    const [{ data }] = useMeQuery()
    useEffect(() => {
        if(data?.me) {
            router.replace('/')
        }
    } , [data])
}