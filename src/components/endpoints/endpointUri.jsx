import React, { Component } from "react";

class EndpointUri extends Component {
  state = {
    host: {
      customHost: "",
      groupHost: "",
      versionHost: "",
      environmentHost: ""
    },
    selectedHost: "customHost",
    data: {
      requestType: "GET",
      uri: "",
      updatedUri: ""
    },
    methodList: ["GET", "POST", "PUT", "DELETE"],
    groupId: null,
    versionId: null
  };

  setMethod(method) {
    // const response = {};
    let data = { ...this.state.data };
    data.method = method;
    // this.setState({ response, data });
    this.setState({ data });
  }

  changeHost(host) {
    this.setState({ selectedHost: host });
  }

  handleChange = e => {
    const host = { ...this.state.host };
    host[e.currentTarget.name] = e.currentTarget.value;
    this.setState({ host });
  };

  fetchHost() {
    console.log(this.state.selectedHost);
    switch (this.state.selectedHost) {
      case "customHost":
        return this.state.host.customHost;
      case "environmentHost":
        return this.props.environment.variables.BASE_URL;
      case "groupHost":
        console.log(this.props.groups[this.state.groupId].host);
        return this.props.groups[this.state.groupId].host;
      case "versionHost":
        return this.props.versions[this.state.versionId].host;
    }
  }

  render() {
    if (!this.state.groupId && this.props.groupId) {
      const groupId = this.props.groupId;
      const versionId = this.props.groups[groupId].versionId;
      console.log(this.props);
      this.setState({ groupId, versionId });
    }

    return (
      <div className="endpoint-url-container">
        <div className="input-group-prepend">
          <div class="dropdown">
            <button
              class="btn btn-secondary dropdown-toggle"
              type="button"
              id="dropdownMenuButton"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              {this.state.data.method}
            </button>
            <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
              {this.state.methodList.map(methodName => (
                <button
                  className="btn"
                  onClick={() => this.setMethod(methodName)}
                >
                  {methodName}
                </button>
              ))}
            </div>
          </div>

          <div className="host-field-container">
            <input
              type="text"
              name="customHost"
              value={this.fetchHost()}
              onChange={this.handleChange}
              disabled={this.state.selectedHost !== "customHost"}
            />
            <select
              class="custom-select"
              id="host-select"
              onChange={e => this.changeHost(e.currentTarget.value)}
            >
              <option>customHost</option>
              <option>environmentHost</option>
              {this.state.groupId && <option>groupHost</option>}
              {this.state.groupId && <option>versionHost</option>}
            </select>
          </div>
          <input
            ref={this.uri}
            type="text"
            value={this.state.data.updatedUri}
            name="updatedUri"
            className="form-control form-control-lg h-auto"
            id="endpoint-url-input"
            aria-describedby="basic-addon3"
            onChange={this.handleChange}
          />
        </div>
        <div className="d-flex">
          <button
            className="btn"
            type="submit"
            id="send-request-button"
            onClick={() => this.handleSend()}
          >
            Send
          </button>
          <button
            className="btn"
            type="button"
            id="save-endpoint-button"
            onClick={() => this.handleSave()}
          >
            Save
          </button>
          {/* <button
            className="btn"
            type="button"
            id="show-code-snippets-button"
            onClick={() => this.prepareHarObject()}
          >
            Code
          </button> */}
        </div>
      </div>
    );
  }
}

export default EndpointUri;
