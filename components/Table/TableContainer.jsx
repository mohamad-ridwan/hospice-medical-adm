import style from 'styles/TableContainer.module.scss'

function TableContainer({
    children,
    styleWrapp
}) {
  return (
    <div className={style['wrapp']} style={styleWrapp}>
        {children}
    </div>
  )
}

export default TableContainer