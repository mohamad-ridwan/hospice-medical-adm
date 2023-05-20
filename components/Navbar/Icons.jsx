import Image from 'next/image'
import style from 'styles/Icons.module.scss'

function Icons({
    click,
    nameAdmin,
    totalNotif,
    icon,
    styleName,
    styleIcon,
    styleWrapp,
    styleNumNotif,
    urlImg,
    styleImg,
    classWrapp,
    children
}) {
    return (
        <>
            <div className={`${style['icons']} ${style[classWrapp]}`} style={styleWrapp} onClick={click}>
                <Image
                    className={style['image-profile']}
                    src={urlImg}
                    alt={nameAdmin}
                    width={45}
                    height={45}
                    style={styleImg}
                />
                <p className={style['name-admin']} style={styleName}>
                    {nameAdmin}
                </p>

                <span className={style['number-notif']} style={styleNumNotif}>
                    {totalNotif}
                </span>
                <i className={icon} style={styleIcon}></i>

                {children}
            </div>
        </>
    )
}

export default Icons