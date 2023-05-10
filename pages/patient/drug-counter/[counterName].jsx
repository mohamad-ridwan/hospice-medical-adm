import { useState, useEffect, useContext } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import style from 'styles/DetailCounter.module.scss'
import { AuthContext } from 'lib/context/auth'
import { NotFoundRedirectCtx } from 'lib/context/notFoundRedirect'

function DetailCounter() {
    const [head] = useState([
        {
            name: 'Queue Number'
        },
        {
            name: 'Patient Name'
        },
        {
            name: 'Disease Type'
        },
        {
            name: 'Email'
        },
        {
            name: 'Phone'
        },
        {
            name: 'Date of Birth'
        },
        {
            name: 'Patient ID'
        },
    ])

    const router = useRouter()
    const { counterName = '' } = router.query

    // context
    const { user, loadingAuth } = useContext(AuthContext)
    const { onNavLeft } = useContext(NotFoundRedirectCtx)

    return (
        <>
            <Head>
                <title>Counter {counterName} | Admin Hospice Medical</title>
                <meta name="description" content="daftar dari pendaftaran pasien yang belum dikonfirmasi" />
            </Head>

            <div className={onNavLeft ? `${style['wrapp']} ${style['wrapp-active']}` : style['wrapp']}>
                <div className={style['container']}>
                    <div className={style['content']}>
                        <h1 className={style['title']}>
                            <span className={style['desc']}>
                                Patient Queue List from Counter
                            </span>
                            <span className={style['name-loket']}>
                                {counterName}
                            </span>
                        </h1>
                    </div>
                </div>
            </div>
        </>
    )
}

export default DetailCounter