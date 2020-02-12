import React, { Component } from "react";
import endpointService from "../services/endpointService";
import JSONPretty from "react-json-pretty";
import { Dropdown } from "react-bootstrap";
import { toast } from "react-toastify";

class DisplayEndpoint extends Component {
  uri = React.createRef();
  body = React.createRef();
  name = React.createRef();

  state = {
    data: {
      name: "",
      method: "GET",
      body: {},
      uri: "",
      host: ""
    },
    response: {},
    endpoint: {},
    groups: [],
    versions: [],
    groupId: "",
    title: "",
    flagResponse: false
  };

  // componentDidMount() {
  //   let data = {}
  //   if (!this.props.location.endpoint) {
  //     const endpointId = this.props.location.pathname.split('/')[4]
  //     console.log(endpointId)
  //     let { data: endpoint } = await endpointService.getEndpoint(endpointId)
  //     const {  name,method,uri,host } = endpoint
  //     data = {
  //       name,method,uri,host
  //     }
  //     this.setState({ data })
  //   }
  // }

  handleChange = e => {
    let data = { ...this.state.data };
    data[e.currentTarget.name] = e.currentTarget.value;
    this.setState({ data });
  };

  findHost() {
    let host = "";
    if (this.state.data.host) {
      return this.state.data.host;
    } else if (Object.keys(this.state.endpoint).length) {
      host = this.state.groups[this.state.endpoint.groupId].host;
      if (host == "") {
        const versionId = this.state.groups[this.state.endpoint.groupId]
          .versionId;
        host = this.state.versions[versionId].host;
      }
    } else if (this.state.groupId && !Object.keys(this.state.endpoint).length) {
      host = this.state.groups[this.state.groupId].host;
      if (host == "") {
        const versionId = this.state.groups[this.state.groupId].versionId;
        host = this.state.versions[versionId].host;
      }
    }
    return host;
  }
  handleSend = async () => {
    this.state.flagResponse = true;
    const host = this.findHost();
    const api = host + this.uri.current.value;
    let body = {};
    if (this.state.data.method == "POST" || this.state.data.method == "PUT") {
      body = this.body.current.value;
      try {
        this.state.data.body = JSON.parse(body);
      } catch {
        toast.error("In POST and PUT body cannot be empty");
      }
    }

    const { data: response } = await endpointService.apiTest(
      api,
      this.state.data.method,
      this.state.data.body
    );
    this.setState({ response });
  };

  handleSave = async e => {
    let body = {};
    if (this.state.data.method == "POST" || this.state.data.method == "PUT")
      body = JSON.parse(this.body.current.value);
    const endpoint = {
      uri: this.uri.current.value,
      name: this.name.current.value,
      requestType: this.state.data.method,
      body: body
    };
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
      let endpoint = { ...this.props.location.endpoint };

      this.setState({
        data: {
          method: endpoint.requestType,
          uri: endpoint.uri,
          name: endpoint.name,
          body: JSON.stringify(endpoint.body, null, 4)
        },
        title: "update endpoint"
      });
      this.state.endpoint = endpoint;
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
              class="input-group-text d-flex p-0"
              id="basic-addon3"
            >
              <input
                ref={this.host}
                type="text"
                name="host"
                className="form-group h-100 m-0"
                style={{
                  border: "none",
                  borderRadius: 0,
                  backgroundColor: "#F8F9F9"
                }}
                onChange={this.handleChange}
                value={this.findHost()}
              />
            </span>
          </div>
          <input
            ref={this.uri}
            type="text"
            value={this.state.data.uri}
            name="uri"
            class="form-control form-control-lg h-auto"
            id="basic-url"
            aria-describedby="basic-addon3"
            onChange={this.handleChange}
          />
          <div className="d-flex">
            <button
              class="btn btn-secondary ml-3"
              type="submit"
              id="button-addon2"
              onClick={() => this.handleSend()}
            >
              Send
            </button>
            <button
              class="btn btn-secondary ml-3"
              type="button"
              id="button-addon2"
              onClick={() => this.handleSave()}
            >
              Save
            </button>
          </div>
        </div>
        <div>
          <ul class="nav nav-pills mb-3" id="pills-tab" role="tablist">
            <li class="nav-item">
              <a
                class="nav-link active"
                id="pills-params-tab"
                data-toggle="pill"
                href="#pills-home"
                role="tab"
                aria-controls="pills-home"
                aria-selected="true"
              >
                Params
              </a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                id="pills-headers-tab"
                data-toggle="pill"
                href="#pills-profile"
                role="tab"
                aria-controls="pills-profile"
                aria-selected="false"
              >
                Headers
              </a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                id="pills-body-tab"
                data-toggle="pill"
                href="#pills-contact"
                role="tab"
                aria-controls="pills-contact"
                aria-selected="false"
              >
                Body
              </a>
            </li>
          </ul>
          <div class="tab-content" id="pills-tabContent">
            <div
              class="tab-pane fade show active"
              id="pills-home"
              role="tabpanel"
              aria-labelledby="pills-params-tab"
            >
              ...
            </div>
            <div
              class="tab-pane fade"
              id="pills-profile"
              role="tabpanel"
              aria-labelledby="pills-headers-tab"
            >
              ...
            </div>
            <div
              class="tab-pane fade"
              id="pills-contact"
              role="tabpanel"
              aria-labelledby="pills-body-tab"
            >
          <textarea
            class="form-control"
            ref={this.body}
            name="body"
            id="body"
            rows="8"
            name="body"
            onChange={this.handleChange}
            value={this.state.data.body}
          ></textarea>
       
            </div>
          </div>
        </div>
       

        {this.state.flagResponse == true ? (
          <JSONPretty
            themeClassName="custom-json-pretty"
            data={this.state.response}
          />
        ) : null}
      </div>
    );
  }
}

export default DisplayEndpoint;
