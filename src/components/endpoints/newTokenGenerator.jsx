import React, { Component } from "react";
import { Modal } from "react-bootstrap";
import endpointApiService from "./endpointApiService";
var URI = require("urijs");

class TokenGenerator extends Component {
  state = {
    data: {
      tokenName: "",
      grantType: "authorizationCode",
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

  componentDidMount() {
    this.fetchAuthorizationData();
  }

  fetchAuthorizationData() {
    if (this.props.groupId) {
      let versionId = this.props.groups[this.props.groupId].versionId;
      let data = this.props.versions[versionId].authorizationData;
      if (data !== null && Object.keys(data).length !== 0) {
        this.setState({ data });
      }
    }
  }

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
    let data = this.state.data;
    data.grantType = key;
    this.setState({ data });
  }

  handleChange(e) {
    let data = { ...this.state.data };
    data[e.currentTarget.name] = e.currentTarget.value;
    this.setState({ data });
  }

  async makeRequest() {
    let grantType = this.state.data.grantType;
    let requestApi = "";
    let params = this.makeParams(grantType);
    params = URI.buildQuery(params);
    // if (grantType === "implicit") {
    //   let paramsObject = {};
    //   for (let i = 0; i < keys.length; i++) {
    //     if (this.state.data[keys[i]] !== "" && keys[i] !== "authUrl") {
    //       paramsObject[keys[i]] = this.state.data[keys[i]];
    //     }
    //   }
    //   requestApi = URI.buildQuery(paramsObject);
    // }
    if (grantType === "implicit") {
      requestApi =
        this.state.data.authUrl + "?" + params + "&response_type=token";
    }

    if (this.props.groupId) {
      await endpointApiService.setAuthorizationData(
        this.props.groups[this.props.groupId].versionId,
        this.state.data
      );
    }

    if (this.props.location.pathname.split("/")[3] !== "new") {
      let data = {
        type: "oauth_2",
        value: this.props.oauth_2,
      };
      await endpointApiService.setAuthorizationType(
        this.props.location.pathname.split("/")[3],
        data
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
    return params;
  }

  renderInput(key) {
    let grantType = this.state.data.grantType;

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
              {this.grantTypes[grantType]}
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
        if (grantType === "authorizationCode" || grantType === "implicit") {
          return this.fetchDefaultInputField(key);
        }
        break;
      case "authUrl":
        if (grantType === "authorizationCode" || grantType === "implicit") {
          return this.fetchDefaultInputField(key);
        }
        break;
      case "state":
        if (grantType === "authorizationCode" || grantType === "implicit") {
          return this.fetchDefaultInputField(key);
        }
        break;
      case "username":
        if (grantType === "passwordCredentials") {
          return this.fetchDefaultInputField(key);
        }
        break;
      case "password":
        if (grantType === "passwordCredentials") {
          return this.fetchDefaultInputField(key);
        }
        break;
      case "accessTokenUrl":
        if (grantType === "implicit") {
          return;
        }
        return this.fetchDefaultInputField(key);
      case "clientSecret":
        if (grantType === "implicit") {
          return;
        }
        return this.fetchDefaultInputField(key);
      default:
        return this.fetchDefaultInputField(key);
    }
  }

  fetchDefaultInputField(key) {
    return (
      <div>
        <label>{this.inputFields[key]}</label>
        <input
          name={key}
          value={this.state.data[key]}
          onChange={this.handleChange.bind(this)}
        ></input>
      </div>
    );
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
