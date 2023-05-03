import { useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import style from 'styles/PersonalDataRegis.module.scss'
import { AuthContext } from 'lib/context/auth'
import { NotFoundRedirectCtx } from 'lib/context/notFoundRedirect'
import useSwr from 'lib/useFetch/useSwr'
import endpoint from 'lib/api/endpoint'
import API from 'lib/api'
import CardPatientRegisData from 'components/CardPatientRegisData'
import Button from 'components/Button'
import WrappEditPR from 'components/Popup/WrappEditPR'
import Input from 'components/Input'

function PersonalDataRegistration() {
    const [onPopupEdit, setOnPopupEdit] = useState(false)
    const [valueInputEdit, setValueInputEdit] = useState({
        jenisPenyakit: '',
        appointmentDate: '',
        submissionDate: '',
        patientName: '',
        emailAddress: '',
        dateOfBirth: '',
        phone: ''
    })
    const [loadingSubmit, setLoadingSubmit] = useState(false)
    const [errorMsgSubmit, setErrMsgSubmit] = useState({})

    const router = useRouter()
    const { params = [] } = router.query

    const mailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

    const { data: dataService, error: errService, isLoading: loadService } = useSwr(endpoint.getServicingHours())
    const bookAnAppointment = dataService?.data ? dataService.data.find(item => item?.id === 'book-an-appointment') : null
    const userAppointmentData = bookAnAppointment ? bookAnAppointment.userAppointmentData : null
    const findPersonalData = userAppointmentData ? userAppointmentData.find(regis => regis?.id === params[4]) : {}
    const patientData = findPersonalData

    // context
    const { user, loadingAuth } = useContext(AuthContext)
    const { onNavLeft } = useContext(NotFoundRedirectCtx)

    const updateNotif = () => {
        API.APIPutIsNotif(bookAnAppointment?._id, params[4])
            .then(res => {
                return res;
            })
            .catch(err => console.log(err))
    }

    useEffect(() => {
        if (user?.id && !loadService && patientData?.isNotif === false) {
            updateNotif()
        }
        if (user?.id && !loadService && patientData?.id) {
            const {
                jenisPenyakit,
                appointmentDate,
                submissionDate,
                patientName,
                emailAddress,
                dateOfBirth,
                phone
            } = patientData
            setValueInputEdit({
                jenisPenyakit: jenisPenyakit,
                appointmentDate: appointmentDate,
                submissionDate: submissionDate,
                patientName: patientName,
                emailAddress: emailAddress,
                dateOfBirth: dateOfBirth,
                phone: phone
            })
        }
    }, [user, patientData])

    const propsIconDataInfo = {
        styleIcon: {
            display: 'flex'
        }
    }

    const propsInputEdit = {
        styleTitle: {
            display: 'flex'
        },
        styleInputText: {
            marginBottom: '5px'
        }
    }

    const propsErrMsg = {
        styleInputErrMsg: {
            display: 'flex',
            marginBottom: '15px'
        }
    }

    const handlePopupEdit = () => {
        setOnPopupEdit(!onPopupEdit)
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

    const handleSubmitUpdate = () => {
        if (loadingSubmit === false) {
            formIsAnyUpdate()
                .then(result => {
                    validateForm()
                        .then(res => {
                            if (window.confirm(`update patient data from ${patientData?.patientName}?`)) {
                                setLoadingSubmit(true)
                                updatePersonalDataPatient()
                            }
                        })
                        .catch(err => { return err })
                })
                .catch(err => { return err })
        }
    }

    const formIsAnyUpdate = async () => {
        let err = {}

        const message = 'this is the same'

        if (valueInputEdit.appointmentDate === patientData?.appointmentDate) {
            err.appointmentDate = message
        }
        if (valueInputEdit.submissionDate === patientData?.submissionDate) {
            err.submissionDate = message
        }
        if (valueInputEdit.patientName === patientData?.patientName) {
            err.patientName = message
        }
        if (valueInputEdit.emailAddress === patientData?.emailAddress) {
            err.emailAddress = message
        }
        if (valueInputEdit.dateOfBirth === patientData?.dateOfBirth) {
            err.dateOfBirth = message
        }
        if (valueInputEdit.phone === patientData?.phone) {
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

    const updatePersonalDataPatient = () => {
        if (bookAnAppointment?._id && patientData?.id) {
            API.APIPutPatientRegistration(
                bookAnAppointment._id,
                patientData.id,
                valueInputEdit
            )
                .then(res => {
                    setLoadingSubmit(false)
                    setTimeout(() => {
                        alert(`${patientData?.patientName} patient upated successfully`)
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

    const clickDeletePersonalDataRegis = () => {
        if (loadingSubmit === false && window.confirm('Delete this data?')) {
            setLoadingSubmit(true)
            deleteDataPersonalPatientRegis()
        }
    }

    const deleteDataPersonalPatientRegis = ()=>{
        API.APIDeletePatientRegistration(bookAnAppointment?._id, patientData?.id)
        .then(res=>{
            alert('Deleted successfully')

            if(params[1] === 'not-yet-confirmed'){
                setTimeout(() => {
                    router.push('/patient/patient-registration')
                }, 100)
            }
        })
        .catch(err=>{
            alert('Oops, telah terjadi kesalahan server\nMohon coba beberapa saat lagi')
            setLoadingSubmit(false)
        })
    }

    if (params.length > 0 && params.length !== 5) {
        router.push('/page-not-found')
    } else if(params.length === 5) {
        return (
            <>
                <Head>
                    <title>{patientData?.patientName} | Patient Registration | Admin Hospice Medical</title>
                    <meta name="description" content="data pendaftaran personal pasien hospice medical" />
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
                            {patientData?.patientName}
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
                                <span className={style['patient-of']}>Patient of</span>
                                <span className={style['name']}>
                                    {patientData?.patientName}
                                </span>
                            </h1>

                            <div className={style['white-content']}>
                                {patientData?.id && (
                                    <>
                                        <div className={style['btn-action']}>
                                            <button className={style['edit']}
                                                onClick={handlePopupEdit}>
                                                <i className="fa-solid fa-pencil"></i>
                                            </button>
                                            <button className={`${style['edit']} ${style['delete']}`}
                                            onClick={clickDeletePersonalDataRegis}>
                                                <div className={style['loading-circle']} style={{
                                                    display: loadingSubmit ? 'flex' : 'none'
                                                }}>

                                                </div>
                                                <i className="fa-solid fa-trash" style={{
                                                    display: loadingSubmit ? 'none' : 'flex'
                                                }}></i>
                                            </button>
                                        </div>
                                        <div className={style['data']}>
                                            <CardPatientRegisData
                                                title="Disease Type"
                                                desc={patientData.jenisPenyakit}
                                            />
                                            <CardPatientRegisData
                                                {...propsIconDataInfo}
                                                title="Appointment Date"
                                                icon="fa-solid fa-calendar-days"
                                                desc={patientData.appointmentDate}
                                            />
                                            <CardPatientRegisData
                                                title="Submission Date"
                                                desc={patientData.submissionDate}
                                            />
                                            <CardPatientRegisData
                                                {...propsIconDataInfo}
                                                title="O'Clock"
                                                icon='fa-solid fa-clock'
                                                desc={patientData.clock}
                                                styleDesc={{
                                                    color: '#f85084'
                                                }}
                                            />
                                            <CardPatientRegisData
                                                title="Patient Name"
                                                desc={patientData.patientName}
                                            />
                                            <CardPatientRegisData
                                                title="Email"
                                                desc={patientData.emailAddress}
                                            />
                                            <CardPatientRegisData
                                                title="Date of Birth"
                                                desc={patientData.dateOfBirth}
                                            />
                                            <CardPatientRegisData
                                                title="Phone"
                                                desc={patientData.phone}
                                            />
                                            <CardPatientRegisData
                                                title="Patient ID"
                                                desc={patientData.id}
                                            />
                                            <CardPatientRegisData
                                                title="Messages from Patient"
                                                desc={patientData.message}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}

export default PersonalDataRegistration