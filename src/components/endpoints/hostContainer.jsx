import React, { Component } from "react";
import { toast } from "react-toastify";
import store from "../../store/store";

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
    let isLoaded = false;
    console.log(1);
    store.subscribe(() => {
      console.log(2);

      if (!isLoaded) {
        console.log(3);

        let selectedHost = "customHost";
        if (this.props.custom_host) {
          selectedHost = "customHost";
        } else if (
          this.props.environment.variables &&
          this.props.environment.variables.BASE_URL
        ) {
          selectedHost = "environmentHost";
        }
        this.setState({ selectedHost });
      }
      isLoaded = true;
    });
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
  }

  handleChange = (e) => {
    const customHost = e.currentTarget.value;
    this.setState({ customHost });
  };

  fetchHost() {
    let BASE_URL = "";
    switch (this.state.selectedHost) {
      case "customHost":
        BASE_URL = this.state.customHost;
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
        BASE_URL = this.props.groups[this.state.groupId].host;
        break;
      case "versionHost":
        BASE_URL = this.props.versions[this.state.versionId].host;
        break;
      default:
        break;
    }
    this.props.set_base_url(BASE_URL, this.state.customHost);
    return BASE_URL;
  }

  render() {
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

    return (
      <div className="host-field-container">
        <input
          type="text"
          name="customHost"
          value={this.fetchHost()}
          onChange={this.handleChange}
          disabled={this.state.selectedHost !== "customHost"}
        />
        <div className="dropdown" id="host-select">
          <button
            className="btn dropdown-toggle"
            type="button"
            id="dropdownMenuButton"
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
                  <div className="host-label">environment BASE_URL</div>
                </button>
              )}

            {this.state.groupId && this.props.groups[this.state.groupId].host && (
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
  }
}

export default HostContainer;
