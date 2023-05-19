import style from 'styles/TableData.module.scss'

function TableData({
    id,
    name,
    children,
    styleWrapp,
    click,
    styleName
}) {
    return (
        <div className={style['table-data']} id={id} style={styleWrapp}
            onClick={click}
        >
            {name === undefined ? children : (
                <p className={style['name']} style={styleName}>
                    {name}
                </p>
            )}
        </div>
    )
}

export default TableData