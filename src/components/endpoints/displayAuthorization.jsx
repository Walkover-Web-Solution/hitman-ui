import React, { Component } from "react";
import "./endpoints.scss";
import TokenGenerator from "./newTokenGenerator";

class Authorization extends Component {
  state = {
    basicAuth: {
      username: "",
      password: "",
    },
    oauth_2: {
      authorizationAddedTo: "",
    },
    authorizationType: "noAuth",
  };

  setAuthorizationType(type) {
    switch (type) {
      case "basicAuth":
        this.setState({ authorizationType: "basicAuth" });
        this.props.set_authorization_headers("", "Authorization");
        break;
      case "noAuth":
        this.setState({ authorizationType: "noAuth" });
        this.props.set_authorization_headers("noAuth", "Authorization");
        break;
      case "oauth_2":
        this.setState({ authorizationType: "oauth_2" });
        this.props.set_authorization_headers("", "Authorization");
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
    if (e.currentTarget.name === "username") {
      this.setState({ username: e.currentTarget.value });
      this.generateEncodedValue(e.currentTarget.value, this.state.password);
    } else if (e.currentTarget.name === "password") {
      this.setState({ password: e.currentTarget.value });
      this.generateEncodedValue(this.state.username, e.currentTarget.value);
    }
  }

  generateEncodedValue(username, password) {
    let encodedValue = new Buffer(username + ":" + password).toString("base64");
    this.props.set_authorization_headers(encodedValue, "Authorization");
  }

  setAuthorizationAddedTo(key) {
    if (key === "headers") {
    } else if (key === "params") {
    }
  }

  getNewAccessTokenModal() {
    this.setState({ getNewAccessToken: true });
  }
  closeGetNewAccessTokenModal() {
    this.setState({ getNewAccessToken: false });
  }
  render() {
    return (
      <div className="authorization-panel">
        {this.state.getNewAccessToken === true && (
          <TokenGenerator
            {...this.props}
            show={true}
            onHide={() => this.closeGetNewAccessTokenModal()}
            title="GET NEW ACCESS TOKEN"
          ></TokenGenerator>
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
                    Request Headers
                  </button>
                  <div
                    className="dropdown-menu"
                    aria-labelledby="dropdownMenuButton"
                  >
                    <button
                      className="btn custom-request-button"
                      onClick={() => this.setAuthorizationAddedTo("headers")}
                    >
                      Request Headers{" "}
                    </button>
                    <button
                      className="btn custom-request-button"
                      onClick={() => this.setAuthorizationAddedTo("params")}
                    >
                      Request URL{" "}
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
                  onChange={this.handleChange.bind(this)}
                ></input>
              </div>

              <div className="input-field-wrapper">
                <label>Password</label>
                <input
                  name="password"
                  onChange={this.handleChange.bind(this)}
                ></input>
              </div>
            </form>
          )}
          {this.state.authorizationType === "oauth_2" && (
            <form>
              <div className="input-field-wrapper">
                <label>Access Token</label>
                <input name="accessToken"></input>
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
