import style from 'styles/TableContainer.module.scss'

function TableContainer({
    children,
    styleWrapp,
    classWrapp
}) {
  return (
    <div className={`${style['wrapp']} ${style[classWrapp]}`} style={styleWrapp}>
        {children}
    </div>
  )
}

export default TableContainer