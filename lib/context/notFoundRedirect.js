import { createContext, useState } from "react"

export const NotFoundRedirectCtx = createContext()

const NotFoundRedirectProvider = ({ children }) => {
    const [isPageNotFound, setIsPageNotFound] = useState(false)
    const [onNavLeft, setOnNavLeft] = useState(true)
    const [onNotif, setOnNotif] = useState(false)
    const [activeLeftMenu, setActiveLeftMenu] = useState(null)

    const handleOnNavLeft = () => {
        setOnNavLeft(!onNavLeft)
    }

    return (
        <NotFoundRedirectCtx.Provider value={{
            isPageNotFound,
            setIsPageNotFound,
            onNavLeft,
            handleOnNavLeft,
            onNotif,
            setOnNotif,
            activeLeftMenu,
            setActiveLeftMenu
        }}>
            {children}
        </NotFoundRedirectCtx.Provider>
    )
}

export default NotFoundRedirectProvider