import React, { Component } from "react";
import { Modal } from "react-bootstrap";
import Form from "./form";
class DeleteModal extends Component {
  state = {};

  handleSubmit = e => {
    e.preventDefault();
    console.log("delete modal called");
    this.doSubmit();
  };

  doSubmit() {
    this.props.onHide();
    const { title } = this.props;
    if (title === "Delete Collection") {
      const { deleted_collection: collection } = this.props;
      this.props.deleteCollection(collection);
    }
    if (title === "Delete Version") {
      const { deleted_version: version } = this.props;
      this.props.deleteVersion(version);
    }
    if (title === "Delete Group") {
      const { deleted_group: group } = this.props;
      this.props.deleteGroup(group);
    }
    if (title === "Delete Page") {
      const { deleted_page: page } = this.props;
      this.props.deletePage(page);
    }

    if (title === "Delete Endpoint") {
      const { deleted_endpoint: endpoint } = this.props;
      this.props.deleteEndpoint(endpoint);
    }
    if (title === "Delete Environment") {
      const { deleted_environment: environment } = this.props;
      this.props.deleteEnvironment(environment);
    }
  }

  render() {
    return (
      <Modal
        {...this.props}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header className="custom-collection-modal-container" closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            {this.props.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={this.handleSubmit}>
            <button
              className="btn btn-default custom-button"
              onClick={this.props.onHide}
            >
              Cancel
            </button>
            <button className="btn btn-default custom-button">Delete</button>
          </form>
        </Modal.Body>
      </Modal>
    );
  }
}

export default DeleteModal;
