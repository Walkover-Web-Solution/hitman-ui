import React, { Component } from "react";
import JSONPretty from "react-json-pretty";
import { Dropdown, Table } from "react-bootstrap";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import { toast } from "react-toastify";
import endpointService from "./endpointService";
import "../../css/editableDropdown.css";
const status = require("http-status");
var JSONPrettyMon = require("react-json-pretty/dist/monikai");
var URI = require("urijs");

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
    headersData: {},
    originalHeadersKeys: [],
    updatedHeadersKeys: [],
    originalParams: []
  };

  handleChange = e => {
    let data = { ...this.state.data };
    if (e.currentTarget.name === "host") {
      this.setState({
        onChangeFlag: true
      });
    }
    data[e.currentTarget.name] = e.currentTarget.value;
    data.uri = e.currentTarget.value;
    if (e.currentTarget.name === "updatedUri") {
      let updatedUri = e.currentTarget.value.split("?")[1];
      this.handleUpdateParamsUrl(updatedUri);
    }
    this.setState({ data });
  };

  handleUpdateParamsUrl(updatedUri) {
    let keys = [];
    let values = [];
    let description = [];
    let originalParams = this.state.originalParams;
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

  parseBody() {
    let { method, uri, updatedUri, name, body } = this.state.data;
    if (method === "POST" || method === "PUT") {
      try {
        body = JSON.parse(this.body.current.value);
        this.setState({
          data: {
            method,
            uri,
            updatedUri,
            name,
            body: JSON.stringify(body, null, 4)
          }
        });
      } catch (error) {
        toast.error("Invalid Body");
      }
    }
  }
  handleSend = async () => {
    let startTime = new Date().getTime();
    let prettyResponse = true;
    this.setState({ startTime, prettyResponse });
    let response = {};
    const headersData = this.doSubmitHeader();
    await this.setState({ headersData, response });
    this.state.flagResponse = true;
    const host = this.state.data.host;
    let api = host + this.uri.current.value;
    api = this.replaceVariables(api);
    let { method, uri, updatedUri, name, body } = this.state.data;
    this.parseBody();
    let headerJson = {};
    Object.keys(headersData).map(header => {
      headerJson[headersData[header].key] = headersData[header].value;
    });
    let responseJson = {};
    try {
      headerJson = this.replaceVariablesInJson(headerJson);
      api = this.replaceVariables(api);
      responseJson = await endpointService.apiTest(
        api,
        method,
        body,
        headerJson
      );
      const response = { ...responseJson };
      if (responseJson.status === 200) this.setState({ response });
      this.responseTime();
    } catch (error) {
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
  };

  handleSave = async e => {
    let body = {};
    if (this.state.data.method === "POST" || this.state.data.method === "PUT")
      try {
        body = JSON.parse(this.body.current.value);
      } catch {
        toast.error("Invalid Body");
      }
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
      this.props.history.push({
        pathname: `/dashboard/collections`,
        title: "Add Endpoint",
        endpoint: endpoint,
        groupId: this.state.groupId,
        versions: this.state.versions
      });
    } else if (this.state.title === "update endpoint") {
      this.props.history.push({
        pathname: `/dashboard/collections`,
        title: "update Endpoint",
        endpoint: endpoint,
        groupId: this.state.groupId,
        versions: this.state.versions,
        endpointId: this.state.endpoint.id
      });
    }
  };

  setMethod(method) {
    const response = {};
    let data = { ...this.state.data };
    data.method = method;
    this.setState({ response, data });
  }

  async handleAddParam() {
    const len = this.state.originalParams.length;
    let originalParams = [...this.state.originalParams, len.toString()];
    originalParams[[len.toString()]] = {
      key: "",
      value: "",
      description: ""
    };
    this.setState({ originalParams });
  }

  handleDeleteParam(index) {
    let originalParams = this.state.originalParams;
    let neworiginalParams = [];
    for (let i = 0; i < originalParams.length; i++) {
      if (i === index) {
        continue;
      }
      neworiginalParams.push(this.state.originalParams[i]);
    }
    originalParams = neworiginalParams;
    this.setState({ originalParams });
    this.handleUpdateUri(originalParams);
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

  handleChangeParam = e => {
    const name = e.currentTarget.name.split(".");
    const originalParams = [...this.state.originalParams];
    if (name[1] === "key") {
      originalParams[name[0]].key = e.currentTarget.value;
    }
    if (name[1] === "value") {
      originalParams[name[0]].value = e.currentTarget.value;
    }
    if (name[1] === "description") {
      originalParams[name[0]].description = e.currentTarget.value;
    }
    this.handleUpdateUri(originalParams);
    this.setState({
      originalParams
    });
  };

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

  handleAddHeader() {
    let headersData = { ...this.state.headersData };
    const len = this.state.originalHeadersKeys.length;
    let originalHeadersKeys = [
      ...this.state.originalHeadersKeys,
      len.toString()
    ];
    let updatedHeadersKeys = [...this.state.updatedHeadersKeys, ""];
    headersData[len.toString()] = {
      key: "",
      value: "",
      description: ""
    };
    this.setState({ headersData, originalHeadersKeys, updatedHeadersKeys });
  }
  handleDeleteHeader(index) {
    const updatedHeadersKeys = this.state.updatedHeadersKeys;
    updatedHeadersKeys[index] = "deleted";
    this.setState({ updatedHeadersKeys });
  }

  handleChangeHeader = e => {
    const name = e.currentTarget.name.split(".");
    const originalHeadersKeys = [...this.state.originalHeadersKeys];
    const updatedHeadersKeys = [...this.state.updatedHeadersKeys];
    if (name[1] === "key") {
      updatedHeadersKeys[name[0]] = e.currentTarget.value;
    }

    let headersData = { ...this.state.headersData };
    headersData[originalHeadersKeys[name[0]]][name[1]] = e.currentTarget.value;
    this.setState({ headersData, updatedHeadersKeys });
  };

  doSubmitHeader() {
    let headersData = { ...this.state.headersData };
    let originalHeadersKeys = [...this.state.originalHeadersKeys];
    let updatedHeadersKeys = [...this.state.updatedHeadersKeys];

    for (let i = 0; i < updatedHeadersKeys.length; i++) {
      if (updatedHeadersKeys[i] !== originalHeadersKeys[i]) {
        if (updatedHeadersKeys[i] === "deleted") {
          delete headersData[originalHeadersKeys[i]];
        } else {
          headersData[updatedHeadersKeys[i]] =
            headersData[originalHeadersKeys[i]];
          headersData[updatedHeadersKeys[i]].key = updatedHeadersKeys[i];
          delete headersData[originalHeadersKeys[i]];
        }
      }
    }

    if (headersData[""]) delete headersData[""];
    updatedHeadersKeys = updatedHeadersKeys.filter(k => k !== "");
    originalHeadersKeys = [...updatedHeadersKeys];
    const endpoint = { ...this.state.endpoint };
    endpoint.headers = { ...headersData };
    this.setState({
      originalHeadersKeys,
      updatedHeadersKeys,
      endpoint,
      headersData
    });
    return headersData;
  }

  responseTime() {
    let timeElapsed = new Date().getTime() - this.state.startTime;
    this.setState({ timeElapsed });
  }
  rawDataResponse() {
    let rawResponse = true;
    let previewResponse = false;
    let prettyResponse = false;
    let responseString = JSON.stringify(this.state.response);
    this.setState({
      rawResponse,
      previewResponse,
      prettyResponse,
      responseString
    });
  }
  prettyDataResponse() {
    let rawResponse = false;
    let previewResponse = false;
    let prettyResponse = true;
    let responseString = JSON.stringify(this.state.response);
    this.setState({
      rawResponse,
      previewResponse,
      prettyResponse,
      responseString
    });
  }
  previewDataResponse() {
    let rawResponse = false;
    let previewResponse = true;
    let prettyResponse = false;
    this.setState({ rawResponse, previewResponse, prettyResponse });
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

  setDropdownValue(key) {
    let host = "";
    if (key === "custom") {
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
          body: {},
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
        headersData: {},
        originalHeadersKeys: [],
        updatedHeadersKeys: [],
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
      let headersData = { ...this.props.location.endpoint.headers };
      const originalHeadersKeys = Object.keys(headersData);
      const updatedHeadersKeys = Object.keys(headersData);
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
        originalParams,
        headersData,
        originalHeadersKeys,
        updatedHeadersKeys
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
              <Table bordered size="sm">
                <thead>
                  <tr>
                    <th>KEY</th>
                    <th>VALUE</th>
                    <th>DESCRIPTION</th>
                  </tr>
                </thead>

                <tbody>
                  {this.state.originalParams.map((params, index) =>
                    params !== "deleted" ? (
                      <tr key={index}>
                        <td>
                          <input
                            name={index + ".key"}
                            ref={this.paramKey}
                            value={this.state.originalParams[index].key}
                            onChange={this.handleChangeParam}
                            type={"text"}
                            className="form-control"
                            style={{ border: "none" }}
                          />
                        </td>
                        <td>
                          <input
                            name={index + ".value"}
                            value={this.state.originalParams[index].value}
                            onChange={this.handleChangeParam}
                            type={"text"}
                            className="form-control"
                            style={{ border: "none" }}
                          />
                        </td>
                        <td>
                          <input
                            name={index + ".description"}
                            value={this.state.originalParams[index].description}
                            onChange={this.handleChangeParam}
                            type={"text"}
                            style={{ border: "none" }}
                            className="form-control"
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-light btn-sm btn-block"
                            onClick={() => this.handleDeleteParam(index)}
                          >
                            x
                          </button>
                        </td>
                      </tr>
                    ) : null
                  )}
                  <tr>
                    <td> </td>
                    <td>
                      {" "}
                      <button
                        type="button"
                        className="btn btn-link btn-sm btn-block"
                        onClick={() => this.handleAddParam()}
                      >
                        + New Param
                      </button>
                    </td>
                    <td> </td>
                    <td> </td>
                  </tr>
                </tbody>
              </Table>
            </div>
            <div
              className="tab-pane fade"
              id="pills-profile"
              role="tabpanel"
              aria-labelledby="pills-headers-tab"
            >
              <div>
                <Table bordered size="sm">
                  <thead>
                    <tr>
                      <th>KEY</th>
                      <th>VALUE</th>
                      <th>DESCRIPTION</th>
                    </tr>
                  </thead>

                  <tbody>
                    {this.state.updatedHeadersKeys.map((header, index) =>
                      header !== "deleted" ? (
                        <tr key={index}>
                          <td>
                            <input
                              name={index + ".key"}
                              value={
                                this.state.headersData[
                                  this.state.originalHeadersKeys[index]
                                ].key
                              }
                              onChange={this.handleChangeHeader}
                              type={"text"}
                              className="form-control"
                              style={{ border: "none" }}
                            />
                          </td>
                          <td>
                            <input
                              name={index + ".value"}
                              value={
                                this.state.headersData[
                                  this.state.originalHeadersKeys[index]
                                ].value
                              }
                              onChange={this.handleChangeHeader}
                              type={"text"}
                              className="form-control"
                              style={{ border: "none" }}
                            />
                          </td>
                          <td>
                            <input
                              name={index + ".description"}
                              value={
                                this.state.headersData[
                                  this.state.originalHeadersKeys[index]
                                ].description
                              }
                              onChange={this.handleChangeHeader}
                              type={"text"}
                              style={{ border: "none" }}
                              className="form-control"
                            />
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-light btn-sm btn-block"
                              onClick={() => this.handleDeleteHeader(index)}
                            >
                              x
                            </button>
                          </td>
                        </tr>
                      ) : null
                    )}
                    <tr>
                      <td> </td>
                      <td>
                        {" "}
                        <button
                          type="button"
                          className="btn btn-link btn-sm btn-block"
                          onClick={() => this.handleAddHeader()}
                        >
                          + New Header
                        </button>
                      </td>
                      <td> </td>
                      <td> </td>
                    </tr>
                  </tbody>
                </Table>
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
                id="body"
                rows="8"
                name="body"
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

export default DisplayEndpoint;
