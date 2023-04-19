import { useEffect, useState } from 'react'
import styleInputUpload from 'styles/InputUpload.module.scss'

function InputUpload({
    label,
    title,
    rows,
    cols,
    styleWrapp,
    value,
    handleChange,
    handleChangeImg,
    nameInputImg,
    styleInputImg,
    styleTextArea,
    valueInputImg,
    styleParagraph,
    handleEnterSpace,
    idInput
}) {
    const [newValue, setNewValue] = useState({
        label: '',
        value: ''
    })

    useEffect(()=>{
        setNewValue({
            label: label,
            value: value
        })
    }, [label, value])

    const RenderHTML = ({ text, styleParagraph }) => {
        return <p dangerouslySetInnerHTML={{ __html: text }} className={styleInputUpload['text-body-article']} style={styleParagraph}></p>
    }

    return (
        <>
            <div className={styleInputUpload['input-upload-card']} style={styleWrapp}>
                <RenderHTML
                    text={newValue.label === 'title' ? `<h2 class=${styleInputUpload['title-article']}>${value}</h2>` : newValue.label === 'paragraphHighlight' && newValue.value.length > 0 ? `<div class=${styleInputUpload['highlight-paragraph']}><p>"${newValue.value}"</p></div>` : newValue.value}
                    styleParagraph={styleParagraph}
                />
                <label htmlFor={label}>
                    <div className={styleInputUpload['title-input']}>
                        <span id={label}>{title}</span>

                        <input type="file" id={idInput} accept="image/png, image/jpeg" name={nameInputImg} value={valueInputImg} onChange={handleChangeImg} style={styleInputImg}/>
                    </div>
                    <textarea name={label} id={`${newValue.label}InputTxt`} value={value} cols={cols} rows={rows} onChange={handleChange} style={styleTextArea} onKeyUp={handleEnterSpace}>

                    </textarea>
                </label>
            </div>
        </>
    )
}

export default InputUpload