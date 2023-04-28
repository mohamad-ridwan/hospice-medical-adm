import style from 'styles/ShineLoading.module.scss'

function ShineLoading({
    styleWrapp
}) {
  return (
    <div className={style['wrapp']} style={styleWrapp}></div>
  )
}

export default ShineLoading