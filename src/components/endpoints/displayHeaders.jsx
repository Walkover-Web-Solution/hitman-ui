import React, { Component } from "react";
import GenericTable from "./table";

class DisplayHeaders extends Component {
  state = {};

  handleAddHeader() {
    const len = this.props.originalHeaders.length;
    let originalHeaders = [...this.state.originalHeaders];
    originalHeaders[len.toString()] = {
      key: "",
      value: "",
      description: ""
    };
    this.originalHeaders = originalHeaders;
    this.props.handle_update_headers(originalHeaders);
  }

  handleDeleteHeader(index) {
    let originalHeaders = this.props.originalHeaders;
    let neworiginalHeaders = [];
    for (let i = 0; i < originalHeaders.length; i++) {
      if (i === index) {
        continue;
      }
      neworiginalHeaders.push(this.props.originalHeaders[i]);
    }
    originalHeaders = neworiginalHeaders;
    this.originalHeaders = originalHeaders;
    this.props.handle_update_headers(originalHeaders);
  }

  handleChangeHeader = e => {
    const name = e.currentTarget.name.split(".");
    const originalHeaders = [...this.props.originalHeaders];
    if (name[1] === "key") {
      originalHeaders[name[0]].key = e.currentTarget.value;
    }
    if (name[1] === "value") {
      originalHeaders[name[0]].value = e.currentTarget.value;
    }
    if (name[1] === "description") {
      originalHeaders[name[0]].description = e.currentTarget.value;
    }
    this.originalHeaders = originalHeaders;
    this.props.handle_update_headers(originalHeaders);
  };

  render() {
    this.originalHeaders = this.props.originalHeaders;
    return (
      <div>
        <GenericTable
          title="Add Header"
          dataArray={this.props.originalHeaders}
          handleDelete={this.handleDeleteHeader.bind(this)}
          handleAdd={this.handleAddHeader.bind(this)}
          handleChange={this.handleChangeHeader.bind(this)}
        ></GenericTable>
      </div>
    );
  }
}

export default DisplayHeaders;
