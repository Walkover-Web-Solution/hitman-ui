import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { toast } from "react-toastify";
import store from "../../store/store";
import { isDashboardRoute } from "../common/utility";
import CodeWindow from "./codeWindow";
import CreateEndpointForm from "./createEndpointForm";
import DisplayResponse from "./displayResponse";
import endpointApiService from "./endpointApiService";
import GenericTable from "./genericTable";
import HostContainer from "./hostContainer";
import { addEndpoint, updateEndpoint } from "./redux/endpointsActions";
import Body from "./displayBody";

var URI = require("urijs");

const mapStateToProps = state => {
  return {
    groups: state.groups,
    versions: state.versions,
    endpoints: state.endpoints,
    environment: state.environment.environments[
      state.environment.currentEnvironmentId
    ] || { id: null, name: "No Environment" }
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

  state = {
    data: {
      name: "",
      method: "GET",
      body: {},
      uri: "",
      updatedUri: ""
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
    selectedBodyType: ""
  };

  customState = {
    BASE_URL: ""
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
      description: ""
    }
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
          description: ""
        }
      ];
      originalHeaders = [
        {
          checked: "notApplicable",
          key: "",
          value: "",
          description: ""
        }
      ];

      this.setState({
        originalParams,
        originalHeaders,
        rawBody: [
          {
            checked: "notApplicable",
            key: "",
            value: "",
            description: ""
          }
        ],
        urlencodedBody: [
          {
            checked: "notApplicable",
            key: "",
            value: "",
            description: ""
          }
        ],
        formdataBody: [
          {
            checked: "notApplicable",
            key: "",
            value: "",
            description: ""
          }
        ],
        selectedBodyType: null
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

      //To fetch originalHeaders from Headers
      originalHeaders = this.fetchoriginalHeaders(endpoint.headers);

      //To fetch body from endpoint
      this.fetchBody(endpoint.body);

      this.setState({
        data: {
          method: endpoint.requestType,
          uri: endpoint.uri,
          updatedUri: endpoint.uri,
          name: endpoint.name,
          body: JSON.stringify(endpoint.body, null, 4)
        },
        originalParams,
        originalHeaders,
        endpoint,
        groupId,
        selectedBodyType: endpoint.body.type,
        title: "update endpoint"
      });
    }
  }
  handleChange = e => {
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
          description: this.state.originalParams[i].description
        });
      }
    }
    for (let i = 0; i < keys.length; i++) {
      originalParams.push({
        checked: "true",
        key: keys[i],
        value: values[i],
        description: description[i]
      });
    }
    originalParams.push(this.structueParamsHeaders[0]);
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
    console.log(rawBody);
    let body = {};
    let { method } = this.state.data;
    console.log("method", method);
    if (method === "POST" || method === "PUT") {
      try {
        body = JSON.parse(rawBody);
        return body;
      } catch (error) {
        toast.error("Invalid Body");
        return body;
      }
    }
    return body;
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
    let body = this.parseBody(this.state.data);
    let headerJson = {};
    Object.keys(headersData).forEach(header => {
      headerJson[headersData[header].key] = headersData[header].value;
    });

    this.handleApiCall(api, body, headerJson);
  };

  handleSave = async (groupId, EndpointName) => {
    if (!(this.state.groupId || groupId)) {
      this.openEndpointFormModal();
    } else {
      let body = this.doSubmitBody();
      const headersData = this.doSubmitHeader();
      const updatedParams = this.doSubmitParam();
      const endpoint = {
        uri: this.uri.current.value,
        name: EndpointName || this.name.current.value,
        requestType: this.state.data.method,
        body: body,
        headers: headersData,
        params: updatedParams,
        BASE_URL: this.customState.BASE_URL
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
          groupId: groupId || this.state.groupId
        });
      }
    }
  };

  makeBody(type, value) {
    let body = {
      type,
      value
    };
    return body;
  }

  doSubmitBody() {
    console.log("this.state.rawBody", this.state.rawBody);
    let body = {};
    const selectedBodyType = this.state.selectedBodyType;
    if (this.state.selectedBodyType === "urlencodedBody") {
      body = this.state.urlencodedBody;
    }
    if (this.state.selectedBodyType === "rawBody") {
      body = this.parseBody(this.state.rawBody);
      console.log("body", body);
    }
    body = this.makeBody(this.state.selectedBodyType, body);
    console.log("body", body);
    return body;
  }

  doSubmitHeader() {
    let originalHeaders = [...this.state.originalHeaders];
    let updatedHeaders = {};
    let updatedHeadersArray = [];
    for (let i = 0; i < originalHeaders.length; i++) {
      if (originalHeaders[i].key === "") {
        continue;
      } else {
        updatedHeadersArray.push(originalHeaders[i]);
        updatedHeaders[originalHeaders[i].key] = {
          checked: originalHeaders[i].checked,
          value: originalHeaders[i].value,
          description: originalHeaders[i].description
        };
      }
    }
    const endpoint = { ...this.state.endpoint };
    endpoint.headers = { ...updatedHeaders };
    this.setState({
      originalHeaders: updatedHeadersArray,
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
    if (name === "selectedBodyType") {
      this.setState({ selectedBodyType: value });
    }
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
    if (name === "rawBody") {
      this.setState({ rawBody: value });
    }
    if (name === "x-www-form-urlencoded") {
      this.setState({ urlencodedBody: value });
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

  fetchoriginalParams(params) {
    let originalParams = [];
    let i = 0;
    for (i = 0; i < Object.keys(params).length; i++) {
      originalParams[i] = {
        checked: params[Object.keys(params)[i]].checked,
        key: Object.keys(params)[i],
        value: params[Object.keys(params)[i]].value,
        description: params[Object.keys(params)[i]].description
      };
    }
    originalParams[i] = {
      checked: "notApplicable",
      key: "",
      value: "",
      description: ""
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
        description: headers[Object.keys(headers)[i]].description
      };
    }
    originalHeaders[i] = {
      checked: "notApplicable",
      key: "",
      value: "",
      description: ""
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
        processedHeaders.push({
          name: headers[Object.keys(headers)[i]].key,
          value: headers[Object.keys(headers)[i]].value,
          comment: headers[Object.keys(headers)[i]].description
        });
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
          comment: params[Object.keys(params)[i]].description
        });
      }
    }
    return processedParams;
  }

  makePostData(body) {
    let postData = {
      mimeType: "application/json",
      text: '{"hello":"world"}',
      comment: "Sample json body"
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
      postData: this.makePostData(body),
      queryString: this.makeParams(originalParams)
    };
    if (!harObject.url.split(":")[1] || harObject.url.split(":")[0] === "") {
      harObject.url = "https://";
    }
    this.openCodeWindow(harObject);
  }

  openCodeWindow(harObject) {
    this.setState({
      showCodeWindow: true,
      harObject
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

  fetchBody(body) {
    console.log("body", body);
    if (body.type === "rawBody") {
      this.rawBody = JSON.stringify(body.value, null, 4);
    } else {
      this.rawBody = null;
    }
    if (body.type === "urlencodedBody") {
      console.log("ddj");
      this.urlencodedBody = body.value;
      console.log("this.urlencodedBody", this.urlencodedBody);
    } else {
      this.urlencodedBody = null;
    }
    if (body.type === "formdataBody") {
      this.formdataBody = body.value;
    } else {
      this.formdataBody = null;
    }
  }
  render() {
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
          body: JSON.stringify({}, null, 4),
          uri: "",
          updatedUri: ""
        },
        startTime: "",
        timeElapsed: "",
        response: {},
        endpoint: {},
        groupId: this.props.location.groupId,
        title: "Add New Endpoint",
        flagResponse: false,
        rawBody: [
          {
            checked: "notApplicable",
            key: "",
            value: "",
            description: ""
          }
        ],
        urlencodedBody: [
          {
            checked: "notApplicable",
            key: "",
            value: "",
            description: ""
          }
        ],
        formdataBody: [
          {
            checked: "notApplicable",
            key: "",
            value: "",
            description: ""
          }
        ],
        selectedBodyType: null,
        originalHeaders: [
          {
            checked: "notApplicable",
            key: "",
            value: "",
            description: ""
          }
        ],
        originalParams: [
          {
            checked: "notApplicable",
            key: "",
            value: "",
            description: ""
          }
        ]
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

      //To fetch originalHeaders from Headers
      const originalHeaders = this.fetchoriginalHeaders(endpoint.headers);

      //To fetch body from endpoint
      this.fetchBody(endpoint.body);

      this.setState({
        data: {
          method: endpoint.requestType,
          uri: endpoint.uri,
          updatedUri: endpoint.uri,
          name: endpoint.name,
          body: endpoint.body.value
          // JSON.stringify(endpoint.body, null, 4)
        },
        title: "update endpoint",
        response: {},
        groupId: this.props.location.endpoint.groupId,
        originalParams,
        originalHeaders,
        selectedBodyType: endpoint.body.type,
        endpoint,
        flagResponse: false
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
          <button
            className="btn"
            type="button"
            id="show-code-snippets-button"
            onClick={() => this.prepareHarObject()}
            style={{
              float: "right",
              color: "#f28100",
              fontFamily: "Times New Roman"
            }}
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

          <div className="tab-content" id="pills-tabContent">
            <div
              className="tab-pane fade show active"
              id="pills-home"
              role="tabpanel"
              aria-labelledby="pills-params-tab"
            >
              <GenericTable
                title="Params"
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
                  title="Headers"
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
              <Body
                props_from_parent={this.propsFromChild.bind(this)}
                rawBody={this.state.rawBody ? this.state.rawBody : this.rawBody}
                formdataBody={
                  this.state.formdataBody
                    ? this.state.formdataBody
                    : this.formdataBody
                }
                urlencodedBody={
                  this.state.urlencodedBody
                    ? this.state.urlencodedBody
                    : this.urlencodedBody
                }
                selectedBodyType={this.state.selectedBodyType}
              ></Body>

              {/* <textarea
                className="form-control"
                ref={this.body}
                name="body"
                id="body"
                rows="8"
                onChange={this.handleChange}
                value={this.state.data.body}
              /> */}
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
