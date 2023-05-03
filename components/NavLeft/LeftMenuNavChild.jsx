import style from 'styles/LeftMenuNavChild.module.scss'
import { useRouter } from 'next/router'
import Link from 'next/link'

function LeftMenuNavChild({
    data,
    index,
    id
}) {
    const router = useRouter()
    const { route } = router

    return (
        <ul className={style['wrapp']} id={`${id}${index}`}
        onClick={(e)=>e.stopPropagation()}
        >
            {data?.length > 0 && data?.map((item, index) => {
                return (
                    <Link key={index} href={item.path}>
                        <li className={route === item.path ? `${style['menu']} ${style['active']}` : style['menu']}>
                            <i className={item.icon}></i>
                            <span className={style['name']}>{item.name}</span>
                        </li>
                    </Link>
                )
            })}
        </ul>
    )
}

export default LeftMenuNavChild