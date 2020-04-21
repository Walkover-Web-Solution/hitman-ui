import React, { Component } from "react";

// class NewBodyDescription extends Component {
//   state = { bodyDescription: {} };

//   componentDidMount() {
//     const { value } = this.props.endpoints[this.props.endpoint_id].body;
//     console.log(value);
//     let body = JSON.parse(value);
//     const schema = toJsonSchema(body);

//     console.log("schema", schema);

//     let keys = Object.keys(body);
//     let bodyDescription = {};
//     for (let i = 0; i < keys.length; i++) {
//       console.log(typeof body[keys[i]]);
//       if (typeof body[keys[i]] !== "object") {
//         bodyDescription[keys[i]] = {
//           defaultValue: body[keys[i]],
//           description: "",
//           dataType: typeof body[keys[i]],
//         };
//       } else {
//         if (typeof body[keys[i]] === "object" && Array.isArray(body[keys[i]])) {
//           console.log("hello", body[keys[i]].length);
//           if (body[keys[i]].length !== 0) {
//             bodyDescription[keys[i]] = {
//               defaultValue: [body[keys[i]][0]],
//               description: "",
//               dataType: "Array of " + typeof body[keys[i]][0],
//             };
//           } else {
//             bodyDescription[keys[i]] = {
//               defaultValue: [""],
//               description: "",
//               dataType: "Array of string",
//             };
//           }
//         } else if (typeof body[keys[i]] === "object") {
//           bodyDescription[keys[i]] = {
//             defaultValue: body[keys[i]],
//             description: "",
//             dataType: typeof body[keys[i]],
//           };
//         }
//       }
//     }
//     this.setState({ bodyDescription });
//     console.log("bodyDescription", bodyDescription);
//     // recurseObject(body, "");
//   }

//   //   function recurseObject(obj) {
//   //     for (var key in obj) {
//   //       // works for objects and arrays
//   //       var item = obj[key];
//   //       if (typeof item === "object") recurseObject(item);
//   //       else console.log(item);
//   //     }
//   //   }
//   obectDiv(obj, index, i) {
//     console.log("sedgdrjf", obj);
//     return (
//       <div>
//         {Object.keys(obj.defaultValue).map((key) => (
//           <div key={key}>
//             <label
//               style={{
//                 marginLeft: "5px",
//                 paddingRight: "5px",
//                 width: "20%",
//               }}
//             >
//               {key}
//             </label>
//             <input
//               style={{
//                 marginLeft: "20px",
//                 width: "60%",
//               }}
//               type={typeof obj[key] === "number" ? "number" : "text"}
//               name={
//                 obj.dataType === "object"
//                   ? index + "." + key + ".value"
//                   : index + "." + i + "." + key + ".value"
//               }
//               value={obj[key]}
//               onChange={this.handleChange}
//             ></input>
//           </div>
//         ))}
//       </div>
//     );
//   }

//   handleDelete(valuesArrayIndex, index) {
//     this.valuesArray[valuesArrayIndex].splice(index, 1);
//     let i;
//     let json = {};
//     for (i in this.valuesArray) {
//       json[this.keysArray[i]] = this.valuesArray[i];
//     }
//     json = JSON.stringify(json);
//     this.props.set_body("JSON", json);
//   }

//   handleAdd(valuesArrayIndex) {
//     const data = Object.values(JSON.parse(this.props.endpoint.body.value));

//     if (
//       typeof data[valuesArrayIndex][0] === "string" ||
//       typeof data[valuesArrayIndex][0] === "number"
//     )
//       this.valuesArray[valuesArrayIndex].push(null);
//     else this.valuesArray[valuesArrayIndex].push(data[valuesArrayIndex][0]);
//     let i;
//     let json = {};
//     for (i in this.valuesArray) {
//       json[this.keysArray[i]] = this.valuesArray[i];
//     }
//     console.log(json);
//     json = JSON.stringify(json);
//     this.props.set_body("JSON", json);
//   }

//   handleChange = (e) => {
//     let valuesArray = [...this.valuesArray];
//     const name = e.currentTarget.name.split(".");
//     console.log(name);
//     console.log(this.dataType);
//     if (e.target.type === "number") {
//       if (this.dataType[name[0]] === "Array") {
//         valuesArray[name[0]][name[1]] = parseInt(e.currentTarget.value);
//       } else if (this.dataType[name[0]] === "object") {
//         valuesArray[name[0]][name[1]] = parseInt(e.currentTarget.value);
//       } else if (this.dataType[name[0]] === "Array of Objects") {
//         valuesArray[name[0]][name[1]][name[2]] = parseInt(
//           e.currentTarget.value
//         );
//       } else {
//         valuesArray[name[0]] = parseInt(e.currentTarget.value);
//       }
//     } else {
//       if (this.dataType[name[0]] === "Array") {
//         valuesArray[name[0]][name[1]] = e.currentTarget.value;
//       } else if (this.dataType[name[0]] === "object") {
//         valuesArray[name[0]][name[1]] = e.currentTarget.value;
//       } else if (this.dataType[name[0]] === "Array of Objects") {
//         valuesArray[name[0]][name[1]][name[2]] = e.currentTarget.value;
//       } else {
//         valuesArray[name[0]] = e.currentTarget.value;
//       }
//     }
//     let json = {};
//     let i;
//     for (i in valuesArray) {
//       json[this.keysArray[i]] = valuesArray[i];
//     }
//     console.log(json);
//     json = JSON.stringify(json);
//     this.props.set_body("JSON", json);
//   };

//   log = (type) => console.log.bind(console, type);

//   render() {
//     const { value } = this.props.endpoints[this.props.endpoint_id].body;
//     console.log(value);

//     let body = JSON.parse(value);
//     const schema = toJsonSchema(body);

//     const options = {
//       postProcessFnc: (type, schema, value, defaultFunc) =>
//         (type === 'integer') ? {...schema, required: true} : defaultFunc(type, schema, value),
//     }

//     return (
//       <Form
//         tagName="table"
//         schema={schema}
//         onChange={this.log("changed")}
//         onSubmit={this.log("submitted")}
//         formData={body}
//         onError={this.log("errors")}
//       >
//         {" "}
//         <div>
//           <button className="btn btn-primary" type="submit">
//             Save
//           </button>
//         </div>
//       </Form>
//     );
//   }

//   // function recurseObject(obj, key1) {
//   //   for (var key in obj) {
//   //     // works for objects and arrays
//   //     var item = obj[key];
//   //     if (typeof item === "object") {
//   //       console.log(key1 + "." + key);
//   //       recurseObject(item, key);
//   //     } else console.log(key1 + "." + key);
//   //   }
// }
// export default NewBodyDescription;

class NewBodyDescription extends Component {
  state = { bodyDescription: {} };

  componentDidMount() {
    const { value } = this.props.endpoints[this.props.endpoint_id].body;
    let body = JSON.parse(value);
    let keys = Object.keys(body);
    let bodyDescription = {};
    for (let i = 0; i < keys.length; i++) {
      if (typeof body[keys[i]] !== "object") {
        bodyDescription[keys[i]] = {
          defaultValue: body[keys[i]],
          description: "",
          dataType: typeof body[keys[i]],
        };
      } else {
        if (typeof body[keys[i]] === "object" && Array.isArray(body[keys[i]])) {
          if (body[keys[i]].length !== 0) {
            bodyDescription[keys[i]] = {
              defaultValue: [body[keys[i]][0]],
              description: "",
              dataType: "Array of " + typeof body[keys[i]][0],
            };
          } else {
            bodyDescription[keys[i]] = {
              defaultValue: [""],
              description: "",
              dataType: "Array of string",
            };
          }
        } else if (typeof body[keys[i]] === "object") {
          bodyDescription[keys[i]] = {
            defaultValue: body[keys[i]],
            description: "",
            dataType: typeof body[keys[i]],
          };
        }
      }
    }
    this.setState({ bodyDescription });
    // recurseObject(body, "");
  }

  //   function recurseObject(obj) {
  //     for (var key in obj) {
  //       // works for objects and arrays
  //       var item = obj[key];
  //       if (typeof item === "object") recurseObject(item);
  //       else console.log(item);
  //     }
  //   }
  obectDiv(obj, index, i) {
    return (
      <div>
        {Object.keys(obj.defaultValue).map((key) => (
          <div key={key}>
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
                obj.dataType === "object"
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
    json = JSON.stringify(json);
    this.props.set_body("JSON", json);
  }

  handleChange = (e) => {
    let valuesArray = [...this.valuesArray];
    const name = e.currentTarget.name.split(".");
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
    json = JSON.stringify(json);
    this.props.set_body("JSON", json);
  };

  render() {
    return (
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
                <th className="custom-th">DEFAULT VALUE</th>
                <th className="custom-th">DESCRIPTION</th>
              </tr>
            </thead>
            <tbody style={{ border: "none" }}>
              {Object.keys(this.state.bodyDescription).map((key, index) => (
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
                        {this.state.bodyDescription[key].dataType}
                      </label>
                    </div>
                  </td>
                  <td className="custom-td">
                    {this.state.bodyDescription[key].dataType === "boolean" ? (
                      <select
                        id="custom-select-box"
                        value={this.state.bodyDescription[key].defaultValue}
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
                    ) : this.state.bodyDescription[key].dataType === "Array" ? (
                      <div>
                        {this.state.bodyDescription[key].defaultValue.map(
                          (i, key) => (
                            <div>
                              <input
                                style={{
                                  marginLeft: "50px",
                                  width: "60%",
                                }}
                                type={typeof i === "number" ? "number" : "text"}
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
                          )
                        )}
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
                    ) : this.state.bodyDescription[key].dataType ===
                      "object" ? (
                      this.obectDiv(this.state.bodyDescription[key], index)
                    ) : this.state.bodyDescription[key].dataType ===
                      "Array of Objects" ? (
                      <div>
                        {Object.keys(this.state.bodyDescription[key]).map(
                          (k, i) => (
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
                          )
                        )}
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
                        value={this.state.bodyDescription[key].defaultValue}
                        onChange={this.handleChange}
                        type={
                          this.state.bodyDescription[key].dataType === "number"
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
                      name={index + ".datatype"}
                      type="text"
                      //   value={this.state.bodyDescription[key].defaultValue}
                      //   placeholder="DataType"
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
    );
  }
}

function recurseObject(obj, key1) {
  for (var key in obj) {
    // works for objects and arrays
    var item = obj[key];
    if (typeof item === "object") {
      recurseObject(item, key);
    }
  }
}
export default NewBodyDescription;
