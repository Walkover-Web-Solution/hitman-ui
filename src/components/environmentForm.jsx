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
    this.props.history.push({
      pathname: "/collections/environments",
      newEnvironment: this.state.data
    });
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
            {this.renderInput("name", "Environment Name*")}
            {this.renderButton("Submit")}
            <Link to={`/collections/`}>Cancel</Link>
          </form>
        </Modal.Body>
      </Modal>
    );
  }
}

export default EnvironmentForm;
