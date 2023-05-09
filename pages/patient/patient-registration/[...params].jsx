import { useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import style from 'styles/PersonalDataRegis.module.scss'
import { AuthContext } from 'lib/context/auth'
import { NotFoundRedirectCtx } from 'lib/context/notFoundRedirect'
import useSwr from 'lib/useFetch/useSwr'
import endpoint from 'lib/api/endpoint'
import API from 'lib/api'
import CardPatientRegisData from 'components/ConfirmInfo/CardPatientRegisData'
import Button from 'components/Button'
import WrappEditPR from 'components/Popup/WrappEditPR'
import Input from 'components/Input'
import HeadConfirmInfo from 'components/ConfirmInfo/HeadConfirmInfo'
import SelectCategory from 'components/SelectCategory'
import { monthNames } from 'lib/namesOfCalendar/monthNames'

function PersonalDataRegistration() {
    const [onPopupEdit, setOnPopupEdit] = useState(false)
    const [dataOfPatient, setDataOfPatient] = useState({})
    const [valueInputEdit, setValueInputEdit] = useState({
        jenisPenyakit: '',
        appointmentDate: '',
        submissionDate: '',
        patientName: '',
        emailAddress: '',
        dateOfBirth: '',
        phone: ''
    })
    const [chooseDoctor, setChooseDoctor] = useState({})
    const [chooseRoom, setChooseRoom] = useState({})
    const [presenceState, setPresenceState] = useState('MENUNGGU')
    const [loadingSubmit, setLoadingSubmit] = useState(false)
    const [errorMsgSubmit, setErrMsgSubmit] = useState({})
    const [inputConfirm, setInputConfirm] = useState({
        id: '',
        message: 'Selamat siang bapak ridwan, saya dari admin hospice medical ingin mengkonfirmasikan pendaftaran Anda pada ketentuan berikut :',
        emailAdmin: '',
        dateConfirm: '',
        confirmHour: '',
        treatmentHours: '',
        doctorInfo: {
            nameDoctor: '',
            doctorSpecialist: ''
        },
        queueNumber: '',
        roomInfo: {
            roomName: '',
        },
        presence: ''
    })
    const [errSubmitConfPatient, setErrSubmitConfPatient] = useState({})
    const [loadingSubmitConfPatient, setLoadingSubmitConfPatient] = useState(false)

    const router = useRouter()
    const { params = [] } = router.query

    // servicing hours
    const { data: dataService, error: errService, isLoading: loadService } = useSwr(endpoint.getServicingHours())
    // for user regis
    const bookAnAppointment = dataService?.data ? dataService.data.find(item => item?.id === 'book-an-appointment') : null
    const userAppointmentData = bookAnAppointment ? bookAnAppointment.userAppointmentData : null
    const findPersonalData = userAppointmentData ? userAppointmentData.find(regis => regis?.id === params[4]) : {}
    const patientData = findPersonalData
    // room disease type
    const diseaseType = bookAnAppointment ? bookAnAppointment.diseaseType : null
    const findCurrentDiseaseType = diseaseType?.length > 0 ? diseaseType.filter(item => item.jenis.toLowerCase() !== 'disease type') : null
    const currentDiseaseType = findCurrentDiseaseType?.length > 0 ? findCurrentDiseaseType.find(item => item.jenis.toLowerCase().split(' ').join('').split('-').join('').includes(params[2]?.split('-')?.join(''))) : null
    const roomDiseaseType = currentDiseaseType ? currentDiseaseType.room.map(room => (
        {
            id: room.id,
            title: room.nameRoom
        }
    )) : []
    // for queue number of patient
    const patientOfCurrentDiseaseT = userAppointmentData && patientData ? userAppointmentData.filter(patient =>
        patient.jenisPenyakit === patientData?.jenisPenyakit &&
        patient.appointmentDate === patientData?.appointmentDate &&
        patient.isConfirm?.id &&
        patient.isConfirm?.roomInfo?.roomName === chooseRoom?.title
    ) : null

    // doctors
    const { data: dataDoctors, error: errDataDoctors, isLoading: loadDataDoctors } = useSwr(endpoint.getDoctors())
    const findAllDataDoctors = dataDoctors?.data ? dataDoctors.data : null
    const findOurDoctor = findAllDataDoctors?.length > 0 ? findAllDataDoctors.find(item => item.title.toLowerCase() === 'our doctor') : null
    const findDoctorSpecialist = findOurDoctor ? findOurDoctor?.data : null
    const getSpecialist = findDoctorSpecialist?.length > 0 ? findDoctorSpecialist.map(doc => (
        {
            id: doc.id,
            spesialis: doc.deskripsi.toLowerCase().split('spesialis')[1].substr(1),
            title: doc.name,
            jadwalDokter: doc.jadwalDokter
        }
    )) : null
    const findCurrentSpecialist = patientData?.id && getSpecialist?.length > 0 ? getSpecialist.filter(
        item => item.spesialis.includes('/') ? item.spesialis.split('/')[0].includes(patientData.jenisPenyakit.toLowerCase()) ? item.spesialis.split('/')[0].includes(patientData.jenisPenyakit.toLowerCase()) : item.spesialis.split('/')[1].includes(patientData.jenisPenyakit.toLowerCase()) : item.spesialis.includes(patientData.jenisPenyakit.toLowerCase())
    ) : []

    const mailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

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

    useEffect(() => {
        if (!loadDataDoctors && errDataDoctors) {
            console.log('error data doctors')
        }
    }, [loadDataDoctors])

    useEffect(() => {
        if (!loadService && errService) {
            console.log('error data servicing hours')
        }
    }, [loadService])

    useEffect(() => {
        if (params?.length > 0 && dataDoctors?.data && findCurrentSpecialist?.length > 0) {
            setTimeout(() => {
                setChooseDoctor(findCurrentSpecialist[0])
                setInputConfirm({
                    ...inputConfirm,
                    doctorInfo: {
                        nameDoctor: findCurrentSpecialist[0].title,
                        doctorSpecialist: findCurrentSpecialist[0].spesialis
                    }
                })
            }, 0)
        }
    }, [params, dataDoctors])

    useEffect(() => {
        if (params?.length > 0 && dataService?.data && roomDiseaseType?.length > 0) {
            setTimeout(() => {
                setChooseRoom(roomDiseaseType[0])
                setInputConfirm((current) => ({
                    ...current,
                    roomInfo: {
                        roomName: roomDiseaseType[0].title
                    }
                }))
            }, 0)
        }
        if(params?.length > 0 && dataService?.data && patientData?.id){
            setDataOfPatient(patientData)
        }
    }, [params, dataService])

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

    const deleteDataPersonalPatientRegis = () => {
        API.APIDeletePatientRegistration(bookAnAppointment?._id, patientData?.id)
            .then(res => {
                alert('Deleted successfully')

                if (params[1] === 'not-yet-confirmed') {
                    setTimeout(() => {
                        router.push('/patient/patient-registration')
                    }, 100)
                }
            })
            .catch(err => {
                alert('Oops, telah terjadi kesalahan server\nMohon coba beberapa saat lagi')
                setLoadingSubmit(false)
            })
    }

    const handleChooseDoctors = () => {
        const selectEl = document.getElementById('chooseDoctors')
        const id = selectEl.options[selectEl.selectedIndex].value
        if (id) {
            const findDoctor = findCurrentSpecialist.find(doc => doc.id === id)
            setChooseDoctor(findDoctor)
        }
    }

    const handleChooseRoom = () => {
        const selectEl = document.getElementById('chooseRoom')
        const id = selectEl.options[selectEl.selectedIndex].value
        if (id) {
            const findRoom = roomDiseaseType.find(doc => doc.id === id)
            setChooseRoom(findRoom)
        }
    }

    const handleChangeInputConfirm = (e) => {
        setInputConfirm({
            ...inputConfirm,
            [e.target.name]: e.target.value
        })

        if (Object.keys(errSubmitConfPatient).length > 0) {
            setErrSubmitConfPatient({
                ...errSubmitConfPatient,
                [e.target.name]: ''
            })
        }
    }

    const validateFormConfPatient = async () => {
        let err = {}

        if (!inputConfirm.doctorInfo.nameDoctor.trim()) {
            err.nameDoctor = 'Must be required!'
        }
        if (!inputConfirm.doctorInfo.doctorSpecialist.trim()) {
            err.doctorSpecialist = 'Must be required!'
        }
        if (!inputConfirm.roomInfo.roomName.trim()) {
            err.roomName = 'Must be required!'
        }
        if (!inputConfirm.treatmentHours.trim()) {
            err.treatmentHours = 'Must be required!'
        }
        if (!inputConfirm.message.trim()) {
            err.message = 'Must be required!'
        }

        setErrSubmitConfPatient(err)

        return await new Promise((resolve, reject) => {
            if (Object.keys(err).length === 0) {
                resolve({ message: 'success' })
            } else {
                reject({ message: 'error' })
            }
        })
    }

    const submitConfirmPatient = () => {
        if (loadingSubmitConfPatient === false) {
            const nowHours = `${new Date().getHours().toString().length === 1 ? `0${new Date().getHours()}` : new Date().getHours()}`
            const nowMinutes = `${new Date().getMinutes().toString().length === 1 ? `0${new Date().getMinutes()}` : new Date().getMinutes()}`
            const nowDate = `${new Date()}`
            const getDate = nowDate.split(' ')[2]
            const getYear = nowDate.split(' ')[3]
            const getMonth = nowDate.split(' ')[1]
            const findMonth = monthNames.findIndex(item => item === getMonth) + 1
            const nowMonth = findMonth.toString().length === 1 ? `0${findMonth}` : findMonth
            const dateConfirm = `${nowMonth}/${getDate}/${getYear}`
            const confirmHour = `${nowHours}:${nowMinutes}`

            const postData = {
                id: `${new Date().getTime()}`,
                message: inputConfirm.message,
                emailAdmin: user?.email,
                dateConfirm,
                confirmHour,
                treatmentHours: inputConfirm.treatmentHours,
                doctorInfo: {
                    nameDoctor: inputConfirm.doctorInfo.nameDoctor,
                    doctorSpecialist: inputConfirm.doctorInfo.doctorSpecialist
                },
                queueNumber: `${patientOfCurrentDiseaseT?.length + 1}`,
                roomInfo: {
                    roomName: inputConfirm.roomInfo.roomName,
                },
                presence: 'menunggu'
            }

            validateFormConfPatient()
                .then(res => {
                    if (window.confirm('Konfirmasikan patient?')) {
                        setLoadingSubmitConfPatient(true)
                        pushToConfirmPatient(postData)
                    }
                })
                .catch(err => {
                    console.log(err)
                })
        }
    }

    const pushToConfirmPatient = (data) => {
        API.APIPostConfirmAppointmentDate(bookAnAppointment?._id, patientData?.id, data)
            .then(res => {
                setLoadingSubmitConfPatient(false)
                const pathUrl = `/patient/patient-registration/personal-data/confirmed/${params[2]}/${params[3]}/${params[4]}`
                setTimeout(() => {
                    router.push(pathUrl)
                }, 50);
            })
            .catch(err => {
                alert('Oops, telah terjadi kesalahan server!\nMohon coba beberapa saat lagi!')
                setLoadingSubmitConfPatient(false)
                console.log(err)
            })
    }

    if (params.length > 0 && params.length !== 5) {
        router.push('/page-not-found')
    } else if (params.length === 5) {
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
                        readOnly={true}
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
                                    {dataOfPatient?.patientName}
                                </span>
                            </h1>

                            <div className={style['white-content']}>
                                {patientData?.id && (
                                    <>
                                        {/* confirm info */}
                                        <div className={style['confirm-info']}>
                                            {patientData?.isConfirm?.id && (
                                                <>
                                                    <HeadConfirmInfo
                                                        icon="fa-solid fa-circle-check"
                                                        styleTitle={{
                                                            color: '#288bbc'
                                                        }}
                                                        desc="Confirmed"
                                                    />
                                                </>
                                            )}
                                            {!patientData?.isConfirm?.id && (
                                                <>
                                                    <HeadConfirmInfo
                                                        icon="fa-sharp fa-solid fa-circle-exclamation"
                                                        styleTitle={{
                                                            color: '#ff296d'
                                                        }}
                                                        desc="Not yet confirmed"
                                                    />
                                                </>
                                            )}
                                        </div>

                                        <h1 className={style['title-info']}>
                                            Patient Information
                                        </h1>

                                        {/* button action */}
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

                                        {/* data information */}
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

                                        {/* data confirmations */}
                                        {patientData?.isConfirm?.id && (
                                            <>
                                                <div className={style['data-conf-patients']}>
                                                    <h1 className={style['title']}>
                                                        Confirmation Data Information
                                                    </h1>

                                                    <CardPatientRegisData
                                                        title="Presence State"
                                                        desc={presenceState}
                                                        styleWrapp={{
                                                            margin: '20px 0'
                                                        }}
                                                        styleDesc={{
                                                            color: '#f85084',
                                                            fontWeight: 'bold'
                                                        }}
                                                    />
                                                    <CardPatientRegisData
                                                        {...propsIconDataInfo}
                                                        title="Queue Number"
                                                        icon='fa-solid fa-id-card'
                                                        desc={patientData?.isConfirm?.queueNumber}
                                                        styleDesc={{
                                                            color: '#288bbc',
                                                        }}
                                                    />
                                                    <CardPatientRegisData
                                                        {...propsIconDataInfo}
                                                        title="Treatment Hours"
                                                        icon='fa-solid fa-clock'
                                                        desc={patientData?.isConfirm?.treatmentHours}
                                                        styleDesc={{
                                                            color: '#f85084',
                                                        }}
                                                        styleWrapp={{
                                                            margin: '20px 0'
                                                        }}
                                                    />
                                                    <CardPatientRegisData
                                                        title="Room Name"
                                                        desc={patientData?.isConfirm?.roomInfo?.roomName}
                                                    />
                                                    <CardPatientRegisData
                                                        title="Doctor Name"
                                                        desc={patientData?.isConfirm?.doctorInfo?.nameDoctor}
                                                        styleWrapp={{
                                                            margin: '20px 0'
                                                        }}
                                                    />
                                                    <CardPatientRegisData
                                                        title="Doctor Specialist"
                                                        desc={patientData?.isConfirm?.doctorInfo?.doctorSpecialist}
                                                    />
                                                    <CardPatientRegisData
                                                        {...propsIconDataInfo}
                                                        icon='fa-solid fa-clock'
                                                        title="Confirmation Hour"
                                                        desc={patientData?.isConfirm?.confirmHour}
                                                        styleWrapp={{
                                                            margin: '20px 0'
                                                        }}
                                                    />
                                                    <CardPatientRegisData
                                                        {...propsIconDataInfo}
                                                        icon="fa-solid fa-calendar-days"
                                                        title="Confirmed Date"
                                                        desc={patientData?.isConfirm?.dateConfirm}
                                                    />
                                                    <CardPatientRegisData
                                                        title="Admin Confirmation"
                                                        desc={patientData?.isConfirm?.emailAdmin}
                                                        styleWrapp={{
                                                            margin: '20px 0'
                                                        }}
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {!patientData?.isConfirm?.id && (
                                            <>
                                                <h1 className={style['title-confirm']}>
                                                    Form Confirmation
                                                </h1>

                                                {/* form confirm */}
                                                <div className={style['form-confirm']}>
                                                    <div className={style['input']} style={{
                                                        width: '100%'
                                                    }}>
                                                        {/* select doctor */}
                                                        <SelectCategory
                                                            styleWrapp={{
                                                                margin: '0px 0'
                                                            }}
                                                            styleTitle={{
                                                                fontSize: '13px'
                                                            }}
                                                            titleCtg="Choose a Doctor"
                                                            idSelect="chooseDoctors"
                                                            handleCategory={handleChooseDoctors}
                                                            dataBlogCategory={findCurrentSpecialist}
                                                        />
                                                    </div>
                                                    <div className={style['input']}>
                                                        <Input
                                                            {...propsInputEdit}
                                                            {...propsErrMsg}
                                                            type='text'
                                                            nameInput='nameDoctor'
                                                            placeholder='doctor name...'
                                                            valueInput={chooseDoctor?.title}
                                                            title='Doctor Name'
                                                            readOnly={true}
                                                            errorMessage={errSubmitConfPatient?.nameDoctor}
                                                        />
                                                    </div>
                                                    <div className={style['input']}>
                                                        <Input
                                                            {...propsInputEdit}
                                                            {...propsErrMsg}
                                                            type='text'
                                                            nameInput='doctorSpecialist'
                                                            placeholder='doctor specialist...'
                                                            valueInput={chooseDoctor?.spesialis}
                                                            title='Doctor Specialist'
                                                            readOnly={true}
                                                            errorMessage={errSubmitConfPatient?.doctorSpecialist}
                                                        />
                                                    </div>
                                                    <div className={style['input']}>
                                                        {/* select room */}
                                                        <SelectCategory
                                                            idSelect="chooseRoom"
                                                            styleWrapp={{
                                                                margin: '0px 0'
                                                            }}
                                                            styleTitle={{
                                                                fontSize: '13px'
                                                            }}
                                                            titleCtg="Choose a Room"
                                                            handleCategory={handleChooseRoom}
                                                            dataBlogCategory={roomDiseaseType}
                                                        />
                                                    </div>
                                                    <div className={style['input']}>
                                                        <Input
                                                            {...propsInputEdit}
                                                            {...propsErrMsg}
                                                            type='text'
                                                            nameInput='roomName'
                                                            placeholder='room name...'
                                                            valueInput={chooseRoom?.title}
                                                            title='Room Name'
                                                            readOnly={true}
                                                            errorMessage={errSubmitConfPatient?.roomName}
                                                        />
                                                    </div>
                                                    <div className={style['input']}>
                                                        <Input
                                                            {...propsInputEdit}
                                                            {...propsErrMsg}
                                                            type='text'
                                                            nameInput='totalPatients'
                                                            placeholder='total patient...'
                                                            valueInput={patientOfCurrentDiseaseT?.length}
                                                            title='Total Number of Patients in this Room'
                                                            readOnly={true}
                                                        // errorMessage={errSubmitConfPatient?.roomName}
                                                        />
                                                    </div>
                                                    <div className={style['input']}>
                                                        <Input
                                                            {...propsInputEdit}
                                                            {...propsErrMsg}
                                                            type='text'
                                                            nameInput='treatmentHours'
                                                            placeholder='Treatment hours...'
                                                            valueInput={inputConfirm.treatmentHours}
                                                            title='Treatment Hours'
                                                            changeInput={handleChangeInputConfirm}
                                                            errorMessage={errSubmitConfPatient?.treatmentHours}
                                                        />
                                                    </div>
                                                    <div className={style['input']} style={{
                                                        width: '100%'
                                                    }}>
                                                        <Input
                                                            styleTitle={{
                                                                display: 'flex'
                                                            }}
                                                            styleInputText={{
                                                                display: 'none'
                                                            }}
                                                            styleTxtArea={{
                                                                display: 'flex'
                                                            }}
                                                            {...propsErrMsg}
                                                            valueTxtArea={inputConfirm.message}
                                                            title='Message'
                                                            nameTxtArea="message"
                                                            placeholderTxtArea="Message..."
                                                            changeTxtArea={handleChangeInputConfirm}
                                                            errorMessage={errSubmitConfPatient?.message}
                                                        />
                                                    </div>
                                                    <Button
                                                        name="CONFIRM PATIENT"
                                                        style={{
                                                            widh: 'auto',
                                                            margin: '0 auto'
                                                        }}
                                                        click={submitConfirmPatient}
                                                        styleLoading={{
                                                            display: loadingSubmitConfPatient ? 'flex' : 'none'
                                                        }}
                                                    />
                                                </div>
                                            </>
                                        )}
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