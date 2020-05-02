import Joi from "joi-browser";
import React from "react";
import { Modal } from "react-bootstrap";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import shortid from "shortid";
import Form from "../common/form";
import { addGroupPage, addPage } from "../pages/redux/pagesActions";

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    add_page: (versionId, newPage) =>
      dispatch(addPage(ownProps.history, versionId, newPage)),
    add_group_page: (versionId, groupId, newPage) =>
      dispatch(addGroupPage(ownProps.history, versionId, groupId, newPage)),
  };
};

class PageForm extends Form {
  state = {
    data: {
      name: "",
    },
    errors: {},
  };

  schema = {
    name: Joi.string().required().label("Page name"),
  };

  async doSubmit(props) {
    this.props.onHide();
    if (this.props.title === "Add new Group Page") {
      const newPage = { ...this.state.data, requestId: shortid.generate() };
      this.props.add_group_page(
        this.props.selectedVersion,
        this.props.selectedGroup.id,
        newPage
      );
    }
    if (this.props.title === "Add New Version Page") {
      const versionId = this.props.selectedVersion.id;
      const newPage = { ...this.state.data, requestId: shortid.generate() };
      this.props.add_page(versionId, newPage);
    }
  }

  render() {
    return (
      <Modal
        {...this.props}
        size="lg"
        animation={false}
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
            {this.renderInput("name", "Page name", "page name")}
            {this.renderButton("Submit")}
            <button
              className="btn btn-default custom-button"
              onClick={this.props.onHide}
            >
              Cancel
            </button>
          </form>
        </Modal.Body>
      </Modal>
    );
  }
}

export default withRouter(connect(null, mapDispatchToProps)(PageForm));
