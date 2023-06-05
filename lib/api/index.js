import fetchJwtToken from "lib/useFetch/fetchJwtToken";

const { useFetch } = require("lib/useFetch/useFetch");
const { default: endpoint } = require("./endpoint");

// servicing hours
const APIPutPatientRegistration = (_id, id, data)=>useFetch(endpoint.putPatientRegistration(_id, id), 'PUT', data)
// update notif
const APIPutIsNotif = (_id, id)=>useFetch(endpoint.putIsNotif(_id, id), 'PUT')
const APIDeletePatientRegistration = (_id, id)=>useFetch(endpoint.deletePatientRegistration(_id, id), 'DELETE')
// confirmations
const APIPostConfirmAppointmentDate = (_id, id, data)=>useFetch(endpoint.postConfirmAppointmentDate(_id, id), 'POST', data)
const APIPutIsConfirm = (_id, id, data)=>useFetch(endpoint.putIsConfirm(_id, id), 'PUT', data)
// presence
const APIPutPresence = (_id, id, data)=>useFetch(endpoint.putPresence(_id, id), 'PUT', data)
// cancel registration
const APICancelRegistration = (_id, id)=>useFetch(endpoint.cancelRegistration(_id, id), 'DELETE')

// blogs
const APIGetBlog = ()=>useFetch(endpoint.getBlog(), 'GET')
const APIPostBlog = (_id, data)=>useFetch(endpoint.postBlog(_id), 'POST', data)
const APIPostImgDetailContent = (_id, id, data)=>useFetch(endpoint.postImgDetailContent(_id, id), 'POST', data)

// doctors
const APIGetDoctors = ()=>useFetch(endpoint.getDoctors(), 'GET')

// verification
const APIGetVerification = ()=>useFetch(endpoint.getVerification(), 'GET')
const APIPutVerification = (userId, data)=>useFetch(endpoint.putVerification(userId), 'PUT', data)
const APIPostVerification = (data)=> useFetch(endpoint.postVerification(), 'POST', data)
const APIDeleteVerification = (id)=> useFetch(endpoint.deleteVerification(id), 'DELETE')
// verification create new password and create jwt-token
const APIPostCreateJwtToken = (userId)=>useFetch(endpoint.postCreateJwtToken(userId), 'POST')
const APIGetJwtTokenVerif = (token)=>fetchJwtToken(endpoint.getTokenJwt(), 'GET', token)

// admin
const APIPutAdmin = (adminId, data)=>useFetch(endpoint.putAdmin(adminId), 'PUT', data)
const APIGetAdmin = ()=>useFetch(endpoint.getAdmin(), 'GET')
const APIPostAdmin = (data)=>useFetch(endpoint.postAdmin(), 'POST', data)
const APIPutAdminVerification = (adminId, data)=>useFetch(endpoint.putAdminVerification(adminId), 'PUT', data)

// blaclist token JWT
const APIPostBlackListJWT = (data)=>useFetch(endpoint.postBlackListJWT(), 'POST', data)

// loket
const APIPostLoket = (data)=>useFetch(endpoint.postLoket(), 'POST', data)
const APIPutPatientQueueInCounter = (_id, data)=>useFetch(endpoint.putPatientQueueInCounter(_id), 'PUT', data)
const APIPutPatientPresenceInCounter = (_id, data)=> useFetch(endpoint.putPatientPresenceInCounter(_id), 'PUT', data)
const APIDeleteLoket = (_id)=>useFetch(endpoint.deleteLoket(_id), 'DELETE')

// finished treatment
const APIPostPatientFinishTreatment = (data)=>useFetch(endpoint.postPatientFinishTreatment(), 'POST', data)
const APIDeleteFinishedTreatment = (_id)=>useFetch(endpoint.deleteFinishedTreatment(_id), 'DELETE')

const API = {
    APIPutPatientRegistration,
    APIPutIsNotif,
    APIDeletePatientRegistration,
    APIPostConfirmAppointmentDate,
    APIPutIsConfirm,
    APIPutPresence,
    APICancelRegistration,
    APIGetBlog,
    APIPostBlog,
    APIPostImgDetailContent,
    APIGetDoctors,
    APIPostCreateJwtToken,
    APIGetJwtTokenVerif,
    APIPutAdmin,
    APIPostBlackListJWT,
    APIGetAdmin,
    APIPostAdmin,
    APIGetVerification,
    APIPutVerification,
    APIPostVerification,
    APIPutAdminVerification,
    APIDeleteVerification,
    APIPostLoket,
    APIPutPatientQueueInCounter,
    APIPutPatientPresenceInCounter,
    APIDeleteLoket,
    APIPostPatientFinishTreatment,
    APIDeleteFinishedTreatment
}

export default API