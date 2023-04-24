import { createContext, useState, useEffect } from "react"

export const AuthContext = createContext()

export const AuthProvider = ({ children, getCookies, setCookies, dataAdmin }) => {
    const [loadingAuth, setLoadingAuth] = useState(true)
    const [user, setUser] = useState(null)

    const getAdminId = getCookies('admin-id_hm')

    const finishedLoadAuth = ()=>{
        setTimeout(() => {
            setLoadingAuth(false)
        }, 500)
    }

    useEffect(() => {
        if (getAdminId && dataAdmin?.data) {
            const res = dataAdmin.data
            const findAdmin = res.find(user =>
                user.id === getAdminId &&
                user.isVerification === true
            )

            if (findAdmin?.id) {
                setUser(findAdmin)
                finishedLoadAuth()
            } else {
                setUser(null)
                finishedLoadAuth()
            }
        } else if(!getAdminId) {
            setUser(null)
            finishedLoadAuth()
        }
    }, [getAdminId, dataAdmin, user])

    return (
        <AuthContext.Provider value={{ user, setUser, loadingAuth }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider