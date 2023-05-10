import style from 'styles/CardPatientRegis.module.scss'

function CardPatientRegisData({
    title,
    icon,
    styleIcon,
    styleDesc,
    desc,
    styleWrapp,
    styleTitle,
    styleWrappDesc,
    children
}) {
    return (
        <div className={style['patient-data']} style={styleWrapp}>
            <h1 className={style['title']} style={styleTitle}>
                {title}
            </h1>
            <div className={style['desc-data']} style={styleWrappDesc}>
                <p className={style['desc']} style={styleDesc}>
                    <i className={icon} style={styleIcon}></i>
                    <span className="txt-desc">
                        {desc}
                    </span>
                </p>
            </div>
            {children}
        </div>
    )
}

export default CardPatientRegisData