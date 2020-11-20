import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { toast } from "react-toastify";
import store from "../../store/store";
import { isDashboardRoute } from "../common/utility";
import { isSavedEndpoint } from "../common/utility";
import tabService from "../tabs/tabService";
import tabStatusTypes from "../tabs/tabStatusTypes";
import CodeTemplate from "./codeTemplate";
import CreateEndpointForm from "./createEndpointForm";
import BodyContainer from "./displayBody";
import DisplayDescription from "./displayDescription";
import DisplayResponse from "./displayResponse";
import SampleResponse from "./sampleResponse";
import { getCurrentUser } from "../auth/authService";
import endpointApiService from "./endpointApiService";
import "./endpoints.scss";
import GenericTable from "./genericTable";
import HostContainer from "./hostContainer";
import PublicBodyContainer from "./publicBodyContainer";
import {
  addEndpoint,
  updateEndpoint,
  setAuthorizationType,
} from "./redux/endpointsActions";
import {
  setAuthorizationResponses,
  setAuthorizationData,
} from "../collectionVersions/redux/collectionVersionsActions";
import collectionsApiService from "../collections/collectionsApiService";
import indexedDbService from "../indexedDb/indexedDbService";
import Authorization from "./displayAuthorization";
import LoginSignupModal from "../main/loginSignupModal"
const shortid = require('shortid');

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
    add_endpoint: (newEndpoint, groupId) =>
      dispatch(addEndpoint(ownProps.history, newEndpoint, groupId)),
    update_endpoint: (editedEndpoint) =>
      dispatch(updateEndpoint(editedEndpoint)),
    set_authorization_responses: (versionId, authResponses) =>
      dispatch(setAuthorizationResponses(versionId, authResponses)),
    set_authorization_type: (endpointId, authData) =>
      dispatch(setAuthorizationType(endpointId, authData)),
    set_authorization_data: (versionId, data) =>
      dispatch(setAuthorizationData(versionId, data)),
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
    methodList: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    environment: {},
    startTime: "",
    timeElapsed: "",
    response: {},
    endpoint: {},
    groupId: null,
    title: "",
    flagResponse: false,
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
    authType: null,
    oldDescription: "",
    headers: [],
    publicBodyFlag: true,
    params: [],
    bodyDescription: {},
    fieldDescription: {},
    sampleResponseArray: [],
    sampleResponseFlagArray: [],
  };

  customState = {
    BASE_URL: "",
    customBASE_URL: "",
  };

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
        authType: null,
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
      this.setAccessToken();
    }
    // if (!isDashboardRoute(this.props)) {
    //   let collectionIdentifier = this.props.location.pathname.split("/")[2];
    //   this.fetchPublicCollection(collectionIdentifier);
    // }
  }

  structueParamsHeaders = [
    {
      checked: "notApplicable",
      key: "",
      value: "",
      description: "",
    },
  ];

  async fetchPublicCollection(collectionId) {
    let collection = await collectionsApiService.getCollection(collectionId);
    if (collection.data.environment != null) {
      this.setState({
        publicCollectionEnvironmentId: collection.data.environment.id,
        originalEnvironmentReplica: collection.data.environment,
      });
    }
    if (collection.data.environment == null) {
      this.setState({
        publicCollectionEnvironmentId: null,
        originalEnvironmentReplica: null,
      });
    }
  }
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
      let authType = {};
      if (endpoint.authorizationType !== null) {
        authType = {
          type: endpoint.authorizationType.type,
          value: endpoint.authorizationType.value,
        };
      } else {
        authType = endpoint.authorizationType;
      }

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
      const fieldDescription = this.getFieldDescription(
        endpoint.bodyDescription
      );

      const sampleResponseFlagArray = this.getSampleResponseFlagArray(
        endpoint.sampleResponse
      );

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
        sampleResponseArray: endpoint.sampleResponse || [],
        sampleResponseFlagArray,
        groupId,
        oldDescription: endpoint.description,
        title: "update endpoint",
        bodyDescription: endpoint.bodyDescription,
        authType,
        fieldDescription,
        publicBodyFlag: true,
        bodyFlag: true,
        response: {},
      });
      this.setAccessToken();
    }
  }

  getFieldDescription(bodyDescription) {
    let keys = Object.keys(bodyDescription);
    let fieldDescription = {};
    for (let i = 0; i < keys.length; i++) {
      fieldDescription[keys[i]] = bodyDescription[keys[i]].description;
    }
    return fieldDescription;
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

  getSampleResponseFlagArray(sampleResponse) {
    let sampleResponseFlagArray = [];
    if (sampleResponse) {
      let index = 0;
      while (index < sampleResponse.length) {
        sampleResponseFlagArray.push(!isDashboardRoute(this.props));
        index++;
      }
    }
    return sampleResponseFlagArray;
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

    if (isDashboardRoute(this.props)) {
      if (!this.props.environment.variables) {
        return str.replace(regexp, "");
      }
      do {
        variables.push(match[1]);
      } while ((match = regexp.exec(str)) !== null);
      for (let i = 0; i < variables.length; i++) {
        if (!this.props.environment.variables[variables[i]]) {
          str = str.replace(`{{${variables[i]}}}`, "");
        } else if (
          isDashboardRoute(this.props) &&
          this.props.environment.variables[variables[i]].currentValue
        ) {
          str = str.replace(
            `{{${variables[i]}}}`,
            this.props.environment.variables[variables[i]].currentValue
          );
        } else if (
          this.props.environment.variables[variables[i]].initialValue
        ) {
          str = str.replace(
            `{{${variables[i]}}}`,
            this.props.environment.variables[variables[i]].initialValue
          );
        } else {
          str = str.replace(`{{${variables[i]}}}`, "");
        }
      }
    } else {
      let environmentId = this.state.publicCollectionEnvironmentId;
      let originalEnv = this.state.originalEnvironmentReplica;
      if (
        this.props.environments[environmentId] !== undefined ||
        (this.props.environments[environmentId] === undefined &&
          originalEnv === null)
      ) {
        if (!this.props.environments[environmentId].variables) {
          return str.replace(regexp, "");
        }
        do {
          variables.push(match[1]);
        } while ((match = regexp.exec(str)) !== null);
        for (let i = 0; i < variables.length; i++) {
          if (!this.props.environments[environmentId].variables[variables[i]]) {
            str = str.replace(`{{${variables[i]}}}`, "");
          } else if (
            this.props.environments[environmentId].variables[variables[i]]
              .initialValue
          ) {
            str = str.replace(
              `{{${variables[i]}}}`,
              this.props.environments[environmentId].variables[variables[i]]
                .initialValue
            );
          } else {
            str = str.replace(`{{${variables[i]}}}`, "");
          }
        }
      }
      //If Environment is Deleted
      if (
        this.props.environments[environmentId] === undefined &&
        environmentId != null &&
        originalEnv != null
      ) {
        if (!originalEnv.variables) {
          return str.replace(regexp, "");
        }
        do {
          variables.push(match[1]);
        } while ((match = regexp.exec(str)) !== null);
        for (let i = 0; i < variables.length; i++) {
          if (!originalEnv.variables[variables[i]]) {
            str = str.replace(`{{${variables[i]}}}`, "");
          } else if (originalEnv.variables[variables[i]].initialValue) {
            str = str.replace(
              `{{${variables[i]}}}`,
              originalEnv.variables[variables[i]].initialValue
            );
          } else {
            str = str.replace(`{{${variables[i]}}}`, "");
          }
        }
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
      let response;
      if (responseJson?.data?.status) {
        const {
          status,
          statusText,
          response: data,
          headers,
        } = responseJson.data;
        response = { status, statusText, data, headers };
      } else {
        response = { ...responseJson };
      }
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
    let uniquePathParameters = {};
    let path = "";
    let counter = 0;
    for (let i = 0; i < pathParameters.length; i++) {
      if (pathParameters[i][0] === ":") {
        if (
          uniquePathParameters[pathParameters[i]] ||
          uniquePathParameters[pathParameters[i]] === ""
        ) {
          path = path + "/" + uniquePathParameters[pathParameters[i]];
        } else {
          uniquePathParameters[pathParameters[i]] = this.state.pathVariables[
            counter
          ].value;
          path = path + "/" + this.state.pathVariables[counter].value;
          counter++;
        }
      } else if (pathParameters[i].length !== 0) {
        path = path + "/" + pathParameters[i];
      }
    }
    return path;
  }

  setData = async ()=> {
    let obj={
      id:shortid.generate(),
      ...this.state
    }
    indexedDbService.addData("history",obj,obj.id);
  }
  getData = async ()=>{
    let obj= await indexedDbService.getAllValues("history");
    console.log(obj);
    }

  handleSend = async () => {
    let startTime = new Date().getTime();
    let response = {};
    this.setState({ startTime, response });
    const headersData = this.doSubmitHeader("send");
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
    try {
      if (this.state.data.body.type === "JSON") JSON.parse(body);
    } catch (e) {
      toast.error("Invalid JSON Body");
    }
    this.handleApiCall(api, body, headers, this.state.data.body.type);
    this.setData();
    this.getData();
  };

  extractPosition(groupId) {
    let count = -1;
    for (let i = 0; i < Object.keys(this.props.endpoints).length; i++) {
      if (
        groupId ===
        this.props.endpoints[Object.keys(this.props.endpoints)[i]].groupId
      ) {
        count = count + 1;
      }
    }
    return count + 1;
  }

  handleSave = async (groupId, EndpointName) => {
    if (!getCurrentUser()) {
      this.setState({
        showLoginSignupModal: true
      })
    }
    if (!(this.state.groupId || groupId)) {
      this.openEndpointFormModal();
    } else {
      let body = this.state.data.body;
      if (this.state.data.body.type === "raw") {
        body.value = this.parseBody(body.value);
      }

      const headersData = this.doSubmitHeader("save");
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
        bodyDescription:
          this.state.data.body.type === "JSON"
            ? this.state.bodyDescription
            : {},
        authorizationType: this.state.authType,
      };
      // if (endpoint.name === "" || endpoint.uri === "")
      if (endpoint.name === "") toast.error("Please enter Endpoint name");
      else if (this.props.location.pathname.split("/")[3] === "new") {
        endpoint.requestId = this.props.tab.id;
        endpoint.position = this.extractPosition(groupId || this.state.groupId);
        this.props.add_endpoint(endpoint, groupId || this.state.groupId);
      } else if (this.state.title === "update endpoint") {
        this.props.update_endpoint({
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

  doSubmitHeader(title) {
    let originalHeaders = [...this.state.originalHeaders];
    let updatedHeaders = {};
    for (let i = 0; i < originalHeaders.length; i++) {
      if (originalHeaders[i].key === "") {
        continue;
      } else if (originalHeaders[i].checked === "true" || title === "save") {
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
      isDashboardRoute(this.props) &&
      (name === "Params" || name === "Headers" || name === "Path Variables")
    ) {
      tabService.markTabAsModified(this.props.tab.id);
    }
  }

  setPublicBody(body) {
    let json = JSON.stringify(body);
    let data = { ...this.state.data };
    data.body = { type: "JSON", value: json };

    this.setState({ data, publicBodyFlag: false });
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
        processedHeaders.push({
          name: headers[Object.keys(headers)[i]].key,
          value: headers[Object.keys(headers)[i]].value,
          comment:
            headers[Object.keys(headers)[i]].description === null
              ? ""
              : headers[Object.keys(headers)[i]].description,
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
          comment: params[Object.keys(params)[i]].description,
        });
      }
    }
    return processedParams;
  }

  async makePostData(body) {
    let params = [];
    let paramsFlag = false;
    let postData = {};
    if (
      (body.type === "application/x-www-form-urlencoded" ||
        body.type === "multipart/form-data") &&
      body.value
    ) {
      paramsFlag = true;
      for (let i = 0; i < body.value.length - 1; i++) {
        if (body.value[i].checked === "true" && body.value[i].key !== "") {
          params.push({
            name: body.value[i].key,
            value: body.value[i].value,
            fileName: null,
            contentType: null,
          });
        }
      }
      postData = {
        mimeType: body.type,
        params: params,
        comment: "",
      };
    } else {
      postData = {
        mimeType: body.type,
        params: params,
        text: paramsFlag === false ? body.value : "",
        comment: "",
      };
    }
    return postData;
  }

  async prepareHarObject() {
    try {
      const BASE_URL = this.customState.BASE_URL;
      let uri = new URI(this.uri.current.value);
      let queryparams = uri.search();
      let path = this.setPathVariableValues();
      let url = BASE_URL + path + queryparams;
      url = this.replaceVariables(url);
      const { method, body } = this.state.data;
      const { originalHeaders, originalParams } = this.state;
      const harObject = {
        method,
        url: url,
        httpVersion: "HTTP/1.1",
        cookies: [],
        headers: this.makeHeaders(originalHeaders),
        postData: body.type === "none" ? null : await this.makePostData(body),
        queryString: this.makeParams(originalParams),
      };
      if (!harObject.url.split(":")[1] || harObject.url.split(":")[0] === "") {
        harObject.url = "https://" + url;
      }
      this.openCodeTemplate(harObject);
    } catch (error) {
      toast.error(error);
    }
  }

  openCodeTemplate(harObject) {
    this.setState({
      showCodeTemplate: true,
      harObject,
    });
  }

  showCodeTemplate() {
    return (
      <CodeTemplate
        show={true}
        onHide={() => {
          this.setState({ showCodeTemplate: false });
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
    // if (bodyType !== "multipart/form-data") {
    this.setHeaders(bodyType, "content-type");
    // }
    this.setState({ data });
    if (isDashboardRoute(this.props)) {
      tabService.markTabAsModified(this.props.tab.id);
    }
  }

  setBodyDescription(type, value) {
    let data = {};
    try {
      if (value.trim() === "") {
        data.bodyDescription = {};
        return data;
      }
      let body = JSON.parse(value);
      let keys = Object.keys(body);
      let bodyDescription = {};
      // const body_description = this.props.body_description;
      for (let i = 0; i < keys.length; i++) {
        if (typeof body[keys[i]] !== "object") {
          bodyDescription[keys[i]] = {
            default: body[keys[i]],
            description: this.state.fieldDescription[keys[i]]
              ? this.state.fieldDescription[keys[i]]
              : "",
            dataType: typeof body[keys[i]],
          };
        } else {
          if (
            typeof body[keys[i]] === "object" &&
            Array.isArray(body[keys[i]])
          ) {
            if (body[keys[i]].length !== 0) {
              bodyDescription[keys[i]] = {
                default: body[keys[i]],
                description: this.state.fieldDescription[keys[i]]
                  ? this.state.fieldDescription[keys[i]]
                  : "",
                dataType: "Array of " + typeof body[keys[i]][0],
              };
            } else {
              bodyDescription[keys[i]] = {
                default: [""],
                description: this.state.fieldDescription[keys[i]]
                  ? this.state.fieldDescription[keys[i]]
                  : "",
                dataType: "Array of string",
              };
            }
          } else if (typeof body[keys[i]] === "object") {
            let bodyField = body[keys[i]];
            let key = Object.keys(bodyField);
            if (key.length > 0 && typeof bodyField[key[0]] === "object")
              bodyDescription[keys[i]] = {
                default: body[keys[i]],
                description: this.state.fieldDescription[keys[i]]
                  ? this.state.fieldDescription[keys[i]]
                  : "",
                dataType: "Object of objects",
              };
            else {
              bodyDescription[keys[i]] = {
                default: body[keys[i]],
                description: this.state.fieldDescription[keys[i]]
                  ? this.state.fieldDescription[keys[i]]
                  : "",
                dataType: typeof body[keys[i]],
              };
            }
          }
        }
      }
      data.bodyDescription = bodyDescription;
      return data;
    } catch (error) {
      data.error = error;
      return data;
    }
  }

  set_description(bodyDescription) {
    this.setState({ bodyDescription });
  }

  setFieldDescription(fieldDescription, bodyDescription) {
    this.setState({ fieldDescription, bodyDescription });
  }

  // setHeaders(encodedValue) {
  //   let originalHeaders = this.state.originalHeaders;
  //   let updatedHeaders = [];
  //   let emptyHeader = {
  //     checked: "notApplicable",
  //     key: "",
  //     value: "",
  //     description: "",
  //   };
  //   for (let i = 0; i < originalHeaders.length; i++) {
  //     if (
  //       originalHeaders[i].key === "Authorization" ||
  //       originalHeaders[i].key === ""
  //     ) {
  //       continue;
  //     } else {
  //       updatedHeaders.push(originalHeaders[i]);
  //     }
  //   }
  //   // if (bodyType === "none") {
  //   //   updatedHeaders.push(emptyHeader);
  //   //   this.setState({ originalHeaders: updatedHeaders });
  //   //   return;
  //   // }
  //   updatedHeaders.push({
  //     checked: "true",
  //     key: "Authorization",
  //     value: "Basic " + encodedValue,
  //     description: "",
  //   });
  //   // updatedHeaders[updatedHeaders.length - 1].value = this.identifyBodyType(
  //   //   bodyType
  //   // );
  //   updatedHeaders.push(emptyHeader);
  //   this.setState({ originalHeaders: updatedHeaders });
  // }

  setParams(value, title, authorizationFlag) {
    let originalParams = this.state.originalParams;
    let updatedParams = [];
    let emptyParam = {
      checked: "notApplicable",
      key: "",
      value: "",
      description: "",
    };
    for (let i = 0; i < originalParams.length; i++) {
      if (originalParams[i].key === title || originalParams[i].key === "") {
        continue;
      } else {
        updatedParams.push(originalParams[i]);
      }
    }
    if (title === "access_token" && !authorizationFlag) {
      updatedParams.push({
        checked: "true",
        key: title,
        value: value,
        description: "",
      });
    }
    updatedParams.push(emptyParam);
    this.setState({ originalParams: updatedParams });
  }

  setHeaders(value, title, authorizationFlag = undefined) {
    let originalHeaders = this.state.originalHeaders;
    let updatedHeaders = [];
    let emptyHeader = {
      checked: "notApplicable",
      key: "",
      value: "",
      description: "",
    };
    for (let i = 0; i < originalHeaders.length; i++) {
      if (
        originalHeaders[i].key === title.split(".")[0] ||
        originalHeaders[i].key === ""
      ) {
        continue;
      } else {
        updatedHeaders.push(originalHeaders[i]);
      }
    }
    if (value === "none") {
      updatedHeaders.push(emptyHeader);
      this.setState({ originalHeaders: updatedHeaders });
      return;
    }
    if (value !== "noAuth" && !authorizationFlag) {
      updatedHeaders.push({
        checked: "true",
        key: title === "content-type" ? "content-type" : "Authorization",
        value:
          title.split(".")[0] === "Authorization"
            ? title.split(".")[1] === "oauth_2"
              ? "Bearer " + value
              : "Basic " + value
            : "",
        description: "",
      });
    }
    if (title === "content-type") {
      updatedHeaders[updatedHeaders.length - 1].value = this.identifyBodyType(
        value
      );
    }

    updatedHeaders.push(emptyHeader);
    this.setState({ originalHeaders: updatedHeaders });
  }

  identifyBodyType(bodyType) {
    switch (bodyType) {
      case "application/x-www-form-urlencoded":
        return "application/x-www-form-urlencoded";
      case "multipart/form-data":
        return "multipart/form-data";
      case "TEXT":
        return "text/plain";
      case "JSON":
        return "application/JSON";
      case "HTML":
        return "text/HTML";
      case "XML":
        return "application/XML";
      case "JavaScript":
        return "application/JavaScript";
      default:
        break;
    }
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

  propsFromSampleResponse(sampleResponseArray, sampleResponseFlagArray) {
    this.setState({ sampleResponseArray, sampleResponseFlagArray });
    this.props.update_endpoint({
      id: this.state.endpoint.id,
      sampleResponse: sampleResponseArray,
    });
  }

  makeFormData(body) {
    let formData = new FormData();
    body.value.map((o) => formData.set(o.key, o.value));
    return formData;
  }

  formatBody(body, headers) {
    let finalBodyValue = null;
    switch (body.type) {
      case "raw":
        finalBodyValue = this.parseBody(body.value);
        return { body: finalBodyValue, headers };
      case "multipart/form-data":
        let formData = this.makeFormData(body, headers);
        headers["content-type"] = "multipart/form-data";
        return { body: formData, headers };
      case "application/x-www-form-urlencoded":
        let urlEncodedData = {};
        for (let i = 0; i < body.value.length; i++) {
          if (
            body.value[i].key.length !== 0 &&
            body.value[i].checked === "true"
          ) {
            urlEncodedData[body.value[i].key] = body.value[i].value;
          }
        }
        return { body: urlEncodedData, headers };
      default:
        return { body: body.value, headers };
    }
  }

  // async extractToken(
  //   endpoint,
  //   groups,
  //   authData,
  //   authResponses,
  //   authType,
  //   responseObject = undefined
  // ) {
  //   let url = window.location.href;
  // let response = {};
  // if (responseObject === undefined) {
  // let response = URI.parseQuery("?" + url.split("#")[1]);
  // } else {
  //   response = responseObject;
  // }

  // if (url.split("#")[1]) {
  //   await indexedDbService.getDataBase();
  //   await indexedDbService.updateData(
  //     "responseData",
  //     response,
  //     "currentResponse"
  //   );
  //   window.close();

  //   if (endpoint === "") {
  //     let authType = {
  //       type: "oauth_2",
  //       value: {
  //         authorizationAddedTo: "Request Headers",
  //         accessToken: response.access_token,
  //       },
  //     };
  //     this.setState({ authType });
  //     this.props.history.push(`/dashboard/endpoint/new`);
  //   } else {
  //     this.accessToken = response.access_token;
  //     response.tokenName = authData.tokenName;
  //     authResponses.push(response);

  //     if (endpoint.groupId) {
  //       let authorizationType = authType;
  //       authorizationType.value.accessToken = response.access_token;
  //       this.props.set_authorization_type(
  //         this.props.location.pathname.split("/")[3],
  //         authorizationType
  //       );
  //     }

  //     if (endpoint.groupId) {
  //       this.props.set_authorization_responses(
  //         groups[endpoint.groupId].versionId,
  //         authResponses
  //       );
  //     }
  //     this.props.history.push(`/dashboard/endpoint/${endpoint.id}`);
  //   }
  //   this.setAuthorizationTab = true;
  //   }
  // }
  //  async setAccessToken(endpoint, versions, groups, authType) {

  async setAccessToken() {
    let url = window.location.href;
    let response = URI.parseQuery("?" + url.split("#")[1]);
    if (url.split("#")[1]) {
      await indexedDbService.getDataBase();
      await indexedDbService.updateData(
        "responseData",
        response,
        "currentResponse"
      );
      let responseData = await indexedDbService.getValue(
        "responseData",
        "currentResponse"
      );
      let timer = setInterval(async function () {
        if (responseData) {
          clearInterval(timer);
          window.close();
        }
      }, 1000);
    }
    if (url.split("?")[1]) {
      await indexedDbService.getDataBase();
      let authData = await indexedDbService.getValue(
        "authData",
        "currentAuthData"
      );
      let resposneAuthCode = URI.parseQuery("?" + url.split("?")[1]);
      let code = resposneAuthCode.code;
      let paramsObject = {};
      paramsObject.code = code;
      paramsObject.client_id = authData.clientId;
      paramsObject.client_secret = authData.clientSecret;
      paramsObject.redirect_uri = authData.callbackUrl;
      await endpointApiService.authorize(
        authData.accessTokenUrl,
        paramsObject,
        "auth_code",
        this.props,
        authData
      );
    }

    // await indexedDbService.getDataBase();
    // let authData = await indexedDbService.getValue(
    //   "authData",
    //   "currentAuthData"
    // );
    // let abcd = await indexedDbService.getValue(
    //   "responseData",
    //   "currentResponse"
    // );

    // let authResponses = {};
    // if (endpoint !== "") {
    //   authResponses =
    //     versions[groups[endpoint.groupId].versionId].authorizationResponse;
    // }
    // this.extractToken(endpoint, groups, authData, authResponses, authType);
    // if (url.split("?")[1]) {
    //   this.setAuthorizationTab = true;
    //   let resposneAuthCode = URI.parseQuery("?" + url.split("?")[1]);
    //   let code = resposneAuthCode.code;
    //   let paramsObject = {};
    //   paramsObject.code = code;
    //   paramsObject.client_id = authData.clientId;
    //   paramsObject.client_secret = authData.clientSecret;
    //   paramsObject.redirect_uri = authData.callbackUrl;
    //   let response = await endpointApiService.authorize(
    //     authData.accessTokenUrl,
    //     paramsObject,
    //     "auth_code"
    //   );
    //   this.extractToken(
    //     endpoint,
    //     groups,
    //     authData,
    //     authResponses,
    //     authType,
    //     response
    //   );
    // }
    // await indexedDbService.deleteData("authData", "currentAuthData");
    // authData = await indexedDbService.getValue("authData", "currentAuthData");
  }

  setAuthType(type, value) {
    let authType = {};
    if (type === "") {
      authType = null;
    } else {
      authType = {
        type,
        value,
      };
    }
    this.setState({ authType });
  }

  addSampleResponse(response) {
    let { data, status } = response;
    let sampleResponseFlagArray = [...this.state.sampleResponseFlagArray];
    const description = "";
    let sampleResponse = { data, status, description };
    let sampleResponseArray = [
      ...this.state.sampleResponseArray,
      sampleResponse,
    ];
    sampleResponseFlagArray.push(false);
    this.setState({ sampleResponseArray, sampleResponseFlagArray });
    this.props.update_endpoint({
      id: this.state.endpoint.id,
      sampleResponse: sampleResponseArray,
    });
  }

  openBody(index) {
    let sampleResponseFlagArray = [...this.state.sampleResponseFlagArray];
    sampleResponseFlagArray[index] = true;
    this.setState({ sampleResponseFlagArray });
  }

  closeBody(index) {
    let sampleResponseFlagArray = [...this.state.sampleResponseFlagArray];
    sampleResponseFlagArray[index] = false;
    this.setState({ sampleResponseFlagArray });
  }

  closeLoginSignupModal() {
    this.setState({
      showLoginSignupModal: false
    })
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
      this.state.endpoint.id !== this.props.location.pathname.split("/")[4] &&
      this.props.endpoints[this.props.location.pathname.split("/")[4]]
    ) {
      this.fetchEndpoint(0, this.props.location.pathname.split("/")[4]);
      store.subscribe(() => {
        if (!this.props.location.title && !this.state.title) {
          this.fetchEndpoint(0, this.props.location.pathname.split("/")[4]);
        }
      });
    }
    return (
      <div className="hm-endpoint-container endpoint-container">
        {this.state.showLoginSignupModal && (
          <LoginSignupModal
            show={true}
            onHide={() => this.closeLoginSignupModal()}
            title="Save Endpoint"
          />
        )}
        {getCurrentUser() ? (
          <div className={isDashboardRoute(this.props) ? "hm-panel mt-4" : null}>
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
            {this.state.showCodeTemplate && this.showCodeTemplate()}
            <DisplayDescription
              {...this.props}
              endpoint={this.state.endpoint}
              data={this.state.data}
              old_description={this.state.oldDescription}
              props_from_parent={this.propsFromDescription.bind(this)}
            />
          </div>
        ) : null}
        <div
          className={!isDashboardRoute(this.props) ? "hm-panel" : "hm-panel"}
        >
          {isDashboardRoute(this.props) ? (
            <div className="endpoint-url-container">
              <div className="input-group-prepend">
                <div>
                  <div className="dropdown">
                    <button
                      className={`api-label ${this.state.data.method} dropdown-toggle`}
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
                  className="form-control endpoint-url-input"
                  aria-describedby="basic-addon3"
                  placeholder={"Enter request URL"}
                  onChange={this.handleChange}
                  disabled={isDashboardRoute(this.props) ? null : true}
                />
              </div>
              <div className="d-flex">
                <button
                  className="btn btn-info"
                  type="submit"
                  id="send-request-button"
                  onClick={() => this.handleSend()}
                >
                  {isDashboardRoute(this.props) ? "Send" : "Try"}
                </button>

                {isDashboardRoute(this.props) ? (
                  <button
                    className="btn btn-primary"
                    type="button"
                    id="save-endpoint-button"
                    onClick={() => this.handleSave()}
                  >
                    Save
                  </button>
                ) : null}
              </div>
            </div>
          ) : (
              <div className="hm-endpoint-wrap">
                <div className="hm-endpoint-header">
                  <div
                    className={`api-label api-label-lg ${this.state.data.method}`}
                  >
                    {this.state.data.method}
                  </div>
                  <a
                    href="javascript:void(0)"
                    id="show-code-snippets-button"
                    onClick={() => this.prepareHarObject()}
                  >
                    Sample Code
                </a>
                </div>
                <div className="endpoint-host">
                  <HostContainer
                    {...this.props}
                    groupId={this.state.groupId}
                    set_base_url={this.setBaseUrl.bind(this)}
                    custom_host={this.state.endpoint.BASE_URL}
                  />
                </div>
                <input
                  ref={this.uri}
                  type="hidden"
                  value={this.state.data.updatedUri}
                  name="updatedUri"
                />
                <div className="endpoint-uri">{this.state.data.updatedUri}</div>
              </div>
            )}
          <div
            className={
              isDashboardRoute(this.props)
                ? "endpoint-headers-container"
                : "hm-public-endpoint-headers"
            }
          >
            {isDashboardRoute(this.props) ? (
              <div className="headers-params-wrapper">
                <ul className="nav nav-tabs" id="pills-tab" role="tablist">
                  <li className="nav-item">
                    <a
                      className={
                        this.setAuthorizationTab
                          ? "nav-link "
                          : "nav-link active"
                      }
                      id="pills-params-tab"
                      data-toggle="pill"
                      href={`#params-${this.props.tab.id}`}
                      role="tab"
                      aria-controls={`params-${this.props.tab.id}`}
                      aria-selected={
                        this.setAuthorizationTab ? "false" : "true"
                      }
                    >
                      Params
                    </a>
                  </li>
                  <li className="nav-item">
                    <a
                      className={
                        this.setAuthorizationTab
                          ? "nav-link active"
                          : "nav-link "
                      }
                      id="pills-authorization-tab"
                      data-toggle="pill"
                      href={`#authorization-${this.props.tab.id}`}
                      role="tab"
                      aria-controls={`authorization-${this.props.tab.id}`}
                      aria-selected={
                        this.setAuthorizationTab ? "true" : "false"
                      }
                    >
                      Authorization
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
                </ul>
              </div>
            ) : null}
            {isDashboardRoute(this.props) ? (
              <div className="tab-content" id="pills-tabContent">
                <div
                  className={
                    this.setAuthorizationTab
                      ? "tab-pane fade"
                      : "tab-pane fade show active"
                  }
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
                  className={
                    this.setAuthorizationTab
                      ? "tab-pane fade show active"
                      : "tab-pane fade "
                  }
                  id={`authorization-${this.props.tab.id}`}
                  role="tabpanel"
                  aria-labelledby="pills-authorization-tab"
                >
                  <div>
                    <Authorization
                      {...this.props}
                      title="Authorization"
                      groupId={this.state.groupId}
                      set_authorization_headers={this.setHeaders.bind(this)}
                      set_authoriztaion_params={this.setParams.bind(this)}
                      set_authoriztaion_type={this.setAuthType.bind(this)}
                      // set_access_token={this.setAccessToken.bind(this)}
                      accessToken={this.accessToken}
                      authorizationType={this.state.authType}
                    ></Authorization>
                  </div>
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
                    set_body_description={this.set_description.bind(this)}
                    body={
                      this.state.bodyFlag === true ? this.state.data.body : ""
                    }
                    Body={this.state.data.body}
                    endpoint_id={this.props.tab.id}
                    body_description={this.state.bodyDescription}
                    field_description={this.state.fieldDescription}
                    set_field_description={this.setFieldDescription.bind(this)}
                  />
                </div>
              </div>
            ) : (
                <React.Fragment>
                  {this.state.params.length > 1 && (
                    <GenericTable
                      {...this.props}
                      title="Params"
                      dataArray={this.state.originalParams}
                      props_from_parent={this.propsFromChild.bind(this)}
                      original_data={[...this.state.params]}
                    ></GenericTable>
                  )}

                  {this.state.pathVariables &&
                    this.state.pathVariables.length !== 0 && (
                      <GenericTable
                        {...this.props}
                        title="Path Variables"
                        dataArray={this.state.pathVariables}
                        props_from_parent={this.propsFromChild.bind(this)}
                        original_data={[...this.state.pathVariables]}
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

                  {this.state.data.body &&
                    // this.state.data.body.value !== "" &&
                    this.state.data.body.value !== null && (
                      <PublicBodyContainer
                        {...this.props}
                        set_body={this.setBody.bind(this)}
                        set_body_description={this.set_description.bind(this)}
                        body={this.state.data.body}
                        public_body_flag={this.state.publicBodyFlag}
                        set_public_body={this.setPublicBody.bind(this)}
                        body_description={this.state.bodyDescription}
                      ></PublicBodyContainer>
                    )}
                </React.Fragment>
              )}
            {!isDashboardRoute(this.props) && (
              <div className="d-flex">
                <button
                  className="btn btn-primary"
                  type="submit"
                  id="send-request-button"
                  onClick={() => this.handleSend()}
                >
                  Try
                </button>
              </div>
            )}
          </div>
        </div>

        {/* {!isDashboardRoute(this.props) &&
        } */}
        {/* {this.state.response.status && ( */}
        {isSavedEndpoint(this.props) ? (
          <React.Fragment>
            <div>
              <ul className="nav nav-tabs" id="myTab" role="tablist">
                <li className="nav-item">
                  <a
                    className="nav-link active"
                    id="pills-response-tab"
                    data-toggle="pill"
                    href={
                      isDashboardRoute(this.props)
                        ? `#response-${this.props.tab.id}`
                        : "#response"
                    }
                    role="tab"
                    aria-controls={
                      isDashboardRoute(this.props)
                        ? `response-${this.props.tab.id}`
                        : "response"
                    }
                    aria-selected="true"
                  >
                    Response
                  </a>
                </li>
                {getCurrentUser() ? (

                  <li className="nav-item">
                    <a
                      className="nav-link"
                      id="pills-sample-tab"
                      data-toggle="pill"
                      href={
                        isDashboardRoute(this.props)
                          ? `#sample-${this.props.tab.id}`
                          : "#sample"
                      }
                      role="tab"
                      aria-controls={
                        isDashboardRoute(this.props)
                          ? `sample-${this.props.tab.id}`
                          : "sample"
                      }
                      aria-selected="false"
                    >
                      Sample Response
                  </a>
                  </li>) : null}
              </ul>
              <div className="tab-content" id="pills-tabContent">
                <div
                  className="tab-pane fade show active"
                  id={
                    isDashboardRoute(this.props)
                      ? `response-${this.props.tab.id}`
                      : "response"
                  }
                  role="tabpanel"
                  aria-labelledby="pills-response-tab"
                >
                  <div className="hm-panel endpoint-public-response-container">
                    <DisplayResponse
                      {...this.props}
                      timeElapsed={this.state.timeElapsed}
                      response={this.state.response}
                      flagResponse={this.state.flagResponse}
                      add_sample_response={this.addSampleResponse.bind(this)}
                    ></DisplayResponse>
                  </div>
                </div>
                {getCurrentUser() ? (
                  <div
                    className="tab-pane fade"
                    id={
                      isDashboardRoute(this.props)
                        ? `sample-${this.props.tab.id}`
                        : "sample"
                    }
                    role="tabpanel"
                    aria-labelledby="pills-sample-tab"
                  >
                    <SampleResponse
                      {...this.props}
                      timeElapsed={this.state.timeElapsed}
                      response={this.state.response}
                      flagResponse={this.state.flagResponse}
                      sample_response_array={this.state.sampleResponseArray}
                      sample_response_flag_array={
                        this.state.sampleResponseFlagArray
                      }
                      open_body={this.openBody.bind(this)}
                      close_body={this.closeBody.bind(this)}
                      props_from_parent={this.propsFromSampleResponse.bind(this)}
                    ></SampleResponse>
                  </div>) : null}
              </div>
            </div>
          </React.Fragment>
        ) : (
            <React.Fragment>
              <div className="public-response-title">Response</div>
              <div className="hm-panel endpoint-public-response-container">
                <DisplayResponse
                  {...this.props}
                  timeElapsed={this.state.timeElapsed}
                  response={this.state.response}
                  flagResponse={this.state.flagResponse}
                ></DisplayResponse>
              </div>
            </React.Fragment>
          )}
      </div>
    );
  }
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(DisplayEndpoint)
);
