import React, { Component } from "react";
import { Dropdown } from "react-bootstrap";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { CopyToClipboard } from "react-copy-to-clipboard";
import JSONPretty from "react-json-pretty";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import shortId from "shortid";
import "../../css/editableDropdown.css";
import DisplayHeaders from "./displayHeaders";
import ParamsComponent from "./displayParams";
import { addEndpoint, updateEndpoint } from "./endpointsActions";
import endpointService from "./endpointService";
const status = require("http-status");
var JSONPrettyMon = require("react-json-pretty/dist/monikai");
var URI = require("urijs");

const mapDispatchToProps = dispatch => {
  return {
    addEndpoint: (newEndpoint, groupId) =>
      dispatch(addEndpoint(newEndpoint, groupId)),
    updateEndpoint: editedEndpoint => dispatch(updateEndpoint(editedEndpoint))
  };
};

class DisplayEndpoint extends Component {
  uri = React.createRef();
  body = React.createRef();
  name = React.createRef();
  paramKey = React.createRef();
  BASE_URL_Value = React.createRef();

  state = {
    data: {
      name: "",
      method: "GET",
      body: {},
      uri: "",
      updatedUri: "",
      host: ""
    },
    environment: {},
    startTime: "",
    timeElapsed: "",
    response: {},
    endpoint: {},
    groups: {},
    versions: {},
    groupId: "",
    title: "",
    selectedHost: "",
    onChangeFlag: false,
    flagResponse: false,
    rawResponse: false,
    prettyResponse: false,
    previewResponse: false,
    flagInvalidResponse: true,
    responseString: "",
    originalHeaders: [],
    originalParams: []
  };
  handleChange = e => {
    let data = { ...this.state.data };
    if (e.currentTarget.name === "host") {
      this.state.onChangeFlag = true;
    }
    data[e.currentTarget.name] = e.currentTarget.value;
    data.uri = e.currentTarget.value;
    if (e.currentTarget.name === "updatedUri") {
      let keys = [];
      let values = [];
      let description = [];
      let originalParams = this.state.originalParams;
      let updatedUri = e.currentTarget.value.split("?")[1];
      let result = URI.parseQuery(updatedUri);

      if (Object.keys(result).length === 0) {
        this.setState({ originalParams: keys });
      }
      for (let i = 0; i < Object.keys(result).length; i++) {
        keys.push(Object.keys(result)[i]);
      }
      for (let i = 0; i < keys.length; i++) {
        values.push(result[keys[i]]);
        if (this.state.originalParams[i]) {
          if (this.state.originalParams[i].key === keys[i]) {
            description[i] = this.state.originalParams[i].description;
          } else {
            description[i] = "";
          }
        }
      }
      originalParams = this.makeOriginalParams(keys, values, description);
      this.setState({ originalParams });
    }
    this.setState({ data });
  };

  makeOriginalParams(keys, values, description) {
    let originalParams = [];
    for (let i = 0; i < keys.length; i++) {
      originalParams[i] = {
        key: keys[i],
        value: values[i],
        description: description[i]
      };
    }
    return originalParams;
  }

  findHost(hostJson) {
    let host = "";
    if (this.customHost === true) {
      host = this.BASE_URL;
      return host;
    }
    host = hostJson.variableHost;
    if (host === "") {
      host = hostJson.groupHost;
      if (host === "") {
        host = hostJson.versionHost;
      }
    }
    let data = { ...this.state.data };
    data.host = host;
    this.setState({ data });
    return host;
  }

  replaceVariables(str) {
    str = str.toString();
    const regexp = /{{(\w+)}}/g;
    let match = regexp.exec(str);
    let variables = [];
    if (match === null) return str;
    if (!this.props.environment.variables) {
      return str.replace(regexp, "");
    }
    do {
      variables.push(match[1]);
    } while ((match = regexp.exec(str)) !== null);
    for (let i = 0; i < variables.length; i++) {
      if (!this.props.environment.variables[variables[i]]) {
        str = str.replace(`{{${variables[i]}}}`, "");
      } else if (this.props.environment.variables[variables[i]].currentValue) {
        str = str.replace(
          `{{${variables[i]}}}`,
          this.props.environment.variables[variables[i]].currentValue
        );
      } else if (this.props.environment.variables[variables[i]].initialValue) {
        str = str.replace(
          `{{${variables[i]}}}`,
          this.props.environment.variables[variables[i]].initialValue
        );
      } else {
        str = str.replace(`{{${variables[i]}}}`, "");
      }
    }
    return str;
  }

  replaceVariablesInJson(json) {
    const keys = Object.keys(json);
    for (let i = 0; i < keys.length; i++) {
      json[keys[i]] = this.replaceVariables(json[keys[i]]);
      const updatedKey = this.replaceVariables(keys[i]);
      if (updatedKey !== keys[i]) {
        json[updatedKey] = json[keys[i]];
        delete json[keys[i]];
      }
    }
    return json;
  }

  parseBody(data) {
    let { method, body } = data;
    if (method === "POST" || method === "PUT") {
      try {
        body = JSON.parse(this.body.current.value);
        return body;
      } catch (error) {
        toast.error("Invalid Body");
        return body;
      }
    }
    return {};
  }

  handleErrorResponse(error) {
    if (error.response) {
      let response = {
        status: error.response.status,
        data: error.response.data
      };
      this.setState({ response });
    } else {
      let flagInvalidResponse = false;
      this.setState({ flagInvalidResponse });
    }
  }

  async handleApiCall(api, body, headerJson) {
    let responseJson = {};
    try {
      let header = this.replaceVariablesInJson(headerJson);
      responseJson = await endpointService.apiTest(
        api,
        this.state.data.method,
        body,
        header
      );
      const response = { ...responseJson };

      if (responseJson.status === 200) this.setState({ response });
      this.responseTime();
    } catch (error) {
      this.handleErrorResponse(error);
    }
  }

  handleSend = async () => {
    let startTime = new Date().getTime();
    let prettyResponse = true;
    this.setState({ startTime, prettyResponse });
    let response = {};
    const headersData = this.doSubmitHeader();
    this.setState({ response });
    this.state.flagResponse = true;
    const host = this.state.data.host;
    let api = host + this.uri.current.value;
    api = this.replaceVariables(api);
    let body = this.parseBody(this.state.data);
    let headerJson = {};
    Object.keys(headersData).map(header => {
      headerJson[headersData[header].key] = headersData[header].value;
    });

    this.handleApiCall(api, body, headerJson);
  };

  handleSave = async e => {
    let body = this.parseBody(this.state.data);
    const headersData = this.doSubmitHeader();
    const updatedParams = this.doSubmitParam();
    const endpoint = {
      uri: this.uri.current.value,
      name: this.name.current.value,
      requestType: this.state.data.method,
      body: body,
      headers: headersData,
      params: updatedParams
    };
    if (this.customHost === true) {
      endpoint.BASE_URL = this.BASE_URL_Value.current.value;
    } else {
      endpoint.BASE_URL = null;
    }
    if (endpoint.name === "" || endpoint.uri === "")
      toast.error("Please Enter all the fields");
    else if (this.state.title === "Add New Endpoint") {
      endpoint.requestId = shortId.generate();
      this.props.addEndpoint(endpoint, this.state.groupId);
    } else if (this.state.title === "update endpoint") {
      this.props.updateEndpoint({ ...endpoint, id: this.state.endpoint.id });
    }
  };

  doSubmitHeader() {
    let originalHeaders = [...this.state.originalHeaders];
    let updatedHeaders = {};
    for (let i = 0; i < originalHeaders.length; i++) {
      if (originalHeaders[i].key === "") {
        continue;
      } else {
        updatedHeaders[originalHeaders[i].key] = {
          key: originalHeaders[i].key,
          value: originalHeaders[i].value,
          description: originalHeaders[i].description
        };
      }
    }
    const endpoint = { ...this.state.endpoint };
    endpoint.headers = { ...updatedHeaders };
    this.setState({
      originalHeaders,
      endpoint
    });
    return updatedHeaders;
  }

  setMethod(method) {
    const response = {};
    let data = { ...this.state.data };
    data.method = method;
    this.setState({ response, data });
  }

  handleUpdateHeader(originalHeaders) {
    this.setState({ originalHeaders });
  }

  propsFromChild(name, value) {
    if (name === "originalParams") {
      this.handleUpdateUri(value);
      this.setState({ originalParams: value });
    }
    if (name === "handleAddParam") {
      this.setState({ originalParams: value });
    }
  }

  handleUpdateUri(originalParams) {
    if (originalParams.length === 0) {
      let updatedUri = this.state.data.updatedUri.split("?")[0];
      let data = { ...this.state.data };
      data.updatedUri = updatedUri;
      this.setState({ data });
      return;
    }
    let originalUri = this.state.data.uri.split("?")[0] + "?";
    let parts = {};
    for (let i = 0; i < originalParams.length; i++) {
      if (originalParams[i].key.length !== 0)
        parts[originalParams[i].key] = originalParams[i].value;
    }
    let updatedUri = URI.buildQuery(parts);
    updatedUri = originalUri + URI.decode(updatedUri);
    let data = { ...this.state.data };
    if (Object.keys(parts).length === 0) {
      data.updatedUri = updatedUri.split("?")[0];
    } else {
      data.updatedUri = updatedUri;
    }
    this.setState({ data });
  }

  doSubmitParam() {
    let originalParams = [...this.state.originalParams];
    let updatedParams = {};
    for (let i = 0; i < originalParams.length; i++) {
      if (originalParams[i].key === "") {
        continue;
      } else {
        updatedParams[originalParams[i].key] = {
          value: originalParams[i].value,
          description: originalParams[i].description
        };
      }
    }
    const endpoint = { ...this.state.endpoint };
    endpoint.params = { ...updatedParams };
    this.setState({
      originalParams,
      endpoint
    });
    return updatedParams;
  }

  responseTime() {
    let timeElapsed = new Date().getTime() - this.state.startTime;
    this.setState({ timeElapsed });
  }

  rawDataResponse() {
    this.setState({
      rawResponse: true,
      previewResponse: false,
      prettyResponse: false,
      responseString: JSON.stringify(this.state.response)
    });
  }

  prettyDataResponse() {
    this.setState({
      rawResponse: false,
      previewResponse: false,
      prettyResponse: true,
      responseString: JSON.stringify(this.state.response)
    });
  }

  previewDataResponse() {
    this.setState({
      rawResponse: false,
      previewResponse: true,
      prettyResponse: false
    });
  }

  fillDropdownValue(hostJson) {
    this.dropdownHost["variable"].value = hostJson.variableHost;
    this.dropdownHost["group"].value = hostJson.groupHost;
    this.dropdownHost["version"].value = hostJson.versionHost;
  }
  dropdownHost = {
    variable: { name: "Variable", value: "" },
    group: { name: "Group", value: "" },
    version: { name: "Version", value: "" },
    custom: { name: "Custom", value: "custom" }
  };

  dropdownRequestType = {
    get: { name: "GET" },
    post: { name: "POST" },
    put: { name: "PUT" },
    delete: { name: "DELETE" }
  };

  setDropdownValue(key) {
    let host = "";
    if (key === "custom") {
      host = "";
      this.customHost = true;
    } else {
      this.customHost = false;
      host = this.dropdownHost[key].value;
    }
    let data = { ...this.state.data };
    data.host = host;
    this.setState({
      selectedHost: key,
      data
    });
  }

  handleDropdownChange = e => {
    let data = { ...this.state.data };
    data[e.currentTarget.name] = e.currentTarget.value;
    data.host = e.currentTarget.value;
    this.setState({ data });
  };

  fetchHosts(location, environment) {
    let variableHost = "";
    if (environment.variables && environment.variables.BASE_URL) {
      variableHost = environment.variables.BASE_URL.currentValue;
    }
    const { groupId, groups, versions } = location;
    const { versionId, host: groupHost } = groups[groupId];
    const { host: versionHost } = versions[versionId];
    let hostJson = {
      variableHost,
      groupHost,
      versionHost
    };
    return hostJson;
  }

  fetchoriginalParams(params) {
    let originalParams = [];
    for (let i = 0; i < Object.keys(params).length; i++) {
      originalParams[i] = {
        key: Object.keys(params)[i],
        value: params[Object.keys(params)[i]].value,
        description: params[Object.keys(params)[i]].description
      };
    }
    return originalParams;
  }

  render() {
    if (this.props.location.title === "Add New Endpoint") {
      this.customHost = false;
      const hostJson = this.fetchHosts(
        this.props.location,
        this.props.environment
      );
      this.fillDropdownValue(hostJson);
      this.host = this.findHost(hostJson);
      this.setState({
        data: {
          name: "",
          method: "GET",
          body: JSON.stringify({}, null, 4),
          uri: "",
          updatedUri: "",
          host: this.host
        },
        startTime: "",
        timeElapsed: "",
        response: {},
        endpoint: {},
        groups: this.props.location.groups,
        versions: this.props.location.versions,
        groupId: this.props.location.groupId,
        title: this.props.location.title,
        selectedHost: "",
        onChangeFlag: false,
        flagResponse: false,
        rawResponse: false,
        prettyResponse: false,
        previewResponse: false,
        flagInvalidResponse: true,
        responseString: "",
        copied: false,
        originalHeaders: [],
        originalParams: []
      });
      this.props.history.push({ groups: null });
    }

    if (
      this.props.location.title === "update endpoint" &&
      this.props.location.endpoint
    ) {
      this.BASE_URL = this.props.location.endpoint.BASE_URL;
      if (this.props.location.endpoint.BASE_URL) {
        this.setDropdownValue("custom");
      } else {
        this.state.selectedHost = "";
        this.customHost = false;
      }
      let endpoint = { ...this.props.location.endpoint };
      const hostJson = this.fetchHosts(
        this.props.location,
        this.props.environment
      );
      this.fillDropdownValue(hostJson);
      this.host = this.findHost(hostJson);

      //To fetch originalParams from Params
      let originalParams = this.fetchoriginalParams(
        this.props.location.endpoint.params
      );

      this.state.prettyResponse = false;
      this.state.rawResponse = false;
      this.state.previewResponse = false;
      this.state.endpoint = endpoint;
      this.setState({
        data: {
          method: endpoint.requestType,
          uri: endpoint.uri,
          updatedUri: endpoint.uri,
          name: endpoint.name,
          body: JSON.stringify(endpoint.body, null, 4),
          host: this.host
        },
        title: "update endpoint",
        response: {},
        groupId: this.props.location.groupId,
        onChangeFlag: false,
        versions: this.props.location.versions,
        groups: this.props.location.groups,
        originalParams
      });
      this.props.history.push({ endpoint: null });
    }
    return (
      <div>
        <div className="input-group flex-nowrap">
          <div className="input-group-prepend">
            <span className="input-group-text" id="addon-wrapping">
              Endpoint Name :
            </span>
          </div>
          <input
            type="text"
            className="form-control"
            aria-label="Username"
            aria-describedby="addon-wrapping"
            name="name"
            ref={this.name}
            value={this.state.data.name}
            onChange={this.handleChange}
          />
        </div>
        <br />
        <div className="input-group mb-3">
          <div className="input-group-prepend">
            <span className="input-group-text" id="basic-addon3">
              <div className="dropdown">
                <div className="Environment Dropdown">
                  <Dropdown className="float-light">
                    <Dropdown.Toggle variant="default" id="dropdown-basic">
                      {this.state.data.method}
                    </Dropdown.Toggle>

                    <Dropdown.Menu alignRight>
                      {Object.keys(this.dropdownRequestType).map(key => (
                        <Dropdown.Item
                          onClick={() =>
                            this.setMethod(this.dropdownRequestType[key].name)
                          }
                        >
                          {this.dropdownRequestType[key].name}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </div>
            </span>

            <div className="editableDropdown">
              <input
                type="text"
                name="BASE_URL_Value"
                ref={this.BASE_URL_Value}
                value={this.state.data.host}
                onChange={this.handleDropdownChange}
                disabled={this.state.selectedHost !== "custom"}
              />
              <select
                id="selectBox"
                onChange={() =>
                  this.setDropdownValue(
                    document.getElementById("selectBox").options[
                      document.getElementById("selectBox").selectedIndex
                    ].value
                  )
                }
              >
                {Object.keys(this.dropdownHost).map(key =>
                  this.dropdownHost[key].value !== "" ? (
                    <option value={key} key={key}>
                      {this.dropdownHost[key].name} Base_URL
                    </option>
                  ) : null
                )}
              </select>
            </div>
          </div>
          <input
            ref={this.uri}
            type="text"
            value={this.state.data.updatedUri}
            name="updatedUri"
            className="form-control form-control-lg h-auto"
            id="basic-url"
            aria-describedby="basic-addon3"
            onChange={this.handleChange}
          />
          <div className="d-flex">
            <button
              className="btn btn-secondary ml-3"
              type="submit"
              id="button-addon2"
              onClick={() => this.handleSend()}
            >
              Send
            </button>
            <button
              className="btn btn-secondary ml-3"
              type="button"
              id="button-addon2"
              onClick={() => this.handleSave()}
            >
              Save
            </button>
          </div>
        </div>
        <div>
          <ul className="nav nav-pills mb-3" id="pills-tab" role="tablist">
            <li className="nav-item">
              <a
                className="nav-link active"
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
            <li className="nav-item">
              <a
                className="nav-link"
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
            <li className="nav-item">
              <a
                className="nav-link"
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
          <div className="tab-content" id="pills-tabContent">
            <div
              className="tab-pane fade show active"
              id="pills-home"
              role="tabpanel"
              aria-labelledby="pills-params-tab"
            >
              <ParamsComponent
                {...this.props}
                originalParams={this.state.originalParams}
                props_from_parent={this.propsFromChild.bind(this)}
              />
            </div>
            <div
              className="tab-pane fade"
              id="pills-profile"
              role="tabpanel"
              aria-labelledby="pills-headers-tab"
            >
              <div>
                <DisplayHeaders
                  {...this.props}
                  handle_update_headers={this.handleUpdateHeader.bind(this)}
                />
              </div>
            </div>
            <div
              className="tab-pane fade"
              id="pills-contact"
              role="tabpanel"
              aria-labelledby="pills-body-tab"
            >
              <textarea
                className="form-control"
                ref={this.body}
                name="body"
                id="body"
                rows="8"
                onChange={this.handleChange}
                value={this.state.data.body}
              />
            </div>
          </div>
        </div>
        {this.state.response.status ? (
          this.state.response.status === 200 ? (
            <div>
              <div className="alert alert-success" role="alert">
                Status :{" "}
                {this.state.response.status +
                  " " +
                  this.state.response.statusText}
                <div style={{ float: "right" }}>
                  Time:{this.state.timeElapsed}ms
                </div>
              </div>
            </div>
          ) : (
            <div className="alert alert-danger" role="alert">
              Status :
              {this.state.response.status +
                " " +
                status[this.state.response.status]}
            </div>
          )
        ) : null}

        {this.state.flagResponse === true &&
        (this.state.prettyResponse === true ||
          this.state.rawResponse === true ||
          this.state.previewResponse === true) ? (
          <div>
            <div>
              <Navbar bg="primary" variant="dark">
                <Navbar.Brand href="#home" />
                <Nav className="mr-auto">
                  <Nav.Link onClick={this.prettyDataResponse.bind(this)}>
                    Pretty
                  </Nav.Link>
                  <Nav.Link onClick={this.rawDataResponse.bind(this)}>
                    Raw
                  </Nav.Link>
                  <Nav.Link onClick={this.previewDataResponse.bind(this)}>
                    Preview
                  </Nav.Link>
                </Nav>
                <CopyToClipboard
                  text={JSON.stringify(this.state.response.data)}
                  onCopy={() => this.setState({ copied: true })}
                  style={{ float: "right", borderRadius: "12px" }}
                >
                  <button style={{ borderRadius: "12px" }}>Copy</button>
                </CopyToClipboard>
              </Navbar>
            </div>

            {this.state.prettyResponse === true ? (
              <div>
                <JSONPretty
                  theme={JSONPrettyMon}
                  data={this.state.response.data}
                />
              </div>
            ) : null}
            {this.state.rawResponse === true ? (
              <div style={{ display: "block", whiteSpace: "normal" }}>
                {this.state.responseString}
              </div>
            ) : null}
            {this.state.previewResponse === true ? (
              <div style={{ display: "block", whiteSpace: "normal" }}>
                feature coming soon
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }
}

export default connect(null, mapDispatchToProps)(DisplayEndpoint);
