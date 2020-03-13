import React, { Component } from "react";
import GenericTable from "./genericTable";

class DisplayHeaders extends Component {
  state = {};

  handleChangeHeader = e => {
    const name = e.currentTarget.name.split(".");

    const originalHeaders = [...this.originalHeaders];
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
    this.props.props_from_parent("originalHeaders", originalHeaders);
  };

  render() {
    this.originalHeaders = this.props.originalHeaders;
    return (
      <div>
        <GenericTable
          {...this.props}
          handleChange={this.handleChangeHeader.bind(this)}
          title="Add Headers"
          dataArray={this.originalHeaders}
        ></GenericTable>
      </div>
    );
  }
}

export default DisplayHeaders;
