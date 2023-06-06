import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { jsPDF } from 'jspdf'
import Head from 'next/head'
import Image from 'next/image'
import logoWeb from 'images/logo-one.png'
import style from 'styles/PatientReceipt.module.scss'
import useSwr from 'lib/useFetch/useSwr'
import endpoint from 'lib/api/endpoint'
import CardPatientRegisData from 'components/ConfirmInfo/CardPatientRegisData'
import { dayNamesEng } from 'lib/namesOfCalendar/dayNamesEng'
import { dayNamesInd } from 'lib/namesOfCalendar/dayNamesInd'
import { monthNames } from 'lib/namesOfCalendar/monthNames'
import monthNamesInd from 'lib/namesOfCalendar/monthNameInd'

function PatientReceipt() {
    const router = useRouter()
    const { params = [] } = router.query

    const doc = new jsPDF()

    // swr fetching api
    const { data: dataService, error: errService, isLoading: loadService } = useSwr(endpoint.getServicingHours())
    // for user regis
    const bookAnAppointment = dataService?.data ? dataService.data.find(item => item?.id === 'book-an-appointment') : null
    const userAppointmentData = bookAnAppointment ? bookAnAppointment.userAppointmentData : null
    const findPersonalData = userAppointmentData ? userAppointmentData.find(regis => regis?.id === params[1]) : {}
    const patientData = findPersonalData

    // loket
    const { data: dataLoket, error: errDataLoket, isLoading: loadDataLoket } = useSwr(endpoint.getLoket())
    // patient-queue
    const getPatientQueue = dataLoket?.data ? dataLoket?.data?.filter(item => item.loketRules === 'patient-queue') : null
    const findPatientInLoket = getPatientQueue?.length > 0 ? getPatientQueue.find(patient => patient.patientId === params[1]) : null

    // finished treatment
    const { data: dataFinishTreatment, error: errDataFinishTreatment, isLoading: loadDataFinishTreatment } = useSwr(endpoint.getFinishedTreatment())
    const patientRegisAtFinishTreatment = dataFinishTreatment?.data ? dataFinishTreatment?.data?.filter(item => item.rulesTreatment === 'patient-registration') : null
    const findCurrentPatientFinishTreatment = patientRegisAtFinishTreatment?.length > 0 ? patientRegisAtFinishTreatment.find(patient => patient.patientId === patientData?.id) : null

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

    const numberFormatIndo = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(number)
    }

    useEffect(() => {
        if (params.length > 0 && params.length !== 4 && params.length !== 5 && !loadService && !patientData?.isConfirm?.id) {
            router.push('/not-found')
        }
    }, [params, dataService])

    useEffect(() => {
        if (params.length === 4 && findCurrentPatientFinishTreatment?.id && patientData?.id) {
            const element = document.getElementById('patientReceipt')

            if (!loadService && patientData?.isConfirm && element !== null && element !== undefined) {
                setTimeout(() => {
                    doc.html(element, {
                        callback: function (doc) {
                            doc.save(`total-berobat-${patientData?.patientName}.pdf`)
                            router.push(`/patient-receipt/${patientData?.patientName}/${patientData?.id}/pdf/download/successfully-downloaded`)
                        }
                    });
                }, 100);
            }
        }
    }, [params, dataService, dataFinishTreatment])

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

    if (params.length === 4 && patientData?.isConfirm) {
        return (
            <>
                <Head>
                    <title>{patientData?.patientName} | Patient Receipt | Admin Hospice Medical</title>
                    <meta name="description" content="download struk pembayaran berobat pasien di hospice medical" />
                </Head>

                <div className={style['wrapp']} id='patientReceipt'>
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

                    <h1 className={style['title']} style={{
                        marginBottom: '1px'
                    }}>
                        <span className={style['patient-of']}>Treatment Results</span>
                        {/* <span className={style['name']}>
                            {patientData?.patientName}
                        </span> */}
                    </h1>

                    <h1 className={style['title-info']}>
                        Information Confirmed
                    </h1>

                    {/* data info Information Confirmation */}
                    <div className={style['data-information']}>
                        <CardPatientRegisData
                            {...propsFontDataInfo}
                            {...styleWidthDataInfo}
                            title="Patient Name"
                            desc={patientData.patientName}
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
                            title="Patient Email"
                            desc={patientData.emailAddress}
                        />
                        {/* <CardPatientRegisData
                            {...propsFontDataInfo}
                            {...styleWidthDataInfo}
                            title="Disease Type"
                            desc={patientData.jenisPenyakit}
                        /> */}
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
                            title="Doctor Room"
                            desc={patientData?.isConfirm?.roomInfo?.roomName}
                        />
                    </div>

                    <h1 className={style['title-info']} style={{
                        border: 'none'
                    }}>
                        Admin Information
                    </h1>

                    {/* data info admin */}
                    <div className={style['data-information']}>
                        <CardPatientRegisData
                            {...propsFontDataInfo}
                            {...styleWidthDataInfo}
                            title="Admin Name"
                            desc={findCurrentPatientFinishTreatment?.adminInfo?.nameAdmin}
                        />
                        <CardPatientRegisData
                            {...propsFontDataInfo}
                            {...styleWidthDataInfo}
                            title="Admin Email"
                            desc={findCurrentPatientFinishTreatment?.adminInfo?.emailAdmin}
                        />
                    </div>

                    <h1 className={style['title-info']} style={{
                        border: 'none',
                    }}>
                        Payment Information
                    </h1>

                    {/* data info Payment Information */}
                    <div className={style['data-information']}>
                        <CardPatientRegisData
                            {...propsFontDataInfo}
                            {...styleWidthDataInfo}
                            title="Payment Method"
                            desc={findPatientInLoket?.isConfirm?.paymentInfo?.paymentMethod}
                        />
                        {findPatientInLoket?.isConfirm?.paymentInfo?.paymentMethod?.toLowerCase()?.includes('bpjs') && (
                            <CardPatientRegisData
                                {...propsFontDataInfo}
                                {...styleWidthDataInfo}
                                title="BPJS Number"
                                desc={findPatientInLoket?.isConfirm?.paymentInfo?.bpjsNumber}
                            />
                        )}
                        <CardPatientRegisData
                            {...propsFontDataInfo}
                            {...styleWidthDataInfo}
                            title="Total Cost"
                            desc={findPatientInLoket?.isConfirm?.paymentInfo?.paymentMethod?.toLowerCase()?.includes('bpjs') ? 'Rp -' : numberFormatIndo(findPatientInLoket?.isConfirm?.paymentInfo?.totalCost)}
                            styleDesc={{
                                color: '#ff296d',
                                fontSize: '3.5px',
                                letterSpacing: '0',
                            }}
                        />
                        <CardPatientRegisData
                            {...propsFontDataInfo}
                            {...styleWidthDataInfo}
                            title="Counter Name"
                            desc={findPatientInLoket?.loketName}
                        />
                        <CardPatientRegisData
                            {...propsFontDataInfo}
                            {...styleWidthDataInfo}
                            title="Date Confirm"
                            desc={makeNormalDateOnPatientInfo(findCurrentPatientFinishTreatment?.confirmedTime?.dateConfirm)}
                        />
                        <CardPatientRegisData
                            {...propsFontDataInfo}
                            {...styleWidthDataInfo}
                            title="Confirmation Hour"
                            desc={findCurrentPatientFinishTreatment?.confirmedTime?.confirmHour}
                        />
                    </div>
                </div>
            </>
        )
    } else if (params.length === 5 && patientData?.isConfirm) {
        return (
            <>
                <Head>
                    <title>{patientData?.patientName} | Patient Receipt | Admin Hospice Medical</title>
                    <meta name="description" content="berhasil download struk pembayaran berobat pasien di hospice medical" />
                </Head>

                <div className="wrapp">
                    <h1>
                        Successfully Downloaded
                    </h1>
                </div>
            </>
        )
    }else if(params.length > 0 && params.length !== 4 && params.length !== 5){
        router.push('/not-found')
    }
}

export default PatientReceipt

PatientReceipt.getLayout = function getLayout(page) {
    return (
        <>
            {page}
        </>
    )
}