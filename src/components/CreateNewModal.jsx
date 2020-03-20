import React, { Component } from "react";
import { Modal } from "react-bootstrap";

class CreateNewModal extends Component {
  state = { showCollectionForm: false, showEnvironmentForm: false };
  render() {
    return (
      <Modal
        {...this.props}
        size="xl"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <div className="custom-modal-container">
          <Modal.Header closeButton>Create New</Modal.Header>
          <Modal.Body>
            <div
              id="leftbox"
              onClick={() => {
                this.props.history.push({
                  pathname: "/dashboard/endpoints"
                });
                this.props.onHide();
              }}
            >
              <div id="custom-req-icon-div">
                <i className="fas fa-share-square" id="custom-req-icon"></i>
              </div>
              <div>
                <div>Request</div>
                <div>Create a request</div>
              </div>
            </div>

            <div
              id="middlebox"
              onClick={() => {
                this.props.openCollectionForm();
              }}
            >
              <div id="custom-col-icon-div">
                <i id="custom-col-icon" className="fas fa-folder-open"></i>
              </div>
              <div>
                <div>Collection</div>
                <div>Create collection</div>
              </div>
            </div>

            <div
              id="rightbox"
              onClick={() => {
                this.props.openEnvironmentForm();
              }}
            >
              <div id="custom-env-icon-div">
                {" "}
                <i id="custom-env-icon" className="fas fa-border-none"></i>
              </div>
              <div>
                <div>Environment</div>
                <div>Create Environment</div>
              </div>
            </div>
          </Modal.Body>
        </div>
      </Modal>
    );
  }
}

export default CreateNewModal;
