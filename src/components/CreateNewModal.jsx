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
              class="card-body new-button-card"
              onClick={() => {
                this.props.history.push({
                  pathname: "/dashboard/endpoints"
                });
                this.props.onHide();
              }}
            >
              <div id="custom-req-icon-div">
                <i className="fas fa-share-square new-icon-wrapper"></i>
              </div>
              <div className="new-button-text-wrapper">
                <h5 class="card-title">Request</h5>
                <h6 class="card-subtitle mb-2 text-muted">
                  Create a basic request
                </h6>
              </div>
            </div>

            <div
              class="card-body new-button-card"
              onClick={() => {
                this.props.openCollectionForm();
              }}
            >
              <div id="custom-req-icon-div">
                <i className="fas fa-folder-open new-icon-wrapper"></i>
              </div>
              <div className="new-button-text-wrapper">
                <h5 class="card-title">Collection</h5>
                <h6 class="card-subtitle mb-2 text-muted">
                  Save your requests in a collection
                </h6>
              </div>
            </div>

            <div
              class="card-body new-button-card"
              onClick={() => {
                this.props.openEnvironmentForm();
              }}
            >
              <div id="custom-req-icon-div">
                <i className="fas fa-border-none new-icon-wrapper"></i>
              </div>
              <div className="new-button-text-wrapper">
                <h5 class="card-title">Environment</h5>
                <h6 class="card-subtitle mb-2 text-muted">
                  Save values you frequently use in an Environment
                </h6>
              </div>
            </div>

            {/* <div
     new-button-card          
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
            </div> */}

            {/* <div
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
            </div> */}
          </Modal.Body>
        </div>
      </Modal>
    );
  }
}

export default CreateNewModal;
