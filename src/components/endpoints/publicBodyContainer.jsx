import React, { Component } from "react";
import GenericTable from "./genericTable";

class PublicBodyContainer extends Component {
  state = {};

  handleChangeBody(title, dataArray) {
    console.log(title, dataArray);
    switch (title) {
      case "formData":
        this.props.set_body("formData", dataArray);
        break;
      case "x-www-form-urlencoded":
        this.props.set_body("urlEncoded", dataArray);
        break;
      default:
        break;
    }
  }

  handleDelete(valuesArrayIndex, index) {
    this.valuesArray[valuesArrayIndex].splice(index, 1);
    let i;
    let json = {};
    for (i in this.valuesArray) {
      json[this.keysArray[i]] = this.valuesArray[i];
    }
    json = JSON.stringify(json);
    this.props.set_body("JSON", json);
  }

  handleAdd(valuesArrayIndex) {
    const data = Object.values(JSON.parse(this.props.endpoint.body.value));

    if (
      typeof data[valuesArrayIndex][0] === "string" ||
      typeof data[valuesArrayIndex][0] === "number"
    )
      this.valuesArray[valuesArrayIndex].push(null);
    else this.valuesArray[valuesArrayIndex].push(data[valuesArrayIndex][0]);
    let i;
    let json = {};
    for (i in this.valuesArray) {
      json[this.keysArray[i]] = this.valuesArray[i];
    }
    console.log(json);
    json = JSON.stringify(json);
    this.props.set_body("JSON", json);
  }

  handleChange = (e) => {
    let valuesArray = [...this.valuesArray];
    const name = e.currentTarget.name.split(".");
    console.log(name);
    console.log(this.dataType);
    if (e.target.type === "number") {
      if (this.dataType[name[0]] === "Array") {
        valuesArray[name[0]][name[1]] = parseInt(e.currentTarget.value);
      } else if (this.dataType[name[0]] === "object") {
        valuesArray[name[0]][name[1]] = parseInt(e.currentTarget.value);
      } else if (this.dataType[name[0]] === "Array of Objects") {
        valuesArray[name[0]][name[1]][name[2]] = parseInt(
          e.currentTarget.value
        );
      } else {
        valuesArray[name[0]] = parseInt(e.currentTarget.value);
      }
    } else {
      if (this.dataType[name[0]] === "Array") {
        valuesArray[name[0]][name[1]] = e.currentTarget.value;
      } else if (this.dataType[name[0]] === "object") {
        valuesArray[name[0]][name[1]] = e.currentTarget.value;
      } else if (this.dataType[name[0]] === "Array of Objects") {
        valuesArray[name[0]][name[1]][name[2]] = e.currentTarget.value;
      } else {
        valuesArray[name[0]] = e.currentTarget.value;
      }
    }
    let json = {};
    let i;
    for (i in valuesArray) {
      json[this.keysArray[i]] = valuesArray[i];
    }
    console.log(json);
    json = JSON.stringify(json);
    this.props.set_body("JSON", json);
  };

  obectDiv(obj, index, i) {
    return (
      <div>
        {Object.keys(obj).map((key) => (
          <div>
            <label
              style={{
                marginLeft: "5px",
                paddingRight: "5px",
                width: "20%",
              }}
            >
              {key}
            </label>
            <input
              style={{
                marginLeft: "20px",
                width: "60%",
              }}
              type={typeof obj[key] === "number" ? "number" : "text"}
              name={
                this.dataType[index] === "object"
                  ? index + "." + key + ".value"
                  : index + "." + i + "." + key + ".value"
              }
              value={obj[key]}
              onChange={this.handleChange}
            ></input>
          </div>
        ))}
      </div>
    );
  }

  render() {
    console.log("props", this.props);
    this.keysArray = [];
    this.valuesArray = [];
    this.dataType = [];

    if (this.props.body && this.props.body.type === "JSON") {
      const jsonData = JSON.parse(this.props.body.value);
      this.keysArray = Object.keys(jsonData);
      this.valuesArray = Object.values(jsonData);
      const data = Object.values(JSON.parse(this.props.endpoint.body.value));
      let i;
      for (i in data) {
        let type = typeof data[i];
        if (type === "object") {
          if (Array.isArray(data[i])) {
            if (typeof data[i][0] === "number") type = "Array";
            else if (typeof data[i][0] === "string") type = "Array";
            //type = "Array";
            else type = "Array of Objects";
          }
        }
        this.dataType[i] = type;
      }
    }
    return (
      <div>
        {this.props.body && this.props.body.type === "formData" && (
          <GenericTable
            {...this.props}
            title={this.props.body.type}
            dataArray={this.props.body.value}
            handle_change_body_data={this.handleChangeBody.bind(this)}
            original_data={[...this.props.body.value]}
          ></GenericTable>
        )}

        {this.props.body && this.props.body.type === "urlEncoded" && (
          <GenericTable
            {...this.props}
            title="x-www-form-urlencoded"
            dataArray={this.props.body.value}
            handle_change_body_data={this.handleChangeBody.bind(this)}
            original_data={[...this.props.body.value]}
          ></GenericTable>
        )}

        {this.props.body && this.props.body.type === "JSON" && (
          <div>
            <div className="generic-table-container">
              <div className="public-generic-table-title-container">Body</div>
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
                  {this.keysArray.map((e, index) => (
                    <tr key={index}>
                      <td
                        className="custom-td"
                        id="generic-table-key-cell"
                        style={{ marginLeft: "5px" }}
                      ></td>
                      <td className="custom-td">
                        <div>
                          <input
                            disabled
                            name={index + ".key"}
                            value={this.keysArray[index]}
                            type={"text"}
                            className="form-control"
                          ></input>
                          <label
                            style={{
                              marginLeft: "20px",
                              background: "lightgrey",
                              padding: "1px",
                              fontSize: "10px",
                            }}
                          >
                            {this.dataType[index]}
                          </label>
                        </div>
                      </td>
                      <td className="custom-td">
                        {this.dataType[index] === "boolean" ? (
                          <select
                            id="custom-select-box"
                            value={this.valuesArray[index]}
                            onChange={this.handleChange}
                            name={index + ".value"}
                            style={{ width: "20%" }}
                          >
                            <option value={true} key={true}>
                              true
                            </option>
                            <option value={false} key={false}>
                              false
                            </option>
                          </select>
                        ) : this.dataType[index] === "Array" ? (
                          <div>
                            {this.valuesArray[index].map((i, key) => (
                              <div>
                                <input
                                  style={{
                                    marginLeft: "50px",
                                    width: "60%",
                                  }}
                                  type={
                                    typeof i === "number" ? "number" : "text"
                                  }
                                  //type="text"
                                  name={index + "." + key + ".value"}
                                  value={i}
                                  onChange={this.handleChange}
                                ></input>
                                <button
                                  type="button"
                                  className="btn cross-button"
                                  onClick={() => this.handleDelete(index, key)}
                                >
                                  X
                                </button>
                              </div>
                            ))}
                            <span
                              class="badge badge-success"
                              style={{
                                marginLeft: "50px",
                                marginTop: "5px",
                              }}
                              onClick={() => this.handleAdd(index)}
                            >
                              Add+
                            </span>
                          </div>
                        ) : this.dataType[index] === "object" ? (
                          this.obectDiv(this.valuesArray[index], index)
                        ) : this.dataType[index] === "Array of Objects" ? (
                          <div>
                            {this.valuesArray[index].map((k, i) => (
                              <div
                                style={{
                                  display: "flex",
                                  margin: "10px",
                                }}
                              >
                                <div
                                  style={{
                                    marginLeft: "5px",
                                    border: "1px solid",
                                    width: "80%",
                                    padding: "5px",
                                    background: "lightgrey",
                                  }}
                                >
                                  {this.obectDiv(k, index, i)}
                                </div>
                                <button
                                  type="button"
                                  className="btn cross-button"
                                  onClick={() => this.handleDelete(index, i)}
                                >
                                  X
                                </button>
                              </div>
                            ))}
                            <span
                              className="badge badge-success"
                              style={{
                                marginLeft: "50px",
                                marginTop: "5px",
                              }}
                              onClick={() => this.handleAdd(index)}
                            >
                              Add+
                            </span>
                          </div>
                        ) : (
                          <input
                            name={index + ".value"}
                            value={this.valuesArray[index]}
                            onChange={this.handleChange}
                            type={
                              this.dataType[index] === "number"
                                ? "number"
                                : "text"
                            }
                            placeholder="Value"
                            className="form-control"
                            style={{ border: "none" }}
                          />
                        )}
                      </td>
                      <td className="custom-td">
                        <input
                          disabled
                          name={index + ".datatype"}
                          type="text"
                          value={this.dataType[index]}
                          placeholder="DataType"
                          className="form-control"
                          style={{ border: "none" }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default PublicBodyContainer;
