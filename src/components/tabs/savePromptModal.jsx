import React, { Component } from "react";
import { Modal } from "react-bootstrap";
import tabService from "./tabService";

class SavePromptModal extends Component {
  state = {};

  handleSave() {
    this.props.onHide();
    this.props.handle_save_endpoint(true);
  }

  handleDontSave() {
    this.props.onHide();
    tabService.removeTab(this.props.tab_id, { ...this.props });
  }

  render() {
    return (
      <Modal
        {...this.props}
        animation={false}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header className="custom-collection-modal-container" closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            DO YOU WANT TO SAVE?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body id="custom-delete-modal-body">
          <div>
            This tab has unsaved changes which will be lost if you choose to
            close it. Save these changes to avoid losing your work.
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button
            id="custom-delete-modal-cancel"
            className="btn btn-default custom-button"
            onClick={() => this.handleDontSave()}
          >
            Don't Save
          </button>
          <button
            id="custom-delete-modal-cancel"
            className="btn btn-default custom-button"
            onClick={this.props.onHide}
          >
            Cancel
          </button>
          <button
            id="custom-delete-modal-delete"
            className="btn btn-default custom-button"
            onClick={() => this.handleSave()}
          >
            Save
          </button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default SavePromptModal;
