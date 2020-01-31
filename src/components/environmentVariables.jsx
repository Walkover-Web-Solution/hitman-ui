import React, { Component } from "react";
import { Modal, Dropdown, ListGroup } from "react-bootstrap";
import { Link } from "react-router-dom";
import Input from "./common/input";

class EnvironmentVariables extends Component {
  state = {};

  render() {
    return (
      <Modal
        {...this.props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header>
          <Modal.Title id="contained-modal-title-vcenter">
            <h5>Environment Variables</h5>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Link to={`/collections/environments`}>Cancel</Link>
        </Modal.Body>
      </Modal>
    );
  }
}

export default EnvironmentVariables;
