const { useFetch } = require("lib/useFetch/useFetch");
const { default: endpoint } = require("./endpoint");

const APIGetBlog = ()=>useFetch(endpoint.getBlog())
const APIPostBlog = (_id, data)=>useFetch(endpoint.postBlog(_id), 'POST', data)
const APIPostImgDetailContent = (_id, id, data)=>useFetch(endpoint.postImgDetailContent(_id, id), 'POST', data)

const API = {
    APIGetBlog,
    APIPostBlog,
    APIPostImgDetailContent
}

export default API