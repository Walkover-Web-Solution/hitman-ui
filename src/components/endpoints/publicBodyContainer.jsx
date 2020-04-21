import React, { Component } from "react";
import GenericTable from "./genericTable";
import "./publicEndpoint.scss";

class PublicBodyContainer extends Component {
  state = {};

  handleChangeBody(title, dataArray) {
    switch (title) {
      case "formData":
        this.props.set_body("multipart/form-data", dataArray);
        break;
      case "x-www-form-urlencoded":
        this.props.set_body("application/x-www-form-urlencoded", dataArray);
        break;
      default:
        break;
    }
  }

  handleDelete(key, index) {
    this.body[key].splice(index, 1);
    this.props.set_public_body(this.body);
  }

  handleAdd(body, key) {
    body[key].push(this.props.body_description[key].default[0]);
    this.props.set_public_body(body);
  }

  handleChange = (e) => {
    const name = e.currentTarget.name.split(".");
    const key = name[0];
    const bodyDescription = this.props.body_description;
    let body = this.body;
    const { type, value } = e.currentTarget;
    if (type === "number") {
      switch (bodyDescription[key].dataType) {
        case "Array of number":
          body[key][name[1]] = parseInt(value);
          break;
        case "object":
          body[key][name[1]] = parseInt(value);
          break;
        case "Array of object":
          body[key][name[1]][name[2]] = parseInt(value);
          break;
        case "Object of objects":
          body[key][name[1]][name[2]] = parseInt(value);
          break;
        default:
          body[key] = parseInt(value);
      }
    } else {
      switch (bodyDescription[key].dataType) {
        case "Array of string":
          body[key][name[1]] = value;
          break;
        case "object":
          body[key][name[1]] = value;
          break;
        case "Array of object":
          body[key][name[1]][name[2]] = value;
          break;
        case "Object of objects":
          body[key][name[1]][name[2]] = value;
          break;
        case "Array of boolean":
          body[key][name[1]] = value;
          break;
        default:
          body[key] = value;
      }
    }
    this.props.set_public_body(body);
  };

  displayAddButton(key) {
    return (
      <div className="array-row-add-wrapper">
        <span
          className="badge badge-success"
          onClick={() => this.handleAdd(this.body, key)}
        >
          Add+
        </span>
      </div>
    );
  }

  displayBoolean(value, name, className) {
    return (
      <select
        className={className || "custom-boolean"}
        value={value}
        onChange={this.handleChange}
        name={name}
      >
        <option value={null}></option>
        <option value={true}>true</option>
        <option value={false}>false</option>
      </select>
    );
  }

  displayInput(value, name, className) {
    let type = typeof value;
    type = type === "object" || type === "number" ? "number" : "string";
    return (
      <input
        className={className || "custom-input"}
        type={type}
        name={name}
        value={value}
        placeholder="Value"
        onChange={this.handleChange}
      ></input>
    );
  }

  obectDiv(obj, key, index) {
    return (
      <div className="object-container">
        {Object.keys(obj).map((k) => (
          <div key={k} className="object-row-wrapper">
            <label>{k}</label>
            {this.props.body_description[key].dataType === "object"
              ? this.displayInput(
                  obj[k],
                  key + "." + k + ".value",
                  "object-value"
                )
              : this.displayInput(
                  obj[k],
                  key + "." + index + "." + k + ".value",
                  "object-value"
                )}
          </div>
        ))}
      </div>
    );
  }

  displayArray(key) {
    return (
      <div>
        {this.body[key].map((value, index) => (
          <div key={index} className="array-row">
            {this.props.body_description[key].dataType === "Array of boolean"
              ? this.displayBoolean(
                  value,
                  key + "." + index + ".value",
                  "array-boolean"
                )
              : this.displayInput(
                  value,
                  key + "." + index + ".value",
                  "array-input"
                )}
            <button
              type="button"
              className="btn cross-button"
              onClick={() => this.handleDelete(key, index)}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        ))}
        {this.displayAddButton(key)}
      </div>
    );
  }

  render() {
    console.log(this.props);
    const bodyDescription = this.props.body_description;
    if (this.props.body.type === "JSON") {
      this.body = JSON.parse(this.props.body.value);
      this.keysArray = Object.keys(this.body);
      console.log("in if");
      if (
        this.props.public_body_flag &&
        this.props.body &&
        this.props.body.type === "JSON"
      ) {
        for (let i = 0; i < this.keysArray.length; i++) {
          this.body[this.keysArray[i]] =
            bodyDescription[this.keysArray[i]].default;
        }
        this.props.set_public_body(this.body);
      }
    }
    return (
      <div>
        {this.props.body && this.props.body.type === "multipart/form-data" && (
          <GenericTable
            {...this.props}
            title="formData"
            dataArray={this.props.body.value}
            handle_change_body_data={this.handleChangeBody.bind(this)}
            original_data={[...this.props.body.value]}
          ></GenericTable>
        )}

        {this.props.body &&
          this.props.body.type === "application/x-www-form-urlencoded" && (
            <GenericTable
              {...this.props}
              title="x-www-form-urlencoded"
              dataArray={this.props.body.value}
              handle_change_body_data={this.handleChangeBody.bind(this)}
              original_data={[...this.props.body.value]}
            ></GenericTable>
          )}

        {this.props.body &&
          this.props.body.type === "JSON" &&
          this.keysArray &&
          this.keysArray.length > 0 && (
            <div>
              <div className="public-generic-table-container">
                <div className="public-generic-table-title-container">Body</div>
                <table
                  className="table table-bordered"
                  id="custom-generic-table"
                >
                  <thead>
                    <tr>
                      <th> </th>
                      <th>KEY</th>
                      <th>VALUE</th>
                      <th>DESCRIPTION</th>
                    </tr>
                  </thead>
                  <tbody style={{ border: "none" }}>
                    {this.keysArray.map((key, index) => (
                      <tr key={index}>
                        <td style={{ marginLeft: "5px" }}></td>
                        <td>
                          <div>
                            <input
                              disabled
                              className="key-input"
                              value={key}
                              type={"text"}
                            ></input>
                            <label className="data-type">
                              {bodyDescription[key].dataType}
                            </label>
                          </div>
                        </td>
                        <td>
                          {bodyDescription[key].dataType === "boolean" ? (
                            this.displayBoolean(this.body[key], key + ".value")
                          ) : bodyDescription[key].dataType ===
                            "Array of number" ? (
                            this.displayArray(key)
                          ) : bodyDescription[key].dataType ===
                            "Array of string" ? (
                            this.displayArray(key)
                          ) : bodyDescription[key].dataType ===
                            "Array of boolean" ? (
                            this.displayArray(key)
                          ) : bodyDescription[key].dataType === "object" ? (
                            this.obectDiv(this.body[key], key)
                          ) : bodyDescription[key].dataType ===
                            "Array of object" ? (
                            <React.Fragment>
                              {this.body[key].map((obj, i) => (
                                <div key={i} className="object-wrapper">
                                  {this.obectDiv(obj, key, i)}

                                  <button
                                    type="button"
                                    className="btn cross-button"
                                    onClick={() => this.handleDelete(key, i)}
                                  >
                                    <i className="fas fa-times"></i>
                                  </button>
                                </div>
                              ))}
                              {this.displayAddButton(key)}
                            </React.Fragment>
                          ) : bodyDescription[key].dataType ===
                            "Object of objects" ? (
                            <div>
                              {Object.keys(this.body[key]).map((k) => (
                                // <div
                                //   key={k}
                                //   // style={{
                                //   //   marginLeft: "5px",
                                //   //   border: "1px solid",
                                //   //   width: "80%",
                                //   //   padding: "5px",
                                //   //   background: "lightgrey",
                                //   // }}
                                // >
                                <div className="object-wrapper" key={k}>
                                  {this.obectDiv(this.body[key][k], key, k)}
                                </div>
                              ))}
                            </div>
                          ) : (
                            this.displayInput(this.body[key], key + ".value")
                          )}
                        </td>
                        <td>
                          <input
                            disabled
                            name={index + ".datatype"}
                            type="text"
                            value={bodyDescription[key].description}
                            placeholder="Description"
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
