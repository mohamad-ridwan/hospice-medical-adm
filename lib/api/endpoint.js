// blog
const getBlog = () => 'v9/blog/get'
const postBlog = (_id) => `v9/blog/post/all-document/data/${_id}`
const postImgDetailContent = (_id, id) => `v9/blog/post/all-document/data/image-detail-content/${_id}/${id}`

const endpoint = {
    getBlog,
    postBlog,
    postImgDetailContent
}

export default endpoint