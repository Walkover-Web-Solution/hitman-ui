import React from "react";
import { Modal } from "react-bootstrap";
import Joi from "joi-browser";
import Form from "../common/form";
import { connect } from "react-redux";
import {
  addVersion,
  updateVersion,
} from "../collectionVersions/redux/collectionVersionsActions";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json";

import shortid from "shortid";

const mapDispatchToProps = (dispatch) => {
  return {
    add_version: (newCollectionVersion, collectionId) =>
      dispatch(addVersion(newCollectionVersion, collectionId)),
    update_version: (editedVersion) => dispatch(updateVersion(editedVersion)),
  };
};
class SampleResponseForm extends Form {
  state = {
    data: { status: "", description: "", body: "" },
    errors: {},
  };

  schema = {
    status: Joi.string().required().label("status: "),
    description: Joi.string().uri().required().label("descripton: "),
    body: Joi.string().uri().required().label("body: "),
  };

  async componentDidMount() {
    let data = {};
    if (this.props.title === "Add new Collection Version") return;
    console.log(this.props.title, this.props.selectedSampleResponse);
    if (
      this.props.title === "Edit Sample Response" &&
      this.props.selectedSampleResponse
    ) {
      let {
        status,
        description,
        data: body,
      } = this.props.selectedSampleResponse;
      body = JSON.stringify(body);
      data = {
        status,
        description,
        body,
      };
      console.log("data", data);
    }
    this.setState({ data });
  }

  async doSubmit() {
    this.props.onHide();
    if (this.props.title === "Edit Collection Version") {
      const { id, collectionId } = this.props.selected_version;
      const editedCollectionVersion = { ...this.state.data, collectionId, id };
      this.props.update_version(editedCollectionVersion);
    }
    if (this.props.title === "Add new Collection Version") {
      const collectionId = this.props.collection_id;
      const newVersion = { ...this.state.data, requestId: shortid.generate() };
      this.props.add_version(newVersion, collectionId);
    }
  }

  render() {
    console.log("sampleResponse", this.props.selectedSampleResponse);
    console.log("data", this.state.data);
    return (
      <Modal
        {...this.props}
        size="lg"
        animation={false}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header className="custom-collection-modal-container" closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            {this.props.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={this.handleSubmit}>
            {this.renderInput("status", "status: ", "Enter Status ")}
            {this.renderInput("descripton", "descripton: ", "Enter Descripton")}
            {/* {this.renderTextArea("body", "body: ", "Enter Body")} */}
            <AceEditor
              className="custom-raw-editor"
              //   mode={this.state.selectedRawBodyType.toLowerCase()}
              theme="github"
              value={this.state.data.body}
              //   onChange={this.handleChange.bind(this)}
              setOptions={{
                showLineNumbers: true,
              }}
              editorProps={{
                $blockScrolling: false,
              }}
              onLoad={(editor) => {
                editor.focus();
                editor.getSession().setUseWrapMode(true);
                editor.setShowPrintMargin(false);
              }}
            />
            {this.renderButton("Submit")}
            <button
              className="btn btn-default custom-button"
              onClick={this.props.onHide}
            >
              Cancel
            </button>
          </form>
        </Modal.Body>
      </Modal>
    );
  }
}

export default connect(null, mapDispatchToProps)(SampleResponseForm);
