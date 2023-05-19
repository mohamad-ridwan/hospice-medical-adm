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

function FinishedTreatment() {
    const [head] = useState([
        {
            name: 'Presence'
        },
        {
            name: 'Patient Name'
        },
        {
            name: 'Disease Type'
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
    // console.log(userAppointmentData)

    // loket
    const { data: loketData, error: errLoketData, isLoading: loadLoketData } = useSwr(endpoint.getLoket())
    const findLoketPatientQueue = loketData?.data ? loketData.data.filter(item => item?.loketRules === 'patient-queue') : null

    // finished treatment data
    const { data: dataFinishTreatment, error: errDataFinishTreatment, isLoading: loadDataFinishTreatment } = useSwr(endpoint.getFinishedTreatment())
    const getPatientRegis = dataFinishTreatment?.data ? dataFinishTreatment?.data?.filter(item => item.rulesTreatment === 'patient-registration') : null
    const patientRegistration = getPatientRegis?.length > 0 ? getPatientRegis.map(item => {
        const findPatientInRegisData = userAppointmentData?.length > 0 ? userAppointmentData.find(patient => patient.id === item.patientId) : {}
        const getCurrentLoket = findLoketPatientQueue?.length > 0 ? findLoketPatientQueue.find(data => data.patientId === item.patientId && data?.isConfirm?.confirmState) : null

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
            data: [
                {
                    name: findPatientInRegisData?.isConfirm?.presence?.toUpperCase()
                },
                {
                    name: item.patientName
                },
                {
                    name: findPatientInRegisData?.jenisPenyakit
                },
                {
                    name: item?.confirmedTime?.dateConfirm
                },
                {
                    name: item?.confirmedTime?.confirmHour
                },
                {
                    name: item.patientEmail
                },
                {
                    name: findPatientInRegisData?.dateOfBirth
                },
                {
                    name: item.phone
                },
            ]
        }
    }) : []

    const date = new Date(1684466604907)

    const arr = [{date: 'Mar 12 2012 10:00:00'}, {date: 'Mar 8 2012 08:00:00'}]

    const newPatientRegistration = patientRegistration?.length > 0 ? patientRegistration.sort((item, twoItem) => {
        const confirmedTime = item.confirmedTime
        const year = confirmedTime.dateConfirm?.split('/')[2]
        const month = confirmedTime.dateConfirm?.split('/')[0]
        const getDate = confirmedTime.dateConfirm?.split('/')[1]

        const confirmedTime2 = twoItem.confirmedTime
        const yearTwo = confirmedTime2.dateConfirm?.split('/')[2]
        const monthTwo = confirmedTime2.dateConfirm?.split('/')[0]
        const getDateTwo = confirmedTime2.dateConfirm?.split('/')[1]

        return new Date(`${item.id}`) - new Date(`${twoItem.id}`)
    }) : []

    const sortjing = arr.sort((a, b)=> new Date(a.date) - new Date(b.date))
    // console.log(sortjing)

    const changeTableStyle = () => {
        let elementTHead = document.getElementById('tHead0')
        let elementTData = document.getElementById('tData00')

        if (patientRegistration?.length > 0 && elementTHead) {
            elementTHead = document.getElementById(`tHead0`)
            elementTHead.style.width = 'calc(100%/10)'
            elementTHead = document.getElementById(`tHead1`)
            elementTHead.style.width = 'calc(100%/7)'
            elementTHead = document.getElementById(`tHead2`)
            elementTHead.style.width = 'calc(100%/7)'
            elementTHead = document.getElementById(`tHead3`)
            elementTHead.style.width = 'calc(100%/8)'
            elementTHead = document.getElementById(`tHead4`)
            elementTHead.style.width = 'calc(100%/7)'
            elementTHead = document.getElementById(`tHead5`)
            elementTHead.style.width = 'calc(100%/6)'
        }
        if (patientRegistration?.length > 0 && elementTData) {
            for (let i = 0; i < patientRegistration?.length; i++) {
                elementTData = document.getElementById(`tData${i}0`)
                elementTData.style.width = 'calc(100%/10)'
                elementTData = document.getElementById(`tData${i}1`)
                elementTData.style.width = 'calc(100%/7)'
                elementTData = document.getElementById(`tData${i}2`)
                elementTData.style.width = 'calc(100%/7)'
                elementTData = document.getElementById(`tData${i}3`)
                elementTData.style.width = 'calc(100%/8)'
                elementTData = document.getElementById(`tData${i}4`)
                elementTData.style.width = 'calc(100%/7)'
                elementTData = document.getElementById(`tData${i}5`)
                elementTData.style.width = 'calc(100%/6)'
            }
        }
    }

    useEffect(() => {
        if (patientRegistration?.length > 0) {
            setTimeout(() => {
                changeTableStyle()
            }, 0);
        }
    }, [patientRegistration])

    const toPage = (path)=>{
        router.push(path)
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
                            <TableBody>
                                <TableHead
                                    id='tHead'
                                    data={head}
                                    styleName={{
                                        padding: '15px 8px'
                                    }}
                                />

                                {patientRegistration?.length > 0 ? patientRegistration.map((item, index) => {
                                    const jenisPenyakit = item.data[2].name.replace('-', '')
                                    const newJenisPenyakit = jenisPenyakit.replace(/ /gi, '-').toLowerCase()
                                    const emailPatient = item.data[5].name
                                    const pathUrlToDataDetail = `/patient/patient-registration/personal-data/confirmed/${newJenisPenyakit}/${emailPatient}/${item.patientId}/counter/${item.dataPatientInCounter?.loketName}/${item.dataPatientInCounter?.confirmState ? 'confirmed' : 'not-yet-confirmed'}/${item.dataPatientInCounter?.queueNumber}`

                                    return (
                                        <button key={index} className={style['columns-data']} onClick={()=>toPage(pathUrlToDataDetail)}>
                                            <TableColumns
                                                styleEdit={{
                                                    display: 'none'
                                                }}
                                                clickDelete={(e) => {
                                                    e.stopPropagation()
                                                }}
                                            >
                                                {item.data.map((data, idx) => {
                                                    return (
                                                        <TableData
                                                            key={idx}
                                                            id={`tData${index}${idx}`}
                                                            name={data?.name}
                                                            styleWrapp={{
                                                                cursor: 'pointer'
                                                            }}
                                                            styleName={{
                                                                color: idx === 0 ? '#fff' : '#000',
                                                                padding: idx === 0 ? '7px 12px' : '',
                                                                borderRadius: idx === 0 ? '3px' : '0',
                                                                background: idx === 0 ? data?.name?.toLowerCase()?.includes('hadir') ? '#288bbc' : '#ff296d' : 'transparent'
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