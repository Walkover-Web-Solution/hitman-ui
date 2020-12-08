import React, { Component } from 'react'
import { Modal } from 'react-bootstrap'

class WarningModal extends Component {
  state = { }
  render () {
    return (
      <Modal
        show={this.props.show}
        onHide={this.props.onHide}
        animation={false}
        aria-labelledby='contained-modal-title-vcenter'
        centered
      >
        <Modal.Header className='' closeButton>
          <Modal.Title id='contained-modal-title-vcenter'>
            {this.props.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body id='custom-warning-modal'>
          <div>
            <p>{this.props.message}</p>
          </div>
          <div className='text-right'>
            <button
              id='warning-modal-ok-button'
              className='btn btn-primary btn-lg mr-2'
              onClick={this.props.onHide}
            >
              OK
            </button>
          </div>
        </Modal.Body>
      </Modal>
    )
  }
}

export default WarningModal
