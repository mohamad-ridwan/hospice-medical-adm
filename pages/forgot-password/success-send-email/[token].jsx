import { useEffect, useState } from 'react'
import Link from 'next/link'
import Head from "next/head"
import { useRouter } from "next/router"
import styleLogin from 'styles/Login.module.scss'
import LoadProccessForgotPw from "components/LoadProccessForgotPw"
import HeadForgotPassword from 'components/HeadForgotPassword'
import Button from 'components/Button'
import endpoint from 'lib/api/endpoint'
import useSwr from 'lib/useFetch/useSwr'
import API from 'lib/api'

function SuccessSendEmail() {
    const [emailUser, setEmailUser] = useState('')
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const { token: tokenUrl } = router.query

    const { data: dataBlackListJWTAPI, error: errBlackListJWTAPI, isLoading: loadingBlackListJWTAPI } = useSwr(endpoint.getBlackListJWT(), 'GET')
    const { data: dataAdmin, error: errDataAdmin, isLoading: loadingDataAdmin } = useSwr(endpoint.getAdmin(), 'GET')

    const toPage = (path) => {
        router.push(path)
    }

    const getUser = (userId) => {
        if (loadingDataAdmin === false && dataAdmin?.data) {
            const res = dataAdmin.data
            const findUser = res.find(user => user.id === userId && user.isVerification === true)

            if (res.length > 0) {
                if (findUser) {
                    setEmailUser(findUser.email)
                    setLoading(false)
                } else {
                    alert('User not found!')
                    toPage('/login')
                }
            } else {
                alert('User not found!')
                toPage('/login')
            }
        } else if (loadingDataAdmin === false && !dataAdmin?.data) {
            alert('Oops telah terjadi kesalahan server\nMohon coba beberapa saat lagi')
            console.log(errDataAdmin)
            toPage('/login')
        }
    }

    const checkBlackListToken = (userId) => {
        if (loadingBlackListJWTAPI === false && dataBlackListJWTAPI?.data) {
            const res = dataBlackListJWTAPI.data

            if (res.length > 0) {
                const findBlackList = res.find(token => token.token === tokenUrl)

                if (findBlackList) {
                    toPage(`/forgot-password/create-new-password/has-been-successfully/${tokenUrl}`)
                } else {
                    getUser(userId)
                }
            } else {
                getUser(userId)
            }
        } else if (loadingBlackListJWTAPI === false && !dataBlackListJWTAPI?.data) {
            alert('Oops telah terjadi kesalahan server\nMohon coba beberapa saat lagi')
            console.log(errBlackListJWTAPI)
            toPage('/login')
        }
    }

    const getJwtToken = () => {
        if (tokenUrl) {
            API.APIGetJwtTokenVerif(tokenUrl)
                .then(res => {
                    if (res?.error !== null) {
                        alert(res.error)
                        toPage('/login')
                    } else {
                        checkBlackListToken(res.data.userData.id)
                    }
                })
                .catch(err => {
                    alert('Oops telah terjadi kesalahan server\nMohon coba beberapa saat lagi')
                    console.log(err)
                    toPage('/login')
                })
        } else {
            console.log('no token in url')
        }
    }

    useEffect(() => {
        getJwtToken()
    }, [tokenUrl, dataBlackListJWTAPI, dataAdmin])

    const openEmail = (url) => {
        window.open(url)
    }

    return (
        <>
            <Head>
                <title>Success Send Email | Admin Hospice Medical</title>
                <meta name="description" content="sukses mengirim email pada lupa password untuk mereset password pada akun admin hospice medical" />
            </Head>

            <div className={styleLogin['wrapp']}>
                <LoadProccessForgotPw
                    style={{
                        display: loading ? 'flex' : 'none'
                    }}
                    text="Please wait a moment"
                />
                <div className={styleLogin['container-white']} style={{
                    display: loading === false ? 'flex' : 'none'
                }}>
                    <HeadForgotPassword
                        icon="fas fa-envelope"
                        title="Check your email"
                        desc={`We sent a password reset link to ${emailUser}`}
                    />

                    <Button
                        name="OPEN EMAIL"
                        style={{
                            margin: "10px 0 0 0"
                        }}
                        click={() => openEmail('https://mail.google.com')}
                    />

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

export default SuccessSendEmail

SuccessSendEmail.getLayout = function getLayout(page) {
    return (
        <>
            {page}
        </>
    )
}