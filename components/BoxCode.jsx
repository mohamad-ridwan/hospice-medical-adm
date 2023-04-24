import styleBoxCode from 'styles/BoxCode.module.scss'

function BoxCode({
    clickInput,
    id,
    name,
    value,
    changeInput,
    styleInput
}) {
    return (
        <div className={styleBoxCode['box-code']} onClick={clickInput} id={id}>
            <input className={styleBoxCode['input']} type="text" name={name} value={value} maxLength={1} onChange={changeInput} style={styleInput} />
        </div>
    )
}

export default BoxCode