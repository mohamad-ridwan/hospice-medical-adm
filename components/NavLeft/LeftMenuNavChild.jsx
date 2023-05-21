import style from 'styles/LeftMenuNavChild.module.scss'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useContext } from 'react'
import { NotFoundRedirectCtx } from 'lib/context/notFoundRedirect'

function LeftMenuNavChild({
    data,
    index,
    id
}) {
    const router = useRouter()
    const { route } = router

    const { handleOnNavLeft } = useContext(NotFoundRedirectCtx)

    return (
        <ul className={style['wrapp']} id={`${id}${index}`}
            onClick={(e) => e.stopPropagation()}
        >
            {data?.length > 0 && data?.map((item, index) => {
                return (
                    <Link key={index} href={item.path}>
                        <li className={route === item.path ? `${style['menu']} ${style['active']}` : style['menu']}>
                            <div className={style['icon']}>
                                <i className={item.icon}></i>
                            </div>
                            <span className={style['name']}>{item.name}</span>
                        </li>
                    </Link>
                )
            })}
        </ul>
    )
}

export default LeftMenuNavChild