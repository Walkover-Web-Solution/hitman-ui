import React from "react";
import { Link } from "react-router-dom";
import { Modal } from "react-bootstrap";
import Form from "./common/form";
import Joi from "joi-browser";
import collectionversionsservice from "../services/collectionVersionsService";

class CollectionVersionForm extends Form {
  state = {
    data: {
      number: "",
      host: ""
    },
    errors: {},
    editCollectionVersion: true
  };

  schema = {
    number: Joi.string()
      .required()
      .label("Version number"),
    host: Joi.string()
      .required()
      .label("Host")
  };

  async doSubmit(props) {
    this.state.editCollectionVersion = false;
    if (this.props.title === "Edit Collection Version") {
      const {
        data: editedCollectionVersion
      } = await collectionversionsservice.updateCollectionVersion(
        this.props.location.editCollectionVersion.id,
        this.state.data
      );
      this.props.history.push({
        pathname: `/dashboard/collections`,
        editedCollectionVersion: editedCollectionVersion
      });
    }
    if (this.props.title === "Add new Collection Version") {
      const {
        data: newCollectionVersion
      } = await collectionversionsservice.saveCollectionVersion(
        this.props.collectionId,
        this.state.data
      );
      this.props.history.push({
        pathname: `/dashboard/collections`,
        newCollectionVersion: newCollectionVersion,
        collectionid: this.props.collectionId
      });
    }
  }

  render() {
    if (
      this.props.location.editCollectionVersion &&
      this.state.editCollectionVersion
    ) {
      const { number, host } = this.props.location.editCollectionVersion;
      this.state.editCollectionVersion = false;
      this.state.data.number = number;
      this.state.data.host = host;
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
            {this.renderInput("number", "Version Number")}
            {this.renderInput("host", "Host*")}
            {this.renderButton("Submit")}
            <Link to={`/dashboard/collections/`}>Cancel</Link>
          </form>
        </Modal.Body>
      </Modal>
    );
  }
}

export default CollectionVersionForm;
