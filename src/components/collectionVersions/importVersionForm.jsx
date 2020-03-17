import React from "react";
import { Link } from "react-router-dom";
import { Modal } from "react-bootstrap";
import Joi from "joi-browser";
import Form from "../common/form";
import { connect } from "react-redux";
import { importVersion } from "../collectionVersions/redux/collectionVersionsActions";

const mapDispatchToProps = dispatch => {
  return {
    importVersion: (importLink, shareIdentifier, collectionId) =>
      dispatch(importVersion(importLink, shareIdentifier, collectionId))
  };
};
class ShareVersionForm extends Form {
  state = {
    data: {
      shareVersionLink: ""
    },
    errors: {}
  };

  componentDidMount() {
    if (this.props.location.shareIdentifier) {
    }
  }

  schema = {
    shareVersionLink: Joi.string()
      .required()
      .label("Public Link")
  };

  async doSubmit(props) {
    if (this.props.title === "Import Version") {
      this.props.onHide();
      const collectionId = this.props.selected_collection.id;
      const importLink = this.state.data.shareVersionLink;
      let shareIdentifier = importLink.split("/")[4];
      this.props.importVersion(importLink, shareIdentifier, collectionId);
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
            {this.renderInput("shareVersionLink", "Public Link")}
            {<div name="shareVersionLink" label="Public Link"></div>}
            {this.renderButton("Submit", "right")}
            <button onClick={this.props.onHide}>Cancel</button>
          </form>
        </Modal.Body>
      </Modal>
    );
  }
}

export default connect(null, mapDispatchToProps)(ShareVersionForm);
