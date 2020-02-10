import React from "react";
import Form from "./common/form";
import { Modal } from "react-bootstrap";
import Joi from "joi-browser";
import { Link } from "react-router-dom";

class Endpoints extends Form {
  state = {
    data: {
      name: ""
    },
    errors: {}
  };

  schema = {
    name: Joi.string()
      .required()
      .label("Endpoint name")
  };

  async doSubmit(props) {
    if (this.props.title === "Add New Endpoint") {
      this.props.history.push({
        pathname: `/dashboard/collections`,
        newEndpoint: this.state.data,
        // versionId: parseInt(this.props.location.pathname.split("/")[5]),
        groupId: parseInt(this.props.location.pathname.split("/")[7]),
        title: "Add New Endpoint",
        versions: this.props.location.versions
      });
    }

    // if (this.props.title === "Add New Version Page") {
    //   this.props.history.push({
    //     pathname: `/dashboard/collections`,
    //     newPage: this.state.data,
    //     versionId: parseInt(this.props.location.pathname.split("/")[5])
    //   });
    // }

    if (this.props.title == "Edit Endpoint") {
      this.props.history.push({
        pathname: `/dashboard/collections`,
        editedEndpoint: this.state.data,
        groupId: parseInt(this.props.location.pathname.split("/")[7]),
        versionId: this.state.versionId
      });
    }
  }

  render() {
    if (this.props.location.editEndpoint) {
      const { name } = this.props.location.editEndpoint;
      // this.state.pageId = id;
      // this.state.versionId = versionId;
      this.state.data.name = name;
      // this.state.data.contents = contents;
      this.props.history.replace({ editEndpoint: null });
    }
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
            {this.renderInput("name", "Endpoint name")}
            {this.renderButton("Submit")}
            <Link to={`/dashboard/collections`}>Cancel</Link>
          </form>
        </Modal.Body>
      </Modal>
    );
  }
}

export default Endpoints;
