import Head from 'next/head'
import styles from 'styles/Home.module.scss'

export default function Home() {
  return (
    <>
      <Head>
        <title>Admin Hospice Medical</title>
        <meta name="description" content="tampilan beranda admin hospice medical" />
      </Head>
      <div className={styles['wrapp']}>
        <h1 className={styles['title']}>Welcome Home!</h1>
      </div>
    </>
  )
}