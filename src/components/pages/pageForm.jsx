import React from "react";
import { Modal } from "react-bootstrap";
import Joi, { inherits } from "joi-browser";
import { Link } from "react-router-dom";
import Form from "../common/form";
import { connect } from "react-redux";
import { addPage, addGroupPage } from "../pages/redux/pagesActions";
import shortid from "shortid";
import { withRouter } from "react-router-dom";

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    addPage: (versionId, newPage) =>
      dispatch(addPage(ownProps.history, versionId, newPage)),
    addGroupPage: (versionId, groupId, newPage) =>
      dispatch(addGroupPage(ownProps.history, versionId, groupId, newPage))
  };
};

class PageForm extends Form {
  state = {
    data: {
      name: ""
    },
    errors: {}
  };

  schema = {
    name: Joi.string()
      .required()
      .label("Page name")
  };

  async doSubmit(props) {
    this.props.onHide();
    if (this.props.title === "Add new Group Page") {
     const newPage = { ...this.state.data, requestId: shortid.generate() };
      this.props.addGroupPage(this.props.selectedVersion, this.props.selectedGroup.id, newPage);
    }
    if (this.props.title === "Add New Version Page") {
      const versionId = this.props.selectedVersion.id;
      const newPage = { ...this.state.data, requestId: shortid.generate() };
       this.props.addPage(versionId, newPage);
    }
  }

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
            {this.props.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={this.handleSubmit}>
            {this.renderInput("name", "Page name")}
            {this.renderButton("Submit")}
            <button className="btn btn-default" onClick={this.props.onHide}>
              Cancel
            </button>
          </form>
        </Modal.Body>
      </Modal>
    );
  }
}

export default withRouter(connect(null, mapDispatchToProps)(PageForm));
