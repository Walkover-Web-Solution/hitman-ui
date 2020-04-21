import React, { Component } from "react";

class BodyDescription extends Component {
  state = { bodyDescription: {} };

  handleChange = (e, key) => {
    let fieldDescription = { ...this.props.field_description };
    fieldDescription[key] = e.currentTarget.value;
    this.props.set_field_description(fieldDescription);
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
        // onChange={this.handleChange}
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
          <div key={k}>
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
              disabled
              style={{
                marginLeft: "20px",
                width: "60%",
              }}
              type={typeof obj[k] === "number" ? "number" : "text"}
              name={
                this.props.body_description[key].dataType === "object"
                  ? key + "." + k + ".value"
                  : key + "." + index + "." + k + ".value"
              }
              // name={key + "." + k + ".value"}
              value={obj[k]}
              // onChange={this.handleChange}
            ></input>
          </div>
        ))}
      </div>
    );
  }

  displayInput(key, value, index) {
    return (
      <input
        disabled
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
        // onChange={this.handleChange}
      ></input>
    );
  }

  displayArray(key) {
    return (
      <div>
        {this.props.body_description[key].default.map((value, index) => (
          <div>
            {this.props.body_description[key].dataType === "Array of boolean"
              ? this.displayBoolean(key, value, key + "." + index + ".value")
              : this.displayInput(key, value, index)}
            {/* <button
              type="button"
              className="btn cross-button"
              onClick={() =>
                this.handleDelete(this.props.body_description, key, index)
              }
            >
              X
            </button> */}
          </div>
        ))}
        {/* {this.displayAddButton(this.props.body_description, key)} */}
      </div>
    );
  }

  render() {
    const bodyDescription = { ...this.props.body_description };
    this.keysArray = Object.keys(bodyDescription);

    return (
      <div>
        {this.props.body.type !== "JSON" && <div>{this.props.body.value}</div>}
        {/* {this.props.body.type === "JSON" && this.state.error && (
          <div>Please Enter a valid json to see Body Description</div>
        )} */}
        {this.props.body.type === "JSON" && this.keysArray.length > 0 && (
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
                          "Array of number" ? (
                          this.displayArray(key)
                        ) : bodyDescription[key].dataType ===
                          "Array of string" ? (
                          this.displayArray(key)
                        ) : bodyDescription[key].dataType ===
                          "Array of boolean" ? (
                          this.displayArray(key)
                        ) : bodyDescription[key].dataType === "object" ? (
                          this.obectDiv(bodyDescription[key].default, key)
                        ) : bodyDescription[key].dataType ===
                          "Array of object" ? (
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
                                {/* <button
                                  type="button"
                                  className="btn cross-button"
                                  onClick={() =>
                                    this.handleDelete(bodyDescription, key, i)
                                  }
                                >
                                  X
                                </button> */}
                              </div>
                            ))}
                            {/* {this.displayAddButton(bodyDescription, key)} */}
                          </div>
                        ) : bodyDescription[key].dataType ===
                          "Object of objects" ? (
                          <div>
                            {Object.keys(bodyDescription[key].default).map(
                              (k) => (
                                <div
                                  key={k}
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
                            disabled
                            name={key + ".value"}
                            value={bodyDescription[key].default}
                            // onChange={this.handleChange}
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
                          name={index + ".description"}
                          type="text"
                          value={this.props.field_description[key] || ""}
                          placeholder="Description"
                          className="form-control"
                          onChange={(e) => this.handleChange(e, key)}
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

export default BodyDescription;

// function recurseObject(obj, key1) {
//   for (var key in obj) {
//     // works for objects and arrays
//     var item = obj[key];
//     if (typeof item === "object") {
//       console.log(key1 + "." + key);
//       recurseObject(item, key);
//     } else console.log(key1 + "." + key);
//   }
// }
