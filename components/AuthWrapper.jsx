import { AuthContext } from "lib/context/auth"
import { NotFoundRedirectCtx } from "lib/context/notFoundRedirect"
import { useRouter } from "next/router"
import { useContext, useEffect } from "react"

function AuthWrapper({
  children
}) {
  const { user, loadingAuth } = useContext(AuthContext)
  const { isPageNotFound, setIsPageNotFound } = useContext(NotFoundRedirectCtx)
  const router = useRouter()

  const { pathname } = router

  useEffect(() => {
    if (isPageNotFound === false) {
      if (user === null &&
        loadingAuth === false &&
        !pathname.includes('forgot-password') &&
        !pathname.includes('register') &&
        !pathname.includes('patient-registration-information')
      ) {
        router.push('/login')

        return
      } else if (pathname === '/login' && user?.id) {
        router.push('/')

        return
      } else if (pathname === '/register' && user?.id) {
        router.push('/')

        return
      }
    }
  }, [isPageNotFound, user, loadingAuth])

  return <>{children}</>
}

export default AuthWrapper