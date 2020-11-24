import React, { Component } from 'react'
import Input from './input'
import Joi from 'joi-browser'
import AceEditor from 'react-ace'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import 'ace-builds'
import 'ace-builds/src-noconflict/mode-json'

class Form extends Component {
  constructor (props) {
    super(props)
    this.state = {
      data: {},
      errors: {}
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
    const { error } = Joi.validate(this.state.data, this.schema, options)
    if (!error) return null
    const errors = {}
    for (const item of error.details) errors[item.path[0]] = item.message
    return errors
  };

  handleSubmit = (e) => {
    e.preventDefault()
    const errors = this.validate()
    this.setState({ errors: errors || {} })
    if (errors) return
    this.doSubmit()
  };

  handleChange = (e) => {
    const data = { ...this.state.data }
    data[e.currentTarget.name] = e.currentTarget.value
    this.setState({ data })
  };

  handleEditorChange (value) {
    const data = this.state.data
    const description = value
    data.description = description
    this.setState({ data })
  };

  handleAceEditorChange = (value) => {
    const data = { ...this.state.data }
    data.body = value
    this.setState({ data })
  };

  renderInput (name, label, placeholder) {
    const { data, errors } = this.state
    return (
      <Input
        name={name}
        label={label}
        value={data[name]}
        onChange={this.handleChange}
        error={errors[name]}
        placeholder={placeholder}
        disabled={data.disabled}
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
          onChange={this.handleEditorChange}
        />
      </div>
    )
  }

  renderButton (label, style) {
    return (
      <button
        className='btn btn-default custom-button'
        style={{ float: style, borderRadius: '12px' }}
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
