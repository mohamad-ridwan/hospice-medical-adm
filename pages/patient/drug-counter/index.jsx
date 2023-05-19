import { useContext, useEffect, useState } from 'react'
import Head from 'next/head'
import style from 'styles/DrugCounter.module.scss'
import { AuthContext } from 'lib/context/auth'
import { NotFoundRedirectCtx } from 'lib/context/notFoundRedirect'
import SelectCategory from 'components/SelectCategory'
import Button from 'components/Button'
import Link from 'next/link'
import useSwr from 'lib/useFetch/useSwr'
import endpoint from 'lib/api/endpoint'

function DrugCounter() {
    const [chooseCounter, setChooseCounter] = useState({})

    // loket
    const { data: dataLoket, error: errDataLoket, isLoading: loadDataLoket } = useSwr(endpoint.getLoket())
    const findInfoLoket = dataLoket?.data ? dataLoket?.data?.find(item => item.loketRules === 'info-loket') : null
    const getLoket = findInfoLoket ? findInfoLoket?.loketInfo : null
    const newLoket = getLoket?.length > 0 ? getLoket.map(item => ({ id: item.loketName, title: item.loketName })) : null
    // patient-queue
    const getPatientQueue = dataLoket?.data ? dataLoket?.data?.filter(item => item.loketRules === 'patient-queue') : null

    // context
    const { user, loadingAuth } = useContext(AuthContext)
    const { onNavLeft } = useContext(NotFoundRedirectCtx)

    // now date
    const newGetCurrentMonth = new Date().getMonth() + 1
    const getCurrentMonth = newGetCurrentMonth.toString().length === 1 ? `0${newGetCurrentMonth}` : newGetCurrentMonth
    const getCurrentDate = new Date().getDate().toString().length === 1 ? `0${new Date().getDate()}` : new Date().getDate()
    const getCurrentYear = new Date().getFullYear()
    const currentDate = `${getCurrentMonth}/${getCurrentDate}/${getCurrentYear}`

    useEffect(() => {
        if (dataLoket?.data && newLoket?.length > 0) {
            const findLoket = newLoket[0]?.id
            const findPatientInLoket = getPatientQueue.filter(patient => patient.loketName === findLoket && patient?.isConfirm?.confirmState === false)
            const findTotalPatientToday = getPatientQueue.filter(patient => patient.loketName === findLoket && patient?.isConfirm?.confirmState && patient?.isConfirm?.dateConfirm === currentDate)
            setChooseCounter({
                id: 'patient-queue',
                loketName: findLoket,
                totalQueue: findPatientInLoket?.length,
                totalPatientToday: findTotalPatientToday?.length
            })
        }
    }, [dataLoket])

    const handleSelectCounter = () => {
        const selectEl = document.getElementById('selectCounter')
        const id = selectEl.options[selectEl.selectedIndex].value
        if (id) {
            const findPatientInLoket = getPatientQueue.filter(patient => patient.loketName === id && patient?.isConfirm?.confirmState === false)
            const findTotalPatientToday = getPatientQueue.filter(patient => patient.loketName === id && patient?.isConfirm?.confirmState && patient?.isConfirm?.dateConfirm === currentDate)
            setChooseCounter({
                id: 'patient-queue',
                loketName: id,
                totalQueue: findPatientInLoket?.length,
                totalPatientToday: findTotalPatientToday?.length
            })
        }
    }

    return (
        <>
            <Head>
                <title>Drug Counter | Admin Hospice Medical</title>
                <meta name="description" content="loket penungguan obat di Hospice Medical" />
            </Head>

            <div className={onNavLeft ? `${style['wrapp']} ${style['wrapp-active']}` : style['wrapp']}>
                <div className={style['container']}>
                    <div className={style['content']}>
                        <h1 className={style['title']}>
                            Drug Counter
                        </h1>

                        <div className={style['white-content']}>
                            <h1 className={style['title-info']}>
                                Select Drug Counter
                            </h1>
                            {/* select counter */}
                            <SelectCategory
                                styleWrapp={{
                                    margin: '0px 0'
                                }}
                                titleCtg="Counter"
                                idSelect="selectCounter"
                                handleCategory={handleSelectCounter}
                                dataBlogCategory={newLoket}
                            />
                            <div className={style['total-patient-waiting']}>
                                <p className={style['desc']}>
                                    Total Patient Waiting :
                                </p>
                                <span className={style['number']}>
                                    {chooseCounter?.totalQueue}
                                </span>
                            </div>
                            <div className={`${style['total-patient-waiting']} total-patient-at-the-counter-today`}>
                                <p className={style['desc']}>
                                    Finished Taking Medicine Today :
                                </p>
                                <span className={style['number']}>
                                    {chooseCounter?.totalPatientToday}
                                </span>
                            </div>
                            <Link href={`/patient/drug-counter/${chooseCounter?.loketName}`} style={{
                                width: 'fit-content',
                                marginTop: '15px'
                            }}>
                                <Button
                                    name={`GO TO ${chooseCounter?.loketName}`}
                                    style={{
                                        width: 'auto',
                                    }}
                                />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default DrugCounter