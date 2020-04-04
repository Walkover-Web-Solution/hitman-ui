import React, { Component } from "react";

class GenericTable extends Component {
  state = {
    bulkEdit: false,
    editButtonName: "Bulk Edit"
  };

  checkboxFlags = [];
  textAreaValue = "";
  //flags used to autofill bulk edit
  textAreaValueFlag = true;
  helperflag = false;

  handleChange = e => {
    const { dataArray, title } = this.props;
    const name = e.currentTarget.name.split(".");
    if (name[1] === "checkbox") {
      this.checkboxFlags[name[0]] = true;
      if (dataArray[name[0]].checked === "true") {
        dataArray[name[0]].checked = "false";
      } else {
        dataArray[name[0]].checked = "true";
      }
    }
    if (name[1] === "key") {
      dataArray[name[0]].key = e.currentTarget.value;
      if (dataArray[name[0]].key.length !== 0 && !this.checkboxFlags[name[0]]) {
        dataArray[name[0]].checked = "true";
      }
      if (title === "Params" && dataArray[name[0]].key.length === 0) {
        this.handleDelete(dataArray, name[0], title);
      }
      this.handleAdd(dataArray, title, dataArray[name[0]].key, name[0]);
    }
    if (name[1] === "value") {
      if (
        dataArray[name[0]].value.length !== 0 &&
        !this.checkboxFlags[name[0]]
      ) {
        dataArray[name[0]].checked = "true";
      }
      dataArray[name[0]].value = e.currentTarget.value;
      this.handleAdd(dataArray, title, dataArray[name[0]].value, name[0]);
    }
    if (name[1] === "description") {
      if (
        dataArray[name[0]].description.length !== 0 &&
        !this.checkboxFlags[name[0]]
      ) {
        dataArray[name[0]].checked = "true";
      }
      dataArray[name[0]].description = e.currentTarget.value;
      this.handleAdd(dataArray, title, dataArray[name[0]].description, name[0]);
    }
    if (title === "Headers")
      this.props.props_from_parent("originalHeaders", dataArray);
    if (title === "Params")
      this.props.props_from_parent("originalParams", dataArray);
    if (title === "formData") {
      this.props.handle_change_body_data(title, dataArray);
    }
    if (title === "x-www-form-urlencoded") {
      this.props.handle_change_body_data(title, dataArray);
    }
  };

  handleBulkChange = e => {
    const { title } = this.props;
    let dataArray = [];
    this.textAreaValue = e.currentTarget.value;
    const array = e.currentTarget.value.split("\n");
    let j = 0;
    for (let i = 0; i < array.length; i++) {
      let key = array[i].split(":")[0];
      key = key.trim();
      let value = "";
      if (array[i].split(":")[1]) value = array[i].split(":")[1];
      if (key === "" && value === "") continue;
      let obj = {};
      if (key.substring(0, 2) === "//" && key.length > 2) {
        key = key.substring(2);
        obj = { checked: "false", key, value, description: "" };
      } else if (
        key.substring(0, 2) === "//" &&
        key.length === 2 &&
        value.length === 0
      )
        continue;
      else if (
        key.substring(0, 2) === "//" &&
        key.length === 2 &&
        value.length !== 0
      ) {
        key = key.substring(2);
        obj = { checked: "false", key, value, description: "" };
      } else {
        obj = { checked: "true", key, value, description: "" };
      }
      dataArray[j.toString()] = obj;
      j++;
    }
    dataArray[j.toString()] = {
      checked: "notApplicable",
      key: "",
      value: "",
      description: ""
    };
    if (title === "Params")
      this.props.props_from_parent("originalParams", dataArray);
    if (title === "Headers")
      this.props.props_from_parent("originalHeaders", dataArray);
  };

  handleAdd(dataArray, title, key, index) {
    index = parseInt(index) + 1;
    if (key.length === 1 && !dataArray[index]) {
      const len = dataArray.length;
      dataArray[len.toString()] = {
        checked: "notApplicable",
        key: "",
        value: "",
        description: ""
      };
      if (title === "Headers")
        this.props.props_from_parent("originalHeaders", dataArray);
      if (title === "Params")
        this.props.props_from_parent("handleAddParam", dataArray);
    }
  }

  handleDelete(dataArray, index, title) {
    let newDataArray = [];
    for (let i = 0; i < dataArray.length; i++) {
      if (i === index) {
        continue;
      }
      newDataArray.push(dataArray[i]);
    }
    dataArray = newDataArray;
    if (title === "Headers")
      this.props.props_from_parent("originalHeaders", dataArray);
    if (title === "Params")
      this.props.props_from_parent("originalParams", dataArray);
    if (title === "formData") {
      this.props.handle_change_body_data(title, dataArray);
    }
    if (title === "x-www-form-urlencoded") {
      this.props.handle_change_body_data(title, dataArray);
    }
  }
  displayEditButton() {
    if (this.state.bulkEdit) {
      this.setState({
        bulkEdit: false,
        editButtonName: "Bulk Edit"
      });
    } else {
      if (!this.helperflag && this.textAreaValueFlag) {
        this.helperflag = true;
      } else {
        this.textAreaValueFlag = true;
      }
      this.setState({
        bulkEdit: true,
        editButtonName: "Key-Value Edit"
      });
    }
  }

  autoFillBulkEdit() {
    let textAreaValue = "";
    const { dataArray } = this.props;
    if (this.state.bulkEdit && this.textAreaValueFlag) {
      this.textAreaValueFlag = false;
      for (let index = 0; index < dataArray.length; index++) {
        const { checked } = dataArray[index];
        if (checked === "notApplicable") continue;
        if (checked === "true") {
          textAreaValue +=
            dataArray[index].key + ":" + dataArray[index].value + "\n";
        } else {
          textAreaValue +=
            "//" + dataArray[index].key + ":" + dataArray[index].value + "\n";
        }
      }
      this.textAreaValue = textAreaValue;
    }
  }

  render() {
    console.log("this.props", this.props);
    const { dataArray, title } = this.props;
    this.autoFillBulkEdit();

    return (
      <div className="generic-table-container">
        <div className="generic-table-title-container">
          {title}
          <button
            className="btn btn-default custom-button"
            style={{ float: "right", color: "#f28100" }}
            onClick={() => this.displayEditButton()}
          >
            {this.state.editButtonName}
          </button>
        </div>
        {!this.state.bulkEdit && (
          <table className="table table-bordered" bordered>
            <thead>
              <tr>
                <th className="custom-td"> </th>
                <th className="custom-td" id="generic-table-key-cell">
                  KEY
                </th>
                <th className="custom-td">VALUE</th>
                <th className="custom-td">DESCRIPTION</th>
              </tr>
            </thead>
            <tbody>
              {dataArray.map((e, index) => (
                <tr key={index} id="generic-table-row">
                  <td className="custom-td" id="generic-table-key-cell">
                    {dataArray[index].checked === "notApplicable" ? null : (
                      <input
                        name={index + ".checkbox"}
                        value={dataArray[index].checked}
                        checked={
                          dataArray[index].checked === "true" ? true : false
                        }
                        onChange={this.handleChange}
                        type={"checkbox"}
                        className="form-control"
                        style={{ border: "none" }}
                      />
                    )}
                  </td>
                  <td className="custom-td">
                    <input
                      name={index + ".key"}
                      value={dataArray[index].key}
                      onChange={this.handleChange}
                      type={"text"}
                      className="form-control"
                      style={{ border: "none" }}
                    />
                  </td>{" "}
                  <td className="custom-td">
                    <input
                      name={index + ".value"}
                      value={dataArray[index].value}
                      onChange={this.handleChange}
                      type={"text"}
                      className="form-control"
                      style={{ border: "none" }}
                    />
                  </td>
                  <td className="custom-td" id="generic-table-description-cell">
                    <input
                      name={index + ".description"}
                      value={dataArray[index].description}
                      onChange={this.handleChange}
                      type={"text"}
                      style={{ border: "none" }}
                      className="form-control"
                    />
                    {dataArray.length - 1 === index ? null : (
                      <button
                        type="button"
                        className="btn cross-button"
                        onClick={() =>
                          this.handleDelete(dataArray, index, title)
                        }
                      >
                        x
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {this.state.bulkEdit && (
          <div id="custom-bulk-edit">
            <textarea
              className="form-control"
              name="contents"
              id="contents"
              rows="9"
              value={this.textAreaValue}
              onChange={this.handleBulkChange}
              placeholder={
                "Rows are separated by new lines \n Keys and values are separated by : \n Prepend // to any row you want to add but keep disabled"
              }
            />
          </div>
        )}
      </div>
    );
  }
}

export default GenericTable;
