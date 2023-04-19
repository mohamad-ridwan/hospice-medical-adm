import styleBtnGuide from 'styles/ButtonGuide.module.scss'

function ButtonGuide({
  click
}) {
  return <button className={styleBtnGuide['btn-guide']}
  onClick={click}
  >
    <i className='fa-duotone fa-question'></i>
  </button>
}

export default ButtonGuide