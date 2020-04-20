import React, { Component } from "react";
import GenericTable from "./genericTable";

class PublicBodyContainer extends Component {
  state = {};

  handleChangeBody(title, dataArray) {
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

  handleDelete(bodyDescription, key, index) {
    bodyDescription[key].default.splice(index, 1);
    this.props.set_public_body(bodyDescription);
  }

  handleAdd(bodyDescription, key) {
    if (bodyDescription[key].dataType === "Array of Objects")
      bodyDescription[key].default.push({ ...bodyDescription[key].object });
    //bodyDescription[key].default.push(bodyDescription[key].object);
    else bodyDescription[key].default.push(null);
    this.props.set_public_body(bodyDescription);
  }

  handleChange = (e) => {
    console.log(e.currentTarget);
    const name = e.currentTarget.name.split(".");
    const key = name[0];
    const bodyDescription = this.props.body_description;
    if (e.target.type === "number") {
      if (bodyDescription[key].dataType === "Array of Integer") {
        bodyDescription[key].default[name[1]] = parseInt(e.currentTarget.value);
      } else if (bodyDescription[key].dataType === "Object") {
        bodyDescription[key].default[name[1]] = parseInt(e.currentTarget.value);
      } else if (bodyDescription[key].dataType === "Array of Objects") {
        bodyDescription[key].default[name[1]][name[2]] = parseInt(
          e.currentTarget.value
        );
      } else if (bodyDescription[key].dataType === "Object of Objects") {
        bodyDescription[key].default[name[1]][name[2]] = parseInt(
          e.currentTarget.value
        );
      } else {
        bodyDescription[key].default = parseInt(e.currentTarget.value);
      }
    } else {
      if (bodyDescription[key].dataType === "Array of String") {
        bodyDescription[key].default[name[1]] = e.currentTarget.value;
      } else if (bodyDescription[key].dataType === "Object") {
        bodyDescription[key].default[name[1]] = e.currentTarget.value;
      } else if (bodyDescription[key].dataType === "Array of Objects") {
        bodyDescription[key].default[name[1]][name[2]] = e.currentTarget.value;
      } else if (bodyDescription[key].dataType === "Array of Boolean") {
        bodyDescription[key].default[name[1]] = e.currentTarget.value;
      } else if (bodyDescription[key].dataType === "Object of Objects") {
        bodyDescription[key].default[name[1]][name[2]] = e.currentTarget.value;
      } else {
        bodyDescription[key].default = e.currentTarget.value;
      }
    }
    this.props.set_public_body(bodyDescription);
  };

  displayAddButton(bodyDescription, key) {
    return (
      <span
        class="badge badge-success"
        style={{
          marginLeft: "50px",
          marginTop: "5px",
        }}
        onClick={() => this.handleAdd(bodyDescription, key)}
      >
        Add+
      </span>
    );
  }
  displayBoolean(key, value, name) {
    return (
      <select
        id="custom-select-box"
        value={value}
        onChange={this.handleChange}
        name={name}
        style={{ width: "20%" }}
      >
        <option value={null}></option>
        <option value={true}>true</option>
        <option value={false}>false</option>
      </select>
    );
  }

  obectDiv(obj, key, index) {
    return (
      <div>
        {Object.keys(obj).map((k) => (
          <div>
            <label
              style={{
                marginLeft: "5px",
                paddingRight: "5px",
                width: "20%",
              }}
            >
              {k}
            </label>
            <input
              style={{
                marginLeft: "20px",
                width: "60%",
              }}
              type={typeof obj[k] === "number" ? "number" : "text"}
              name={
                this.props.body_description[key].dataType === "Object"
                  ? key + "." + k + ".value"
                  : key + "." + index + "." + k + ".value"
              }
              // name={key + "." + k + ".value"}
              value={obj[k]}
              onChange={this.handleChange}
            ></input>
          </div>
        ))}
      </div>
    );
  }

  displayInput(key, value, index) {
    return (
      <input
        style={{
          marginLeft: "50px",
          width: "60%",
        }}
        // type={
        //   this.props.body_description[key].dataType === "Array of Integer"
        //     ? "number"
        //     : "text"
        // }
        type={typeof value}
        name={key + "." + index + ".value"}
        value={value}
        onChange={this.handleChange}
      ></input>
    );
  }

  displayArray(key) {
    return (
      <div>
        {this.props.body_description[key].default.map((value, index) => (
          <div>
            {this.props.body_description[key].dataType === "Array of Boolean"
              ? this.displayBoolean(key, value, key + "." + index + ".value")
              : this.displayInput(key, value, index)}
            <button
              type="button"
              className="btn cross-button"
              onClick={() =>
                this.handleDelete(this.props.body_description, key, index)
              }
            >
              X
            </button>
          </div>
        ))}
        {this.displayAddButton(this.props.body_description, key)}
      </div>
    );
  }

  render() {
    console.log("props", this.props);
    const bodyDescription = this.props.body_description;
    this.keysArray = Object.keys(bodyDescription);
    //this.valuesArray = [];
    this.defaultValuesArray = [];
    this.dataType = [];

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

        {this.keysArray.length > 0 && (
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
                  {this.keysArray.map((key, index) => (
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
                            //name={index + ".key"}
                            value={key}
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
                            {bodyDescription[key].dataType}
                          </label>
                        </div>
                      </td>
                      <td className="custom-td">
                        {bodyDescription[key].dataType === "boolean" ? (
                          this.displayBoolean(
                            key,
                            bodyDescription[key].default,
                            key + ".value"
                          )
                        ) : bodyDescription[key].dataType ===
                          "Array of Integer" ? (
                          this.displayArray(key)
                        ) : bodyDescription[key].dataType ===
                          "Array of String" ? (
                          this.displayArray(key)
                        ) : bodyDescription[key].dataType ===
                          "Array of Boolean" ? (
                          this.displayArray(key)
                        ) : bodyDescription[key].dataType === "Object" ? (
                          this.obectDiv(bodyDescription[key].default, key)
                        ) : bodyDescription[key].dataType ===
                          "Array of Objects" ? (
                          <div>
                            {bodyDescription[key].default.map((obj, i) => (
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
                                  {this.obectDiv(obj, key, i)}
                                </div>
                                <button
                                  type="button"
                                  className="btn cross-button"
                                  onClick={() =>
                                    this.handleDelete(bodyDescription, key, i)
                                  }
                                >
                                  X
                                </button>
                              </div>
                            ))}
                            {this.displayAddButton(bodyDescription, key)}
                          </div>
                        ) : bodyDescription[key].dataType ===
                          "Object of Objects" ? (
                          <div>
                            {Object.keys(bodyDescription[key].default).map(
                              (k) => (
                                <div
                                  style={{
                                    marginLeft: "5px",
                                    border: "1px solid",
                                    width: "80%",
                                    padding: "5px",
                                    background: "lightgrey",
                                  }}
                                >
                                  {this.obectDiv(
                                    bodyDescription[key].default[k],
                                    key,
                                    k
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <input
                            name={key + ".value"}
                            value={bodyDescription[key].default}
                            onChange={this.handleChange}
                            type={
                              bodyDescription[key].dataType === "number"
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
                          value={bodyDescription[key].description}
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
