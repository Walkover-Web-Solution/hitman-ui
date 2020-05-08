import React, { Component } from "react";
import "./endpoints.scss";
import TokenGenerator from "./newTokenGenerator";
import AccessTokenManager from "./displayTokenManager";
class Authorization extends Component {
  state = {
    basicAuth: {
      username: "",
      password: "",
    },
    oauth_2: {
      authorizationAddedTo: "Request Headers",
      access_token: "",
    },
    authorizationType: "noAuth",
  };

  componentDidMount() {
    this.authResponses = [];
  }
  componentDidUpdate() {
    this.fetchAuthorizationResponse();
  }

  fetchAuthorizationResponse() {
    if (
      this.authResponses.length === 0 &&
      Object.keys(this.props.versions).length !== 0 &&
      Object.keys(this.props.groups).length !== 0 &&
      this.props.groupId !== undefined &&
      this.props.groupId !== null
    ) {
      this.authResponses = this.props.versions[
        this.props.groups[this.props.groupId].versionId
      ].authorizationResponse;
      if (this.authResponses === null) {
        this.authResponses = [];
      }
    }
  }

  setAuthorizationType(type) {
    let value = {};
    switch (type) {
      case "basicAuth":
        value = {
          username: "",
          password: "",
        };
        this.setState({ authorizationType: "basicAuth" });
        this.props.set_authoriztaion_params(
          "",
          "access_token",
          "authorizationFlag"
        );
        this.props.set_authorization_headers("", "Authorization");
        this.props.set_authoriztaion_type(type, value);
        break;
      case "noAuth":
        this.setState({ authorizationType: "noAuth" });
        this.props.set_authoriztaion_params(
          "",
          "access_token",
          "authorizationFlag"
        );
        this.props.set_authorization_headers("noAuth", "Authorization");
        this.props.set_authoriztaion_type("", "");
        break;
      case "oauth_2":
        value = this.state.oauth_2;
        this.setState({ authorizationType: "oauth_2" });
        if (this.state.oauth_2.authorizationAddedTo === "Request Headers") {
          this.props.set_authorization_headers("", "Authorization");
        } else {
          this.props.set_authoriztaion_params("", "access_token");
        }
        this.props.set_authoriztaion_type(type, value);
        break;
      default:
        break;
    }
  }

  authorizationTypes = {
    noAuth: "No Auth",
    basicAuth: "Basic Auth",
    oauth_2: "OAuth 2.0",
  };

  handleChange(e) {
    let basicAuth = { ...this.state.basicAuth };
    if (e.currentTarget.name === "username") {
      basicAuth.username = e.currentTarget.value;
      this.generateEncodedValue(
        e.currentTarget.value,
        this.state.basicAuth.password
      );
    } else if (e.currentTarget.name === "password") {
      basicAuth.password = e.currentTarget.value;
      this.generateEncodedValue(
        this.state.basicAuth.username,
        e.currentTarget.value
      );
    }
    this.setState({ basicAuth });
  }

  generateEncodedValue(username, password) {
    let value = {
      username,
      password,
    };
    this.props.set_authoriztaion_type("basicAuth", value);
    let encodedValue = new Buffer(username + ":" + password).toString("base64");
    this.props.set_authorization_headers(encodedValue, "Authorization");
  }

  setAuthorizationAddedTo(key) {
    let oauth_2 = { ...this.state.oauth_2 };
    oauth_2.authorizationAddedTo = key;
    this.setState({ oauth_2 });

    if (key === "Request Headers") {
      this.props.set_authorization_headers("", "Authorization");
      this.props.set_authoriztaion_params(
        "",
        "access_token",
        "authorizationFlag"
      );
      this.props.set_authoriztaion_type("oauth_2", oauth_2);
    } else {
      this.props.set_authorization_headers(
        "",
        "Authorization",
        "authorizationFlag"
      );
      this.props.set_authoriztaion_params("", "access_token");
      this.props.set_authoriztaion_type("oauth_2", oauth_2);
    }
  }

  getNewAccessTokenModal() {
    this.setState({ getNewAccessToken: true });
  }

  closeGetNewAccessTokenModal() {
    this.setState({ getNewAccessToken: false });
  }

  openManageTokenModel() {
    console.log("openManageTokenModel");
    this.setState({ openManageTokenModel: true });
  }

  closeManageTokenModel() {
    this.setState({ openManageTokenModel: false });
  }
  render() {
    if (this.props.authorizationType) {
      const authType = this.props.authorizationType.type;
      if (authType !== this.state.authorizationType) {
        this.setState({
          authorizationType: authType,
        });
        if (authType === "basicAuth") {
          this.setState({ basicAuth: this.props.authorizationType.value });
        }
        if (authType === "oauth_2") {
          this.setState({ oauth_2: this.props.authorizationType.value });
        }
      }
    }

    return (
      <div className="authorization-panel">
        {this.state.getNewAccessToken === true && (
          <TokenGenerator
            {...this.props}
            groupId={this.props.groupId}
            show={true}
            onHide={() => this.closeGetNewAccessTokenModal()}
            title="GET NEW ACCESS TOKEN"
          ></TokenGenerator>
        )}
        {this.state.openManageTokenModel === true && (
          <AccessTokenManager
            {...this.props}
            authResponses={this.authResponses}
            show={true}
            onHide={() => this.closeManageTokenModel()}
            title="MANAGE ACCESS TOKEN"
          ></AccessTokenManager>
        )}
        <div className="authorization-selector-wrapper">
          <div className="auth-selector-container">
            <label>TYPE</label>
            <div className="dropdown">
              <button
                className="btn dropdown-toggle"
                id="dropdownMenuButton"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                {this.state.authorizationType === "noAuth"
                  ? this.authorizationTypes["noAuth"]
                  : this.authorizationTypes[this.state.authorizationType]}
              </button>
              <div
                className="dropdown-menu"
                aria-labelledby="dropdownMenuButton"
              >
                {Object.keys(this.authorizationTypes).map((key) => (
                  <button
                    className="btn custom-request-button"
                    onClick={() => this.setAuthorizationType(key)}
                    key={key}
                  >
                    {this.authorizationTypes[key]}
                  </button>
                ))}
              </div>
            </div>
            <br></br>
            {this.state.authorizationType === "oauth_2" && (
              <div>
                <label>Add authorization data to</label>
                <div className="dropdown">
                  <button
                    className="btn dropdown-toggle"
                    id="dropdownMenuButton"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    {this.state.oauth_2.authorizationAddedTo}
                  </button>
                  <div
                    className="dropdown-menu"
                    aria-labelledby="dropdownMenuButton"
                  >
                    <button
                      className="btn custom-request-button"
                      onClick={() =>
                        this.setAuthorizationAddedTo("Request Headers")
                      }
                    >
                      Request Headers
                    </button>
                    <button
                      className="btn custom-request-button"
                      onClick={() =>
                        this.setAuthorizationAddedTo("Request URL")
                      }
                    >
                      Request URL
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="authorization-editor-wrapper">
          {this.state.authorizationType === "noAuth" &&
            "This request does not use any authorization."}
        </div>

        <div className="authorization-editor-wrapper">
          {this.state.authorizationType === "basicAuth" && (
            <form>
              <div className="input-field-wrapper">
                <label>Username</label>
                <input
                  name="username"
                  value={this.state.basicAuth.username}
                  onChange={this.handleChange.bind(this)}
                ></input>
              </div>

              <div className="input-field-wrapper">
                <label>Password</label>
                <input
                  name="password"
                  value={this.state.basicAuth.password}
                  onChange={this.handleChange.bind(this)}
                ></input>
              </div>
            </form>
          )}
          {this.state.authorizationType === "oauth_2" && (
            <form>
              <div className="input-field-wrapper">
                <label>Access Token</label>
                <input
                  value={this.props.accessToken}
                  name="accessToken"
                ></input>
              </div>

              <div className="dropdown">
                <button
                  className="btn dropdown-toggle"
                  id="dropdownMenuButton"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  Availabale Tokens
                </button>
                <div
                  className="dropdown-menu"
                  aria-labelledby="dropdownMenuButton"
                >
                  {this.authResponses.map((response) => (
                    <button
                      type="button"
                      className="btn custom-request-button"
                      // onClick={() => this.setAuthorizationType(key)}
                    >
                      {response.tokenName}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="btn custom-request-button"
                    onClick={() => this.openManageTokenModel()}
                  >
                    Manage Tokens
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => this.getNewAccessTokenModal()}
              >
                Get New Aceess Token
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }
}

export default Authorization;
