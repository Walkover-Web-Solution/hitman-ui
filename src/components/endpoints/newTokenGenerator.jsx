import React, { Component } from "react";
import { Modal, ListGroup, Container, Row, Col } from "react-bootstrap";
import endpointApiService from "./endpointApiService";

import Authorization from "./displayAuthorization";
import { Redirect } from "react-router-dom";

class TokenGenerator extends Component {
  state = {
    grantType: "authorizationCode",
    data: {
      tokenName: "",
      grantType: "",
      callbackUrl: "",
      authUrl: "",
      username: "",
      password: "",
      accessTokenUrl: "",
      clientId: "",
      clientSecret: "",
      scope: "",
      state: "",
      clientAuthentication: "",
    },
  };

  grantTypes = {
    authorizationCode: "Authorization Code",
    implicit: "Implicit",
    passwordCredentials: "Password Credentials",
    clientCredentials: "Client Credentials",
  };

  inputFields = {
    tokenName: "Token Name",
    grantType: "Grant Type",
    callbackUrl: "Callback URL",
    authUrl: "Auth URL",
    accessTokenUrl: "Access Token URL",
    username: "Username",
    password: "Password",
    clientId: "Client ID",
    clientSecret: "Client Secret",
    scope: "Scope",
    state: "State",
    clientAuthentication: "Client Authentication",
  };

  setGrantType(key) {
    this.setState({ grantType: key });
  }

  handleChange(e) {
    let data = { ...this.state.data };
    data[e.currentTarget.name] = e.currentTarget.value;
    console.log("data", data);
    this.setState({ data });
  }

  makeRequest() {
    let data = { ...this.state.data };
    let requestApi =
      this.state.data.authUrl +
      "?" +
      "scope=" +
      this.state.data.scope +
      "&redirect_uri=" +
      this.state.data.callbackUrl +
      "&client_id=" +
      this.state.data.clientId +
      "&response_type=token";
    console.log("requestapi", requestApi);
    endpointApiService.authorize(requestApi);
  }
  renderInput(key) {
    switch (key) {
      case "grantType":
        return (
          <div className="dropdown">
            <label>{this.inputFields[key]}</label>
            <button
              className="btn dropdown-toggle"
              id="dropdownMenuButton"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              {this.grantTypes[this.state.grantType]}
            </button>
            <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
              {Object.keys(this.grantTypes).map((key) => (
                <button
                  onClick={() => this.setGrantType(key)}
                  className="btn custom-request-button"
                >
                  {this.grantTypes[key]}
                </button>
              ))}
            </div>
          </div>
        );
      case "callbackUrl":
        if (
          this.state.grantType === "authorizationCode" ||
          this.state.grantType === "implicit"
        ) {
          return this.fetchDefaultInputField(key);
        }
        break;
      case "authUrl":
        if (
          this.state.grantType === "authorizationCode" ||
          this.state.grantType === "implicit"
        ) {
          return this.fetchDefaultInputField(key);
        }
        break;
      case "state":
        if (
          this.state.grantType === "authorizationCode" ||
          this.state.grantType === "implicit"
        ) {
          return this.fetchDefaultInputField(key);
        }
        break;
      case "username":
        if (this.state.grantType === "passwordCredentials") {
          return this.fetchDefaultInputField(key);
        }
        break;
      case "password":
        if (this.state.grantType === "passwordCredentials") {
          return this.fetchDefaultInputField(key);
        }
        break;
      case "accessTokenUrl":
        if (this.state.grantType === "implicit") {
          return;
        }
      case "clientSecret":
        if (this.state.grantType === "implicit") {
          return;
        }
      default:
        return this.fetchDefaultInputField(key);
    }
  }

  fetchDefaultInputField(key) {
    return (
      <div>
        <label>{this.inputFields[key]}</label>
        <input name={key} onChange={this.handleChange.bind(this)}></input>
      </div>
    );
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
              <div className="input-field-wrapper">{this.renderInput(key)}</div>
            ))}
            <button>Cancel</button>
            <button type="button" onClick={() => this.makeRequest()}>
              Request Token
            </button>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}

export default TokenGenerator;
