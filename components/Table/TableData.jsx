import style from 'styles/TableData.module.scss'

function TableData({
    id,
    name,
    children,
    styleWrapp,
    click
}) {
    return (
        <div className={style['table-data']} id={id} style={styleWrapp}
        onClick={click}
        >
            {name === undefined ? children : name}
        </div>
    )
}

export default TableData