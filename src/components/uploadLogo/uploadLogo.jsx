import React, { Component } from 'react'
import { Modal } from 'react-bootstrap'
// import { withRouter } from 'react-router-dom'
// import { uploadLogoApi } from './uploadLogoApiService'
// import { importApi } from '../collections/redux/collectionsActions'
// import { connect } from 'react-redux'
// import Joi from 'joi-browser'
import '../openApi/openApi.scss'

// const mapStateToProps = (state) => {
//   return {}
// }

// const mapDispatchToProps = (dispatch) => {
//   return {
//     upload_logo_api: (openApiObject, importType, website) => dispatch(uploadLogoApi(openApiObject, importType, website))
//   }
// }

class UploadLogo extends Component {
  constructor (props) {
    super(props)
    this.state = {
      uploadedFile: null,
      errors: {
        file: null
      }
    }
  }

  handleSubmit () {
    const errors = {}
    let FileError = null
    if (this.state.uploadedFile === null) {
      FileError = 'File should not be set empty'
    } else if (this.state.uploadedFile.size > 1000) { FileError = 'File size should not more than 1MB' }
    this.setState({ errors: { ...errors, file: FileError } })
    // if (errors || FileError) return
    // this.importApi()
  }

  handleReaderLoaded =(readerEvt) => {
    const binaryString = readerEvt.target.result
    this.setState({
      base64String: btoa(binaryString)
    })
  }

  onFileChange (e) {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      const reader = new FileReader()
      reader.onload = this.handleReaderLoaded.bind(this)
      reader.readAsBinaryString(selectedFile)
    }
    if (selectedFile) {
      // const uploadedFile = new FormData()
      // uploadedFile.append('myFile', selectedFile, selectedFile.name)
      this.setState({ uploadedFile: selectedFile, errors: { ...this.state.error, file: null } })
    } else {
      this.setState({ uploadedFile: null, errors: { ...this.state.error, file: null } })
    }
  }

  render () {
    return (
      <Modal
        show={this.props.show}
        onHide={this.props.onHide}
        id='modal-open-api'
        size='lg'
        animation={false}
        aria-labelledby='contained-modal-title-vcenter'
        centered
      >
        <Modal.Header className='custom-collection-modal-container' closeButton>
          <Modal.Title id='contained-modal-title-vcenter'>
            Upload Logo
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className='row'>
              <div className='col-6'>
                <div className='form-group'>
                  <div id='select-json-wrapper'>
                    <label>Select File</label>
                    <span className='customFileChooser'>
                      <input type='file' accept='.svg, .png, .ico' onChange={this.onFileChange.bind(this)} />
                      Choose file
                    </span>
                    {this.state.errors?.file && <div className='alert alert-danger'>{this.state.errors?.file}</div>}
                  </div>
                </div>
                {this.state.uploadedFile && <div>{this.state.uploadedFile.name}</div>}
              </div>
            </div>
            {this.state.base64String && <div>
              <img src={`data:${this.state.uploadedFile.type};base64,${this.state.base64String}`} height='60' width='60' />
              {/* {console.log(`data:${this.state.uploadedFile.type};base64,${this.state.base64String}`)} */}
                                        </div>}
            <div className='text-right mt-4'>
              <button
                type='button'
                className='btn btn-secondary outline btn-lg'
                onClick={this.props.onHide}
              >
                Cancel
              </button>
              <button
                className='btn btn-primary btn-lg ml-2'
                type='button'
                onClick={() => this.handleSubmit()}
              >
                Upload{' '}
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    )
  }
}

export default UploadLogo
