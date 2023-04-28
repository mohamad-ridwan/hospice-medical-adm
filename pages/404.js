import { useContext, useEffect } from 'react'
import Head from 'next/head'
import style from 'styles/NotFound.module.scss'
import styleLogin from 'styles/Login.module.scss'
import { NotFoundRedirectCtx } from 'lib/context/notFoundRedirect'
import Button from 'components/Button'
import Link from 'next/link'

const NotFoundPage = () => {
    const { setIsPageNotFound } = useContext(NotFoundRedirectCtx)

    useEffect(() => {
        setIsPageNotFound(true)

        return ()=>{
            setIsPageNotFound(false)
        }
    }, [])

    return (
        <>
            <Head>
                <title>Page Not Found | Admin Hospice Medical</title>
                <meta name="description" content="halaman tidak ditemukan pada route Admin Hospice Medical" />
            </Head>

            <div className={styleLogin['wrapp']}>
                <div className={styleLogin['container-white']} style={{
                    backgroundColor: 'transparent',
                    width: '600px',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <h1 className={style['title']}>
                        404 - <span className={style['not-found']}>Page Not Found</span>
                    </h1>

                    <p className={style['desc']}>Sorry, there is nothing to see here</p>

                    <Link href="/">
                        <Button
                            name="HOMEPAGE"
                            style={{
                                margin: "30px 0 0 0"
                            }}
                        />
                    </Link>
                </div>
            </div>
        </>
    )
}

export default NotFoundPage

NotFoundPage.getLayout = function getLayout(page){
    return (
        <>
        {page}
        </>
    )
}