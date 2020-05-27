import React, { Component } from "react";
import { Modal } from "react-bootstrap";
import { withRouter } from "react-router-dom";
import { importApi } from "../collections/redux/collectionsActions";
import { connect } from "react-redux";

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    importApi: (openApiObject) => dispatch(importApi(openApiObject)),
  };
};

class OpenApiForm extends Component {
  state = {
    openApiObject: {},
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
    console.log(this.state.openApiObject);
    this.props.importApi(this.state.openApiObject);
  }

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
                  Enter JSON to import API
                  <textarea
                    onChange={this.handleChange.bind(this)}
                    rows="20"
                    cols="50"
                  >
                    At w3schools.com you will learn how to make a website. We
                    offer free tutorials in all web development technologies.
                  </textarea>
                </label>
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
export default withRouter(connect(mapDispatchToProps)(OpenApiForm));
