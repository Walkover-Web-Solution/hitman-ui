import React from "react";
import { Modal } from "react-bootstrap";
import Joi from "joi-browser";
import { Link } from "react-router-dom";
import Form from "../common/form";
import { connect } from "react-redux";
import { addPage, addGroupPage } from "../pages/pagesActions";
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
    if (this.props.title === "Add new Group Page") {
      const { versionId, groupId } = this.props.location;
      const newPage = { ...this.state.data, requestId: shortid.generate() };
      this.props.addGroupPage(versionId, groupId, newPage);
      this.props.history.push({
        pathname: `/dashboard/`
      });
    }
    if (this.props.title === "Add New Version Page") {
      const { versionId } = this.props.location;
      const newPage = { ...this.state.data, requestId: shortid.generate() };
      this.props.addPage(versionId, newPage);
      this.props.history.push({
        pathname: `/dashboard/`
      });
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
            <Link to={`/dashboard/collections`}>Cancel</Link>
          </form>
        </Modal.Body>
      </Modal>
    );
  }
}

export default withRouter(connect(null, mapDispatchToProps)(PageForm));
