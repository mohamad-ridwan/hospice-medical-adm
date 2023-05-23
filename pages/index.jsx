import { useContext, useEffect, useState } from 'react'
import Head from 'next/head'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { PolarArea } from 'react-chartjs-2'
import styles from 'styles/Home.module.scss'
import useSwr from 'lib/useFetch/useSwr'
import endpoint from 'lib/api/endpoint'
import { AuthContext } from 'lib/context/auth'
import { NotFoundRedirectCtx } from 'lib/context/notFoundRedirect'
import TableContainer from 'components/Table/TableContainer'
import Button from 'components/Button'
import OverviewCard from 'components/OverviewCard'

export default function Home() {
  const [chooseYear, setChooseYear] = useState(`${new Date().getFullYear()}`)
  const [chooseYearPaymentInfo, setChooseYearPaymentInfo] = useState(`${new Date().getFullYear()}`)
  const [overviewData, setOverviewData] = useState([])

  // context
  const { user, setUser } = useContext(AuthContext)
  const { onNavLeft } = useContext(NotFoundRedirectCtx)

  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    RadialLinearScale,
    ArcElement,
    Tooltip,
    Legend
  );

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

  const checkPatientRegisDataInMonth = (item) => {
    const findPatientInRegisData = userAppointmentData?.length > 0 ? userAppointmentData.find(patient => patient.id === item.patientId) : {}

    return findPatientInRegisData?.isConfirm?.presence
  }
  const checkCurrentLoketInMonth = (item) => {
    const getCurrentLoket = getPatientQueue?.length > 0 ? getPatientQueue?.find(data => data.patientId === item.patientId && data?.isConfirm?.confirmState) : {}

    return getCurrentLoket?.presence
  }

  const getPaymentInCurrentInfo = (item) => {
    const getCurrentLoket = getPatientQueue?.length > 0 ? getPatientQueue?.find(data => data.patientId === item.patientId && data?.isConfirm?.confirmState) : {}
    const paymentInfo = getCurrentLoket?.isConfirm?.paymentInfo

    return {
      paymentInfo: {
        paymentMethod: paymentInfo?.paymentMethod,
        totalCost: paymentInfo?.totalCost
      }
    }
  }

  useEffect(() => {
    if (user?.id && patientRegisAtFinishTreatment?.length > 0) {
      const getTotalPatientPresence = patientRegisAtFinishTreatment?.length > 0 ? patientRegisAtFinishTreatment.map(item => ({
        completionStage: checkPatientRegisDataInMonth(item) === 'hadir' ? checkCurrentLoketInMonth(item) : checkPatientRegisDataInMonth(item)
      })) : []
      const getPatientPresence = (presence) => {
        return getTotalPatientPresence?.length > 0 ? getTotalPatientPresence.filter(item => item.completionStage === presence) : []
      }

      const getPMPatient = patientRegisAtFinishTreatment?.length > 0 ? patientRegisAtFinishTreatment.map(item => (getPaymentInCurrentInfo(item))) : []
      const filterPMPatient = (paymentMethod) => {
        return getPMPatient?.length > 0 ? getPMPatient.filter(item => item.paymentInfo.paymentMethod?.toLowerCase()?.includes(paymentMethod)) : []
      }

      const getTotalCost = () => {
        let arrCost = []
        let count = 0
        let totalCost = null

        if (filterPMPatient('cash')?.length > 0) {
          for (let i = 0; i < filterPMPatient('cash').length; i++) {
            count = count + 1
            arrCost.push(parseInt(filterPMPatient('cash')[i].paymentInfo.totalCost))
          }
        }

        if (count === filterPMPatient('cash')?.length) {
          totalCost = eval(arrCost.join('+'))
        }

        return totalCost
      }

      const numberFormatIndo = (number)=>{
        return new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR'
        }).format(number)
      }

      setOverviewData([
        {
          value: patientRegisAtFinishTreatment?.length,
          title: 'Patient Treatment',
          icon: 'fa-solid fa-hospital-user',
          color: '#187bcd'
        },
        {
          value: getPatientPresence('hadir')?.length,
          title: 'Patient Present',
          icon: 'fa-solid fa-person-circle-check',
          color: '#7600bc'
        },
        {
          value: getPatientPresence('tidak hadir')?.length,
          title: 'Patient Not Present',
          icon: 'fa-solid fa-person-circle-xmark',
          color: '#ffa500'
        },
        {
          value: filterPMPatient('cash')?.length,
          title: 'Cash Payment Method',
          icon: 'fa-solid fa-coins',
          color: '#f85084'
        },
        {
          value: filterPMPatient('bpjs')?.length,
          title: 'BPJS Payment Method',
          icon: 'fa-solid fa-id-card',
          color: '#0ab110'
        },
        {
          value: getTotalCost() ? numberFormatIndo(getTotalCost()) : 0,
          title: 'Earning',
          icon: 'fa-solid fa-chart-line',
          color: '#ff296d'
        }
      ])
    }
  }, [user, dataFinishTreatment])

  const patientFinishTreatmentOnYears = (years) => {
    const checkPatientOnDate = patientRegisAtFinishTreatment?.length > 0 ? patientRegisAtFinishTreatment.filter(item => {
      const confirmedTime = item?.confirmedTime
      const dateConfirm = confirmedTime?.dateConfirm
      const getYearOfConfirm = dateConfirm?.split('/')[2]

      return getYearOfConfirm === years
    }) : []

    return checkPatientOnDate
  }

  // Find patient Finished treatment in every month
  const checkDateConfFinishTreatment = (item) => {
    const confirmedTime = item?.confirmedTime
    const dateConfirm = confirmedTime?.dateConfirm
    const getMonthOfConfirm = dateConfirm?.split('/')[0]
    const checkMonth = getMonthOfConfirm?.substr(0, 1) === '0' ? getMonthOfConfirm?.substr(1) : getMonthOfConfirm

    return Number(checkMonth)
  }

  const findPatientFTInMonthJan = patientFinishTreatmentOnYears(chooseYear)?.length > 0 ? patientFinishTreatmentOnYears(chooseYear).filter((item, idx) => {
    return checkDateConfFinishTreatment(item) === 1
  }) : []
  const findPatientFTInMonthFeb = patientFinishTreatmentOnYears(chooseYear)?.length > 0 ? patientFinishTreatmentOnYears(chooseYear).filter((item, idx) => {
    return checkDateConfFinishTreatment(item) === 2
  }) : []
  const findPatientFTInMonthMar = patientFinishTreatmentOnYears(chooseYear)?.length > 0 ? patientFinishTreatmentOnYears(chooseYear).filter((item, idx) => {
    return checkDateConfFinishTreatment(item) === 3
  }) : []
  const findPatientFTInMonthApr = patientFinishTreatmentOnYears(chooseYear)?.length > 0 ? patientFinishTreatmentOnYears(chooseYear).filter((item, idx) => {
    return checkDateConfFinishTreatment(item) === 4
  }) : []
  const findPatientFTInMonthMay = patientFinishTreatmentOnYears(chooseYear)?.length > 0 ? patientFinishTreatmentOnYears(chooseYear).filter((item, idx) => {
    return checkDateConfFinishTreatment(item) === 5
  }) : []
  const findPatientFTInMonthJun = patientFinishTreatmentOnYears(chooseYear)?.length > 0 ? patientFinishTreatmentOnYears(chooseYear).filter((item, idx) => {
    return checkDateConfFinishTreatment(item) === 6
  }) : []
  const findPatientFTInMonthJul = patientFinishTreatmentOnYears(chooseYear)?.length > 0 ? patientFinishTreatmentOnYears(chooseYear).filter((item, idx) => {
    return checkDateConfFinishTreatment(item) === 7
  }) : []
  const findPatientFTInMonthAug = patientFinishTreatmentOnYears(chooseYear)?.length > 0 ? patientFinishTreatmentOnYears(chooseYear).filter((item, idx) => {
    return checkDateConfFinishTreatment(item) === 8
  }) : []
  const findPatientFTInMonthSep = patientFinishTreatmentOnYears(chooseYear)?.length > 0 ? patientFinishTreatmentOnYears(chooseYear).filter((item, idx) => {
    return checkDateConfFinishTreatment(item) === 9
  }) : []
  const findPatientFTInMonthOct = patientFinishTreatmentOnYears(chooseYear)?.length > 0 ? patientFinishTreatmentOnYears(chooseYear).filter((item, idx) => {
    return checkDateConfFinishTreatment(item) === 10
  }) : []
  const findPatientFTInMonthNov = patientFinishTreatmentOnYears(chooseYear)?.length > 0 ? patientFinishTreatmentOnYears(chooseYear).filter((item, idx) => {
    return checkDateConfFinishTreatment(item) === 11
  }) : []
  const findPatientFTInMonthDec = patientFinishTreatmentOnYears(chooseYear)?.length > 0 ? patientFinishTreatmentOnYears(chooseYear).filter((item, idx) => {
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

  const findPatientPresenceInMonthJan = findPatientFTInMonthJan?.length > 0 ? findPatientFTInMonthJan.map(item => ({
    completionStage: checkPatientRegisDataInMonth(item) === 'hadir' ? checkCurrentLoketInMonth(item) : checkPatientRegisDataInMonth(item)
  })) : []
  const findPatientPresenceInMonthFeb = findPatientFTInMonthFeb?.length > 0 ? findPatientFTInMonthFeb.map(item => ({
    completionStage: checkPatientRegisDataInMonth(item) === 'hadir' ? checkCurrentLoketInMonth(item) : checkPatientRegisDataInMonth(item)
  })) : []
  const findPatientPresenceInMonthMar = findPatientFTInMonthMar?.length > 0 ? findPatientFTInMonthMar.map(item => ({
    completionStage: checkPatientRegisDataInMonth(item) === 'hadir' ? checkCurrentLoketInMonth(item) : checkPatientRegisDataInMonth(item)
  })) : []
  const findPatientPresenceInMonthApr = findPatientFTInMonthApr?.length > 0 ? findPatientFTInMonthApr.map(item => ({
    completionStage: checkPatientRegisDataInMonth(item) === 'hadir' ? checkCurrentLoketInMonth(item) : checkPatientRegisDataInMonth(item)
  })) : []
  const findPatientPresenceInMonthMay = findPatientFTInMonthMay?.length > 0 ? findPatientFTInMonthMay.map(item => ({
    completionStage: checkPatientRegisDataInMonth(item) === 'hadir' ? checkCurrentLoketInMonth(item) : checkPatientRegisDataInMonth(item)
  })) : []
  const findPatientPresenceInMonthJun = findPatientFTInMonthJun?.length > 0 ? findPatientFTInMonthJun.map(item => ({
    completionStage: checkPatientRegisDataInMonth(item) === 'hadir' ? checkCurrentLoketInMonth(item) : checkPatientRegisDataInMonth(item)
  })) : []
  const findPatientPresenceInMonthJul = findPatientFTInMonthJul?.length > 0 ? findPatientFTInMonthJul.map(item => ({
    completionStage: checkPatientRegisDataInMonth(item) === 'hadir' ? checkCurrentLoketInMonth(item) : checkPatientRegisDataInMonth(item)
  })) : []
  const findPatientPresenceInMonthAug = findPatientFTInMonthAug?.length > 0 ? findPatientFTInMonthAug.map(item => ({
    completionStage: checkPatientRegisDataInMonth(item) === 'hadir' ? checkCurrentLoketInMonth(item) : checkPatientRegisDataInMonth(item)
  })) : []
  const findPatientPresenceInMonthSep = findPatientFTInMonthSep?.length > 0 ? findPatientFTInMonthSep.map(item => ({
    completionStage: checkPatientRegisDataInMonth(item) === 'hadir' ? checkCurrentLoketInMonth(item) : checkPatientRegisDataInMonth(item)
  })) : []
  const findPatientPresenceInMonthOct = findPatientFTInMonthOct?.length > 0 ? findPatientFTInMonthOct.map(item => ({
    completionStage: checkPatientRegisDataInMonth(item) === 'hadir' ? checkCurrentLoketInMonth(item) : checkPatientRegisDataInMonth(item)
  })) : []
  const findPatientPresenceInMonthNov = findPatientFTInMonthNov?.length > 0 ? findPatientFTInMonthNov.map(item => ({
    completionStage: checkPatientRegisDataInMonth(item) === 'hadir' ? checkCurrentLoketInMonth(item) : checkPatientRegisDataInMonth(item)
  })) : []
  const findPatientPresenceInMonthDec = findPatientFTInMonthDec?.length > 0 ? findPatientFTInMonthDec.map(item => ({
    completionStage: checkPatientRegisDataInMonth(item) === 'hadir' ? checkCurrentLoketInMonth(item) : checkPatientRegisDataInMonth(item)
  })) : []

  // check kehadiran pasien di setiap bulan
  const getPatientPresenceOnMonth = (patientInMonth, presence) => {
    return eval(patientInMonth)?.length > 0 ? eval(patientInMonth)?.filter(item => item?.completionStage === presence) : []
  }

  // data pasien yang hadir
  const dataPresentInEveryMonth = [
    getPatientPresenceOnMonth(findPatientPresenceInMonthJan, 'hadir')?.length,
    getPatientPresenceOnMonth(findPatientPresenceInMonthFeb, 'hadir')?.length,
    getPatientPresenceOnMonth(findPatientPresenceInMonthMar, 'hadir')?.length,
    getPatientPresenceOnMonth(findPatientPresenceInMonthApr, 'hadir')?.length,
    getPatientPresenceOnMonth(findPatientPresenceInMonthMay, 'hadir')?.length,
    getPatientPresenceOnMonth(findPatientPresenceInMonthJun, 'hadir')?.length,
    getPatientPresenceOnMonth(findPatientPresenceInMonthJul, 'hadir')?.length,
    getPatientPresenceOnMonth(findPatientPresenceInMonthAug, 'hadir')?.length,
    getPatientPresenceOnMonth(findPatientPresenceInMonthSep, 'hadir')?.length,
    getPatientPresenceOnMonth(findPatientPresenceInMonthOct, 'hadir')?.length,
    getPatientPresenceOnMonth(findPatientPresenceInMonthNov, 'hadir')?.length,
    getPatientPresenceOnMonth(findPatientPresenceInMonthDec, 'hadir')?.length,
  ]

  // data pasien yang tidak hadir
  const dataNotPresentInEveryMonth = [
    getPatientPresenceOnMonth(findPatientPresenceInMonthJan, 'tidak hadir')?.length,
    getPatientPresenceOnMonth(findPatientPresenceInMonthFeb, 'tidak hadir')?.length,
    getPatientPresenceOnMonth(findPatientPresenceInMonthMar, 'tidak hadir')?.length,
    getPatientPresenceOnMonth(findPatientPresenceInMonthApr, 'tidak hadir')?.length,
    getPatientPresenceOnMonth(findPatientPresenceInMonthMay, 'tidak hadir')?.length,
    getPatientPresenceOnMonth(findPatientPresenceInMonthJun, 'tidak hadir')?.length,
    getPatientPresenceOnMonth(findPatientPresenceInMonthJul, 'tidak hadir')?.length,
    getPatientPresenceOnMonth(findPatientPresenceInMonthAug, 'tidak hadir')?.length,
    getPatientPresenceOnMonth(findPatientPresenceInMonthSep, 'tidak hadir')?.length,
    getPatientPresenceOnMonth(findPatientPresenceInMonthOct, 'tidak hadir')?.length,
    getPatientPresenceOnMonth(findPatientPresenceInMonthNov, 'tidak hadir')?.length,
    getPatientPresenceOnMonth(findPatientPresenceInMonthDec, 'tidak hadir')?.length,
  ]

  // polar area chart
  const getPaymentPatientOnYear = patientFinishTreatmentOnYears(chooseYearPaymentInfo)?.length > 0 ? patientFinishTreatmentOnYears(chooseYearPaymentInfo).map((item, idx) => (getPaymentInCurrentInfo(item))) : []

  const getCashPaymentMethod = getPaymentPatientOnYear?.length > 0 ? getPaymentPatientOnYear.filter(item => item.paymentInfo.paymentMethod?.toLowerCase() === 'cash') : []
  const getBPJSPaymentMethod = getPaymentPatientOnYear?.length > 0 ? getPaymentPatientOnYear.filter(item => item.paymentInfo.paymentMethod?.toLowerCase()?.includes('bpjs')) : []

  const dataPaymentMethodPolarAreaChart = [
    getCashPaymentMethod?.length,
    getBPJSPaymentMethod?.length
  ]

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

  // bar chart payment information in every month
  const findPatientFTOfPMInJan = patientFinishTreatmentOnYears(chooseYearPaymentInfo)?.length > 0 ? patientFinishTreatmentOnYears(chooseYearPaymentInfo).filter((item, idx) => {
    return checkDateConfFinishTreatment(item) === 1
  }) : []
  const findPatientFTOfPMInFeb = patientFinishTreatmentOnYears(chooseYearPaymentInfo)?.length > 0 ? patientFinishTreatmentOnYears(chooseYearPaymentInfo).filter((item, idx) => {
    return checkDateConfFinishTreatment(item) === 2
  }) : []
  const findPatientFTOfPMInMar = patientFinishTreatmentOnYears(chooseYearPaymentInfo)?.length > 0 ? patientFinishTreatmentOnYears(chooseYearPaymentInfo).filter((item, idx) => {
    return checkDateConfFinishTreatment(item) === 3
  }) : []
  const findPatientFTOfPMInApr = patientFinishTreatmentOnYears(chooseYearPaymentInfo)?.length > 0 ? patientFinishTreatmentOnYears(chooseYearPaymentInfo).filter((item, idx) => {
    return checkDateConfFinishTreatment(item) === 4
  }) : []
  const findPatientFTOfPMInMay = patientFinishTreatmentOnYears(chooseYearPaymentInfo)?.length > 0 ? patientFinishTreatmentOnYears(chooseYearPaymentInfo).filter((item, idx) => {
    return checkDateConfFinishTreatment(item) === 5
  }) : []
  const findPatientFTOfPMInJun = patientFinishTreatmentOnYears(chooseYearPaymentInfo)?.length > 0 ? patientFinishTreatmentOnYears(chooseYearPaymentInfo).filter((item, idx) => {
    return checkDateConfFinishTreatment(item) === 6
  }) : []
  const findPatientFTOfPMInJul = patientFinishTreatmentOnYears(chooseYearPaymentInfo)?.length > 0 ? patientFinishTreatmentOnYears(chooseYearPaymentInfo).filter((item, idx) => {
    return checkDateConfFinishTreatment(item) === 7
  }) : []
  const findPatientFTOfPMInAug = patientFinishTreatmentOnYears(chooseYearPaymentInfo)?.length > 0 ? patientFinishTreatmentOnYears(chooseYearPaymentInfo).filter((item, idx) => {
    return checkDateConfFinishTreatment(item) === 8
  }) : []
  const findPatientFTOfPMInSep = patientFinishTreatmentOnYears(chooseYearPaymentInfo)?.length > 0 ? patientFinishTreatmentOnYears(chooseYearPaymentInfo).filter((item, idx) => {
    return checkDateConfFinishTreatment(item) === 9
  }) : []
  const findPatientFTOfPMInOct = patientFinishTreatmentOnYears(chooseYearPaymentInfo)?.length > 0 ? patientFinishTreatmentOnYears(chooseYearPaymentInfo).filter((item, idx) => {
    return checkDateConfFinishTreatment(item) === 10
  }) : []
  const findPatientFTOfPMInNov = patientFinishTreatmentOnYears(chooseYearPaymentInfo)?.length > 0 ? patientFinishTreatmentOnYears(chooseYearPaymentInfo).filter((item, idx) => {
    return checkDateConfFinishTreatment(item) === 11
  }) : []
  const findPatientFTOfPMInDec = patientFinishTreatmentOnYears(chooseYearPaymentInfo)?.length > 0 ? patientFinishTreatmentOnYears(chooseYearPaymentInfo).filter((item, idx) => {
    return checkDateConfFinishTreatment(item) === 12
  }) : []

  const getPatientPaymentInMonthJan = findPatientFTOfPMInJan?.length > 0 ? findPatientFTOfPMInJan.map(item => (getPaymentInCurrentInfo(item))) : []
  const getPatientPaymentInMonthFeb = findPatientFTOfPMInFeb?.length > 0 ? findPatientFTOfPMInFeb.map(item => (getPaymentInCurrentInfo(item))) : []
  const getPatientPaymentInMonthMar = findPatientFTOfPMInMar?.length > 0 ? findPatientFTOfPMInMar.map(item => (getPaymentInCurrentInfo(item))) : []
  const getPatientPaymentInMonthApr = findPatientFTOfPMInApr?.length > 0 ? findPatientFTOfPMInApr.map(item => (getPaymentInCurrentInfo(item))) : []
  const getPatientPaymentInMonthMay = findPatientFTOfPMInMay?.length > 0 ? findPatientFTOfPMInMay.map(item => (getPaymentInCurrentInfo(item))) : []
  const getPatientPaymentInMonthJun = findPatientFTOfPMInJun?.length > 0 ? findPatientFTOfPMInJun.map(item => (getPaymentInCurrentInfo(item))) : []
  const getPatientPaymentInMonthJul = findPatientFTOfPMInJul?.length > 0 ? findPatientFTOfPMInJul.map(item => (getPaymentInCurrentInfo(item))) : []
  const getPatientPaymentInMonthAug = findPatientFTOfPMInAug?.length > 0 ? findPatientFTOfPMInAug.map(item => (getPaymentInCurrentInfo(item))) : []
  const getPatientPaymentInMonthSep = findPatientFTOfPMInSep?.length > 0 ? findPatientFTOfPMInSep.map(item => (getPaymentInCurrentInfo(item))) : []
  const getPatientPaymentInMonthOct = findPatientFTOfPMInOct?.length > 0 ? findPatientFTOfPMInOct.map(item => (getPaymentInCurrentInfo(item))) : []
  const getPatientPaymentInMonthNov = findPatientFTOfPMInNov?.length > 0 ? findPatientFTOfPMInNov.map(item => (getPaymentInCurrentInfo(item))) : []
  const getPatientPaymentInMonthDec = findPatientFTOfPMInDec?.length > 0 ? findPatientFTOfPMInDec.map(item => (getPaymentInCurrentInfo(item))) : []

  const findPaymentMethodInEveryMonth = (patientInMonth, paymentMethod) => {
    return eval(patientInMonth)?.length > 0 ? eval(patientInMonth)?.filter(item => item.paymentInfo.paymentMethod?.toLowerCase()?.includes(paymentMethod)) : []
  }

  // data cash payment method patient on every month
  const dataCashPMOfBarChat = [
    findPaymentMethodInEveryMonth(getPatientPaymentInMonthJan, 'cash')?.length,
    findPaymentMethodInEveryMonth(getPatientPaymentInMonthFeb, 'cash')?.length,
    findPaymentMethodInEveryMonth(getPatientPaymentInMonthMar, 'cash')?.length,
    findPaymentMethodInEveryMonth(getPatientPaymentInMonthApr, 'cash')?.length,
    findPaymentMethodInEveryMonth(getPatientPaymentInMonthMay, 'cash')?.length,
    findPaymentMethodInEveryMonth(getPatientPaymentInMonthJun, 'cash')?.length,
    findPaymentMethodInEveryMonth(getPatientPaymentInMonthJul, 'cash')?.length,
    findPaymentMethodInEveryMonth(getPatientPaymentInMonthAug, 'cash')?.length,
    findPaymentMethodInEveryMonth(getPatientPaymentInMonthSep, 'cash')?.length,
    findPaymentMethodInEveryMonth(getPatientPaymentInMonthOct, 'cash')?.length,
    findPaymentMethodInEveryMonth(getPatientPaymentInMonthNov, 'cash')?.length,
    findPaymentMethodInEveryMonth(getPatientPaymentInMonthDec, 'cash')?.length,
  ]

  // data BPJS Kesehatan payment method patient on every month
  const dataBPJSPMOfBarChat = [
    findPaymentMethodInEveryMonth(getPatientPaymentInMonthJan, 'bpjs')?.length,
    findPaymentMethodInEveryMonth(getPatientPaymentInMonthFeb, 'bpjs')?.length,
    findPaymentMethodInEveryMonth(getPatientPaymentInMonthMar, 'bpjs')?.length,
    findPaymentMethodInEveryMonth(getPatientPaymentInMonthApr, 'bpjs')?.length,
    findPaymentMethodInEveryMonth(getPatientPaymentInMonthMay, 'bpjs')?.length,
    findPaymentMethodInEveryMonth(getPatientPaymentInMonthJun, 'bpjs')?.length,
    findPaymentMethodInEveryMonth(getPatientPaymentInMonthJul, 'bpjs')?.length,
    findPaymentMethodInEveryMonth(getPatientPaymentInMonthAug, 'bpjs')?.length,
    findPaymentMethodInEveryMonth(getPatientPaymentInMonthSep, 'bpjs')?.length,
    findPaymentMethodInEveryMonth(getPatientPaymentInMonthOct, 'bpjs')?.length,
    findPaymentMethodInEveryMonth(getPatientPaymentInMonthNov, 'bpjs')?.length,
    findPaymentMethodInEveryMonth(getPatientPaymentInMonthDec, 'bpjs')?.length,
  ]

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
    datasets: [
      {
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
      },
      {
        label: 'Present',
        data: dataPresentInEveryMonth,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1
      },
      {
        label: 'Not present',
        data: dataNotPresentInEveryMonth,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1
      }
    ]
  }

  const optionsPaymentInfoPolarChart = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Payment method this year (2023)',
      },
    },
  }

  const dataPaymentInfo = {
    labels: ['Cash', 'BPJS Kesehatan'],
    datasets: [
      {
        label: 'Total',
        data: dataPaymentMethodPolarAreaChart,
        backgroundColor: [
          '#ff296d',
          '#0ab110',
        ],
        borderWidth: 1,
      },
    ],
  };

  const dataPMPatientBarChart = {
    labels: labels,
    datasets: [
      {
        label: 'Cash',
        data: dataCashPMOfBarChat,
        backgroundColor: '#ff296d'
      },
      {
        label: 'BPJS Kesehatan',
        data: dataBPJSPMOfBarChat,
        backgroundColor: '#0ab110',
      }
    ]
  }

  const optionsPMPatientBarChart = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Payment method this year (2023)',
      },
    },
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
            {/* overview */}
            <h1 className={styles['title']}>Overview</h1>

            <div className={styles['container-overview']}>
              {overviewData?.length > 0 ? overviewData.map((item, index) => (
                <OverviewCard
                  key={index}
                  descValue={item.value}
                  title={item.title}
                  icon={item.icon}
                  styleIcon={{
                    backgroundColor: item.color
                  }}
                />
              )) : (
                <></>
              )}
            </div>

            {/* patient treatment */}
            <h1 className={styles['title']} style={{
              marginTop: '50px'
            }}>Patient Treatment</h1>
            <div className={styles['filter-years']}>
              <Button
                name="Year in 2023"
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  color: '#444',
                  borderRadius: '5px',
                  marginTop: '20px',
                  padding: '10px 13px'
                }}
              />
            </div>

            <TableContainer styleWrapp={{
              width: 'auto',
              margin: '20px 10px 0 10px',
              maxHeight: '600px',
              alignItems: 'center'
            }}>
              <Bar
                options={options}
                data={data}
                className={styles['trafic-presence']}
              />
            </TableContainer>

            <h1 className={styles['title']} style={{
              marginTop: '50px'
            }}>Payment Information</h1>

            <div className={styles['filter-years']}>
              <Button
                name="Year in 2023"
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  color: '#444',
                  borderRadius: '5px',
                  marginTop: '20px',
                  padding: '10px 13px'
                }}
              />
            </div>

            {/* payment information */}
            <div className={styles['payment-information']}>
              <div className={`${styles['right']} ${styles['payment-info-group']}`}>
                <PolarArea data={dataPaymentInfo} options={optionsPaymentInfoPolarChart} />
              </div>
              <div className={`${styles['left']} ${styles['payment-info-group']}`}>
                <Bar
                  options={optionsPMPatientBarChart}
                  data={dataPMPatientBarChart}
                  className={styles['trafic-presence']}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}