import React, { Component } from 'react'
import { Modal } from 'react-bootstrap'

class DefaultViewConfirmationModal extends Component {
  handleSave () {
    this.props.set_default_view()
    this.props.onHide()
  }

  render () {
    return (
      <Modal
        onHide={this.props.onHide}
        show={this.props.show}
        animation={false}
        aria-labelledby='contained-modal-title-vcenter'
        centered
      >
        <Modal.Header className='custom-collection-modal-container' closeButton>
          <Modal.Title id='contained-modal-title-vcenter'>
            Do you wish to set it as default view?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body id='custom-delete-modal-body'>
          <div className='text-left mt-4 mb-2'>
            <button
              id='custom-delete-modal-delete'
              className='btn btn-primary btn-lg'
              onClick={() => this.handleSave()}
            >
              Yes
            </button>

            <button
              id='custom-delete-modal-cancel'
              className='btn btn-danger btn-lg ml-2'
              onClick={() => this.props.onHide()}
            >
              No
            </button>
          </div>
        </Modal.Body>
      </Modal>
    )
  }
}

export default DefaultViewConfirmationModal
