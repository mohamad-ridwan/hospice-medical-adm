import { useContext, useState, useEffect, useMemo } from 'react'
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
import { dayNamesEng } from 'lib/namesOfCalendar/dayNamesEng'
import { dayNamesInd } from 'lib/namesOfCalendar/dayNamesInd'
import { monthNames } from 'lib/namesOfCalendar/monthNames'
import monthNamesInd from 'lib/namesOfCalendar/monthNameInd'
import Pagination from 'components/Pagination/Pagination'
import TableFilter from 'components/Table/TableFilter'
import specialCharacter from 'lib/regex/specialCharacter'
import spaceString from 'lib/regex/spaceString'

function PatientRegistration() {
    const [currentPage, setCurrentPage] = useState(1)
    const [head] = useState([
        {
            name: 'Patient Name'
        },
        {
            name: 'Appointment Date'
        },
        {
            name: 'Submission Date'
        },
        {
            name: 'Hours Submitted'
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
    const [filterBy] = useState([
        {
            id: 'Off Date',
            title: 'Off Date',
        },
        {
            id: 'Appointment Date',
            title: 'Appointment Date',
        },
        {
            id: 'Submission Date',
            title: 'Submission Date',
        },
        {
            id: 'Date of Birth',
            title: 'Date of Birth',
        },
    ])
    const [searchText, setSearchText] = useState('')
    const [displayOnCalendar, setDisplayOnCalendar] = useState(false)
    const [chooseFilterByDate, setChooseFilterByDate] = useState({
        id: 'Off Date',
        title: 'Off Date'
    })
    const [dataSortDate] = useState([
        {
            id: 'Off Sort Date',
            title: 'Off Sort Date'
        },
        {
            id: 'On Sort Date',
            title: 'On Sort Date'
        },
    ])
    const [chooseOnSortDate, setChooseOnSortDate] = useState({
        id: 'Off Sort Date',
        title: 'Off Sort Date'
    })
    const [onSortDate, setOnSortDate] = useState(false)
    const [selectDate, setSelectDate] = useState()

    // swr fetching data
    // servicing hours
    const { data: dataService, error: errService, isLoading: loadService } = useSwr(endpoint.getServicingHours())
    const bookAnAppointment = dataService?.data?.find(item => item.id === 'book-an-appointment')

    // finished treatment data
    const { data: dataFinishTreatment, error: errDataFinishTreatment, isLoading: loadDataFinishTreatment } = useSwr(endpoint.getFinishedTreatment())
    const getPatientRegis = dataFinishTreatment?.data ? dataFinishTreatment?.data?.filter(item => item.rulesTreatment === 'patient-registration') : null

    // context
    const { user, loadingAuth } = useContext(AuthContext)
    const { onNavLeft } = useContext(NotFoundRedirectCtx)

    const router = useRouter()

    const mailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

    const findDataRegistration = () => {
        if (bookAnAppointment) {
            const userAppointmentData = bookAnAppointment.userAppointmentData
            const findRegistration = userAppointmentData?.length > 0 ? userAppointmentData.filter(regis => {
                const findPatientFT = getPatientRegis?.length > 0 ? getPatientRegis.find(patient => patient?.patientId === regis.id) : {}

                return !regis.isConfirm?.id && findPatientFT?.id === undefined
            }) : null
            if (findRegistration) {
                const newData = []
                const getDataColumns = () => {
                    findRegistration.forEach(item => {
                        // make a normal date
                        const makeNormalDate = (date, dateOfBirth) => {
                            const getDate = `${new Date(date)}`
                            const findIdxDayNameOfAD = dayNamesEng.findIndex(day => day === getDate.split(' ')[0]?.toLowerCase())
                            const getNameOfAD = `${dayNamesInd[findIdxDayNameOfAD]?.substr(0, 1)?.toUpperCase()}${dayNamesInd[findIdxDayNameOfAD]?.substr(1, dayNamesInd[findIdxDayNameOfAD]?.length - 1)}`
                            const findIdxMonthOfAD = monthNames.findIndex(month => month.toLowerCase() === getDate.split(' ')[1]?.toLowerCase())
                            const getMonthOfAD = monthNamesInd[findIdxMonthOfAD]
                            const getDateOfAD = date?.split('/')[1]
                            const getYearOfAD = date?.split('/')[2]

                            return !dateOfBirth ? `${getMonthOfAD} ${getDateOfAD} ${getYearOfAD}, ${getNameOfAD}` : `${getMonthOfAD} ${getDateOfAD} ${getYearOfAD}`
                        }

                        const dataRegis = {
                            id: item.id,
                            isNotif: item.isNotif,
                            data: [
                                {
                                    name: item.patientName
                                },
                                {
                                    firstDesc: makeNormalDate(item.appointmentDate),
                                    color: '#ff296d',
                                    colorName: '#777',
                                    marginBottom: '4.5px',
                                    fontSize: '12px',
                                    filterBy: 'Appointment Date',
                                    clock: item.clock,
                                    name: item.appointmentDate,
                                },
                                {
                                    firstDesc: makeNormalDate(item.submissionDate),
                                    color: '#7600bc',
                                    colorName: '#777',
                                    marginBottom: '4.5px',
                                    fontSize: '12px',
                                    filterBy: 'Submission Date',
                                    clock: item.clock,
                                    name: item.submissionDate
                                },
                                {
                                    name: item.clock
                                },
                                {
                                    name: item.emailAddress
                                },
                                {
                                    firstDesc: makeNormalDate(item.dateOfBirth, true),
                                    color: '#187bcd',
                                    colorName: '#777',
                                    marginBottom: '4.5px',
                                    fontSize: '12px',
                                    filterBy: 'Date of Birth',
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
                if (newData.length === findRegistration?.length) {
                    setDataColumns(newData)
                    setTimeout(() => {
                        setLoadConditionTableScreen(false)
                    }, 500)
                }
            } else {
                setLoadConditionTableScreen(false)
            }
        }
    }

    useEffect(() => {
        if (!loadService && !loadDataFinishTreatment && dataService && dataFinishTreatment) {
            findDataRegistration()
        } else if (!loadService && errService) {
            console.log('error data servicing hours')
            console.log(errService)
        }
        if (!loadDataFinishTreatment && errDataFinishTreatment) {
            console.log('error data finished treatment')
            console.log(dataFinishTreatment)
        }
    }, [dataService, dataFinishTreatment])

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
                elementTHead.style.width = 'calc(100%/7)'
                elementTHead = document.getElementById(`tHead2`)
                elementTHead.style.width = 'calc(100%/8)'
                elementTHead = document.getElementById(`tHead3`)
                elementTHead.style.width = 'calc(100%/8)'
                elementTHead = document.getElementById(`tHead4`)
                elementTHead.style.width = 'calc(100%/6)'
                elementTHead = document.getElementById(`tHead5`)
                elementTHead.style.width = 'calc(100%/10)'
            }
            if (elementTData) {
                for (let i = 0; i < dataColumnsBody?.length; i++) {
                    elementTData = document.getElementById(`tData${i}0`)
                    if (elementTData?.style) {
                        elementTData.style.width = 'calc(100%/7)'
                        elementTData = document.getElementById(`tData${i}1`)
                        elementTData.style.width = 'calc(100%/7)'
                        elementTData = document.getElementById(`tData${i}2`)
                        elementTData.style.width = 'calc(100%/8)'
                        elementTData = document.getElementById(`tData${i}3`)
                        elementTData.style.width = 'calc(100%/8)'
                        elementTData = document.getElementById(`tData${i}4`)
                        elementTData.style.width = 'calc(100%/6)'
                        elementTData = document.getElementById(`tData${i}5`)
                        elementTData.style.width = 'calc(100%/10)'
                    }
                }
            }
        }
    }

    const makeFormatDate = () => {
        const getCurrentDate = `${selectDate}`.split(' ')
        const getCurrentMonth = monthNames.findIndex(month => month?.toLowerCase() === getCurrentDate[1]?.toLowerCase())
        const getNumberOfCurrentMonth = getCurrentMonth?.toString()?.length === 1 ? `0${getCurrentMonth + 1}` : `${getCurrentMonth + 1}`
        const dateNow = getCurrentDate[2]
        const yearsNow = getCurrentDate[3]
        const currentDate = `${getNumberOfCurrentMonth}/${dateNow}/${yearsNow}`

        return currentDate
    }

    const filterByDate = dataColumns?.length > 0 ? dataColumns.filter(patient => {
        const findDate = selectDate !== undefined ? patient?.data?.filter(data =>
            data?.filterBy?.toLowerCase() === chooseFilterByDate?.id?.toLowerCase() &&
            data?.name === makeFormatDate())
            : []

        return findDate?.length > 0
    }) : []

    const checkFilterByDate = () => {
        if (selectDate !== undefined) {
            return filterByDate
        }

        return dataColumns
    }
    const sortDate = onSortDate && filterByDate?.length > 0 ? filterByDate.sort((p1, p2) => {
        const findDateOnSelectDateP1 = p1?.data?.find(data =>
            data?.filterBy?.toLowerCase() === chooseFilterByDate?.id?.toLowerCase()
        )
        const findDateOnSelectDateP2 = p2?.data?.find(data =>
            data?.filterBy?.toLowerCase() === chooseFilterByDate?.id?.toLowerCase()
        )

        return new Date(`${findDateOnSelectDateP1?.name} ${findDateOnSelectDateP1?.clock}`) - new Date(`${findDateOnSelectDateP2?.name} ${findDateOnSelectDateP2?.clock}`)
    }) : []

    const checkSortSubmissionDate = () => {
        if (onSortDate) {
            return sortDate
        }

        return checkFilterByDate()
    }

    const filterText = checkSortSubmissionDate()?.length > 0 ? checkSortSubmissionDate().filter(patient => {
        const findItem = patient?.data?.filter(data => data?.name?.replace(specialCharacter, '')?.replace(spaceString, '')?.toLowerCase()?.includes(searchText?.replace(spaceString, '')?.toLowerCase()))

        return findItem?.length > 0
    }) : []

    useEffect(() => {
        setCurrentPage(() => 1)
    }, [searchText])

    let pageSize = 10

    const currentTableData = useMemo(() => {
        const firstPageIndex = (currentPage - 1) * 5
        const lastPageIndex = firstPageIndex + pageSize
        return filterText?.slice(firstPageIndex, lastPageIndex)
    }, [currentPage, filterText])

    useEffect(() => {
        if (currentTableData?.length > 0) {
            setTimeout(() => {
                changeTableStyle(currentTableData)
            }, 500)
        }
    }, [currentPage, currentTableData])

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

    const handleFilterDate = () => {
        const selectEl = document.getElementById('filterDateTable')
        const id = selectEl.options[selectEl.selectedIndex].value
        if (id) {
            if (id !== 'Off Date') {
                setDisplayOnCalendar(true)
            } else {
                setDisplayOnCalendar(false)
                setSelectDate()
            }

            setChooseFilterByDate({
                id: id,
                title: id
            })
            setOnSortDate(false)
        }
    }

    const handleSortCategory = () => {
        const selectEl = document.getElementById('sortDateTable')
        const id = selectEl.options[selectEl.selectedIndex].value
        if (id) {
            if (id !== 'Off Sort Date') {
                setOnSortDate(true)
            } else {
                setOnSortDate(false)
            }

            setChooseOnSortDate({
                id: id,
                title: id
            })
        }
    }

    return (
        <>
            <Head>
                <title>Patient Registration | Admin Hospice Medical</title>
                <meta name="description" content="daftar dari pendaftaran pasien yang belum dikonfirmasi" />
            </Head>

            {/* Pop up edit */}
            {/* <WrappEditPR
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
            </WrappEditPR> */}

            <div className={onNavLeft ? `${style['wrapp']} ${style['wrapp-active']}` : style['wrapp']}>
                <div className={style['container']}>
                    <div className={style['content']}>
                        <h1 className={style['title']}>
                            List of Patient Registration
                        </h1>

                        <TableContainer styleWrapp={{
                            margin: '50px 0 0 0'
                        }}>
                            <TableFilter
                                placeholder='Search text'
                                displayOnCalendar={displayOnCalendar}
                                dataBlogCategory={filterBy}
                                valueInput={searchText}
                                changeInput={(e) => setSearchText(e.target.value)}
                                selected={selectDate}
                                changeCalendar={(date) => {
                                    setCurrentPage(() => 1)
                                    setSelectDate(date)
                                }}
                                handleCategory={handleFilterDate}
                                dataSortCategory={dataSortDate}
                                handleSortCategory={handleSortCategory}
                                displaySortDate={selectDate !== undefined && chooseFilterByDate?.id !== 'Date of Birth' && currentTableData?.length > 0 ? true : false}
                            />
                            <TableBody
                            // styleWrapp={{
                            //     width: '1300px'
                            // }}
                            >
                                <div className={style['container-table-content']}>
                                    <TableHead
                                        id='tHead'
                                        data={head}
                                    />
                                    {!loadingAuth && user?.id && !loadConditionTableScreen ? (
                                        <>
                                            {currentTableData?.length > 0 ? currentTableData.map((item, index) => {
                                                const pathUrlToDataDetail = `patient-registration/personal-data/not-yet-confirmed/${item.data[0]?.name}/${item.id}`

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
                                                                // color: item.isNotif ? 'transparent' : '#ff296d'
                                                                color: item.isNotif ? 'transparent' : 'transparent'
                                                            }}></i>
                                                            {item.data.map((data, idx) => {
                                                                return (
                                                                    <TableData
                                                                        key={idx}
                                                                        id={`tData${index}${idx}`}
                                                                        firstDesc={data?.firstDesc}
                                                                        name={data.name}
                                                                        styleWrapp={{
                                                                            cursor: 'pointer'
                                                                        }}
                                                                        styleFirstDesc={{
                                                                            color: data?.color,
                                                                            marginBottom: data?.marginBottom
                                                                        }}
                                                                        styleName={{
                                                                            fontSize: data?.fontSize,
                                                                            color: data?.colorName
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
                                </div>
                            </TableBody>
                            <Pagination
                                currentPage={currentPage}
                                totalCount={filterText?.length}
                                pageSize={pageSize}
                                onPageChange={(pageNumber) => setCurrentPage(pageNumber)}
                            />
                        </TableContainer>
                    </div>
                </div>
            </div>
        </>
    )
}

export default PatientRegistration