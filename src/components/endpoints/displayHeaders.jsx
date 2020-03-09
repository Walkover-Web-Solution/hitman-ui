import React, { Component } from "react";
import GenericTable from "./table";

class DisplayHeaders extends Component {
  state = {
    originalHeaders: []
  };

  handleAddHeader() {
    const len = this.state.originalHeaders.length;
    let originalHeaders = [...this.state.originalHeaders];
    originalHeaders[len.toString()] = {
      key: "",
      value: "",
      description: ""
    };
    this.setState({ originalHeaders });
    this.props.handle_update_headers(originalHeaders);
  }

  handleDeleteHeader(index) {
    let originalHeaders = this.state.originalHeaders;
    let neworiginalHeaders = [];
    for (let i = 0; i < originalHeaders.length; i++) {
      if (i === index) {
        continue;
      }
      neworiginalHeaders.push(this.state.originalHeaders[i]);
    }
    originalHeaders = neworiginalHeaders;
    this.setState({ originalHeaders });
    this.props.handle_update_headers(originalHeaders);
  }

  handleChangeHeader = e => {
    const name = e.currentTarget.name.split(".");
    const originalHeaders = [...this.state.originalHeaders];
    if (name[1] === "key") {
      originalHeaders[name[0]].key = e.currentTarget.value;
    }
    if (name[1] === "value") {
      originalHeaders[name[0]].value = e.currentTarget.value;
    }
    if (name[1] === "description") {
      originalHeaders[name[0]].description = e.currentTarget.value;
    }
    this.setState({ originalHeaders });
    this.props.handle_update_headers(originalHeaders);
  };

  render() {
    if (this.props.location.title == "Add New Endpoint")
      this.setState({ originalHeaders: [] });

    if (this.props.location.endpoint && this.props.location.endpoint.headers) {
      const originalHeaders = [];
      Object.keys(this.props.location.endpoint.headers).map(h => {
        originalHeaders.push(this.props.location.endpoint.headers[h]);
      });
      this.setState({ originalHeaders });
      this.props.handle_update_headers(originalHeaders);
      this.props.history.push({ endpoint: null });
    }
    console.log(this.state.originalHeaders);
    return (
      <div>
        <GenericTable
          title="Add Header"
          dataArray={this.state.originalHeaders}
          handleDelete={this.handleDeleteHeader.bind(this)}
          handleAdd={this.handleAddHeader.bind(this)}
          handleChange={this.handleChangeHeader.bind(this)}
        ></GenericTable>
      </div>
    );
  }
}

export default DisplayHeaders;
