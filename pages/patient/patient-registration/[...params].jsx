import { useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import addMonths from 'addmonths'
import { range } from 'lodash'
import getYear from 'date-fns/getYear'
import getDay from 'date-fns/getDay'
import getMonth from 'date-fns/getMonth'
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
import { dayNamesEng } from 'lib/namesOfCalendar/dayNamesEng'
import { dayNamesInd } from 'lib/namesOfCalendar/dayNamesInd'

function PersonalDataRegistration() {
    const [onPopupEdit, setOnPopupEdit] = useState(false)
    const [valueInputEdit, setValueInputEdit] = useState({
        jenisPenyakit: '',
        appointmentDate: null,
        submissionDate: '',
        patientName: '',
        emailAddress: '',
        dateOfBirth: null,
        phone: ''
    })
    const [chooseDoctor, setChooseDoctor] = useState({})
    const [chooseRoom, setChooseRoom] = useState({})
    const [presenceState, setPresenceState] = useState('MENUNGGU')
    const [loadingSubmit, setLoadingSubmit] = useState(false)
    const [errorMsgSubmit, setErrMsgSubmit] = useState({})
    const [chooseDoctorUpdtInfoPatient, setChooseDoctorUpdtInfoPatient] = useState({})
    const [dataDayOfDoctors, setDataDayOfDoctros] = useState([])
    const [chooseDayOfDoctorOnUpdtInfoPatient, setChooseDayOfDoctorOnUpdtInfoPatient] = useState({})
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
    const [infoLoket, setInfoLoket] = useState({})
    const [inputConfToLoket, setInputConfToLoket] = useState({
        message: '',
    })
    const [loadingSubmitConfToLoket, setLoadingSubmitConfToLoket] = useState(false)
    const [errMsgConfToLoket, setErrMsgConfToLoket] = useState({})
    // state update info confirmation
    const [onPopupEditConfirm, setOnPopupEditConfirm] = useState(false)
    const [errMsgInputUpdtConfirmInfo, setErrMsgInputUpdtConfirmInfo] = useState({})
    const [loadingSubmitUpdtConfirmInfo, setLoadingSubmitUpdtConfirmInfo] = useState(false)
    const [inputUpdtConfirmInfo, setInputUpdtConfirmInfo] = useState({
        id: '',
        message: '',
        emailAdmin: '',
        nameAdmin: '',
        dateConfirm: '',
        confirmHour: '',
        treatmentHours: '',
        doctorInfo: {
            nameDoctor: '',
            doctorSpecialist: ''
        },
        queueNumber: '',
        roomInfo: {
            roomName: ''
        },
        presence: ''
    })
    const [paymentMethod] = useState([
        {
            id: 'cash',
            title: 'Cash'
        },
        {
            id: 'BPJS Kesehatan',
            title: 'BPJS Kesehatan'
        }
    ])
    const [inputConfFinishTreatment, setInputConfFinishTreatment] = useState({
        id: '',
        dateConfirm: '',
        confirmHour: '',
        emailAdmin: '',
        nameAdmin: '',
        confirmState: false,
        paymentMethod: 'cash',
        bpjsNumber: '',
        totalCost: ''
    })
    const [errSubmitConfFinishTreatment, setErrSubmitConfFinishTreatment] = useState({})
    const [loadingConfFinishTreatment, setLoadingConfFinishTreatment] = useState(false)

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
    // for queue number of patient from update confirmation info
    const patientOfCurrentDiseaseTForUpdtConfInfo = userAppointmentData && patientData ? userAppointmentData.filter(patient =>
        patient.jenisPenyakit === patientData?.jenisPenyakit &&
        patient.appointmentDate === patientData?.appointmentDate &&
        patient.isConfirm?.id &&
        patient.isConfirm?.roomInfo?.roomName === inputUpdtConfirmInfo.roomInfo.roomName
    ) : null
    // day time service
    const getDateOfAppointmentDate = new Date(`${patientData?.appointmentDate}`)
    const getDayOfAppointmentDate = getDateOfAppointmentDate.toString().split(' ')[0]
    const findDayOfAppointmentDate = dayNamesEng.findIndex(day => day === getDayOfAppointmentDate?.toLowerCase())
    const dayOfAppointmentDate = dayNamesInd[findDayOfAppointmentDate]
    const dayTime = [
        {
            day: 'Senin-Jumat'
        },
        {
            day: 'Sabtu'
        },
        {
            day: 'Minggu'
        }
    ]
    const servicingHours = dataService?.data ? dataService.data.find(item => item?.id === 'servicing-hours') : null
    const dataServicingHours = servicingHours ? servicingHours?.data?.find(day => dayOfAppointmentDate === 'sabtu' || dayOfAppointmentDate === 'minggu' ? day?.day?.toLowerCase()?.includes(dayOfAppointmentDate) : day?.day?.toLowerCase()?.includes(dayTime[0].day.toLowerCase())) : null

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
            jadwalDokter: doc.jadwalDokter,
            room: doc.room
        }
    )) : null
    const findCurrentSpecialist = patientData?.id && getSpecialist?.length > 0 ? getSpecialist.filter(
        item => item.spesialis.includes('/') ? item.spesialis.split('/')[0].includes(patientData.jenisPenyakit.toLowerCase()) ? item.spesialis.split('/')[0].includes(patientData.jenisPenyakit.toLowerCase()) : item.spesialis.split('/')[1].includes(patientData.jenisPenyakit.toLowerCase()) : item.spesialis.includes(patientData.jenisPenyakit.toLowerCase())
    ) : []
    // filter calendar
    const newDay = [
        'Minggu',
        'Senin',
        'Selasa',
        'Rabu',
        'Kamis',
        'Jumat',
        'Sabtu'
    ]
    const getJadwalDokter = chooseDoctor?.id ? chooseDoctor.jadwalDokter : null
    const findDayIdx = getJadwalDokter?.length > 0 ? newDay.findIndex(day => day.toLowerCase() === chooseDayOfDoctorOnUpdtInfoPatient?.title?.toLowerCase()) : null
    // const idxOneIfDayIsTwo = getJadwalDokter?.length === 2 ? newDay.findIndex(day => day.toLowerCase() === getJadwalDokter[0]?.toLowerCase()) : null
    // const idxTwoIfDayIsTwo = getJadwalDokter?.length === 2 ? newDay.findIndex(day => day.toLowerCase() === getJadwalDokter[1]?.toLowerCase()) : null
    const isWeekday = (date) => {
        const day = getDay(date)
        return day === findDayIdx
    }

    // loket
    const { data: dataLoket, error: errDataLoket, isLoading: loadDataLoket } = useSwr(endpoint.getLoket())
    const findInfoLoket = dataLoket?.data ? dataLoket?.data?.find(item => item.loketRules === 'info-loket') : null
    const getLoket = findInfoLoket ? findInfoLoket?.loketInfo : null
    const newLoket = getLoket?.length > 0 ? getLoket.map(item => ({ id: item.loketName, title: item.loketName })) : null
    // patient-queue
    const getPatientQueue = dataLoket?.data ? dataLoket?.data?.filter(item => item.loketRules === 'patient-queue') : null
    const findPatientInLoket = getPatientQueue?.length > 0 ? getPatientQueue.find(patient => patient.patientId === params[4]) : null

    // finished treatment
    const { data: dataFinishTreatment, error: errDataFinishTreatment, isLoading: loadDataFinishTreatment } = useSwr(endpoint.getFinishedTreatment())
    const patientRegisAtFinishTreatment = dataFinishTreatment?.data ? dataFinishTreatment?.data?.filter(item => item.rulesTreatment === 'patient-registration') : null
    const findCurrentPatientFinishTreatment = patientRegisAtFinishTreatment?.length > 0 ? patientRegisAtFinishTreatment.find(patient => patient.patientId === patientData?.id) : null

    const yearsCalendar = range(1900, getYear(new Date()) + 1, 1)
    const monthsCalendar = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ]

    // now date
    const newGetCurrentMonth = new Date().getMonth() + 1
    const getCurrentMonth = newGetCurrentMonth.toString().length === 1 ? `0${newGetCurrentMonth}` : newGetCurrentMonth
    const getCurrentDate = new Date().getDate().toString().length === 1 ? `0${new Date().getDate()}` : new Date().getDate()
    const getCurrentYear = new Date().getFullYear()
    const currentDate = `${getCurrentMonth}/${getCurrentDate}/${getCurrentYear}`

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

    // filter doctor in day of appointment date patient
    const getDateOfAppointmentDatePatient = new Date(patientData?.appointmentDate)
    const getDayOfADPatient = getDateOfAppointmentDatePatient ? getDateOfAppointmentDatePatient?.toString()?.split(' ') : null
    const findIdxDayOfADPatient = getDayOfADPatient ? dayNamesEng.findIndex(day => day === getDayOfADPatient[0]?.toLowerCase()) : null
    const dayNameOfADPatient = findIdxDayOfADPatient ? dayNamesInd[findIdxDayOfADPatient] : null

    const getDoctorsInCurrentDate = findCurrentSpecialist?.length > 0 ? findCurrentSpecialist.filter(doctor => {
        const findDay = doctor.jadwalDokter?.filter(day => day?.toLowerCase() === dayNameOfADPatient)

        return findDay?.length > 0
    }) : null
    // load room one
    const getDoctorsInCurrentRoom = getDoctorsInCurrentDate?.length > 0 ? getDoctorsInCurrentDate.filter(doctor => doctor.room === roomDiseaseType[0]?.title) : []
    // load room > 0
    const getDoctorsOtherFrom1 = getDoctorsInCurrentRoom?.length === 0 && getDoctorsInCurrentDate?.length > 0 ? getDoctorsInCurrentDate.filter(doctor => {
        const checkRoom = roomDiseaseType?.length > 0 ? roomDiseaseType.filter(room => room.title === doctor.room) : []

        return checkRoom?.length > 0
    }) : []

    const findOneDoctorOfFirstOne = getDoctorsInCurrentRoom?.length > 0 ? getDoctorsInCurrentRoom[0] : getDoctorsOtherFrom1[0]

    const findCurrentRoom = roomDiseaseType?.length > 0 ? roomDiseaseType.find(room => room?.title === findOneDoctorOfFirstOne?.room) : {}
    const findIdxCurrentRoom = roomDiseaseType?.length > 0 ? roomDiseaseType.findIndex(room => room?.title === findOneDoctorOfFirstOne?.room) : null

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
        if (user?.id && !loadService && patientData?.id && patientData?.isConfirm?.id) {
            const {
                id,
                message,
                emailAdmin,
                nameAdmin,
                dateConfirm,
                confirmHour,
                treatmentHours,
                doctorInfo,
                queueNumber,
                roomInfo,
                presence
            } = patientData?.isConfirm

            setInputUpdtConfirmInfo({
                id: id,
                message,
                emailAdmin,
                nameAdmin,
                dateConfirm,
                confirmHour,
                treatmentHours,
                doctorInfo: {
                    nameDoctor: doctorInfo?.nameDoctor,
                    doctorSpecialist: doctorInfo?.doctorSpecialist
                },
                queueNumber,
                roomInfo: {
                    roomName: roomInfo?.roomName
                },
                presence
            })

            const selectElDoctorUpdtConfInfo = document.getElementById('chooseDoctorsConfInfo')
            const findCurrentDoctorUpdtConfInfo = getDoctorsInCurrentDate?.length > 0 ? getDoctorsInCurrentDate.find(doctor => doctor.title === doctorInfo?.nameDoctor) : null
            if (selectElDoctorUpdtConfInfo) {
                selectElDoctorUpdtConfInfo.value = findCurrentDoctorUpdtConfInfo?.id
            }
            const selectElRoomUpdtConfInfo = document.getElementById('chooseRoomUpdtConfInfo')
            const findCurrentRoomUpdtConfInfo = roomDiseaseType?.length > 0 ? roomDiseaseType.find(room=>room.title === roomInfo?.roomName) : null
            if(selectElRoomUpdtConfInfo){
                selectElRoomUpdtConfInfo.value = findCurrentRoomUpdtConfInfo?.id
            }
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
            const selectElDoctor = document.getElementById('chooseDoctors')
            const selectElDoctorUpdtInfo = document.getElementById('chooseDoctorEditPatientInfo')
            const selectElDayDoctorSchedule = document.getElementById('selectDayUpdtPatientInfo')

            if (selectElDoctor && findOneDoctorOfFirstOne?.id) {
                selectElDoctor.value = findOneDoctorOfFirstOne.id
            }

            setChooseDoctor(findOneDoctorOfFirstOne)

            // jika pasien belum di konfirmasi
            // form info pasien update
            if (!patientData?.isConfirm?.id) {
                setChooseDoctorUpdtInfoPatient(findOneDoctorOfFirstOne)

                if (selectElDoctorUpdtInfo) {
                    selectElDoctorUpdtInfo.value = findOneDoctorOfFirstOne.id
                }

                const getDayDoctorSchedule = findOneDoctorOfFirstOne?.jadwalDokter ? findOneDoctorOfFirstOne.jadwalDokter.map((jadwal, idx) => ({
                    id: jadwal,
                    title: jadwal
                })) : []
                setDataDayOfDoctros(getDayDoctorSchedule)
                const findIdxDayDoctorSchedule = getDayDoctorSchedule?.length > 0 ? getDayDoctorSchedule.findIndex(jadwal => jadwal.title?.toLowerCase() === dayNameOfADPatient) : null
                setChooseDayOfDoctorOnUpdtInfoPatient(getDayDoctorSchedule[findIdxDayDoctorSchedule])

                if (selectElDayDoctorSchedule) {
                    setTimeout(() => {
                        selectElDayDoctorSchedule.value = getDayDoctorSchedule[findIdxDayDoctorSchedule]?.title
                    }, 1000);
                }
                // jika pasien sudah di konfirmasi
                // form info pasien update
            } else if (patientData?.isConfirm?.id) {
                const findDoctorOnConfirm = getDoctorsInCurrentDate?.length > 0 ? getDoctorsInCurrentDate?.find(doctor => doctor.title === patientData?.isConfirm?.doctorInfo?.nameDoctor) : null
                setChooseDoctorUpdtInfoPatient(findDoctorOnConfirm)
                if (selectElDoctorUpdtInfo) {
                    selectElDoctorUpdtInfo.value = findDoctorOnConfirm.id
                }
                const getDayDoctorSchedule = findDoctorOnConfirm?.jadwalDokter ? findDoctorOnConfirm.jadwalDokter.map((jadwal, idx) => ({
                    id: jadwal,
                    title: jadwal
                })) : []
                setDataDayOfDoctros(getDayDoctorSchedule)
                const findIdxDayDoctorSchedule = getDayDoctorSchedule?.length > 0 ? getDayDoctorSchedule.findIndex(jadwal => jadwal.title?.toLowerCase() === dayNameOfADPatient) : null
                setChooseDayOfDoctorOnUpdtInfoPatient(getDayDoctorSchedule[findIdxDayDoctorSchedule])

                if (selectElDayDoctorSchedule) {
                    setTimeout(() => {
                        selectElDayDoctorSchedule.value = getDayDoctorSchedule[findIdxDayDoctorSchedule]?.title
                    }, 1000);
                }
            }

            if (params?.length > 0 && dataService?.data && roomDiseaseType?.length > 0) {
                setTimeout(() => {
                    const selectEl = document.getElementById('chooseRoom')
                    if (selectEl && findIdxCurrentRoom) {
                        selectEl.value = findIdxCurrentRoom + 1
                    }

                    setChooseRoom(findCurrentRoom)
                    setInputConfirm((current) => ({
                        ...current,
                        doctorInfo: {
                            nameDoctor: findOneDoctorOfFirstOne?.title,
                            doctorSpecialist: findOneDoctorOfFirstOne?.spesialis
                        },
                        roomInfo: {
                            roomName: findCurrentRoom?.title
                        }
                    }))
                }, 0)
            }

            if (params?.length > 0 && dataService?.data && patientData?.isConfirm) {
                setPresenceState(patientData?.isConfirm?.presence?.toUpperCase())
            }
        }
    }, [params, dataDoctors, dataService])

    useEffect(() => {
        if (params?.length > 0 && dataLoket?.data && newLoket?.length > 0) {
            const findLoket = newLoket[0]?.id
            const findPatientInLoket = getPatientQueue.filter(patient => patient.loketName === findLoket && patient?.isConfirm?.confirmState === false)
            const findPatientToday = getPatientQueue.filter(patient => patient.loketName === findLoket && patient?.isConfirm?.confirmState && patient?.isConfirm?.dateConfirm === currentDate)
            setInfoLoket({
                id: 'patient-queue',
                loketName: findLoket,
                totalQueue: findPatientInLoket?.length + findPatientToday?.length
            })
        }
    }, [params, dataLoket])

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

    const styleStarInputEdit = {
        styleStar: {
            display: 'flex'
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
                                if (valueInputEdit.appointmentDate !== patientData?.appointmentDate && patientData?.isConfirm?.id) {
                                    // update data konfirmasi pasien jika sudah dikonfirmasi
                                    // for queue number of patient
                                    const currentPatient = userAppointmentData && patientData ? userAppointmentData.filter(patient =>
                                        patient.jenisPenyakit === patientData?.jenisPenyakit &&
                                        patient.appointmentDate === valueInputEdit.appointmentDate &&
                                        patient.isConfirm?.id &&
                                        patient.isConfirm?.roomInfo?.roomName === chooseDoctorUpdtInfoPatient?.room
                                    ) : null

                                    const { id, message, dateConfirm, confirmHour, treatmentHours, presence } = patientData?.isConfirm

                                    const dataUpdateConfirm = {
                                        id: id,
                                        message: message,
                                        emailAdmin: user?.email,
                                        nameAdmin: user?.name,
                                        dateConfirm: dateConfirm,
                                        confirmHour: confirmHour,
                                        treatmentHours: treatmentHours,
                                        doctorInfo: {
                                            nameDoctor: chooseDoctorUpdtInfoPatient?.title,
                                            doctorSpecialist: chooseDoctorUpdtInfoPatient?.spesialis
                                        },
                                        queueNumber: `${currentPatient?.length + 1}`,
                                        roomInfo: {
                                            roomName: chooseDoctorUpdtInfoPatient?.room
                                        },
                                        presence: presence
                                    }

                                    updateIsConfirm(dataUpdateConfirm, () => {
                                        updatePersonalDataPatient()
                                    }, (err) => {
                                        alert('Oops, telah terjadi kesalahan server\nMohon coba beberapa saat lagi')
                                        setLoadingSubmit(false)
                                        console.log(err)
                                    })
                                } else {
                                    // update data informasi pasien jika belum dikonfirmasi
                                    updatePersonalDataPatient()
                                }
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

    const updateIsConfirm = (data, sc, error) => {
        if (bookAnAppointment?._id && patientData?.id) {
            API.APIPutIsConfirm(
                bookAnAppointment._id,
                patientData.id,
                data
            )
                .then(res => {
                    sc(res)
                })
                .catch(err => error(err))
        } else {
            error('no patient id')
        }
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
                if (params[1] === 'confirmed') {
                    setTimeout(() => {
                        router.push('/patient/confirmation-patient')
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
            const findDoctorInCurrentDate = getDoctorsInCurrentDate?.length > 0 ? getDoctorsInCurrentDate.find(doctor => doctor.id === id) : {}

            if (findDoctorInCurrentDate?.id) {
                // const findDoctor = findCurrentSpecialist.find(doc => doc.id === id)
                selectEl.value = id
                setChooseDoctor(findDoctorInCurrentDate)

                const findRoom = roomDiseaseType?.length > 0 ? roomDiseaseType.find(room => room.title === findDoctorInCurrentDate?.room) : {}
                setChooseRoom(findRoom)
                const selectElRoom = document.getElementById('chooseRoom')
                selectElRoom.value = findRoom?.id

                setInputConfirm({
                    ...inputConfirm,
                    doctorInfo: {
                        doctorSpecialist: findDoctorInCurrentDate?.spesialis,
                        nameDoctor: findDoctorInCurrentDate?.title
                    },
                    roomInfo: {
                        roomName: findRoom?.title
                    }
                })
            } else {
                alert(`The doctor is not on the patient's schedule`)
                selectEl.value = chooseDoctor?.id
            }
        }
    }

    const handleChooseDoctorsUpdtInfoConfirm = () => {
        const selectEl = document.getElementById('chooseDoctorsConfInfo')
        const id = selectEl.options[selectEl.selectedIndex].value
        if (id) {
            const findDoctorInCurrentDate = getDoctorsInCurrentDate?.length > 0 ? getDoctorsInCurrentDate.find(doctor => doctor.id === id) : {}
            if (findDoctorInCurrentDate?.id) {
                const currentPatient = userAppointmentData && patientData ? userAppointmentData.filter(patient =>
                    patient.jenisPenyakit === patientData?.jenisPenyakit &&
                    patient.appointmentDate === patientData?.appointmentDate &&
                    patient.isConfirm?.id &&
                    patient.isConfirm?.roomInfo?.roomName === findDoctorInCurrentDate?.room &&
                    patient.id !== patientData?.id
                ) : null

                setInputUpdtConfirmInfo({
                    ...inputUpdtConfirmInfo,
                    doctorInfo: {
                        nameDoctor: findDoctorInCurrentDate?.title,
                        doctorSpecialist: findDoctorInCurrentDate?.spesialis
                    },
                    roomInfo: {
                        roomName: findDoctorInCurrentDate?.room
                    },
                    queueNumber: `${currentPatient?.length + 1}`
                })
                setErrMsgInputUpdtConfirmInfo({
                    ...errMsgInputUpdtConfirmInfo,
                    nameDoctor: '',
                    doctorSpecialist: '',
                    roomName: '',
                    totalQueue: ''
                })

                const findCurrentRoom = roomDiseaseType?.length > 0 ? roomDiseaseType.find(room => room.title === findDoctorInCurrentDate?.room) : {}
                const selectElRoomUpdtConfInfo = document.getElementById('chooseRoomUpdtConfInfo')
                if (selectElRoomUpdtConfInfo) {
                    selectElRoomUpdtConfInfo.value = findCurrentRoom?.id
                }
            } else {
                alert(`The doctor is not on the patient's schedule`)
                const findPrevDoctor = getDoctorsInCurrentDate?.length > 0 ? getDoctorsInCurrentDate.find(doctor => doctor.title === inputUpdtConfirmInfo?.doctorInfo?.nameDoctor) : {}
                selectEl.value = findPrevDoctor?.id
            }
        }
    }

    const handleChooseDoctorUpdtPatientInfo = () => {
        const selectEl = document.getElementById('chooseDoctorEditPatientInfo')
        const id = selectEl.options[selectEl.selectedIndex].value
        if (id) {
            const findDoctor = findCurrentSpecialist?.length > 0 ? findCurrentSpecialist.find(doctor => doctor.id === id) : null
            const getDayDoctorSchedule = findDoctor?.jadwalDokter ? findDoctor.jadwalDokter.map((jadwal, idx) => ({
                id: jadwal,
                title: jadwal
            })) : []
            setChooseDoctorUpdtInfoPatient(findDoctor)
            setDataDayOfDoctros(getDayDoctorSchedule)
        }
    }

    const handleChooseDayOfDoctorSchedule = () => {
        const selectEl = document.getElementById('selectDayUpdtPatientInfo')
        const id = selectEl.options[selectEl.selectedIndex].value
        if (id) {
            const findDay = dataDayOfDoctors.find(day => day.id === id)
            setChooseDayOfDoctorOnUpdtInfoPatient(findDay)
        }
    }

    const handleChooseRoom = () => {
        const selectEl = document.getElementById('chooseRoom')
        const id = selectEl.options[selectEl.selectedIndex].value
        if (id) {
            const findRoom = roomDiseaseType.find(doc => doc.id === id)
            const filterDoctorInCurrentDate = getDoctorsInCurrentDate?.length > 0 ? getDoctorsInCurrentDate.filter(doctor => doctor.room === findRoom?.title) : []
            if (filterDoctorInCurrentDate?.length > 0) {
                setChooseRoom(findRoom)

                setChooseDoctor(filterDoctorInCurrentDate[0])
                const selectElDoctor = document.getElementById('chooseDoctors')
                selectElDoctor.value = filterDoctorInCurrentDate[0]?.id

                setInputConfirm({
                    ...inputConfirm,
                    doctorInfo: {
                        doctorSpecialist: filterDoctorInCurrentDate[0]?.spesialis,
                        nameDoctor: filterDoctorInCurrentDate[0]?.title
                    },
                    roomInfo: {
                        roomName: findRoom?.title
                    }
                })
            } else {
                alert(`Doctor there is no doctor's schedule available in this room`)
                selectEl.value = chooseRoom?.id
            }
        }
    }

    const handleChooseRoomUpdtConfInfo = () => {
        const selectEl = document.getElementById('chooseRoomUpdtConfInfo')
        const id = selectEl.options[selectEl.selectedIndex].value
        if (id) {
            const findRoom = roomDiseaseType.find(doc => doc.id === id)
            const filterDoctorInCurrentDate = getDoctorsInCurrentDate?.length > 0 ? getDoctorsInCurrentDate.filter(doctor => doctor.room === findRoom?.title) : []
            if (filterDoctorInCurrentDate?.length > 0) {
                const currentPatient = userAppointmentData && patientData ? userAppointmentData.filter(patient =>
                    patient.jenisPenyakit === patientData?.jenisPenyakit &&
                    patient.appointmentDate === patientData?.appointmentDate &&
                    patient.isConfirm?.id &&
                    patient.isConfirm?.roomInfo?.roomName === findRoom?.title &&
                    patient.id !== patientData?.id
                ) : null

                setInputUpdtConfirmInfo({
                    ...inputUpdtConfirmInfo,
                    doctorInfo: {
                        doctorSpecialist: filterDoctorInCurrentDate[0]?.spesialis,
                        nameDoctor: filterDoctorInCurrentDate[0]?.title
                    },
                    roomInfo: {
                        roomName: findRoom?.title
                    },
                    queueNumber: `${currentPatient?.length + 1}`
                })
                setErrMsgInputUpdtConfirmInfo({
                    ...errMsgInputUpdtConfirmInfo,
                    roomName: '',
                    totalQueue: '',
                    nameDoctor: '',
                    doctorSpecialist: '',
                })

                const seletElDoctorOnConfirmInfo = document.getElementById('chooseDoctorsConfInfo')
                if (seletElDoctorOnConfirmInfo) {
                    seletElDoctorOnConfirmInfo.value = filterDoctorInCurrentDate[0]?.id
                }
            } else {
                alert(`Doctor there is no doctor's schedule available in this room`)
                const findPrevRoom = roomDiseaseType?.length > 0 ? roomDiseaseType.find(room => room.title === inputUpdtConfirmInfo?.roomInfo?.roomName) : {}
                selectEl.value = findPrevRoom?.id
            }
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
                nameAdmin: user?.name,
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

    const handleChangeConfToLoket = (e) => {
        setInputConfToLoket({
            ...inputConfToLoket,
            [e.target.name]: e.target.value
        })

        if (Object.keys(errMsgConfToLoket).length > 0) {
            setErrMsgConfToLoket({
                ...errMsgConfToLoket,
                [e.target.name]: ''
            })
        }
    }

    const handleSubmitConfToLoket = () => {
        if (loadingSubmitConfToLoket === false && loadingSubmitUpdtConfirmInfo === false) {
            validateFormConfToLoket()
                .then(res => {
                    if (window.confirm('Confirm at the counter?')) {
                        setLoadingSubmitConfToLoket(true)
                        pushToPostConfToLoket()
                    }
                })
                .catch(err => console.log(err))
        }
    }

    const validateFormConfToLoket = async () => {
        let err = {}

        if (!inputConfToLoket.message.trim()) {
            err.message = 'Must be required!'
        }

        return await new Promise((resolve, reject) => {
            if (Object.keys(err).length === 0) {
                resolve({ message: 'success' })
            } else {
                setErrMsgConfToLoket(err)
                reject({ message: 'error' })
            }
        })
    }

    const pushToPostConfToLoket = () => {
        const { id, jenisPenyakit, patientName, emailAddress, phone } = patientData
        const data = {
            id: `${new Date().getTime()}`,
            loketRules: 'patient-queue',
            loketName: infoLoket?.loketName,
            patientId: id,
            jenisPenyakit: jenisPenyakit,
            patientName: patientName,
            patientEmail: emailAddress,
            phone: phone,
            queueNumber: infoLoket?.totalQueue + 1,
            message: inputConfToLoket.message,
            emailAdmin: user?.email,
            presence: 'menunggu',
            isConfirm: {
                confirmState: false
            }
        }

        updatePresencePatient((response) => {
            if (response?.data) {
                API.APIPostLoket(data)
                    .then(res => {
                        if (findCurrentPatientFinishTreatment?.id) {
                            deleteFinishedTreatment(() => {
                                alert('successful confirmation to the counter')
                                setLoadingSubmitConfToLoket(false)

                                setTimeout(() => {
                                    router.push(`${router.asPath}/counter/${data.loketName}/not-yet-confirmed/${data.queueNumber}`)
                                }, 0)
                            }, (err) => {
                                alert('Oops, telah terjadi kesalahan server\nMohon coba beberapa saat lagi')
                                console.log(err)
                                setLoadingSubmitConfToLoket(false)
                            })
                        } else {
                            alert('successful confirmation to the counter')
                            setLoadingSubmitConfToLoket(false)

                            setTimeout(() => {
                                router.push(`${router.asPath}/counter/${data.loketName}/not-yet-confirmed/${data.queueNumber}`)
                            }, 0)
                        }
                    })
                    .catch(err => {
                        alert('Oops, telah terjadi kesalahan server\nMohon coba beberapa saat lagi')
                        console.log(err)
                        setLoadingSubmitConfToLoket(false)
                    })
            } else {
                alert('Oops, telah terjadi kesalahan server\nMohon coba beberapa saat lagi')
                console.log(response)
                setLoadingSubmitConfToLoket(false)
            }
        }, (err) => {
            alert('Oops, telah terjadi kesalahan server\nMohon coba beberapa saat lagi')
            console.log(err)
            setLoadingSubmitConfToLoket(false)
        }, 'hadir')

    }

    const updatePresencePatient = (sc, error, value) => {
        const data = {
            presence: value
        }
        API.APIPutPresence(bookAnAppointment?._id, patientData?.id, data)
            .then(res => {
                sc(res)
            })
            .catch(err => {
                error(err)
            })
    }

    const deleteFinishedTreatment = (success, error) => {
        API.APIDeleteFinishedTreatment(findCurrentPatientFinishTreatment?._id)
            .then(res => success(res))
            .catch(err => error(err))
    }

    const handleSelectCounter = () => {
        const selectEl = document.getElementById('selectCounter')
        const id = selectEl.options[selectEl.selectedIndex].value
        if (id) {
            const findPatientInLoket = getPatientQueue.filter(patient => patient.loketName === id && patient?.isConfirm?.confirmState === false)
            const findPatientToday = getPatientQueue.filter(patient => patient.loketName === id && patient?.isConfirm?.confirmState && patient?.isConfirm?.dateConfirm === currentDate)
            setInfoLoket({
                id: 'patient-queue',
                loketName: id,
                totalQueue: findPatientInLoket?.length + findPatientToday?.length
            })
        }
    }

    const handleSelectPaymentMethod = () => {
        const selectEl = document.getElementById('selectPaymentMethod')
        const id = selectEl.options[selectEl.selectedIndex].value
        if (id) {
            setInputConfFinishTreatment({
                ...inputConfFinishTreatment,
                paymentMethod: id,
            })
        }
    }

    const changeCalendar = (date, prop) => {
        const newDate = date?.toString()?.split(' ')
        if (newDate) {
            const getMonth = monthNames.findIndex(month => month === newDate[1]) + 1
            const month = getMonth.toString().length === 1 ? `0${getMonth}` : getMonth
            const getDate = newDate[2]
            const getYear = newDate[3]
            const isDate = `${month}/${getDate}/${getYear}`
            setValueInputEdit({
                ...valueInputEdit,
                [prop]: isDate
            })
        }
    }

    const handlePopupEditConfirmInfo = () => {
        setOnPopupEditConfirm(!onPopupEditConfirm)
    }

    const handleChangeUpdtConfirmInfo = (e) => {
        setInputUpdtConfirmInfo({
            ...inputUpdtConfirmInfo,
            [e.target.name]: e.target.value
        })

        if (Object.keys(errMsgInputUpdtConfirmInfo).length > 0) {
            setErrMsgInputUpdtConfirmInfo({
                ...errMsgInputUpdtConfirmInfo,
                [e.target.name]: ''
            })
        }
    }

    const handleSubmitUpdtConfirmInfo = () => {
        if (loadingSubmitUpdtConfirmInfo === false) {
            validateFormIsUpdtConfInfo()
                .then(result => {
                    validateFormUpdtConfInfo()
                        .then(res => {
                            if (window.confirm('update confirmation information?')) {
                                setLoadingSubmitUpdtConfirmInfo(true)
                                updateIsConfirm(inputUpdtConfirmInfo, () => {
                                    alert('confirmation information updated successfully')
                                    setLoadingSubmitUpdtConfirmInfo(false)
                                }, (err) => {
                                    alert('Oops, telah terjadi kesalahan server\nMohon coba beberapa saat lagi')
                                    console.log(err)
                                    setLoadingSubmitUpdtConfirmInfo(false)
                                })
                            }
                        })
                        .catch(err => console.log(err))
                })
                .catch(err => console.log(err))
        }
    }

    const validateFormUpdtConfInfo = async () => {
        let err = {}

        if (!inputUpdtConfirmInfo.treatmentHours.trim()) {
            err.treatmentHours = 'Must be required!'
        }
        if (!inputUpdtConfirmInfo.doctorInfo.nameDoctor.trim()) {
            err.nameDoctor = 'Must be required!'
        }
        if (!inputUpdtConfirmInfo.doctorInfo.doctorSpecialist.trim()) {
            err.doctorSpecialist = 'Must be required!'
        }
        if (!inputUpdtConfirmInfo.roomInfo.roomName.trim()) {
            err.roomName = 'Must be required!'
        }
        if (patientOfCurrentDiseaseTForUpdtConfInfo === null) {
            err.totalQueue = 'Must be required!'
        }

        return await new Promise((resolve, reject) => {
            if (Object.keys(err).length === 0) {
                resolve({ message: 'success' })
            } else {
                reject({ message: 'error' })
                setErrMsgInputUpdtConfirmInfo(err)
            }
        })
    }

    const validateFormIsUpdtConfInfo = async () => {
        let err = {}

        if (inputUpdtConfirmInfo.treatmentHours === patientData?.isConfirm?.treatmentHours) {
            err.treatmentHours = 'it is the same'
        }
        if (inputUpdtConfirmInfo.doctorInfo.nameDoctor === patientData?.isConfirm?.doctorInfo?.nameDoctor) {
            err.nameDoctor = 'it is the same'
        }
        if (inputUpdtConfirmInfo.doctorInfo.doctorSpecialist === patientData?.isConfirm?.doctorInfo?.doctorSpecialist) {
            err.doctorSpecialist = 'it is the same'
        }
        if (inputUpdtConfirmInfo.roomInfo.roomName === patientData?.isConfirm?.roomInfo?.roomName) {
            err.roomName = 'it is the same'
        }

        return await new Promise((resolve, reject) => {
            if (Object.keys(err).length !== 4) {
                resolve({ message: 'can update' })
            } else {
                reject({ message: `can't update conf info` })
            }
        })
    }

    const clickPresenceConfInfo = (status) => {
        if (loadingSubmitUpdtConfirmInfo === false && loadingSubmitConfToLoket === false && inputUpdtConfirmInfo.id.length > 0 && window.confirm(`pasien ${status}?`)) {
            setLoadingSubmitUpdtConfirmInfo(true)

            updatePresencePatient(() => {
                if (status === 'tidak hadir') {
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

                    const dataFinishTreatment = {
                        id: `${new Date().getTime()}`,
                        rulesTreatment: 'patient-registration',
                        patientId: patientData?.id,
                        patientName: patientData?.patientName,
                        patientEmail: patientData?.emailAddress,
                        phone: patientData?.phone,
                        confirmedTime: {
                            confirmHour: confirmHour,
                            dateConfirm: dateConfirm
                        },
                        adminInfo: {
                            emailAdmin: user?.email,
                            nameAdmin: user?.name
                        }
                    }
                    postToPatientFinishTreatment(dataFinishTreatment, () => {
                        alert('confirmation information updated successfully')
                        setLoadingSubmitUpdtConfirmInfo(false)
                    }, (err) => {
                        alert('Oops, telah terjadi kesalahan server!\nMohon coba beberapa saat lagi')
                        console.log(err)
                        setLoadingSubmitUpdtConfirmInfo(false)
                    })
                } else if (status === 'hadir') {
                    alert('confirmation information updated successfully')
                    setLoadingSubmitUpdtConfirmInfo(false)
                }
            }, (err) => {
                alert('Oops, telah terjadi kesalahan server!\nMohon coba beberapa saat lagi')
                console.log(err)
                setLoadingSubmitUpdtConfirmInfo(false)
            }, status)
        }
    }

    const onChangeFormConfFinishTreatment = (e) => {
        setInputConfFinishTreatment({
            ...inputConfFinishTreatment,
            [e.target.name]: e.target.value
        })

        if (Object.keys(errSubmitConfFinishTreatment).length > 0) {
            setErrSubmitConfFinishTreatment({
                ...errSubmitConfFinishTreatment,
                [e.target.name]: ''
            })
        }
    }

    const submitConfFinishTreatment = () => {
        if (loadingConfFinishTreatment === false) {
            validateFinishTreatment()
                .then(res => {
                    if (window.confirm('Finished treatment?')) {
                        setLoadingConfFinishTreatment(true)
                        pushToConfFinishTreatment()
                    }
                })
                .catch(err => console.log(err))
        }
    }

    const validateFinishTreatment = async () => {
        let err = {}

        if (!inputConfFinishTreatment.paymentMethod.trim()) {
            err.paymentMethod = 'Must be required!'
        }
        if (inputConfFinishTreatment.paymentMethod.toLowerCase().includes('bpjs') && !inputConfFinishTreatment.bpjsNumber.trim()) {
            err.bpjsNumber = 'Must be required!'
        }
        if (!inputConfFinishTreatment.paymentMethod.toLowerCase().includes('bpjs') && !inputConfFinishTreatment.totalCost.trim()) {
            err.totalCost = 'Must be required!'
        }

        return await new Promise((resolve, reject) => {
            if (Object.keys(err).length === 0) {
                resolve({ message: 'success' })
            } else {
                reject({ message: `can't submit form confirm finished treatment` })
                setErrSubmitConfFinishTreatment(err)
            }
        })
    }

    const pushToConfFinishTreatment = () => {
        const { paymentMethod, bpjsNumber, totalCost } = inputConfFinishTreatment

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

        const data = {
            id: `${new Date().getTime()}`,
            dateConfirm,
            confirmHour,
            emailAdmin: user?.email,
            nameAdmin: user?.name,
            confirmState: true,
            paymentInfo: {
                paymentMethod,
                bpjsNumber,
                totalCost: inputConfFinishTreatment.paymentMethod.toLowerCase().includes('bpjs') ? '-' : totalCost
            }
        }

        const dataFinishTreatment = {
            id: `${new Date().getTime()}`,
            rulesTreatment: 'patient-registration',
            patientId: findPatientInLoket?.patientId,
            patientName: findPatientInLoket?.patientName,
            patientEmail: patientData?.emailAddress,
            phone: findPatientInLoket?.phone,
            confirmedTime: {
                confirmHour: data.confirmHour,
                dateConfirm: data.dateConfirm
            },
            adminInfo: {
                emailAdmin: data.emailAdmin,
                nameAdmin: data.nameAdmin
            }
        }

        API.APIPutPatientQueueInCounter(findPatientInLoket?._id, data)
            .then(res => {
                postToPatientFinishTreatment(dataFinishTreatment, () => {
                    updatePatientPresenceInCounter('hadir', () => {
                        alert('Successful confirmation')
                        setLoadingConfFinishTreatment(false)

                        const [p1, p2, p3, p4, p5, p6, p7, p8, p9] = params

                        setTimeout(() => {
                            router.push(`/patient/patient-registration/${p1}/${p2}/${p3}/${p4}/${p5}/${p6}/${p7}/confirmed/${p9}`)
                        }, 0);
                    }, (err) => {
                        alert('Oops, telah terjadi kesalahan server!\nMohon coba beberapa saat lagi')
                        console.log(err)
                        setLoadingConfFinishTreatment(false)
                    })
                }, (err) => {
                    alert('Oops, telah terjadi kesalahan server!\nMohon coba beberapa saat lagi')
                    console.log(err)
                    setLoadingConfFinishTreatment(false)
                })
            })
            .catch(err => {
                alert('Oops, telah terjadi kesalahan server!\nMohon coba beberapa saat lagi')
                console.log(err)
                setLoadingConfFinishTreatment(false)
            })
    }

    const clickPatientNotPresentInCounter = () => {
        if (loadingConfFinishTreatment === false && window.confirm('pasien tidak hadir?')) {
            setLoadingConfFinishTreatment(true)
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


            updatePatientPresenceInCounter('tidak hadir', () => {
                const data = {
                    id: `${new Date().getTime()}`,
                    dateConfirm,
                    confirmHour,
                    emailAdmin: user?.email,
                    nameAdmin: user?.name,
                    confirmState: true,
                    paymentInfo: {
                        paymentMethod: '-',
                        bpjsNumber: '-',
                        totalCost: '-'
                    }
                }

                API.APIPutPatientQueueInCounter(findPatientInLoket?._id, data)
                    .then(res => {
                        const dataFinishTreatment = {
                            id: `${new Date().getTime()}`,
                            rulesTreatment: 'patient-registration',
                            patientId: patientData?.id,
                            patientName: patientData?.patientName,
                            patientEmail: patientData?.emailAddress,
                            phone: patientData?.phone,
                            confirmedTime: {
                                confirmHour: confirmHour,
                                dateConfirm: dateConfirm
                            },
                            adminInfo: {
                                emailAdmin: user?.email,
                                nameAdmin: user?.name
                            }
                        }
                        postToPatientFinishTreatment(dataFinishTreatment, () => {
                            alert('confirmed successfully')
                            setLoadingConfFinishTreatment(false)

                            const [p1, p2, p3, p4, p5, p6, p7, p8, p9] = params

                            setTimeout(() => {
                                router.push(`/patient/patient-registration/${p1}/${p2}/${p3}/${p4}/${p5}/${p6}/${p7}/confirmed/${p9}`)
                            }, 0);
                        }, (err) => {
                            alert('Oops, telah terjadi kesalahan server\nMohon coba beberapa saat lagi')
                            console.log(err)
                            setLoadingConfFinishTreatment(false)
                        })
                    })
                    .catch(err => {
                        alert('Oops, telah terjadi kesalahan server\nMohon coba beberapa saat lagi')
                        console.log(err)
                        setLoadingConfFinishTreatment(false)
                    })
            }, (err) => {
                alert('Oops, telah terjadi kesalahan server\nMohon coba beberapa saat lagi')
                console.log(err)
                setLoadingConfFinishTreatment(false)
            })
        }
    }

    const updatePatientPresenceInCounter = (value, success, error) => {
        const data = {
            presence: value
        }
        API.APIPutPatientPresenceInCounter(findPatientInLoket?._id, data)
            .then(res => success())
            .catch(err => error(err))
    }

    const postToPatientFinishTreatment = (data, success, error) => {
        API.APIPostPatientFinishTreatment(data)
            .then(res => success())
            .catch(err => error(err))
    }

    if (params.length === 5 || params.length === 9) {
        return (
            <>
                <Head>
                    <title>{patientData?.patientName} | Patient Registration | Admin Hospice Medical</title>
                    <meta name="description" content="data pendaftaran personal pasien hospice medical" />
                </Head>

                {/* Pop up edit patient information */}
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
                    {/* select doctor */}
                    <SelectCategory
                        styleWrapp={{
                            margin: '0px 0'
                        }}
                        styleTitle={{
                            fontSize: '13px'
                        }}
                        titleCtg="Choose a Doctor"
                        idSelect="chooseDoctorEditPatientInfo"
                        handleCategory={handleChooseDoctorUpdtPatientInfo}
                        dataBlogCategory={findCurrentSpecialist}
                    />
                    <Input
                        {...propsInputEdit}
                        {...propsErrMsg}
                        type='text'
                        nameInput='doctorName'
                        valueInput={chooseDoctorUpdtInfoPatient?.title}
                        title='Doctor Name'
                        readOnly={true}
                        changeInput={handleChangeEditPR}
                    />
                    {/* select day doctor schedule */}
                    <SelectCategory
                        styleWrapp={{
                            margin: '0px 0'
                        }}
                        styleTitle={{
                            fontSize: '13px'
                        }}
                        titleCtg="Select Day"
                        idSelect="selectDayUpdtPatientInfo"
                        handleCategory={handleChooseDayOfDoctorSchedule}
                        dataBlogCategory={dataDayOfDoctors}
                    />
                    <Input
                        {...propsInputEdit}
                        {...propsErrMsg}
                        type='text'
                        nameInput='dayDoctor'
                        valueInput={chooseDayOfDoctorOnUpdtInfoPatient?.title}
                        title='Day'
                        readOnly={true}
                        changeInput={handleChangeEditPR}
                    />
                    {chooseDayOfDoctorOnUpdtInfoPatient?.id && (
                        <Input
                            {...styleStarInputEdit}
                            styleTitle={{
                                display: 'flex'
                            }}
                            styleInputText={{
                                display: 'none'
                            }}
                            {...propsErrMsg}
                            onCalendar={true}
                            minDate={new Date(`${servicingHours?.minDate}-${new Date().getDate()}`)}
                            maxDate={addMonths(new Date(`${servicingHours?.maxDate}`), 0)}
                            selected={new Date(valueInputEdit.appointmentDate)}
                            filterDate={isWeekday}
                            changeCalendar={(date) => changeCalendar(date, 'appointmentDate')}
                            title='Appointment Date'
                            errorMessage={errorMsgSubmit?.appointmentDate}
                        />
                    )}
                    <Input
                        {...propsInputEdit}
                        {...propsErrMsg}
                        type='text'
                        nameInput='submissionDate'
                        valueInput={valueInputEdit.submissionDate}
                        title='Submission Date'
                        changeInput={handleChangeEditPR}
                        readOnly={true}
                        errorMessage={errorMsgSubmit?.submissionDate}
                    />
                    <Input
                        {...styleStarInputEdit}
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
                        {...styleStarInputEdit}
                        styleTitle={{
                            display: 'flex'
                        }}
                        styleInputText={{
                            display: 'none'
                        }}
                        {...propsErrMsg}
                        type='text'
                        onCalendar={true}
                        selected={new Date(valueInputEdit.dateOfBirth)}
                        changeCalendar={(date) => changeCalendar(date, 'dateOfBirth')}
                        // nameInput='dateOfBirth'
                        // valueInput={valueInputEdit.dateOfBirth}
                        title='Date of Birth'
                        // changeInput={handleChangeEditPR}
                        errorMessage={errorMsgSubmit?.dateOfBirth}
                        renderCustomHeader={({
                            date,
                            changeYear,
                            changeMonth,
                            decreaseMonth,
                            increaseMonth,
                            prevMonthButtonDisabled,
                            nextMonthButtonDisabled,
                        }) => (
                            <div
                                style={{
                                    margin: 10,
                                    display: "flex",
                                    justifyContent: "center",
                                }}
                            >
                                <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled} style={{
                                    width: '30px',
                                }}>
                                    {"<"}
                                </button>
                                <select
                                    value={getYear(date)}
                                    onChange={({ target: { value } }) => changeYear(value)}
                                >
                                    {yearsCalendar.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={monthsCalendar[getMonth(date)]}
                                    onChange={({ target: { value } }) =>
                                        changeMonth(monthsCalendar.indexOf(value))
                                    }
                                >
                                    {monthsCalendar.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>

                                <button onClick={increaseMonth} disabled={nextMonthButtonDisabled} style={{
                                    width: '30px',
                                }}>
                                    {">"}
                                </button>
                            </div>
                        )}
                    />
                    <Input
                        {...styleStarInputEdit}
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

                {/* popup edit confirm admin info */}
                <WrappEditPR
                    clickWrapp={handlePopupEditConfirmInfo}
                    clickClose={handlePopupEditConfirmInfo}
                    styleWrapp={{
                        display: onPopupEditConfirm ? 'flex' : 'none'
                    }}>
                    <h1 className={style['patient-name']}>
                        <span className={style['desc-title']}>
                            Info Confirmation Patient of
                        </span>
                        <span className={style['name']}>
                            {patientData?.patientName}
                        </span>
                    </h1>
                    <Input
                        {...styleStarInputEdit}
                        {...propsInputEdit}
                        {...propsErrMsg}
                        type='text'
                        nameInput='treatmentHours'
                        valueInput={inputUpdtConfirmInfo.treatmentHours}
                        title='Treatment Hours'
                        changeInput={handleChangeUpdtConfirmInfo}
                        errorMessage={errMsgInputUpdtConfirmInfo?.treatmentHours}
                    />
                    {/* select doctor */}
                    <SelectCategory
                        styleWrapp={{
                            margin: '0px 0'
                        }}
                        styleTitle={{
                            fontSize: '13px'
                        }}
                        titleCtg="Choose a Doctor"
                        idSelect="chooseDoctorsConfInfo"
                        handleCategory={handleChooseDoctorsUpdtInfoConfirm}
                        dataBlogCategory={findCurrentSpecialist}
                    />
                    <Input
                        {...styleStarInputEdit}
                        {...propsInputEdit}
                        {...propsErrMsg}
                        type='text'
                        nameInput='nameDoctor'
                        valueInput={inputUpdtConfirmInfo.doctorInfo.nameDoctor}
                        title='Doctor Name'
                        changeInput={handleChangeUpdtConfirmInfo}
                        readOnly={true}
                        errorMessage={errMsgInputUpdtConfirmInfo?.nameDoctor}
                    />
                    <Input
                        {...styleStarInputEdit}
                        {...propsInputEdit}
                        {...propsErrMsg}
                        type='text'
                        nameInput='doctorSpesialist'
                        valueInput={inputUpdtConfirmInfo.doctorInfo.doctorSpecialist}
                        title='Doctor Specialist'
                        changeInput={handleChangeUpdtConfirmInfo}
                        readOnly={true}
                        errorMessage={errMsgInputUpdtConfirmInfo?.doctorSpecialist}
                    />
                    {/* select room */}
                    <SelectCategory
                        idSelect="chooseRoomUpdtConfInfo"
                        styleWrapp={{
                            margin: '0px 0'
                        }}
                        styleTitle={{
                            fontSize: '13px'
                        }}
                        titleCtg="Choose a Room"
                        handleCategory={handleChooseRoomUpdtConfInfo}
                        dataBlogCategory={roomDiseaseType}
                    />
                    <Input
                        {...styleStarInputEdit}
                        {...propsInputEdit}
                        {...propsErrMsg}
                        type='text'
                        nameInput='roomName'
                        placeholder='room name...'
                        valueInput={inputUpdtConfirmInfo.roomInfo.roomName}
                        title='Room Name'
                        readOnly={true}
                        errorMessage={errMsgInputUpdtConfirmInfo?.roomName}
                    />
                    <Input
                        {...styleStarInputEdit}
                        {...propsInputEdit}
                        {...propsErrMsg}
                        type='text'
                        nameInput='totalPatients'
                        placeholder='total patient...'
                        valueInput={patientOfCurrentDiseaseTForUpdtConfInfo?.length}
                        title='Total Number of Patients in this Room'
                        readOnly={true}
                        errorMessage={errMsgInputUpdtConfirmInfo?.totalQueue}
                    />
                    <Button
                        name='UPDATE'
                        style={{
                            margin: '5px 0 0 0'
                        }}
                        click={handleSubmitUpdtConfirmInfo}
                        styleLoading={{
                            display: loadingSubmitUpdtConfirmInfo ? 'flex' : 'none'
                        }}
                    />
                </WrappEditPR>

                <div className={onNavLeft ? `${style['wrapp']} ${style['wrapp-active']}` : style['wrapp']}>
                    <div className={style['container']}>
                        <div className={style['content']}>
                            <div className={style['head-content']}>
                                <h1 className={style['title']}>
                                    <span className={style['patient-of']}>Patient of</span>
                                    <span className={style['name']}>
                                        {patientData?.patientName}
                                    </span>
                                </h1>

                                {findCurrentPatientFinishTreatment?.id && (
                                    <h1 className={style['title']} style={{
                                        fontSize: '26px',
                                        marginTop: '30px'
                                    }}>
                                        <span className={style['patient-of']} style={{
                                            color: '#0ab110'
                                        }}>
                                            <i className="fa-solid fa-check-to-slot"></i>
                                        </span>
                                        <span className={style['name']} style={{
                                            color: '#0ab110'
                                        }}>
                                            Have Finished Treatment
                                        </span>
                                    </h1>
                                )}
                            </div>

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
                                                <div className={style['loading-circle']} style={{
                                                    display: loadingSubmit || loadingSubmitUpdtConfirmInfo ? 'flex' : 'none'
                                                }}></div>

                                                <i className="fa-solid fa-pencil" style={{
                                                    display: loadingSubmit || loadingSubmitUpdtConfirmInfo ? 'none' : 'flex'
                                                }}></i>
                                            </button>
                                            <button className={`${style['edit']} ${style['delete']}`}
                                                onClick={clickDeletePersonalDataRegis}>
                                                <div className={style['loading-circle']} style={{
                                                    display: loadingSubmit || loadingSubmitUpdtConfirmInfo ? 'flex' : 'none'
                                                }}>

                                                </div>
                                                <i className="fa-solid fa-trash" style={{
                                                    display: loadingSubmit || loadingSubmitUpdtConfirmInfo ? 'none' : 'flex'
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
                                                <div className={`${style['data-conf-patients']} ${style['confirm-data-group']}`}>
                                                    <h1 className={style['title']}>
                                                        Confirmation Data Information
                                                    </h1>

                                                    {/* button action */}
                                                    <div className={style['btn-action']} style={{
                                                        width: '100%',
                                                        margin: '20px 0 10px 0'
                                                    }}>
                                                        <button className={style['edit']}
                                                            onClick={handlePopupEditConfirmInfo}
                                                        >
                                                            <div className={style['loading-circle']} style={{
                                                                display: loadingSubmit || loadingSubmitUpdtConfirmInfo ? 'flex' : 'none'
                                                            }}>

                                                            </div>
                                                            <i className="fa-solid fa-pencil" style={{
                                                                display: loadingSubmit || loadingSubmitUpdtConfirmInfo ? 'none' : 'flex'
                                                            }}></i>
                                                        </button>
                                                    </div>

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
                                                    >
                                                        <div className={style['update-absent']}>
                                                            {/* <Button
                                                                name="HADIR"
                                                                click={() => clickPresenceConfInfo('hadir')}
                                                                style={{
                                                                    padding: '8px 20px',
                                                                    fontSize: '10.5px',
                                                                    marginRight: '10px',
                                                                    marginTop: '10px'
                                                                }}
                                                            /> */}
                                                            {/* <Button
                                                                name="TIDAK HADIR"
                                                                classBtn="not-present-btn"
                                                                click={() => clickPresenceConfInfo('tidak hadir')}
                                                                style={{
                                                                    padding: '8px 20px',
                                                                    fontSize: '10.5px',
                                                                    marginTop: '10px'
                                                                }}
                                                            /> */}
                                                        </div>
                                                    </CardPatientRegisData>
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
                                                    <h1 className={style['title']} style={{
                                                        marginTop: '30px'
                                                    }}>
                                                        Confirmation Admin Information
                                                    </h1>
                                                    <CardPatientRegisData
                                                        title="Admin Email"
                                                        desc={patientData?.isConfirm?.emailAdmin}
                                                        styleWrapp={{
                                                            margin: '20px 0'
                                                        }}
                                                    />
                                                    <CardPatientRegisData
                                                        title="Admin Name"
                                                        desc={patientData?.isConfirm?.nameAdmin}
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {/* form confirm to take medicine */}
                                        {patientData?.isConfirm?.id && !findPatientInLoket?.id && (
                                            <>
                                                <div className={`${style['form-conf-take-medic']} ${style['confirm-data-group']}`} style={{
                                                    margin: '20px 0'
                                                }}>
                                                    <h1 className={style['title']} style={{
                                                        margin: '0 10px'
                                                    }}>
                                                        Form Confirm to Take Medicine
                                                    </h1>

                                                    <CardPatientRegisData
                                                        styleTitle={{
                                                            display: 'none',
                                                        }}
                                                        styleWrappDesc={{
                                                            display: 'none'
                                                        }}
                                                        styleWrapp={{
                                                            width: '100%',
                                                            margin: '20px 10px 0 10px'
                                                        }}
                                                    >
                                                        <Input
                                                            {...propsInputEdit}
                                                            {...propsErrMsg}
                                                            styleInputText={{
                                                                display: 'none'
                                                            }}
                                                            styleTxtArea={{
                                                                display: 'flex'
                                                            }}
                                                            type='text'
                                                            nameTxtArea='message'
                                                            placeholderTxtArea={`Doctor's Prescription...`}
                                                            valueTxtArea={inputConfToLoket.message}
                                                            title={`Doctor's Prescription`}
                                                            changeTxtArea={handleChangeConfToLoket}
                                                            errorMessage={errMsgConfToLoket?.message}
                                                        />
                                                    </CardPatientRegisData>
                                                    {/* select loket */}
                                                    <CardPatientRegisData
                                                        styleTitle={{
                                                            display: 'none',
                                                        }}
                                                        styleWrappDesc={{
                                                            display: 'none'
                                                        }}
                                                        styleWrapp={{
                                                            margin: '0px 10px 20px 10px'
                                                        }}
                                                    >
                                                        <SelectCategory
                                                            styleWrapp={{
                                                                margin: '0px 0'
                                                            }}
                                                            styleTitle={{
                                                                fontSize: '13px'
                                                            }}
                                                            titleCtg="Select Counter"
                                                            idSelect="selectCounter"
                                                            handleCategory={handleSelectCounter}
                                                            dataBlogCategory={newLoket}
                                                        />
                                                    </CardPatientRegisData>
                                                    <CardPatientRegisData
                                                        title="Total Queue"
                                                        desc={infoLoket?.totalQueue}
                                                        styleWrapp={{
                                                            margin: '20px 10px 20px 10px'
                                                        }}
                                                    />
                                                    <Button
                                                        name="CONFIRM AT THE COUNTER"
                                                        style={{
                                                            widh: 'auto',
                                                            margin: findCurrentPatientFinishTreatment?.id ? '0 auto' : '20px 0 0 0'
                                                        }}
                                                        click={handleSubmitConfToLoket}
                                                        styleLoading={{
                                                            display: loadingSubmitConfToLoket || loadingSubmitUpdtConfirmInfo ? 'flex' : 'none'
                                                        }}
                                                    />
                                                    {!findCurrentPatientFinishTreatment?.id && (
                                                        <Button
                                                            name="PATIENT NOT PRESENT"
                                                            classBtn="not-present-btn"
                                                            style={{
                                                                widh: 'auto',
                                                                margin: '20px 0 0 0'
                                                            }}
                                                            click={() => clickPresenceConfInfo('tidak hadir')}
                                                            styleLoading={{
                                                                display: loadingSubmitConfToLoket || loadingSubmitUpdtConfirmInfo ? 'flex' : 'none',
                                                                backgroundColor: '#ff296d'
                                                            }}
                                                            styleLoadCircle={{
                                                                borderTopColor: '#ff296d'
                                                            }}
                                                        />
                                                    )}
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
                                                    <div className={style['input']} style={{
                                                        width: '100%'
                                                    }}>
                                                        <Input
                                                            {...propsInputEdit}
                                                            {...propsErrMsg}
                                                            type='text'
                                                            nameInput='appointedDay'
                                                            placeholder='Appointed Day...'
                                                            valueInput={`${dataServicingHours?.day} (${dataServicingHours?.time})`}
                                                            title='Appointed Day'
                                                            readOnly={true}
                                                        // errorMessage={errSubmitConfPatient?.roomName}
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

                            {/* info pasien di loket */}
                            {params.length === 9 && (
                                <>
                                    <h1 className={style['title']} style={{
                                        margin: '50px 0 0 0',
                                        fontSize: '28px'
                                    }}>
                                        <span className={style['patient-of']}>Counter From</span>
                                        <span className={style['name']}>
                                            {params[6]}
                                        </span>
                                    </h1>

                                    <div className={style['white-content']}>
                                        {/* confirm info */}
                                        <div className={style['confirm-info']}>
                                            {findPatientInLoket?.isConfirm?.confirmState && (
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
                                            {!findPatientInLoket?.isConfirm?.confirmState && (
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
                                            Information Counter
                                        </h1>

                                        {/* data info patient in the counter*/}
                                        {findPatientInLoket ? (
                                            <>
                                                <div className={style['data']}>
                                                    <CardPatientRegisData
                                                        title="Queue Number"
                                                        desc={findPatientInLoket.queueNumber}
                                                        styleIcon={{
                                                            display: 'flex'
                                                        }}
                                                        icon='fa-solid fa-id-card'
                                                        styleDesc={{
                                                            color: '#288bbc',
                                                        }}
                                                    />
                                                    <CardPatientRegisData
                                                        title="Patient Name"
                                                        desc={findPatientInLoket.patientName}
                                                    />
                                                    <CardPatientRegisData
                                                        title="Presence State"
                                                        desc={findPatientInLoket.presence?.toUpperCase()}
                                                        styleDesc={{
                                                            color: '#f85084',
                                                            fontWeight: 'bold'
                                                        }}
                                                    />
                                                    <CardPatientRegisData
                                                        title="Doctor's Prescription"
                                                        desc={findPatientInLoket.message}
                                                    />
                                                    <CardPatientRegisData
                                                        title="Disease Type"
                                                        desc={patientData?.jenisPenyakit}
                                                    />
                                                    <CardPatientRegisData
                                                        title="Counter Name"
                                                        desc={findPatientInLoket.loketName}
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            <></>
                                        )}

                                        {/* form confirm patient in the counter */}
                                        {!findPatientInLoket?.isConfirm?.confirmState && (
                                            <>
                                                <div className={`${style['form-conf-take-medic']} ${style['confirm-data-group']}`} style={{
                                                    margin: '20px 0'
                                                }}>
                                                    <h1 className={style['title']} style={{
                                                        margin: '0 10px'
                                                    }}>
                                                        Form Confirmation
                                                    </h1>

                                                    {/* select loket */}
                                                    <CardPatientRegisData
                                                        styleTitle={{
                                                            display: 'none',
                                                        }}
                                                        styleWrappDesc={{
                                                            display: 'none'
                                                        }}
                                                        styleWrapp={{
                                                            width: '100%',
                                                            margin: '0px 10px 0px 10px'
                                                        }}
                                                    >
                                                        <SelectCategory
                                                            styleWrapp={{
                                                                margin: '0px 0'
                                                            }}
                                                            styleTitle={{
                                                                fontSize: '13px'
                                                            }}
                                                            titleCtg="Select Payment Method"
                                                            idSelect="selectPaymentMethod"
                                                            handleCategory={handleSelectPaymentMethod}
                                                            dataBlogCategory={paymentMethod}
                                                        />
                                                    </CardPatientRegisData>

                                                    <CardPatientRegisData
                                                        styleTitle={{
                                                            display: 'none',
                                                        }}
                                                        styleWrappDesc={{
                                                            display: 'none'
                                                        }}
                                                        styleWrapp={{
                                                            margin: '20px 10px 0 10px'
                                                        }}
                                                    >
                                                        <Input
                                                            {...propsInputEdit}
                                                            {...propsErrMsg}
                                                            type='text'
                                                            nameInput='paymentMethod'
                                                            placeholder='Payment Method...'
                                                            valueInput={inputConfFinishTreatment.paymentMethod}
                                                            title='Payment Method'
                                                            readOnly={true}
                                                            // changeInput={handleChangeInputConfirm}
                                                            errorMessage={errSubmitConfFinishTreatment?.paymentMethod}
                                                        />
                                                    </CardPatientRegisData>
                                                    {inputConfFinishTreatment.paymentMethod.toLowerCase().includes('bpjs') && (
                                                        <CardPatientRegisData
                                                            styleTitle={{
                                                                display: 'none',
                                                            }}
                                                            styleWrappDesc={{
                                                                display: 'none'
                                                            }}
                                                            styleWrapp={{
                                                                margin: '20px 10px 0 10px'
                                                            }}
                                                        >
                                                            <Input
                                                                {...propsInputEdit}
                                                                {...propsErrMsg}
                                                                type='number'
                                                                nameInput='bpjsNumber'
                                                                placeholder='BPJS Number...'
                                                                valueInput={inputConfFinishTreatment.bpjsNumber}
                                                                title='BPJS Number'
                                                                changeInput={onChangeFormConfFinishTreatment}
                                                                errorMessage={errSubmitConfFinishTreatment?.bpjsNumber}
                                                            />
                                                        </CardPatientRegisData>
                                                    )}
                                                    {!inputConfFinishTreatment.paymentMethod.toLowerCase().includes('bpjs') && (
                                                        <CardPatientRegisData
                                                            styleTitle={{
                                                                display: 'none',
                                                            }}
                                                            styleWrappDesc={{
                                                                display: 'none'
                                                            }}
                                                            styleWrapp={{
                                                                width: inputConfFinishTreatment.paymentMethod.toLowerCase().includes('bpjs') ? '100%' : '45%',
                                                                margin: '20px 10px 0 10px'
                                                            }}
                                                        >
                                                            <Input
                                                                {...propsInputEdit}
                                                                {...propsErrMsg}
                                                                type='number'
                                                                nameInput='totalCost'
                                                                placeholder='Total Cost...'
                                                                valueInput={inputConfFinishTreatment.totalCost}
                                                                title='Total Cost'
                                                                changeInput={onChangeFormConfFinishTreatment}
                                                                errorMessage={errSubmitConfFinishTreatment?.totalCost}
                                                            />
                                                        </CardPatientRegisData>
                                                    )}
                                                    <div className="btn-finish-treatment" style={{
                                                        width: '100%',
                                                        justifyContent: !findCurrentPatientFinishTreatment?.id ? 'flex-start' : 'center'
                                                    }}>
                                                        <Button
                                                            name="FINISHED TREATMENT"
                                                            style={{
                                                                widh: 'auto',
                                                                margin: !findCurrentPatientFinishTreatment?.id ? 'auto 0' : 'auto'
                                                            }}
                                                            click={submitConfFinishTreatment}
                                                            styleLoading={{
                                                                display: loadingConfFinishTreatment ? 'flex' : 'none'
                                                            }}
                                                        />
                                                    </div>
                                                    {!findCurrentPatientFinishTreatment?.id && (
                                                        <div className="btn-not-present" style={{
                                                            display: 'flex',
                                                            width: '100%',
                                                            justifyContent: 'flex-end'
                                                        }}>
                                                            <Button
                                                                name="PATIENT NOT PRESENT"
                                                                classBtn="not-present-btn"
                                                                style={{
                                                                    widh: 'auto',
                                                                    margin: '20px 0 0 0'
                                                                }}
                                                                click={clickPatientNotPresentInCounter}
                                                                styleLoading={{
                                                                    display: loadingConfFinishTreatment ? 'flex' : 'none',
                                                                    backgroundColor: '#ff296d'
                                                                }}
                                                                styleLoadCircle={{
                                                                    borderTopColor: '#ff296d'
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}

                                        {findPatientInLoket?.isConfirm?.confirmState && (
                                            <>
                                                <h1 className={`${style['title']} ${style['patient-confirm-at-the-counter']}`} >
                                                    Confirmation Data Information
                                                </h1>

                                                <div className={style['data']}>
                                                    <CardPatientRegisData
                                                        title="Confirmation hour"
                                                        desc={findPatientInLoket?.isConfirm?.confirmHour}
                                                        styleIcon={{
                                                            display: 'flex'
                                                        }}
                                                        icon='fa-solid fa-clock'
                                                        styleDesc={{
                                                            color: '#f85084',
                                                        }}
                                                    />
                                                    <CardPatientRegisData
                                                        title="Confirmed Date"
                                                        icon="fa-solid fa-calendar-days"
                                                        desc={findPatientInLoket?.isConfirm?.dateConfirm}
                                                        styleIcon={{
                                                            display: 'flex'
                                                        }}
                                                        styleDesc={{
                                                            color: '#288bbc',
                                                        }}
                                                    />
                                                </div>

                                                <h1 className={`${style['title']} ${style['patient-payment-method']} ${style['title-confirm-loket']}`}>
                                                    Payment Info
                                                </h1>

                                                <div className={style['data']}>
                                                    <CardPatientRegisData
                                                        title="Payment Method"
                                                        desc={findPatientInLoket?.isConfirm?.paymentInfo?.paymentMethod}
                                                    />
                                                    <CardPatientRegisData
                                                        title="BPJS Number"
                                                        desc={findPatientInLoket?.isConfirm?.paymentInfo?.bpjsNumber}
                                                        styleWrapp={{
                                                            display: findPatientInLoket?.isConfirm?.paymentInfo?.paymentMethod?.toLowerCase()?.includes('bpjs') ? 'flex' : 'none'
                                                        }}
                                                    />
                                                    {!findPatientInLoket?.isConfirm?.paymentInfo?.paymentMethod?.toLowerCase()?.includes('bpjs') && (
                                                        <CardPatientRegisData
                                                            title="Total Cost"
                                                            desc={`Rp${findPatientInLoket?.isConfirm?.paymentInfo?.totalCost}`}
                                                        />
                                                    )}
                                                </div>

                                                <h1 className={`${style['title']} ${style['confirm-admin-information']} ${style['title-confirm-loket']}`}>
                                                    Confirmation Admin Information
                                                </h1>

                                                <div className={style['data']}>
                                                    <CardPatientRegisData
                                                        title="Admin Email"
                                                        desc={findPatientInLoket?.isConfirm?.emailAdmin}
                                                    />
                                                    <CardPatientRegisData
                                                        title="Admin Name"
                                                        desc={findPatientInLoket?.isConfirm?.nameAdmin}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </>
        )
    } else if (params.length > 0) {
        router.push('/page-not-found')
    }
}

export default PersonalDataRegistration