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

  handleDelete(bodyDescription, key, index) {
    bodyDescription[key].default.splice(index, 1);
    this.props.set_public_body(bodyDescription);
  }

  handleAdd(bodyDescription, key) {
    bodyDescription[key].default.push(null);
    this.props.set_public_body(bodyDescription);
  }

  handleChange = (e) => {
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
      } else {
        bodyDescription[key].default = e.currentTarget.value;
      }
    }
    this.props.set_public_body(bodyDescription);
  };

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

  displayArray(key) {
    return (
      <div>
        {this.props.body_description[key].default.map((value, index) => (
          <div>
            <input
              style={{
                marginLeft: "50px",
                width: "60%",
              }}
              type={
                this.props.body_description[key].dataType === "Array of Integer"
                  ? "number"
                  : "text"
              }
              //type="text"
              name={key + "." + index + ".value"}
              value={value}
              onChange={this.handleChange}
            ></input>
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
        <span
          class="badge badge-success"
          style={{
            marginLeft: "50px",
            marginTop: "5px",
          }}
          onClick={() => this.handleAdd(this.props.body_description, key)}
        >
          Add+
        </span>
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

    // if (this.keysArray.length > 0) {
    //   // const jsonData = JSON.parse(this.props.body.value);
    //   this.keysArray = Object.keys(this.props.body_description);
    //   this.defaultValuesArray = Object.values();
    //   const data = Object.values(JSON.parse(this.props.endpoint.body.value));
    //   let i;
    //   for (i in data) {
    //     let type = typeof data[i];
    //     if (type === "object") {
    //       if (Array.isArray(data[i])) {
    //         if (typeof data[i][0] === "number") type = "Array";
    //         else if (typeof data[i][0] === "string") type = "Array";
    //         //type = "Array";
    //         else type = "Array of Objects";
    //       }
    //     }
    //     this.dataType[i] = type;
    //   }
    // }
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
                          <select
                            id="custom-select-box"
                            value={bodyDescription[key].default}
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
                        ) : bodyDescription[key].dataType ===
                          "Array of Integer" ? (
                          this.displayArray(key)
                        ) : bodyDescription[key].dataType ===
                          "Array of String" ? (
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
                            value={bodyDescription[key].default}
                            onChange={this.handleChange}
                            // type={
                            //   this.dataType[index] === "number"
                            //     ? "number"
                            //     : "text"
                            // }
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
