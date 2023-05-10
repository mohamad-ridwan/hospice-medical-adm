import DatePicker from 'react-datepicker'
import styleInput from 'styles/Input.module.scss'
import "react-datepicker/dist/react-datepicker.css";
import 'react-datepicker/dist/react-datepicker-cssmodules.css';

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
  styleTxtArea,
  onCalendar,
  selected,
  changeCalendar,
  customInput,
  minDate,
  maxDate,
  filterDate
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

      {onCalendar && (
        <DatePicker
          selected={selected}
          minDate={minDate}
          maxDate={maxDate}
          filterDate={filterDate}
          onChange={changeCalendar}
          customInput={customInput}
        />
      )}

      <p className={styleInput['error-message']} style={styleInputErrMsg}>
        {errorMessage}
      </p>
    </>
  )
}

export default Input