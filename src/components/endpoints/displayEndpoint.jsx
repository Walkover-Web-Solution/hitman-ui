import React, { Component } from "react";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import { toast } from "react-toastify";
import store from "../../store/store";
import { isDashboardRoute } from "../common/utility";
import CodeWindow from "./codeWindow";
import CreateEndpointForm from "./createEndpointForm";
import BodyContainer from "./displayBody";
import DisplayResponse from "./displayResponse";
import endpointApiService from "./endpointApiService";
import GenericTable from "./genericTable";
import HostContainer from "./hostContainer";
import { addEndpoint, updateEndpoint } from "./redux/endpointsActions";
const status = require("http-status");

var URI = require("urijs");

const mapStateToProps = (state) => {
  return {
    groups: state.groups,
    versions: state.versions,
    endpoints: state.endpoints,
    environment: state.environment.environments[
      state.environment.currentEnvironmentId
    ] || { id: null, name: "No Environment" },
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    addEndpoint: (newEndpoint, groupId) =>
      dispatch(addEndpoint(ownProps.history, newEndpoint, groupId)),
    updateEndpoint: (editedEndpoint) =>
      dispatch(updateEndpoint(editedEndpoint)),
  };
};

class DisplayEndpoint extends Component {
  uri = React.createRef();
  name = React.createRef();
  paramKey = React.createRef();

  state = {
    data: {
      name: "",
      method: "GET",
      body: { type: "raw", value: "" },
      uri: "",
      updatedUri: "",
    },
    methodList: ["GET", "POST", "PUT", "DELETE"],
    environment: {},
    startTime: "",
    timeElapsed: "",
    response: {},
    endpoint: {},
    groupId: null,
    title: "",
    flagResponse: false,
    originalHeaders: [],
    originalParams: [],
    showDescriptionFlag: false,
    showAddDescriptionFlag: false,
    oldDescription: "",
    headers: [],
    params: [],
  };

  customState = {
    BASE_URL: "",
  };

  async componentDidMount() {
    let flag = 0;
    if (
      (this.props.location.pathname.split("/")[3] === "new" &&
        !this.props.location.title) ||
      !isDashboardRoute(this.props)
    ) {
      this.fetchEndpoint(flag);
      store.subscribe(() => {
        if (!this.props.location.title && !this.state.title) {
          this.fetchEndpoint(flag);
        }
      });
    }
  }

  structueParamsHeaders = [
    {
      checked: "notApplicable",
      key: "",
      value: "",
      description: "",
    },
  ];

  fetchEndpoint(flag) {
    let endpoint = {};
    let originalParams = [];
    let originalHeaders = [];
    const split = this.props.location.pathname.split("/");
    let endpointId = "";

    if (isDashboardRoute(this.props)) endpointId = split[3];
    else endpointId = split[4];

    const { endpoints } = store.getState();
    const { groups } = store.getState();
    const { versions } = store.getState();
    if (this.props.location.pathname.split("/")[3] === "new" && !this.title) {
      originalParams = [
        {
          checked: "notApplicable",
          key: "",
          value: "",
          description: "",
        },
      ];
      originalHeaders = [
        {
          checked: "notApplicable",
          key: "",
          value: "",
          description: "",
        },
      ];

      this.setState({
        originalParams,
        originalHeaders,
      });
    } else if (
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
      let params = this.fetchoriginalParams(endpoint.params);

      //To fetch originalHeaders from Headers
      originalHeaders = this.fetchoriginalHeaders(endpoint.headers);
      let headers = this.fetchoriginalHeaders(endpoint.headers);
      console.log("fffffff", originalParams);
      this.setState({
        data: {
          method: endpoint.requestType,
          uri: endpoint.uri,
          updatedUri: endpoint.uri,
          name: endpoint.name,
          body: endpoint.body,
        },
        params,
        headers,
        originalParams,
        originalHeaders,
        endpoint,
        groupId,
        endpoint_description: endpoint.description,
        oldDescription: endpoint.description,
        showDescriptionFlag: false,
        title: "update endpoint",
      });
    }
  }
  handleChange = (e) => {
    let data = { ...this.state.data };
    data[e.currentTarget.name] = e.currentTarget.value;
    data.uri = e.currentTarget.value;
    if (e.currentTarget.name === "updatedUri") {
      let keys = [];
      let values = [];
      let description = [];
      let originalParams = this.state.originalParams;
      let updatedUri = e.currentTarget.value.split("?")[1];
      let result = URI.parseQuery(updatedUri);
      for (let i = 0; i < Object.keys(result).length; i++) {
        keys.push(Object.keys(result)[i]);
      }
      for (let i = 0; i < keys.length; i++) {
        values.push(result[keys[i]]);
        if (originalParams[i]) {
          for (let k = 0; k < originalParams.length; k++) {
            if (
              originalParams[k].key === keys[i] &&
              originalParams[k].checked === "true"
            ) {
              description[i] = originalParams[k].description;
              break;
            } else if (k === originalParams.length - 1) {
              description[i] = "";
            }
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
    for (let i = 0; i < this.state.originalParams.length; i++) {
      if (this.state.originalParams[i].checked === "false") {
        originalParams.push({
          checked: this.state.originalParams[i].checked,
          key: this.state.originalParams[i].key,
          value: this.state.originalParams[i].value,
          description: this.state.originalParams[i].description,
        });
      }
    }
    for (let i = 0; i < keys.length; i++) {
      originalParams.push({
        checked: "true",
        key: keys[i],
        value: values[i],
        description: description[i],
      });
    }
    originalParams.push({
      checked: "notApplicable",
      key: "",
      value: "",
      description: "",
    });
    return originalParams;
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

  parseBody(rawBody) {
    let body = {};
    try {
      body = JSON.parse(rawBody);
      return body;
    } catch (error) {
      toast.error("Invalid Body");
      return body;
    }
  }

  handleErrorResponse(error) {
    if (error.response) {
      let response = {
        status: error.response.status,
        statusText: status[error.response.status],
        data: error.response.data,
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
      responseJson = await endpointApiService.apiTest(
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
    const BASE_URL = this.customState.BASE_URL;
    let api = BASE_URL + this.uri.current.value;
    api = this.replaceVariables(api);
    let headerJson = {};
    Object.keys(headersData).forEach((header) => {
      headerJson[header] = headersData[header].value;
    });
    let { body, headers } = this.formatBody(this.state.data.body, headerJson);
    this.handleApiCall(api, body, headers);
  };

  handleSave = async (groupId, EndpointName) => {
    if (!(this.state.groupId || groupId)) {
      this.openEndpointFormModal();
    } else {
      let body = this.state.data.body;
      if (this.state.data.body.type === "raw") {
        body.value = this.parseBody(body.value);
      }
      const headersData = this.doSubmitHeader();
      const updatedParams = this.doSubmitParam();
      const endpoint = {
        uri: this.uri.current.value,
        name: EndpointName || this.name.current.value,
        requestType: this.state.data.method,
        body: body,
        headers: headersData,
        params: updatedParams,
        BASE_URL: this.customState.BASE_URL,
      };
      // if (endpoint.name === "" || endpoint.uri === "")
      if (endpoint.name === "") toast.error("Please enter Endpoint name");
      else if (this.props.location.pathname.split("/")[3] === "new") {
        endpoint.requestId = this.props.tabs[this.props.default_tab_index].id;
        this.props.addEndpoint(endpoint, groupId || this.state.groupId);
      } else if (this.state.title === "update endpoint") {
        this.props.updateEndpoint({
          ...endpoint,
          id: this.state.endpoint.id,
          groupId: groupId || this.state.groupId,
        });
      }
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
          checked: originalHeaders[i].checked,
          value: originalHeaders[i].value,
          description: originalHeaders[i].description,
        };
      }
    }
    const endpoint = { ...this.state.endpoint };
    endpoint.headers = { ...updatedHeaders };
    this.setState({
      originalHeaders,
      endpoint,
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
      if (
        originalParams[i].key.length !== 0 &&
        originalParams[i].checked === "true"
      )
        parts[originalParams[i].key] = originalParams[i].value;
    }
    URI.escapeQuerySpace = false;
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
          checked: originalParams[i].checked,
          value: originalParams[i].value,
          description: originalParams[i].description,
        };
      }
    }
    const endpoint = { ...this.state.endpoint };
    endpoint.params = { ...updatedParams };
    this.setState({
      originalParams,
      endpoint,
    });
    return updatedParams;
  }

  fetchoriginalParams(params) {
    let originalParams = [];
    let i = 0;
    for (i = 0; i < Object.keys(params).length; i++) {
      originalParams[i] = {
        checked: params[Object.keys(params)[i]].checked,
        key: Object.keys(params)[i],
        value: params[Object.keys(params)[i]].value,
        description: params[Object.keys(params)[i]].description,
      };
    }
    originalParams[i] = {
      checked: "notApplicable",
      key: "",
      value: "",
      description: "",
    };

    return originalParams;
  }

  fetchoriginalHeaders(headers) {
    let originalHeaders = [];
    let i = 0;
    for (i = 0; i < Object.keys(headers).length; i++) {
      originalHeaders[i] = {
        checked: headers[Object.keys(headers)[i]].checked,
        key: Object.keys(headers)[i],
        value: headers[Object.keys(headers)[i]].value,
        description: headers[Object.keys(headers)[i]].description,
      };
    }
    originalHeaders[i] = {
      checked: "notApplicable",
      key: "",
      value: "",
      description: "",
    };
    return originalHeaders;
  }

  openEndpointFormModal() {
    this.setState({ showEndpointFormModal: true });
  }

  closeEndpointFormModal() {
    this.setState({ showEndpointFormModal: false });
  }

  setGroupId(groupId, endpointName) {
    const data = { ...this.state.data };
    data.name = endpointName;
    this.setState({ groupId, data });
    this.handleSave(groupId, endpointName);
  }

  makeHeaders(headers) {
    let processedHeaders = [];
    for (let i = 0; i < Object.keys(headers).length; i++) {
      if (headers[Object.keys(headers)[i]].checked === "true") {
        processedHeaders[i] = {
          name: headers[Object.keys(headers)[i]].key,
          value: headers[Object.keys(headers)[i]].value,
          comment: headers[Object.keys(headers)[i]].description,
        };
      }
    }
    return processedHeaders;
  }

  makeParams(params) {
    let processedParams = [];
    for (let i = 0; i < Object.keys(params).length; i++) {
      if (params[Object.keys(params)[i]].checked === "true") {
        processedParams.push({
          name: params[Object.keys(params)[i]].key,
          value: params[Object.keys(params)[i]].value,
          comment: params[Object.keys(params)[i]].description,
        });
      }
    }
    return processedParams;
  }

  makePostData(body) {
    let postData = {
      mimeType: "application/json",
      text: '{"hello":"world"}',
      comment: "Sample json body",
    };
    return postData;
  }

  async prepareHarObject() {
    const { uri, method, body } = this.state.data;
    const BASE_URL = this.customState.BASE_URL;
    const { originalHeaders, originalParams } = this.state;
    const harObject = {
      method,
      url: BASE_URL + uri.split("?")[0],
      httpVersion: "HTTP/1.1",
      cookies: [],
      headers: this.makeHeaders(originalHeaders),
      postData: this.makePostData(body.value),
      queryString: this.makeParams(originalParams),
    };
    if (!harObject.url.split(":")[1] || harObject.url.split(":")[0] === "") {
      harObject.url = "https://";
    }
    this.openCodeWindow(harObject);
  }

  openCodeWindow(harObject) {
    this.setState({
      showCodeWindow: true,
      harObject,
    });
  }

  showCodeWindow() {
    return (
      <CodeWindow
        show={true}
        onHide={() => {
          this.setState({ showCodeWindow: false });
        }}
        harObject={this.state.harObject}
        title="Generate Code Snippets"
      />
    );
  }

  setBaseUrl(BASE_URL) {
    this.customState.BASE_URL = BASE_URL;
  }

  setBody(bodyType, body) {
    let data = { ...this.state.data };
    data.body = { type: bodyType, value: body };
    if (bodyType === "urlEncoded") {
      this.setHeaders();
    }
    this.setState({ data });
  }

  setHeaders() {
    this.contentTypeFlag = false;
    let originalHeaders = this.state.originalHeaders;
    for (let i = 0; i < originalHeaders.length; i++) {
      if (originalHeaders[i].key === "Content-type") {
        this.contentTypeFlag = true;
        break;
      }
    }
    if (this.contentTypeFlag === false) {
      let length = originalHeaders.length;
      originalHeaders[length - 1] = {
        checked: "true",
        key: "Content-type",
        value: "application/x-www-form-urlencoded",
        description: "",
      };
      originalHeaders.push({
        checked: "notApplicable",
        key: "",
        value: "",
        description: "",
      });
      this.setState({ originalHeaders });
    }
  }

  handleDescription() {
    const showDescriptionFlag = true;
    let showAddDescriptionFlag = true;
    this.setState({ showDescriptionFlag, showAddDescriptionFlag });
  }

  handleDescriptionCancel() {
    let endpoint = { ...this.state.endpoint };
    endpoint.description = this.state.oldDescription;
    const showDescriptionFlag = false;
    this.setState({
      showDescriptionFlag,
      endpoint,
      showAddDescriptionFlag: true,
    });
  }

  handleDescriptionSave(e) {
    e.preventDefault();
    const value = e.target.description.value;
    let endpoint = { ...this.state.endpoint };

    this.props.updateEndpoint({ id: endpoint.id, description: value });

    endpoint.description = value;
    this.setState({
      endpoint,
      showDescriptionFlag: false,
      oldDescription: value,
      showAddDescriptionFlag: true,
    });
  }

  handleChangeDescription = (e) => {
    let endpoint = { ...this.state.endpoint };
    endpoint[e.currentTarget.name] = e.currentTarget.value;
    this.setState({ endpoint });
  };

  showDescription() {
    let showAddDescriptionFlag = !this.state.showAddDescriptionFlag;
    this.setState({ showAddDescriptionFlag, showDescriptionFlag: false });
  }

  formatBody(body, headers) {
    let finalBodyValue = null;
    switch (body.type) {
      case "raw":
        finalBodyValue = this.parseBody(body.value);
        return { body: finalBodyValue, headers };
      case "formData":
        headers["Content-type"] = "multipart/form-data";
        let formData = new FormData();
        body.value.map((o) => formData.set(o.key, o.value));
        return { body: formData, headers };
      case "urlEncoded":
        let urlEncodedData = [];
        for (let i = 0; i < body.value.length; i++) {
          if (body.value[i].key.length !== 0) {
            let encodedKey = encodeURIComponent(body.value[i].key);
            let encodedValue = encodeURIComponent(body.value[i].value);
            urlEncodedData.push(encodedKey + "=" + encodedValue);
          }
        }
        urlEncodedData = urlEncodedData.join("&");
        return { body: urlEncodedData, headers };

      default:
        return { body: {}, headers };
    }
  }

  render() {
    console.log(this.props);
    if (
      this.props.location.pathname.split("/")[3] !== "new" &&
      this.state.endpoint.id !== this.props.location.pathname.split("/")[3]
    ) {
      let flag = 0;

      if (!this.props.location.title && isDashboardRoute(this.props)) {
        this.fetchEndpoint(flag);
        store.subscribe(() => {
          if (!this.props.location.title && !this.state.title) {
            this.fetchEndpoint(flag);
          }
        });
      }
    }
    if (this.props.location.title === "Add New Endpoint") {
      this.title = "Add New Endpoint";
      this.setState({
        data: {
          name: "",
          method: "GET",
          body: { type: "raw", value: null },
          uri: "",
          updatedUri: "",
        },
        startTime: "",
        timeElapsed: "",
        response: {},
        endpoint: {},
        groupId: this.props.location.groupId,
        title: "Add New Endpoint",
        flagResponse: false,
        showDescriptionFlag: false,

        originalHeaders: [
          {
            checked: "notApplicable",
            key: "",
            value: "",
            description: "",
          },
        ],
        originalParams: [
          {
            checked: "notApplicable",
            key: "",
            value: "",
            description: "",
          },
        ],
      });
      this.props.history.push({ groups: null });
    }

    if (
      this.props.location.title === "update endpoint" &&
      this.props.location.endpoint
    ) {
      let endpoint = { ...this.props.location.endpoint };
      //To fetch originalParams from Params
      const originalParams = this.fetchoriginalParams(
        this.props.location.endpoint.params
      );
      const params = this.fetchoriginalParams(endpoint.params);

      //To fetch originalHeaders from Headers
      const originalHeaders = this.fetchoriginalHeaders(endpoint.headers);
      const headers = this.fetchoriginalHeaders(endpoint.headers);
      console.log("in update endpoint");
      this.setState({
        data: {
          method: endpoint.requestType,
          uri: endpoint.uri,
          updatedUri: endpoint.uri,
          name: endpoint.name,
          body: endpoint.body,
          // JSON.stringify(endpoint.body, null, 4)
        },
        title: "update endpoint",
        response: {},
        groupId: this.props.location.endpoint.groupId,
        originalParams,
        originalHeaders,
        params,
        headers,
        endpoint,
        flagResponse: false,
        oldDescription: endpoint.description,
      });
      this.props.history.push({ endpoint: null });
    }
    return (
      <div className="endpoint-container">
        {this.state.showEndpointFormModal && (
          <CreateEndpointForm
            {...this.props}
            show={true}
            onHide={() => this.closeEndpointFormModal()}
            set_group_id={this.setGroupId.bind(this)}
            name={this.state.data.name}
            save_endpoint={this.handleSave.bind(this)}
          />
        )}
        <div className="endpoint-name-container">
          {this.state.showCodeWindow && this.showCodeWindow()}

          {this.state.endpoint.description !== undefined ? (
            <i
              className={
                this.state.showAddDescriptionFlag === true
                  ? "fas fa-caret-down endpoint-description"
                  : "fas fa-caret-right endpoint-description"
              }
              onClick={() => this.showDescription()}
            ></i>
          ) : null}
          <input
            type="text"
            className="endpoint-name-input"
            aria-label="Username"
            aria-describedby="addon-wrapping"
            name="name"
            ref={this.name}
            placeholder="Endpoint Name"
            value={this.state.data.name}
            onChange={this.handleChange}
          />
        </div>

        {this.state.showAddDescriptionFlag &&
        !this.state.showDescriptionFlag ? (
          this.state.endpoint.description === "" &&
          isDashboardRoute(this.props) ? (
            <Link
              style={{
                padding: "5px 0px 0px 20px",
                fontSize: "15px",
                color: "tomato",
              }}
              onClick={() => this.handleDescription()}
            >
              Add a Description
            </Link>
          ) : (
            <div>
              <label style={{ padding: "5px 5px 0px 20px" }}>
                {this.state.endpoint.description}
              </label>
              {isDashboardRoute(this.props) ? (
                <button
                  className="btn btn-default"
                  onClick={() => this.handleDescription()}
                >
                  <i className="fas fa-pen"></i>
                </button>
              ) : null}
            </div>
          )
        ) : null}

        {this.state.showDescriptionFlag && isDashboardRoute(this.props) ? (
          <form onSubmit={this.handleDescriptionSave.bind(this)}>
            <div
              className="form-group"
              style={{ padding: "5px 10px 5px 10px" }}
            >
              <textarea
                className="form-control"
                rows="3"
                name="description"
                placeholder="Make things easier for your teammates with a complete endpoint description"
                value={this.state.endpoint.description}
                onChange={this.handleChangeDescription}
              ></textarea>
              <div style={{ float: "right", margin: "5px" }}>
                <button
                  className="btn btn-primary"
                  type="cancel"
                  onClick={() => this.handleDescriptionCancel()}
                  style={{
                    margin: "0px 5px 0px 0px",
                    color: "tomato",
                    background: "none",
                    border: "none",
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  type="submit"
                  style={{
                    margin: "0px 0px 0px 5px",
                    background: "tomato",
                    border: "none",
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        ) : null}

        <div className="endpoint-url-container">
          <div className="input-group-prepend">
            <div className="dropdown">
              <button
                className="btn btn-secondary dropdown-toggle"
                type="button"
                id="dropdownMenuButton"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                {this.state.data.method}
              </button>
              <div
                className="dropdown-menu"
                aria-labelledby="dropdownMenuButton"
              >
                {this.state.methodList.map((methodName) => (
                  <button
                    className="btn custom-request-button"
                    onClick={() => this.setMethod(methodName)}
                    key={methodName}
                  >
                    {methodName}
                  </button>
                ))}
              </div>
            </div>
            <HostContainer
              {...this.props}
              groupId={this.state.groupId}
              set_base_url={this.setBaseUrl.bind(this)}
            />
            <input
              ref={this.uri}
              type="text"
              value={this.state.data.updatedUri}
              name="updatedUri"
              className="form-control form-control-lg h-auto"
              id="endpoint-url-input"
              aria-describedby="basic-addon3"
              placeholder={"Enter request URL"}
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
            {isDashboardRoute(this.props) ? (
              <button
                className="btn"
                type="button"
                id="save-endpoint-button"
                onClick={() => this.handleSave()}
              >
                Save
              </button>
            ) : null}
          </div>
        </div>

        <div className="endpoint-headers-container">
          <div className="headers-params-wrapper">
            <button
              className="btn"
              type="button"
              id="show-code-snippets-button"
              onClick={() => this.prepareHarObject()}
            >
              Code
            </button>
            <ul className="nav nav-tabs" id="pills-tab" role="tablist">
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
          </div>
          <div className="tab-content" id="pills-tabContent">
            <div
              className="tab-pane fade show active"
              id="pills-home"
              role="tabpanel"
              aria-labelledby="pills-params-tab"
            >
              <GenericTable
                {...this.props}
                title="Params"
                dataArray={this.state.originalParams}
                props_from_parent={this.propsFromChild.bind(this)}
                original_data={[...this.state.params]}
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
                  title="Headers"
                  dataArray={this.state.originalHeaders}
                  props_from_parent={this.propsFromChild.bind(this)}
                  original_data={[...this.state.headers]}
                ></GenericTable>
              </div>
            </div>
            <div
              className="tab-pane fade"
              id="pills-contact"
              role="tabpanel"
              aria-labelledby="pills-body-tab"
            >
              <BodyContainer
                set_body={this.setBody.bind(this)}
                body={this.state.data.body}
              />
            </div>
          </div>
        </div>

        <div className="endpoint-response-container-wrapper">
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
