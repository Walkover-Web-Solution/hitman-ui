import React, { Component } from "react";
import { Modal, ListGroup, Container, Row, Col } from "react-bootstrap";
import Authorization from "./displayAuthorization";

class TokenGenerator extends Component {
  state = {
    grantType: "",
  };

  grantType = {
    authorizationCode: "Authorization Code",
    implict: "Implicit",
    passwordCredentials: "Password Credentials",
    clientCredentials: "Client Credentials",
  };

  inputFields = {
    tokenName: "Token Name",
    grantType: "Grant Type",
    callbackUrl: "Callback URL",
    authUrl: "Auth URL",
    clientId: "Client ID",
    scope: "Scope",
    state: "State",
    clientAuthentication: "Client Authentication",
  };

  setGrantType(key) {
    this.setState({ grantType: key });
  }

  renderInput(key) {
    if (key === "grantType") {
      return (
        <div className="dropdown">
          <button
            className="btn dropdown-toggle"
            id="dropdownMenuButton"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            {this.state.grantType[key]
              ? this.state.grantType(key)
              : "Authorization Code"}
          </button>
          <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
            {Object.keys(this.grantType).map((key) => (
              <button
                onClick={() => this.setGrantType(key)}
                className="btn custom-request-button"
              >
                {this.grantType[key]}
              </button>
            ))}
          </div>
        </div>
      );
    } else {
      return <input></input>;
    }
  }
  render() {
    console.log("sasa", this.props.title);

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
            {Object.keys(this.inputFields).map((key) => (
              <div className="input-field-wrapper">
                <label>{this.inputFields[key]}</label>
                {this.renderInput(key)}
              </div>
            ))}
            <button>Cancel</button>
            <button>Request Token</button>
            {/* <div className="input-field-wrapper">
              <label>Token Name</label>
              <input></input>
            </div>
            <label>Grant Type</label>
            <input></input>
            <label>Callback URL</label>
            <input></input>
            <label>Auth URL</label>
            <input></input>
            <label>Client ID</label>
            <input></input>
            <label>Scope</label>
            <input></input>
            <label>State</label>
            <input></input>
            <label>Client Authentication</label>
            <input></input> */}
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}

export default TokenGenerator;
