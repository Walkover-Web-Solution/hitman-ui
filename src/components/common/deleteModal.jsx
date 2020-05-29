import React, { Component } from "react";
import { Modal } from "react-bootstrap";
import { connect } from "react-redux";
import { closeTab } from "../tabs/redux/tabsActions";
import tabService from "../tabs/tabService";
const mapDispatchToProps = (dispatch) => {
  return {
    close_tab: (tabId) => dispatch(closeTab(tabId)),
  };
};
class DeleteModal extends Component {
  state = {};

  handleSubmit = (e) => {
    e.preventDefault();
    this.doSubmit();
  };

  doSubmit() {
    this.props.onHide();
    const { title } = this.props;
    if (title === "Delete Collection") {
      const { deleted_collection: collection } = this.props;
      this.props.delete_collection(collection, this.props);
    }
    if (title === "Delete Version") {
      const { deleted_version: version } = this.props;
      this.props.delete_version(version, this.props);
    }
    if (title === "Delete Group") {
      const { deleted_group: group } = this.props;
      this.props.delete_group(group, this.props);
    }
    if (title === "Delete Page") {
      const { deleted_page: page } = this.props;
      tabService.removeTab(page.id, { ...this.props });
      this.props.delete_page(page);
    }

    if (title === "Delete Endpoint") {
      const { deleted_endpoint: endpoint } = this.props;
      this.props.handle_delete(endpoint);
    }
    if (title === "Delete Environment") {
      const { deleted_environment: environment } = this.props;
      this.props.delete_environment(environment);
    }
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
            {this.props.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body id="custom-delete-modal-body">
          <div>{this.props.message}</div>
        </Modal.Body>
        <Modal.Footer>
          <form onSubmit={this.handleSubmit}>
            <button
              id="custom-delete-modal-delete"
              className="btn btn-default custom-button"
            >
              Delete
            </button>
            <button
              id="custom-delete-modal-cancel"
              className="btn btn-default custom-button"
              onClick={this.props.onHide}
            >
              Cancel
            </button>
          </form>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default connect(null, mapDispatchToProps)(DeleteModal);
