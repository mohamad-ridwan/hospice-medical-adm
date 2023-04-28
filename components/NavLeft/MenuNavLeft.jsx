import Link from 'next/link'
import { useRouter } from 'next/router'
import style from 'styles/MenuNavLeft.module.scss'

function MenuNavLeft({
    data,
    name,
    icon,
    styleNameMenu,
    styleIconMenuChild
}) {
    const router = useRouter()
    const {route} = router

    return (
        <>
            {data?.children ? (
                <li className={style['wrapp']}>
                    <i className={icon}></i>
                    <span className={style['name']} style={styleNameMenu}>{name}</span>
                    <i className={`fa-solid fa-angle-down ${style['icon-drop']}`} style={styleIconMenuChild}></i>
                </li>
            ) : (
                <Link href={data?.path}>
                    <li className={data?.path === route ? `${style['wrapp']} ${style['active']}` : style['wrapp']}>
                        <i className={icon}></i>
                        <span className={style['name']} style={styleNameMenu}>{name}</span>
                    </li>
                </Link>
            )}
        </>
    )
}

export default MenuNavLeft