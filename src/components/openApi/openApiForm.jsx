import React, { Component } from 'react'
import { Modal } from 'react-bootstrap'
import { withRouter } from 'react-router-dom'
import { importApi } from '../collections/redux/collectionsActions'
import { connect } from 'react-redux'
import Joi from 'joi-browser'
import { URL_VALIDATION_REGEX } from '../common/constants'
import './openApi.scss'
import { defaultViewTypes } from '../collections/defaultViewModal/defaultViewModal'

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

class OpenApiForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openApiObject: {},
      uploadedFile: null,
      importType: '',
      website: '',
      errors: {
        type: null,
        website: null,
        file: null
      },
      step: 1,
      viewLoader: {
        testing: false,
        doc: false
      }
    }
  }

  handleChange(e) {
    let openApiObject = e.currentTarget.value
    try {
      openApiObject = JSON.parse(openApiObject)
      this.setState({ openApiObject })
    } catch (e) {
      this.setState({ openApiObject: {} })
    }
  }

  validate(data, schema) {
    const options = { abortEarly: false }
    const { error } = Joi.validate(data, schema, options)
    if (!error) return null
    const errors = {}
    for (const item of error.details) errors[item.path[0]] = item.message
    return errors
  }

  importApi(defaultView) {
    const uploadedFile = this.state.uploadedFile
    this.props.import_api(uploadedFile, this.state.importType, this.state.website, null, defaultView)
    this.props.onHide()
  }

  handleSubmit(e) {
    e.preventDefault()
    let errors = {}
    let FileError = null
    errors = this.validate({ type: this.state.importType }, { type: Joi.string().required() })
      const schema = {
        type: Joi.string().required(),
        website: Joi.string()
          .regex(URL_VALIDATION_REGEX, { name: 'URL' })
          .trim()
          .required()
          .label('Website')
          .error(() => {
            return { message: 'Website must be a valid URL' }
          })
      }
      errors = this.validate({ type: this.state.importType, website: this.state.website }, schema)
   
    if (this.state.uploadedFile === null) {
      FileError = 'JSON file Should not be set empty'
    }
    this.setState({ errors: { ...errors, file: FileError } })
    if (errors || FileError) return
    this.setState({ step: 1 })
  }

  saveCollection(defaultView, flag) {
    this.setViewLoader(defaultView, flag)
    this.importApi(defaultView)
  }

  onFileChange(e) {
    const selectedFile = e.currentTarget.files[0]
    if (selectedFile) {
      const uploadedFile = new FormData()
      uploadedFile.append('myFile', selectedFile, selectedFile.name)
      this.setState({ uploadedFile, errors: { ...this.state.error, file: null }, selectedFileName: selectedFile.name })
    }
  }

  renderJSONFileSelector() {
    return (
      <React.Fragment>
        <div className='form-group'>
          <div id='select-json-wrapper'>
            <label>Select File</label>
            <span className='customFileChooser'>
              <input type='file' accept={this.state.importType === 'openapi' ? '.json, .yaml' : '.json'} onChange={this.onFileChange.bind(this)}/>
              Choose file
            </span>
            {this.state.errors?.file && <div className='alert alert-danger'>{this.state.errors?.file}</div>}
          </div>
        </div>
        {this.state.uploadedFile && <div>{this.state.selectedFileName}</div>}
      </React.Fragment>
    )
  }

  renderButtonGroup() {
    return (
      <div className='text-left mt-2'>
        <button
          id='add_collection_import_btn'
          className='btn btn-primary btn-sm fs-4 mr-2'
          onClick={(e) => {
            e.preventDefault()
            this.handleSubmit(e)
            const { errors, importType, website, uploadedFile } = this.state
            if ((!errors.type && !errors.website && !errors.file && importType && uploadedFile) || website) {
              this.saveCollection(defaultViewTypes.TESTING, 'edit')
            }
          }}
        >
          Import
        </button>
      </div>
    )
  }

  renderInputType() {
    return (
      <div className='form-group'>
        <label>Type: </label>
        <select
          name='type'
          className='form-control custom-input'
          value={this.state.importType}
          onChange={(e) => {
            this.setState({ importType: e.target.value, website: '', errors: { type: null, file: null, website: null } })
          }}
        >
          <option value=''>Select</option>
          <option value='postman'>Postman</option>
          <option value='openapi'>OpenAPI</option>
        </select>
        {this.state.errors?.type && <div className='alert alert-danger'>{this.state.errors?.type}</div>}
      </div>
    )
  }

  renderWebsiteInput() {
    return (
      <div className='form-group'>
        <label> Website: </label>
        <input
          className='form-control'
          name='website'
          value={this.state.website}
          onChange={(e) => {
            this.setState({ website: e.target.value, errors: { ...this.state.errors, website: null } })
          }}
        />
        {this.state.errors?.website && <div className='alert alert-danger'>{this.state.errors?.website}</div>}
      </div>
    )
  }

  renderImportForm() {
    return (
      <form className='mb-2'>
        <div className=''>
          <div>
            {this.renderInputType()}
          </div>
          <div>{this.renderJSONFileSelector()}</div>
        </div>
      </form>
    )
  }

  setViewLoader(type, flag) {
    if (flag === 'edit') this.setState({ updating: true })
    else {
      const { viewLoader } = this.state
      this.setState({ viewLoader: { ...viewLoader, [type]: flag } })
    }
  }

  renderForm() {
    const { step } = this.state
    return (
      <>
        {step === 1 && this.renderImportForm()}
        {step === 1 ? this.renderButtonGroup() : this.handleCancel()}
      </>
    )
  }

  renderInModal() {
    return (
      <Modal
        show={this.props.show}
        onHide={this.props.onHide}
        id='modal-open-api'
        size='lg'
        aria-labelledby='contained-modal-title-vcenter'
        centered
      >
        <Modal.Header className='custom-collection-modal-container' closeButton>
          <Modal.Title id='contained-modal-title-vcenter'>Import Collection</Modal.Title>
        </Modal.Header>
        <Modal.Body>{this.renderForm()}</Modal.Body>
      </Modal>
    )
  }

  handleCancel(e) {
    e.preventDefault()
    this.props.showOnlyForm ? this.props.onCancel() : this.props.onHide()
  }

  render() {
    return this.props.showOnlyForm ? this.renderForm() : this.renderInModal()
  }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(OpenApiForm))
