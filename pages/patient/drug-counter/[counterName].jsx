import { useState, useEffect, useContext, useMemo } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import style from 'styles/DetailCounter.module.scss'
import { AuthContext } from 'lib/context/auth'
import { NotFoundRedirectCtx } from 'lib/context/notFoundRedirect'
import useSwr from 'lib/useFetch/useSwr'
import endpoint from 'lib/api/endpoint'
import TableContainer from 'components/Table/TableContainer'
import TableBody from 'components/Table/TableBody'
import TableHead from 'components/Table/TableHead'
import TableColumns from 'components/Table/TableColumns'
import TableData from 'components/Table/TableData'
import API from 'lib/api'
import { dayNamesEng } from 'lib/namesOfCalendar/dayNamesEng'
import { dayNamesInd } from 'lib/namesOfCalendar/dayNamesInd'
import { monthNames } from 'lib/namesOfCalendar/monthNames'
import monthNamesInd from 'lib/namesOfCalendar/monthNameInd'
import Pagination from 'components/Pagination/Pagination'
import TableFilter from 'components/Table/TableFilter'
import specialCharacter from 'lib/regex/specialCharacter'
import spaceString from 'lib/regex/spaceString'

function DetailCounter() {
    const [currentPage, setCurrentPage] = useState(1)
    const [head] = useState([
        {
            name: 'Queue Number'
        },
        {
            name: 'Patient Name'
        },
        {
            name: 'Status'
        },
        {
            name: 'Counter Name'
        },
        {
            name: 'Email'
        },
        {
            name: 'Phone'
        },
        {
            name: 'Date of Birth'
        },
        {
            name: 'Patient ID'
        },
    ])
    const [idDataRegisForUpdt, setIdDataRegisForUpdt] = useState(null)
    const [loadingSubmit, setLoadingSubmit] = useState(false)
    const [searchText, setSearchText] = useState('')
    const [displayOnCalendar, setDisplayOnCalendar] = useState(false)
    const [selectDate, setSelectDate] = useState()
    const [chooseFilterBy, setChooseFilterBy] = useState({
        id: 'Filter by',
        title: 'Filter by'
    })
    const [filterBy] = useState([
        {
            id: 'Filter by',
            title: 'Filter by',
        },
        {
            id: 'Status',
            title: 'Status',
        },
        {
            id: 'Date of Birth',
            title: 'Date of Birth',
        },
    ])
    const [chooseFilterStatus, setChooseFilterStatus] = useState({
        id: 'Choose Status',
        title: 'Choose Status'
    })
    const [onFilterStatus, setOnFilterStatus] = useState(false)
    const [dataFilterStatus] = useState([
        {
            id: 'Choose Status',
            title: 'Choose Status'
        },
        {
            id: 'IN PROGRESS',
            title: 'IN PROGRESS'
        },
        {
            id: 'EXPIRED',
            title: 'EXPIRED'
        },
    ])

    const router = useRouter()
    const { counterName = '' } = router.query

    // swr fetching
    // servicing hours data
    const { data: dataService, error: errService, isLoading: loadService } = useSwr(endpoint.getServicingHours())
    const bookAnAppointment = dataService?.data?.find(item => item.id === 'book-an-appointment')
    const getUserAppointmentData = bookAnAppointment?.userAppointmentData
    const userAppointmentData = getUserAppointmentData?.length > 0 ? getUserAppointmentData : []

    // loket data
    const { data: loketData, error: errLoketData, isLoading: loadLoketData } = useSwr(endpoint.getLoket())
    const findLoketPatientQueue = loketData?.data ? loketData.data.filter(item => item?.loketRules === 'patient-queue') : null
    const getCurrentLoket = findLoketPatientQueue?.length > 0 ? findLoketPatientQueue.filter(item => item.loketName === counterName && item?.isConfirm?.confirmState === false) : null

    // now date
    const newGetCurrentMonth = new Date().getMonth() + 1
    const getCurrentMonth = newGetCurrentMonth.toString().length === 1 ? `0${newGetCurrentMonth}` : newGetCurrentMonth
    const getCurrentDate = new Date().getDate().toString().length === 1 ? `0${new Date().getDate()}` : new Date().getDate()
    const getCurrentYear = new Date().getFullYear()
    const currentDate = `${getCurrentMonth}/${getCurrentDate}/${getCurrentYear}`

    const getLoket = getCurrentLoket?.length > 0 ? getCurrentLoket.map((item) => {
        const getEveryDetailPatient = userAppointmentData.filter(patient => patient.id === item.patientId)

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

        const checkProgressPatient = item?.submissionDate === currentDate ? 'IN PROGRESS' : 'EXPIRED'

        return {
            _id: item._id,
            id: item.id,
            patientId: item.patientId,
            isNotif: item.isNotif,
            confirmState: item?.isConfirm?.confirmState,
            data: [
                {
                    name: item.queueNumber
                },
                {
                    name: item.patientName
                },
                {
                    name: checkProgressPatient,
                    fontSize: '11px',
                    padding: '5.5px 8px',
                    colorName: '#fff',
                    borderRadius: '3px',
                    statusFilter: checkProgressPatient,
                    background: checkProgressPatient === 'IN PROGRESS' ? '#288bbc' : '#ff296d'
                },
                {
                    name: item.loketName
                },
                {
                    name: getEveryDetailPatient[0]?.emailAddress
                },
                {
                    name: getEveryDetailPatient[0]?.phone
                },
                {
                    firstDesc: makeNormalDate(getEveryDetailPatient[0]?.dateOfBirth, true),
                    color: '#187bcd',
                    colorName: '#777',
                    marginBottom: '4.5px',
                    fontSize: '12px',
                    filterDateOfBirth: true,
                    name: getEveryDetailPatient[0]?.dateOfBirth
                },
                {
                    name: item.patientId
                },
            ]
        }
    }) : []

    // context
    const { user, loadingAuth } = useContext(AuthContext)
    const { onNavLeft } = useContext(NotFoundRedirectCtx)

    useEffect(() => {
        if (!loadLoketData && errLoketData) {
            console.log({ message: 'error loket data', error: errLoketData })
        }
    }, [])

    const filterStatus = onFilterStatus && getLoket?.length > 0 ? getLoket.filter(patient => {
        const findStatus = patient?.data?.filter(data =>
            data?.statusFilter?.toLowerCase() === chooseFilterStatus?.id?.toLowerCase()
        )

        return findStatus?.length > 0
    }) : []

    const makeFormatDate = () => {
        const getCurrentDate = `${selectDate}`.split(' ')
        const getCurrentMonth = monthNames.findIndex(month => month?.toLowerCase() === getCurrentDate[1]?.toLowerCase())
        const getNumberOfCurrentMonth = getCurrentMonth?.toString()?.length === 1 ? `0${getCurrentMonth + 1}` : `${getCurrentMonth + 1}`
        const dateNow = getCurrentDate[2]
        const yearsNow = getCurrentDate[3]
        const currentDate = `${getNumberOfCurrentMonth}/${dateNow}/${yearsNow}`

        return currentDate
    }

    const filterDateOfBirth = selectDate !== undefined && getLoket?.length > 0 ? getLoket.filter(patient => {
        const findDateOfBirth = patient?.data?.filter(data =>
            data?.filterDateOfBirth &&
            data?.name === makeFormatDate()
        )

        return findDateOfBirth?.length > 0
    }) : []

    const checkFilterBy = ()=>{
        if (onFilterStatus) {
            return filterStatus
        }
        if(selectDate !== undefined){
            return filterDateOfBirth
        }

        return getLoket
    }

    const filterText = checkFilterBy()?.length > 0 ? checkFilterBy().filter(patient => {
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

    const changeTableStyle = () => {
        let elementTHead = document.getElementById('tHead0')
        let elementTData = document.getElementById('tData00')

        if (elementTHead) {
            elementTHead = document.getElementById(`tHead0`)
            elementTHead.style.width = 'calc(100%/10)'
            elementTHead = document.getElementById(`tHead1`)
            elementTHead.style.width = 'calc(100%/7)'
            elementTHead = document.getElementById(`tHead2`)
            elementTHead.style.width = 'calc(100%/10)'
            elementTHead = document.getElementById(`tHead3`)
            elementTHead.style.width = 'calc(100%/9)'
            elementTHead = document.getElementById(`tHead4`)
            elementTHead.style.width = 'calc(100%/6)'
            elementTHead = document.getElementById(`tHead5`)
            elementTHead.style.width = 'calc(100%/8)'
            elementTHead = document.getElementById(`tHead6`)
            elementTHead.style.width = 'calc(100%/10)'
        }
        if (elementTData) {
            for (let i = 0; i < currentTableData?.length; i++) {
                elementTData = document.getElementById(`tData${i}0`)
                if (elementTData?.style) {
                    elementTData.style.width = 'calc(100%/10)'
                    elementTData = document.getElementById(`tData${i}1`)
                    elementTData.style.width = 'calc(100%/7)'
                    elementTData = document.getElementById(`tData${i}2`)
                    elementTData.style.width = 'calc(100%/10)'
                    elementTData = document.getElementById(`tData${i}3`)
                    elementTData.style.width = 'calc(100%/9)'
                    elementTData = document.getElementById(`tData${i}4`)
                    elementTData.style.width = 'calc(100%/6)'
                    elementTData = document.getElementById(`tData${i}5`)
                    elementTData.style.width = 'calc(100%/8)'
                    elementTData = document.getElementById(`tData${i}6`)
                    elementTData.style.width = 'calc(100%/10)'
                }
            }
        }
    }

    useEffect(() => {
        if (currentTableData?.length > 0) {
            setTimeout(() => {
                changeTableStyle()
            }, 100);
        }
    }, [currentPage, currentTableData])

    const toPage = (path) => {
        router.push(path)
    }

    const clickDeletePersonalDataInCounter = (_id, patientId) => {
        if (idDataRegisForUpdt !== null) {
            alert('There is a process running\nPlease wait a moment')
        } else if (loadingSubmit === false && window.confirm('Delete this data?')) {
            setIdDataRegisForUpdt(_id)
            setLoadingSubmit(true)
            deletePersonalDataInCounter(_id, patientId)
        }
    }

    const deletePersonalDataInCounter = (_id, patientId) => {
        API.APIDeleteLoket(_id)
            .then(res => {
                deleteDataPersonalPatientRegis(patientId, () => {
                    setIdDataRegisForUpdt(null)
                    setLoadingSubmit(false)
                    setTimeout(() => {
                        alert('Deleted successfully')
                    }, 0)
                }, (err) => {
                    alert('Oops, telah terjadi kesalahan server\nMohon coba beberapa saat lagi')
                    setLoadingSubmit(false)
                    console.log(err)
                })
            })
            .catch(err => {
                alert('Oops, telah terjadi kesalahan server\nMohon coba beberapa saat lagi')
                setLoadingSubmit(false)
                console.log(err)
            })
    }

    const deleteDataPersonalPatientRegis = (id, success, error) => {
        API.APIDeletePatientRegistration(bookAnAppointment._id, id)
            .then(res => success())
            .catch(err => error(err))
    }

    const handleFilterDateOfBirth = () => {
        const selectEl = document.getElementById('filterDateTable')
        const id = selectEl.options[selectEl.selectedIndex].value
        if (id) {
            if (id !== 'Filter by' && id !== 'Status') {
                setDisplayOnCalendar(true)
            } else {
                setDisplayOnCalendar(false)
            }
            setSelectDate()

            setChooseFilterBy({
                id: id,
                title: id
            })
            setChooseFilterStatus({
                id: 'Choose Status',
                title: 'Choose Status'
            })
            setOnFilterStatus(false)
            setCurrentPage(() => 1)
        }
    }

    const handleFilterStatus = () => {
        const selectEl = document.getElementById('sortDateTable')
        const id = selectEl.options[selectEl.selectedIndex].value
        if (id) {
            if (id !== 'Choose Status') {
                setOnFilterStatus(true)
            } else {
                setOnFilterStatus(false)
            }
            setChooseFilterStatus({
                id: id,
                title: id
            })
            setCurrentPage(() => 1)
        }
    }

    return (
        <>
            <Head>
                <title>Counter {counterName} | Admin Hospice Medical</title>
                <meta name="description" content="daftar dari pendaftaran pasien yang belum dikonfirmasi" />
            </Head>

            <div className={onNavLeft ? `${style['wrapp']} ${style['wrapp-active']}` : style['wrapp']}>
                <div className={style['container']}>
                    <div className={style['content']}>
                        <h1 className={style['title']}>
                            <span className={style['desc']}>
                                Patient Queue List from Counter
                            </span>
                            <span className={style['name-loket']}>
                                {counterName}
                            </span>
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
                                handleCategory={handleFilterDateOfBirth}
                                displaySortDate={chooseFilterBy?.id === 'Status' ? true : false}
                                dataSortCategory={dataFilterStatus}
                                handleSortCategory={handleFilterStatus}
                            />
                            <TableBody>
                                <div className={style['container-table-content']}>
                                    <TableHead
                                        id='tHead'
                                        data={head}
                                        styleName={{
                                            padding: '15px 8px'
                                        }}
                                    />

                                    {currentTableData.length > 0 ? currentTableData.map((item, index) => {
                                        const pathUrlToDataDetail = `/patient/patient-registration/personal-data/confirmed/${item.data[1]?.name}/${item.patientId}/counter/${counterName}/${item.confirmState ? 'confirmed' : 'not-yet-confirmed'}/${item.data[0]?.name}`

                                        return (
                                            <button key={index} className={style['columns-data']} onClick={() => toPage(pathUrlToDataDetail)}>
                                                <TableColumns
                                                    styleEdit={{
                                                        display: 'none'
                                                    }}
                                                    styleDelete={{
                                                        display: 'none'
                                                    }}
                                                    styleLoadingCircle={{
                                                        display: idDataRegisForUpdt === item._id && loadingSubmit ? 'flex' : 'none'
                                                    }}
                                                    styleIconDelete={{
                                                        display: idDataRegisForUpdt === item._id && loadingSubmit ? 'none' : 'flex'
                                                    }}
                                                    clickDelete={(e) => {
                                                        e.stopPropagation()
                                                        clickDeletePersonalDataInCounter(item._id, item.patientId)
                                                    }}
                                                >
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
                                                                    color: data?.colorName,
                                                                    padding: data?.padding,
                                                                    borderRadius: data?.borderRadius,
                                                                    background: data?.background
                                                                }}
                                                            />
                                                        )
                                                    })}
                                                </TableColumns>
                                            </button>
                                        )
                                    }) : (
                                        <>
                                            <p className={style['no-data']}>There is no queue of patients at the counter</p>
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

export default DetailCounter