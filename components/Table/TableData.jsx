import style from 'styles/TableData.module.scss'

function TableData({
    id,
    firstDesc,
    styleFirstDesc,
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
                <div className={style['container-name']}>
                    <p className={style['first-description']} style={styleFirstDesc}>
                        {firstDesc}
                    </p>
                    <p className={style['name']} style={styleName}>
                        {name}
                    </p>
                </div>
            )}
        </div>
    )
}

export default TableData