import fetchJwtToken from "lib/useFetch/fetchJwtToken";

const { useFetch } = require("lib/useFetch/useFetch");
const { default: endpoint } = require("./endpoint");

// blogs
const APIGetBlog = ()=>useFetch(endpoint.getBlog(), 'GET')
const APIPostBlog = (_id, data)=>useFetch(endpoint.postBlog(_id), 'POST', data)
const APIPostImgDetailContent = (_id, id, data)=>useFetch(endpoint.postImgDetailContent(_id, id), 'POST', data)

// verification
const APIGetVerification = ()=>useFetch(endpoint.getVerification(), 'GET')
const APIPutVerification = (userId, data)=>useFetch(endpoint.putVerification(userId), 'PUT', data)
const APIPostVerification = (data)=> useFetch(endpoint.postVerification(), 'POST', data)
const APIDeleteVerification = (id)=> useFetch(endpoint.deleteVerification(id), 'DELETE')
// verification create new password and create jwt-token
const APIPostCreateJwtToken = (userId)=>useFetch(endpoint.postCreateJwtToken(userId), 'POST')
const APIGetJwtTokenVerif = (token)=>fetchJwtToken(endpoint.getTokenJwt(), 'GET', token)

// blaclist token JWT
const APIPostBlackListJWT = (data)=>useFetch(endpoint.postBlackListJWT(), 'POST', data)

// admin
const APIPutAdmin = (adminId, data)=>useFetch(endpoint.putAdmin(adminId), 'PUT', data)
const APIGetAdmin = ()=>useFetch(endpoint.getAdmin(), 'GET')
const APIPostAdmin = (data)=>useFetch(endpoint.postAdmin(), 'POST', data)
const APIPutAdminVerification = (adminId, data)=>useFetch(endpoint.putAdminVerification(adminId), 'PUT', data)

const API = {
    APIGetBlog,
    APIPostBlog,
    APIPostImgDetailContent,
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
    APIDeleteVerification
}

export default API