import React, { Component } from "react";

class GenericTable extends Component {
  state = {};

  checkboxFlags = [];

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
      dataArray[name[0]].value = e.currentTarget.value;
    }
    if (name[1] === "description") {
      dataArray[name[0]].description = e.currentTarget.value;
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

  handleAdd(dataArray, title, key, index) {
    index = parseInt(index) + 1;
    if (key.length === 1 && !dataArray[index]) {
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

  render() {
    const { dataArray, title } = this.props;
    return (
      <div className="generic-table-container">
        <div className="generic-table-title-container">{title}</div>
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
                      defaultChecked={
                        dataArray[index].checked === "true" ? "true" : "false"
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
                      onClick={() => this.handleDelete(dataArray, index, title)}
                    >
                      x
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default GenericTable;
