import styleHeadFP from 'styles/HeadForgotPassword.module.scss'

function HeadForgotPassword({
    icon,
    title,
    desc,
    styleIcon
}) {
    return (
        <>
            <div className={styleHeadFP['icon']} style={styleIcon}>
                <i className={icon}></i>
            </div>

            <h1 className={styleHeadFP['title-forgot-password']}>
                {title}
            </h1>
            <p className={styleHeadFP['desc']}>
                {desc}
            </p>
        </>
    )
}

export default HeadForgotPassword