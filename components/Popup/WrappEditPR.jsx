import style from 'styles/WrappEditPR.module.scss'

function WrappEditPR({
    styleWrapp,
    children,
    clickWrapp,
    clickClose
}) {
    return (
        <div className={style['wrapp']} style={styleWrapp}
        onClick={clickWrapp}
        >
            <div className={style['content']} onClick={(e)=>e.stopPropagation()}>
                <button className={style['close']} onClick={clickClose}>
                    <i className="fa-solid fa-xmark"></i>
                </button>
                {children}
            </div>
        </div>
    )
}

export default WrappEditPR