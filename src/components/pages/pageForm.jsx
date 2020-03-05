import React from "react";
import { Modal } from "react-bootstrap";
import Joi from "joi-browser";
import { Link } from "react-router-dom";
import Form from "../common/form";
import { connect } from "react-redux";
import pagesService from "./pageService";
import { addPage, addGroupPage } from "../pages/pagesActions";
import shortid from "shortid";
const mapDispatchToProps = dispatch => {
  return {
    addPage: (versionId, newPage) => dispatch(addPage(versionId, newPage)),
    addGroupPage: (versionId, groupId, newPage) =>
      dispatch(addGroupPage(versionId, groupId, newPage))
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
        // newPage: this.state.data,
        // versionId: this.props.location.pathname.split("/")[5],
        // groupId: this.props.location.pathname.split("/")[7]
      });
    }
    if (this.props.title === "Add New Version Page") {
      const { versionId } = this.props.location;
      const newPage = { ...this.state.data, requestId: shortid.generate() };
      this.props.addPage(versionId, newPage);
      this.props.history.push({
        pathname: `/dashboard/`
        // newPage: this.state.data,
        // versionId: this.props.location.pathname.split("/")[5]
      });
    }
  }

  render() {
    // console.log("this.props.groupId", this.props.groupId);

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

export default connect(null, mapDispatchToProps)(PageForm);
// export default PageForm;
