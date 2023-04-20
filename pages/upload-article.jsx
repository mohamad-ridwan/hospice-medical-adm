import { useState, useEffect } from 'react'
import Error from 'next/error'
import Image from 'next/image'
import Head from 'next/head'
import { ref, uploadBytes } from 'firebase/storage'
import { v4 } from 'uuid'
import Loading from 'components/Loading'
import styles from 'styles/Home.module.scss'
import styleUpload from 'styles/UploadArticle.module.scss'
import Guide from 'components/Guide/Guide'
import ButtonGuide from 'components/Guide/ButtonGuide'
import ContainerInputUpload from 'components/ContainerUpload'
import SelectCategory from 'components/SelectCategory'
import endpoint from 'lib/api/endpoint'
import InputUpload from 'components/InputUpload'
import Button from 'components/Button'
import { symbolicGenerate } from 'lib/symbolicGenerate/symbolicGenerate'
import { firebaseAPI } from 'lib/firebase/firebaseAPI'
import { storage } from 'lib/firebase/firebase'
import useSwr from 'lib/useFetch/useSwr'
import API from 'lib/api'
import { backendUrl } from 'lib/api/backendUrl'

function UploadArticle({
  errorCode,
  propsBlogData,
  propsDataBlogCategory,
  categoryInputBlog,
  propsCtgForRecentBlogs,
  propsChooseCtgForRecentBlogs,
  propsChooseCtg
}) {
  const [onLoading, setOnLoading] = useState(false)
  const [dataBlogCategory, setDataBlogCategory] = useState(propsDataBlogCategory)
  const [categoryForRecentBlogs, setCategoryForRecentBlogs] = useState(propsCtgForRecentBlogs)
  const [onGuide, setOnGuide] = useState(false)
  const [chooseCategory, setChooseCategory] = useState(propsChooseCtg)
  const [chooseCategoryForRecentBlogs, setChooseCategoryForRecentBlogs] = useState(propsChooseCtgForRecentBlogs)
  // paragraph highlight akan 'null' jika ga di isi
  const [inputBlog, setInputBlog] = useState({
    id: '',
    title: '',
    paragraphSatu: '',
    paragraphBeforeHighlight: '',
    paragraphHighlight: '',
    paragraphDua: '',
    category: categoryInputBlog,
  })
  // img konten utama
  const [firstImgForFirebase, setFirstImgForFirebase] = useState(null)
  const [imgDetailContentForFirebase, setImgDetailContentForFirebase] = useState(null)
  const [newFirstImg, setNewFirstImg] = useState(null)
  const [imageDetailContent, setImageDetailContent] = useState('')
  const [newImageDetailContent, setNewImageDetailContent] = useState(null)

  // const { data, error, isLoading } = useSwr(endpoint.getBlog(), 'GET')

  // const getIdBlogData = () => {
  //   setOnLoading(true)

  //   if (error) {
  //     alert('oops telah terjadi kesalahan server!')
  //     setOnLoading(false)
  //     console.log(error)
  //   }

  //   if (data?.data) {
  //     const result = data.data
  //     const getId = result.map(blog => ({ id: blog.id, title: blog.id === 'popular-posts' ? 'Popular Posts' : blog.title }))
  //     setDataBlogCategory(getId)
  //     const categoryForRecentBlogs = result.filter(blog => blog.id !== 'our-recent-blogs' && blog.id !== 'popular-posts')
  //     const newCategoryForRB = categoryForRecentBlogs.map(blog => ({ id: blog.id, title: blog.title }))
  //     const get_IdCategoryForRB = categoryForRecentBlogs.map(blog => ({ _id: blog._id }))
  //     setInputBlog({
  //       ...inputBlog,
  //       category: newCategoryForRB[0].title
  //     })
  //     setCategoryForRecentBlogs(newCategoryForRB)
  //     setChooseCategoryForRecentBlogs(get_IdCategoryForRB[0]._id)
  //     setChooseCategory(result[0])

  //     setTimeout(() => {
  //       setOnLoading(false)
  //     }, 500);
  //   }
  // }

  // useEffect(() => {
  //   getIdBlogData()
  // }, [data])

  if(errorCode !== false){
    return <Error statusCode={errorCode}/>
  }

  const stopLoadingAfterSubmit = () => {
    setTimeout(() => {
      setOnLoading(false)
    }, 100);
  }

  const handleCategory = () => {
    setOnLoading(true)
    const selectEl = document.getElementById('selectCategory')
    const id = selectEl.options[selectEl.selectedIndex].value

    // if (error) {
    //   alert('oops telah terjadi kesalahan server!')
    //   console.log(error)
    //   stopLoadingAfterSubmit()
    // }

    if (propsBlogData?.data) {
      const result = propsBlogData.data
      const findBlog = result.find(blog => blog.id === id)
      const categoryForRB = result.filter(blog => blog.id !== 'our-recent-blogs')
      setChooseCategoryForRecentBlogs(findBlog.id === 'our-recent-blogs' ? categoryForRB[0]._id : findBlog.id === 'popular-posts' ? '' : findBlog._id)
      setChooseCategory(findBlog)
      setInputBlog({
        ...inputBlog,
        category: id !== 'our-recent-blogs' && id !== 'popular-posts' ? findBlog.title : id === 'popular-posts' ? 'Popular Posts' : categoryForRB[0].title
      })
      stopLoadingAfterSubmit()
    } else {
      alert('oops telah terjadi kesalahan server!')
      console.log(propsBlogData)
      stopLoadingAfterSubmit()
    }
  }

  const handleCategoryForRecentBlogs = () => {
    setOnLoading(true)
    const selectEl = document.getElementById('selectCtgForRecentBlogs')
    const id = selectEl.options[selectEl.selectedIndex].value

    // if (error) {
    //   alert('oops telah terjadi kesalahan server!')
    //   console.log(error)
    //   stopLoadingAfterSubmit()
    // }

    if (propsBlogData?.data) {
      const result = propsBlogData.data
      const findBlog = result.find(blog => blog.id === id)
      setChooseCategoryForRecentBlogs(findBlog._id)
      setInputBlog({
        ...inputBlog,
        category: findBlog.title
      })
      stopLoadingAfterSubmit()
    } else {
      alert('oops telah terjadi kesalahan server!')
      console.log(propsBlogData)
      stopLoadingAfterSubmit()
    }
  }

  const clickGuide = (v) => {
    setOnGuide(v)
  }

  const handleChangeInput = (e) => {
    const checkAnySymbol = (symbol) => {
      return e.target.value.includes(symbol)
    }
    const changeSymbolToHtml = (symbol, element) => {
      return e.target.value.replace(symbol, element)
    }

    const { huruf, enter, createList } = symbolicGenerate

    const generateHtml = () => {
      switch (true) {
        // huruf
        // bold
        case checkAnySymbol(huruf.bold.bold):
          return changeSymbolToHtml(huruf.bold.bold, huruf.bold.boldResult);
        // slash
        case checkAnySymbol(huruf.slash.slash):
          return changeSymbolToHtml(huruf.slash.slash, huruf.slash.slashResult);
        // bold slash
        case checkAnySymbol(huruf.boldSlash.boldSlash):
          return changeSymbolToHtml(huruf.boldSlash.boldSlash, huruf.boldSlash.boldSlashResult);
        // underline
        case checkAnySymbol(huruf.underline.underline):
          return changeSymbolToHtml(huruf.underline.underline, huruf.underline.underlineResult);
        // slash underline
        case checkAnySymbol(huruf.slashUnderline.slashUnderline):
          return changeSymbolToHtml(huruf.slashUnderline.slashUnderline, huruf.slashUnderline.slashUnderlineResult);
        // bold slash underline
        case checkAnySymbol(huruf.boldSlashUnderline.boldSlashUnderline):
          return changeSymbolToHtml(huruf.boldSlashUnderline.boldSlashUnderline, huruf.boldSlashUnderline.boldSlashUnderlineResult);
        // jarak enter
        // space1
        case checkAnySymbol(enter.enter1.space1):
          return changeSymbolToHtml(enter.enter1.space1, enter.enter1.space1Result);
        // space2
        case checkAnySymbol(enter.enter2.space2):
          return changeSymbolToHtml(enter.enter2.space2, enter.enter2.space2Result);
        // space3
        case checkAnySymbol(enter.enter3.space3):
          return changeSymbolToHtml(enter.enter3.space3, enter.enter3.space3Result3);
        // list
        // list default
        case checkAnySymbol(createList.container.wrappList):
          return changeSymbolToHtml(createList.container.wrappList, createList.container.wrappListResult);
        // child list (default)
        case checkAnySymbol(createList.container.childList.childList):
          return changeSymbolToHtml(createList.container.childList.childList, createList.container.childList.childListResult);
        default:
          return e.target.value;
      }
    }

    if (e.target.name === 'title' && generateHtml().includes('<br/>')) {
      alert('Unable to space title!')
      if (inputBlog.title.includes('&=')) {
        setInputBlog({
          ...inputBlog,
          title: inputBlog.title.replace('&=', '')
        })
      }
    } else {
      setInputBlog({
        ...inputBlog,
        [e.target.name]: generateHtml()
      })
    }
  }

  const handleEnterSpace = (e, nameInput) => {
    const inputEl = document?.getElementById(`${nameInput}InputTxt`)
    const enterPlacePosition = e.target.selectionStart - 1

    if (e?.keyCode === 13) {
      if (nameInput === 'title' && inputEl) {
        const joinedSpace = inputBlog[nameInput].slice(0, e.target.selectionStart - 1)
        const combineText = `${joinedSpace}${inputBlog[nameInput].slice(e.target.selectionStart)}`

        setInputBlog({
          ...inputBlog,
          [nameInput]: combineText
        })
        alert('Unable to space title!')

        setTimeout(() => {
          inputEl.selectionStart = inputEl.selectionEnd = enterPlacePosition;
          inputEl.focus()
        }, 0)
      } else {
        const joinedSpace = `${inputBlog[nameInput].slice(0, e.target.selectionStart - 1)}${symbolicGenerate.enter.enter1.space1Result}`
        const combineText = `${joinedSpace}${inputBlog[nameInput].slice(e.target.selectionStart)}`

        setInputBlog({
          ...inputBlog,
          [nameInput]: combineText
        })

        if (inputEl) {
          setTimeout(() => {
            inputEl.selectionStart = inputEl.selectionEnd = enterPlacePosition + 5;
            inputEl.focus()
          }, 0)
        }
      }
    }
  }

  const handleChangeImg = (e, nameInput) => {
    if (e?.target?.files?.length === 1) {
      // push img to firebase first
      setOnLoading(true)
      uploadImgToFirebaseStorage(e.target.files[0])
        .then(res => {
          if (res?.tokensImg) {
            const tokenImg = res.tokensImg
            const nameImg = res.nameImg

            const urlImg = `${firebaseAPI}${nameImg}?alt=media&token=${tokenImg}`

            const classNameImg = 'img-body-content'
            const generateImgHtml = `<br/><img alt="" src="${urlImg}" class="${classNameImg}"/><br/>`
            setInputBlog({
              ...inputBlog,
              [nameInput]: `${inputBlog[nameInput]} ${generateImgHtml}`
            })
            setTimeout(() => {
              setOnLoading(false)
            }, 100)
          }
        })
        .catch(err => {
          alert(err.message)
          console.log(err)
          setTimeout(() => {
            setOnLoading(false)
          }, 100)
        })
    }
  }

  const validateForm = async () => {
    let err = {}

    const { title, paragraphSatu, paragraphBeforeHighlight } = inputBlog

    if (firstImgForFirebase === null) {
      err.image = 'must be required'
    }
    if (!title.trim()) {
      err.title = 'must be required'
    }
    if (!paragraphSatu.trim()) {
      err.paragraphSatu = 'must be required'
    }
    if (!paragraphBeforeHighlight.trim()) {
      err.paragraphBeforeHighlight = 'must be required'
    }

    return await new Promise((resolve, reject) => {
      if (Object.keys(err).length === 0) {
        resolve({ message: 'success' })
      } else {
        reject({ message: 'Oopss!, Please complete the data!' })
      }
    })
  }

  const handleSubmit = () => {
    validateForm()
      .then(res => {
        if (window.confirm('uploaded this article?')) {
          setOnLoading(true)
          postData()
        }
      })
      .catch(err => alert(err.message))
  }

  const pushToBlogCategory = async (_id, dataPost) => {
    return await new Promise((resolve, reject) => {
      API.APIPostBlog(_id, dataPost)
        .then(res => {
          if (res?.data) {
            resolve(res)
          } else {
            reject(res)
          }
        })
        .catch(err => reject(err))
    })
  }

  const postData = () => {
    const { title, paragraphSatu, paragraphBeforeHighlight, paragraphHighlight, paragraphDua, category } = inputBlog

    // clock
    const hours = new Date().getHours().toString().length === 1 ? `0${new Date().getHours()}` : new Date().getHours()
    const minute = new Date().getMinutes().toString().length === 1 ? `0${new Date().getMinutes()}` : new Date().getMinutes()

    // date
    const nameMonth = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    const dateNumber = new Date().getDate().toString().length === 1 ? `0${new Date().getDate()}` : new Date().getDate()
    const mount = new Date().getMonth()
    const years = new Date().getFullYear()

    const id = `${new Date().getTime()}`

    const data = {
      id: id,
      image: '',
      title,
      paragraphSatu,
      paragraphBeforeHighlight,
      paragraphHighlight: paragraphHighlight.length > 5 ? paragraphHighlight : 'null',
      paragraphDua: paragraphDua.length > 5 ? paragraphDua : 'null',
      category,
      date: `${dateNumber} ${nameMonth[mount]}, ${years}`,
      clock: `${hours}:${minute}`
    }

    const dataImgDetailContent = {
      image: ''
    }

    if (chooseCategory.id === 'our-recent-blogs') {
      // push img to firebase first
      uploadImgToFirebaseStorage(firstImgForFirebase)
        .then(res => {
          if (res?.tokensImg) {
            const tokenImg = res.tokensImg
            const nameImg = res.nameImg

            data.image = `${firebaseAPI}${nameImg}?alt=media&token=${tokenImg}`

            // push to our recent blogs first
            pushToBlogCategory(chooseCategory._id, data)
              .then(res => {
                // push to other category in the same category
                pushToBlogCategory(chooseCategoryForRecentBlogs, data)
                  .then(res => {
                    // push img detail content if available
                    if (imageDetailContent.length > 0) {
                      // push img to firebase first
                      uploadImgToFirebaseStorage(imgDetailContentForFirebase)
                        .then(res => {
                          if (res?.tokensImg) {
                            const tokenImg = res.tokensImg
                            const nameImg = res.nameImg

                            dataImgDetailContent.image = `${firebaseAPI}${nameImg}?alt=media&token=${tokenImg}`

                            postImgDetailContent(chooseCategory._id, id, dataImgDetailContent)
                              .then(res => {
                                postImgDetailContent(chooseCategoryForRecentBlogs, id, dataImgDetailContent)
                                  .then(res => {
                                    alert('blog upload has been successful')
                                    setTimeout(() => {
                                      window.location.reload()
                                    }, 100);
                                  })
                                  .catch(err => {
                                    alert('oops!, telah terjadi kesalahan server!')
                                    console.log(err)
                                  })
                              })
                              .catch(err => {
                                alert('oops!, telah terjadi kesalahan server!')
                                console.log(err)
                                stopLoadingAfterSubmit()
                              })
                          } else {
                            alert('oops!, telah terjadi kesalahan dari firebase!')
                            console.log(res)
                            stopLoadingAfterSubmit()
                          }
                        })
                        .catch(err => {
                          alert(err.message)
                          console.log(err)
                          stopLoadingAfterSubmit()
                        })
                    } else {
                      alert('blog upload has been successful')
                      setTimeout(() => {
                        window.location.reload()
                      }, 100);
                    }
                  })
                  .catch(err => {
                    alert('oops!, telah terjadi kesalahan server!')
                    console.log(err)
                    stopLoadingAfterSubmit()
                  })
              })
              .catch(err => {
                alert('oops!, telah terjadi kesalahan server!')
                console.log(err)
                stopLoadingAfterSubmit()
              })
          } else {
            alert('oops!, telah terjadi kesalahan dari firebase!')
            console.log(res)
            stopLoadingAfterSubmit()
          }
        })
        .catch(err => {
          alert(err.message)
          console.log(err)
          stopLoadingAfterSubmit()
        })
    } else {
      uploadImgToFirebaseStorage(firstImgForFirebase)
        .then(res => {
          if (res?.tokensImg) {
            const tokenImg = res.tokensImg
            const nameImg = res.nameImg

            data.image = `${firebaseAPI}${nameImg}?alt=media&token=${tokenImg}`

            pushToBlogCategory(chooseCategory._id, data)
              .then(res => {
                if (imageDetailContent.length > 0) {
                  uploadImgToFirebaseStorage(imgDetailContentForFirebase)
                    .then(res => {
                      if (res?.tokensImg) {
                        const tokenImg = res.tokensImg
                        const nameImg = res.nameImg

                        dataImgDetailContent.image = `${firebaseAPI}${nameImg}?alt=media&token=${tokenImg}`

                        postImgDetailContent(chooseCategory._id, id, dataImgDetailContent)
                          .then(res => {
                            alert('blog upload has been successful')
                            setTimeout(() => {
                              window.location.reload()
                            }, 100);
                          })
                          .catch(err => {
                            alert('oops!, telah terjadi kesalahan server!')
                            console.log(err)
                            stopLoadingAfterSubmit()
                          })
                      } else {
                        alert('oops!, telah terjadi kesalahan dari firebase!')
                        console.log(res)
                        stopLoadingAfterSubmit()
                      }
                    })
                    .catch(err => {
                      alert(err.message)
                      console.log(err)
                      stopLoadingAfterSubmit()
                    })
                } else {
                  alert('blog upload has been successful')
                  setTimeout(() => {
                    window.location.reload()
                  }, 100);
                }
              })
              .catch(err => {
                alert('oops!, telah terjadi kesalahan server!')
                console.log(err)
                stopLoadingAfterSubmit()
              })
          } else {
            alert('oops!, telah terjadi kesalahan dari firebase!')
            console.log(res)
            stopLoadingAfterSubmit()
          }
        })
        .catch(err => {
          alert(err.message)
          console.log(err)
          stopLoadingAfterSubmit()
        })
    }
  }

  const postImgDetailContent = async (_id, id, dataPost) => {
    return await new Promise((resolve, reject) => {
      API.APIPostImgDetailContent(_id, id, dataPost)
        .then(res => {
          if (res?.data) {
            resolve(res)
          } else {
            reject(res)
          }
        })
        .catch(err => reject(err))
    })
  }

  async function uploadImgToFirebaseStorage(files) {
    return await new Promise((resolve, reject) => {
      const imageRef = ref(storage, `blog/${files?.name + v4()}`)
      uploadBytes(imageRef, files).then((res) => {
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
      fetch(`${firebaseAPI}${nameImg}`, {
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

  const handleFixImage = (e, imgFor) => {
    if (e?.target?.files?.length === 1) {
      const createUrl = window.URL.createObjectURL(e.target.files[0])
      if (imgFor === 'image') {
        setNewFirstImg(createUrl)
        setFirstImgForFirebase(e.target.files[0])
      } else {
        setImageDetailContent(e.target.files[0].name)
        setNewImageDetailContent(createUrl)
        setImgDetailContentForFirebase(e.target.files[0])
      }
    }
  }

  const handleCancelImgDetailContent = () => {
    setImageDetailContent('')
    setImgDetailContentForFirebase(null)
    setNewImageDetailContent(null)
    document.getElementById('inputFileImageDetailContent').value = null
  }

  return (
    <>
      <Head>
        <title>Upload Article | Admin Hospice Medical</title>
        <meta name="description" content="tampilan beranda admin hospice medical" />
      </Head>

      <Loading
        style={{
          display: onLoading ? 'flex' : 'none'
        }}
      />

      <Guide
        style={{
          display: onGuide ? 'flex' : 'none'
        }}
        closeGuide={() => clickGuide(false)}
      />

      <ButtonGuide
        click={() => clickGuide(true)}
      />

      <div className={styleUpload['wrapp-upload-blog']}>
        <ContainerInputUpload style={{
          flexDirection: 'column'
        }}>
          <h1 className={styleUpload['title']}>
            Upload Article
          </h1>
          <SelectCategory
            idSelect="selectCategory"
            titleCtg="Category Article Id"
            handleCategory={handleCategory}
            dataBlogCategory={dataBlogCategory}
          />
          {chooseCategory?.id === 'our-recent-blogs' && (
            <SelectCategory
              idSelect="selectCtgForRecentBlogs"
              titleCtg="Category for the latest news"
              handleCategory={handleCategoryForRecentBlogs}
              dataBlogCategory={categoryForRecentBlogs}
            />
          )}
        </ContainerInputUpload>

        <ContainerInputUpload>
          <div className={styleUpload['wrapp-cont-first-image']}>
            <div className={styleUpload['container-first-image']}>
              {newFirstImg ? (
                <Image
                  src={newFirstImg}
                  className={styleUpload['first-image']}
                  width={300}
                  height={300}
                />
              ) : (
                <p>No image</p>
              )}
            </div>
            <InputUpload
              label='image'
              title='image'
              idInput="inputFirstImg"
              handleChangeImg={(e) => handleFixImage(e, 'image')}
              styleTextArea={{
                display: 'none',
              }}
              styleWrapp={{
                maxWidth: 'auto',
                borderBottom: 'none'
              }}
              styleParagraph={{
                backgroundColor: 'transparent'
              }}
            />
          </div>

          <InputUpload
            label='title'
            title='Title'
            value={inputBlog.title}
            rows={5}
            cols={8}
            handleChange={handleChangeInput}
            handleEnterSpace={(e) => handleEnterSpace(e, 'title')}
            styleInputImg={{
              display: 'none'
            }}
            styleParagraph={{
              backgroundColor: !inputBlog.title.trim() ? 'transparent' : '#f1f1f1'
            }}
          />
        </ContainerInputUpload>

        <ContainerInputUpload>
          <InputUpload
            label='paragraphSatu'
            title='paragraph satu'
            value={inputBlog.paragraphSatu}
            rows={9}
            cols={8}
            handleChange={handleChangeInput}
            nameInputImg='paragraphSatu'
            handleEnterSpace={(e) => handleEnterSpace(e, 'paragraphSatu')}
            styleInputImg={{
              display: 'none'
            }}
            styleParagraph={{
              backgroundColor: !inputBlog.paragraphSatu.trim() ? 'transparent' : '#f1f1f1'
            }}
          />
          <InputUpload
            label='paragraphBeforeHighlight'
            title='paragraph before highlight'
            value={inputBlog.paragraphBeforeHighlight}
            rows={9}
            cols={8}
            handleChangeImg={(e) => handleChangeImg(e, 'paragraphBeforeHighlight')}
            handleChange={handleChangeInput}
            handleEnterSpace={(e) => handleEnterSpace(e, 'paragraphBeforeHighlight')}
            styleParagraph={{
              backgroundColor: !inputBlog.paragraphBeforeHighlight.trim() ? 'transparent' : '#f1f1f1'
            }}
          />
        </ContainerInputUpload>

        <ContainerInputUpload>
          <InputUpload
            label='paragraphHighlight'
            title='paragraph highlight (Opsional)'
            value={inputBlog.paragraphHighlight}
            rows={9}
            cols={8}
            handleChangeImg={(e) => handleChangeImg(e, 'paragraphHighlight')}
            handleChange={handleChangeInput}
            handleEnterSpace={(e) => handleEnterSpace(e, 'paragraphHighlight')}
            styleParagraph={{
              backgroundColor: !inputBlog.paragraphHighlight.trim() ? 'transparent' : '#f1f1f1'
            }}
          />
          <div className={styleUpload['wrapp-input-img-detail-content']}>
            <div className={`${styleUpload['container-first-image']} ${styleUpload['container-img-detail']}`}>
              {newImageDetailContent ? (
                <Image
                  src={newImageDetailContent}
                  className={styleUpload['first-image']}
                  width={300}
                  height={300}
                />
              ) : (
                <p>No image</p>
              )}
            </div>
            <Button
              name="Cancel"
              classBtn="cancel-img-detail-content"
              click={handleCancelImgDetailContent}
              style={{
                display: newImageDetailContent !== null ? 'flex' : 'none',
                marginTop: '0px',
                width: '60px',
                padding: '7px 0px',
                fontSize: '12px'
              }}
            />

            <InputUpload
              label='imageDetailContent'
              title='image detail content (Opsional)'
              handleChangeImg={(e) => handleFixImage(e, 'imageDetailContent')}
              idInput='inputFileImageDetailContent'
              styleTextArea={{
                display: 'none'
              }}
              styleWrapp={{
                width: 'auto',
                maxWidth: 'auto',
                borderBottom: 'none'
              }}
              styleParagraph={{
                backgroundColor: 'transparent'
              }}
            />
          </div>
        </ContainerInputUpload>

        <ContainerInputUpload>
          <InputUpload
            label='paragraphDua'
            title='paragraph Dua (Opsional)'
            value={inputBlog.paragraphDua}
            rows={9}
            cols={8}
            handleChangeImg={(e) => handleChangeImg(e, 'paragraphDua')}
            handleChange={handleChangeInput}
            handleEnterSpace={(e) => handleEnterSpace(e, 'paragraphDua')}
            styleParagraph={{
              backgroundColor: !inputBlog.paragraphDua.trim() ? 'transparent' : '#f1f1f1'
            }}
          />
        </ContainerInputUpload>

        <ContainerInputUpload>
          <Button
            name="Submit"
            click={handleSubmit}
            style={{
              marginTop: '40px',
              width: '200px',
              padding: '12px 0px',
              margin: '60px auto'
            }}
          />
        </ContainerInputUpload>
      </div>
    </>
  )
}

export default UploadArticle

export async function getStaticProps() {
  const fetchBlog = await fetch(`${backendUrl}/${endpoint.getBlog()}`)

  const result = await fetchBlog?.json()
  const errorCode = await result?.data ? false : 500
  const data = await result?.data
  const getId = await data?.map(blog => ({ id: blog.id, title: blog.id === 'popular-posts' ? 'Popular Posts' : blog.title }))

  const categoryForRecentBlogs = await data?.filter(blog => blog.id !== 'our-recent-blogs' && blog.id !== 'popular-posts')
  const newCategoryForRB = await categoryForRecentBlogs?.map(blog => ({ id: blog.id, title: blog.title }))
  const get_IdCategoryForRB = await categoryForRecentBlogs?.map(blog => ({ _id: blog._id }))

  return {
    props: {
      errorCode,
      propsBlogData: result,
      propsDataBlogCategory: getId,
      categoryInputBlog: newCategoryForRB[0]?.title,
      propsCtgForRecentBlogs: newCategoryForRB,
      propsChooseCtgForRecentBlogs: get_IdCategoryForRB[0]?._id,
      propsChooseCtg: data[0]
    },
    revalidate: 10
  }
}