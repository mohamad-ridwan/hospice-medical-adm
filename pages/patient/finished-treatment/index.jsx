import { useState, useContext, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import style from 'styles/FinishedTreatment.module.scss'
import { AuthContext } from 'lib/context/auth'
import { NotFoundRedirectCtx } from 'lib/context/notFoundRedirect'
import TableContainer from 'components/Table/TableContainer'
import TableBody from 'components/Table/TableBody'
import TableHead from 'components/Table/TableHead'
import useSwr from 'lib/useFetch/useSwr'
import endpoint from 'lib/api/endpoint'
import TableColumns from 'components/Table/TableColumns'
import TableData from 'components/Table/TableData'
import { monthNames } from 'lib/namesOfCalendar/monthNames'
import { dayNamesEng } from 'lib/namesOfCalendar/dayNamesEng'
import { dayNamesInd } from 'lib/namesOfCalendar/dayNamesInd'
import monthNamesInd from 'lib/namesOfCalendar/monthNameInd'
import API from 'lib/api'

function FinishedTreatment() {
    const [idDeleteDataRegis, setIdDeleteDataRegis] = useState(null)
    const [loadingDelete, setLoadingDelete] = useState(false)
    const [head] = useState([
        {
            name: 'Patient Name'
        },
        {
            name: 'Status'
        },
        {
            name: 'State Record'
        },
        {
            name: 'Confirmation Date'
        },
        {
            name: 'Confirmation Hour'
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

    // context
    const { user, loadingAuth } = useContext(AuthContext)
    const { onNavLeft } = useContext(NotFoundRedirectCtx)

    const router = useRouter()

    // swr fetching
    // servicing hours data
    const { data: dataService, error: errService, isLoading: loadService } = useSwr(endpoint.getServicingHours())
    const bookAnAppointment = dataService?.data?.find(item => item.id === 'book-an-appointment')
    const getUserAppointmentData = bookAnAppointment?.userAppointmentData
    const userAppointmentData = getUserAppointmentData?.length > 0 ? getUserAppointmentData : []

    // loket
    const { data: loketData, error: errLoketData, isLoading: loadLoketData } = useSwr(endpoint.getLoket())
    const findLoketPatientQueue = loketData?.data ? loketData.data.filter(item => item?.loketRules === 'patient-queue') : null

    // finished treatment data
    const { data: dataFinishTreatment, error: errDataFinishTreatment, isLoading: loadDataFinishTreatment } = useSwr(endpoint.getFinishedTreatment())
    const getPatientRegis = dataFinishTreatment?.data ? dataFinishTreatment?.data?.filter(item => item.rulesTreatment === 'patient-registration') : null
    const patientRegistration = getPatientRegis?.length > 0 ? getPatientRegis.map(item => {
        const findPatientRegisData = userAppointmentData?.length > 0 ? userAppointmentData.find(patient => patient.id === item.patientId) : {}
        const getCurrentLoket = findLoketPatientQueue?.length > 0 ? findLoketPatientQueue.find(data => data.patientId === item.patientId && data?.isConfirm?.confirmState) : null

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

        return {
            _id: item._id,
            id: item.id,
            patientId: item.patientId,
            confirmedTime: {
                confirmHour: item?.confirmedTime?.confirmHour,
                dateConfirm: item?.confirmedTime?.dateConfirm
            },
            created: item.createdAt,
            dataPatientInCounter: {
                confirmState: getCurrentLoket?.isConfirm?.confirmState,
                loketName: getCurrentLoket?.loketName,
                queueNumber: getCurrentLoket?.queueNumber
            },
            completionStage: getCurrentLoket?.presence === 'tidak hadir' || getCurrentLoket?.presence === 'hadir' ? 'counter' : !findPatientRegisData?.isConfirm?.id ? 'cancelled' : 'room',
            data: [
                {
                    name: item.patientName
                },
                {
                    fontSize: '11px',
                    colorName: '#fff',
                    name: !findPatientRegisData?.isConfirm?.id ? 'CANCELLED' : findPatientRegisData?.isConfirm?.presence === 'hadir' ? getCurrentLoket?.presence?.toUpperCase() : findPatientRegisData?.isConfirm?.presence?.toUpperCase(),
                },
                {
                    fontWeight: 'bold',
                    colorName: !findPatientRegisData?.isConfirm?.id ? '#ff296d' : findPatientRegisData?.isConfirm?.presence === 'hadir' ? getCurrentLoket?.presence === 'hadir' ? '#288bbc' : '#be2ed6' : '#fa9c1b',
                    name: !findPatientRegisData?.isConfirm?.id ? 'Registration Cancelled' : findPatientRegisData?.isConfirm?.presence === 'hadir' ? getCurrentLoket?.presence === 'hadir' ? 'Finished until taking Medicine' : 'Not at the Counter' : 'Not in the Treatment Room'
                },
                {
                    firstDesc: makeNormalDate(item?.confirmedTime?.dateConfirm),
                    color: '#ff296d',
                    colorName: '#777',
                    marginBottom: '4.5px',
                    fontSize: '12px',
                    name: item?.confirmedTime?.dateConfirm
                },
                {
                    name: item?.confirmedTime?.confirmHour
                },
                {
                    name: item.patientEmail
                },
                {
                    firstDesc: makeNormalDate(findPatientRegisData?.dateOfBirth, true),
                    color: '#187bcd',
                    colorName: '#777',
                    marginBottom: '4.5px',
                    fontSize: '12px',
                    name: makeNormalDate(findPatientRegisData?.dateOfBirth, true)
                },
                {
                    name: item.phone
                },
            ]
        }
    }) : []

    // const formatDateForSortDate = [{date: 'Mar 12 2012 10:00:00'}, {date: 'Mar 08 2012 08:00:00'}]
    // const exampleSortDate = arr.sort((a, b)=> new Date(a.date) + new Date(b.date))

    const newPatientRegistration = patientRegistration?.length > 0 ? patientRegistration.sort((item, twoItem) => {
        const confirmedTime = item.confirmedTime
        const year = confirmedTime?.dateConfirm?.split('/')[2]
        const month = confirmedTime?.dateConfirm?.split('/')[0]
        const newMonth = month?.split('')[0] === '0' ? month?.substr(1) : month
        const getDate = confirmedTime?.dateConfirm?.split('/')[1]
        const dateOne = new Date(`${monthNames[Number(newMonth) - 1]} ${getDate} ${year} ${item.confirmedTime?.confirmHour}:00`)

        const confirmedTime2 = twoItem.confirmedTime
        const yearTwo = confirmedTime2?.dateConfirm?.split('/')[2]
        const monthTwo = confirmedTime2?.dateConfirm?.split('/')[0]
        const newMonthTwo = monthTwo?.split('')[0] === '0' ? monthTwo?.substr(1) : monthTwo
        const getDateTwo = confirmedTime2?.dateConfirm?.split('/')[1]
        const dateTwo = new Date(`${monthNames[Number(newMonthTwo) - 1]} ${getDateTwo} ${yearTwo} ${twoItem.confirmedTime?.confirmHour}:00`)

        return dateTwo - dateOne
    }) : []

    const changeTableStyle = () => {
        let elementTHead = document.getElementById('tHead0')
        let elementTData = document.getElementById('tData00')

        if (newPatientRegistration?.length > 0 && elementTHead) {
            elementTHead = document.getElementById(`tHead0`)
            elementTHead.style.width = 'calc(100%/7)'
            elementTHead = document.getElementById(`tHead1`)
            elementTHead.style.width = 'calc(100%/12)'
            elementTHead = document.getElementById(`tHead2`)
            elementTHead.style.width = 'calc(100%/6)'
            elementTHead = document.getElementById(`tHead3`)
            elementTHead.style.width = 'calc(100%/8)'
            elementTHead = document.getElementById(`tHead4`)
            elementTHead.style.width = 'calc(100%/8)'
            elementTHead = document.getElementById(`tHead5`)
            elementTHead.style.width = 'calc(100%/7)'
            elementTHead = document.getElementById(`tHead6`)
            elementTHead.style.width = 'calc(100%/10)'
            elementTHead = document.getElementById(`tHead7`)
            elementTHead.style.width = 'calc(100%/7)'
        }
        if (newPatientRegistration?.length > 0 && elementTData) {
            for (let i = 0; i < newPatientRegistration?.length; i++) {
                elementTData = document.getElementById(`tData${i}0`)
                elementTData.style.width = 'calc(100%/7)'
                elementTData = document.getElementById(`tData${i}1`)
                elementTData.style.width = 'calc(100%/12)'
                elementTData = document.getElementById(`tData${i}2`)
                elementTData.style.width = 'calc(100%/6)'
                elementTData = document.getElementById(`tData${i}3`)
                elementTData.style.width = 'calc(100%/8)'
                elementTData = document.getElementById(`tData${i}4`)
                elementTData.style.width = 'calc(100%/8)'
                elementTData = document.getElementById(`tData${i}5`)
                elementTData.style.width = 'calc(100%/7)'
                elementTData = document.getElementById(`tData${i}6`)
                elementTData.style.width = 'calc(100%/10)'
                elementTData = document.getElementById(`tData${i}7`)
                elementTData.style.width = 'calc(100%/7)'
            }
        }
    }

    useEffect(() => {
        if (newPatientRegistration?.length > 0) {
            setTimeout(() => {
                changeTableStyle()
            }, 0);
        }
    }, [newPatientRegistration])

    const toPage = (path) => {
        router.push(path)
    }

    const deleteFTPatientData = (_id, patientId) => {
        if (idDeleteDataRegis !== null) {
            alert('There is a process running\nPlease wait a moment')
        } else if (loadingDelete === false && window.confirm('Delete this data?')) {
            setIdDeleteDataRegis(_id)
            setLoadingDelete(true)
            API.APIDeleteFinishedTreatment(_id)
                .then(res => {
                    deletePersonalDataInCounter(patientId)
                })
                .catch(err => {
                    alert('Oops, telah terjadi kesalahan server\nMohon coba beberapa saat lagi')
                    setLoadingDelete(false)
                    setIdDeleteDataRegis(null)
                    console.log(err)
                })
        }
    }

    const deletePersonalDataInCounter = (patientId) => {
        const findPatientInCounter = findLoketPatientQueue?.find(patient => patient.patientId === patientId)

        if (findPatientInCounter?._id) {
            API.APIDeleteLoket(findPatientInCounter?._id)
                .then(res => {
                    deleteDataPersonalPatientRegis(patientId, () => {
                        setIdDeleteDataRegis(null)
                        setLoadingDelete(false)
                        setTimeout(() => {
                            alert('Deleted successfully')
                        }, 0)
                    }, (err) => {
                        alert('Oops, telah terjadi kesalahan server\nMohon coba beberapa saat lagi')
                        setLoadingDelete(false)
                        setIdDeleteDataRegis(null)
                        console.log(err)
                    })
                })
                .catch(err => {
                    alert('Oops, telah terjadi kesalahan server\nMohon coba beberapa saat lagi')
                    setLoadingDelete(false)
                    setIdDeleteDataRegis(null)
                    console.log(err)
                })
        }
    }

    const deleteDataPersonalPatientRegis = (id, success, error) => {
        API.APIDeletePatientRegistration(bookAnAppointment._id, id)
            .then(res => success())
            .catch(err => error(err))
    }

    return (
        <>
            <Head>
                <title>Finished Treatment | Admin Hospice Medical</title>
                <meta name="description" content="pasien telah menyelesaikan tahap berobat di Hospice Medical" />
            </Head>

            <div className={onNavLeft ? `${style['wrapp']} ${style['wrapp-active']}` : style['wrapp']}>
                <div className={style['container']}>
                    <div className={style['content']}>
                        <h1 className={style['title']}>
                            List of Patient Treated
                        </h1>

                        <TableContainer styleWrapp={{
                            margin: '50px 0 0 0'
                        }}>
                            <TableBody styleWrapp={{
                                width: '1500px'
                            }}>
                                <TableHead
                                    id='tHead'
                                    data={head}
                                    styleName={{
                                        padding: '15px 8px'
                                    }}
                                />

                                {newPatientRegistration?.length > 0 ? newPatientRegistration.map((item, index) => {
                                    const pathUrlToCounterStage = `/patient/patient-registration/personal-data/confirmed/${item.data[0]?.name}/${item.patientId}/counter/${item.dataPatientInCounter?.loketName}/${item.dataPatientInCounter?.confirmState ? 'confirmed' : 'not-yet-confirmed'}/${item.dataPatientInCounter?.queueNumber}`
                                    const pathUrlToRoomStage = `/patient/patient-registration/personal-data/confirmed/${item.data[0]?.name}/${item.patientId}`
                                    const pathUrlToRoomStageCancelled = `/patient/patient-registration/personal-data/cancelled/${item.data[0]?.name}/${item.patientId}`

                                    return (
                                        <button key={index} className={style['columns-data']} onClick={() => toPage(item.completionStage === 'room' ? pathUrlToRoomStage : item.completionStage === 'cancelled' ? pathUrlToRoomStageCancelled : pathUrlToCounterStage)}>
                                            <TableColumns
                                                styleEdit={{
                                                    display: 'none'
                                                }}
                                                styleLoadingCircle={{
                                                    display: idDeleteDataRegis === item._id && loadingDelete ? 'flex' : 'none'
                                                }}
                                                styleIconDelete={{
                                                    display: idDeleteDataRegis === item._id && loadingDelete ? 'none' : 'flex'
                                                }}
                                                clickDelete={(e) => {
                                                    e.stopPropagation()
                                                    deleteFTPatientData(item._id, item.patientId)
                                                }}
                                            >
                                                {item.data.map((data, idx) => {
                                                    return (
                                                        <TableData
                                                            key={idx}
                                                            id={`tData${index}${idx}`}
                                                            firstDesc={data?.firstDesc}
                                                            name={data?.name}
                                                            styleWrapp={{
                                                                cursor: 'pointer'
                                                            }}
                                                            styleName={{
                                                                fontSize: data?.fontSize,
                                                                fontWeight: data?.fontWeight,
                                                                color: data?.colorName,
                                                                padding: idx === 1 ? '5.5px 8px' : '',
                                                                borderRadius: idx === 1 ? '3px' : '0',
                                                                background: idx === 1 ? data?.name?.toLowerCase() === 'hadir' ? '#288bbc' : data?.name?.toLowerCase() === 'cancelled' ? '#ff296d' : '#464e51' : 'transparent'
                                                            }}
                                                            styleFirstDesc={{
                                                                color: data?.color,
                                                                marginBottom: data?.marginBottom
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

export default FinishedTreatment