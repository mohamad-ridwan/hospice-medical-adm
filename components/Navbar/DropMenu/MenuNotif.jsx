import style from 'styles/MenuNotif.module.scss'

function MenuNotif({
    appointmentDate,
    styleTimeText,
    timeText,
    date,
    pasien,
    email,
    jenisPenyakit,
    message,
    styleAppointmentDate,
    styleCalendar,
    styleEmail,
    click
}) {
    return (
        <li className={style['wrapp']} onClick={click}>
            <div className={style['container-date']}>
                <span className={`${style['date']} ${style['appointment']}`}>
                    <p className={style['title']} style={styleAppointmentDate}><i className="fa-solid fa-calendar-days" style={styleCalendar}></i>{appointmentDate}</p>
                </span>
                <span className={`${style['date']} ${style['clock']}`}>
                    <p style={styleTimeText}>{timeText}</p>
                    {date}
                    <i className="fa-solid fa-clock"></i>
                </span>
            </div>

            <h6 className={style['jenis-penyakit']}>{jenisPenyakit}</h6>
            <span className={style['email']}>Patient: {pasien}</span>
            <span className={style['email']} style={styleEmail}>email : {email}</span>
            <p className={style['message']}>Message: {message}</p>
        </li>
    )
}

export default MenuNotif