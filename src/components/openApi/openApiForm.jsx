import React, { Component } from 'react'
import { Modal } from 'react-bootstrap'
import { withRouter } from 'react-router-dom'
import { importApi } from '../collections/redux/collectionsActions'
import { connect } from 'react-redux'
import './openApi.scss'

const mapStateToProps = (state) => {
  return {}
}

const mapDispatchToProps = (dispatch) => {
  return {
    import_api: (openApiObject) => dispatch(importApi(openApiObject))
  }
}

class OpenApiForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      openApiObject: {},
      uploadedFile: null
    }
  }

  handleChange (e) {
    let openApiObject = e.currentTarget.value
    try {
      openApiObject = JSON.parse(openApiObject)
      this.setState({ openApiObject })
    } catch (e) {
      this.setState({ openApiObject: {} })
    }
  }

  importApi () {
    const uploadedFile = this.state.uploadedFile
    this.props.import_api(uploadedFile)
    this.props.onHide()
  }

  onFileChange (e) {
    const selectedFile = e.currentTarget.files[0]
    const uploadedFile = new FormData()
    uploadedFile.append('myFile', selectedFile, selectedFile.name)
    this.setState({ uploadedFile })
  }

  render () {
    return (
      <Modal
        {...this.props}
        id='modal-open-api'
        size='lg'
        animation={false}
        aria-labelledby='contained-modal-title-vcenter'
        centered
      >
        <Modal.Header className='custom-collection-modal-container' closeButton>
          <Modal.Title id='contained-modal-title-vcenter'>
            {this.props.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div id='select-json-wrapper'>
              <label>
                Select JSON File
                {/* <textarea
            onChange={this.handleChange.bind(this)}
            rows="20"
            cols="50"
            ></textarea> */}
              </label>
              <br />
              <input type='file' onChange={this.onFileChange.bind(this)} />
            </div>

            <div className='button-group'>
              <button
                type='button'
                className='btn cancel-button'
                onClick={this.props.onHide}
              >
                Cancel
              </button>
              <button
                className='btn import-button'
                type='button'
                onClick={() => this.importApi()}
              >
                Import{' '}
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    )
  }
}
export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(OpenApiForm)
)
