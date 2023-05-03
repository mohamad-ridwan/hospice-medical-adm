import dropMenu from 'styles/DropMenu.module.scss'
import styleNavLeft from 'styles/NavLeftMobile.module.scss'

function WrappMenu({
  children,
  style,
  classWrapp,
  styleOverlay,
  styleConScroll,
  clickWrapp,
  closeOverlay
}) {
  return (
    <>
    
      <div className={`${dropMenu['wrapp']} ${dropMenu[classWrapp]}`} style={style}
      onClick={clickWrapp}
      >
        <div className={dropMenu['container-scroll']} style={styleConScroll}>
          {children}
        </div>
      </div>
      <div className={dropMenu['overlay']} style={styleOverlay} onClick={closeOverlay}></div>
    </>
  )
}

export default WrappMenu