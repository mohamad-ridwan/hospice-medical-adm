import style from 'styles/TableColumns.module.scss'

function TableColumns({
    children,
    clickEdit,
    clickDelete,
    styleWrappBtn,
    styleEdit,
    styleDelete,
    classWrapp,
    styleLoadingCircle,
    styleIconDelete
}) {
    return (
        <div className={`${style['table-columns']} ${style[classWrapp]}`}>
            {children}

            <div className={style['btn']} style={styleWrappBtn}>
                <button className={style['edit']}
                onClick={clickEdit}
                style={styleEdit}
                >
                    <i className="fa-solid fa-pencil"></i>
                </button>
                <button className={`${style['edit']} ${style['delete']}`}
                onClick={clickDelete}
                style={styleDelete}
                >
                    <div className={style['loading-circle']} style={styleLoadingCircle}>

                    </div>
                    <i className="fa-solid fa-trash" style={styleIconDelete}></i>
                </button>
            </div>
        </div>
    )
}

export default TableColumns