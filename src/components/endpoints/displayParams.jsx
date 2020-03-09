import React, { Component } from "react";
import GenericTable from "./table";

class ParamsComponent extends Component {
  state = {};

  handleDeleteParam(index) {
    let originalParams = this.originalParams;
    let neworiginalParams = [];
    for (let i = 0; i < originalParams.length; i++) {
      if (i === index) {
        continue;
      }
      neworiginalParams.push(this.originalParams[i]);
    }
    originalParams = neworiginalParams;
    this.props.props_from_parent("originalParams", originalParams);
  }

  async handleAddParam() {
    const len = this.originalParams.length;
    let originalParams = [...this.originalParams, len.toString()];
    originalParams[[len.toString()]] = {
      key: "",
      value: "",
      description: ""
    };
    this.originalParams = originalParams;
    this.props.props_from_parent("handleAddParam", originalParams);
  }

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
          title="Add Params"
          dataArray={this.originalParams}
          handleDelete={this.handleDeleteParam.bind(this)}
          handleAdd={this.handleAddParam.bind(this)}
          handleChange={this.handleChangeParam.bind(this)}
        ></GenericTable>
      </div>
    );
  }
}

export default ParamsComponent;
