import React, { Component } from 'react'
import { Modal } from 'react-bootstrap'

export class CookiesModal extends Component {
  renderCookiesModal () {
    return (
      <Modal
        {...this.props}
        size='lg'
        aria-labelledby='contained-modal-title-vcenter'
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id='contained-modal-title-vcenter'>
            Manage Cookies
          </Modal.Title>
        </Modal.Header>
        <Modal.Body />
        <Modal.Footer>
          <button onClick={this.props.onHide}>Close</button>
        </Modal.Footer>
      </Modal>
    )
  }

  render () {
    return (
      <div>
        {this.renderCookiesModal()}
      </div>
    )
  }
}

export default CookiesModal
