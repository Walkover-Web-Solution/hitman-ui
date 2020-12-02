import React, { Component } from 'react'
import { Modal } from 'react-bootstrap'
import tabService from './tabService'

class SavePromptModal extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  handleSave () {
    this.props.onHide()
    this.props.handle_save_endpoint(true, this.props.tab_id)
  }

  handleDontSave () {
    this.props.onHide()
    tabService.removeTab(this.props.tab_id, { ...this.props })
  }

  render () {
    return (
      <Modal
        {...this.props}
        animation={false}
        aria-labelledby='contained-modal-title-vcenter'
        centered
      >
        <Modal.Header className='custom-collection-modal-container' closeButton>
          <Modal.Title id='contained-modal-title-vcenter'>
            DO YOU WANT TO SAVE?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body id='custom-delete-modal-body'>
          <div>
            <p> This tab has unsaved changes which will be lost if you choose to
              close it. Save these changes to avoid losing your work.
            </p>
          </div>
          <div className='text-right mt-4 mb-2'>
            <button
              id='custom-delete-modal-cancel'
              className='btn btn-danger btn-lg'
              onClick={() => this.handleDontSave()}
            >
              Don't Save
            </button>
            <button
              id='custom-delete-modal-delete'
              className='btn btn-primary btn-lg mr-2 ml-2'
              onClick={() => this.handleSave()}
            >
              Save
            </button>
            <button
              id='custom-delete-modal-cancel'
              className='btn btn-secondary btn-lg'
              onClick={this.props.onHide}
            >
              Cancel
            </button>
          </div>
        </Modal.Body>

      </Modal>
    )
  }
}

export default SavePromptModal
