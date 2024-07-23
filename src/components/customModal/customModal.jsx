import React from 'react'
import { Modal } from 'react-bootstrap'

export default function CustomModal(props) {
  return (
    <Modal animation={props?.animation} show={props.modalShow} onHide={() => props?.hideModal()} size={props?.size} aria-labelledby='contained-modal-title-vcenter' centered>
      {props.children}
    </Modal>
  )
}
