import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { toast } from "react-toastify";
import validator from "validator";
import store from "../../store/store";
import { isDashboardRoute } from "../common/utility";
import BodyDescription from "./bodyDescription";
import CodeWindow from "./codeWindow";
import CreateEndpointForm from "./createEndpointForm";
import BodyContainer from "./displayBody";
import DisplayDescription from "./displayDescription";
import DisplayResponse from "./displayResponse";
import endpointApiService from "./endpointApiService";
import "./endpoints.scss";
import GenericTable from "./genericTable";
import HostContainer from "./hostContainer";
import PublicBodyContainer from "./publicBodyContainer";
import { addEndpoint, updateEndpoint } from "./redux/endpointsActions";
import tabStatusTypes from "../tabs/tabStatusTypes";
import tabService from "../tabs/tabService";
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
    currentEnvironmentId: state.environment.currentEnvironmentId,
    environments: state.environment.environments,
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
  // name = React.createRef();
  paramKey = React.createRef();

  state = {
    data: {
      name: "",
      method: "GET",
      body: { type: "none", value: "" },
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
    oldDescription: "",
    headers: [],
    params: [],
    bodyDescription: {
      key1: { default: "abcd", dataType: "string" },
      key2: { default: 4, dataType: "number" },
      key3: { default: true, dataType: "boolean" },
      key4: { default: [2], dataType: "Array of Integer" },
      key5: { default: ["a"], dataType: "Array of String" },
      key6: { default: { k1: "v1", k2: 10 }, dataType: "Object" },
      key7: {
        default: [{ k1: "v1", k2: 10 }],
        dataType: "Array of Objects",
        object: { k1: "v1", k2: 10 },
      },
      key8: {
        default: {
          k1: { k1: "v1", k2: 10, k3: 44 },
          k2: { k1: "v1", k2: 10 },
        },
        dataType: "Object of Objects",
        //object: { k1: "v1", k2: 10 },
      },
      key9: { default: [true], dataType: "Array of Boolean" },
    },
    updatedArray: {},
    objectDefinition: {},
  };

  customState = {
    BASE_URL: "",
    customBASE_URL: "",
  };

  setObjectDefinition(name, definition) {
    let objectDefinition = { ...this.state.objectDefinition };
    objectDefinition[name] = definition;
    this.setState({ objectDefinition });
  }

  deleteObjectDefinition(objectKey) {
    let objectDefinition = { ...this.state.objectDefinition };
    delete objectDefinition[objectKey];
    this.setState({ objectDefinition });
  }
  // test() {
  //   const test = "hello World!";
  //   console.log("test", test);
  //   this.setState({ test });
  // }

  async componentDidMount() {
    if (this.props.location.pathname.split("/")[3] === "new") {
      this.setState({
        data: {
          name: "",
          method: "GET",
          body: { type: "none", value: null },
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
    }
    let flag = 0;
    if (!isDashboardRoute(this.props)) {
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

  fetchEndpoint(flag, endpointId) {
    let endpoint = {};
    let originalParams = [];
    let originalHeaders = [];
    let pathVariables = [];
    const split = this.props.location.pathname.split("/");

    if (isDashboardRoute(this.props)) {
      if (!endpointId) endpointId = split[3];
    } else endpointId = split[4];

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
      this.customState.customBASE_URL = endpoint.BASE_URL;

      //To fetch Path Variables
      if (endpoint.pathVariables.length !== 0) {
        pathVariables = this.fetchPathVariables(endpoint.pathVariables);
        this.setState({ pathVariables });
      }

      let updatedArray = {};
      //let bodyDescription = [];
      // if (endpoint.body.type === "raw1") {
      //   updatedArray = JSON.parse(endpoint.body.value);
      //   bodyDescription = endpoint.bodyDescription;
      // }
      if (!isDashboardRoute(this.props)) {
        if (endpoint.body.type === "JSON") {
          let body = JSON.parse(endpoint.body.value);
          const keys = Object.keys(this.state.bodyDescription);
          keys.map((k) => (body[k] = this.state.bodyDescription[k].default));
          body = { type: "JSON", value: JSON.stringify(body) };
          endpoint.body = body;
        }
      }

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
        title: "update endpoint",
        // bodyDescription,
        updatedArray,
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
      let path = new URI(e.currentTarget.value);
      path = path.pathname();
      let pathVariableKeys = path.split("/");
      let pathVariableKeysObject = {};
      for (let i = 0; i < pathVariableKeys.length; i++) {
        pathVariableKeysObject[pathVariableKeys[i]] = false;
      }
      this.setPathVariables(pathVariableKeys, pathVariableKeysObject);
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
    if (isDashboardRoute(this.props)) {
      tabService.markTabAsModified(this.props.tab.id);
    }
    this.setState({ data });
  };

  setPathVariables(pathVariableKeys, pathVariableKeysObject) {
    let pathVariables = [];
    for (let i = 1; i < pathVariableKeys.length; i++) {
      if (
        pathVariableKeys[i][0] === ":" &&
        pathVariableKeysObject[pathVariableKeys[i]] === false
      ) {
        pathVariableKeysObject[pathVariableKeys[i]] = true;
        pathVariables.push({
          checked: "notApplicable",
          key: pathVariableKeys[i].slice(1),
          value: this.state.pathVariables[i - 1]
            ? this.state.pathVariables[i - 1].key === pathVariableKeys[i]
              ? this.state.pathVariables[i - 1].value
              : ""
            : "",
          description: this.state.pathVariables[i - 1]
            ? this.state.pathVariables[i - 1].key === pathVariableKeys[i]
              ? this.state.pathVariables[i - 1].description
              : ""
            : "",
        });
      }
    }

    this.setState({ pathVariables });
  }

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

  async handleApiCall(api, body, headerJson, bodyType) {
    let responseJson = {};
    try {
      let header = this.replaceVariablesInJson(headerJson);
      responseJson = await endpointApiService.apiTest(
        api,
        this.state.data.method,
        body,
        header,
        bodyType
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
  setPathVariableValues() {
    let uri = new URI(this.uri.current.value);
    uri = uri.pathname();
    let pathParameters = uri.split("/");
    let path = "";
    let counter = 0;
    for (let i = 0; i < pathParameters.length; i++) {
      if (pathParameters[i][0] === ":") {
        path = path + "/" + this.state.pathVariables[counter].value;
        counter++;
      } else if (pathParameters[i].length !== 0) {
        path = path + "/" + pathParameters[i];
      }
    }
    return path;
  }

  validateBodyParams() {
    let bodyDescription = [...this.state.bodyDescription];
    let rawBody = this.parseBody(this.state.data.body.value);
    let rawBodyArray = Object.keys(rawBody);
    for (let index = 0; index < bodyDescription.length; index++) {
      let dataType = bodyDescription[index].dataType;
      dataType = dataType.toLowerCase();
      let name = bodyDescription[index].name;
      if (dataType === "boolean") {
        if (!validator.isBoolean(rawBody[name])) {
          toast.error("cannot validate body according to body description.");
        }
      } else if (dataType === "integer") {
        if (!validator.isInt(rawBody[name])) {
          toast.error("cannot validate body according to body description.");
        }
      } else if (dataType === "long") {
        // validator.iaLong(rawBody[name])
      } else if (dataType === "float") {
        if (!validator.isFloat(rawBody[name])) {
          toast.error("cannot validate body according to body description.");
        }
      } else if (dataType === "double") {
      } else if (dataType === "yyyy-mm-dd") {
        const abc = /^(19[5-9][0-9]|20[0-4][0-9]|2050)[-/](0?[1-9]|1[0-2])[-/](0?[1-9]|[12][0-9]|3[01])$/gim;
        let match = abc.exec(rawBody[name]);
      } else if (dataType === "datetime") {
        const abc1 = /^\d\d\d\d-(0?[1-9]|1[0-2])-(0?[1-9]|[12][0-9]|3[01]) (00|[0-9]|1[0-9]|2[0-3]):([0-9]|[0-5][0-9]):([0-9]|[0-5][0-9])$/g;
        let match = abc1.exec(rawBody[name]);
      } else if (dataType === "timestamp") {
        var valid = new Date(rawBody[name]).getTime() > 0;
        if (!valid) {
          toast.error("cannot validate body according to body description.");
        }
      } else if (dataType === "array of integer") {
        for (let i = 0; i < rawBody[name].length; i++) {
          const element = rawBody[name][i];
          if (validator.isInt(element)) continue;
          else {
            toast.error("cannot validate body according to body description.");
            break;
          }
        }
      } else if (dataType === "array of long") {
      } else if (dataType === "array of double") {
      } else if (dataType === "array of float") {
        for (let i = 0; i < rawBody[name].length; i++) {
          const element = rawBody[name][i];
          if (validator.isFloat(element)) continue;
          else {
            toast.error("cannot validate body according to body description.");
            break;
          }
        }
      } else if (dataType === "array of boolean") {
        for (let i = 0; i < rawBody[name].length; i++) {
          const element = rawBody[name][i];
          if (validator.isBoolean(element)) continue;
          else {
            toast.error("cannot validate body according to body description.");
            break;
          }
        }
      } else if (dataType === "array of datetime") {
      } else if (dataType === "array of yyyy-mm-dd") {
      } else if (dataType === "array of timestamp") {
      }
    }
  }

  handleSend = async () => {
    let startTime = new Date().getTime();
    let response = {};
    this.setState({ startTime, response });
    const headersData = this.doSubmitHeader();
    const BASE_URL = this.customState.BASE_URL;
    let uri = new URI(this.uri.current.value);
    let queryparams = uri.search();
    let path = this.setPathVariableValues();
    let api = BASE_URL + path + queryparams;
    api = this.replaceVariables(api);
    let headerJson = {};
    Object.keys(headersData).forEach((header) => {
      headerJson[header] = headersData[header].value;
    });
    let { body, headers } = this.formatBody(this.state.data.body, headerJson);
    this.handleApiCall(api, body, headers, this.state.data.body.type);
  };

  handleSave = async (groupId, EndpointName) => {
    if (!(this.state.groupId || groupId)) {
      this.openEndpointFormModal();
    } else {
      let body = this.state.data.body;
      if (this.state.data.body.type === "raw") {
        body.value = this.parseBody(body.value);
      }
      if (!(this.state.data.body.type === "raw1")) {
        const bodyDescription = [];
        const updatedArray = {};
        this.setState({ updatedArray, bodyDescription });
      }
      const headersData = this.doSubmitHeader();
      const updatedParams = this.doSubmitParam();
      const pathVariables = this.doSubmitPathVariables();
      const endpoint = {
        uri: this.uri.current.value,
        name: EndpointName || this.state.data.name,
        requestType: this.state.data.method,
        body: body,
        headers: headersData,
        params: updatedParams,
        pathVariables: pathVariables,
        BASE_URL:
          this.customState.selectedHost === "customHost"
            ? this.customState.BASE_URL
            : null,
      };
      // if (endpoint.name === "" || endpoint.uri === "")
      if (endpoint.name === "") toast.error("Please enter Endpoint name");
      else if (this.props.location.pathname.split("/")[3] === "new") {
        endpoint.requestId = this.props.tab.id;
        this.props.addEndpoint(endpoint, groupId || this.state.groupId);
      } else if (this.state.title === "update endpoint") {
        this.props.updateEndpoint({
          ...endpoint,
          id: this.state.endpoint.id,
          groupId: groupId || this.state.groupId,
        });
      }
    }
    tabService.markTabAsSaved(this.props.tab.id);
  };

  doSubmitPathVariables() {
    let updatedPathVariables = {};
    if (this.state.pathVariables) {
      let pathVariables = [...this.state.pathVariables];
      for (let i = 0; i < pathVariables.length; i++) {
        if (pathVariables[i].key === "") {
          continue;
        } else {
          updatedPathVariables[pathVariables[i].key] = {
            checked: pathVariables[i].checked,
            value: pathVariables[i].value,
            description: pathVariables[i].description,
          };
        }
      }
      const endpoint = { ...this.state.endpoint };
      endpoint.pathVariables = { ...updatedPathVariables };
      this.setState({
        pathVariables,
        endpoint,
      });
    }
    return updatedPathVariables;
  }

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
    if (isDashboardRoute(this.props)) {
      tabService.markTabAsModified(this.props.tab.id);
    }
  }

  propsFromChild(name, value) {
    if (name === "Params") {
      this.handleUpdateUri(value);
      this.setState({ originalParams: value });
    }

    if (name === "Headers") {
      this.setState({ originalHeaders: value });
    }

    if (name === "Path Variables") {
      this.setState({ pathVariables: value });
    }

    if (
      (isDashboardRoute(this.props) && name === "Params") ||
      name === "Headers" ||
      name === "Path Variables"
    ) {
      tabService.markTabAsModified(this.props.tab.id);
    }
  }

  setPublicBody(bodyDescription) {
    let json = {};
    Object.keys(bodyDescription).map(
      (key) => (json[key] = bodyDescription[key].default)
    );
    json = JSON.stringify(json);
    let data = { ...this.state.data };
    data.body = { type: "JSON", value: json };
    this.setState({ bodyDescription, data });
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

  fetchPathVariables(pathVariables) {
    let originalPathVariables = [];
    let i = 0;
    for (i = 0; i < Object.keys(pathVariables).length; i++) {
      originalPathVariables[i] = {
        checked: pathVariables[Object.keys(pathVariables)[i]].checked,
        key: Object.keys(pathVariables)[i],
        value: pathVariables[Object.keys(pathVariables)[i]].value,
        description: pathVariables[Object.keys(pathVariables)[i]].description,
      };
    }
    return originalPathVariables;
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

  updateArray(updatedArray) {
    this.setState({ updatedArray });
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
    let params = [];
    let text = "";
    if (
      body.type === "application/x-www-form-urlencoded" ||
      body.type === "multipart/form-data"
    ) {
      for (let i = 0; i < body.value.length - 1; i++) {
        params.push({
          name: body.value[i].key,
          value: body.value[i].value,
        });
      }
    }
    let postData = {
      mimeType: body.type,
      params: params,
      text: params.length === 0 ? body.value : "",
      comment: "",
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
      postData: body.type === "none" ? null : this.makePostData(body),
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

  setBaseUrl(BASE_URL, selectedHost) {
    this.customState.BASE_URL = BASE_URL;
    this.customState.selectedHost = selectedHost;
  }

  setBody(bodyType, body) {
    let data = { ...this.state.data };
    data.body = { type: bodyType, value: body };
    if (bodyType !== "multipart/form-data") {
      this.setHeaders(bodyType);
    }
    this.setState({ data });

    if (isDashboardRoute(this.props)) {
      tabService.markTabAsModified(this.props.tab.id);
    }
  }

  setBodyDescription(bodyDescription) {
    this.setState({ bodyDescription });
  }

  setHeaders(bodyType) {
    let originalHeaders = this.state.originalHeaders;
    let updatedHeaders = [];
    this.contentTypeFlag = false;
    for (let i = 0; i < originalHeaders.length; i++) {
      if (
        originalHeaders[i].key === "Content-type" ||
        originalHeaders[i].key === ""
      ) {
        continue;
      } else {
        updatedHeaders.push(originalHeaders[i]);
      }
    }
    updatedHeaders.push({
      checked: "true",
      key: "Content-type",
      value: "",
      description: "",
    });

    switch (bodyType) {
      case "application/x-www-form-urlencoded":
        updatedHeaders[updatedHeaders.length - 1].value =
          "application/x-www-form-urlencoded";
        break;
      case "TEXT":
        updatedHeaders[updatedHeaders.length - 1].value = "text/plain";
        break;
      case "JSON":
        updatedHeaders[updatedHeaders.length - 1].value = "application/JSON";
        break;
      case "HTML":
        updatedHeaders[updatedHeaders.length - 1].value = "text/HTML";
        break;
      case "XML":
        updatedHeaders[updatedHeaders.length - 1].value = "application/XML";
        break;
      case "JavaScript":
        updatedHeaders[updatedHeaders.length - 1].value =
          "application/JavaScript";
        break;
    }
    updatedHeaders.push({
      checked: "notApplicable",
      key: "",
      value: "",
      description: "",
    });
    this.setState({ originalHeaders: updatedHeaders });
  }

  propsFromDescription(title, data) {
    if (title === "data") {
      this.setState({ data: data });
      if (isDashboardRoute(this.props)) {
        tabService.markTabAsModified(this.props.tab.id);
      }
    }
    if (title === "endpoint") this.setState({ endpoint: data });
    if (title === "oldDescription") this.setState({ oldDescription: data });
  }

  formatBody(body, headers) {
    let finalBodyValue = null;
    switch (body.type) {
      case "raw":
        finalBodyValue = this.parseBody(body.value);
        return { body: finalBodyValue, headers };
      case "multipart/form-data":
        headers["Content-type"] = "multipart/form-data";
        let formData = new FormData();
        body.value.map((o) => formData.set(o.key, o.value));
        return { body: formData, headers };
      case "application/x-www-form-urlencoded":
        let urlEncodedData = {};
        for (let i = 0; i < body.value.length; i++) {
          if (body.value[i].key.length !== 0) {
            urlEncodedData[body.value[i].key] = body.value[i].value;
            // let encodedKey = encodeURIComponent(body.value[i].key);
            // let encodedValue = encodeURIComponent(body.value[i].value);
            // urlEncodedData.push(encodedKey + "=" + encodedValue);
          }
        }
        // urlEncodedData = urlEncodedData.join("&");
        return { body: urlEncodedData, headers };
      default:
        return { body: body.value, headers };
    }
  }

  render() {
    if (
      isDashboardRoute(this.props) &&
      this.state.groupId &&
      this.props.tab.status === tabStatusTypes.DELETED
    ) {
      this.setState({ groupId: null });
    }

    if (
      this.props.save_endpoint_flag &&
      this.props.tab.id === this.props.selected_tab_id
    ) {
      this.props.handle_save_endpoint(false);
      this.handleSave();
    }
    if (
      isDashboardRoute(this.props) &&
      this.props.location.pathname.split("/")[3] !== "new" &&
      this.state.endpoint.id !== this.props.tab.id &&
      this.props.endpoints[this.props.tab.id]
    ) {
      let flag = 0;

      if (isDashboardRoute(this.props)) {
        this.fetchEndpoint(flag, this.props.tab.id);
        store.subscribe(() => {
          if (!this.props.location.title && !this.state.title) {
            this.fetchEndpoint(flag, this.props.tab.id);
          }
        });
      }
    }

    if (
      !isDashboardRoute(this.props) &&
      this.props.location.pathname.split("/")[3] !== "new" &&
      this.state.endpoint.id !== this.props.location.pathname.split("/")[4] &&
      this.props.endpoints[this.props.location.pathname.split("/")[4]]
    ) {
      if (!isDashboardRoute(this.props)) {
        this.fetchEndpoint(0, this.props.location.pathname.split("/")[4]);
        store.subscribe(() => {
          if (!this.props.location.title && !this.state.title) {
            this.fetchEndpoint(0, this.props.location.pathname.split("/")[4]);
          }
        });
      }
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
        {this.state.showCodeWindow && this.showCodeWindow()}
        <DisplayDescription
          {...this.props}
          endpoint={this.state.endpoint}
          data={this.state.data}
          old_description={this.state.oldDescription}
          props_from_parent={this.propsFromDescription.bind(this)}
        />

        <div className="endpoint-url-container">
          <div className="input-group-prepend">
            <div>
              <div className="dropdown">
                <button
                  className="btn btn-secondary dropdown-toggle"
                  type="button"
                  id="dropdownMenuButton"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                  disabled={isDashboardRoute(this.props) ? null : true}
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
            </div>

            <HostContainer
              {...this.props}
              groupId={this.state.groupId}
              set_base_url={this.setBaseUrl.bind(this)}
              custom_host={this.state.endpoint.BASE_URL}
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
              disabled={isDashboardRoute(this.props) ? null : true}
            />
          </div>
          <div className="d-flex">
            <button
              className="btn"
              type="submit"
              id="send-request-button"
              onClick={() => this.handleSend()}
            >
              {isDashboardRoute(this.props) ? "Send" : "Try"}
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
            {isDashboardRoute(this.props) ? (
              <ul className="nav nav-tabs" id="pills-tab" role="tablist">
                <li className="nav-item">
                  <a
                    className="nav-link active"
                    id="pills-params-tab"
                    data-toggle="pill"
                    href={`#params-${this.props.tab.id}`}
                    role="tab"
                    aria-controls={`params-${this.props.tab.id}`}
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
                    href={`#headers-${this.props.tab.id}`}
                    role="tab"
                    aria-controls={`headers-${this.props.tab.id}`}
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
                    href={`#body-${this.props.tab.id}`}
                    role="tab"
                    aria-controls={`body-${this.props.tab.id}`}
                    aria-selected="false"
                  >
                    Body
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    id="pills-body-description-tab"
                    data-toggle="pill"
                    href={`#body-description-${this.props.tab.id}`}
                    role="tab"
                    aria-controls={`body-description-${this.props.tab.id}`}
                    aria-selected="false"
                  >
                    Body Description
                  </a>
                </li>
              </ul>
            ) : null}
          </div>
          {isDashboardRoute(this.props) ? (
            <div className="tab-content" id="pills-tabContent">
              <div
                className="tab-pane fade show active"
                id={`params-${this.props.tab.id}`}
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
                {this.state.pathVariables &&
                  this.state.pathVariables.length !== 0 && (
                    <div>
                      <GenericTable
                        {...this.props}
                        title="Path Variables"
                        dataArray={this.state.pathVariables}
                        props_from_parent={this.propsFromChild.bind(this)}
                        original_data={[...this.state.pathVariables]}
                      ></GenericTable>
                    </div>
                  )}
              </div>
              <div
                className="tab-pane fade"
                id={`headers-${this.props.tab.id}`}
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
                id={`body-${this.props.tab.id}`}
                role="tabpanel"
                aria-labelledby="pills-body-tab"
              >
                <BodyContainer
                  {...this.props}
                  set_body={this.setBody.bind(this)}
                  body={this.state.data.body}
                  endpoint_id={this.props.tab.id}
                  update_array={this.updateArray.bind(this)}
                  updated_array={this.state.updatedArray}
                  body_description={this.state.bodyDescription}
                  object_definition={this.state.objectDefinition}
                />
              </div>
              <div
                className="tab-pane fade"
                id={`body-description-${this.props.tab.id}`}
                role="tabpanel"
                aria-labelledby="pills-body-description-tab"
              >
                {/* <BodyDescription
                  set_body_description={this.setBodyDescription.bind(this)}
                  update_array={this.updateArray.bind(this)}
                  updated_array={this.state.updatedArray}
                  body_description={this.state.bodyDescription}
                  object_definition={this.state.objectDefinition}
                  delete_object_definition={this.deleteObjectDefinition.bind(
                    this
                  )}
                  set_object_definition={this.setObjectDefinition.bind(this)}
                /> */}
              </div>
            </div>
          ) : (
            <div>
              {this.state.params.length > 1 && (
                <GenericTable
                  {...this.props}
                  title="Params"
                  dataArray={this.state.originalParams}
                  props_from_parent={this.propsFromChild.bind(this)}
                  original_data={[...this.state.params]}
                ></GenericTable>
              )}
              {this.state.headers.length > 1 && (
                <GenericTable
                  {...this.props}
                  title="Headers"
                  dataArray={this.state.originalHeaders}
                  props_from_parent={this.propsFromChild.bind(this)}
                  original_data={[...this.state.headers]}
                ></GenericTable>
              )}
              <PublicBodyContainer
                {...this.props}
                set_body={this.setBody.bind(this)}
                body={this.state.data.body}
                set_public_body={this.setPublicBody.bind(this)}
                body_description={this.state.bodyDescription}
              ></PublicBodyContainer>
            </div>
          )}
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
