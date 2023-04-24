import { AuthContext } from "lib/context/auth"
import { useRouter } from "next/router"
import { useContext, useEffect } from "react"

function AuthWrapper({
  children
}) {
  const { user, loadingAuth } = useContext(AuthContext)
  const router = useRouter()

  const { pathname } = router

  useEffect(() => {
    if (user === null &&
      loadingAuth === false &&
      !pathname.includes('forgot-password') &&
      !pathname.includes('register')
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
  }, [user, loadingAuth])

  return <>{children}</>
}

export default AuthWrapper