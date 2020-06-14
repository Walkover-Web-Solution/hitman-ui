import React, { Component } from "react";
import { toast } from "react-toastify";
import store from "../../store/store";
import { isDashboardRoute } from "../common/utility";
import tabService from "../tabs/tabService";
import tabStatusTypes from "../tabs/tabStatusTypes";
import "./endpoints.scss";

class HostContainer extends Component {
  state = {
    selectedHost: "customHost",
    customHost: "",
    data: {
      requestType: "GET",
      uri: "",
      updatedUri: "",
    },
    methodList: ["GET", "POST", "PUT", "DELETE"],
    groupId: null,
    versionId: null,
  };

  componentDidMount() {
    let selectedHost = this.findTopPriorityHost();
    this.setState({ selectedHost });

    const unsubscribe = store.subscribe(() => {
      if (this.props.currentEnvironmentId) {
        if (Object.keys(this.props.environments).length) {
          let selectedHost = this.findTopPriorityHost();
          this.setState({ selectedHost });
          unsubscribe();
        }
      } else {
        unsubscribe();
      }
    });
  }

  findTopPriorityHost() {
    let selectedHost = "customHost";
    if (this.props.custom_host) {
      selectedHost = "customHost";
    } else if (
      this.props.environment &&
      this.props.environment.variables &&
      this.props.environment.variables.BASE_URL
    ) {
      selectedHost = "environmentHost";
    } else if (this.state.groupId) {
      if (this.props.groups[this.state.groupId].host) {
        selectedHost = "groupHost";
      } else if (this.props.groups[this.state.versionId].host) {
        selectedHost = "versionHost";
      }
    }
    return selectedHost;
  }

  selectHost(host) {
    if (host === "environmentHost") {
      if (
        this.props.environment &&
        this.props.environment.variables &&
        this.props.environment.variables.BASE_URL
      ) {
        this.setState({ selectedHost: host });
      } else {
        toast.error("Please add BASE_URL variable in current environment");

        this.setState({ selectedHost: "customHost" });
      }
    } else this.setState({ selectedHost: host });
    if (isDashboardRoute(this.props)) {
      tabService.markTabAsModified(this.props.tab.id);
    }
  }

  handleChange = (e) => {
    const customHost = e.currentTarget.value;
    this.setState({ customHost });
    if (isDashboardRoute(this.props)) {
      tabService.markTabAsModified(this.props.tab.id);
    }
  };

  fetchHost() {
    let BASE_URL = "";
    switch (this.state.selectedHost) {
      case "customHost":
        BASE_URL = this.state.customHost || "";
        break;
      case "environmentHost":
        if (
          this.props.environment &&
          this.props.environment.variables &&
          this.props.environment.variables.BASE_URL
        ) {
          if (
            this.props.environment.variables.BASE_URL.currentValue &&
            this.props.environment.variables.BASE_URL.currentValue.length
          ) {
            BASE_URL = this.props.environment.variables.BASE_URL.currentValue;
            break;
          } else {
            BASE_URL = this.props.environment.variables.BASE_URL.initialValue;
            break;
          }
        } else {
          this.setState({ selectedHost: "customHost" });
          return;
        }
      case "groupHost":
        if (this.props.groups[this.state.groupId]) {
          BASE_URL = this.props.groups[this.state.groupId].host;
        }
        break;
      case "versionHost":
        if (this.props.versions[this.state.versionId]) {
          BASE_URL = this.props.versions[this.state.versionId].host;
        }
        break;
      default:
        break;
    }
    this.props.set_base_url(BASE_URL, this.state.selectedHost);
    return BASE_URL;
  }

  fetchPublicEndpointHost(props) {
    let HOST_URL = "";
    let endpoint = {};
    let allEndpoints = this.props.endpoints;
    for (endpoint in allEndpoints) {
      if (allEndpoints[endpoint].id === props.match.params.endpointId) {
        endpoint = allEndpoints[endpoint];
        break;
      }
    }
    let groupId = endpoint.groupId;
    let endpointUrl = endpoint.BASE_URL;
    if (endpointUrl === "" || endpointUrl === null) {
      let group = props.groups[groupId];
      let groupUrl = group.host;
      let versionId = group.versionId;
      if (groupUrl === "" || groupUrl === null) {
        let version = props.versions[versionId];
        HOST_URL = version.host;
      } else {
        HOST_URL = groupUrl;
      }
    } else {
      HOST_URL = endpointUrl;
    }
    this.props.set_base_url(HOST_URL);
    return HOST_URL;
  }

  render() {
    if (
      isDashboardRoute(this.props) &&
      this.state.groupId &&
      this.props.tab.status === tabStatusTypes.DELETED
    ) {
      this.setState({ groupId: null });
    }

    if (!this.state.groupId && this.props.groupId) {
      const groupId = this.props.groupId;
      const versionId = this.props.groups[groupId].versionId;
      const customHost = this.props.custom_host;
      let selectedHost = null;
      if (this.props.custom_host) {
        selectedHost = "customHost";
      } else if (
        this.props.environment.variables &&
        this.props.environment.variables.BASE_URL
      ) {
        selectedHost = "environmentHost";
      } else if (this.props.groups[groupId].host) {
        selectedHost = "groupHost";
      } else {
        selectedHost = "versionHost";
      }
      this.setState({ groupId, versionId, customHost, selectedHost });
    }
    if (isDashboardRoute(this.props)) {
      return (
        <div className="host-field-container">
          <input
            type="text"
            name="customHost"
            class="form-control"
            value={this.fetchHost()}
            onChange={this.handleChange}
            disabled={this.state.selectedHost !== "customHost"}
          />
          <div className="dropdown" id="host-select">
            <button
              className="btn dropdown-toggle"
              type="button"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            ></button>
            <div
              className="dropdown-menu dropdown-menu-right"
              aria-labelledby="dropdownMenuButton"
            >
              {this.props.environment &&
                this.props.environment.variables &&
                this.props.environment.variables.BASE_URL && (
                  <button
                    className="btn"
                    onClick={() => this.selectHost("environmentHost")}
                  >
                    <div>
                      {this.state.selectedHost === "environmentHost" && (
                        <i className="fas fa-check"></i>
                      )}
                    </div>
                    <div className="host-label">environment BASE_URL </div>
                  </button>
                )}
              {this.state.groupId &&
                this.props.groups[this.state.groupId] &&
                this.props.groups[this.state.groupId].host && (
                  <button
                    className="btn"
                    onClick={() => this.selectHost("groupHost")}
                  >
                    <div>
                      {this.state.selectedHost === "groupHost" && (
                        <i className="fas fa-check"></i>
                      )}
                    </div>
                    <div className="host-label">group BASE_URL</div>
                  </button>
                )}
              {this.state.groupId && (
                <button
                  className="btn"
                  onClick={() => this.selectHost("versionHost")}
                >
                  <div>
                    {this.state.selectedHost === "versionHost" && (
                      <i className="fas fa-check"></i>
                    )}
                  </div>
                  <div className="host-label">version BASE_URL</div>
                </button>
              )}
              <button
                id="customHost"
                className="btn"
                onClick={() => this.selectHost("customHost")}
              >
                <div>
                  {this.state.selectedHost === "customHost" && (
                    <i className="fas fa-check"></i>
                  )}
                </div>
                <div className="host-label">custom BASE_URL</div>
              </button>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <React.Fragment>
          {this.fetchPublicEndpointHost(this.props)}
        </React.Fragment>
      );
    }
  }
}

export default HostContainer;
