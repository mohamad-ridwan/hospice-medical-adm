import { useContext, useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import style from 'styles/ConfirmationPatient.module.scss'
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
import WrappEditPR from 'components/Popup/WrappEditPR'
import Input from 'components/Input'
import Button from 'components/Button'
import { dayNamesEng } from 'lib/namesOfCalendar/dayNamesEng'
import { dayNamesInd } from 'lib/namesOfCalendar/dayNamesInd'
import { monthNames } from 'lib/namesOfCalendar/monthNames'
import monthNamesInd from 'lib/namesOfCalendar/monthNameInd'
import Pagination from 'components/Pagination/Pagination'
import TableFilter from 'components/Table/TableFilter'
import specialCharacter from 'lib/regex/specialCharacter'
import spaceString from 'lib/regex/spaceString'

function ConfirmationPatient() {
  const [currentPage, setCurrentPage] = useState(1)
  const [head] = useState([
    {
      name: 'Patient Name'
    },
    {
      name: 'Room Name'
    },
    {
      name: 'Queue Number'
    },
    {
      name: 'Appointment Date'
    },
    {
      name: 'Treatment Hours'
    },
    {
      name: 'Confirmation Date'
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
  const [dataColumns, setDataColumns] = useState([])
  const [idDataRegisForUpdt, setIdDataRegisForUpdt] = useState(null)
  const [personalDataRegis, setPersonalDataRegis] = useState(null)
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [onPopupEdit, setOnPopupEdit] = useState(false)
  const [errorMsgSubmit, setErrMsgSubmit] = useState({})
  const [valueInputEdit, setValueInputEdit] = useState({
    jenisPenyakit: '',
    appointmentDate: '',
    submissionDate: '',
    patientName: '',
    emailAddress: '',
    dateOfBirth: '',
    phone: ''
  })
  const [searchText, setSearchText] = useState('')
  const [displayOnCalendar, setDisplayOnCalendar] = useState(false)
  const [selectDate, setSelectDate] = useState()
  const [onSortDate, setOnSortDate] = useState(false)
  const [chooseFilterRoom, setChooseFilterRoom] = useState({
    id: 'Filter Room',
    title: 'Filter Room'
  })
  const [chooseFilterByDate, setChooseFilterByDate] = useState({
    id: 'Off Date',
    title: 'Off Date'
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
      id: 'Confirmation Date',
      title: 'Confirmation Date',
    },
    {
      id: 'Date of Birth',
      title: 'Date of Birth',
    },
  ])
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

  // swr fetching data
  // servicing hours
  const { data: dataService, error: errService, isLoading: loadService } = useSwr(endpoint.getServicingHours())
  const bookAnAppointment = dataService?.data?.find(item => item.id === 'book-an-appointment')

  // doctors
  const { data: dataDoctors, error: errDataDoctors, isLoading: loadDataDoctors } = useSwr(endpoint.getDoctors())
  const getDoctorsDocument = dataDoctors?.data?.length > 0 ? dataDoctors?.data[0] : []
  const getDoctors = getDoctorsDocument?.data?.length > 0 ? getDoctorsDocument.data : []
  
  const getRoomDoctors = ()=>{
    const filterRoom = [{
      id: 'Filter Room',
      title: 'Filter Room'
    }]

    let count = 0

    const getRoom = ()=>{
      return getDoctors?.length > 0 ? getDoctors.forEach(doctor=>{
        count = count + 1
        const checkRoom = filterRoom.findIndex(item=>item.id.toLowerCase() === doctor?.room?.toLowerCase())
        if(checkRoom === -1){
          filterRoom.push({
            id: doctor?.room,
            title: doctor?.room
          })
        }
      }) : null
    }

    getRoom()

    if(!errDataDoctors && count === getDoctors?.length){
      return filterRoom
    }else if(!loadDataDoctors && errDataDoctors){
      return filterRoom
    }
  }

  // context
  const { user, loadingAuth } = useContext(AuthContext)
  const { onNavLeft } = useContext(NotFoundRedirectCtx)

  const router = useRouter()

  const changeTableStyle = (dataColumnsBody) => {
    let elementTDataLoad = document.getElementById('tDataLoad00')
    let elementTHead = document.getElementById('tHead0')
    let elementTData = document.getElementById('tData00')
    if (dataColumnsBody?.length > 0) {
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
        elementTHead.style.width = 'calc(100%/10)'
        elementTHead = document.getElementById(`tHead2`)
        elementTHead.style.width = 'calc(100%/8)'
        elementTHead = document.getElementById(`tHead3`)
        elementTHead.style.width = 'calc(100%/7)'
        elementTHead = document.getElementById(`tHead4`)
        elementTHead.style.width = 'calc(100%/8)'
        elementTHead = document.getElementById(`tHead5`)
        elementTHead.style.width = 'calc(100%/7)'
        elementTHead = document.getElementById(`tHead6`)
        elementTHead.style.width = 'calc(100%/5.5)'
        elementTHead = document.getElementById(`tHead7`)
        elementTHead.style.width = 'calc(100%/9)'
      }
      if (elementTData) {
        for (let i = 0; i < dataColumnsBody?.length; i++) {
          elementTData = document.getElementById(`tData${i}0`)
          elementTData.style.width = 'calc(100%/7)'
          elementTData = document.getElementById(`tData${i}1`)
          elementTData.style.width = 'calc(100%/10)'
          elementTData = document.getElementById(`tData${i}2`)
          elementTData.style.width = 'calc(100%/8)'
          elementTData = document.getElementById(`tData${i}3`)
          elementTData.style.width = 'calc(100%/7)'
          elementTData = document.getElementById(`tData${i}4`)
          elementTData.style.width = 'calc(100%/8)'
          elementTData = document.getElementById(`tData${i}5`)
          elementTData.style.width = 'calc(100%/7)'
          elementTData = document.getElementById(`tData${i}6`)
          elementTData.style.width = 'calc(100%/5.5)'
          elementTData = document.getElementById(`tData${i}7`)
          elementTData.style.width = 'calc(100%/9)'
        }
      }
    }
  }

  const findDataRegistration = () => {
    if (bookAnAppointment) {
      const userAppointmentData = bookAnAppointment.userAppointmentData
      const findRegistration = userAppointmentData?.length > 0 ? userAppointmentData.filter(regis => regis.isConfirm?.id && regis.isConfirm?.presence === 'menunggu') : null
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
                  name: item?.isConfirm?.roomInfo?.roomName,
                  colorName: '#ff296d',
                  fontWeightName: 'bold',
                  filterRoom: true
                },
                {
                  name: item?.isConfirm?.queueNumber,
                  colorName: '#288bbc',
                  fontWeightName: 'bold'
                },
                {
                  firstDesc: makeNormalDate(item.appointmentDate),
                  color: '#ff296d',
                  colorName: '#777',
                  marginBottom: '4.5px',
                  fontSize: '12px',
                  filterBy: 'Appointment Date',
                  confirmHour: item?.isConfirm?.confirmHour,
                  queueNumber: item?.isConfirm?.queueNumber,
                  name: item.appointmentDate
                },
                {
                  name: item?.isConfirm?.treatmentHours,
                },
                {
                  firstDesc: makeNormalDate(item?.isConfirm?.dateConfirm),
                  color: '#006400',
                  colorName: '#777',
                  marginBottom: '4.5px',
                  fontSize: '12px',
                  filterBy: 'Confirmation Date',
                  confirmHour: item?.isConfirm?.confirmHour,
                  queueNumber: item?.isConfirm?.queueNumber,
                  name: item?.isConfirm?.dateConfirm
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
        setTimeout(() => {
          if (newData.length === findRegistration.length) {
            setDataColumns(newData)
          }
        }, 0)
      }
    }
  }

  useEffect(() => {
    if (!loadService && dataService) {
      findDataRegistration()
    } else if (loadService) {
      console.log('loading data patient registration')
    } else if (!loadService && errService) {
      console.log('no data service available')
      console.log(errService)
    }
  }, [dataService])

  const filterByRoom = chooseFilterRoom?.id !== 'Filter Room' && dataColumns?.length > 0 ? dataColumns.filter(patient=>{
    const findRoom = patient?.data?.filter(data=>
      data?.filterRoom && 
      data?.name?.toLowerCase() === chooseFilterRoom?.id?.toLowerCase()
      )

      return findRoom?.length > 0
  }) : []

  const checkFilterByRoom = ()=>{
    if(chooseFilterRoom?.id !== 'Filter Room'){
      return filterByRoom
    }

    return dataColumns
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

  const filterByDate = checkFilterByRoom()?.length > 0 ? checkFilterByRoom().filter(patient => {
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

    return checkFilterByRoom()
  }
  const sortDate = onSortDate && filterByDate?.length > 0 ? filterByDate.sort((p1, p2) => {
    const findDateOnSelectDateP1 = p1?.data?.find(data =>
      data?.filterBy?.toLowerCase() === chooseFilterByDate?.id?.toLowerCase()
    )
    const findDateOnSelectDateP2 = p2?.data?.find(data =>
      data?.filterBy?.toLowerCase() === chooseFilterByDate?.id?.toLowerCase()
    )

    return parseInt(findDateOnSelectDateP1?.queueNumber) - parseInt(findDateOnSelectDateP2?.queueNumber)
    // return new Date(`${findDateOnSelectDateP1?.name} ${findDateOnSelectDateP1?.confirmHour}`) - new Date(`${findDateOnSelectDateP2?.name} ${findDateOnSelectDateP2?.confirmHour}`)
  }) : []

  const checkSortSubmissionDate = () => {
    if (onSortDate) {
      return sortDate
    }

    return checkFilterByDate()
  }

  const filterText = checkSortSubmissionDate()?.length > 0 ? checkSortSubmissionDate().filter(patient => {
    const findItem = patient?.data?.filter(data => data?.name?.toString()?.replace(specialCharacter, '')?.replace(spaceString, '')?.toLowerCase()?.includes(searchText?.replace(spaceString, '')?.toLowerCase()))

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
      }, 0)
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

  const propsErrMsg = {
    styleInputErrMsg: {
      display: 'flex',
      marginBottom: '15px'
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
        console.log(err)
      })
  }

  const toPage = (path) => {
    router.push(path)
  }

  const handlePopupEdit = () => {
    setOnPopupEdit(!onPopupEdit)
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
    }
  }

  const handleSortRoom = () => {
    const selectEl = document.getElementById('sortRoom')
    const id = selectEl.options[selectEl.selectedIndex].value
    if (id) {
      setChooseFilterRoom({
        id: id,
        title: id
      })
    }
  }

  return (
    <>
      <Head>
        <title>Confirmation Patient Registration | Admin Hospice Medical</title>
        <meta name="description" content="konfirmasi pendaftaran pasien yang siap dipanggil di Hospice Medical" />
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
              List of Confirmed Patients
            </h1>

            <TableContainer styleWrapp={{
              margin: '50px 0 0 0'
            }}>
              <TableFilter
                placeholder="Search text"
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
                displaySortOther={true}
                dataSortOther={getRoomDoctors()}
                idSortOther='sortRoom'
                handleSortOther={handleSortRoom}
              />
              <TableBody
              // styleWrapp={{
              //   width: '1300px'
              // }}
              >
                <div className={style['container-table-content']}>
                  <TableHead
                    id='tHead'
                    data={head}
                    styleName={{
                      padding: '15px 8px'
                    }}
                  />
                  {currentTableData?.length > 0 ? currentTableData.map((item, index) => {
                    const pathUrlToDataDetail = `/patient/patient-registration/personal-data/confirmed/${item.data[0]?.name}/${item.id}`

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
                          {/* <i className={`fa-solid fa-circle ${style['icon-no-read']}`} style={{
                          color: item.isNotif ? 'transparent' : '#ff296d'
                        }}></i> */}
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
                                  fontWeight: data?.fontWeightName
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

export default ConfirmationPatient