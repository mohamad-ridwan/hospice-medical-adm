import { useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import style from 'styles/PatientRegistration.module.scss'
import { NotFoundRedirectCtx } from 'lib/context/notFoundRedirect'
import TableContainer from 'components/Table/TableContainer'
import TableBody from 'components/Table/TableBody'
import TableHead from 'components/Table/TableHead'
import TableColumns from 'components/Table/TableColumns'
import TableData from 'components/Table/TableData'
import WrappEditPR from 'components/Popup/WrappEditPR'
import Input from 'components/Input'
import Button from 'components/Button'
import useSwr from 'lib/useFetch/useSwr'
import endpoint from 'lib/api/endpoint'
import { AuthContext } from 'lib/context/auth'
import ShineLoading from 'components/ShineLoading'
import API from 'lib/api'

function PatientRegistration() {
    const [head] = useState([
        {
            name: 'Disease Type'
        },
        {
            name: 'Appointment Date'
        },
        {
            name: 'Submission Date'
        },
        {
            name: 'Patient Name'
        },
        {
            name: 'Email'
        },
        {
            name: 'Date of Birth'
        },
        {
            name: 'Phone'
        },
    ])
    const [loadTableScreen] = useState([
        {
            id: 1,
            data: [1, 2, 3, 4, 5, 6, 7]
        },
        {
            id: 2,
            data: [1, 2, 3, 4, 5, 6, 7]
        },
        {
            id: 3,
            data: [1, 2, 3, 4, 5, 6, 7]
        },
        {
            id: 4,
            data: [1, 2, 3, 4, 5, 6, 7]
        },
        {
            id: 5,
            data: [1, 2, 3, 4, 5, 6, 7]
        },
    ])
    const [loadConditionTableScreen, setLoadConditionTableScreen] = useState(true)
    const [dataColumns, setDataColumns] = useState([])
    const [onPopupEdit, setOnPopupEdit] = useState(false)
    const [idDataRegisForUpdt, setIdDataRegisForUpdt] = useState(null)
    const [errorMsgSubmit, setErrMsgSubmit] = useState({})
    const [personalDataRegis, setPersonalDataRegis] = useState(null)
    const [loadingSubmit, setLoadingSubmit] = useState(false)
    const [valueInputEdit, setValueInputEdit] = useState({
        jenisPenyakit: '',
        appointmentDate: '',
        submissionDate: '',
        patientName: '',
        emailAddress: '',
        dateOfBirth: '',
        phone: ''
    })

    const { data: dataService, error: errService, isLoading: loadService } = useSwr(endpoint.getServicingHours())
    const bookAnAppointment = dataService?.data?.find(item => item.id === 'book-an-appointment')

    // context
    const { user, loadingAuth } = useContext(AuthContext)
    const { onNavLeft } = useContext(NotFoundRedirectCtx)

    const router = useRouter()

    const mailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

    const changeTableStyle = (dataColumnsBody) => {
        if (dataColumnsBody?.length > 0) {
            let elementTDataLoad = document.getElementById('tDataLoad00')
            let elementTHead = document.getElementById('tHead0')
            let elementTData = document.getElementById('tData00')
            if (elementTDataLoad) {
                for (let i = 0; i < loadTableScreen?.length; i++) {
                    elementTDataLoad = document.getElementById(`tDataLoad${i}0`)
                    elementTDataLoad.style.width = 'calc(100%/7)'
                    elementTDataLoad = document.getElementById(`tDataLoad${i}1`)
                    elementTDataLoad.style.width = 'calc(100%/8)'
                    elementTDataLoad = document.getElementById(`tDataLoad${i}3`)
                    elementTDataLoad.style.width = 'calc(100%/5)'
                    elementTDataLoad = document.getElementById(`tDataLoad${i}5`)
                    elementTDataLoad.style.width = 'calc(100%/8)'
                }
            }
            if (elementTHead) {
                elementTHead = document.getElementById(`tHead0`)
                elementTHead.style.width = 'calc(100%/7)'
                elementTHead = document.getElementById(`tHead1`)
                elementTHead.style.width = 'calc(100%/8)'
                elementTHead = document.getElementById(`tHead2`)
                elementTHead.style.width = 'calc(100%/8)'
                elementTHead = document.getElementById(`tHead5`)
                elementTHead.style.width = 'calc(100%/10)'
            }
            if (elementTData) {
                for (let i = 0; i < dataColumnsBody?.length; i++) {
                    elementTData = document.getElementById(`tData${i}0`)
                    elementTData.style.width = 'calc(100%/7)'
                    elementTData = document.getElementById(`tData${i}1`)
                    elementTData.style.width = 'calc(100%/8)'
                    elementTData = document.getElementById(`tData${i}2`)
                    elementTData.style.width = 'calc(100%/8)'
                    elementTData = document.getElementById(`tData${i}5`)
                    elementTData.style.width = 'calc(100%/10)'
                }
            }
        }
    }

    const findDataRegistration = () => {
        if (bookAnAppointment) {
            const userAppointmentData = bookAnAppointment.userAppointmentData
            const findRegistration = userAppointmentData?.length > 0 ? userAppointmentData.filter(regis => !regis.isConfirm?.id) : null
            if (findRegistration) {
                const newData = []
                const getDataColumns = () => {
                    findRegistration.forEach(item => {
                        const dataRegis = {
                            id: item.id,
                            isNotif: item.isNotif,
                            data: [
                                {
                                    name: item.jenisPenyakit
                                },
                                {
                                    name: item.appointmentDate
                                },
                                {
                                    name: item.submissionDate
                                },
                                {
                                    name: item.patientName
                                },
                                {
                                    name: item.emailAddress
                                },
                                {
                                    name: item.dateOfBirth
                                },
                                {
                                    name: item.phone
                                },
                            ]
                        }
                        newData.push(dataRegis)
                    })
                }

                getDataColumns()
                if(newData.length === findRegistration?.length){
                    setDataColumns(newData)
                    setTimeout(() => {
                        setLoadConditionTableScreen(false)
                        setTimeout(() => {
                            changeTableStyle(newData)
                        }, 100);
                    }, 1500)
                }
            }else{
                setLoadConditionTableScreen(false)
            }
        }
    }

    useEffect(() => {
        if (!loadService && dataService) {
            findDataRegistration()
        } else if (loadService) {
            console.log('loading data patient registration')
        } else if (!loadService && errService) {
            console.log('no data service available')
            console.log(errService)
        }
    }, [dataService])

    const propsInputEdit = {
        styleTitle: {
            display: 'flex'
        },
        styleInputText: {
            marginBottom: '5px'
        }
    }

    const handleChangeEditPR = (e) => {
        setValueInputEdit({
            ...valueInputEdit,
            [e.target.name]: e.target.value
        })

        if (Object.keys(errorMsgSubmit).length > 0) {
            setErrMsgSubmit({
                ...errorMsgSubmit,
                [e.target.name]: ''
            })
        }
    }

    const toPage = (path) => {
        router.push(path)
    }

    const handlePopupEdit = () => {
        setOnPopupEdit(!onPopupEdit)
    }

    const updateForm = (data) => {
        if (data) {
            setIdDataRegisForUpdt(data.id)
            setPersonalDataRegis({
                jenisPenyakit: data.data[0].name,
                appointmentDate: data.data[1].name,
                submissionDate: data.data[2].name,
                patientName: data.data[3].name,
                emailAddress: data.data[4].name,
                dateOfBirth: data.data[5].name,
                phone: data.data[6].name
            })
            setValueInputEdit({
                jenisPenyakit: data.data[0].name,
                appointmentDate: data.data[1].name,
                submissionDate: data.data[2].name,
                patientName: data.data[3].name,
                emailAddress: data.data[4].name,
                dateOfBirth: data.data[5].name,
                phone: data.data[6].name
            })
        }
    }

    const validateForm = async () => {
        let err = {}

        if (!valueInputEdit.appointmentDate.trim()) {
            err.appointmentDate = 'Must be required'
        }
        if (!valueInputEdit.submissionDate.trim()) {
            err.submissionDate = 'Must be required'
        }
        if (!valueInputEdit.patientName.trim()) {
            err.patientName = 'Must be required'
        }
        if (!valueInputEdit.emailAddress.trim()) {
            err.emailAddress = 'Must be required'
        } else if (!mailRegex.test(valueInputEdit.emailAddress)) {
            err.emailAddress = 'Invalid email address'
        }
        if (!valueInputEdit.dateOfBirth.trim()) {
            err.dateOfBirth = 'Must be required'
        }
        if (!valueInputEdit.phone.trim()) {
            err.phone = 'Must be required'
        }

        setErrMsgSubmit(err)

        return await new Promise((resolve, reject) => {
            if (Object.keys(err).length === 0) {
                resolve({ message: 'success' })
            } else {
                reject(err)
            }
        })
    }

    const formIsAnyUpdate = async () => {
        let err = {}

        const message = 'this is the same'

        if (valueInputEdit.appointmentDate === personalDataRegis?.appointmentDate) {
            err.appointmentDate = message
        }
        if (valueInputEdit.submissionDate === personalDataRegis?.submissionDate) {
            err.submissionDate = message
        }
        if (valueInputEdit.patientName === personalDataRegis?.patientName) {
            err.patientName = message
        }
        if (valueInputEdit.emailAddress === personalDataRegis?.emailAddress) {
            err.emailAddress = message
        }
        if (valueInputEdit.dateOfBirth === personalDataRegis?.dateOfBirth) {
            err.dateOfBirth = message
        }
        if (valueInputEdit.phone === personalDataRegis?.phone) {
            err.phone = message
        }

        return await new Promise((resolve, reject) => {
            if (Object.keys(err).length !== 6) {
                resolve({ message: 'success' })
            } else if (Object.keys(err).length === 6) {
                reject({ message: `can't update` })
            }
        })
    }

    const handleSubmitUpdate = () => {
        if (loadingSubmit === false) {
            formIsAnyUpdate()
                .then(result => {
                    validateForm()
                        .then(res => {
                            if (window.confirm(`update patient data from ${personalDataRegis?.patientName}?`)) {
                                setLoadingSubmit(true)
                                updatePersonalDataPatient()
                            }
                        })
                        .catch(err => { return err })
                })
                .catch(err => { return err })
        }
    }

    const updatePersonalDataPatient = () => {
        if (bookAnAppointment?._id) {
            API.APIPutPatientRegistration(
                bookAnAppointment._id,
                idDataRegisForUpdt,
                valueInputEdit
            )
                .then(res => {
                    setLoadingSubmit(false)
                    setTimeout(() => {
                        alert(`${personalDataRegis?.patientName} patient upated successfully`)
                    }, 0)
                })
                .catch(err => {
                    alert('Oops, telah terjadi kesalahan server\nMohon coba beberapa saat lagi')
                    console.log(err)
                })
        } else {
            alert('Oops, telah terjadi kesalahan server\nMohon coba beberapa saat lagi')
            setLoadingSubmit(false)
        }
    }

    const clickDeletePersonalDataRegis = (id) => {
        if (bookAnAppointment?._id) {
            setIdDataRegisForUpdt(id)
            if (loadingSubmit === false && window.confirm('Delete this data?')) {
                setLoadingSubmit(true)
                deleteDataPersonalPatientRegis(id)
            } else if (loadingSubmit === true && id !== idDataRegisForUpdt) {
                alert('There is a process running\nPlease wait a moment')
            }
        }
    }

    const deleteDataPersonalPatientRegis = (id) => {
        API.APIDeletePatientRegistration(bookAnAppointment._id, id)
            .then(res => {
                setLoadingSubmit(false)
                setTimeout(() => {
                    alert('Deleted successfully')
                }, 0)
            })
            .catch(err => {
                alert('Oops, telah terjadi kesalahan server\nMohon coba beberapa saat lagi')
                setLoadingSubmit(false)
            })
    }

    const propsErrMsg = {
        styleInputErrMsg: {
            display: 'flex',
            marginBottom: '15px'
        }
    }

    return (
        <>
            <Head>
                <title>Patient Registration | Admin Hospice Medical</title>
                <meta name="description" content="daftar dari pendaftaran pasien yang belum dikonfirmasi" />
            </Head>

            {/* Pop up edit */}
            <WrappEditPR
                clickWrapp={handlePopupEdit}
                clickClose={handlePopupEdit}
                styleWrapp={{
                    display: onPopupEdit ? 'flex' : 'none'
                }}
            >
                <h1 className={style['patient-name']}>
                    <span className={style['desc-title']}>
                        Patient of
                    </span>
                    <span className={style['name']}>
                        {personalDataRegis?.patientName}
                    </span>
                </h1>
                <Input
                    {...propsInputEdit}
                    {...propsErrMsg}
                    type='text'
                    nameInput='jenisPenyakit'
                    valueInput={valueInputEdit.jenisPenyakit}
                    title='Jenis Penyakit'
                    readOnly={true}
                    changeInput={handleChangeEditPR}
                />
                <Input
                    {...propsInputEdit}
                    {...propsErrMsg}
                    type='text'
                    nameInput='appointmentDate'
                    valueInput={valueInputEdit.appointmentDate}
                    title='Appointment Date'
                    changeInput={handleChangeEditPR}
                    errorMessage={errorMsgSubmit?.appointmentDate}
                />
                <Input
                    {...propsInputEdit}
                    {...propsErrMsg}
                    type='text'
                    nameInput='submissionDate'
                    valueInput={valueInputEdit.submissionDate}
                    title='Submission Date'
                    changeInput={handleChangeEditPR}
                    errorMessage={errorMsgSubmit?.submissionDate}
                />
                <Input
                    {...propsInputEdit}
                    {...propsErrMsg}
                    type='text'
                    nameInput='patientName'
                    valueInput={valueInputEdit.patientName}
                    title='Patient Name'
                    changeInput={handleChangeEditPR}
                    errorMessage={errorMsgSubmit?.patientName}
                />
                <Input
                    {...propsInputEdit}
                    {...propsErrMsg}
                    type='text'
                    nameInput='emailAddress'
                    valueInput={valueInputEdit.emailAddress}
                    title='Email'
                    changeInput={handleChangeEditPR}
                    errorMessage={errorMsgSubmit?.emailAddress}
                />
                <Input
                    {...propsInputEdit}
                    {...propsErrMsg}
                    type='text'
                    nameInput='dateOfBirth'
                    valueInput={valueInputEdit.dateOfBirth}
                    title='Date of Birth'
                    changeInput={handleChangeEditPR}
                    errorMessage={errorMsgSubmit?.dateOfBirth}
                />
                <Input
                    {...propsInputEdit}
                    {...propsErrMsg}
                    type='text'
                    nameInput='phone'
                    valueInput={valueInputEdit.phone}
                    title='Phone'
                    changeInput={handleChangeEditPR}
                    errorMessage={errorMsgSubmit?.phone}
                />
                <Button
                    name='UPDATE'
                    style={{
                        margin: '5px 0 0 0'
                    }}
                    click={handleSubmitUpdate}
                    styleLoading={{
                        display: loadingSubmit ? 'flex' : 'none'
                    }}
                />
            </WrappEditPR>

            <div className={onNavLeft ? `${style['wrapp']} ${style['wrapp-active']}` : style['wrapp']}>
                <div className={style['container']}>
                    <div className={style['content']}>
                        <h1 className={style['title']}>
                            List of Patient Registration
                        </h1>

                        <TableContainer styleWrapp={{
                            margin: '50px 0 0 0'
                        }}>
                            <TableBody>
                                <TableHead
                                    id='tHead'
                                    data={head}
                                />
                                {!loadingAuth && user?.id && !loadConditionTableScreen? (
                                    <>
                                        {dataColumns?.length > 0 ? dataColumns.map((item, index) => {
                                            const jenisPenyakit = item.data[0].name.replace('-', '')
                                            const newJenisPenyakit = jenisPenyakit.replace(/ /gi, '-').toLowerCase()
                                            const emailPatient = item.data[4].name
                                            const pathUrlToDataDetail = `patient-registration/personal-data/not-yet-confirmed/${newJenisPenyakit}/${emailPatient}/${item.id}`

                                            return (
                                                <button key={index} className={style['columns-data']} onClick={() => toPage(pathUrlToDataDetail)}>
                                                    <TableColumns
                                                        styleEdit={{
                                                            display: 'none'
                                                        }}
                                                        styleLoadingCircle={{
                                                            display: idDataRegisForUpdt === item.id && loadingSubmit ? 'flex' : 'none'
                                                        }}
                                                        styleIconDelete={{
                                                            display: idDataRegisForUpdt === item.id && loadingSubmit ? 'none' : 'flex'
                                                        }}
                                                        clickEdit={(e) => {
                                                            e.stopPropagation()
                                                            handlePopupEdit()
                                                            updateForm(item)
                                                        }}
                                                        clickDelete={(e) => {
                                                            e.stopPropagation()
                                                            clickDeletePersonalDataRegis(item.id)
                                                        }}
                                                    >
                                                        <i className={`fa-solid fa-circle ${style['icon-no-read']}`} style={{
                                                            color: item.isNotif ? 'transparent' : '#ff296d'
                                                        }}></i>
                                                        {item.data.map((data, idx) => {
                                                            return (
                                                                <TableData
                                                                    key={idx}
                                                                    id={`tData${index}${idx}`}
                                                                    name={data.name}
                                                                    styleWrapp={{
                                                                        cursor: 'pointer'
                                                                    }}
                                                                />
                                                            )
                                                        })}
                                                    </TableColumns>
                                                </button>
                                            )
                                        }) : (
                                            <>
                                                <p className={style['no-data']}>No patient registration data</p>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {loadTableScreen.map((item, index) => (
                                            <TableColumns
                                                key={index}
                                                styleWrappBtn={{
                                                    display: 'none'
                                                }}
                                            >
                                                {item.data.map((data, idx) => (
                                                    <TableData
                                                        key={idx}
                                                        id={`tDataLoad${index}${idx}`}
                                                        styleWrapp={{
                                                            background: '#fff'
                                                        }}
                                                    >
                                                        <ShineLoading
                                                            styleWrapp={{
                                                                height: '10px',
                                                                width: '100%'
                                                            }}
                                                        />
                                                    </TableData>
                                                ))}
                                            </TableColumns>
                                        ))}
                                    </>
                                )}
                            </TableBody>
                        </TableContainer>
                    </div>
                </div>
            </div>
        </>
    )
}

export default PatientRegistration