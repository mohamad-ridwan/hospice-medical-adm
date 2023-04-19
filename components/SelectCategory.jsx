import styleSelectCtg from 'styles/SelectCategory.module.scss'

function SelectCategory({
    titleCtg,
    handleCategory,
    dataBlogCategory,
    idSelect
}) {
    return (
        <>
            <div className={styleSelectCtg['container-category']}>
                <h3 className={styleSelectCtg['category-blog-id']}>
                    {titleCtg}
                </h3>
                <select name="" id={idSelect} onChange={handleCategory} className={styleSelectCtg['select-category']}>
                    {dataBlogCategory.length > 0 && dataBlogCategory.map((blog, index) => (
                        <option key={index} value={blog.id}>{blog.title}</option>
                    ))}
                </select>
            </div>
        </>
    )
}

export default SelectCategory