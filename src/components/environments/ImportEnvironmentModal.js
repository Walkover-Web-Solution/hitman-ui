import React from "react"
import { Modal } from "react-bootstrap"
import DragAndDropUploader from "./DragAndDropUploader"

const ImportEnvironmentModal = ({ show, onClose }) => {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Import Environment</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <DragAndDropUploader onClose={onClose} />
      </Modal.Body>
    </Modal>
  )
}

export default ImportEnvironmentModal
