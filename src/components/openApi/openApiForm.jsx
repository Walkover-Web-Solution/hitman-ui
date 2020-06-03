import React, { Component } from "react";
import { Modal } from "react-bootstrap";
import { withRouter } from "react-router-dom";
import { importApi } from "../collections/redux/collectionsActions";
import { connect } from "react-redux";
import "./openApi.scss";

const mapStateToProps = (state) => {
  return {};
};

const mapDispatchToProps = (dispatch) => {
  return {
    import_api: (openApiObject) => dispatch(importApi(openApiObject)),
  };
};

class OpenApiForm extends Component {
  state = {
    openApiObject: {},
    // selectedFile: null,
    uploadedFile: null,
  };

  handleChange(e) {
    let openApiObject = e.currentTarget.value;
    try {
      openApiObject = JSON.parse(openApiObject);
      this.setState({ openApiObject });
    } catch (e) {
      this.setState({ openApiObject: {} });
    }
  }

  importApi() {
    let uploadedFile = this.state.uploadedFile;
    this.props.import_api(uploadedFile);
    this.props.onHide();
  }

  onFileChange(e) {
    let selectedFile = e.currentTarget.files[0];
    let uploadedFile = new FormData();
    uploadedFile.append("myFile", selectedFile, selectedFile.name);
    this.setState({ uploadedFile });
  }

  render() {
    return (
      <Modal
        {...this.props}
        id="modal-open-api"
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
          <form>
            <div id="select-json-wrapper">
              <label>
                Select JSON File
                {/* <textarea
            onChange={this.handleChange.bind(this)}
            rows="20"
            cols="50"
            ></textarea> */}
              </label>
              <br></br>
              <input type="file" onChange={this.onFileChange.bind(this)} />
            </div>

            <div className="button-group">
              <button
                type="button"
                className="btn "
                onClick={this.props.onHide}
              >
                Cancel
              </button>
              <button
                className="btn request-token-button"
                type="button"
                onClick={() => this.importApi()}
              >
                Import{" "}
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    );
  }
}
export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(OpenApiForm)
);
