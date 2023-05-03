import style from 'styles/TableBody.module.scss'

function TableBody({
    children
}) {
  return (
    <div className={style['body']}>
        {children}
    </div>
  )
}

export default TableBody