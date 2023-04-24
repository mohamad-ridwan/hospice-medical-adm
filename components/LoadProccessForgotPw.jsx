import styleInPage from 'styles/LoadProccessForgotPw.module.scss'

function LoadProccessForgotPw({
    style,
    text
}) {
    return (
        <div className={styleInPage['container-loading']} style={style}>
            <div className={styleInPage['loading-circle']}></div>
            <p className={styleInPage['waiting']}>
                {text}
            </p>
        </div>
    )
}

export default LoadProccessForgotPw