import style from 'styles/OverviewCard.module.scss'

function OverviewCard({
    descValue,
    title,
    styleIcon,
    icon
}) {
    return (
        <div className={style['overview-card']}>
            <div className={style['icon']} style={styleIcon}>
                <i className={icon}></i>
            </div>

            <div className={style['content-desc']}>
                <span className={style['title']}>
                    {title}
                </span>
                <h1 className={style['desc-value']}>
                    {descValue}
                </h1>
            </div>
        </div>
    )
}

export default OverviewCard