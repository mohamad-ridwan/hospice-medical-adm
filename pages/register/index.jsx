import { useState, useEffect } from 'react'
import Link from 'next/link'
import Head from "next/head"
import emailjs from '@emailjs/browser'
import { ref, uploadBytes } from 'firebase/storage'
import { v4 } from 'uuid'
import styleLogin from 'styles/Login.module.scss'
import Input from "components/Input"
import Button from 'components/Button'
import { firebaseImageAPI } from 'lib/firebase/firebaseAPI'
import { storage } from 'lib/firebase/firebase'
import API from 'lib/api'

function Register() {
  const [urlOrigin, setUrlOrigin] = useState(null)
  const [input, setInput] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    image: null,
  })
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [nameImg, setNameImg] = useState('Select your image profile')
  const [errMessage, setErrMessage] = useState({})

  const mailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

  useEffect(() => {
    const urlOrigin = window.location.origin
    setUrlOrigin(urlOrigin)
  }, [])

  const propsStyleInputErrMsg = {
    styleInputErrMsg: {
      display: 'flex'
    }
  }

  function changeInput(e) {
    setInput({
      ...input,
      [e.target.name]: e.target.value
    })

    if (Object.keys(errMessage).length > 0) {
      setErrMessage({
        ...errMessage,
        [e.target.name]: ''
      })
    }
  }

  function openFile() {
    document.getElementById('input-file').click()
  }

  function changeInputFile(e) {
    if (e.target.files[0] !== undefined) {
      const getNamePhoto = e.target.files[0]
      setNameImg(getNamePhoto.name)
      setInput({
        ...input,
        image: getNamePhoto
      })

      if (errMessage && errMessage.image) {
        setErrMessage({
          ...errMessage,
          image: ''
        })
      }
    }
  }

  function postForm(data, email) {
    API.APIGetAdmin()
      .then(res => {
        const respons = res.data
        const checkUser = respons.filter(e => e.email === email && e.isVerification)
        const userIsNotVerifYet = respons.filter(e => e.email === email && e.isVerification === false)
        if (checkUser.length > 0) {
          alert('Email sudah terpakai!')
          setLoadingSubmit(false)
        } else if (userIsNotVerifYet.length === 0) {
          API.APIPostAdmin(data)
            .then(res => {
              postVerification(data)
            })
            .catch(err => {
              alert('Terjadi kesalahan server\nMohon coba beberapa saat lagi!')
              setLoadingSubmit(false)
              console.log(err)
            })
        } else {
          const dataUserUpdate = {
            name: data.name,
            image: data.image,
            password: data.password
          }

          updateUserVerif(userIsNotVerifYet[0].id, dataUserUpdate, (data) => {
            postVerification(data)
          })
        }
      })
      .catch(err => {
        alert('Terjadi kesalahan server\nMohon coba beberapa saat lagi!')
        setLoadingSubmit(false)
        console.log(err)
      })
  }

  function updateUserVerif(id, dataForUpdt, success) {
    API.APIPutAdmin(id, dataForUpdt)
      .then(res => {
        if (res?.data) {
          return success(res.data)
        } else {
          alert('Terjadi kesalahan server\nMohon coba beberapa saat lagi!')
          setLoadingSubmit(false)
          console.log(res)
        }
      })
      .catch(err => {
        alert('Terjadi kesalahan server\nMohon coba beberapa saat lagi!')
        setLoadingSubmit(false)
        console.log(err)
      })
  }

  function postVerification(data) {
    const ranCode1 = Math.floor(Math.random() * 9)
    const ranCode2 = Math.floor(Math.random() * 9)
    const ranCode3 = Math.floor(Math.random() * 9)
    const ranCode4 = Math.floor(Math.random() * 9)
    const token = `${ranCode1}${ranCode2}${ranCode3}${ranCode4}`

    const date = new Date()
    const nowHours = new Date().getHours()
    const getTimeExpired = nowHours < 23 ? nowHours + 1 : 0
    date.setHours(getTimeExpired)
    const newDate = new Date().getTime()

    checkUserTokenFirst(data, (userToken) => {
      // any user for verification
      // still not verification yet
      const dataToken = {
        token: token,
        date: `${date}`
      }

      updateVerification(dataToken, data)
    }, () => {
      // no user token is for verification
      const dataToken = {
        newDate: `${newDate}`,
        token: token,
        date: `${date}`
      }
      pushToVerification(data, dataToken)
    })
  }

  function checkUserTokenFirst(data, userAny, userEmpty) {
    API.APIGetVerification()
      .then(res => {
        const result = res?.data
        const findToken = result?.length > 0 ? result?.find(token => token.userId === data.id) : null

        if (findToken?.userId) {
          userAny(findToken)
        } else {
          userEmpty()
        }
      })
      .catch(err => {
        alert('Terjadi kesalahan server\nMohon coba beberapa saat lagi!')
        setLoadingSubmit(false)
        console.log(err)
      })
  }

  function pushToVerification(data, dataToken) {
    const { newDate, token, date } = dataToken

    const dataPost = {
      id: newDate,
      userId: data.id,
      verification: {
        token: token,
        date: date
      }
    }
    API.APIPostVerification(dataPost)
      .then(res => {
        sendCodeToEmailUser(data, token)
      })
      .catch(err => {
        alert('Terjadi kesalahan server\nMohon coba beberapa saat lagi!')
        setLoadingSubmit(false)
        console.log(err)
      })
  }

  function updateVerification(dataToken, data) {
    const { token, date } = dataToken

    const dataVerification = {
      verification: {
        token: token,
        date: date
      }
    }

    API.APIPutVerification(data.id, dataVerification)
      .then(res => {
        if (res?.data) {
          sendCodeToEmailUser(data, token)
        } else {
          alert('Terjadi kesalahan server\nMohon coba beberapa saat lagi!')
          setLoadingSubmit(false)
          console.log(res)
        }
      })
      .catch(err => {
        alert('Terjadi kesalahan server\nMohon coba beberapa saat lagi!')
        setLoadingSubmit(false)
        console.log(err)
      })
  }

  function sendCodeToEmailUser(data, code) {
    const serviceId = process.env.NEXT_PUBLIC_SERVICE_ID
    const templateId = process.env.NEXT_PUBLIC_TEMPLATE_ID
    const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY

    const dataSend = {
      url: `${urlOrigin}/register/verification/${data.id}`,
      from_name: 'Admin Hospice Medical',
      to_name: data.name,
      to_email: data.email,
      code: code,
    }
    emailjs.send(serviceId, templateId, dataSend, publicKey)
      .then(result => {
        alert('Berhasil mendaftarkan akun Anda.\nCek email Anda untuk verifikasi')

        setInput({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          image: null,
        })
        setNameImg('Select your image profile')
        setLoadingSubmit(false)

        setTimeout(() => {
          window.open(`${urlOrigin}/register/verification/${data.id}`)
        }, 100);
      }, (error) => {
        console.log(error)
      })
  }

  async function uploadImgToFirebaseStorage() {
    return await new Promise((resolve, reject) => {
      const imageRef = ref(storage, `images/${nameImg + v4()}`)
      uploadBytes(imageRef, input.image).then((res) => {
        const nameImg = res && res.metadata.name

        getAccessTokenImgUpload(nameImg)
          .then(res => resolve({ tokensImg: res, nameImg: nameImg }))
          .catch(err => reject(err))
      })
        .catch(err => reject({ message: 'Oops! terjadi kesalahan server.\nMohon coba beberapa saat lagi!', error: 'error', jenisError: 'gagal upload image ke firebase storage' }))
    })
  }

  async function getAccessTokenImgUpload(nameImg) {
    return await new Promise((resolve, reject) => {
      fetch(`${firebaseImageAPI}${nameImg}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          "Content-Type": "application/json",
        }
      })
        .then(res => res.json())
        .then(res => {
          const getAccessToken = res && res.downloadTokens
          resolve(getAccessToken)
        })
        .catch(err => reject({ message: 'Oops! terjadi kesalahan server.\nMohon coba beberapa saat lagi!', error: 'error', jenisError: 'gagal mendapatkan tokens image' }))
    })
  }

  function submitForm() {
    if (loadingSubmit === false) {
      let err = {}

      if (!input.name) {
        err.name = 'Must be required!'
      }
      if (!input.email) {
        err.email = 'Must be required!'
      } else if (!mailRegex.test(input.email)) {
        err.email = 'Invalid email address!'
      }
      if (!input.password) {
        err.password = 'Must be required!'
      }
      if (!input.confirmPassword) {
        err.confirmPassword = 'Must be required!'
      }
      if (input.image === null) {
        err.image = 'Must be required!'
      } else if (input.image !== null) {
        const getTypeFile = input.image.type.split('/')[1]

        if (getTypeFile.toLowerCase() === 'jpg' || getTypeFile.toLowerCase() === 'jpeg' || getTypeFile.toLowerCase() === 'png') {
        } else {
          err.image = 'Must be jpg/jpeg/png'
        }
      }
      if (input.password.length > 0 && input.confirmPassword.length > 0) {
        if (input.password !== input.confirmPassword) {
          err.confirmPassword = 'Invalid password confirmation!'
        }
      }

      if (Object.keys(err).length === 0) {
        if (window.confirm('Ingin mendaftarkan akun?')) {
          setLoadingSubmit(true)

          uploadImgToFirebaseStorage()
            .then((res) => {
              if (res && res.tokensImg) {
                const tokenImg = res.tokensImg
                const nameImg = res.nameImg

                const email = input.email
                const date = new Date().getTime()

                const data = {
                  id: `${date}`,
                  name: input.name,
                  email: input.email,
                  password: input.password,
                  image: `${firebaseImageAPI}${nameImg}?alt=media&token=${tokenImg}`,
                  isVerification: false
                }

                postForm(data, email)
              }
            })
            .catch(err => {
              setLoadingSubmit(false)
              alert(err.message)
              console.log(err)
            })
        }
      }
      setErrMessage(err)
    }
  }

  return (
    <>
      <Head>
        <title>Register | Admin Hospice Medical</title>
        <meta name="description" content="register akun admin Hospice Medical" />
      </Head>

      <div className={styleLogin['wrapp']}>
        <form onSubmit={(e)=>{
          e.preventDefault()
          submitForm()
        }} className={styleLogin['container-white']}>
          <p className={styleLogin['title-login']}>
            Register
          </p>

          <Input
            {...propsStyleInputErrMsg}
            type="text"
            placeholder="Enter your name"
            nameInput="name"
            valueInput={input.name}
            changeInput={changeInput}
            errorMessage={errMessage?.name}
          />
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
          <Input
            {...propsStyleInputErrMsg}
            type="password"
            placeholder="Confirm your password"
            nameInput="confirmPassword"
            valueInput={input.confirmPassword}
            changeInput={changeInput}
            errorMessage={errMessage?.confirmPassword}
          />
          <Input
            {...propsStyleInputErrMsg}
            styleInputText={{
              display: 'none'
            }}
            styleBtnInput={{
              display: 'flex',
              cursor: 'pointer',
              backgroundColor: 'transparent'
            }}
            clickInputFile={openFile}
            changeFile={changeInputFile}
            nameBtnInputFile={nameImg}
            acceptFile="image/png, image/jpg, image/jpeg"
            nameInputFile="image"
            idInputFile="input-file"
            errorMessage={errMessage?.image}
          />

          <Button
            name="REGISTER"
            style={{
              margin: "30px 0 0 0"
            }}
            styleLoading={{
              display: loadingSubmit ? 'flex' : 'none'
            }}
            click={submitForm}
          />

          <div className={styleLogin['column-already-account']}>
            <p className={styleLogin['or-login-with']} style={{
              margin: '0'
            }}>
              Already have an account?
            </p>

            <Link href='/login' className={styleLogin['or-login-with']} style={{
              margin: '0 0 0 5px',
              color: '#3face4',
              cursor: 'pointer'
            }}>
              Signin now
            </Link>
          </div>
        </form>
      </div>
    </>
  )
}

export default Register

Register.getLayout = function getLayout(page) {
  return (
      <>
          {page}
      </>
  )
}