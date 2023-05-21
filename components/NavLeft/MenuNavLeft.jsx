import Link from 'next/link'
import { useRouter } from 'next/router'
import style from 'styles/MenuNavLeft.module.scss'
import LeftMenuNavChild from './LeftMenuNavChild'
import { useContext } from 'react'
import { NotFoundRedirectCtx } from 'lib/context/notFoundRedirect'

function MenuNavLeft({
    data,
    name,
    index,
    icon,
    styleNameMenu,
    styleIconMenuChild,
    styleMenuChild,
    handleOnMenuChild,
    iconDropChild,
    idMenuChild
}) {
    const router = useRouter()
    const { route } = router

    const { handleOnNavLeft } = useContext(NotFoundRedirectCtx)

    return (
        <>
            {data?.children ? (
                <li className={`${style['wrapp']} ${style['wrapp-menu-drop']}`} style={styleMenuChild}
                    onClick={handleOnMenuChild}
                >
                    <div className={style['container']}>
                        <div className={style['icon']}>
                            <i className={icon}></i>
                        </div>
                        <span className={style['name']} style={styleNameMenu}>{name}</span>
                        <i className={`${iconDropChild} ${style['icon-drop']}`} style={styleIconMenuChild}></i>
                    </div>

                    <LeftMenuNavChild
                        data={data?.children}
                        index={index}
                        id={idMenuChild}
                    />
                </li>
            ) : (
                <Link href={data?.path}>
                    <li className={data?.path === route ? `${style['wrapp']} ${style['active']}` : style['wrapp']}>
                        <div className={style['icon']}>
                            <i className={icon}></i>
                        </div>
                        <span className={style['name']} style={styleNameMenu}>{name}</span>
                    </li>
                </Link>
            )}
        </>
    )
}

export default MenuNavLeft