import style from 'styles/TableHead.module.scss'

function TableHead({
    data,
    id
}) {
    return (
        <div className={style['head']}>
            {data?.length > 0 ? data.map((item, index)=>{
                return (
                    <div key={index} className={style['head-name']} id={`${id}${index}`}>{item.name}</div>
                )
            }): (
                <></>
            )}
        </div>
    )
}

export default TableHead