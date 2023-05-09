import styleInput from 'styles/Input.module.scss'

function Input({
  type,
  styleTitle,
  title,
  placeholder,
  nameInput,
  valueInput,
  changeInput,
  styleInputText,
  errorMessage,
  styleInputErrMsg,
  styleBtnInput,
  clickInputFile,
  nameBtnInputFile,
  nameInputFile,
  acceptFile,
  idInputFile,
  valueInputFile,
  changeFile,
  readOnly,
  nameTxtArea,
  placeholderTxtArea,
  valueTxtArea,
  changeTxtArea,
  styleTxtArea
}) {
  return (
    <>
      {/* title */}
      <span className={styleInput['title']} style={styleTitle}>
        {title}
      </span>

      {/* input */}
      <input type={type} readOnly={readOnly} className={styleInput['input-card']} placeholder={placeholder} name={nameInput} value={valueInput} onChange={changeInput} style={styleInputText} />

      <button className={`${styleInput['input-card']} ${styleInput['btn-input-file']}`} style={styleBtnInput}
        onClick={clickInputFile}
      >
        {nameBtnInputFile}
        <input name={nameInputFile} accept={acceptFile} type="file" className={styleInput['input-file']} id={idInputFile} value={valueInputFile} onChange={changeFile} />
      </button>

      <textarea name={nameTxtArea} id="" className={styleInput['txt-area']} placeholder={placeholderTxtArea} value={valueTxtArea} onChange={changeTxtArea} style={styleTxtArea}>

      </textarea>

      <p className={styleInput['error-message']} style={styleInputErrMsg}>
        {errorMessage}
      </p>
    </>
  )
}

export default Input