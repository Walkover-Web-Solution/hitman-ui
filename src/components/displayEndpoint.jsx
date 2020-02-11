import React, { Component } from "react";
import endpointService from "../services/endpointService";
import JSONPretty from "react-json-pretty";
import { Dropdown } from "react-bootstrap";

class DisplayEndpoint extends Component {
  uri = React.createRef();
  body = React.createRef();
  name = React.createRef();

  state = {
    data: {
      name: "",
      method: "GET",
      body: "",
      uri: ""
    },
    response: {},
    endpoint: {},
    groups: [],
    versions: [],
    groupId: "",
    title: ""
  };

  componentDidMount() {
    let { endpoint } = this.props.location;
    this.setState({ endpoint });
  }

  handleChange = e => {
    let data = { ...this.state.data };
    data[e.currentTarget.name] = e.currentTarget.value;
    this.setState({ data });
  };

  handleSubmit = async () => {
    let host = "";
    if (this.state.endpoint) {
      const groupIndex = this.state.groups.findIndex(
        g => g.id == this.state.endpoint.groupId
      );
      host = this.state.groups[groupIndex].host;
      if (host == "") {
        const versionId = this.state.groups[groupIndex].versionId;
        const versionIndex = this.state.versions.findIndex(
          v => v.id == versionId
        );
        host = this.state.versions[versionIndex].host;
      }
    } else if (
      this.props.location.groupId &&
      this.state.endpoint == undefined
    ) {
      const groupIndex = this.state.groups.findIndex(
        g => g.id == this.props.location.groupId
      );
      host = this.state.groups[groupIndex].host;
      if (host == "") {
        const versionId = this.state.groups[groupIndex].versionId;
        const versionIndex = this.state.versions.findIndex(
          v => v.id == versionId
        );
        host = this.state.versions[versionIndex].host;
      }
    }

    const api = host + this.uri.current.value;
    if (this.body.current) {
      this.state.data.body = this.body.current.value;
      try {
        if (this.state.data.body != "")
          this.state.data.body = JSON.parse(this.state.data.body);
      } catch (error) {
        console.log(error);
      }
    }

    const { data: response } = await endpointService.apiTest(
      api,
      this.state.data.method,
      this.state.data.body
    );
    this.setState({ response });
  };

  handleAddEndpoint = async e => {
    const name = this.name.current.value;
    const uri = this.uri.current.value;
    const endpoint = {
      uri,
      name: name,
      requestType: this.state.data.method
    };
    console.log("title", this.state.title);
    if (this.state.title == "Add New Endpoint") {
      this.props.history.push({
        pathname: `/dashboard/collections`,
        title: "Add Endpoint",
        endpoint: endpoint,
        groupId: this.state.groupId,
        versions: this.state.versions
      });
    } else if (this.state.title == "update endpoint") {
      const { data: response } = await endpointService.updateEndpoint(
        this.state.endpoint.id,
        endpoint
      );
    }
    // if (this.state.title == "Add New Endpoint") {
    //   console.log("addd", this.state.title);

    //   const { data } = await endpointService.saveEndpoint(
    //     this.state.groupId,
    //     endpoint
    //   );
    //   this.state.title = "update";
    // } else if ((this.state.title = "update")) {
    //   console.log("updat", this.state.title);

    //   const { data: response } = await endpointService.updateEndpoint(
    //     this.state.endpoint.id,
    //     endpoint
    //   );
    // }
  };

  setMethod(method) {
    const response = {};
    let data = { ...this.state.data };
    data.method = method;
    this.setState({ response, data });
  }
  render() {
    if (this.props.location.groups) {
      this.state.groups = this.props.location.groups;
    }
    if (this.props.location.title == "Add New Endpoint") {
      const data = {
        name: "",
        method: "GET",
        body: "",
        uri: ""
      };
      const response = "";
      this.state.data = data;
      this.state.response = response;
      this.state.groupId = this.props.location.groupId;
      this.state.title = this.props.location.title;
      this.props.history.push({ groups: null });
    }

    if (this.props.location.versions) {
      this.state.versions = this.props.location.versions;
    }

    if (
      this.props.location.title == "update endpoint" &&
      this.props.location.endpoint
    ) {
      let { endpoint } = this.props.location;
      this.setState({
        data: {
          method: endpoint.requestType,
          uri: endpoint.uri,
          name: endpoint.name
        },
        endpoint,
        title: "update endpoint"
      });

      this.props.history.push({ endpoint: null });
    }

    return (
      <div>
        <div class="input-group flex-nowrap">
          <div class="input-group-prepend">
            <span class="input-group-text" id="addon-wrapping">
              Endpoint Name :
            </span>
          </div>
          <input
            type="text"
            class="form-control"
            aria-label="Username"
            aria-describedby="addon-wrapping"
            name="name"
            ref={this.name}
            value={this.state.data.name}
            onChange={this.handleChange}
          />
        </div>
        <br></br>
        <div class="input-group mb-3">
          <div class="input-group-prepend">
            <span class="input-group-text" id="basic-addon3">
              <div class="dropdown">
                <div className="Environment Dropdown">
                  <Dropdown className="float-light">
                    <Dropdown.Toggle variant="default" id="dropdown-basic">
                      {this.state.data.method}
                    </Dropdown.Toggle>

                    <Dropdown.Menu alignRight>
                      <Dropdown.Item onClick={() => this.setMethod("GET")}>
                        GET
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => this.setMethod("POST")}>
                        POST
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => this.setMethod("PUT")}>
                        PUT
                      </Dropdown.Item>

                      <Dropdown.Item onClick={() => this.setMethod("DELETE")}>
                        DELETE
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </div>
            </span>
            <span
              class="form-control form-control-lg"
              class="input-group-text"
              id="basic-addon3"
            >
              BASE_URL
            </span>
          </div>
          <input
            ref={this.uri}
            type="text"
            value={this.state.data.uri}
            name="uri"
            class="form-control form-control-lg"
            id="basic-url"
            aria-describedby="basic-addon3"
            onChange={this.handleChange}
          />
          <button
            class="btn btn-outline-secondary"
            type="submit"
            id="button-addon2"
            onClick={() => this.handleSubmit()}
          >
            Send
          </button>
          <button
            class="btn btn-outline-secondary"
            type="button"
            id="button-addon2"
            onClick={() => this.handleAddEndpoint()}
          >
            Save
          </button>
        </div>

        {this.state.data.method == "POST" || this.state.data.method == "PUT" ? (
          <textarea
            class="form-control"
            ref={this.body}
            name="body"
            id="body"
            rows="8"
          ></textarea>
        ) : null}

        <JSONPretty
          themeClassName="custom-json-pretty"
          data={this.state.response}
        />
      </div>
    );
  }
}

export default DisplayEndpoint;
