import React, { Component } from "react";
import { Modal } from "react-bootstrap";

class AccessTokenManager extends Component {
  state = {};

  render() {
    console.log(this.props.authResponses);
    return (
      <div>
        <Modal
          {...this.props}
          id="modal-code-window"
          size="lg"
          animation={false}
          aria-labelledby="contained-modal-title-vcenter"
          centered
        >
          <Modal.Header
            className="custom-collection-modal-container"
            closeButton
          >
            <Modal.Title id="contained-modal-title-vcenter">
              {this.props.title}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <h1>dddusioshghih</h1>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}

export default AccessTokenManager;
