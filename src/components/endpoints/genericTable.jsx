import React, { Component } from "react";
import { Table } from "react-bootstrap";

class GenericTable extends Component {
  state = {};

  handleChange = e => {
    const { dataArray, title } = this.props;
    const name = e.currentTarget.name.split(".");
    if (name[1] === "key") {
      dataArray[name[0]].key = e.currentTarget.value;
      if (title === "Add Params" && dataArray[name[0]].key.length === 0) {
        this.handleDelete(dataArray, name[0], title);
      }
    }
    if (name[1] === "value") {
      dataArray[name[0]].value = e.currentTarget.value;
    }
    if (name[1] === "description") {
      dataArray[name[0]].description = e.currentTarget.value;
    }
    if (title === "Add Headers")
      this.props.props_from_parent("originalHeaders", dataArray);
    if (title === "Add Params")
      this.props.props_from_parent("originalParams", dataArray);
  };

  handleAdd(dataArray, title) {
    const len = dataArray.length;
    dataArray[len.toString()] = {
      key: "",
      value: "",
      description: ""
    };
    if (title === "Add Headers")
      this.props.props_from_parent("originalHeaders", dataArray);
    if (title === "Add Params")
      this.props.props_from_parent("originalParams", dataArray);
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
    if (title === "Add Headers")
      this.props.props_from_parent("originalHeaders", dataArray);
    if (title === "Add Params")
      this.props.props_from_parent("originalParams", dataArray);
  }

  render() {
    const { dataArray, title } = this.props;
    return (
      <div className="generic-table-container">
        <div className="generic-table-title-container">{title}</div>
        <table className="table table-bordered" bordered>
          <thead>
            <tr>
              <th>KEY</th>
              <th>VALUE</th>
              <th>DESCRIPTION</th>
            </tr>
          </thead>

          <tbody>
            {dataArray.map((e, index) => (
              <tr key={index} id="generic-table-row">
                <td>
                  <input
                    name={index + ".key"}
                    value={dataArray[index].key}
                    onChange={this.handleChange}
                    type={"text"}
                    className="form-control"
                    style={{ border: "none" }}
                  />
                </td>
                <td>
                  <input
                    name={index + ".value"}
                    value={dataArray[index].value}
                    onChange={this.handleChange}
                    type={"text"}
                    className="form-control"
                    style={{ border: "none" }}
                  />
                </td>
                <td id="generic-table-description-cell">
                  <input
                    name={index + ".description"}
                    value={dataArray[index].description}
                    onChange={this.handleChange}
                    type={"text"}
                    style={{ border: "none" }}
                    className="form-control"
                  />
                  <button
                    type="button"
                    className="btn cross-button"
                    onClick={() => this.handleDelete(dataArray, index, title)}
                  >
                    x
                  </button>
                </td>
              </tr>
            ))}
            <tr>
              <td> </td>
              <td>
                {" "}
                <button
                  type="button"
                  className="btn btn-link btn-sm btn-block"
                  onClick={() => this.handleAdd(dataArray, title)}
                >
                  {"+ " + title}
                </button>
              </td>
              <td> </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default GenericTable;
