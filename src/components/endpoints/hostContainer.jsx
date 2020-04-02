import React, { Component } from "react";
import { toast } from "react-toastify";

class HostContainer extends Component {
  state = {
    // hostList: {
    //   customHost: true,
    //   groupHost: false,
    //   versionHost: false,
    //   environmentHost: false
    // },
    selectedHost: "customHost",
    customHost: "",
    data: {
      requestType: "GET",
      uri: "",
      updatedUri: ""
    },
    methodList: ["GET", "POST", "PUT", "DELETE"],
    groupId: null,
    versionId: null
  };

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

  handleChange = e => {
    const host = { ...this.state.host };
    host[e.currentTarget.name] = e.currentTarget.value;
    this.setState({ host });
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
          toast.error("Please add BASE_URL variable in current environment");
          this.setState({ selectedHost: "customHost" });
          return;
        }
      case "groupHost":
        BASE_URL = this.props.groups[this.state.groupId].host;
        break;
      case "versionHost":
        BASE_URL = this.props.versions[this.state.versionId].host;
        break;
    }
    this.props.set_base_url(BASE_URL);
    return BASE_URL;
  }

  // checkHostList() {
  //   let hostList = { ...this.state.hostList };
  //   let selectedHost = "customHost";

  //   if (this.state.groupId) {
  //     hostList.versionHost = true;
  //     selectedHost = "versionHost";
  //     if (this.props.groups[this.state.groupId].host) {
  //       hostList.versionHost = true;
  //       selectedHost = "groupHost";
  //     }
  //   } else {
  //     hostList.versionHost = false;
  //     hostList.groupHost = false;
  //   }

  //   if (
  //     this.props.environment &&
  //     this.props.environment.variables &&
  //     this.props.environment.variables.BASE_URL
  //   ) {
  //     hostList.environmentHost = true;
  //     selectedHost = "environmentHost";
  //   } else {
  //     hostList.environmentHost = false;
  //   }
  //   if (
  //     !(
  //       JSON.stringify(hostList) === JSON.stringify(this.state.hostList) &&
  //       selectedHost === this.state.selectedHost
  //     )
  //   ) {
  //     this.setState({ hostList });
  //   }
  // }

  render() {
    if (!this.state.groupId && this.props.groupId) {
      const groupId = this.props.groupId;
      const versionId = this.props.groups[groupId].versionId;

      let selectedHost = "versionHost";
      if (this.props.groups[groupId].host) {
        selectedHost = "groupHost";
      }
      console.log("lsdkfj");
      this.setState({ groupId, versionId, selectedHost });
    }
    // this.checkHostList();

    return (
      <div className="host-field-container">
        <input
          type="text"
          name="customHost"
          value={this.fetchHost()}
          onChange={this.handleChange}
          disabled={this.state.selectedHost !== "customHost"}
        />
        <div class="dropdown" id="host-select">
          <button
            class="btn btn-secondary dropdown-toggle"
            type="button"
            id="dropdownMenuButton"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          ></button>
          <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
            {this.props.environment &&
              this.props.environment.variables &&
              this.props.environment.variables.BASE_URL && (
                <button
                  className="btn"
                  onClick={() => this.selectHost("environmentHost")}
                >
                  {this.state.selectedHost === "environmentHost" && (
                    <i class="fas fa-check"></i>
                  )}
                  environmentHost
                </button>
              )}

            {this.state.groupId && this.props.groups[this.state.groupId].host && (
              <button
                className="btn"
                onClick={() => this.selectHost("groupHost")}
              >
                {this.state.selectedHost === "groupHost" && (
                  <i class="fas fa-check"></i>
                )}
                groupHost
              </button>
            )}
            {this.state.groupId && (
              <button
                className="btn"
                onClick={() => this.selectHost("versionHost")}
              >
                {this.state.selectedHost === "versionHost" && (
                  <i class="fas fa-check"></i>
                )}
                versionHost
              </button>
            )}

            <button
              id="customHost"
              className="btn"
              onClick={() => this.selectHost("customHost")}
            >
              {this.state.selectedHost === "customHost" && (
                <i class="fas fa-check"></i>
              )}
              customHost
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default HostContainer;
