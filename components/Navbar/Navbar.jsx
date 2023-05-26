import { useContext, useState, useEffect } from 'react'
import Link from "next/link"
import Cookies from 'js-cookie'
import styleNav from 'styles/Navbar.module.scss'
import Icons from "./Icons"
import WrappMenu from "./DropMenu/WrappMenu"
import Menu from "./DropMenu/Menu"
import { AuthContext } from 'lib/context/auth'
import ShineLoading from 'components/ShineLoading'
import MenuNotif from './DropMenu/MenuNotif'
import useSwr from 'lib/useFetch/useSwr'
import endpoint from 'lib/api/endpoint'
import LoadingNotif from 'components/LoadingNotif/LoadingNotif'
import { NotFoundRedirectCtx } from 'lib/context/notFoundRedirect'

function Navbar() {
    const [onDropMenu, setOnDropMenu] = useState(false)
    const [abbName, setAbbName] = useState('')
    const [totalLoadNotif] = useState([1, 2, 3])

    const { data: dataService, error: errDataService, isLoading: loadDataService } = useSwr(endpoint.getServicingHours())
    const findBookAnAppointment = dataService?.data ? dataService.data.find(data => data.id === 'book-an-appointment') : []
    const userAppointmentData = findBookAnAppointment ? findBookAnAppointment.userAppointmentData : []
    const checkConfirm = userAppointmentData?.length > 0 ? userAppointmentData.filter(data => !data.isConfirm?.id && data.isNotif === false) : []
    const queueData = checkConfirm

    useEffect(() => {
        if (!loadDataService && errDataService) {
            console.log(errDataService)
        }
    }, [loadDataService])

    // context
    const { onNavLeft, handleOnNavLeft, onNotif, setOnNotif } = useContext(NotFoundRedirectCtx)
    const { user } = useContext(AuthContext)

    const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
    ]
    const month = new Date().getMonth() + 1
    const newMonth = month.toString().length === 1 ? `0${month}` : `${month}`
    const date = new Date().getDate().toString().length === 1 ? `0${new Date().getDate()}` : `${new Date().getDate()}`
    const years = new Date().getFullYear()

    useEffect(() => {
        if (user?.id) {
            const findSpaceName = user.name.includes(' ')
            if (findSpaceName) {
                const getFirstCharacter = user.name.substr(0, 1)
                const getTwoCharacter = user.name.split(' ')[1].substr(0, 1)
                const abbreviatedName = getFirstCharacter + getTwoCharacter
                setAbbName(abbreviatedName)
            } else {
                const getFirstCharacter = user.name.substr(0, 1)
                setAbbName(getFirstCharacter)
            }
        }
    }, [user])

    const clickDropMenu = () => {
        if (user?.id) {
            setOnDropMenu(!onDropMenu)
        }
        setOnNotif(false)
    }

    const clickNotif = () => {
        setOnNotif(!onNotif)
        setOnDropMenu(false)
    }

    const handleLogOut = () => {
        Cookies.set('admin-id_hm', '')
        setTimeout(() => {
            window.location.reload()
        }, 100);
    }

    return (
        <>
            <div className={onNavLeft ? `${styleNav['wrapp']} ${styleNav['on-navbar']} ` : `${styleNav['wrapp']}`}>
                <div className={styleNav['left']}>
                    <button className={styleNav['btn-bar']}
                        onClick={handleOnNavLeft}
                    >
                        <i className="fa-solid fa-bars"></i>
                    </button>
                </div>
                <div className={styleNav['right']}>
                    <Icons
                        icon="fa-solid fa-bell"
                        totalNotif={queueData?.length}
                        styleImg={{
                            display: 'none'
                        }}
                        styleWrapp={{
                            height: '35px',
                            width: '35px'
                        }}
                        styleIcon={{
                            display: 'flex'
                        }}
                        styleNumNotif={{
                            display: user?.id && queueData?.length > 0 ? 'flex' : 'none'
                        }}
                        click={clickNotif}
                    >
                        <WrappMenu
                            classWrapp='wrapp-notif'
                            clickWrapp={(e) => e.stopPropagation()}
                            closeOverlay={clickNotif}
                            styleOverlay={{
                                display: onNotif ? 'flex' : 'none',
                                zIndex: '1',
                                cursor: 'default',
                            }}
                            style={{
                                // display: onNotif ? 'flex' : 'none',
                                boxShadow: '0 3px 15px -1px rgba(0,0,0,0.4)',
                                position: 'fixed',
                                height: 'auto',
                                borderRadius: '0',
                                // maxHeight: '500px',
                                overflowY: 'auto',
                                top: '45px',
                                bottom: '0px',
                                cursor: 'default',
                                right: onNotif ? '0' : '-400px',
                                marginTop: '0',
                                zIndex: '9'
                            }}
                            styleConScroll={{
                                padding: '0px'
                            }}
                        >
                            <div className={styleNav['head-notif']} style={{
                                right: onNotif ? '0' : '-400px',
                            }}>
                                <h1 className={styleNav['title']}>
                                    Notification
                                </h1>
                                <button className={styleNav['close-notif']} onClick={clickNotif}>
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            </div>
                            {user?.id && !loadDataService && dataService ? (
                                <>
                                    {queueData?.length > 0 ? queueData.map((user, index) => {
                                        const removeSlash = user.submissionDate.split('/')
                                        const findDate = removeSlash[1]
                                        const findMonth = removeSlash[0]
                                        const findYear = removeSlash[2]
                                        const differenceYears = `${findDate} ${findMonth.length === 1 ? monthNames[Number(findMonth.substr(1)) - 1] : monthNames[Number(findMonth) - 1]} ${findYear}`
                                        const differenceMonth = `${findDate} ${findMonth.length === 1 ? monthNames[Number(findMonth.substr(1)) - 1] : monthNames[Number(findMonth) - 1]}`
                                        const theSameDate = user.clock

                                        const submissionDate = findYear === `${years}` ? findMonth === newMonth ? findDate === date ? theSameDate : differenceMonth : differenceMonth : differenceYears

                                        const jenisPenyakit = user.jenisPenyakit.replace('-', '')
                                        const newJenisPenyakit = jenisPenyakit.replace(/ /gi, '-').toLowerCase()
                                        const emailPatient = user.emailAddress

                                        const pathUrlToDataDetail = `/patient/patient-registration/personal-data/not-yet-confirmed/${newJenisPenyakit}/${emailPatient}/${user.id}`

                                        return (
                                            <Link key={index} href={pathUrlToDataDetail} onClick={clickNotif}>
                                                <MenuNotif
                                                    // appointmentDate={isWeek}
                                                    // timeText={timeText}
                                                    date={submissionDate}
                                                    pasien={user.patientName?.length > 35 ? `${user.patientName.substr(0, 35)}...` : user.patientName}
                                                    // email={user.emailAddress}
                                                    jenisPenyakit={user.jenisPenyakit}
                                                    message={user.message?.length > 110 ? `${user.message.substr(0, 110)}...` : user.message}
                                                    styleEmail={{
                                                        display: 'none'
                                                    }}
                                                    styleTimeText={{
                                                        display: 'none'
                                                    }}
                                                    // styleAppointmentDate={{
                                                    //     color: '#ff296d'
                                                    // }}
                                                    styleCalendar={{
                                                        display: 'none',
                                                    }}
                                                />
                                            </Link>
                                        )
                                    }) : (
                                        <>
                                            <p className={styleNav['no-notif']}>
                                                No notifications at this time
                                            </p>
                                        </>
                                    )}
                                </>
                            ) : (
                                <>
                                    {totalLoadNotif.map((item, index) => (
                                        <LoadingNotif
                                            key={index}
                                            styleWrapp={{
                                                width: 'auto',
                                                margin: '20px 10px'
                                            }}
                                        />
                                    ))}
                                </>
                            )}

                        </WrappMenu>
                    </Icons>
                    {abbName.length > 0 ? (
                        <>
                            <Link href='/profile' className={styleNav['icon-profile-desktop']}>
                                <Icons
                                    nameAdmin={abbName}
                                    urlImg={user?.image}
                                    styleImg={{
                                        borderRadius: '500px'
                                    }}
                                    styleName={{
                                        display: 'none'
                                    }}
                                />
                            </Link>

                            <Icons
                                nameAdmin={abbName}
                                urlImg={user?.image}
                                classWrapp='icon-profile-mobile'
                                styleImg={{
                                    borderRadius: '500px'
                                }}
                                styleName={{
                                    display: 'none'
                                }}
                                click={clickDropMenu}
                            >
                                <WrappMenu style={{
                                    display: onDropMenu ? 'flex' : 'none',
                                    marginTop: '0',
                                    top: '55px',
                                    right: '0px'
                                }}>
                                    <Link href="/profile">
                                        <Menu
                                            name="PROFILE"
                                        />
                                    </Link>
                                    <Menu
                                        click={handleLogOut}
                                        name="LOG OUT"
                                    />
                                </WrappMenu>
                            </Icons>
                        </>
                    ) : (
                        <ShineLoading
                            styleWrapp={{
                                height: '45px',
                                width: '45px',
                                borderRadius: '500px',
                                margin: '0 5px'
                            }}
                        />
                    )}

                    <button className={styleNav['btn-profile']}
                        onClick={clickDropMenu}
                    >
                        <ShineLoading
                            styleWrapp={{
                                height: '15px',
                                width: '90px',
                                position: 'absolute',
                                opacity: user?.id ? '0' : '1',
                                borderRadius: '500px'
                            }}
                        />
                        <span className={styleNav['name-admin']}>{user?.name?.length > 15 ? `${user.name.substr(0, 15)}...` : user?.name}</span> <i className="fa-solid fa-sort-down"></i>
                        <WrappMenu style={{
                            display: onDropMenu ? 'flex' : 'none',
                            marginTop: '0',
                            top: '55px'
                        }}>
                            <Link href="/profile">
                                <Menu
                                    name="PROFILE"
                                />
                            </Link>
                            <Menu
                                click={handleLogOut}
                                name="LOG OUT"
                            />
                        </WrappMenu>
                    </button>
                </div>
            </div>
        </>
    )
}

export default Navbar