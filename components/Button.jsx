import styleBtn from 'styles/Button.module.scss'

function Button({
    name,
    click,
    style,
    classBtn
}) {
  return <button className={classBtn ? `${styleBtn['btn-card']} ${styleBtn[classBtn]}` : styleBtn['btn-card']} onClick={click} style={style}>
    {name}
  </button>
}

export default Button