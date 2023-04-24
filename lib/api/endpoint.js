// blog
const getBlog = () => 'v9/blog/get'
const postBlog = (_id) => `v9/blog/post/all-document/data/${_id}`
const postImgDetailContent = (_id, id) => `v9/blog/post/all-document/data/image-detail-content/${_id}/${id}`

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
    getBlog,
    postBlog,
    postImgDetailContent,
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