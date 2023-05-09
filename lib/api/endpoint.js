// servicing hours
const getServicingHours = ()=> 'v8/servicing-hours/get'
const putPatientRegistration = (_id, id)=>`v8/servicing-hours/put/patient-registration-data/book-an-appointment/user-appointment-data/${_id}/${id}`
// notifikasi patient registration
const putIsNotif = (_id, id)=> `v8/servicing-hours/put/book-an-appointment/user-appointment-data/${_id}/${id}/is-notif`
const deletePatientRegistration = (_id, id)=>`v8/servicing-hours/delete/patient-registration-data/book-an-appointment/user-appointment-data/${_id}/${id}`
// confirmations
const postConfirmAppointmentDate = (_id, id)=>`v8/servicing-hours/post/book-an-appointment/user-appointment-data/is-confirm/${_id}/${id}`

// blog
const getBlog = () => 'v9/blog/get'
const postBlog = (_id) => `v9/blog/post/all-document/data/${_id}`
const postImgDetailContent = (_id, id) => `v9/blog/post/all-document/data/image-detail-content/${_id}/${id}`

// doctors
const getDoctors = ()=>'v10/doctors/get'

// verification
const getVerification = ()=> 'v13/verification/get'
const putVerification = (userId)=>`v13/verification/put/${userId}`
const postVerification = ()=> 'v13/verification/post'
const deleteVerification = (id)=>`v13/verification/delete/${id}`
// verification create new password and create jwt-token
const postCreateJwtToken = (userId)=>`v13/verification/post/forgot-password/create-new-password/${userId}/admin`
const getTokenJwt = ()=> `v13/verification/get/forgot-password/create-new-password`

// black list jwt
const getBlackListJWT = ()=> 'v15/black-list-jwt/get'
const postBlackListJWT = ()=> 'v15/black-list-jwt/post'

// admin
const getAdmin = ()=> 'v14/admin/get'
const putAdmin = (adminId)=> `v14/admin/put/admin/${adminId}`
const putAdminVerification = (adminId)=> `v14/admin/put/${adminId}`
const postAdmin = ()=> 'v14/admin/post'

const endpoint = {
    getServicingHours,
    putPatientRegistration,
    putIsNotif,
    deletePatientRegistration,
    postConfirmAppointmentDate,
    getBlog,
    postBlog,
    postImgDetailContent,
    getDoctors,
    getAdmin,
    postCreateJwtToken,
    getTokenJwt,
    getBlackListJWT,
    putAdmin,
    postBlackListJWT,
    postAdmin,
    getVerification,
    putVerification,
    postVerification,
    putAdminVerification,
    deleteVerification
}

export default endpoint