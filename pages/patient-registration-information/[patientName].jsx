import { useRouter } from 'next/router'
import Head from 'next/head'
import style from 'styles/IdxPatientRegisInfo.module.scss'

function IdxPatientRegisInfo() {
    const router = useRouter()
    const {patientName} = router.query

    return (
        <>
            <Head>
                <title>Successfully Downloaded - {patientName} - Patient Registration | Admin Hospice Medical</title>
                <meta name="description" content="informasi konfirmasi pendaftaran jadwal pasien berobat di Hospice Medical" />
            </Head>
            <div className="wrapp">
                <h1>Successfully Downloaded</h1>
            </div>
        </>
    )
}

export default IdxPatientRegisInfo

IdxPatientRegisInfo.getLayout = function getLayout(page) {
    return (
        <>
            {page}
        </>
    )
}