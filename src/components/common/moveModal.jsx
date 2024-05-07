import React from 'react'
import { Modal } from 'react-bootstrap'
import { connect } from 'react-redux'
import { closeTab } from '../tabs/redux/tabsActions'
import { onEnter } from './utility'
import tabService from '../tabs/tabService'

const MoveModal = (props) => {
  return (
    <Modal
    animation={false}
    aria-labelledby='contained-modal-title-vcenter'
    centered
    //   onHide={this.props.onHide}
    show={true}
    >
      <Modal.Header className='custom-collection-modal-container' closeButton>
        <Modal.Title id='contained-modal-title-vcenter'>{props.title}</Modal.Title>
      </Modal.Header>

      <Modal.Body id='custom-delete-modal-body'></Modal.Body>
    </Modal>
  )
}

export default MoveModal
