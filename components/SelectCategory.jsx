import styleSelectCtg from 'styles/SelectCategory.module.scss'

function SelectCategory({
    styleWrapp,
    styleTitle,
    titleCtg,
    handleCategory,
    dataBlogCategory,
    idSelect,
    classSelect,
    styleCategory
}) {
    return (
        <>
            <div className={styleSelectCtg['container-category']} style={styleWrapp}>
                <h3 className={styleSelectCtg['category-blog-id']} style={styleTitle}>
                    {titleCtg}
                </h3>
                <select name="" id={idSelect} onChange={handleCategory} className={`${styleSelectCtg['select-category']} ${styleSelectCtg[classSelect]}`} style={styleCategory}>
                    {dataBlogCategory?.length > 0 && dataBlogCategory?.map((blog, index) => (
                        <option key={index} value={blog.id}>{blog.title}</option>
                    ))}
                </select>
            </div>
        </>
    )
}

export default SelectCategory