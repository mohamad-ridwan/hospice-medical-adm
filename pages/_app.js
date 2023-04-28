import WrappContextProvider from 'lib/context/wrappContext'
import AuthWrapper from 'components/AuthWrapper'
import 'styles/globals.css'
import Navbar from 'components/Navbar/Navbar'
import NavLeft from 'components/NavLeft/NavLeft'
import NavLeftMobile from 'components/NavLeft/NavLeftMobile'

export default function App({ Component, pageProps }) {
  if (Component.getLayout) {
    return Component.getLayout(
      <WrappContextProvider>
        <AuthWrapper>
          <Component {...pageProps} />
        </AuthWrapper>
      </WrappContextProvider>
    )
  }
  return <>
    <WrappContextProvider>
      <AuthWrapper>
        <Navbar />
        <NavLeft/>
        <NavLeftMobile/>
        <Component {...pageProps} />
      </AuthWrapper>
    </WrappContextProvider>
  </>
}
