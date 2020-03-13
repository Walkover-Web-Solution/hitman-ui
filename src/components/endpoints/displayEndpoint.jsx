import React, { Component } from "react";
import { Dropdown } from "react-bootstrap";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import shortId from "shortid";
import "../../css/editableDropdown.css";
import DisplayResponse from "./displayResponse";
import GenericTable from "./genericTable";
import { addEndpoint, updateEndpoint } from "./endpointsActions";
import endpointService from "./endpointService";
import store from "../../store/store";
import { withRouter } from "react-router-dom";

var URI = require("urijs");

const mapStateToProps = state => {
  return {
    groups: state.groups,
    versions: state.versions,
    endpoints: state.endpoints
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    addEndpoint: (newEndpoint, groupId) =>
      dispatch(addEndpoint(ownProps.history, newEndpoint, groupId)),
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
    originalHeaders: [],
    originalParams: []
  };

  async componentDidMount() {
    let endpoint = {};
    let originalParams = {};
    let originalHeaders = [];
    let flag = 0;

    if (!this.props.location.title) {
      this.fetchEndpoint(endpoint, originalParams, originalHeaders, flag);
      store.subscribe(() => {
        this.fetchEndpoint(endpoint, originalParams, originalHeaders, flag);
      });
    }
  }

  fetchEndpoint(endpoint, originalParams, originalHeaders, flag) {
    {
      const endpointId = this.props.location.pathname.split("/")[3];
      const { endpoints } = store.getState();
      const { groups } = store.getState();
      const { versions } = store.getState();

      if (
        Object.keys(groups).length !== 0 &&
        Object.keys(versions).length !== 0 &&
        Object.keys(endpoints).length !== 0 &&
        endpointId &&
        flag === 0
      ) {
        flag = 1;
        endpoint = endpoints[endpointId];
        const groupId = endpoints[endpointId].groupId;

        //To fetch originalParams from Params
        originalParams = this.fetchoriginalParams(endpoint.params);

        //To fetch originalHeaders from Headers
        Object.keys(endpoint.headers).forEach(h => {
          originalHeaders.push(endpoint.headers[h]);
        });

        this.BASE_URL = endpoint.BASE_URL;
        if (endpoint.BASE_URL !== null) {
          this.setDropdownValue("custom");
        } else {
          this.state.selectedHost = "";
          this.customHost = false;
        }

        let props = { ...this.props, groupId: groupId };
        const hostJson = this.fetchHosts(props, this.props.environment);
        this.fillDropdownValue(hostJson);
        this.host = this.findHost(hostJson);
        this.setState({
          data: {
            method: endpoint.requestType,
            uri: endpoint.uri,
            updatedUri: endpoint.uri,
            name: endpoint.name,
            body: JSON.stringify(endpoint.body, null, 4),
            host: this.host
          },
          originalParams,
          originalHeaders,
          endpoint,
          groups,
          groupId,
          versions,
          title: "update endpoint"
        });
      }
    }
  }

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
      this.setState({ response, flagResponse: true });
    } else {
      this.setState({ flagResponse: false });
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

      if (responseJson.status === 200) {
        let timeElapsed = new Date().getTime() - this.state.startTime;
        this.setState({ response, timeElapsed, flagResponse: true });
      }
    } catch (error) {
      this.handleErrorResponse(error);
    }
  }

  handleSend = async () => {
    let startTime = new Date().getTime();
    let response = {};
    this.setState({ startTime, response });
    const headersData = this.doSubmitHeader();
    const host = this.state.data.host;
    let api = host + this.uri.current.value;
    api = this.replaceVariables(api);
    let body = this.parseBody(this.state.data);
    let headerJson = {};
    Object.keys(headersData).forEach(header => {
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
      this.props.updateEndpoint({
        ...endpoint,
        id: this.state.endpoint.id,
        groupId: this.state.groupId
      });
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

  propsFromChild(name, value) {
    if (name === "originalParams") {
      this.handleUpdateUri(value);
      this.setState({ originalParams: value });
    }
    if (name === "handleAddParam") {
      this.setState({ originalParams: value });
    }

    if (name === "originalHeaders") {
      this.setState({ originalHeaders: value });
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
      if (this.props.location.endpoint.BASE_URL !== null) {
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

      //To fetch originalHeaders from Headers
      const originalHeaders = [];
      Object.keys(endpoint.headers).forEach(h => {
        originalHeaders.push(endpoint.headers[h]);
      });
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
        originalHeaders,
        endpoint,
        flagResponse: false
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
              <GenericTable
                {...this.props}
                title="Add Params"
                dataArray={this.state.originalParams}
                props_from_parent={this.propsFromChild.bind(this)}
              ></GenericTable>
            </div>
            <div
              className="tab-pane fade"
              id="pills-profile"
              role="tabpanel"
              aria-labelledby="pills-headers-tab"
            >
              <div>
                <GenericTable
                  {...this.props}
                  title="Add Headers"
                  dataArray={this.state.originalHeaders}
                  props_from_parent={this.propsFromChild.bind(this)}
                ></GenericTable>
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
        <div>
          <DisplayResponse
            timeElapsed={this.state.timeElapsed}
            response={this.state.response}
            flagResponse={this.state.flagResponse}
          ></DisplayResponse>
        </div>
      </div>
    );
  }
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(DisplayEndpoint)
);
