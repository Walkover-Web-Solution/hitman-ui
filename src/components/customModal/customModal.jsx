import React from 'react'
import { Modal } from 'react-bootstrap'

export default function CustomModal(props) {
  return (
    <Modal
      show={props.modalShow}
      onHide={() => props?.setModal()}
      size='lg'
      aria-labelledby='contained-modal-title-vcenter'
      centered
    >
      {props.children}
    </Modal>
  )
}
