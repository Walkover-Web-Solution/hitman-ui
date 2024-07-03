import React, { useEffect, useRef, useState } from 'react'
import AceEditor from 'react-ace'
import Input from './input'
import { handleChangeInUrlField, handleBlurInUrlField } from '../common/utility'
import 'ace-builds'
import 'ace-builds/src-noconflict/mode-json'

const Form = ({ children, doSubmit }) => {

  const [data, setData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSaveDisabled, setIsSavedDisabled] = useState(true);
  const inputRef = useRef()

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],

      [({ list: 'ordered' }, { list: 'bullet' })],
      ['link']
    ]
  }

  const formats = ['header', 'bold', 'italic', 'underline', 'strike', 'color', 'background', 'list', 'bullet', 'link']

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [])

  const validate = () => {
    return null
  }

  const trimmedData = () => {
    const trimmedData = {}
    Object.keys(data).forEach((key) => {
      if (typeof data[key] === 'string') {
        trimmedData[key] = data[key]?.trim()
      } else {
        trimmedData[key] = data[key]
      }
    })
    setData(trimmedData);
    return trimmedData;
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    handleKeyPress()
  }

  const handleKeyPress = () => {
    const errors = validate()
    setErrors(errors || {})
    if (errors) return
    doSubmit()
  }

  const handleChange = (e, isURLInput = false) => {
    const tempData = { ...data };
    tempData[e.currentTarget.name] = e.currentTarget.value
    if (isURLInput) {
      tempData[e.currentTarget.name] = handleChangeInUrlField(tempData[e.currentTarget.name])
    }
    setData(tempData)
    setErrors({})
  }

  const handleBlur = (e, isURLInput = false) => {
    const tempData = data;
    if (isURLInput) {
      tempData[e.currentTarget.name] = handleBlurInUrlField(tempData[e.currentTarget.name])
    }
    setData(tempData)
    setErrors({})
  }

  const getSaveDisableStatus = (notdefined, active) => {
    let saveDisabled = isSaveDisabled
    if (saveDisabled === notdefined || saveDisabled === active) {
      saveDisabled = true
    } else {
      saveDisabled = false
    }
    return saveDisabled
  }

  const handleEditorChange = (value, editor) => {
    const tempData = data;
    const description = value
    const saveDisabled = getSaveDisableStatus(undefined, null)
    const length = editor.getText().trim().length
    tempData.description = description
    setData({ ...tempData });
    setIsSavedDisabled(saveDisabled)
  }

  const handleAceEditorChange = (value) => {
    const tempData = { ...data }
    tempData.body = value
    setData(tempData)
  }

  const renderInput = (name, urlName, label, placeholder, mandatory = false, isURLInput = false, note = '') => {
    return (
      <Input
        ref={inputRef}
        name={name}
        urlName={urlName}
        label={label}
        value={data[name]}
        onChange={(e) => handleChange(e, isURLInput)}
        onBlur={(e) => handleBlur(e, isURLInput)}
        error={errors?.[name]}
        placeholder={placeholder}
        disabled={data.disabled}
        mandatory={mandatory}
        note={note}
      />
    )
  }

  const renderTextArea = (name, label, placeholder) => {

    return (
      <div className='form-group '>
        <label htmlFor={name} className='custom-input-label'>
          {label}
        </label>
        <textarea
          className='form-control custom-input'
          rows='10'
          onChange={handleChange}
          id={name}
          error={errors[name]}
          name={name}
          value={data[name]}
          placeholder={placeholder}
        />
      </div>
    )
  }

  const renderButton = (label, style) => {
    return (
      <button className='btn btn-primary btn-sm fs-4' id='add_collection_create_new_btn'>
        {label}
      </button>
    )
  }

  const renderAceEditor = (name, label) => {
    return (
      <div className='form-group '>
        <label htmlFor={name} className='custom-input-label'>
          {label}
        </label>
        <AceEditor
          style={{ border: '1px solid rgb(206 213 218)' }}
          className='custom-raw-editor'
          mode='json'
          theme='github'
          value={data.body}
          onChange={handleAceEditorChange}
          setOptions={{
            showLineNumbers: true
          }}
          editorProps={{
            $blockScrolling: false
          }}
          onLoad={(editor) => {
            editor.focus()
            editor.getSession().setUseWrapMode(true)
            editor.setShowPrintMargin(false)
          }}
        />
        <small className='muted-text'>*Body should not exceed more than 2000 characters.</small>
        {errors[name] && <div className='alert alert-danger'>{errors[name]}</div>}
      </div>
    )
  }

  return children({
    renderInput,
    renderTextArea,
    renderAceEditor,
    renderButton,
    handleSubmit
  });
}

export default Form
