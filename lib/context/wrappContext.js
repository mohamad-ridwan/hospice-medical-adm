import Cookies from 'js-cookie'
import endpoint from 'lib/api/endpoint'
const { default: AuthProvider } = require("./auth")
import useSwr from 'lib/useFetch/useSwr'
import NotFoundRedirectProvider from './notFoundRedirect'

const WrappContextProvider = ({ children }) => {
    const { data, error, isLoading } = useSwr(endpoint.getAdmin(), 'GET')
    const getCookies = (id) => Cookies.get(id)
    const setCookies = (id) => Cookies.set('admin-id_hm', `${id}`)

    return (
        <>
            <AuthProvider
                getCookies={getCookies}
                setCookies={setCookies}
                dataAdmin={data}
            >
                <NotFoundRedirectProvider>
                    {children}
                </NotFoundRedirectProvider>
            </AuthProvider>
        </>
    )
}

export default WrappContextProvider