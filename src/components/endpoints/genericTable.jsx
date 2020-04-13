import React, { Component } from "react";
import { isDashboardRoute } from "../common/utility";

class GenericTable extends Component {
  state = {
    bulkEdit: false,
    editButtonName: "Bulk Edit",
    originalParams: [],
    originalHeaders: [],
  };

  checkboxFlags = [];
  textAreaValue = "";
  //flags used to autofill bulk edit
  textAreaValueFlag = true;
  helperflag = false;
  count = "";

  // componentDidMount() {
  //   const dataArray = this.props.dataArray;
  //   console.log("dataArrArray", dataArray);
  //   const originalParams = dataArray;
  //   console.log("IN CDM", originalParams);
  //   this.setState({ originalParams });
  // }

  handleChange = (e) => {
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
    if (name[1] === "key" && title !== "Path Variables") {
      dataArray[name[0]].key = e.currentTarget.value;
      if (
        dataArray[name[0]].key.length !== 0 &&
        !this.checkboxFlags[name[0]] &&
        title !== "Path Variables"
      ) {
        dataArray[name[0]].checked = "true";
      }
      if (title === "Params" && dataArray[name[0]].key.length === 0) {
        this.handleDelete(dataArray, name[0], title);
      }
      if (title !== "Path Variables") {
        this.handleAdd(dataArray, title, dataArray[name[0]].key, name[0]);
      }
    }
    if (name[1] === "value") {
      if (
        dataArray[name[0]].value.length !== 0 &&
        !this.checkboxFlags[name[0]] &&
        title !== "Path Variables"
      ) {
        dataArray[name[0]].checked = "true";
      }
      dataArray[name[0]].value = e.currentTarget.value;
      if (title !== "Path Variables") {
        this.handleAdd(dataArray, title, dataArray[name[0]].value, name[0]);
      }
    }
    if (name[1] === "description") {
      if (
        dataArray[name[0]].description.length !== 0 &&
        !this.checkboxFlags[name[0]] &&
        title !== "Path Variables"
      ) {
        dataArray[name[0]].checked = "true";
      }
      dataArray[name[0]].description = e.currentTarget.value;
      if (title !== "Path Variables") {
        this.handleAdd(
          dataArray,
          title,
          dataArray[name[0]].description,
          name[0]
        );
      }
    }

    // if (
    //   dataArray[name[0]].name[1].length !== 0 &&
    //   !this.checkboxFlags[name[0]] &&
    //   title !== "Path Variables"
    // ) {
    //   dataArray[name[0]].checked = "true";
    // }

    // if (title !== "Path Variables") {
    //   this.handleAdd(dataArray, title, dataArray[name[0]].name[1], name[0]);
    // }

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
    if (title === "Path Variables") {
      this.props.props_from_parent(title, dataArray);
    }
  };

  handleBulkChange = (e) => {
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
      description: "",
    };
    if (title === "Params")
      this.props.props_from_parent("originalParams", dataArray);
    if (title === "Headers")
      this.props.props_from_parent("originalHeaders", dataArray);
    if (title === "formData") {
      this.props.handle_change_body_data(title, dataArray);
    }
    if (title === "x-www-form-urlencoded") {
      this.props.handle_change_body_data(title, dataArray);
    }
  };

  handleAdd(dataArray, title, key, index) {
    index = parseInt(index) + 1;
    if (key.length >= 1 && !dataArray[index]) {
      const len = dataArray.length;
      dataArray[len.toString()] = {
        checked: "notApplicable",
        key: "",
        value: "",
        description: "",
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
        editButtonName: "Bulk Edit",
      });
    } else {
      if (!this.helperflag && this.textAreaValueFlag) {
        this.helperflag = true;
      } else {
        this.textAreaValueFlag = true;
      }
      this.setState({
        bulkEdit: true,
        editButtonName: "Key-Value Edit",
      });
    }
  }

  autoFillBulkEdit() {
    let textAreaValue = "";
    const { dataArray, count } = this.props;
    if (count) {
      if (
        (this.state.bulkEdit && this.textAreaValueFlag) ||
        this.count !== count
      ) {
        this.count = count;
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
    } else {
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
  }

  render() {
    const { dataArray, original_data, title } = this.props;
    if (!isDashboardRoute(this.props)) {
      for (let index = 0; index < dataArray.length; index++) {
        if (dataArray[index].key === "") {
          dataArray.splice(index, 1);
        }

        if (original_data[index].key === "") {
          original_data.splice(index, 1);
        }
      }
    }

    this.autoFillBulkEdit();
    return (
      <div className="generic-table-container">
        <div
          className={
            isDashboardRoute(this.props)
              ? "generic-table-title-container"
              : "public-generic-table-title-container"
          }
        >
          {title}
          {title === "Path Variables" ||
          !isDashboardRoute(this.props) ? null : (
            <button
              id="edit-button"
              className="btn btn-default custom-button"
              style={{ float: "right", color: "tomato" }}
              onClick={() => this.displayEditButton()}
            >
              {this.state.editButtonName}
            </button>
          )}
        </div>
        {!this.state.bulkEdit && dataArray.length > 0 ? (
          <table className="table table-bordered" id="custom-generic-table">
            <thead>
              <tr>
                <th className="custom-th"> </th>
                <th className="custom-th" id="generic-table-key-cell">
                  KEY
                </th>
                <th className="custom-th">VALUE</th>
                <th className="custom-th">DESCRIPTION</th>
              </tr>
            </thead>
            <tbody style={{ border: "none" }}>
              {dataArray.map((e, index) => (
                <tr key={index} id="generic-table-row">
                  <td
                    className="custom-td"
                    id="generic-table-key-cell"
                    style={{ "margin-left": "5px" }}
                  >
                    {dataArray[index].checked === "notApplicable" ? null : (
                      <input
                        disabled={
                          isDashboardRoute(this.props) ||
                          original_data[index].checked === "false"
                            ? null
                            : "disabled"
                        }
                        name={index + ".checkbox"}
                        value={dataArray[index].checked}
                        checked={
                          dataArray[index].checked === "true" ? true : false
                        }
                        type="checkbox"
                        className="Checkbox"
                        onChange={this.handleChange}
                        style={{ border: "none" }}
                      />
                    )}
                  </td>
                  <td className="custom-td">
                    <input
                      disabled={
                        isDashboardRoute(this.props) ? null : "disabled"
                      }
                      name={index + ".key"}
                      value={dataArray[index].key}
                      onChange={this.handleChange}
                      type={"text"}
                      placeholder={
                        dataArray[index].checked === "notApplicable"
                          ? "Key"
                          : ""
                      }
                      className="form-control"
                      style={{ border: "none" }}
                    />
                  </td>
                  <td className="custom-td">
                    <input
                      name={index + ".value"}
                      value={dataArray[index].value}
                      onChange={this.handleChange}
                      type={"text"}
                      placeholder={
                        dataArray[index].checked === "notApplicable"
                          ? "Value"
                          : ""
                      }
                      className="form-control"
                      style={{ border: "none" }}
                    />
                  </td>
                  <td className="custom-td" id="generic-table-description-cell">
                    <input
                      disabled={
                        isDashboardRoute(this.props) ? null : "disabled"
                      }
                      name={index + ".description"}
                      value={dataArray[index].description}
                      onChange={this.handleChange}
                      type={"text"}
                      placeholder={
                        dataArray[index].checked === "notApplicable"
                          ? "Description"
                          : ""
                      }
                      style={{ border: "none" }}
                      className="form-control"
                    />
                    {dataArray.length - 1 === index ||
                    !isDashboardRoute(this.props) ? null : (
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
        ) : null}

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
