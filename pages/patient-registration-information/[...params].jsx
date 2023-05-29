import { useState, useEffect } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { jsPDF } from 'jspdf'
import logoWeb from 'images/logoweb2.png'
import style from 'styles/PatientRegisInfo.module.scss'
import useSwr from 'lib/useFetch/useSwr'
import endpoint from 'lib/api/endpoint'
import HeadConfirmInfo from 'components/ConfirmInfo/HeadConfirmInfo'
import CardPatientRegisData from 'components/ConfirmInfo/CardPatientRegisData'
import { dayNamesEng } from 'lib/namesOfCalendar/dayNamesEng'
import { dayNamesInd } from 'lib/namesOfCalendar/dayNamesInd'
import monthNamesInd from 'lib/namesOfCalendar/monthNameInd'
import { monthNames } from 'lib/namesOfCalendar/monthNames'
import Loading from 'components/Loading'

function PatientRegisInfo() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const { params = [] } = router.query

    const doc = new jsPDF();

    const { data: dataService, error: errService, isLoading: loadService } = useSwr(endpoint.getServicingHours())
    // for user regis
    const bookAnAppointment = dataService?.data ? dataService.data.find(item => item?.id === 'book-an-appointment') : null
    const userAppointmentData = bookAnAppointment ? bookAnAppointment.userAppointmentData : null
    const findPersonalData = userAppointmentData ? userAppointmentData.find(regis => regis?.id === params[0]) : {}
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

        return !dateOfBirth ? `${getMonthOfAD}-${getDateOfAD}-${getYearOfAD}, ${getNameOfAD}` : `${getMonthOfAD}-${getDateOfAD}-${getYearOfAD}`
    }

    useEffect(() => {
        if (params.length > 0 && !loadService && !patientData?.isConfirm?.id) {
            router.push('/not-found')
        }
    }, [params, dataService])

    useEffect(() => {
        if (!loadService && errService) {
            console.log('error data servicing hours')
            alert('Oops, telah terjadi kesalahan server\nMohon coba beberapa saat lagi')
        }
    }, [loadService])

    useEffect(() => {
        const element = document.getElementById('pdfPatientSchedule')

        if (!loadService && patientData?.isConfirm && element !== null && element !== undefined) {
            setTimeout(() => {
                doc.html(element, {
                    callback: function (doc) {
                        doc.save(`konfirmasi-pendaftaran-pasien-${patientData?.patientName}.pdf`);
                        router.push(`/patient-registration-information/${patientData?.patientName}`)
                    }
                });
            }, 500);
        }
    }, [params, dataService])

    const propsFontDataInfo = {
        styleTitle: {
            fontSize: '4.5px',
            letterSpacing: '0'
        },
        styleDesc: {
            fontSize: '3.5px',
            letterSpacing: '0'
        },
        styleTxtDesc: {
            letterSpacing: '0'
        },
        styleWrappDesc: {
            margin: '0'
        }
    }
    const styleWidthDataInfo = {
        styleWrapp: {
            width: '45%',
            margin: '0',
        }
    }

    if (params.length > 0 && params.length === 3 && patientData?.isConfirm?.id) {
        return (
            <>
                <Head>
                    <title>{params[1]} - Patient Registration | Admin Hospice Medical</title>
                    <meta name="description" content="informasi konfirmasi pendaftaran jadwal pasien berobat di Hospice Medical" />
                </Head>

                <Loading
                    style={{
                        display: loading ? 'flex' : 'none',
                        backgroundColor: '#f8f8f8',
                    }}
                    styleCircle={{
                        border: '2.5px solid #3face4',
                        borderTopColor: 'transparent',
                        height: '40px',
                        width: '40px',
                    }}
                />
                <div className={style['wrapp']} id='pdfPatientSchedule'>
                    <div className={style['content']}>
                        <div className={style['head-confirm']}>
                            <Image
                                className={style['logo-hospice-medical']}
                                src={logoWeb}
                                alt={'hospice-medical'}
                                width={20}
                                height={20}
                            // style={styleImg}
                            />
                            <h1 className={style['hospice-medical']}>
                                Hospice Medical
                            </h1>
                        </div>

                        {patientData?.isConfirm?.id && (
                            <>
                                <HeadConfirmInfo
                                    icon="fa-solid fa-circle-check"
                                    styleIcon={{
                                        display: 'none'
                                    }}
                                    styleTitle={{
                                        color: '#288bbc',
                                        marginTop: '0px',
                                        paddingBottom: '3px',
                                        // borderBottom: '0.2px solid #000',
                                        letterSpacing: '0',
                                        fontSize: '8px'
                                    }}
                                    desc="Confirmed"
                                />
                            </>
                        )}

                        <h1 className={style['title']} style={{
                            marginBottom: '1px'
                        }}>
                            <span className={style['patient-of']}>Patient of</span>
                            <span className={style['name']}>
                                {patientData?.patientName}
                            </span>
                        </h1>

                        <h1 className={style['title-info']}>
                            Patient Information
                        </h1>

                        {/* data info */}
                        <div className={style['data-information']}>
                            <CardPatientRegisData
                                {...propsFontDataInfo}
                                {...styleWidthDataInfo}
                                title="Disease Type"
                                desc={patientData.jenisPenyakit}
                            />
                            <CardPatientRegisData
                                {...styleWidthDataInfo}
                                // {...propsIconDataInfo}
                                title="Appointment Date"
                                icon="fa-solid fa-calendar-days"
                                firstDesc={makeNormalDateOnPatientInfo(patientData.appointmentDate)}
                                styleTitle={{
                                    fontSize: '4.5px',
                                    letterSpacing: '0'
                                }}
                                styleFirstDesc={{
                                    marginBottom: '0px',
                                    fontSize: '3.5px',
                                    fontWeight: 'bold',
                                    color: '#f85084',
                                    letterSpacing: '0'
                                }}
                                styleWrappDesc={{
                                    margin: '0px 0 0 0'
                                }}
                            // styleDesc={{
                            //     fontSize: '4.5px',
                            //     margin: '0'
                            // }}
                            />
                            <CardPatientRegisData
                                {...styleWidthDataInfo}
                                title="Submission Date"
                                firstDesc={makeNormalDateOnPatientInfo(patientData.submissionDate)}
                                styleTitle={{
                                    fontSize: '4.5px',
                                    letterSpacing: '0'
                                }}
                                styleFirstDesc={{
                                    marginBottom: '0px',
                                    fontSize: '3.5px',
                                    fontWeight: 'bold',
                                    color: '#7600bc',
                                    letterSpacing: '0'
                                }}
                                styleWrappDesc={{
                                    margin: '0px 0 0 0'
                                }}
                            // styleDesc={{
                            //     fontSize: '12px'
                            // }}
                            />
                            <CardPatientRegisData
                                {...propsFontDataInfo}
                                {...styleWidthDataInfo}
                                title="O'Clock"
                                icon='fa-solid fa-clock'
                                desc={patientData.clock}
                                styleDesc={{
                                    color: '#f85084',
                                    fontSize: '3.5px'
                                }}
                            />
                            <CardPatientRegisData
                                {...propsFontDataInfo}
                                {...styleWidthDataInfo}
                                title="Patient Name"
                                desc={patientData.patientName}
                            />
                            <CardPatientRegisData
                                {...propsFontDataInfo}
                                {...styleWidthDataInfo}
                                title="Email"
                                desc={patientData.emailAddress}
                            />
                            <CardPatientRegisData
                                {...styleWidthDataInfo}
                                title="Date of Birth"
                                firstDesc={makeNormalDateOnPatientInfo(patientData.dateOfBirth, true)}
                                styleTitle={{
                                    fontSize: '4.5px',
                                    letterSpacing: '0'
                                }}
                                styleFirstDesc={{
                                    marginBottom: '0px',
                                    fontSize: '3.5px',
                                    fontWeight: 'bold',
                                    color: '#288bbc'
                                }}
                                styleWrappDesc={{
                                    margin: '0px 0 0 0'
                                }}
                            />
                            <CardPatientRegisData
                                {...propsFontDataInfo}
                                {...styleWidthDataInfo}
                                title="Phone"
                                desc={patientData.phone}
                            />
                            <CardPatientRegisData
                                {...propsFontDataInfo}
                                {...styleWidthDataInfo}
                                title="Patient ID"
                                desc={patientData.id}
                            />
                            <CardPatientRegisData
                                {...propsFontDataInfo}
                                {...styleWidthDataInfo}
                                title="Messages from Patient"
                                desc={patientData.message}
                            />
                        </div>

                        {/* information data confirmation */}
                        <h1 className={style['title-info']} style={{
                            border: 'none'
                        }}>
                            Confirmation Data Information
                        </h1>

                        <div className={style['data-information']}>
                            <CardPatientRegisData
                                {...propsFontDataInfo}
                                {...styleWidthDataInfo}
                                title="Queue Number"
                                icon='fa-solid fa-id-card'
                                desc={patientData?.isConfirm?.queueNumber}
                                styleDesc={{
                                    color: '#288bbc',
                                    fontSize: '3.5px'
                                }}
                            />
                            <CardPatientRegisData
                                {...propsFontDataInfo}
                                {...styleWidthDataInfo}
                                title="Treatment Hours"
                                icon='fa-solid fa-clock'
                                desc={patientData?.isConfirm?.treatmentHours}
                                styleDesc={{
                                    color: '#f85084',
                                    fontSize: '3.5px'
                                }}
                            />
                            <CardPatientRegisData
                                {...propsFontDataInfo}
                                {...styleWidthDataInfo}
                                title="Room Name"
                                desc={patientData?.isConfirm?.roomInfo?.roomName}
                            />
                            <CardPatientRegisData
                                {...propsFontDataInfo}
                                {...styleWidthDataInfo}
                                title="Doctor Name"
                                desc={patientData?.isConfirm?.doctorInfo?.nameDoctor}
                            />
                            <CardPatientRegisData
                                {...propsFontDataInfo}
                                {...styleWidthDataInfo}
                                title="Doctor Specialist"
                                desc={patientData?.isConfirm?.doctorInfo?.doctorSpecialist}
                            />
                            <CardPatientRegisData
                                {...propsFontDataInfo}
                                {...styleWidthDataInfo}
                                icon='fa-solid fa-clock'
                                title="Confirmation Hour"
                                desc={patientData?.isConfirm?.confirmHour}
                                styleDesc={{
                                    color: '#006400',
                                    fontSize: '3.5px'
                                }}
                            />
                            <CardPatientRegisData
                                {...styleWidthDataInfo}
                                icon="fa-solid fa-calendar-days"
                                title="Confirmed Date"
                                firstDesc={makeNormalDateOnPatientInfo(patientData?.isConfirm?.dateConfirm)}
                                styleTitle={{
                                    fontSize: '4.5px',
                                    letterSpacing: '0'
                                }}
                                styleFirstDesc={{
                                    marginBottom: '0px',
                                    fontSize: '3.5px',
                                    fontWeight: 'bold',
                                    color: '#006400',
                                    letterSpacing: '0'
                                }}
                                styleWrappDesc={{
                                    margin: '0px 0 0 0'
                                }}
                            />
                        </div>

                        {/* admin information data confirmation */}
                        <h1 className={style['title-info']} style={{
                            border: 'none'
                        }}>
                            Confirmation Admin Information
                        </h1>

                        <div className={style['data-information']}>
                            <CardPatientRegisData
                                {...propsFontDataInfo}
                                {...styleWidthDataInfo}
                                title="Admin Email"
                                desc={patientData?.isConfirm?.emailAdmin}
                            />
                            <CardPatientRegisData
                                {...propsFontDataInfo}
                                {...styleWidthDataInfo}
                                title="Admin Name"
                                desc={patientData?.isConfirm?.nameAdmin}
                            />
                        </div>
                    </div>
                </div>
            </>
        )
    } else if (params.length > 0 && params.length !== 3) {
        router.push('/not-found')
    }
}

export default PatientRegisInfo

PatientRegisInfo.getLayout = function getLayout(page) {
    return (
        <>
            {page}
        </>
    )
}