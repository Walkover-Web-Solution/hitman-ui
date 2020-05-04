import React, { Component } from "react";

class Authorization extends Component {
  state = {
    basicAuth: {
      username: "",
      password: "",
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
      default:
        break;
    }
  }

  authorizationTypes = {
    noAuth: "No Auth",
    basicAuth: "Basic Auth",
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

  render() {
    return (
      <div>
        <label>TYPE</label>
        <div className="dropdown">
          <button
            className="btn dropdown-toggle"
            type="button"
            id="dropdownMenuButton"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            {this.state.authorizationType === "noAuth"
              ? this.authorizationTypes["noAuth"]
              : this.authorizationTypes[this.state.authorizationType]}
          </button>
          <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
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

        {this.state.authorizationType === "noAuth" &&
          "This request does not use any authorization"}

        {this.state.authorizationType === "basicAuth" && (
          <form>
            <label>Username</label>
            <input
              name="username"
              onChange={this.handleChange.bind(this)}
            ></input>

            <label>Password</label>
            <input
              name="password"
              onChange={this.handleChange.bind(this)}
            ></input>
          </form>
        )}
      </div>
    );
  }
}

export default Authorization;
