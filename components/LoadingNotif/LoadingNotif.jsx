import style from 'styles/LoadingNotif.module.scss'
import ShineLoading from "components/ShineLoading"

function LoadingNotif({
    styleWrapp
}) {
    return (
        <div className={style['wrapp']} style={styleWrapp}>
            <div className={style['date']}>
                <ShineLoading
                    styleWrapp={{
                        height: '12px',
                        width: '120px',
                        borderRadius: '500px',
                        margin: '0'
                    }}
                />
            </div>
            <div className={style['appointment']}>
                <ShineLoading
                    styleWrapp={{
                        height: '12px',
                        width: 'auto',
                        borderRadius: '500px',
                        margin: '0'
                    }}
                />
            </div>
            <div className={style['body']}>
                <ShineLoading
                    styleWrapp={{
                        height: '12px',
                        width: '100%',
                        borderRadius: '500px',
                        margin: '0'
                    }}
                />
            </div>
            <div className={style['body-two']}>
                <ShineLoading
                    styleWrapp={{
                        height: '12px',
                        width: 'auto',
                        borderRadius: '500px',
                        margin: '0'
                    }}
                />
            </div>
        </div>
    )
}

export default LoadingNotif