import React from "react";
import { Modal } from "react-bootstrap";
import Joi from "joi-browser";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { apiUrl } from "../../config.json";
import Form from "../common/form";

class ShareVersionForm extends Form {
  state = {
    data: {
      shareVersionLink: ""
    },
    errors: {}
  };

  componentDidMount() {
    if (this.props.selectedVersion) {
      let data = {};
      const shareVersionLink =
        apiUrl + "/share/" + this.props.selectedVersion.shareIdentifier;
      data = { shareVersionLink };
      this.setState({ data });
    }
  }

  schema = {
    shareVersionLink: Joi.string()
      .required()
      .label("Public Link")
  };

  async doSubmit(props) {}

  render() {
    return (
      <Modal
        {...this.props}
        size="lg"
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
            {this.renderInput("shareVersionLink", "Public Link")}
            {<div name="shareVersionLink" label="Public Link"></div>}
            {
              <CopyToClipboard
                text={JSON.stringify(this.state.data.shareVersionLink).replace(
                  /['"]+/g,
                  ""
                )}
                onCopy={() => this.props.onHide()}
                className="btn btn-default"
                style={{ float: "right" }}
              >
                <button style={{ borderRadius: "12px" }}>Copy</button>
              </CopyToClipboard>
            }
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

export default ShareVersionForm;
