import { useContext } from 'react'
import Head from 'next/head'
import styles from 'styles/Home.module.scss'
import { NotFoundRedirectCtx } from 'lib/context/notFoundRedirect'

export default function Home() {
  const { onNavLeft } = useContext(NotFoundRedirectCtx)

  return (
    <>
      <Head>
        <title>Admin Hospice Medical</title>
        <meta name="description" content="tampilan dashboard admin hospice medical" />
      </Head>
      <div className={onNavLeft ? `${styles['wrapp']} ${styles['wrapp-active']}` : styles['wrapp']}>
        <div className={styles['container']}>
          <div className={styles['content']}>
            <h1 className={styles['title']}>Welcome Home!</h1>
          </div>
        </div>
      </div>
    </>
  )
}