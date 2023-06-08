import { useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import emailjs from '@emailjs/browser'
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
import monthNamesInd from 'lib/namesOfCalendar/monthNameInd'
import specialCharacter from 'lib/regex/specialCharacter'
import spaceString from 'lib/regex/spaceString'

function PersonalDataRegistration() {
    const [onPopupEdit, setOnPopupEdit] = useState(false)
    const [valueInputEdit, setValueInputEdit] = useState({
        patientComplaints: '',
        appointmentDate: null,
        submissionDate: '',
        patientName: '',
        emailAddress: '',
        dateOfBirth: null,
        phone: ''
    })
    const [urlOrigin, setUrlOrigin] = useState(null)
    const [chooseDoctor, setChooseDoctor] = useState({})
    const [chooseSpecialist, setChooseSpecialist] = useState({ specialist: null })
    const [chooseDayConf, setChooseDayConf] = useState({})
    const [chooseRoom, setChooseRoom] = useState({})
    const [listDoctorOnSpecialist, setListDoctorOnSpecialist] = useState([
        {
            id: 'Choose Doctor',
            title: 'Choose Doctor'
        }
    ])
    const [presenceState, setPresenceState] = useState('MENUNGGU')
    const [loadingSubmit, setLoadingSubmit] = useState(false)
    const [errorMsgSubmit, setErrMsgSubmit] = useState({})
    const [chooseDoctorUpdtInfoPatient, setChooseDoctorUpdtInfoPatient] = useState({})
    const [dataDayOfDoctors, setDataDayOfDoctros] = useState([])
    const [chooseDayOfDoctorOnUpdtInfoPatient, setChooseDayOfDoctorOnUpdtInfoPatient] = useState({ id: 'Choose Day', title: 'Choose Day' })
    const [inputConfirm, setInputConfirm] = useState({
        message: 'Konfirmasi jadwal berobat pasien',
        treatmentHours: '',
    })
    const [errSubmitConfPatient, setErrSubmitConfPatient] = useState({})
    const [loadingSubmitConfPatient, setLoadingSubmitConfPatient] = useState(false)
    const [infoLoket, setInfoLoket] = useState({})
    const [inputConfToLoket, setInputConfToLoket] = useState({
        message: '',
    })
    const [loadingSubmitConfToLoket, setLoadingSubmitConfToLoket] = useState(false)
    const [loadingPatientNotPresentInCalling, setLoadingPatientNotPresentInCalling] = useState(false)
    const [errMsgConfToLoket, setErrMsgConfToLoket] = useState({})
    // state update info confirmation
    const [onPopupEditConfirm, setOnPopupEditConfirm] = useState(false)
    const [errMsgInputUpdtConfirmInfo, setErrMsgInputUpdtConfirmInfo] = useState({})
    const [loadingSubmitUpdtConfirmInfo, setLoadingSubmitUpdtConfirmInfo] = useState(false)
    const [docSpecialistUpdtConf, setDocSpecialistUpdtConf] = useState({
        id: 'Choose Specialist',
        title: 'Choose Specialist'
    })
    const [dayDocScheduleUpdtConf, setDayDocScheduleUpdtConf] = useState({
        id: 'Choose Day',
        title: 'Choose Day'
    })
    const [listDocOnSpecialistUpdtConf, setListDocOnSpecialistUpdtConf] = useState([
        {
            id: 'Choose Doctor',
            title: 'Choose Doctor'
        }
    ])
    const [chooseDocUpdtConf, setChooseDocUpdtConf] = useState({})
    const [inputUpdtConfirmInfo, setInputUpdtConfirmInfo] = useState({
        treatmentHours: '',
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
    const [loadCancelRegisAfterConf, setLoadCancelRegisAfterConf] = useState(false)

    const router = useRouter()
    const { params = [] } = router.query

    // servicing hours
    const { data: dataService, error: errService, isLoading: loadService } = useSwr(endpoint.getServicingHours())
    // for user regis
    const bookAnAppointment = dataService?.data ? dataService.data.find(item => item?.id === 'book-an-appointment') : null
    const userAppointmentData = bookAnAppointment ? bookAnAppointment.userAppointmentData : null
    const findPersonalData = userAppointmentData ? userAppointmentData.find(regis => regis?.id === params[3]) : {}
    const patientData = findPersonalData
    // make a normal date on patient info
    const makeNormalDateOnPatientInfo = (date, dateOfBirth) => {
        const getDate = `${new Date(date)}`
        const findIdxDayNameOfAD = dayNamesEng.findIndex(day => day === getDate.split(' ')[0]?.toLowerCase())
        const getNameOfAD = `${dayNamesInd[findIdxDayNameOfAD]?.substr(0, 1)?.toUpperCase()}${dayNamesInd[findIdxDayNameOfAD]?.substr(1, dayNamesInd[findIdxDayNameOfAD]?.length - 1)}`
        const findIdxMonthOfAD = monthNames.findIndex(month => month.toLowerCase() === getDate.split(' ')[1]?.toLowerCase())
        const getMonthOfAD = monthNamesInd[findIdxMonthOfAD]
        const getDateOfAD = date?.split('/')[1]
        const getYearOfAD = date?.split('/')[2]

        return !dateOfBirth ? `${getMonthOfAD} ${getDateOfAD} ${getYearOfAD}, ${getNameOfAD}` : `${getMonthOfAD} ${getDateOfAD} ${getYearOfAD}`
    }

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
        patient.appointmentDate === patientData?.appointmentDate &&
        patient.isConfirm?.id &&
        patient.isConfirm?.roomInfo?.roomName === chooseDoctor?.room
    ) : null
    // if doctor schedule is it the same with appointment date of patient
    const getTimeOnAppointmentDate = `${new Date(patientData?.appointmentDate)}`
    const findIdxDayOnAD = dayNamesEng.findIndex(day => day === getTimeOnAppointmentDate?.split(' ')[0]?.toLowerCase())
    const dayOnAppointmentDate = dayNamesInd[findIdxDayOnAD]
    const checkCurrentDSOnDayAppointment = dayOnAppointmentDate === chooseDayConf?.title?.toLowerCase()
    // for queue number of patient from update confirmation info
    const patientOfCurrentDiseaseTForUpdtConfInfo = userAppointmentData && patientData ? userAppointmentData.filter(patient =>
        patient.appointmentDate === patientData?.appointmentDate &&
        patient.isConfirm?.id &&
        patient.isConfirm?.roomInfo?.roomName === chooseDocUpdtConf?.room
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
    // load all specialist
    const getAllDoctorSpecialist = () => {
        const newData = [{
            id: 'Choose Specialist',
            title: 'Choose Specialist'
        }]

        if (findOurDoctor?.data?.length > 0) {
            for (let i = 0; i < findOurDoctor?.data?.length; i++) {
                const checkSPecialist = newData.findIndex(item => item.id.toLowerCase() === findOurDoctor?.data[i]?.deskripsi?.toLowerCase())
                if (checkSPecialist === -1) {
                    newData.push({
                        id: findOurDoctor?.data[i]?.deskripsi,
                        title: findOurDoctor?.data[i]?.deskripsi
                    })
                }

            }
        }

        return newData
    }
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
    // find practice hours doctor
    const findPracticeHoursDoc = chooseDoctor?.id ? chooseDoctor?.jadwalDokter?.find(day => day?.toLowerCase()?.includes(chooseDayConf?.title?.toLowerCase())) : null
    const timePracticeHoursDoc = findPracticeHoursDoc ? findPracticeHoursDoc?.split(' ') : null
    const practiceHoursDoc = timePracticeHoursDoc?.length > 0 ? `${timePracticeHoursDoc[1]} - ${timePracticeHoursDoc[3]}` : null
    // find practice hours doctor on update conf
    const findPracticeHoursDocUpdtConf = chooseDocUpdtConf?.id ? chooseDocUpdtConf?.jadwalDokter?.find(day => day?.toLowerCase()?.includes(dayDocScheduleUpdtConf?.title?.toLowerCase())) : null
    const timePracticeHoursDocUpdtConf = findPracticeHoursDocUpdtConf ? findPracticeHoursDocUpdtConf?.split(' ') : null
    const practiceHoursDocUpdtConf = timePracticeHoursDocUpdtConf?.length > 0 ? `${timePracticeHoursDocUpdtConf[1]} - ${timePracticeHoursDocUpdtConf[3]}` : null
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
    // const findDayIdx = getJadwalDokter?.length > 0 ? newDay.findIndex(day => day.toLowerCase() === chooseDayOfDoctorOnUpdtInfoPatient?.title?.toLowerCase()) : null
    const findDayIdx = chooseDayOfDoctorOnUpdtInfoPatient?.title !== 'Choose Day' ? dayNamesInd.findIndex(day => day === chooseDayOfDoctorOnUpdtInfoPatient?.title?.toLowerCase()) + 1 : null
    // const idxOneIfDayIsTwo = getJadwalDokter?.length === 2 ? newDay.findIndex(day => day.toLowerCase() === getJadwalDokter[0]?.toLowerCase()) : null
    // const idxTwoIfDayIsTwo = getJadwalDokter?.length === 2 ? newDay.findIndex(day => day.toLowerCase() === getJadwalDokter[1]?.toLowerCase()) : null
    const isWeekday = (date) => {
        const day = getDay(date)
        return findDayIdx !== null ? findDayIdx === 7 ? day === 0 : day === findDayIdx : null
    }

    // loket
    const { data: dataLoket, error: errDataLoket, isLoading: loadDataLoket } = useSwr(endpoint.getLoket())
    const findInfoLoket = dataLoket?.data ? dataLoket?.data?.find(item => item.loketRules === 'info-loket') : null
    const getLoket = findInfoLoket ? findInfoLoket?.loketInfo : null
    const newLoket = getLoket?.length > 0 ? getLoket.map(item => ({ id: item.loketName, title: item.loketName })) : null
    // patient-queue
    const getPatientQueue = dataLoket?.data ? dataLoket?.data?.filter(item => item.loketRules === 'patient-queue') : null
    const findPatientInLoket = getPatientQueue?.length > 0 ? getPatientQueue.find(patient => patient.patientId === params[3]) : null

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
    const dayNameOfADPatient = findIdxDayOfADPatient !== null ? dayNamesInd[findIdxDayOfADPatient] : null

    const getDoctorsInCurrentDate = findCurrentSpecialist?.length > 0 ? findCurrentSpecialist.filter(doctor => {
        const findDay = doctor?.jadwalDokter?.filter(day => day.toLowerCase() === dayNameOfADPatient)

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
        const urlOrigin = window.location.origin
        setUrlOrigin(urlOrigin)
    }, [])

    useEffect(() => {
        if (user?.id && !loadService && patientData?.isNotif === false) {
            updateNotif()
        }
        if (user?.id && !loadService && patientData?.id) {
            const {
                patientComplaints,
                appointmentDate,
                submissionDate,
                patientName,
                emailAddress,
                dateOfBirth,
                phone
            } = patientData
            setValueInputEdit({
                patientComplaints: patientComplaints,
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
                doctorInfo,
                roomInfo,
                presence,
            } = patientData?.isConfirm

            // presence state confirmation
            setPresenceState(presence)

            // specialist doctor
            const elDocSpecialist = document.getElementById('chooseSpecialistDocUpdtConf')
            if (elDocSpecialist) {
                elDocSpecialist.value = doctorInfo?.doctorSpecialist
            }
            setDocSpecialistUpdtConf({
                id: doctorInfo?.doctorSpecialist,
                title: doctorInfo?.doctorSpecialist
            })

            // day doctor
            const getDay = makeNormalDateOnPatientInfo(patientData?.appointmentDate)
            const day = getDay?.split(' ')[3]
            setDayDocScheduleUpdtConf({
                id: day,
                title: day
            })
            const elDoctorSchedule = document.getElementById('chooseDoctorScheduleUpdtConf')
            if (elDoctorSchedule) {
                elDoctorSchedule.value = day
            }

            setTimeout(() => {
                // choose doctor
                const getCurrentDoctor = findOurDoctor?.data?.length > 0 ? findOurDoctor.data.find(doctor => doctor.name === doctorInfo?.nameDoctor) : null
                setChooseDocUpdtConf(getCurrentDoctor)
                // list choose doctor
                const getCurrentSpecDoc = findOurDoctor?.data?.length > 0 ? findOurDoctor.data.filter(doctor => doctor.deskripsi === doctorInfo?.doctorSpecialist) : null
                const getDocOnCurrentSchedule = getCurrentSpecDoc?.length > 0 ? getCurrentSpecDoc.filter(doctor => {
                    const checkDay = doctor?.jadwalDokter?.find(days => days?.includes(day))

                    return checkDay !== undefined && checkDay !== null
                }) : null
                if (getDocOnCurrentSchedule?.length > 0) {
                    const newDoc = [{
                        id: 'Choose Doctor',
                        title: 'Choose Doctor'
                    }]
                    let count = 0

                    for (let i = 0; i < getDocOnCurrentSchedule.length; i++) {
                        newDoc.push({
                            id: getDocOnCurrentSchedule[i]?.name,
                            title: getDocOnCurrentSchedule[i]?.name
                        })
                        count = count + 1
                    }

                    if (count === getDocOnCurrentSchedule.length) {
                        setListDocOnSpecialistUpdtConf(newDoc)
                    }

                    setTimeout(() => {
                        const findCurrentDoc = getDocOnCurrentSchedule?.length > 0 ? getDocOnCurrentSchedule.find(doctor => doctor.name === doctorInfo?.nameDoctor) : null
                        const elCurrentDoc = document.getElementById('chooseDoctorsConfInfo')
                        if (elCurrentDoc) {
                            elCurrentDoc.value = findCurrentDoc?.name
                        }
                    }, 0)
                }
            }, 0)

            const selectElDoctorUpdtConfInfo = document.getElementById('chooseDoctorsConfInfo')
            const findCurrentDoctorUpdtConfInfo = getDoctorsInCurrentDate?.length > 0 ? getDoctorsInCurrentDate.find(doctor => doctor.title === doctorInfo?.nameDoctor) : null
            if (selectElDoctorUpdtConfInfo) {
                selectElDoctorUpdtConfInfo.value = findCurrentDoctorUpdtConfInfo?.id
            }
            const selectElRoomUpdtConfInfo = document.getElementById('chooseRoomUpdtConfInfo')
            const findCurrentRoomUpdtConfInfo = roomDiseaseType?.length > 0 ? roomDiseaseType.find(room => room.title === roomInfo?.roomName) : null
            if (selectElRoomUpdtConfInfo) {
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

    // get day of appointment date
    // for data update patient information (not yet confirmed)
    useEffect(() => {
        if (params?.length > 0 && !loadService && patientData?.id) {
            const getDay = makeNormalDateOnPatientInfo(patientData?.appointmentDate)
            const day = getDay?.split(' ')
            setChooseDayOfDoctorOnUpdtInfoPatient({
                id: day[3],
                title: day[3]
            })

            const elDay = document.getElementById('selectDayUpdtPatientInfo')
            if (elDay) {
                elDay.value = day[3]
            }
        }
    }, [params, dataService])

    useEffect(() => {
        if (params?.length > 0 && dataDoctors?.data && findCurrentSpecialist?.length > 0) {
            const selectElDoctor = document.getElementById('chooseDoctors')
            const selectElDoctorUpdtInfo = document.getElementById('chooseDoctorEditPatientInfo')
            const selectElDayDoctorSchedule = document.getElementById('selectDayUpdtPatientInfo')

            if (selectElDoctor && findOneDoctorOfFirstOne?.id) {
                selectElDoctor.value = findOneDoctorOfFirstOne.id
            }

            // setChooseDoctor(findOneDoctorOfFirstOne)

            // jika pasien belum di konfirmasi
            // form info pasien update
            if (!patientData?.isConfirm?.id) {
                setChooseDoctorUpdtInfoPatient(findOneDoctorOfFirstOne)

                if (selectElDoctorUpdtInfo) {
                    selectElDoctorUpdtInfo.value = findOneDoctorOfFirstOne?.id
                }

                const getDayDoctorSchedule = findOneDoctorOfFirstOne?.jadwalDokter ? findOneDoctorOfFirstOne.jadwalDokter.map((jadwal, idx) => ({
                    id: jadwal,
                    title: jadwal
                })) : []
                setDataDayOfDoctros(getDayDoctorSchedule)
                const findIdxDayDoctorSchedule = getDayDoctorSchedule?.length > 0 ? getDayDoctorSchedule.findIndex(jadwal => jadwal.title?.toLowerCase() === dayNameOfADPatient) : null
                // setChooseDayOfDoctorOnUpdtInfoPatient(getDayDoctorSchedule[findIdxDayDoctorSchedule])

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
                // setChooseDayOfDoctorOnUpdtInfoPatient(getDayDoctorSchedule[findIdxDayDoctorSchedule])

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
            const findPatientInLoket = getPatientQueue.filter(patient => patient.loketName === findLoket && patient?.submissionDate === currentDate && patient?.isConfirm?.confirmState === false)
            const findPatientToday = getPatientQueue.filter(patient => patient.loketName === findLoket && patient?.isConfirm?.confirmState && patient?.submissionDate === currentDate && patient?.isConfirm?.dateConfirm === currentDate)
            setInfoLoket({
                id: 'patient-queue',
                loketName: findLoket,
                totalQueue: findPatientInLoket?.length + findPatientToday?.length
            })
        }
    }, [params, dataLoket])

    const numberFormatIndo = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(number)
    }

    const listChooseDay = [
        {
            id: 'Choose Day',
            title: 'Choose Day'
        },
        {
            id: 'Senin',
            title: 'Senin'
        },
        {
            id: 'Selasa',
            title: 'Selasa'
        },
        {
            id: 'Rabu',
            title: 'Rabu'
        },
        {
            id: 'Kamis',
            title: 'Kamis'
        },
        {
            id: 'Jumat',
            title: 'Jumat'
        },
        {
            id: 'Sabtu',
            title: 'Sabtu'
        },
        {
            id: 'Minggu',
            title: 'Minggu'
        }
    ]

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
                                if (patientData?.isConfirm?.id) {
                                    // update data konfirmasi pasien jika sudah dikonfirmasi
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

                                    const { patientComplaints, appointmentDate, patientName, emailAddress, dateOfBirth, phone } = valueInputEdit
                                    const data = {
                                        patientComplaints,
                                        appointmentDate,
                                        submissionDate: dateConfirm,
                                        clock: confirmHour,
                                        patientName,
                                        emailAddress,
                                        dateOfBirth,
                                        phone
                                    }

                                    updatePersonalDataPatient(data)
                                    // const currentPatient = userAppointmentData && patientData ? userAppointmentData.filter(patient =>
                                    //     patient.jenisPenyakit === patientData?.jenisPenyakit &&
                                    //     patient.appointmentDate === valueInputEdit.appointmentDate &&
                                    //     patient.isConfirm?.id &&
                                    //     patient.isConfirm?.roomInfo?.roomName === chooseDoctorUpdtInfoPatient?.room
                                    // ) : null

                                    // const { id, message, dateConfirm, confirmHour, treatmentHours, presence } = patientData?.isConfirm

                                    // const dataUpdateConfirm = {
                                    //     id: id,
                                    //     message: message,
                                    //     emailAdmin: user?.email,
                                    //     nameAdmin: user?.name,
                                    //     dateConfirm: dateConfirm,
                                    //     confirmHour: confirmHour,
                                    //     treatmentHours: treatmentHours,
                                    //     doctorInfo: {
                                    //         nameDoctor: chooseDoctorUpdtInfoPatient?.title,
                                    //         doctorSpecialist: chooseDoctorUpdtInfoPatient?.spesialis
                                    //     },
                                    //     queueNumber: `${currentPatient?.length + 1}`,
                                    //     roomInfo: {
                                    //         roomName: chooseDoctorUpdtInfoPatient?.room
                                    //     },
                                    //     presence: presence
                                    // }

                                    // updateIsConfirm(dataUpdateConfirm, () => {
                                    //     updatePersonalDataPatient()
                                    // }, (err) => {
                                    //     alert('Oops, telah terjadi kesalahan server\nMohon coba beberapa saat lagi')
                                    //     setLoadingSubmit(false)
                                    //     console.log(err)
                                    // })
                                } else {
                                    // update data informasi pasien jika belum dikonfirmasi
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

                                    const { patientComplaints, appointmentDate, patientName, emailAddress, dateOfBirth, phone } = valueInputEdit
                                    const data = {
                                        patientComplaints,
                                        appointmentDate,
                                        submissionDate: dateConfirm,
                                        clock: confirmHour,
                                        patientName,
                                        emailAddress,
                                        dateOfBirth,
                                        phone
                                    }

                                    updatePersonalDataPatient(data)
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

        const checkDay = makeNormalDateOnPatientInfo(valueInputEdit.appointmentDate)
        const getDay = checkDay?.split(' ')
        const day = getDay[3]

        if (valueInputEdit.patientComplaints === patientData?.patientComplaints) {
            err.patientComplaints = message
        }
        if (chooseDayOfDoctorOnUpdtInfoPatient?.title === 'Choose Day') {
            return null
        } else if (chooseDayOfDoctorOnUpdtInfoPatient?.title !== day) {
            return null
        } else if (valueInputEdit.appointmentDate === patientData?.appointmentDate) {
            err.appointmentDate = message
        }
        // if (valueInputEdit.submissionDate === patientData?.submissionDate) {
        //     err.submissionDate = message
        // }
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

        if (!valueInputEdit.patientComplaints.trim()) {
            err.patientComplaints = 'Must be required'
        }
        if (chooseDayOfDoctorOnUpdtInfoPatient?.title === 'Choose Day') {
            err.chooseDay = 'Must be required'
        }
        const checkDay = makeNormalDateOnPatientInfo(valueInputEdit.appointmentDate)
        const getDay = checkDay?.split(' ')
        const day = getDay[3]
        if (day !== chooseDayOfDoctorOnUpdtInfoPatient?.title) {
            err.appointmentDate = 'Date must be the same as the day'
        } else if (!valueInputEdit.appointmentDate.trim()) {
            err.appointmentDate = 'Must be required'
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

    const updatePersonalDataPatient = (data) => {
        if (bookAnAppointment?._id && patientData?.id) {
            const { patientName, phone, emailAddress } = valueInputEdit

            const dataBioPatientInFT = {
                patientName,
                patientEmail: emailAddress,
                phone
            }

            API.APIPutPatientRegistration(
                bookAnAppointment._id,
                patientData.id,
                data
            )
                .then(res => {
                    if (findPatientInLoket?._id) {
                        const dataBioPatientInCounter = {
                            patientName,
                            phone,
                            emailAdmin: emailAddress
                        }
                        API.APIPutBioPatientInCounter(findPatientInLoket._id, dataBioPatientInCounter)
                            .then(resCounter => {
                                if (findCurrentPatientFinishTreatment?._id) {
                                    updateBioPatientFinishTreatment(dataBioPatientInFT)
                                } else {
                                    setLoadingSubmit(false)
                                    setTimeout(() => {
                                        alert(`${patientData?.patientName} patient upated successfully`)
                                    }, 0)
                                }
                            })
                            .catch(err => {
                                alert('Oops, telah terjadi kesalahan server\nMohon coba beberapa saat lagi')
                                console.log(err)
                                setLoadingSubmit(false)
                            })
                    } else if (findCurrentPatientFinishTreatment?._id) {
                        updateBioPatientFinishTreatment(dataBioPatientInFT)
                    } else {
                        setLoadingSubmit(false)
                        setTimeout(() => {
                            alert(`${patientData?.patientName} patient upated successfully`)
                        }, 0)
                    }
                })
                .catch(err => {
                    alert('Oops, telah terjadi kesalahan server\nMohon coba beberapa saat lagi')
                    console.log(err)
                    setLoadingSubmit(false)
                })
        } else {
            alert('Oops, telah terjadi kesalahan server\nMohon coba beberapa saat lagi')
            setLoadingSubmit(false)
        }
    }

    const updateBioPatientFinishTreatment = (data) => {
        API.APIPutBioPatientInFinishTreatment(findCurrentPatientFinishTreatment?._id, data)
            .then(res => {
                setLoadingSubmit(false)
                setTimeout(() => {
                    alert(`${patientData?.patientName} patient upated successfully`)
                }, 0)
            })
            .catch(err => {
                alert('Oops, telah terjadi kesalahan server\nMohon coba beberapa saat lagi')
                console.log(err)
                setLoadingSubmit(false)
            })
    }

    const clickDeletePersonalDataRegis = () => {
        if (loadingSubmit === false && window.confirm('Delete this data?')) {
            setLoadingSubmit(true)
            deleteDataPersonalPatientRegis()
        }
    }

    const deleteDataPersonalPatientRegis = () => {
        if (findPatientInLoket?.id) {
            API.APIDeleteLoket(findPatientInLoket?._id)
                .then(res => {
                    if (findCurrentPatientFinishTreatment?.id) {
                        API.APIDeleteFinishedTreatment(findCurrentPatientFinishTreatment?._id)
                            .then(res => {
                                pushToDeletePatientRegis()
                            })
                            .catch(err => {
                                alert('Oops, telah terjadi kesalahan server\nMohon coba beberapa saat lagi')
                                setLoadingSubmit(false)
                                console.log(err)
                            })
                    } else {
                        pushToDeletePatientRegis()
                    }
                })
                .catch(err => {
                    alert('Oops, telah terjadi kesalahan server\nMohon coba beberapa saat lagi')
                    setLoadingSubmit(false)
                    console.log(err)
                })
        } else {
            pushToDeletePatientRegis()
        }
    }

    const pushToDeletePatientRegis = () => {
        API.APIDeletePatientRegistration(bookAnAppointment?._id, patientData?.id)
            .then(res => {
                alert('Deleted successfully')
                setTimeout(() => {
                    window.location.reload()
                }, 0)
            })
            .catch(err => {
                alert('Oops, telah terjadi kesalahan server\nMohon coba beberapa saat lagi')
                setLoadingSubmit(false)
                console.log(err)
            })
    }

    const handleChooseSpecialist = () => {
        const selectEl = document.getElementById('chooseSpecialist')
        const id = selectEl.options[selectEl.selectedIndex].value
        if (id) {
            if (id?.toLowerCase() === 'choose specialist') {
                setChooseSpecialist({ specialist: null })
                selectEl.value = 'Choose Specialist'

                // back to choose doctor
                setChooseDoctor({})
                setListDoctorOnSpecialist([{
                    id: 'Choose Doctor',
                    title: 'Choose Doctor'
                }])
                const elDoctor = document.getElementById('chooseDoctors')
                if (elDoctor) elDoctor.value = 'Choose Doctor'
                // back to choose day
                setChooseDayConf({})
                const elChooseDayConf = document.getElementById('chooseDayConf')
                if (elChooseDayConf) elChooseDayConf.value = 'Choose Day'
            } else {
                setChooseSpecialist({ specialist: id })
                selectEl.value = id

                setErrSubmitConfPatient({
                    ...errSubmitConfPatient,
                    doctorSpecialist: ''
                })

                // back to choose doctor
                setListDoctorOnSpecialist([{
                    id: 'Choose Doctor',
                    title: 'Choose Doctor'
                }])
                setChooseDoctor({})
                const elDoctor = document.getElementById('chooseDoctors')
                if (elDoctor) elDoctor.value = 'Choose Doctor'
                // back to choose day
                setChooseDayConf({})
                const elChooseDayConf = document.getElementById('chooseDayConf')
                if (elChooseDayConf) elChooseDayConf.value = 'Choose Day'
            }
        }
    }

    const handleChooseDay = () => {
        const selectEl = document.getElementById('chooseDayConf')
        const id = selectEl.options[selectEl.selectedIndex].value
        if (id) {
            if (id?.toLowerCase() === 'choose day') {
                selectEl.value = 'Choose Day'
                setChooseDayConf({})

                setListDoctorOnSpecialist([{
                    id: 'Choose Doctor',
                    title: 'Choose Doctor'
                }])
                setChooseDoctor({})
                const elDoctor = document.getElementById('chooseDoctors')
                if (elDoctor) elDoctor.value = 'Choose Doctor'
            } else {
                const getDoctorScheduleOnSpecialist = findOurDoctor?.data?.length > 0 ? findOurDoctor.data.filter(doctor => {
                    const checkSchedule = doctor?.jadwalDokter?.length > 0 ? doctor?.jadwalDokter.find(day => day?.toLowerCase()?.includes(id?.toLowerCase())) : null

                    return doctor.deskripsi === chooseSpecialist?.specialist && checkSchedule !== null && checkSchedule !== undefined
                }) : null

                const doctorOnSpecialist = () => {
                    let count = 0
                    const newListDoctor = [{
                        id: 'Choose Doctor',
                        title: 'Choose Doctor'
                    }]

                    if (getDoctorScheduleOnSpecialist?.length > 0) {
                        getDoctorScheduleOnSpecialist.forEach(doctor => {
                            count = count + 1
                            newListDoctor.push({
                                id: doctor.name,
                                title: doctor.name
                            })
                        })
                    }

                    if (count === getDoctorScheduleOnSpecialist?.length) {
                        setListDoctorOnSpecialist(newListDoctor)
                    }
                }
                setChooseDayConf({
                    id: id,
                    title: id
                })

                setChooseDoctor({})
                const elDoctor = document.getElementById('chooseDoctors')
                if (elDoctor) elDoctor.value = 'Choose Doctor'

                setErrSubmitConfPatient({
                    ...errSubmitConfPatient,
                    chooseDayConf: ''
                })

                setTimeout(() => {
                    doctorOnSpecialist()
                }, 0);
            }
        }
    }

    const handleChooseDoctors = () => {
        const selectEl = document.getElementById('chooseDoctors')
        const id = selectEl.options[selectEl.selectedIndex].value
        if (id) {
            if (id?.toLowerCase() === 'choose doctor') {
                selectEl.value = 'Choose Doctor'
                setChooseDoctor({})
            } else {
                const findDoctor = findOurDoctor?.data?.length > 0 ? findOurDoctor.data.find(doctor => doctor.name?.toLowerCase() === id?.toLowerCase()) : {}
                setChooseDoctor(findDoctor)

                setErrSubmitConfPatient({
                    ...errSubmitConfPatient,
                    nameDoctor: '',
                    roomName: ''
                })
            }
            // const findDoctorInCurrentDate = getDoctorsInCurrentDate?.length > 0 ? getDoctorsInCurrentDate.find(doctor => doctor.id === id) : {}

            // if (findDoctorInCurrentDate?.id) {
            //     // const findDoctor = findCurrentSpecialist.find(doc => doc.id === id)
            //     selectEl.value = id
            //     setChooseDoctor(findDoctorInCurrentDate)

            //     const findRoom = roomDiseaseType?.length > 0 ? roomDiseaseType.find(room => room.title === findDoctorInCurrentDate?.room) : {}
            //     setChooseRoom(findRoom)
            //     const selectElRoom = document.getElementById('chooseRoom')
            //     selectElRoom.value = findRoom?.id

            //     setInputConfirm({
            //         ...inputConfirm,
            //         doctorInfo: {
            //             doctorSpecialist: findDoctorInCurrentDate?.spesialis,
            //             nameDoctor: findDoctorInCurrentDate?.title
            //         },
            //         roomInfo: {
            //             roomName: findRoom?.title
            //         }
            //     })
            // } else {
            //     alert(`The doctor is not on the patient's schedule`)
            //     selectEl.value = chooseDoctor?.id
            // }
        }
    }

    const handleDocSpecialistUpdtConf = () => {
        const selectEl = document.getElementById('chooseSpecialistDocUpdtConf')
        const id = selectEl.options[selectEl.selectedIndex].value
        if (id) {
            setDocSpecialistUpdtConf({
                id: id,
                title: id
            })

            const elDayDocSchedule = document.getElementById('chooseDoctorScheduleUpdtConf')
            if (elDayDocSchedule) {
                elDayDocSchedule.value = 'Choose Day'
            }
            setDayDocScheduleUpdtConf({
                id: 'Choose Day',
                title: 'Choose Day'
            })

            const elChooseDocUpdtConf = document.getElementById('chooseDoctorsConfInfo')
            if (elChooseDocUpdtConf) {
                elChooseDocUpdtConf.value = 'Choose Doctor'
            }

            setChooseDocUpdtConf({})

            setListDocOnSpecialistUpdtConf([{
                id: 'Choose Doctor',
                title: 'Choose Doctor'
            }])
        }
    }

    const handleDocScheduleUpdtConf = () => {
        const selectEl = document.getElementById('chooseDoctorScheduleUpdtConf')
        const id = selectEl.options[selectEl.selectedIndex].value
        if (id) {
            // back to choose doctor
            const elChooseDocUpdtConf = document.getElementById('chooseDoctorsConfInfo')
            if (elChooseDocUpdtConf) {
                elChooseDocUpdtConf.value = 'Choose Doctor'
            }
            setChooseDocUpdtConf({})

            setDayDocScheduleUpdtConf({
                id: id,
                title: id
            })
            if (id !== 'Choose Day') {
                const getDocOnCurrentSpecialist = findOurDoctor?.data?.length > 0 ? findOurDoctor.data.filter(doctor => doctor.deskripsi === docSpecialistUpdtConf?.title) : null
                if (getDocOnCurrentSpecialist?.length > 0) {
                    const getDocOnCurrentSchedule = getDocOnCurrentSpecialist.filter(doctor => {
                        const jadwalDokter = doctor?.jadwalDokter?.find(day => day?.toLowerCase()?.includes(id?.toLowerCase()))

                        return jadwalDokter !== undefined && jadwalDokter !== null
                    })

                    if (getDocOnCurrentSchedule?.length > 0) {
                        const newDataChooseDoc = [{
                            id: 'Choose Doctor',
                            title: 'Choose Doctor'
                        }]
                        let count = 0

                        const pushDataDoctor = () => getDocOnCurrentSchedule.forEach(doctor => {
                            count = count + 1
                            newDataChooseDoc.push({
                                id: doctor.name,
                                title: doctor.name
                            })
                        })

                        pushDataDoctor()
                        if (count === getDocOnCurrentSchedule.length) {
                            setListDocOnSpecialistUpdtConf(newDataChooseDoc)
                        }
                    } else {
                        setListDocOnSpecialistUpdtConf([{
                            id: 'Choose Doctor',
                            title: 'Choose Doctor'
                        }])
                    }
                } else {
                    setListDocOnSpecialistUpdtConf([{
                        id: 'Choose Doctor',
                        title: 'Choose Doctor'
                    }])
                }
            } else {
                setChooseDocUpdtConf({})
                setListDocOnSpecialistUpdtConf([{
                    id: 'Choose Doctor',
                    title: 'Choose Doctor'
                }])
            }
        }
    }

    const handleChooseDoctorsUpdtInfoConfirm = () => {
        const selectEl = document.getElementById('chooseDoctorsConfInfo')
        const id = selectEl.options[selectEl.selectedIndex].value
        if (id) {
            if (id !== 'Choose Doctor') {
                const findDocOnCurrentName = findOurDoctor?.data?.length > 0 ? findOurDoctor.data.find(doctor => doctor.name === id) : null
                setChooseDocUpdtConf(findDocOnCurrentName)
            } else {
                setChooseDocUpdtConf({})
            }
            // const findDoctorInCurrentDate = getDoctorsInCurrentDate?.length > 0 ? getDoctorsInCurrentDate.find(doctor => doctor.id === id) : {}
            // if (findDoctorInCurrentDate?.id) {
            //     const currentPatient = userAppointmentData && patientData ? userAppointmentData.filter(patient =>
            //         patient.jenisPenyakit === patientData?.jenisPenyakit &&
            //         patient.appointmentDate === patientData?.appointmentDate &&
            //         patient.isConfirm?.id &&
            //         patient.isConfirm?.roomInfo?.roomName === findDoctorInCurrentDate?.room &&
            //         patient.id !== patientData?.id
            //     ) : null

            //     setInputUpdtConfirmInfo({
            //         ...inputUpdtConfirmInfo,
            //         doctorInfo: {
            //             nameDoctor: findDoctorInCurrentDate?.title,
            //             doctorSpecialist: findDoctorInCurrentDate?.spesialis
            //         },
            //         roomInfo: {
            //             roomName: findDoctorInCurrentDate?.room
            //         },
            //         queueNumber: `${currentPatient?.length + 1}`
            //     })
            //     setErrMsgInputUpdtConfirmInfo({
            //         ...errMsgInputUpdtConfirmInfo,
            //         nameDoctor: '',
            //         doctorSpecialist: '',
            //         roomName: '',
            //         totalQueue: ''
            //     })

            //     const findCurrentRoom = roomDiseaseType?.length > 0 ? roomDiseaseType.find(room => room.title === findDoctorInCurrentDate?.room) : {}
            //     const selectElRoomUpdtConfInfo = document.getElementById('chooseRoomUpdtConfInfo')
            //     if (selectElRoomUpdtConfInfo) {
            //         selectElRoomUpdtConfInfo.value = findCurrentRoom?.id
            //     }
            // } else {
            //     alert(`The doctor is not on the patient's schedule`)
            //     const findPrevDoctor = getDoctorsInCurrentDate?.length > 0 ? getDoctorsInCurrentDate.find(doctor => doctor.title === inputUpdtConfirmInfo?.doctorInfo?.nameDoctor) : {}
            //     selectEl.value = findPrevDoctor?.id
            // }
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
            // const findDay = dataDayOfDoctors.find(day => day.id === id)
            setChooseDayOfDoctorOnUpdtInfoPatient({
                id: id,
                title: id
            })
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

        if (!chooseSpecialist?.specialist?.trim()) {
            err.doctorSpecialist = 'Must be required!'
        }
        if (!chooseDayConf?.title?.trim()) {
            err.chooseDayConf = 'Must be required!'
        }
        if (!chooseDoctor?.name?.trim()) {
            err.nameDoctor = 'Must be required!'
        }
        if (!chooseDoctor?.room?.trim()) {
            err.roomName = 'Must be required!'
        }
        if (!inputConfirm.treatmentHours.trim()) {
            err.treatmentHours = 'Must be required!'
        }
        if (!inputConfirm.message.trim()) {
            err.message = 'Must be required!'
        }
        if (checkCurrentDSOnDayAppointment === false) {
            err.noDoctor = 'No Doctor Schedule'
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

            const findLastPatientOfCurrentDate = patientOfCurrentDiseaseT?.length > 0 ? patientOfCurrentDiseaseT.filter((patient, idx) => idx === 0) : []
            const getQueueNumber = findLastPatientOfCurrentDate?.length === 1 ? parseInt(findLastPatientOfCurrentDate[0]?.isConfirm?.queueNumber) + 1 : 1

            const postData = {
                id: `${new Date().getTime()}`,
                message: inputConfirm.message,
                emailAdmin: user?.email,
                nameAdmin: user?.name,
                dateConfirm,
                confirmHour,
                treatmentHours: inputConfirm.treatmentHours,
                doctorInfo: {
                    nameDoctor: chooseDoctor?.name,
                    doctorSpecialist: chooseDoctor?.deskripsi
                },
                queueNumber: `${getQueueNumber}`,
                roomInfo: {
                    roomName: chooseDoctor?.room,
                },
                presence: 'menunggu'
            }

            validateFormConfPatient()
                .then(res => {
                    if (window.confirm('Konfirmasikan patient?')) {
                        setLoadingSubmitConfPatient(true)
                        pushToConfirmPatient(postData)
                        // pushToEmailPatient()
                        //     .then(res => {
                        //         pushToConfirmPatient(postData)
                        //     })
                        //     .catch(err => {
                        //         alert('Oops, telah terjadi kesalahan server!\nMohon coba beberapa saat lagi!')
                        //         setLoadingSubmitConfPatient(false)
                        //         console.log(err)
                        //     })
                    }
                })
                .catch(err => {
                    console.log(err)
                })
        }
    }

    const pushToEmailPatient = async () => {
        const serviceId = process.env.NEXT_PUBLIC_SERVICE_ID_ADM
        const templateId = process.env.NEXT_PUBLIC_TEMPLATE_ID_KONFIRMASI_JP
        const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY_ADM

        const patientName = patientData?.patientName?.replace(specialCharacter, '')?.replace(spaceString, '')

        const dataSend = {
            pdf_link_patient_treatment: `${urlOrigin}/patient-registration-information/${patientData?.id}/${patientName}/pdf`,
            to_email: patientData?.emailAddress,
            patient_name: patientData?.patientName,
        }

        return await new Promise((resolve, reject) => {
            emailjs.send(serviceId, templateId, dataSend, publicKey)
                .then(result => {
                    resolve(result)
                }, (error) => reject(error))
        })
    }

    const pushToConfirmPatient = (data) => {
        API.APIPostConfirmAppointmentDate(bookAnAppointment?._id, patientData?.id, data)
            .then(res => {
                setLoadingSubmitConfPatient(false)
                const pathUrl = `/patient/patient-registration/personal-data/confirmed/${params[2]}/${params[3]}`
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

        const findPatientConfInLoketToday = getPatientQueue?.filter(patient => patient.loketName === infoLoket?.loketName && patient?.isConfirm?.confirmState && patient?.submissionDate === currentDate && patient?.isConfirm?.dateConfirm === currentDate)
        const findPatientInLoketToday = getPatientQueue?.filter(patient => patient.loketName === infoLoket?.loketName && patient?.submissionDate === currentDate && patient?.isConfirm?.confirmState === false)
        const sortPatientConfInLoketToday = findPatientConfInLoketToday?.length > 0 ? findPatientConfInLoketToday.sort((a, b) => parseInt(b.queueNumber) - parseInt(a.queueNumber)) : []
        const sortPatientInLoketToday = findPatientInLoketToday?.length > 0 ? findPatientInLoketToday.sort((a, b) => parseInt(b.queueNumber) - parseInt(a.queueNumber)) : []

        const getNumber = (stringNum)=>{
            return parseInt(stringNum)
        }

        const getQueueNumber = sortPatientInLoketToday?.length > 0 && sortPatientConfInLoketToday?.length > 0 ?
            getNumber(sortPatientInLoketToday[0]?.queueNumber) > getNumber(sortPatientConfInLoketToday[0]?.queueNumber) ?
                getNumber(sortPatientInLoketToday[0]?.queueNumber) + 1 : getNumber(sortPatientConfInLoketToday[0]?.queueNumber) + 1 :
            sortPatientInLoketToday?.length > 0 && sortPatientConfInLoketToday?.length === 0 ?
                getNumber(sortPatientInLoketToday[0]?.queueNumber) + 1 : sortPatientConfInLoketToday?.length > 0 && sortPatientInLoketToday?.length === 0 ?
                    getNumber(sortPatientConfInLoketToday[0]?.queueNumber) + 1 : 1

        const data = {
            id: `${new Date().getTime()}`,
            loketRules: 'patient-queue',
            loketName: infoLoket?.loketName,
            patientId: id,
            patientName: patientName,
            patientEmail: emailAddress,
            phone: phone,
            queueNumber: getQueueNumber,
            message: inputConfToLoket.message,
            emailAdmin: user?.email,
            presence: 'menunggu',
            submissionDate: dateConfirm,
            submitHours: confirmHour,
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
            const findPatientInLoket = getPatientQueue.filter(patient => patient.loketName === id && patient?.submissionDate === currentDate && patient?.isConfirm?.confirmState === false)
            const findPatientToday = getPatientQueue.filter(patient => patient.loketName === id && patient?.isConfirm?.confirmState && patient?.submissionDate === currentDate && patient?.isConfirm?.dateConfirm === currentDate)

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

                                const checkQueueNumber = patientOfCurrentDiseaseTForUpdtConfInfo?.length > 0 ? patientOfCurrentDiseaseTForUpdtConfInfo.filter(patient => patient?.id !== patientData?.id) : []
                                const getQueueNumberOfCurrentPatient = checkQueueNumber?.length > 0 ? checkQueueNumber.filter((patient, idx) => idx === 0) : []
                                const queueNumber = getQueueNumberOfCurrentPatient?.length === 1 ? parseInt(getQueueNumberOfCurrentPatient[0]?.isConfirm?.queueNumber) + 1 : 1

                                const { id, message, presence } = patientData?.isConfirm
                                const data = {
                                    id,
                                    message,
                                    emailAdmin: user?.email,
                                    nameAdmin: user?.name,
                                    dateConfirm,
                                    confirmHour,
                                    treatmentHours: inputUpdtConfirmInfo.treatmentHours,
                                    doctorInfo: {
                                        nameDoctor: chooseDocUpdtConf?.name,
                                        doctorSpecialist: chooseDocUpdtConf?.deskripsi
                                    },
                                    queueNumber,
                                    roomInfo: {
                                        roomName: chooseDocUpdtConf?.room
                                    },
                                    presence
                                }
                                updateIsConfirm(data, () => {
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

        if (docSpecialistUpdtConf?.title === 'Choose Specialist') {
            err.chooseSpecialist = 'Must be required!'
        }
        if (dayDocScheduleUpdtConf?.title === 'Choose Day') {
            err.chooseDay = 'Must be required!'
        }
        if (!chooseDocUpdtConf?.name?.trim()) {
            err.doctorName = 'Must be required!'
        }
        if (!chooseDocUpdtConf?.room?.trim()) {
            err.roomName = 'Must be required!'
        }
        if (patientOfCurrentDiseaseTForUpdtConfInfo === null) {
            err.totalQueue = 'Must be required!'
        }
        if (!inputUpdtConfirmInfo.treatmentHours?.trim()) {
            err.treatmentHours = 'Must be required!'
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

        const getDay = makeNormalDateOnPatientInfo(patientData?.appointmentDate)
        const day = getDay?.split(' ')[3]

        if (inputUpdtConfirmInfo.treatmentHours.length > 0) {
            return null
        }
        if (docSpecialistUpdtConf?.title === patientData?.isConfirm?.doctorInfo?.doctorSpecialist) {
            err.doctorSpecialist = 'it is the same'
        }
        if (dayDocScheduleUpdtConf?.title?.toLowerCase() === day?.toLowerCase()) {
            err.doctorSchedule = 'it is the same'
        }
        if (chooseDocUpdtConf?.name === patientData?.isConfirm?.doctorInfo?.nameDoctor) {
            err.nameDoctor = 'it is the same'
        }
        if (inputUpdtConfirmInfo.treatmentHours === patientData?.isConfirm?.treatmentHours) {
            err.treatmentHours = 'it is the same'
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
        if (loadingSubmitUpdtConfirmInfo === false && loadingSubmitConfToLoket === false && loadingPatientNotPresentInCalling === false && window.confirm(`pasien ${status}?`)) {
            setLoadingPatientNotPresentInCalling(true)

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
                        setLoadingPatientNotPresentInCalling(false)
                    }, (err) => {
                        alert('Oops, telah terjadi kesalahan server!\nMohon coba beberapa saat lagi')
                        console.log(err)
                        setLoadingPatientNotPresentInCalling(false)
                    })
                } else if (status === 'hadir') {
                    alert('confirmation information updated successfully')
                    setLoadingPatientNotPresentInCalling(false)
                }
            }, (err) => {
                alert('Oops, telah terjadi kesalahan server!\nMohon coba beberapa saat lagi')
                console.log(err)
                setLoadingPatientNotPresentInCalling(false)
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

                        const patientName = patientData?.patientName?.replace(specialCharacter, '')?.replace(spaceString, '')
                        const [p1, p2, p3, p4, p5, p6, p7, p8] = params

                        setTimeout(() => {
                            router.push(`/patient/patient-registration/${p1}/${p2}/${p3}/${p4}/${p5}/${p6}/confirmed/${p8}`)
                            window.open(`${urlOrigin}/patient-receipt/${patientName}/${patientData?.id}/pdf/download`)
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

                            const [p1, p2, p3, p4, p5, p6, p7, p8] = params

                            setTimeout(() => {
                                router.push(`/patient/patient-registration/personal-data/confirmed/${patientData?.patientName}/${patientData?.id}/counter/${p6}/confirmed/${p8}`)
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

    const clickResendConfirmation = () => {
        if (loadingSubmitConfPatient === false && window.confirm('Send confirmation again?')) {
            setLoadingSubmitConfPatient(true)
            pushToEmailPatient()
                .then(res => {
                    alert('Reconfirmation was successful!')
                    setLoadingSubmitConfPatient(false)
                })
                .catch(err => {
                    alert('Oops, telah terjadi kesalahan server\nMohon coba beberapa saat lagi')
                    console.log(err)
                    setLoadingSubmitConfPatient(false)
                })
        }
    }

    const clickCancelRegistration = () => {
        if (loadingSubmitConfPatient === false && window.confirm('Cancel registration?')) {
            setLoadingSubmitConfPatient(true)

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

            const patientName = patientData?.patientName?.replace(specialCharacter, '')?.replace(spaceString, '')

            postToPatientFinishTreatment(dataFinishTreatment, () => {
                alert('Successfully canceled registration')
                setLoadingSubmitConfPatient(false)
                setTimeout(() => {
                    router.push(`/patient/patient-registration/personal-data/cancelled/${patientName}/${patientData?.id}`)
                }, 0);
            }, (err) => {
                alert('Oops, telah terjadi kesalahan server!\nMohon coba beberapa saat lagi')
                setLoadingSubmitConfPatient(false)
                console.log(err)
            })
        }
    }

    const clickCancelRegisAfterConfirm = () => {
        if (loadCancelRegisAfterConf === false && window.confirm('Cancel Registration?')) {
            setLoadCancelRegisAfterConf(true)

            API.APICancelRegistration(bookAnAppointment?._id, patientData?.id)
                .then(res => {
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

                    const patientName = patientData?.patientName?.replace(specialCharacter, '')?.replace(spaceString, '')

                    postToPatientFinishTreatment(dataFinishTreatment, () => {
                        alert('Successfully canceled registration')
                        setLoadCancelRegisAfterConf(false)
                        setTimeout(() => {
                            router.push(`/patient/patient-registration/personal-data/cancelled/${patientName}/${patientData?.id}`)
                        }, 0);
                    }, (err => {
                        alert('Oops, telah terjadi kesalahan server!\nMohon coba beberapa saat lagi')
                        setLoadCancelRegisAfterConf(false)
                        console.log(err)
                    }))
                })
                .catch(err => {
                    alert('Oops, telah terjadi kesalahan server!\nMohon coba beberapa saat lagi')
                    setLoadCancelRegisAfterConf(false)
                    console.log(err)
                })
        }
    }

    if (params.length === 4 || params.length === 8) {
        return (
            <>
                <Head>
                    <title>{patientData?.patientName ? `${patientData?.patientName}` : 'Patient Not Found |'} Patient Registration | Admin Hospice Medical</title>
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
                    {/* patient complaints */}
                    <Input
                        {...propsInputEdit}
                        {...propsErrMsg}
                        nameTxtArea='patientComplaints'
                        title='Patient Complaints'
                        valueTxtArea={valueInputEdit.patientComplaints}
                        changeTxtArea={handleChangeEditPR}
                        errorMessage={errorMsgSubmit?.patientComplaints}
                        styleInputText={{
                            display: 'none'
                        }}
                        styleTxtArea={{
                            display: 'flex'
                        }}
                    />
                    {/* select day patient treatment */}
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
                        dataBlogCategory={listChooseDay}
                    />
                    <Input
                        {...propsInputEdit}
                        {...propsErrMsg}
                        type='text'
                        nameInput='dayPatientUpdt'
                        valueInput={chooseDayOfDoctorOnUpdtInfoPatient?.title}
                        title='Day'
                        readOnly={true}
                        changeInput={handleChangeEditPR}
                        errorMessage={errorMsgSubmit?.chooseDay}
                    />
                    {chooseDayOfDoctorOnUpdtInfoPatient?.id !== 'Choose Day' && (
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
                    {/* <Input
                        {...propsInputEdit}
                        {...propsErrMsg}
                        type='text'
                        nameInput='jenisPenyakit'
                        valueInput={valueInputEdit.jenisPenyakit}
                        title='Jenis Penyakit'
                        readOnly={true}
                        changeInput={handleChangeEditPR}
                    /> */}
                    {/* select doctor */}
                    {/* <SelectCategory
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
                    /> */}
                    {/* <Input
                        {...propsInputEdit}
                        {...propsErrMsg}
                        type='text'
                        nameInput='submissionDate'
                        valueInput={valueInputEdit.submissionDate}
                        title='Submission Date'
                        changeInput={handleChangeEditPR}
                        readOnly={true}
                        errorMessage={errorMsgSubmit?.submissionDate}
                    /> */}
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

                {/* popup edit confirm info */}
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
                    {/* choose specialist doctor */}
                    <SelectCategory
                        styleWrapp={{
                            margin: '0px 0'
                        }}
                        styleTitle={{
                            fontSize: '13px'
                        }}
                        titleCtg="Doctor Specialist"
                        idSelect="chooseSpecialistDocUpdtConf"
                        handleCategory={handleDocSpecialistUpdtConf}
                        dataBlogCategory={getAllDoctorSpecialist()}
                    />
                    <Input
                        {...styleStarInputEdit}
                        {...propsInputEdit}
                        {...propsErrMsg}
                        type='text'
                        nameInput='doctorSpecialist'
                        placeholder='Doctor Specialist'
                        valueInput={docSpecialistUpdtConf?.title}
                        title='Doctor Specialist'
                        // changeInput={handleChangeUpdtConfirmInfo}
                        readOnly={true}
                        errorMessage={errMsgInputUpdtConfirmInfo?.chooseSpecialist}
                    />
                    {/* choose doctor schedule */}
                    <SelectCategory
                        styleWrapp={{
                            margin: '0px 0'
                        }}
                        styleTitle={{
                            fontSize: '13px'
                        }}
                        titleCtg="Doctor Schedule"
                        idSelect="chooseDoctorScheduleUpdtConf"
                        handleCategory={handleDocScheduleUpdtConf}
                        dataBlogCategory={listChooseDay}
                    />
                    <Input
                        {...styleStarInputEdit}
                        {...propsInputEdit}
                        {...propsErrMsg}
                        type='text'
                        nameInput='doctorSchedule'
                        placeholder='Day'
                        valueInput={dayDocScheduleUpdtConf?.title}
                        title='Day'
                        // changeInput={handleChangeUpdtConfirmInfo}
                        readOnly={true}
                        errorMessage={errMsgInputUpdtConfirmInfo?.chooseDay}
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
                        dataBlogCategory={listDocOnSpecialistUpdtConf}
                    />
                    <Input
                        {...styleStarInputEdit}
                        {...propsInputEdit}
                        {...propsErrMsg}
                        type='text'
                        nameInput='nameDoctor'
                        valueInput={chooseDocUpdtConf?.name ? chooseDocUpdtConf.name : ''}
                        title='Doctor Name'
                        placeholder='Doctor Name'
                        // changeInput={handleChangeUpdtConfirmInfo}
                        readOnly={true}
                        errorMessage={errMsgInputUpdtConfirmInfo?.doctorName}
                    />
                    <Input
                        {...propsInputEdit}
                        {...propsErrMsg}
                        type='text'
                        nameInput='practiceHours'
                        valueInput={practiceHoursDocUpdtConf !== null ? practiceHoursDocUpdtConf : ''}
                        title='Practice Hours'
                        placeholder='Practice Hours'
                        // changeInput={handleChangeUpdtConfirmInfo}
                        readOnly={true}
                        errorMessage={errMsgInputUpdtConfirmInfo?.practiceHours}
                    />
                    {/* select room */}
                    {/* <SelectCategory
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
                    /> */}
                    <Input
                        {...styleStarInputEdit}
                        {...propsInputEdit}
                        {...propsErrMsg}
                        type='text'
                        nameInput='roomName'
                        placeholder='Room Name'
                        valueInput={chooseDocUpdtConf?.room ? chooseDocUpdtConf.room : ''}
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
                        placeholder='Total Number of Patients in this Room'
                        valueInput={patientOfCurrentDiseaseTForUpdtConfInfo?.length}
                        title='Total Number of Patients in this Room'
                        readOnly={true}
                        errorMessage={errMsgInputUpdtConfirmInfo?.totalQueue}
                    />
                    <Input
                        {...styleStarInputEdit}
                        {...propsInputEdit}
                        {...propsErrMsg}
                        type='text'
                        nameInput='treatmentHours'
                        valueInput={inputUpdtConfirmInfo.treatmentHours}
                        title='Treatment Hours'
                        placeholder='Treatment Hours (08:00 - 12:00)'
                        changeInput={handleChangeUpdtConfirmInfo}
                        errorMessage={errMsgInputUpdtConfirmInfo?.treatmentHours}
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
                            {patientData?.id ? (
                                <>
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
                                                    {!patientData?.isConfirm?.id && !findCurrentPatientFinishTreatment?.id && (
                                                        <>
                                                            <HeadConfirmInfo
                                                                icon="fa-sharp fa-solid fa-circle-exclamation"
                                                                styleTitle={{
                                                                    color: '#fa9c1b'
                                                                }}
                                                                desc="Not yet confirmed"
                                                            />
                                                        </>
                                                    )}
                                                    {!patientData?.isConfirm?.id && findCurrentPatientFinishTreatment?.id && (
                                                        <>
                                                            <HeadConfirmInfo
                                                                icon="fa-solid fa-ban"
                                                                styleTitle={{
                                                                    color: '#ff296d'
                                                                }}
                                                                desc="Canceled"
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
                                                        {...propsIconDataInfo}
                                                        title="Appointment Date"
                                                        icon="fa-solid fa-calendar-days"
                                                        firstDesc={makeNormalDateOnPatientInfo(patientData.appointmentDate)}
                                                        desc={patientData.appointmentDate}
                                                        styleFirstDesc={{
                                                            marginBottom: '5px',
                                                            fontSize: '14px',
                                                            fontWeight: 'bold',
                                                            color: '#f85084'
                                                        }}
                                                        styleDesc={{
                                                            fontSize: '12px'
                                                        }}
                                                    />
                                                    <CardPatientRegisData
                                                        title="Submission Date"
                                                        firstDesc={makeNormalDateOnPatientInfo(patientData.submissionDate)}
                                                        desc={patientData.submissionDate}
                                                        styleFirstDesc={{
                                                            marginBottom: '5px',
                                                            fontSize: '14px',
                                                            fontWeight: 'bold',
                                                            color: '#7600bc'
                                                        }}
                                                        styleDesc={{
                                                            fontSize: '12px'
                                                        }}
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
                                                        firstDesc={makeNormalDateOnPatientInfo(patientData.dateOfBirth)}
                                                        desc={patientData.dateOfBirth}
                                                        styleFirstDesc={{
                                                            marginBottom: '5px',
                                                            fontSize: '14px',
                                                            fontWeight: 'bold',
                                                            color: '#288bbc'
                                                        }}
                                                        styleDesc={{
                                                            fontSize: '12px'
                                                        }}
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
                                                        title="Patient Complaints"
                                                        desc={patientData?.patientComplaints}
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
                                                                    textTransform: 'uppercase',
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
                                                                styleDesc={{
                                                                    color: '#006400'
                                                                }}
                                                            />
                                                            <CardPatientRegisData
                                                                {...propsIconDataInfo}
                                                                icon="fa-solid fa-calendar-days"
                                                                title="Confirmed Date"
                                                                firstDesc={makeNormalDateOnPatientInfo(patientData?.isConfirm?.dateConfirm)}
                                                                desc={patientData?.isConfirm?.dateConfirm}
                                                                styleFirstDesc={{
                                                                    marginBottom: '5px',
                                                                    fontSize: '14px',
                                                                    fontWeight: 'bold',
                                                                    color: '#006400'
                                                                }}
                                                                styleDesc={{
                                                                    fontSize: '12px'
                                                                }}
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

                                                {/* Button re confirmation */}
                                                {patientData?.isConfirm?.id && !findPatientInLoket?.patientId && !findCurrentPatientFinishTreatment?.patientId && (
                                                    <div className={`${style['data']} container-re-confirm`}>
                                                        <Button
                                                            name="RESEND CONFIRMATION"
                                                            style={{
                                                                widh: 'auto',
                                                                margin: '10px 0'
                                                            }}
                                                            click={clickResendConfirmation}
                                                            styleLoading={{
                                                                display: loadingSubmitConfPatient ? 'flex' : 'none'
                                                            }}
                                                        />
                                                        <Button
                                                            name="CANCEL REGISTRATION"
                                                            style={{
                                                                width: 'auto',
                                                                margin: '10px 0'
                                                            }}
                                                            click={clickCancelRegisAfterConfirm}
                                                            styleLoading={{
                                                                display: loadCancelRegisAfterConf ? 'flex' : 'none',
                                                                backgroundColor: '#ff296d'
                                                            }}
                                                            classBtn="not-present-btn"
                                                            styleLoadCircle={{
                                                                borderTopColor: '#ff296d'
                                                            }}
                                                        />
                                                    </div>
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
                                                                    display: loadingSubmitConfToLoket ? 'flex' : 'none'
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
                                                                        display: loadingPatientNotPresentInCalling ? 'flex' : 'none',
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

                                                {/* form confirm */}
                                                {!patientData?.isConfirm?.id && !findCurrentPatientFinishTreatment?.id && (
                                                    <>
                                                        <h1 className={style['title-confirm']}>
                                                            Form Confirmation
                                                        </h1>

                                                        <div className={style['form-confirm']}>
                                                            <div className={style['input']}>
                                                                {/* select doctor */}
                                                                <SelectCategory
                                                                    styleWrapp={{
                                                                        margin: '0px 0'
                                                                    }}
                                                                    styleTitle={{
                                                                        fontSize: '13px'
                                                                    }}
                                                                    titleCtg="Doctor Specialist"
                                                                    idSelect="chooseSpecialist"
                                                                    handleCategory={handleChooseSpecialist}
                                                                    dataBlogCategory={getAllDoctorSpecialist()}
                                                                />
                                                            </div>
                                                            <div className={style['input']}>
                                                                <Input
                                                                    {...propsInputEdit}
                                                                    {...propsErrMsg}
                                                                    type='text'
                                                                    nameInput='doctorSpecialist'
                                                                    placeholder='doctor specialist...'
                                                                    valueInput={chooseSpecialist?.specialist !== null ? chooseSpecialist?.specialist : ''}
                                                                    title='Doctor Specialist'
                                                                    readOnly={true}
                                                                    errorMessage={errSubmitConfPatient?.doctorSpecialist}
                                                                />
                                                            </div>
                                                            <div className={style['input']}>
                                                                {/* select day on appointment date patient */}
                                                                <SelectCategory
                                                                    styleWrapp={{
                                                                        margin: '0px 0'
                                                                    }}
                                                                    styleTitle={{
                                                                        fontSize: '13px'
                                                                    }}
                                                                    titleCtg="Doctor Schedule"
                                                                    idSelect="chooseDayConf"
                                                                    handleCategory={handleChooseDay}
                                                                    dataBlogCategory={listChooseDay}
                                                                />
                                                            </div>
                                                            <div className={style['input']}>
                                                                <Input
                                                                    {...propsInputEdit}
                                                                    {...propsErrMsg}
                                                                    type='text'
                                                                    nameInput='chooseDayConf'
                                                                    placeholder='Choose Day'
                                                                    valueInput={chooseDayConf?.title ? chooseDayConf.title : ''}
                                                                    title='Choose Day'
                                                                    readOnly={true}
                                                                    errorMessage={errSubmitConfPatient?.chooseDayConf}
                                                                />
                                                            </div>
                                                            <div className={style['input']}>
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
                                                                    dataBlogCategory={listDoctorOnSpecialist}
                                                                />
                                                            </div>
                                                            <div className={style['input']}>
                                                                <Input
                                                                    {...propsInputEdit}
                                                                    {...propsErrMsg}
                                                                    type='text'
                                                                    nameInput='nameDoctor'
                                                                    placeholder='doctor name...'
                                                                    valueInput={chooseDoctor?.name ? chooseDoctor?.name : ''}
                                                                    title='Doctor Name'
                                                                    readOnly={true}
                                                                    errorMessage={errSubmitConfPatient?.nameDoctor}
                                                                />
                                                            </div>
                                                            {/* select room */}
                                                            {/* <div className={style['input']}>
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
                                                    </div> */}
                                                            <div className={style['input']}>
                                                                <Input
                                                                    {...propsInputEdit}
                                                                    {...propsErrMsg}
                                                                    type='text'
                                                                    nameInput='practiceHours'
                                                                    placeholder='Practice Hours...'
                                                                    valueInput={practiceHoursDoc !== null ? practiceHoursDoc : ''}
                                                                    title='Practice Hours'
                                                                    readOnly={true}
                                                                    errorMessage={errSubmitConfPatient?.practiceHours}
                                                                />
                                                            </div>
                                                            <div className={style['input']}>
                                                                <Input
                                                                    {...propsInputEdit}
                                                                    {...propsErrMsg}
                                                                    type='text'
                                                                    nameInput='roomName'
                                                                    placeholder='room name...'
                                                                    valueInput={chooseDoctor?.room ? chooseDoctor.room : ''}
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
                                                            {checkCurrentDSOnDayAppointment && chooseDoctor?.id && (
                                                                <>
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
                                                                            title={`Treatment Hours "Example" (08:00 - 10:00)`}
                                                                            changeInput={handleChangeInputConfirm}
                                                                            errorMessage={errSubmitConfPatient?.treatmentHours}
                                                                        />
                                                                    </div>
                                                                </>
                                                            )}
                                                            <div className={style['input']} style={{
                                                                flexDirection: 'row',
                                                                justifyContent: 'flex-start'
                                                            }}>
                                                                <Button
                                                                    name="CONFIRM PATIENT"
                                                                    style={{
                                                                        width: 'auto',
                                                                        margin: '0 0 10px 0'
                                                                    }}
                                                                    click={submitConfirmPatient}
                                                                    styleLoading={{
                                                                        display: loadingSubmitConfPatient ? 'flex' : 'none'
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className={style['input']} style={{
                                                                flexDirection: 'row',
                                                                justifyContent: 'flex-end'
                                                            }}>
                                                                <Button
                                                                    name="CANCEL REGISTRATION"
                                                                    style={{
                                                                        width: 'auto',
                                                                        margin: '0 0 10px 0'
                                                                    }}
                                                                    click={clickCancelRegistration}
                                                                    styleLoading={{
                                                                        display: loadingSubmitConfPatient ? 'flex' : 'none',
                                                                        backgroundColor: '#ff296d'
                                                                    }}
                                                                    classBtn="not-present-btn"
                                                                    styleLoadCircle={{
                                                                        borderTopColor: '#ff296d'
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {/* info pasien di loket */}
                                    {params.length === 8 && (
                                        <>
                                            <h1 className={style['title']} style={{
                                                margin: '50px 0 0 0',
                                                fontSize: '28px'
                                            }}>
                                                <span className={style['patient-of']}>Counter From</span>
                                                <span className={style['name']}>
                                                    {findPatientInLoket?.loketName}
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
                                                                title="Hours Submitted"
                                                                desc={findPatientInLoket?.submitHours}
                                                                styleIcon={{
                                                                    display: 'flex'
                                                                }}
                                                                icon='fa-solid fa-clock'
                                                            />
                                                            <CardPatientRegisData
                                                                title="Submission Date"
                                                                firstDesc={makeNormalDateOnPatientInfo(findPatientInLoket?.submissionDate)}
                                                                desc={findPatientInLoket?.submissionDate}
                                                                styleFirstDesc={{
                                                                    marginBottom: '5px',
                                                                    fontSize: '14px',
                                                                    fontWeight: 'bold',
                                                                    color: '#495057'
                                                                }}
                                                                styleDesc={{
                                                                    fontSize: '12px',
                                                                }}
                                                            />
                                                            {findPatientInLoket?.isConfirm?.confirmState === false && (
                                                                <CardPatientRegisData
                                                                    title="Status"
                                                                    desc={findPatientInLoket?.submissionDate === currentDate ? 'IN PROGRESS' : 'EXPIRED'}
                                                                    styleDesc={{
                                                                        color: findPatientInLoket?.submissionDate === currentDate ? '#288bbc' : '#ff296d',
                                                                        fontWeight: 'bold'
                                                                    }}
                                                                />
                                                            )}
                                                            {/* <CardPatientRegisData
                                                        title="Disease Type"
                                                        desc={patientData?.jenisPenyakit}
                                                    /> */}
                                                            <CardPatientRegisData
                                                                title="Counter Name"
                                                                desc={findPatientInLoket.loketName}
                                                            />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <></>
                                                )}

                                                {/* form confirm patient finished treatment */}
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
                                                                        style={{
                                                                            widh: 'auto',
                                                                            margin: '20px 0 0 0'
                                                                        }}
                                                                        click={clickPatientNotPresentInCounter}
                                                                        classBtn="not-present-btn"
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
                                                                    color: '#ffa500',
                                                                }}
                                                            />
                                                            <CardPatientRegisData
                                                                title="Confirmed Date"
                                                                icon="fa-solid fa-calendar-days"
                                                                firstDesc={makeNormalDateOnPatientInfo(findPatientInLoket?.isConfirm?.dateConfirm)}
                                                                desc={findPatientInLoket?.isConfirm?.dateConfirm}
                                                                styleFirstDesc={{
                                                                    marginBottom: '5px',
                                                                    fontSize: '14px',
                                                                    fontWeight: 'bold',
                                                                    color: '#ffa500'
                                                                }}
                                                                styleIcon={{
                                                                    display: 'flex'
                                                                }}
                                                                styleDesc={{
                                                                    fontSize: '12px',
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
                                                                    desc={findPatientInLoket?.isConfirm?.paymentInfo?.paymentMethod !== '-' ? numberFormatIndo(findPatientInLoket?.isConfirm?.paymentInfo?.totalCost) : '-'}
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
                                </>
                            ) : (
                                <div className={style['white-content']}>
                                    <h1>No Patient Data</h1>
                                </div>
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