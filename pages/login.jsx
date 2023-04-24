import { useContext, useState } from 'react'
import {useRouter} from 'next/router'
import Cookies from 'js-cookie'
import Link from 'next/link'
import Head from 'next/head'
import styleLogin from 'styles/Login.module.scss'
import Input from 'components/Input'
import Button from 'components/Button'
import useSwr from 'lib/useFetch/useSwr'
import endpoint from 'lib/api/endpoint'
import { AuthContext } from 'lib/context/auth'

function Login() {
    const [input, setInput] = useState({
        email: '',
        password: ''
    })
    const [errMessage, setErrMessage] = useState({})
    const [loadingSubmit, setLoadingSubmit] = useState(false)

    const router = useRouter()
    const mailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

    const { data, error, isLoading } = useSwr(endpoint.getAdmin(), 'GET')

    // context
    const { user, setUser } = useContext(AuthContext)

    const changeInput = (e) => {
        setInput({
            ...input,
            [e.target.name]: e.target.value
        })

        setErrMessage({
            ...errMessage,
            [e.target.name]: ''
        })
    }

    const propsStyleInputErrMsg = {
        styleInputErrMsg: {
            display: 'flex'
        }
    }

    const login = (dataLogin) => {
        if (isLoading === false && data?.data) {
            const res = data.data
            const findAdmin = res.find(user =>
                user.email === dataLogin.email &&
                user.password === dataLogin.password &&
                user.isVerification === true
            )

            if (findAdmin?.id) {
                Cookies.set('admin-id_hm', `${findAdmin.id}`)
                setUser(findAdmin)
                setTimeout(() => {
                    router.push('/')

                    setTimeout(() => {
                        setLoadingSubmit(false)
                    }, 500)
                }, 0);
            } else {
                setErrMessage({ password: 'Unregistered account!' })
                setLoadingSubmit(false)
            }
        } else if(isLoading === false && !data?.data) {
            alert('Telah terjadi kesalahan server\nMohon coba beberapa saat lagi')
            console.log(data)
            setLoadingSubmit(false)
        }
    }

    function submitForm() {
        if (loadingSubmit === false) {
            let err = {}

            const data = {
                email: input.email,
                password: input.password
            }

            if (!input.email) {
                err.email = 'Must be required!'
            } else if (!mailRegex.test(input.email)) {
                err.email = 'Invalid email address!'
            }
            if (!input.password) {
                err.password = 'Must be required!'
            }

            if (Object.keys(err).length === 0) {
                setLoadingSubmit(true)
                login(data)
            }else{
                setErrMessage(err)
            }
        }
    }

    return (
        <>
            <Head>
                <title>Login | Admin Hospice Medical</title>
                <meta name="description" content="login admin Hospice Medical" />
            </Head>

            <div className={styleLogin['wrapp']}>
                <div className={styleLogin['container-white']}>
                    <p className={styleLogin['title-login']}>
                        Login
                    </p>

                    <Input
                        {...propsStyleInputErrMsg}
                        type="email"
                        placeholder="Enter email address"
                        nameInput="email"
                        valueInput={input.email}
                        changeInput={changeInput}
                        errorMessage={errMessage?.email}
                    />
                    <Input
                        {...propsStyleInputErrMsg}
                        type="password"
                        placeholder="Enter your password"
                        nameInput="password"
                        valueInput={input.password}
                        changeInput={changeInput}
                        errorMessage={errMessage?.password}
                    />

                    <div className={styleLogin['forgot-password']}>
                        <Link className={styleLogin['btn-forgot-password']} href='/forgot-password'>
                            Forgot the password?
                        </Link>
                    </div>

                    <Button
                        name="LOGIN"
                        styleLoading={{
                            display: loadingSubmit ? 'flex' : 'none'
                        }}
                        style={{
                            margin: "30px 0 0 0"
                        }}
                        click={submitForm}
                    />

                    <div className={styleLogin['column-already-account']}>
                        <p className={styleLogin['or-login-with']} style={{
                            margin: '0'
                        }}>
                            {`Don't`} have an account yet?
                        </p>

                        <Link href='/register' className={styleLogin['or-login-with']} style={{
                            margin: '0 0 0 5px',
                            color: '#3face4',
                            cursor: 'pointer'
                        }}>
                            Signup now
                        </Link>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Login