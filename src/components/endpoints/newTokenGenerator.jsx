import React, { Component } from "react";
import { Modal, ListGroup, Container, Row, Col } from "react-bootstrap";
import endpointApiService from "./endpointApiService";

import Authorization from "./displayAuthorization";
import { Redirect } from "react-router-dom";
var URI = require("urijs");

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
      client_id: "",
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

  async makeRequest() {
    let grantType = this.state.grantType;
    let requestApi = "";
    let params = this.makeParams(grantType);
    params = URI.buildQuery(params);
    console.log("params", params);
    // if (grantType === "implicit") {
    //   let paramsObject = {};
    //   for (let i = 0; i < keys.length; i++) {
    //     if (this.state.data[keys[i]] !== "" && keys[i] !== "authUrl") {
    //       paramsObject[keys[i]] = this.state.data[keys[i]];
    //     }
    //   }
    //   console.log("paramsObject", paramsObject);
    //   requestApi = URI.buildQuery(paramsObject);
    //   console.log("requestApi", requestApi);
    // }
    if (grantType === "implicit") {
      requestApi =
        this.state.data.authUrl + "?" + params + "&response_type=token";
    }

    console.log("requestapi", requestApi);
    console.log(this.props);
    if (this.props.groupId) {
      await endpointApiService.setAuthorizationData(
        this.props.groups[this.props.groupId].versionId,
        this.state.data
      );
    }

    endpointApiService.authorize(requestApi);
  }

  makeParams(grantType) {
    // tokenName: "",
    // grantType: "",
    // callbackUrl: "",
    // authUrl: "",
    // username: "",
    // password: "",
    // accessTokenUrl: "",
    // clientId: "",
    // clientSecret: "",
    // scope: "",
    // state: "",
    // clientAuthentication: "",
    let params = {};
    let data = { ...this.state.data };
    let keys = Object.keys(data);
    for (let i = 0; i < keys.length; i++) {
      switch (keys[i]) {
        case "callbackUrl":
          if (grantType === "implicit") {
            params["redirect_uri"] = data[keys[i]];
          }
          break;
        case "clientId":
          if (grantType === "implicit") {
            params["client_id"] = data[keys[i]];
          }
          break;
        case "scope":
          if (grantType === "implicit") {
            params[keys[i]] = data[keys[i]];
          }
          break;
        case "state":
          if (grantType === "implicit") {
            params[keys[i]] = data[keys[i]];
          }
          break;
        default:
          continue;
      }
    }
    console.log(params);
    return params;
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
