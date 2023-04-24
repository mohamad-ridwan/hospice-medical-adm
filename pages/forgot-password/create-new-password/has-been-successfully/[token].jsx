import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from "next/head"
import Link from 'next/link'
import styleLogin from 'styles/Login.module.scss'
import LoadProccessForgotPw from 'components/LoadProccessForgotPw'
import HeadForgotPassword from 'components/HeadForgotPassword'
import Button from 'components/Button'
import API from 'lib/api'
import useSwr from 'lib/useFetch/useSwr'
import endpoint from 'lib/api/endpoint'

function SuccessPasswordReset() {
  const [loading, setLoading] = useState(true)

  const router = useRouter()
  const { token } = router.query

  const { data: dataBlackListJWTAPI, error: errBlackListJWTAPI, isLoading: loadingBlackListJWTAPI } = useSwr(endpoint.getBlackListJWT(), 'GET')
  const { data: dataAdmin, error: errDataAdmin, isLoading: loadingDataAdmin } = useSwr(endpoint.getAdmin(), 'GET')

  const toPage = (path) => {
    router.push(path)
  }

  const getUser = (userId, isTokenBlackList) => {
    if (loadingDataAdmin === false && dataAdmin?.data) {
      const res = dataAdmin.data
      const findUser = res.find(user => user.id === userId && user.isVerification === true)

      if (res.length > 0) {
        if (findUser && isTokenBlackList) {
          setLoading(false)
        } else if (findUser && isTokenBlackList === false) {
          toPage(`/forgot-password/success-send-email/${token}`)
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

  const checkBlackListToken = async (userId) => {
    if (loadingBlackListJWTAPI === false && dataBlackListJWTAPI?.data) {
      const res = dataBlackListJWTAPI.data

      if (res.length > 0) {
        const findBlackList = res.find(data => data.token === token)

        if (findBlackList) {
          getUser(userId, true)
        } else {
          getUser(userId, false)
        }
      } else {
        getUser(userId, false)
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

  return (
    <>
      <Head>
        <title>Success Password Reset | Admin Hospice Medical</title>
        <meta name="description" content="Berhasil reset password akun admin pada Admin Hospice Medical" />
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
            icon="fas fa-check"
            title="Password reset"
            desc="Your password has been successfully reset. Click below to log in magically."
            styleIcon={{
              color: '#47d400',
              backgroundColor: '#2cc20e30',
              border: '6px solid #7ec86f27'
            }}
          />

          <Link href="/login">
            <Button
              name="BACK TO LOG IN"
              style={{
                margin: "10px auto 0 auto",
                width: '100%'
              }}
            />
          </Link>
        </div>
      </div>
    </>
  )
}

export default SuccessPasswordReset