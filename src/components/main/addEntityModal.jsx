import React, { Component } from 'react'
import { Modal } from 'react-bootstrap'
import './addEntity/addEntity.scss'

class AddEntitySelectionModal extends Component {
  state = {}
  render () {
    return (
      <Modal
        show={this.props.show}
        onHide={this.props.onHide}
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
          <div className='body'>
            <div className='col'>
              <div className='row' onClick={() => this.props.openAddEntityModal('version')}>
                Version
              </div>
              <div className='row' onClick={() => this.props.openAddEntityModal('group')}>
                Group
              </div>
            </div>
            <div className='col'>
              <div className='row' onClick={() => this.props.openAddEntityModal('endpoint')}>
                Endpoint
              </div>
              <div className='row' onClick={() => this.props.openAddEntityModal('page')}>
                Page
              </div>
            </div>

          </div>
        </Modal.Body>
      </Modal>
    )
  }
}

export default AddEntitySelectionModal
