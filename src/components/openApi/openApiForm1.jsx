import React, { Component, useState } from 'react'
import { Modal } from 'react-bootstrap'
import { withRouter } from 'react-router-dom'
import { importApi } from '../collections/redux/collectionsActions'
import { connect } from 'react-redux'
import Joi from 'joi-browser'
import { URL_VALIDATION_REGEX } from '../common/constants'
import './openApi.scss'
import { defaultViewTypes } from '../collections/defaultViewModal/defaultViewModal1'

const mapStateToProps = (state) => {
  return {
    collections: state.collections
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    import_api: (openApiObject, importType, website, callback, view) =>
      dispatch(importApi(openApiObject, importType, website, callback, view))
  }
}

const OpenApiForm1 = (props) => {
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState({ type: null, file: null, website: null })
  const [importType, setImportType] = useState('') // You need to manage or pass this state if it's set elsewhere
  const [uploadedFile, setUploadedFile] = useState(null)
  const [selectedFileName, setSelectedFileName] = useState('')
  const [website, setWebsite] = useState('')
  const [updating, setUpdating] = useState(false)
  const [viewLoader, setViewLoader] = useState({})

  const handleChange = (e) => {
    setImportType(e.target.value)
    setErrors({ type: null, file: null, website: null })
  }

  const renderInputType = () => {
    return (
      <div className='form-group'>
        <label>Type: </label>
        <select name='type' className='form-control custom-input' value={importType} onChange={handleChange}>
          <option value=''>Select</option>
          <option value='postman'>Postman</option>
          <option value='openapi'>OpenAPI</option>
        </select>
        {errors.type && <div className='alert alert-danger'>{errors.type}</div>}
      </div>
    )
  }

  const onFileChange = (e) => {
    const file = e.currentTarget.files[0]
    if (file) {
      const formData = new FormData()
      formData.append('myFile', file, file.name)
      setUploadedFile(formData)
      setSelectedFileName(file.name)
      setErrors((prevErrors) => ({ ...prevErrors, file: null }))
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, file: 'Please select a file.' }))
    }
  }

  const renderJSONFileSelector = () => {
    return (
      <React.Fragment>
        <div className='form-group'>
          <div id='select-json-wrapper'>
            <label>Select File</label>
            <span className='customFileChooser'>
              <input type='file' accept={importType === 'openapi' ? '.json, .yaml' : '.json'} onChange={onFileChange} />
              Choose file
            </span>
            {errors?.file && <div className='alert alert-danger'>{errors?.file}</div>}
          </div>
        </div>
        {uploadedFile && <div>{selectedFileName}</div>}
      </React.Fragment>
    )
  }

  const renderImportForm = () => {
    return (
      <form className='mb-2'>
        <div className=''>
          <div>{renderInputType()}</div>
          <div>{renderJSONFileSelector()}</div>
        </div>
      </form>
    )
  }

  const validate = (data, schema) => {
    const options = { abortEarly: false }
    const { error } = Joi.validate(data, schema, options)
    if (!error) return null
    const errors = {}
    for (const item of error.details) errors[item.path[0]] = item.message
    return errors
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    let schema = {
      type: Joi.string().required(),
      website: Joi.string()
        .regex(URL_VALIDATION_REGEX, { name: 'URL' })
        .trim()
        .required()
        .label('Website')
        .error(() => ({ message: 'Website must be a valid URL' }))
    }
    let validationErrors = validate({ type: importType, website }, schema)
    let fileError = uploadedFile ? null : 'JSON file should not be set empty'
    setErrors({ ...validationErrors, file: fileError })
    if (validationErrors || fileError) {
      return
    }
    setStep(1)
  }

  const handleSetViewLoader = (type, flag) => {
    if (flag === 'edit') {
      setUpdating(true)
    } else {
      setViewLoader((prevViewLoader) => ({
        ...prevViewLoader,
        [type]: flag
      }))
    }
  }

  const importApi = (defaultView) => {
    props.import_api(uploadedFile, importType, website, null, defaultView)
    props.onHide()
  }

  const saveCollection = (defaultView, flag) => {
    handleSetViewLoader(defaultView, flag)
    importApi(defaultView)
  }

  const renderButtonGroup = () => {
    return (
      <div className='text-left mt-2'>
        <button
          id='add_collection_import_btn'
          className='btn btn-primary btn-sm fs-4 mr-2'
          onClick={(e) => {
            e.preventDefault()
            handleSubmit(e)
            if ((!errors.type && !errors.website && !errors.file && importType && uploadedFile) || website) {
              saveCollection(defaultViewTypes.TESTING, 'edit')
            }
          }}
        >
          Import
        </button>
      </div>
    )
  }

  const handleCancel = (e) => {
    e.preventDefault()
    props.showOnlyForm ? props.onCancel() : props.onHide()
  }

  const renderInModal = () => {
    return (
      <Modal show={props.show} onHide={props.onHide} id='modal-open-api' size='lg' aria-labelledby='contained-modal-title-vcenter' centered>
        <Modal.Header className='custom-collection-modal-container' closeButton>
          <Modal.Title id='contained-modal-title-vcenter'>Import Collection</Modal.Title>
        </Modal.Header>
        <Modal.Body>{renderForm()}</Modal.Body>
      </Modal>
    )
  }

  const renderForm = () => {
    return (
      <>
        {step === 1 && renderImportForm()}
        {step === 1 ? renderButtonGroup() : handleCancel()}
      </>
    )
  }
  return props.showOnlyForm ? renderForm() : renderInModal()
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(OpenApiForm1))
