import React from "react";
import { Link } from "react-router-dom";
import { Modal } from "react-bootstrap";
import Form from "./common/form";
import Joi from "joi-browser";
class EnvironmentForm extends Form {
  state = {
    data: {
      name: ""
    },
    errors: {}
  };

  schema = {
    name: Joi.string()
      .required()
      .label("Environment Name")
  };

  async doSubmit(props) {
    if (this.props.title === "Add new Environment") {
      this.props.history.push({
        pathname: "/collections/environments",
        newEnvironment: this.state.data
      });
    }

    if (this.props.title === "Edit Environment") {
      this.props.history.push({
        pathname: "/collections/environments/manage",
        editedEnvironment: this.state.data,
        environmentid: this.state.environmentId
      });
    }
  }

  render() {
    if (this.props.location.editEnvironment) {
      const { id, name } = this.props.location.editEnvironment;
      this.state.environmentId = id;
      this.state.data.name = name;
      this.props.history.replace({ editEnvironment: null });
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
            {this.renderInput("name", "Environment Name*")}
            {this.renderButton("Submit")}
            <Link to={`/collections/environments/manage`}>Cancel</Link>
          </form>
        </Modal.Body>
      </Modal>
    );
  }
}

export default EnvironmentForm;
