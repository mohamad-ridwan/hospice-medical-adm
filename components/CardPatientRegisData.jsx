import style from 'styles/CardPatientRegis.module.scss'

function CardPatientRegisData({
    title,
    icon,
    styleIcon,
    styleDesc,
    desc
}) {
    return (
        <div className={style['patient-data']}>
            <h1 className={style['title']}>
                {title}
            </h1>
            <div className={style['desc-data']}>
                <p className={style['desc']} style={styleDesc}>
                    <i className={icon} style={styleIcon}></i>
                    <span className="txt-desc">
                        {desc}
                    </span>
                </p>
            </div>
        </div>
    )
}

export default CardPatientRegisData