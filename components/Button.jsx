import styleBtn from 'styles/Button.module.scss'

function Button({
  name,
  children,
  click,
  style,
  classBtn,
  icon,
  styleIcon,
  styleLoading,
  styleLoadCircle
}) {
  return <button className={classBtn ? `${styleBtn['btn-card']} ${styleBtn[classBtn]}` : styleBtn['btn-card']} onClick={click} style={style}>
    {name}
    {children}
    <i className={icon} style={styleIcon}></i>

    <div className={styleBtn['loading-btn']} style={styleLoading}>
      <div className={styleBtn['loading-circle']} style={styleLoadCircle}></div>
    </div>
  </button>
}

export default Button