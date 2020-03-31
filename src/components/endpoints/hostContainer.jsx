import React, { Component } from "react";
import { toast } from "react-toastify";

class HostContainer extends Component {
  state = {
    host: {
      customHost: "",
      groupHost: "",
      versionHost: "",
      environmentHost: ""
    },
    selectedHost: "customHost",
    data: {
      requestType: "GET",
      uri: "",
      updatedUri: ""
    },
    methodList: ["GET", "POST", "PUT", "DELETE"],
    groupId: null,
    versionId: null
  };

  // setMethod(requestType) {
  //   // const response = {};
  //   let data = { ...this.state.data };
  //   data.requestType = requestType;
  //   // this.setState({ response, data });
  //   this.setState({ data });
  // }

  changeHost(host) {
    if (host === "environmentHost") {
      if (
        this.props.environment &&
        this.props.environment.variables &&
        this.props.environment.variables.BASE_URL
      ) {
        this.setState({ selectedHost: host });
      } else {
        toast.error("Please add BASE_URL variable in current environment");
        document.getElementById("customHost").selected = true;
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
        BASE_URL = this.state.host.customHost;
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
          document.getElementById("customHost").selected = true;
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

  render() {
    if (!this.state.groupId && this.props.groupId) {
      const groupId = this.props.groupId;
      const versionId = this.props.groups[groupId].versionId;
      this.setState({ groupId, versionId });
    }

    return (
      // <div className="endpoint-url-container">
      //   <div className="input-group-prepend">
      //     <div class="dropdown">
      //       <button
      //         class="btn btn-secondary dropdown-toggle"
      //         type="button"
      //         id="dropdownMenuButton"
      //         data-toggle="dropdown"
      //         aria-haspopup="true"
      //         aria-expanded="false"
      //       >
      //         {this.state.data.requestType}
      //       </button>
      //       <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
      //         {this.state.methodList.map(methodName => (
      //           <button
      //             className="btn"
      //             onClick={() => this.setMethod(methodName)}
      //           >
      //             {methodName}
      //           </button>
      //         ))}
      //       </div>
      //     </div>

      <div className="host-field-container">
        <input
          type="text"
          name="customHost"
          value={this.fetchHost()}
          onChange={this.handleChange}
          disabled={this.state.selectedHost !== "customHost"}
        />
        <select
          class="custom-select"
          id="host-select"
          onChange={e => this.changeHost(e.currentTarget.value)}
        >
          <option id="customHost">customHost</option>
          <option>environmentHost</option>
          {this.state.groupId && <option>groupHost</option>}
          {this.state.groupId && <option>versionHost</option>}
        </select>
      </div>
    );
  }
}

export default HostContainer;
