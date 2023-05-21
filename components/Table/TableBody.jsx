import style from 'styles/TableBody.module.scss'

function TableBody({
  styleWrapp,
  children
}) {
  return (
    <div className={style['body']} style={styleWrapp}>
      {children}
    </div>
  )
}

export default TableBody