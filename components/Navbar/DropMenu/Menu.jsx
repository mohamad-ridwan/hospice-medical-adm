import dropMenu from 'styles/DropMenu.module.scss'

function Menu({
    name,
    click
}) {
  return <li className={dropMenu['menu']} onClick={click}>
    {name}
  </li>
}

export default Menu