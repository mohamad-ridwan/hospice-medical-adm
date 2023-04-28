import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import emailjs from '@emailjs/browser'
import Link from 'next/link'
import Head from "next/head"
import styleLogin from 'styles/Login.module.scss'
import HeadForgotPassword from "components/HeadForgotPassword"
import Input from "components/Input"
import Button from 'components/Button'
import useSwr from 'lib/useFetch/useSwr'
import endpoint from 'lib/api/endpoint'
import API from 'lib/api'

function ForgotPassword() {
  const [urlOrigin, setUrlOrigin] = useState(null)
  const [inputEmail, setInputEmail] = useState('')
  const [errMsg, setErrMsg] = useState(null)
  const [loadingSubmit, setLoadingSubmit] = useState(false)

  const router = useRouter()
  const { data, error, isLoading } = useSwr(endpoint.getAdmin(), 'GET')

  const mailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

  useEffect(()=>{
    const url = window?.location?.origin
    setUrlOrigin(url)
  }, [])

  const handleChangeInput = (e) => {
    setInputEmail(e.target.value)
    setErrMsg(null)
  }

  const checkEmailUser = async () => {
    return await new Promise((resolve, reject) => {
      if (isLoading === false && data?.data) {
        const res = data.data
        const findAdmin = res.length > 0 ? res.filter(admin =>
          admin.email === inputEmail && admin.isVerification === true
        ) : null

        resolve(findAdmin)
      } else if (isLoading === false && !data?.data) {
        reject(data)
      }
    })
  }

  const createJwtToken = async (userId) => {
    try {
      const getToken = API.APIPostCreateJwtToken(userId)
      const result = await getToken.then(res => res)
      return result
    } catch (err) {
      return err
    }
  }

  const sendToEmailUser = (token, email) => {
    const serviceId = process.env.NEXT_PUBLIC_SERVICE_ID_ADM
    const templateId = process.env.NEXT_PUBLIC_TEMPLATE_ID_ADM
    const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY_ADM

    const dataSend = {
      to_email: email,
      url: `${urlOrigin}/forgot-password/create-new-password/${token}`
    }

    emailjs.send(serviceId, templateId, dataSend, publicKey)
      .then(res => {
        router.push(`/forgot-password/success-send-email/${token}`)
      }, (err) => {
        alert('Oops telah terjadi kesalahan proses pengiriman email!')
        console.log(err)
        setLoadingSubmit(false)
      })
  }

  const pushSendToEmailUser = () => {
    checkEmailUser()
      .then(res => {
        if (res === null) {
          alert('Unregistered account!')
          setLoadingSubmit(false)
        } else if (res?.length > 0) {
          const { id, email } = res[0]
          createJwtToken(id)
            .then(res => {
              if (res?.error === null) {
                sendToEmailUser(res.token, email)
              } else if (res?.error !== null) {
                alert(res.error)
                setLoadingSubmit(false)
                console.log(res)
              }
            })
            .catch(err => {
              alert('Oops telah terjadi kesalahan server\nMohon coba beberapa saat lagi')
              console.log(err)
              setLoadingSubmit(false)
            })
        } else {
          alert('Unregistered account!')
          setLoadingSubmit(false)
        }
      })
      .catch(err => {
        alert('Oops telah terjadi kesalahan server\nMohon coba beberapa saat lagi')
        console.log(err)
        setLoadingSubmit(false)
      })
  }

  const handleSubmitForm = () => {
    if (loadingSubmit === false) {
      let err = {}

      if (!inputEmail) {
        err.email = 'Must be required!'
      } else if (!mailRegex.test(inputEmail)) {
        err.email = 'Invalid email address!'
      }

      if (!err?.email) {
        setLoadingSubmit(true)
        pushSendToEmailUser()
      } else {
        setErrMsg(err)
      }
    }
  }

  const propsStyleInputErrMsg = {
    styleInputErrMsg: {
      display: 'flex'
    }
  }

  return (
    <>
      <Head>
        <title>Forgot Password | Admin Hospice Medical</title>
        <meta name="description" content="lupa password pada akun admin hospice medical" />
      </Head>

      <div className={styleLogin['wrapp']}>
        <div className={styleLogin['container-white']}>
          <HeadForgotPassword
            icon="fas fa-key"
            title="Forgot Password?"
            desc="No worries, we'll send you reset instructions."
          />

          <Input
            {...propsStyleInputErrMsg}
            type="email"
            placeholder="Enter your email"
            nameInput="email"
            valueInput={inputEmail}
            changeInput={handleChangeInput}
            errorMessage={errMsg?.email}
          />

          <Button
            name="RESET PASSWORD"
            styleLoading={{
              display: loadingSubmit ? 'flex' : 'none'
            }}
            style={{
              margin: "30px 0 0 0"
            }}
            click={handleSubmitForm}
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

export default ForgotPassword

ForgotPassword.getLayout = function getLayout(page) {
  return (
      <>
          {page}
      </>
  )
}