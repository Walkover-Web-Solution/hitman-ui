import React, { Component } from 'react'
import Input from './input'
import Joi from 'joi-browser'
import AceEditor from 'react-ace'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import 'ace-builds'
import 'ace-builds/src-noconflict/mode-json'
import { handleChangeInUrlField, handleBlurInUrlField } from '../common/utility'

class Form extends Component {
  constructor (props) {
    super(props)
    this.state = {
      data: {},
      errors: {},
      isSaveDisabled: true
    }

    this.modules = {
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],

        [({ list: 'ordered' }, { list: 'bullet' })],
        ['link']
      ]
    }

    this.formats = [
      'header',
      'bold',
      'italic',
      'underline',
      'strike',
      'color',
      'background',
      'list',
      'bullet',
      'link'
    ]
  }

  validate () {
    const options = { abortEarly: false }
    const { error } = Joi.validate(this.trimmedData(), this.schema, options)
    if (!error) return null
    const errors = {}
    for (const item of error.details) {
      if (!errors[item.path[0]]) { errors[item.path[0]] = item.message }
    }
    return errors
  };

  trimmedData () {
    const trimmedData = {}
    Object.keys(this.state.data).forEach(key => {
      if (typeof (this.state.data[key]) === 'string') { trimmedData[key] = this.state.data[key]?.trim() } else { trimmedData[key] = this.state.data[key] }
    })
    this.setState({ data: trimmedData })
    return trimmedData
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.handleKeyPress()
  };

  handleKeyPress () {
    const errors = this.validate()
    this.setState({ errors: errors || {} })
    if (errors) return
    this.doSubmit()
  }

  handleChange = (e, isURLInput = false) => {
    const data = { ...this.state.data }
    data[e.currentTarget.name] = e.currentTarget.value
    if (isURLInput) {
      data[e.currentTarget.name] = handleChangeInUrlField(data[e.currentTarget.name])
    }
    this.setState({ errors: {}, data })
  }

  handleBlur = (e, isURLInput = false) => {
    const data = { ...this.state.data }
    if (isURLInput) {
      data[e.currentTarget.name] = handleBlurInUrlField(data[e.currentTarget.name])
    }
    this.setState({ errors: {}, data })
  }

  getSaveDisableStatus (notdefined, active) {
    let isSaveDisabled = this.state.isSaveDisabled
    if (isSaveDisabled === notdefined || isSaveDisabled === active) {
      isSaveDisabled = true
    } else {
      isSaveDisabled = false
    }
    return isSaveDisabled
  }

  handleEditorChange = (value, editor) => {
    const data = this.state.data
    const description = value
    const isSaveDisabled = this.getSaveDisableStatus(undefined, null)
    const length = editor.getText().trim().length
    data.description = description
    this.setState({ data, length, isSaveDisabled })
  };

  handleAceEditorChange = (value) => {
    const data = { ...this.state.data }
    data.body = value
    this.setState({ data })
  };

  renderInput (name, label, placeholder, mandatory = false, firstLetterCapitalize = false, isURLInput = false) {
    const { data, errors } = this.state
    return (
      <Input
        name={name}
        label={label}
        value={(isURLInput && !data[name]) ? 'https://' : data[name]}
        onChange={(e) => this.handleChange(e, isURLInput)}
        onBlur={(e) => this.handleBlur(e, isURLInput)}
        error={errors[name]}
        placeholder={placeholder}
        disabled={data.disabled}
        mandatory={mandatory}
        firstLetterCapitalize={firstLetterCapitalize}
      />
    )
  }

  renderTextArea (name, label, placeholder) {
    const { data, errors } = this.state
    return (
      <div className='form-group '>
        <label htmlFor={name} className='custom-input-label'>
          {label}
        </label>
        <textarea
          className='form-control custom-input'
          rows='10'
          onChange={this.handleChange}
          id={name}
          error={errors[name]}
          name={name}
          value={data[name]}
          placeholder={placeholder}
        />
      </div>
    )
  }

  renderQuillEditor (name, label) {
    const { data } = this.state

    return (
      <div className='form-group '>
        <label htmlFor={name} className='custom-input-label'>
          {label}
        </label>
        <ReactQuill
          value={data.description}
          modules={this.modules}
          formats={this.formats}
          onChange={(content, delta, source, editor) => { this.handleEditorChange(content, editor) }}
        />
      </div>
    )
  }

  renderButton (label, style) {
    return (
      <button
        className='btn btn-primary btn-lg'
        id='add_collection_create_new_btn'
      >
        {label}
      </button>
    )
  }

  renderAceEditor (name, label) {
    const { data, errors } = this.state

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
          onChange={this.handleAceEditorChange}
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
        {errors[name] && (
          <div className='alert alert-danger'>{errors[name]}</div>
        )}
      </div>
    )
  }
}

export default Form
