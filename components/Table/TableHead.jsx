import style from 'styles/TableHead.module.scss'

function TableHead({
    data,
    id,
    styleWrapp,
    styleName
}) {
    return (
        <div className={style['head']} style={styleWrapp}>
            {data?.length > 0 ? data.map((item, index)=>{
                return (
                    <div key={index} className={style['head-name']} id={`${id}${index}`} style={styleName}>{item.name}</div>
                )
            }): (
                <></>
            )}
        </div>
    )
}

export default TableHead