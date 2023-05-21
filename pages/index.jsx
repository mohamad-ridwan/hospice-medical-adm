import { useContext, useEffect, useState } from 'react'
import Head from 'next/head'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import styles from 'styles/Home.module.scss'
import useSwr from 'lib/useFetch/useSwr'
import endpoint from 'lib/api/endpoint'
import { NotFoundRedirectCtx } from 'lib/context/notFoundRedirect'
import TableContainer from 'components/Table/TableContainer'

export default function Home() {
  const [chooseYear, setChooseYear] = useState(`${new Date().getFullYear()}`)

  // context
  const { onNavLeft } = useContext(NotFoundRedirectCtx)

  // servicing hours
  const { data: dataService, error: errService, isLoading: loadService } = useSwr(endpoint.getServicingHours())
  // for user regis
  const bookAnAppointment = dataService?.data ? dataService.data.find(item => item?.id === 'book-an-appointment') : null
  const userAppointmentData = bookAnAppointment ? bookAnAppointment.userAppointmentData : null

  // loket
  const { data: dataLoket, error: errDataLoket, isLoading: loadDataLoket } = useSwr(endpoint.getLoket())
  // patient-queue
  const getPatientQueue = dataLoket?.data ? dataLoket?.data?.filter(item => item.loketRules === 'patient-queue') : null

  // swr
  const { data: dataFinishTreatment, error: errDataFinishTreatment, isLoading: loadDataFinishTreatment } = useSwr(endpoint.getFinishedTreatment())
  // rules treatment : patient-registration
  const getPatientRegisAtFinishTreatment = dataFinishTreatment?.data ? dataFinishTreatment?.data?.filter(item => item.rulesTreatment === 'patient-registration') : null
  const patientRegisAtFinishTreatment = getPatientRegisAtFinishTreatment?.length > 0 ? getPatientRegisAtFinishTreatment : null
  const patientFinishTreatmentOnYears = patientRegisAtFinishTreatment?.length > 0 ? patientRegisAtFinishTreatment.filter(item => {
    const confirmedTime = item?.confirmedTime
    const dateConfirm = confirmedTime?.dateConfirm
    const getYearOfConfirm = dateConfirm?.split('/')[2]

    return getYearOfConfirm === chooseYear
  }) : null

  // Find patient Finished treatment in every month
  const checkDateConfFinishTreatment = (item) => {
    const confirmedTime = item?.confirmedTime
    const dateConfirm = confirmedTime?.dateConfirm
    const getMonthOfConfirm = dateConfirm?.split('/')[0]
    const checkMonth = getMonthOfConfirm?.substr(0, 1) === '0' ? getMonthOfConfirm?.substr(1) : getMonthOfConfirm

    return Number(checkMonth)
  }

  const findPatientFTInMonthJan = patientFinishTreatmentOnYears?.length > 0 ? patientFinishTreatmentOnYears.filter((item, idx) => {
    return checkDateConfFinishTreatment(item) === 1
  }) : []
  const findPatientFTInMonthFeb = patientFinishTreatmentOnYears?.length > 0 ? patientFinishTreatmentOnYears.filter((item, idx) => {
    return checkDateConfFinishTreatment(item) === 2
  }) : []
  const findPatientFTInMonthMar = patientFinishTreatmentOnYears?.length > 0 ? patientFinishTreatmentOnYears.filter((item, idx) => {
    return checkDateConfFinishTreatment(item) === 3
  }) : []
  const findPatientFTInMonthApr = patientFinishTreatmentOnYears?.length > 0 ? patientFinishTreatmentOnYears.filter((item, idx) => {
    return checkDateConfFinishTreatment(item) === 4
  }) : []
  const findPatientFTInMonthMay = patientFinishTreatmentOnYears?.length > 0 ? patientFinishTreatmentOnYears.filter((item, idx) => {
    return checkDateConfFinishTreatment(item) === 5
  }) : []
  const findPatientFTInMonthJun = patientFinishTreatmentOnYears?.length > 0 ? patientFinishTreatmentOnYears.filter((item, idx) => {
    return checkDateConfFinishTreatment(item) === 6
  }) : []
  const findPatientFTInMonthJul = patientFinishTreatmentOnYears?.length > 0 ? patientFinishTreatmentOnYears.filter((item, idx) => {
    return checkDateConfFinishTreatment(item) === 7
  }) : []
  const findPatientFTInMonthAug = patientFinishTreatmentOnYears?.length > 0 ? patientFinishTreatmentOnYears.filter((item, idx) => {
    return checkDateConfFinishTreatment(item) === 8
  }) : []
  const findPatientFTInMonthSep = patientFinishTreatmentOnYears?.length > 0 ? patientFinishTreatmentOnYears.filter((item, idx) => {
    return checkDateConfFinishTreatment(item) === 9
  }) : []
  const findPatientFTInMonthOct = patientFinishTreatmentOnYears?.length > 0 ? patientFinishTreatmentOnYears.filter((item, idx) => {
    return checkDateConfFinishTreatment(item) === 10
  }) : []
  const findPatientFTInMonthNov = patientFinishTreatmentOnYears?.length > 0 ? patientFinishTreatmentOnYears.filter((item, idx) => {
    return checkDateConfFinishTreatment(item) === 11
  }) : []
  const findPatientFTInMonthDec = patientFinishTreatmentOnYears?.length > 0 ? patientFinishTreatmentOnYears.filter((item, idx) => {
    return checkDateConfFinishTreatment(item) === 12
  }) : []

  const dataActivityChart = [
    findPatientFTInMonthJan?.length,
    findPatientFTInMonthFeb?.length,
    findPatientFTInMonthMar?.length,
    findPatientFTInMonthApr?.length,
    findPatientFTInMonthMay?.length,
    findPatientFTInMonthJun?.length,
    findPatientFTInMonthJul?.length,
    findPatientFTInMonthAug?.length,
    findPatientFTInMonthSep?.length,
    findPatientFTInMonthOct?.length,
    findPatientFTInMonthNov?.length,
    findPatientFTInMonthDec?.length,
  ]

  // const findPatientPresentInMonthMay = findPatientFTInMonthMay?.length > 0 ? findPatientFTInMonthMay.map(item=>{
  //   const checkInRegisConfirm = userAppointmentData?.length > 0 ? userAppointmentData.filter(patient=>patient?.id === item?.patientId && patient?.isConfirm?.presence === 'hadir') : null
  //   const checkInCounterConfirm = getPatientQueue?.length > 0 ? getPatientQueue.filter(counter=>counter?.patientId === item?.patientId && counter?.presence === 'hadir') : null

  //   return {total: checkInRegisConfirm}
  // }) :null

  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Patient treated this year (2023)',
      },
    },
  };

  const labels = [
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
  ];

  const data = {
    labels: labels,
    datasets: [{
      label: 'Patient treatment',
      data: dataActivityChart,
      backgroundColor: [
        '#f85084',
        '#288bbc',
        '#ffb347',
        '#00ecfa',
        '#be2ed6',
        '#fa9c1b',
        '#ff296d',
        '#ced4da',
        '#fffdd0',
        '#01ffff',
        '#7600bc',
        '#ffa500'
      ],
      // borderColor: [
      //   'rgb(255, 99, 132)',
      //   'rgb(255, 159, 64)',
      //   'rgb(255, 205, 86)',
      //   'rgb(75, 192, 192)',
      //   'rgb(54, 162, 235)',
      //   'rgb(153, 102, 255)',
      //   'rgb(201, 203, 207)'
      // ],
      // borderWidth: 1
    }]
  }

  return (
    <>
      <Head>
        <title>Admin Hospice Medical</title>
        <meta name="description" content="tampilan dashboard admin hospice medical" />
      </Head>
      <div className={onNavLeft ? `${styles['wrapp']} ${styles['wrapp-active']}` : styles['wrapp']}>
        <div className={styles['container']}>
          <div className={styles['content']}>
            <h1 className={styles['title']}>Activity</h1>

            <TableContainer styleWrapp={{
              margin: '50px 0 0 0',
              height: '600px',
              alignItems: 'center'
            }}>
              <Bar
                options={options}
                data={data}
                className={styles['trafic-presence']}
              />
            </TableContainer>
          </div>
        </div>
      </div>
    </>
  )
}