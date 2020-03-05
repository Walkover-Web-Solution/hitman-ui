import React from "react";
import { Link } from "react-router-dom";
import { Modal } from "react-bootstrap";
import Joi from "joi-browser";
import Form from "../common/form";
import collectionVersionsService from "./collectionVersionsService";
import { connect } from "react-redux";
import {
  addVersion,
  updateVersion
} from "../collectionVersions/collectionVersionsActions";

import shortid from "shortid";

const mapDispatchToProps = dispatch => {
  return {
    addVersion: (newCollectionVersion, collectionId) =>
      dispatch(addVersion(newCollectionVersion, collectionId)),
    updateVersion: editedVersion => dispatch(updateVersion(editedVersion))
  };
};
class CollectionVersionForm extends Form {
  state = {
    data: {
      number: "",
      host: ""
    },
    errors: {},
    versionId: null,
    collectionId: ""
  };

  schema = {
    number: Joi.string()
      .required()
      .label("Version number"),
    host: Joi.string()
      .uri()
      .required()
      .label("Host")
  };

  async componentDidMount() {
    let data = {};
    const collectionId = this.props.location.pathname.split("/")[3];
    const versionId = this.props.location.pathname.split("/")[5];
    if (this.props.title === "Add new Collection Version") return;
    if (this.props.location.editCollectionVersion) {
      const { number, host } = this.props.location.editCollectionVersion;
      data = {
        number,
        host
      };
    } else {
      const {
        data: editedCollectionVersion
      } = await collectionVersionsService.getCollectionVersion(versionId);
      const { number, host } = editedCollectionVersion;
      data = {
        number,
        host
      };
    }
    this.setState({ data, versionId, collectionId });
  }

  async doSubmit() {
    if (this.props.title === "Edit Collection Version") {
      const id = this.props.location.editCollectionVersion.id;
      const collectionId = this.props.location.editCollectionVersion
        .collectionId;
      const editedCollectionVersion = { ...this.state.data, collectionId, id };
      this.props.updateVersion(editedCollectionVersion);
      this.props.history.push({
        pathname: `/dashboard/collections`
      });
    }
    if (this.props.title === "Add new Collection Version") {
      const collectionId = this.props.location.collectionId;
      const newVersion = { ...this.state.data, requestId: shortid.generate() };
      this.props.addVersion(newVersion, collectionId);
      this.props.history.push({
        pathname: `/dashboard/collections`
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

export default connect(null, mapDispatchToProps)(CollectionVersionForm);
