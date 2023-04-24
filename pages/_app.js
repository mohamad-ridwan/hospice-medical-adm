import WrappContextProvider from 'lib/context/wrappContext'
import AuthWrapper from 'components/AuthWrapper'
import 'styles/globals.css'

export default function App({ Component, pageProps }) {
  return <>
    <WrappContextProvider>
      <AuthWrapper>
        <Component {...pageProps} />
      </AuthWrapper>
    </WrappContextProvider>
  </>
}
