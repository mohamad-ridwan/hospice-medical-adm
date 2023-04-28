import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from "next/head"
import Link from 'next/link'
import Error from 'next/error'
import styleLogin from 'styles/Login.module.scss'
import styleVerif from 'styles/Verification.module.scss'
import Button from 'components/Button'
import { backendUrl } from 'lib/api/backendUrl'
import endpoint from 'lib/api/endpoint'
import BoxCode from 'components/BoxCode'
import API from 'lib/api'

function Verification({
    userData,
    errorCode
}) {
    const [loading, setLoading] = useState(true)
    const [msgLoadingVerification, setMsgLoadingVerification] = useState('Please wait a moment')
    const [success, setSuccess] = useState(false)
    const [boxCode] = useState([
        {
            id: 'code1'
        },
        {
            id: 'code2'
        },
        {
            id: 'code3'
        },
        {
            id: 'code4'
        }
    ])
    const [codeValue, setCodeValue] = useState({
        code1: '',
        code2: '',
        code3: '',
        code4: ''
    })

    const router = useRouter()
    const { userId } = router.query

    const findAdmin = () => {
        if (router.isFallback === false) {
            if (userData) {
                setLoading(false)
            } else {
                alert('Invalid User or token is expired')
                setTimeout(() => {
                    router.push('/register')
                }, 0)
            }
        }
    }

    useEffect(() => {
        findAdmin()
    }, [router.isFallback, userData])

    const changeCodeValue = (e) => {
        setCodeValue({
            ...codeValue,
            [e.target.name]: e.target.value
        })
    }

    const handleForm = () => {
        let err = {}

        if (codeValue.code1.length === 0) {
            err.code1 = 'error code1'
        }
        if (codeValue.code2.length === 0) {
            err.code2 = 'error code2'
        }
        if (codeValue.code3.length === 0) {
            err.code3 = 'error code3'
        }
        if (codeValue.code4.length === 0) {
            err.code4 = 'error code4'
        }

        return new Promise((resolve, reject) => {
            if (Object.keys(err).length === 0) {
                resolve({ message: 'success' })
            } else {
                reject({ message: 'failed' })
            }
        })
    }

    const autoSubmit = () => {
        setLoading(true)
        setMsgLoadingVerification('Waiting for verification')

        API.APIGetVerification()
            .then(res => {
                const result = res?.data
                if (result) {
                    const token = `${codeValue.code1}${codeValue.code2}${codeValue.code3}${codeValue.code4}`
                    const userVerification = result.filter(user => user.verification.token === token)
                    const dateVerification = userVerification.length === 1 ? userVerification[0].verification.date : null

                    if (dateVerification !== null) {
                        const checkExpired = `${new Date()}` < dateVerification
                        if (checkExpired) {
                            updateUserIsVerification()
                        } else {
                            alert('Token is expired!\nPlease re-register')
                            router.push('/register')
                        }
                    } else {
                        alert('Invalid tokens! or Token is expired!')

                        setTimeout(() => {
                            setLoading(false)
                        }, 10);
                    }
                }
            })
            .catch(err => {
                alert('Terjadi kesalahan server\nMohon coba beberapa saat lagi!')
                router.push('/register')
                console.log(err)
            })
    }

    const updateUserIsVerification = () => {
        API.APIPutAdminVerification(userId, { isVerification: true })
            .then(res => {
                if (res?.data) {
                    return res
                } else {
                    alert('Terjadi kesalahan server\nMohon coba beberapa saat lagi!')
                    window.location.reload()
                }
            })
            .then(res => {
                deleteExpiredVerification()
            })
            .catch(err => {
                alert('Terjadi kesalahan server\nMohon coba beberapa saat lagi!')
                console.log(err)
            })
    }

    const deleteExpiredVerification = () => {
        API.APIDeleteVerification(userId)
            .then(res => {
                if (res?.data) {
                    setSuccess(true)
                    setMsgLoadingVerification('Successful Verification')
                } else {
                    console.log(res)
                }
            })
            .catch(err => {
                setSuccess(true)
                setMsgLoadingVerification('Successful Verification')
                console.log(err)
            })
    }

    useEffect(() => {
        handleForm()
            .then(res => {
                autoSubmit()
            })
            .catch(err => { return err })
    }, [codeValue])

    return (
        <>
            <Head>
                <title>{userData ? `${userData?.name} | Verification` : 'Verification'} | Admin Hospice Medical</title>
                <meta name="description" content="verifikasi akun admin hospice medical" />
            </Head>

            <div className={styleLogin['wrapp']} style={{
                width: '100vw'
            }}>
                <div className={styleVerif['container-white']}>
                    <div className={styleVerif['loading']} style={{
                        display: loading ? 'flex' : 'none'
                    }}>
                        {success ? (
                            <i className="fas fa-check-circle" style={{
                                display: success ? 'flex' : 'none'
                            }}></i>
                        ) : (
                            <>
                                <div className={styleVerif['loading-circle']}></div>
                            </>
                        )}

                        <span>{msgLoadingVerification}</span>

                        {success && (
                            <Link href="/login">
                                <Button
                                    name="BACK TO LOG IN"
                                    style={{
                                        margin: "40px 10px 0 10px",
                                    }}
                                />
                            </Link>
                        )}
                    </div>
                    <div className={styleVerif['icon']}>
                        <i className={`fas fa-key ${styleVerif['icon-key']}`}></i>
                    </div>

                    <h1 className={styleVerif['title']}>Please check your email</h1>
                    <p className={styleVerif['desc']}>{`We've`} sent a code to <span className={styleVerif['email']}>{userData?.email}</span></p>

                    <form onSubmit={(e) => e.preventDefault()} className={styleVerif['form-code']}>
                        {boxCode.map((item, index) => {
                            return (
                                <BoxCode
                                    key={index}
                                    id={item.id}
                                    name={item.id}
                                    value={codeValue[item.id]}
                                    changeInput={changeCodeValue}
                                />
                            )
                        })}
                    </form>

                    <Link href="/login">
                        <Button
                            style={{
                                flexDirection: "row-reverse",
                                margin: "20px auto 0 auto",
                                backgroundColor: '#fff',
                                border: "1px solid #fff",
                                color: "#3face4",
                                flexWrap: "wrap"
                            }}
                            styleIcon={{
                                display: "flex",
                                margin: "1px 10px 0 0"
                            }}
                            name="Back to log in"
                            icon='fas fa-arrow-left'
                        />
                    </Link>
                </div>
            </div>
        </>
    )
}

export default Verification

export async function getStaticPaths() {
    return {
        paths: [
            { params: { userId: '1682354552405' } }
        ],
        fallback: true
    }
}

export async function getStaticProps(ctx) {
    const { userId } = ctx.params
    const res = await fetch(`${backendUrl}/${endpoint.getAdmin()}`)
    const data = await res.json()
    const errorCode = await data?.data ? false : 500
    const findAdmin = data?.data?.length > 0 ? data?.data?.find(admin => admin.id === userId && admin.isVerification === false) : null
    const admin = findAdmin ? findAdmin : null

    if (!data?.data) {
        return {
            notFound: true
        }
    }

    return {
        props: {
            userData: admin,
            errorCode
        },
        revalidate: 10
    }
}

Verification.getLayout = function getLayout(page) {
    return (
        <>
            {page}
        </>
    )
}