import React, { Component } from "react";
import { Modal } from "react-bootstrap";
import { withRouter } from "react-router-dom";
import { importApi } from "../collections/redux/collectionsActions";
import { connect } from "react-redux";

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
    console.log("importApi", uploadedFile);
    this.props.import_api(uploadedFile);
  }

  onFileChange(e) {
    // this.setState({ selectedFile: e.currentTarget.files[0] });
    let selectedFile = e.currentTarget.files[0];
    let uploadedFile = new FormData();
    uploadedFile.append("myFile", selectedFile, selectedFile.name);
    this.setState({ uploadedFile });
    // return this.fileData(selectedFile);
  }

  // onFileUpload() {
  //   const uploadedFile = new FormData();
  //   uploadedFile.append(
  //     "myFile",
  //     this.state.selectedFile,
  //     this.state.selectedFile.name
  //   );
  //   this.setState({ uploadedFile });
  // }

  // fileData(selectedFile) {
  //   if (selectedFile) {
  //     return (
  //       <div>
  //         <h2>File Details:</h2>
  //         <p>File Name: {selectedFile.name}</p>
  //         <p>File Type: {selectedFile.type}</p>
  //       </div>
  //     );
  //   }
  // }

  render() {
    return (
      <div>
        <Modal
          {...this.props}
          id="modal-code-window"
          size="lg"
          animation={false}
          aria-labelledby="contained-modal-title-vcenter"
          centered
        >
          <Modal.Header
            className="custom-collection-modal-container"
            closeButton
          >
            <Modal.Title id="contained-modal-title-vcenter">
              {this.props.title}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div>
              <form>
                <label>
                  Select JSON File
                  {/* <textarea
                    onChange={this.handleChange.bind(this)}
                    rows="20"
                    cols="50"
                  ></textarea> */}
                </label>
                <br></br>
                {/* <input></input> */}
                <input type="file" onChange={this.onFileChange.bind(this)} />
                {/* <button type="button" onClick={this.onFileUpload.bind(this)}>
                  Upload!
                </button> */}
                {/* <input type="file" id="myFile" name="filename" /> */}
                {/* {this.fileData()} */}

                <div className="button-group">
                  <button
                    type="button"
                    className="btn"
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
            </div>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}
export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(OpenApiForm)
);
