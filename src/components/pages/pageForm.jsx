import React from "react";
import { Modal } from "react-bootstrap";
import Joi from "joi-browser";
import { Link } from "react-router-dom";
import Form from "../common/form";

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
      this.props.history.push({
        pathname: `/dashboard/`,
        newPage: this.state.data,
        versionId: this.props.location.pathname.split("/")[5],
        groupId: this.props.location.pathname.split("/")[7]
      });
    }
    if (this.props.title === "Add New Version Page") {
      this.props.history.push({
        pathname: `/dashboard/`,
        newPage: this.state.data,
        versionId: this.props.location.pathname.split("/")[5]
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

export default PageForm;
