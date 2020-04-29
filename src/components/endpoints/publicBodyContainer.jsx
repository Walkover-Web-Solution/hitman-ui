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

  performDelete(pkeys, value) {
    if (pkeys.length == 1) {
      value.splice(pkeys[0], 1);
      return;
    }
    const data = value[pkeys[0]].value;
    return this.performDelete(pkeys.slice(1, pkeys.length), data);
  }

  handleDelete(name) {
    this.performDelete(name.split("."), this.bodyDescription);
    console.log(name, this.bodyDescription);
    //this.props.set_public_body(this.body);
  }

  performAdd(pkeys, value) {
    if (pkeys.length == 1) {
      value[pkeys[0]].value.push(value[pkeys[0]].default);
      return;
    }
    const data = value[pkeys[0]].value;
    return this.performAdd(pkeys.slice(1, pkeys.length), data);
  }

  handleAdd(name) {
    this.performAdd(name.split("."), this.bodyDescription);
    console.log(name, this.bodyDescription);
    this.props.set_body_description(this.bodyDescription);
  }

  performChange(pkeys, bodyDescription, value) {
    if (pkeys.length == 1) {
      if ((bodyDescription[pkeys[0]].type = "number"))
        bodyDescription[pkeys[0]].value = parseInt(value);
      else if ((bodyDescription[pkeys[0]].type = "string"))
        bodyDescription[pkeys[0]].value = value;
      else bodyDescription[pkeys[0]].value = value;

      return;
    } else {
      const data = bodyDescription[pkeys[0]].value;
      this.performChange(pkeys.slice(1, pkeys.length), data, value);
    }
  }

  handleChange = (e) => {
    const name = e.currentTarget.name;
    console.log(name);
    // const key = name[0];
    //const bodyDescription = this.props.body_description;
    //let body = this.body;
    const { type, value } = e.currentTarget;
    //sconsole.log(type, value);
    this.performChange(name.split("."), this.bodyDescription, value);
    console.log(this.bodyDescription);
    // if (type === "number") {
    //   switch (bodyDescription[key].dataType) {
    //     case "Array of number":
    //       body[key][name[1]] = parseInt(value);
    //       break;
    //     case "object":
    //       body[key][name[1]] = parseInt(value);
    //       break;
    //     case "Array of object":
    //       body[key][name[1]][name[2]] = parseInt(value);
    //       break;
    //     case "Object of objects":
    //       body[key][name[1]][name[2]] = parseInt(value);
    //       break;
    //     default:
    //       body[key] = parseInt(value);
    //   }
    // } else {
    //   switch (bodyDescription[key].dataType) {
    //     case "Array of string":
    //       body[key][name[1]] = value;
    //       break;
    //     case "object":
    //       body[key][name[1]] = value;
    //       break;
    //     case "Array of object":
    //       body[key][name[1]][name[2]] = value;
    //       break;
    //     case "Object of objects":
    //       body[key][name[1]][name[2]] = value;
    //       break;
    //     case "Array of boolean":
    //       body[key][name[1]] = value;
    //       break;
    //     default:
    //       body[key] = value;
    //   }
    // }
    // this.props.set_public_body(body);
  };

  displayAddButton(name) {
    return (
      <div className="array-row-add-wrapper">
        <span
          className="badge badge-success"
          onClick={() => this.handleAdd(name)}
        >
          Add+
        </span>
      </div>
    );
  }

  displayBoolean(obj, name, className) {
    return (
      <select
        className={className || "custom-boolean"}
        value={obj.value}
        onChange={this.handleChange}
        name={name}
      >
        <option value={null}></option>
        <option value={true}>true</option>
        <option value={false}>false</option>
      </select>
    );
  }

  displayInput(obj, name, className) {
    return (
      <div>
        <input
          className={className || "custom-input"}
          type={obj.type}
          name={name}
          value={obj.value}
          placeholder="Value"
          onChange={this.handleChange}
        ></input>
        <input value={obj.description} disabled></input>
      </div>
    );
  }

  arrayInput(value, type, name) {
    return (
      <div>
        <input
          className={"custom-input"}
          type={type}
          name={name}
          value={value}
          placeholder="Value"
          onChange={this.handleChange}
        ></input>
      </div>
    );
  }

  displayArray(array, name) {
    return (
      <div>
        {array.map((value, index) => (
          <div key={index} className="array-row">
            {value.type === "boolean"
              ? this.displayBoolean(
                  value.value,
                  name + "." + index,
                  "array-boolean"
                )
              : value.type === "object"
              ? this.displayObject(value.value, name + "." + index)
              : this.arrayInput(value.value, value.type, name + "." + index)}
            <button
              type="button"
              className="btn cross-button"
              onClick={() => this.handleDelete(name + "." + index)}
            >
              X{/* <i className="fas fa-times"></i> */}
            </button>
          </div>
        ))}
        {this.displayAddButton(name)}
      </div>
    );
  }

  displayObject(obj, name) {
    return (
      <div style={{ border: "1px solid" }}>
        {Object.keys(obj).map((key, index) => (
          <div key={key} className="object-row-wrapper">
            <label>{key}</label>
            {obj[key].type === "object"
              ? this.displayObject(obj[key].value, name + "." + key)
              : obj[key].type === "array"
              ? this.displayArray(obj[key].value, name + "." + key)
              : obj[key].type === "boolean"
              ? this.displayBoolean(obj[key].value, name + "." + key)
              : this.displayInput(obj[key], name + "." + key, "object-value")}
          </div>
        ))}
      </div>
    );
  }

  render() {
    this.bodyDescription = this.props.body_description;
    console.log(this.props);
    // this.bodyDescription = {
    //   key1: { value: "abc", type: "string", description: "d" },
    //   key2: {
    //     value: {
    //       k1: { value: "v1", type: "string", description: "" },
    //       k2: { value: 10, type: "number", description: "" },
    //     },
    //     type: "object",
    //   },
    //   key3: {
    //     value: {
    //       key1: {
    //         value: {
    //           k1: { value: "v1", type: "string", description: "" },
    //           k2: { value: 10, type: "number", description: "" },
    //         },
    //         type: "object",
    //       },
    //       k22: { value: 10, type: "number", description: "" },
    //     },
    //     type: "object",
    //   },
    //   key4: {
    //     value: [
    //       { value: 2, type: "number", description: "sfdf" },
    //       { value: 3, type: "number", description: "sfdf" },
    //     ],
    //     type: "array",
    //     description: "dfd",
    //     default: { value: 2, type: "number", description: "sfdf" },
    //   },
    //   key5: {
    //     value: [
    //       {
    //         value: {
    //           k1: { value: "v1", type: "string", description: "" },
    //           k2: { value: 10, type: "number", description: "" },
    //         },
    //         type: "object",
    //         description: "",
    //       },
    //     ],
    //     type: "array",
    //     default: {
    //       value: {
    //         k1: { value: "v1", type: "string", description: "" },
    //         k2: { value: 10, type: "number", description: "" },
    //       },
    //       type: "object",
    //       description: "",
    //     },
    //   },

    //   key6: {
    //     value: {
    //       k1: {
    //         value: [
    //           { value: 2, type: "number", description: "sfdf" },
    //           { value: 3, type: "number", description: "sfdf" },
    //         ],
    //         type: "array",
    //         description: "",
    //         default: { value: 2, type: "number", description: "sfdf" },
    //       },
    //       k2: { value: 10, type: "number", description: "" },
    //     },
    //     type: "object",
    //   },
    // };

    // if (this.props.body.type === "JSON") {
    //   this.body = JSON.parse(this.props.body.value);
    //   this.keysArray = Object.keys(this.body);
    //   if (
    //     this.props.public_body_flag &&
    //     this.props.body &&
    //     this.props.body.type === "JSON"
    //   ) {
    //     for (let i = 0; i < this.keysArray.length; i++) {
    //       this.body[this.keysArray[i]] =
    //         bodyDescription[this.keysArray[i]].default;
    //     }
    //     this.props.set_public_body(this.body);
    //   }
    // }
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

        {this.props.body && this.props.body.type === "JSON" && (
          <div>
            <div>
              {Object.keys(this.bodyDescription).map((key) => (
                <div>
                  <label style={{ fontWeight: "bold" }}>{key}</label>
                  {this.bodyDescription[key].type === "string"
                    ? this.displayInput(
                        this.bodyDescription[key],
                        key,
                        "custom-input"
                      )
                    : this.bodyDescription[key].type === "number"
                    ? this.displayInput(
                        this.bodyDescription[key],
                        key,
                        "custom-input"
                      )
                    : this.bodyDescription[key].type === "object"
                    ? this.displayObject(this.bodyDescription[key].value, key)
                    : this.bodyDescription[key].type === "array"
                    ? this.displayArray(this.bodyDescription[key].value, key)
                    : null}
                </div>
              ))}
            </div>
            {/* <div>
              <table class="table">
                <thead>
                  <tr>
                    <th scope="col">Key</th>
                    <th scope="col">Default Value</th>
                    <th scope="col">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {this.bodyDescription.map((k, index) => (
                    <tr>
                      <th
                        scope="row"
                        style={{
                          textIndent: `${k.parentKeys.length * 25}px`,
                        }}
                      >
                        {k.name}
                        <label className="data-type">{k.type}</label>
                      </th>
                      {k.type === "array" && (
                        <button
                          onClick={() =>
                            this.handleAdd(
                              index,
                              this.bodyDescription[index].value
                            )
                          }
                        >
                          Add
                        </button>
                      )}

                      {k.type === "object" || k.type === "array" ? (
                        <td>
                          {typeof k.name === "number" && (
                            <button onClick={() => this.handleDelete(index)}>
                              X
                            </button>
                          )}
                        </td>
                      ) : (
                        <td>
                          <input></input>
                          {typeof k.name === "number" && (
                            <button onClick={() => this.handleDelete(index)}>
                              X
                            </button>
                          )}
                        </td>
                      )}
                      {k.type === "object" || k.type === "array" ? (
                        <td></td>
                      ) : (
                        <td>
                          <input></input>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div> */}
          </div>
        )}
      </div>
    );
  }
}

export default PublicBodyContainer;
