import { useContext, useState, useEffect } from 'react'
import Link from 'next/link'
import style from 'styles/NavLeft.module.scss'
import MenuNavLeft from './MenuNavLeft'
import logoweb from 'images/logoweb.jpg'
import Image from 'next/image'
import { NotFoundRedirectCtx } from 'lib/context/notFoundRedirect'
import { AuthContext } from 'lib/context/auth'
import ShineLoading from 'components/ShineLoading'

function NavLeft() {
    const [menu, setMenu] = useState([
        {
            name: 'Dashboard',
            path: '/',
            icon: 'fa-solid fa-bars-progress'
        },
        {
            name: 'Upload Article',
            path: '/upload-article',
            icon: 'fa-solid fa-sitemap'
        },
        {
            name: 'Patient',
            path: null,
            icon: 'fa-solid fa-bed-pulse',
            children: [
                {
                    name: 'Patient Registration',
                    path: '/patient/patient-registration',
                    icon: 'fa-solid fa-hospital-user',
                },
                {
                    name: 'Finished Treatment',
                    path: '/patient/finished-treatment',
                    icon: 'fa-solid fa-chart-line',
                }
            ]
        },
        {
            name: 'Blog',
            path: null,
            icon: 'fa-solid fa-newspaper',
            children: [
                {
                    name: 'Edit Blog',
                    path: '/edit-article',
                    icon: 'fa-solid fa-file-pen'
                }
            ]
        }
    ])
    const [onListMenu, setOnListMenu] = useState([])
    const [totalLoadListMenu] = useState([1, 2, 3, 4, 5, 6])
    const [onMenuChild, setOnMenuChild] = useState(null)
    const [heightMenuChild, setHeightMenuChild] = useState('42px')

    const { user, loadingAuth } = useContext(AuthContext)
    const { onNavLeft, handleOnNavLeft, onNotif, setOnNotif } = useContext(NotFoundRedirectCtx)

    const handleOnListMenu = () => {
        if (onNavLeft) {
            const offChildMenu = menu.filter(item => !item?.children)
            setOnListMenu(offChildMenu)
        } else {
            setTimeout(() => {
                setOnListMenu(menu)
            }, 150)
        }
    }

    useEffect(() => {
        handleOnListMenu()
    }, [onNavLeft])

    const propsStyleOnNav = {
        opacity: onNavLeft ? '0' : '1',
        transition: onNavLeft ? '0s' : '0.2s ease',
        transitionDelay: onNavLeft ? '0ms' : '200ms',
    }

    const handleOnMenuChild = (index)=>{
        const wrappMenuChild = document.getElementById(`menuNavChild${index}`)
        if(wrappMenuChild && index === onMenuChild){
            if(onMenuChild){
                setOnMenuChild(null)
                setHeightMenuChild('43px')
            }else{
                setOnMenuChild(index)
                setHeightMenuChild(`${wrappMenuChild.getBoundingClientRect().height + 53}px`)
            }
        }else{
            setOnMenuChild(index)
            setHeightMenuChild(`${wrappMenuChild.getBoundingClientRect().height + 53}px`)
        }
    }

    return (
        <div className={style['wrapp']} style={{
            width: onNavLeft ? '70px' : '250px',
            zIndex: onNotif ? '1' : '999'
        }}>
            <div className={style['logo-web']}>
                <Link href='/' style={{
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    {user?.id ? (
                        <Image
                            src={logoweb}
                            alt='admin hospice medical'
                            height={30}
                            width={30}
                        />
                    ) : (
                        <ShineLoading
                            styleWrapp={{
                                height: '30px',
                                width: '30px',
                                borderRadius: '500px',
                                margin: '0'
                            }}
                        />
                    )}

                    <h1 className={style['title']} style={{
                        opacity: onNavLeft ? '0' : '1',
                        transition: onNavLeft ? '0s' : '0.2s ease',
                        transitionDelay: onNavLeft ? '0ms' : '200ms',
                        whiteSpace: onNavLeft ? 'nowrap' : 'normal'
                    }}>
                        Admin HM
                    </h1>
                </Link>
            </div>
            <div className={style['container-scroll']}>
                <ul className={style['scroll']}>
                    {user?.id && onListMenu?.length > 0 ? onListMenu.map((item, index) => {
                        return (
                            <MenuNavLeft
                                key={index}
                                data={item}
                                index={index}
                                name={item.name}
                                idMenuChild='menuNavChild'
                                iconDropChild={onMenuChild === index ? 'fa-solid fa-angle-up' : 'fa-solid fa-angle-down'}
                                icon={item.icon}
                                styleNameMenu={{
                                    opacity: onNavLeft ? '0' : '1',
                                    transition: onNavLeft ? '0s' : '0.2s ease',
                                    transitionDelay: onNavLeft ? '0ms' : '200ms',
                                    whiteSpace: onNavLeft ? 'nowrap' : 'normal'
                                }}
                                styleIconMenuChild={propsStyleOnNav}
                                styleMenuChild={{
                                    maxHeight: onMenuChild === index ? heightMenuChild : '43px'
                                }}
                                handleOnMenuChild={()=>handleOnMenuChild(index)}
                            />
                        )
                    }) : (
                        <>
                            {totalLoadListMenu.map((item, index) => (
                                <ShineLoading
                                    key={index}
                                    styleWrapp={{
                                        height: '12px',
                                        width: 'auto',
                                        borderRadius: '500px',
                                        margin: '17px 20px'
                                    }}
                                />
                            ))}
                        </>
                    )}
                </ul>
            </div>
            <div className={style['copy-right']} style={{
                display: onNavLeft ? 'none' : 'flex',
            }}>
                <h1 className={style['title']}>Created by</h1>
                <span className={style['name-created']}>Q&Q_Espy™</span>
            </div>
            <button className={style['btn-on-nav']}
                onClick={handleOnNavLeft}
            >
                {onNavLeft ? (
                    <i className="fa-solid fa-angle-right"></i>
                ) : (
                    <i className="fa-solid fa-angle-left"></i>
                )}
            </button>
        </div>
    )
}

export default NavLeft