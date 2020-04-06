import React, { Component } from "react";
import { Modal } from "react-bootstrap";

class CreateNewModal extends Component {
  state = { showCollectionForm: false, showEnvironmentForm: false };
  render() {
    return (
      <Modal
        {...this.props}
        size="xl"
        animation={false}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <div className="custom-modal-container">
          <Modal.Header closeButton>Create New</Modal.Header>
          <Modal.Body>
            <div
              className="card-body new-button-card"
              onClick={() => {
                this.props.add_new_endpoint();
                this.props.onHide();
              }}
            >
              <div id="custom-req-icon-div">
                <i className="fas fa-share-square new-icon-wrapper"></i>
              </div>
              <div className="new-button-text-wrapper">
                <h5 className="card-title">Endpoint</h5>
                <h6 className="card-subtitle mb-2 text-muted">
                  Create a basic request
                </h6>
              </div>
            </div>

            <div
              className="card-body new-button-card"
              onClick={() => {
                this.props.open_collection_form();
              }}
            >
              <div id="custom-req-icon-div">
                <i className="fas fa-folder-open new-icon-wrapper"></i>
              </div>
              <div className="new-button-text-wrapper">
                <h5 className="card-title">Collection</h5>
                <h6 className="card-subtitle mb-2 text-muted">
                  Save your requests in a collection
                </h6>
              </div>
            </div>

            <div
              className="card-body new-button-card"
              onClick={() => {
                this.props.open_environment_form();
              }}
            >
              <div id="custom-req-icon-div">
                <i className="fas fa-border-none new-icon-wrapper"></i>
              </div>
              <div className="new-button-text-wrapper">
                <h5 className="card-title">Environment</h5>
                <h6 className="card-subtitle mb-2 text-muted">
                  Save values you frequently use in an Environment
                </h6>
              </div>
            </div>
          </Modal.Body>
        </div>
      </Modal>
    );
  }
}

export default CreateNewModal;
