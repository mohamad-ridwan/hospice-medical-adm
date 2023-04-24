import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from "next/head"
import styleLogin from 'styles/Login.module.scss'
import LoadProccessForgotPw from "components/LoadProccessForgotPw"
import HeadForgotPassword from 'components/HeadForgotPassword'
import Input from 'components/Input'
import Button from 'components/Button'
import Link from 'next/link'
import API from 'lib/api'
import useSwr from 'lib/useFetch/useSwr'
import endpoint from 'lib/api/endpoint'

function CreateNewPassword() {
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState(null)
    const [inputPassword, setInputPassword] = useState({
        password: '',
        confirmPassword: ''
    })
    const [errMsg, setErrMsg] = useState({})
    const [loadingSubmit, setLoadingSubmit] = useState(false)

    const router = useRouter()
    const { token } = router.query

    const { data: dataBlackListJWTAPI, error: errBlackListJWTAPI, isLoading: loadingBlackListJWTAPI } = useSwr(endpoint.getBlackListJWT(), 'GET')
    const { data: dataAdmin, error: errDataAdmin, isLoading: loadingDataAdmin } = useSwr(endpoint.getAdmin(), 'GET')

    const propsStyleInputErrMsg = {
        styleInputErrMsg: {
            display: 'flex'
        }
    }

    const toPage = (path) => {
        router.push(path)
    }

    const getUser = (userId) => {
        if (loadingDataAdmin === false && dataAdmin?.data) {
            const res = dataAdmin.data
            const findUser = res.find(user => user.id === userId && user.isVerification === true)

            if (res.length > 0) {
                if (findUser) {
                    setUser(findUser)
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
                const findBlackList = res.find(data => data.token === token)

                if (findBlackList) {
                    toPage(`/forgot-password/create-new-password/has-been-successfully/${token}`)
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
        if (token) {
            API.APIGetJwtTokenVerif(token)
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
    }, [token, dataBlackListJWTAPI, dataAdmin])

    const handleChangeInput = (e) => {
        setInputPassword({
            ...inputPassword,
            [e.target.name]: e.target.value
        })

        setErrMsg({
            ...errMsg,
            [e.target.name]: ''
        })
    }

    const createTokenBlackList = () => {
        const dataToken = {
            id: `${new Date().getTime()}`,
            token: token
        }

        API.APIPostBlackListJWT(dataToken)
            .then(res => {
                if (res?.data) {
                    toPage(`/forgot-password/create-new-password/has-been-successfully/${token}`)
                } else {
                    alert('Oops telah terjadi kesalahan\nMohon coba beberapa saat lagi')
                    console.log(res)
                    setLoadingSubmit(false)
                }
            })
            .catch(err => {
                alert('Oops telah terjadi kesalahan server\nMohon coba beberapa saat lagi')
                console.log(err)
                setLoadingSubmit(false)
            })
    }

    const pushToUpdateUser = () => {
        const data = {
            name: user?.name,
            image: user?.image,
            password: inputPassword.password
        }

        API.APIPutAdmin(user?.id, data)
            .then(res => {
                if (res?.data) {
                    createTokenBlackList()
                } else {
                    alert('Oops telah terjadi kesalahan\nMohon coba beberapa saat lagi')
                    console.log(res)
                    setLoadingSubmit(false)
                }
            })
            .catch(err => {
                alert('Oops telah terjadi kesalahan server\nMohon coba beberapa saat lagi')
                console.log(err)
                setLoadingSubmit(false)
            })
    }

    const handleSubmit = () => {
        if (loadingSubmit === false) {
            let err = {}

            if (!inputPassword.password) {
                err.password = 'Must be required!'
            } else if (inputPassword.password.length < 8) {
                err.password = 'Must be at least 8 characters.'
            }
            if (!inputPassword.confirmPassword) {
                err.confirmPassword = 'Must be required!'
            } else if (inputPassword.confirmPassword !== inputPassword.password) {
                err.confirmPassword = 'Invalid password confirmation!'
            }

            if (Object.keys(err).length === 0 && window.confirm('Reset your password?')) {
                setLoadingSubmit(true)
                pushToUpdateUser()
            }

            setErrMsg(err)
        }
    }

    return (
        <>
            <Head>
                <title>Set New Password | Admin Hospice Medical</title>
                <meta name="description" content="Mengatur ulang kata sandi admin pada Admin Hospice Medical" />
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
                        icon="fas fa-key"
                        title="Set new password"
                        desc="Your new password must be different to previously used passwords."
                    />

                    <Input
                        {...propsStyleInputErrMsg}
                        type="password"
                        placeholder="Enter your password"
                        nameInput="password"
                        valueInput={inputPassword.password}
                        changeInput={handleChangeInput}
                        errorMessage={errMsg?.password}
                    />
                    <Input
                        {...propsStyleInputErrMsg}
                        type="password"
                        placeholder="Confirm your password"
                        nameInput="confirmPassword"
                        valueInput={inputPassword.confirmPassword}
                        changeInput={handleChangeInput}
                        errorMessage={errMsg?.confirmPassword}
                    />

                    <Button
                        name="RESET PASSWORD"
                        style={{
                            margin: "30px 0 0 0"
                        }}
                        styleLoading={{
                            display: loadingSubmit ? 'flex' : 'none'
                        }}
                        click={handleSubmit}
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

export default CreateNewPassword