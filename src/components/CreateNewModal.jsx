import React, { Component } from "react";
import { ListGroup, Modal } from "react-bootstrap";

class CreateNewModal extends Component {
  state = {};
  render() {
    return (
      <Modal
        {...this.props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header>Create New</Modal.Header>
        <Modal.Body>Endpoint Collection Environment</Modal.Body>
      </Modal>
    );
  }
}

export default CreateNewModal;
