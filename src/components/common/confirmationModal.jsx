import React from 'react'
import { Modal } from 'react-bootstrap'

function ConfirmationModal(props) {
  function handleSave() {
    props.proceed_button_callback()
    props.onHide()
  }
  return (
    <Modal onHide={props.onHide} show={props.show} animation={false} aria-labelledby='contained-modal-title-vcenter' centered>
      <Modal.Header className='custom-collection-modal-container' closeButton>
        <Modal.Title>{props.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body id='custom-delete-modal-body'>
        <div className='text-left mt-4 mb-2'>
          <button id='custom-delete-modal-delete' className='btn btn-primary btn-lg' onClick={() => handleSave()}>
            {props.submitButton || 'Yes'}
          </button>

          <button id='custom-delete-modal-cancel' className='btn btn-danger btn-lg ml-2' onClick={() => props.onHide()}>
            {props.rejectButton || 'No'}
          </button>
        </div>
      </Modal.Body>
    </Modal>
  )
}

export default ConfirmationModal
