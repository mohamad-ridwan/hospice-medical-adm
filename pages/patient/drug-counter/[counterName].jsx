import { useState, useEffect, useContext } from 'react'
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

function DetailCounter() {
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

    const changeTableStyle = () => {
        let elementTHead = document.getElementById('tHead0')
        let elementTData = document.getElementById('tData00')

        if (elementTHead) {
            elementTHead = document.getElementById(`tHead0`)
            elementTHead.style.width = 'calc(100%/10)'
            elementTHead = document.getElementById(`tHead1`)
            elementTHead.style.width = 'calc(100%/7)'
            elementTHead = document.getElementById(`tHead2`)
            elementTHead.style.width = 'calc(100%/8)'
            elementTHead = document.getElementById(`tHead3`)
            elementTHead.style.width = 'calc(100%/6)'
            elementTHead = document.getElementById(`tHead4`)
            elementTHead.style.width = 'calc(100%/8)'
        }
        if (elementTData) {
            for (let i = 0; i < getLoket?.length; i++) {
                elementTData = document.getElementById(`tData${i}0`)
                elementTData.style.width = 'calc(100%/10)'
                elementTData = document.getElementById(`tData${i}1`)
                elementTData.style.width = 'calc(100%/7)'
                elementTData = document.getElementById(`tData${i}2`)
                elementTData.style.width = 'calc(100%/8)'
                elementTData = document.getElementById(`tData${i}3`)
                elementTData.style.width = 'calc(100%/6)'
                elementTData = document.getElementById(`tData${i}4`)
                elementTData.style.width = 'calc(100%/8)'
            }
        }
    }

    useEffect(() => {
        if (getLoket?.length > 0) {
            setTimeout(() => {
                changeTableStyle()
            }, 100);
        }
    }, [getLoket])

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
                            <TableBody>
                                <TableHead
                                    id='tHead'
                                    data={head}
                                    styleName={{
                                        padding: '15px 8px'
                                    }}
                                />

                                {getLoket.length > 0 ? getLoket.map((item, index) => {
                                    const pathUrlToDataDetail = `/patient/patient-registration/personal-data/confirmed/${item.data[1]?.name}/${item.patientId}/counter/${counterName}/${item.confirmState ? 'confirmed' : 'not-yet-confirmed'}/${item.data[0]?.name}`

                                    return (
                                        <button key={index} className={style['columns-data']} onClick={() => toPage(pathUrlToDataDetail)}>
                                            <TableColumns
                                                styleEdit={{
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
                            </TableBody>
                        </TableContainer>
                    </div>
                </div>
            </div>
        </>
    )
}

export default DetailCounter