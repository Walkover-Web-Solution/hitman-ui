import React, { Component } from "react";
import GenericTable from "./genericTable";

class ParamsComponent extends Component {
  state = {};

  handleChangeParam = e => {
    const name = e.currentTarget.name.split(".");
    const originalParams = [...this.originalParams];
    if (name[1] === "key") {
      originalParams[name[0]].key = e.currentTarget.value;
      if (originalParams[name[0]].key.length === 0) {
        this.handleDeleteParam(name[0]);
      }
    }
    if (name[1] === "value") {
      originalParams[name[0]].value = e.currentTarget.value;
    }
    if (name[1] === "description") {
      originalParams[name[0]].description = e.currentTarget.value;
    }
    this.props.props_from_parent("originalParams", originalParams);
  };

  render() {
    this.originalParams = this.props.originalParams;
    return (
      <div>
        <GenericTable
          {...this.props}
          handleChange={this.handleChangeParam.bind(this)}
          title="Add Params"
          dataArray={this.originalParams}
        ></GenericTable>
      </div>
    );
  }
}

export default ParamsComponent;
