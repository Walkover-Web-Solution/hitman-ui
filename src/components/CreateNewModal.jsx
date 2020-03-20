import React, { Component } from "react";
import { ListGroup, Modal, ModalBody } from "react-bootstrap";
import Endpoints from "./endpoints/endpoints";
import Environments from "./environments/environments";

class CreateNewModal extends Component {
  state = {};
  render() {
    return (
      <Modal
        {...this.props}
        size="xl"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <div className="custom-modal-container">
          <Modal.Header>Create New</Modal.Header>
          <Modal.Body>
            <div>BUILDING BLOCKS</div>
            <div id="leftbox">
              <div id="custom-req-icon-div">
                <i className="fas fa-share-square" id="custom-req-icon"></i>
              </div>
              <div>
                <div>Request</div>
                <div>Create a request</div>
              </div>
            </div>

            <div id="middlebox">
              <div id="custom-col-icon-div">
                <i id="custom-col-icon" className="fas fa-folder-open"></i>
              </div>
              <div>
                <div>Collection</div>
                <div>Create collection</div>
              </div>
            </div>

            <div id="rightbox">
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
